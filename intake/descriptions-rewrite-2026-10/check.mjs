// Checks the 2026-10 rewrite (out-*.json against input-*.json) and writes the migration.
//   node intake/descriptions-rewrite-2026-10/check.mjs check              report only
//   node intake/descriptions-rewrite-2026-10/check.mjs write <file.sql>   write the migration
//
// Why: 104 Swiss markets still carried the old site's description, or a translation of it,
// in at least one language (audit 2026-10-13: 331 texts at 30% or more of their 4-word runs).
// The same paragraph on two live sites is shown once, and Google keeps the older site's.
// A text passes only when it shares at most MAX_OVERLAP of its 4-word runs with the old text
// in any language — checked against every language, since a translation can converge on the
// old one's phrasing.
import fs from 'node:fs';
import { query, withClient, V1_URL } from '../../scripts/db.mjs';

const MAX_OVERLAP = 0.15;
const dir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (re) => fs.readdirSync(dir).filter((f) => re.test(f)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
// A later input file re-briefs a market (input-5.json asks for all four languages where
// input-1 asked for translations only); the latest brief is the one a text is checked against.
const inputs = [...new Map(read(/^input-\d+\.json$/).flatMap((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'))).map((i) => [i.slug, i])).values()];
// The latest file wins: a revision (out-5.json) replaces a first draft of the same market.
const out = new Map();
for (const f of read(/^out-\d+\.json$/)) for (const o of JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'))) out.set(o.slug, o);

const v1 = new Map(await withClient(V1_URL, async (c) => (await c.query(
  `select slug, description, description_fr, description_it, description_en from public.markets where slug = any($1)`, [inputs.map((i) => i.slug)])).rows
  .map((r) => [r.slug, [r.description, r.description_fr, r.description_it, r.description_en].filter(Boolean)])));

const words = (t) => (t ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\d\s]/gu, ' ').split(/\s+/).filter(Boolean);
const grams = (t, n = 4) => { const w = words(t); const g = new Set(); for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(' ')); return g; };
/** Share of our 4-word runs that also appear in the old text. */
const overlap = (a, b) => { const A = grams(a), B = grams(b); if (!A.size) return 0; let n = 0; for (const g of A) if (B.has(g)) n++; return n / A.size; };
const WEEKDAY = /\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b/i;
const TIMEISH = /\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s?(uhr|h)\b|\b\d{1,2}\s?(am|pm)\b|\b(chf|fr\.|eur|€)\s?\d|\d\s?(chf|franken|francs|franchi|euro)\b|(?<!(seit|since|depuis|dal|dès|from|ab)\s)\b20\d\d\b/i;
const SELLER = /\b(standgebühr|standplatz buchen|anmeldung|anmelden|inscription|s'inscrire|iscrizion|iscriver|register|registration|pitch fee|stall fee|book a stall|reserv)/i;
const BOAST = /\b(grösste|größte|beste|schönste|einzigartig|plus grand|meilleur|unique en|più grande|migliore|unico|biggest|largest|best|finest|unique)\b/i;

const problems = [];
const ready = [];
for (const i of inputs) {
  const o = out.get(i.slug);
  if (!o) { problems.push(`${i.slug}: no text yet`); continue; }
  const d = o.description ?? {};
  const issues = [];
  for (const l of i.locales_to_write) {
    const t = d[l]?.trim() ?? '';
    if (t.length < 120) { issues.push(`${l} missing or under 120 characters`); continue; }
    if (l === 'de' && /ß/.test(t)) issues.push('ß in de (Swiss spelling is ss)');
    if (WEEKDAY.test(t)) issues.push(`weekday in ${l}: "${t.match(WEEKDAY)[0]}"`);
    if (TIMEISH.test(t)) issues.push(`time/price/year in ${l}: "${t.match(TIMEISH)[0]}"`);
    if (SELLER.test(t)) issues.push(`seller matter in ${l}: "${t.match(SELLER)[0]}"`);
    if (BOAST.test(t)) issues.push(`superlative in ${l}: "${t.match(BOAST)[0]}"`);
    const worst = Math.max(0, ...(v1.get(i.slug) ?? []).map((old) => overlap(t, old)));
    if (worst > MAX_OVERLAP) issues.push(`${l} shares ${Math.round(worst * 100)}% of its 4-word runs with the old text`);
  }
  for (const l of Object.keys(d)) if (!i.locales_to_write.includes(l)) issues.push(`wrote ${l}, which was to be kept`);
  if (issues.length) problems.push(`${i.slug}: ${issues.join('; ')}`);
  else ready.push({ slug: i.slug, locales: i.locales_to_write, description: d });
  if (o.conflicts?.length) problems.push(`${i.slug} — CONFLICT (pass or not, read it): ${o.conflicts.join(' | ')}`);
}
console.log(`${inputs.length} markets · ${out.size} answered · ${ready.length} pass`);
for (const p of problems) console.log('  -', p);

if (process.argv[2] === 'write') {
  const file = process.argv[3];
  if (!file) throw new Error('usage: check.mjs write <file.sql>');
  const q = (s) => `$t$${s.replace(/\$t\$/g, '')}$t$`;
  const values = ready.flatMap((r) => r.locales.map((l) => `  (${q(r.slug)}, '${l}', ${q(r.description[l].trim())})`));
  const sql = `-- ${ready.length} Swiss markets whose description still matched the old site's in at least one
-- language (audit 2026-10-13: 331 texts at 30% or more of their 4-word runs). Rebuilt from the facts
-- and the organisers' pages, in our words (intake/descriptions-rewrite-2026-10/out-*.json, with the
-- sources each text rests on); every text checked to share at most ${Math.round(MAX_OVERLAP * 100)}% of its 4-word runs with
-- the old text in any language. Where our German was already our own, only the translations changed.

begin;

create temporary table new_text (slug text, locale text, value text) on commit drop;
insert into new_text (slug, locale, value) values
${values.join(',\n')};

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t set value = nt.value, updated_at = now()
    from new_text nt join public.markets m on m.slug = nt.slug
   where t.entity_type = 'market' and t.entity_id = m.id and t.locale = nt.locale and t.field = 'description';
  get diagnostics n = row_count;
  if n <> ${values.length} then raise exception 'expected ${values.length} descriptions to change, changed %', n; end if;
end $$;

commit;
`;
  fs.writeFileSync(file, sql);
  console.log(`wrote ${file}: ${values.length} texts on ${ready.length} markets`);
}
process.exit(0);
