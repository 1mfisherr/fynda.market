// Checks the helpers' texts (intake/descriptions-v1-winter/out-*.json) and writes the migration.
//   node <this> check            report only
//   node <this> write <file.sql>  write the migration (texts + publish markets with photo and text)
import fs from 'node:fs';
import { query, V1_URL } from '../../scripts/db.mjs';

const dir = 'C:/Users/delfi/Documents/fynda/intake/descriptions-v1-winter';
// The latest file wins: a revision (out-4.json) replaces the first draft of the same market.
const out = fs.readdirSync(dir).filter((f) => /^out-\d+\.json$/.test(f)).sort((a, b) => parseInt(b.slice(4)) - parseInt(a.slice(4))).flatMap((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')));
const inputs = fs.readdirSync(dir).filter((f) => /^input-\d+\.json$/.test(f)).flatMap((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')));
const v1 = new Map((await query('select slug, description, description_en, description_fr, description_it from markets where slug = any($1)', [inputs.map((i) => i.slug)], V1_URL)).map((r) => [r.slug, r]));
const ours = new Map((await query(`select slug, status, image_url from public.markets where slug = any($1)`, [inputs.map((i) => i.slug)])).map((r) => [r.slug, r]));

const words = (t) => (t ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\d\s]/gu, ' ').split(/\s+/).filter(Boolean);
const grams = (t, n = 4) => { const w = words(t); const g = new Set(); for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(' ')); return g; };
/** Share of our 4-word runs that also appear in v1's text: copied phrasing shows up here. */
const overlap = (a, b) => { const A = grams(a), B = grams(b); if (!A.size) return 0; let n = 0; for (const g of A) if (B.has(g)) n++; return n / A.size; };
const WEEKDAY = /\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;
const TIMEISH = /\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s?(uhr|h)\b|\b\d{1,2}\s?(am|pm)\b|\bchf\s?\d|\bfr\.\s?\d|(?<!(seit|since|depuis|dal|dès|from|ab)\s)\b20\d\d\b|\b\d{1,2}\.\s?(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)/i;

const problems = [];
const ready = [];
for (const i of inputs) {
  const o = out.find((x) => x.slug === i.slug);
  if (!o) { problems.push(`${i.slug}: no text yet`); continue; }
  const d = o.description ?? {};
  const issues = [];
  for (const l of ['de', 'en', 'fr', 'it']) if (!d[l] || d[l].trim().length < 20) issues.push(`missing ${l}`);
  for (const l of ['en', 'fr', 'it']) if (!o.rhythm?.[l]) issues.push(`missing rhythm ${l}`);
  if (/ß/.test(d.de ?? '')) issues.push('ß in de');
  for (const l of ['de', 'en', 'fr', 'it']) if (WEEKDAY.test(d[l] ?? '')) issues.push(`weekday in ${l}`);
  for (const l of ['de', 'en', 'fr', 'it']) if (TIMEISH.test(d[l] ?? '')) issues.push(`date/time/price in ${l}: "${(d[l].match(TIMEISH) ?? [''])[0]}"`);
  const v = v1.get(i.slug) ?? {};
  const sim = Math.max(overlap(d.de, v.description), overlap(d.en, v.description_en), overlap(d.fr, v.description_fr), overlap(d.it, v.description_it));
  if (sim > 0.25) issues.push(`resembles v1 (${Math.round(sim * 100)}% of 4-word runs)`);
  const photo = ours.get(i.slug)?.image_url;
  if (issues.length) problems.push(`${i.slug}: ${issues.join('; ')}`);
  else ready.push({ ...o, photo: Boolean(photo) });
  if (o.conflicts?.length) problems.push(`${i.slug} — CONFLICT: ${o.conflicts.join(' | ')}`);
}
console.log(`${inputs.length} markets · ${out.length} texts · ${ready.length} pass · ${ready.filter((r) => r.photo).length} pass and have a photo`);
for (const p of problems) console.log('  -', p);

if (process.argv[2] === 'write') {
  const q = (s) => `$t$${s.replace(/\$t\$/g, '')}$t$`;
  const rows = [];
  for (const r of ready) {
    for (const l of ['de', 'en', 'fr', 'it']) rows.push(`  (${q(r.slug)}, '${l}', 'description', ${q(r.description[l].trim())})`);
    for (const l of ['en', 'fr', 'it']) rows.push(`  (${q(r.slug)}, '${l}', 'recurrence_text', ${q(r.rhythm[l].trim())})`);
  }
  const publish = ready.filter((r) => r.photo).map((r) => `'${r.slug}'`);
  const sql = `-- The 40 Swiss markets brought hidden from v1 on 2026-10-09: their texts in our own words,
-- written from the organisers' pages in four locales (intake/descriptions-v1-winter/out-*.json,
-- sources and quotes there), and their rhythm lines in en/fr/it. Then every one with a photo and
-- a text is published. v1's descriptions are replaced, not kept: the same text on two live sites
-- is what the 8 October rewrite removed everywhere else.

begin;

create temporary table new_text (slug text, locale text, field text, value text) on commit drop;
insert into new_text values
${rows.join(',\n')};

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t set value = d.value, updated_at = now()
    from public.markets m, new_text d
   where t.entity_type = 'market' and t.entity_id = m.id and t.field = d.field and m.slug = d.slug and t.locale = d.locale;
  insert into public.texts (entity_type, entity_id, locale, field, value)
  select 'market', m.id, d.locale, d.field, d.value from new_text d join public.markets m on m.slug = d.slug
   where not exists (select 1 from public.texts t where t.entity_type = 'market' and t.entity_id = m.id and t.field = d.field and t.locale = d.locale);
  update public.markets set status = 'active', updated_at = now()
   where status = 'unverified' and image_url is not null and slug in (${publish.join(', ') || "''"});
  get diagnostics n = row_count;
  raise notice 'published %', n;
end $$;

commit;
`;
  fs.writeFileSync(process.argv[3], sql);
  console.log(`migration written: ${rows.length} texts, ${publish.length} to publish → ${process.argv[3]}`);
}
process.exit(0);
