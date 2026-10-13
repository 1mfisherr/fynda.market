// Checks the town paragraphs (out-*.json against input-*.json) and writes the migration.
//   node intake/town-intros/check.mjs check              report only
//   node intake/town-intros/check.mjs write <file.sql>   write the migration
//
// A town of four or more markets gets a paragraph written for it alone (PAGES.md §City 7).
// What keeps it from being the templated text the spam update targets: no two towns may
// share a 4-word run in the same language beyond MAX_SHARED, and every market it names
// must be one of the town's own.
import fs from 'node:fs';

const MAX_SHARED = 2;
const dir = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const read = (re) => fs.readdirSync(dir).filter((f) => re.test(f)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const inputs = [...new Map(read(/^input-\d+\.json$/).flatMap((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'))).map((i) => [i.city_id, i])).values()];
const out = new Map();
for (const f of read(/^out-\d+\.json$/)) for (const o of JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'))) out.set(o.city_id, o);

const words = (t) => (t ?? '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\d\s]/gu, ' ').split(/\s+/).filter(Boolean);
const grams = (t, n = 4) => { const w = words(t); const g = new Set(); for (let i = 0; i + n <= w.length; i++) g.add(w.slice(i, i + n).join(' ')); return g; };
const WEEKDAY = /\b(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\b/i;
const TIMEISH = /\b\d{1,2}[:.]\d{2}\b|\b\d{1,2}\s?(uhr|h)\b|\b\d{1,2}\s?(am|pm)\b|\b(chf|fr\.|eur|€)\s?\d|\d\s?(chf|franken|francs|franchi|euro)\b|(?<!(seit|since|depuis|dal|dès|from|ab)\s)\b20\d\d\b/i;
const BOAST = /\b(grösste|größte|beste|schönste|einzigartig|beliebt|legendär|plus grand|meilleur|unique en|populaire|più grande|migliore|unico|famoso|biggest|largest|best|finest|unique|popular|famous|vibrant|bustling|treasure trove|paradise)\b/i;
const SELLER = /\b(standgebühr|anmeldung|anmelden|inscription|s'inscrire|iscrizion|register|registration|pitch fee|stall fee|book a stall)/i;

const problems = [];
const ready = [];
for (const i of inputs) {
  const o = out.get(i.city_id);
  if (!o) { problems.push(`${i.names.de}: no text yet`); continue; }
  const issues = [];
  const names = i.markets.map((m) => m.name);
  for (const l of i.locales_to_write) {
    const t = o.text?.[l]?.trim() ?? '';
    if (t.length < 250 || t.length > 1000) { issues.push(`${l}: ${t.length} characters (250 to 1000)`); continue; }
    if (l === 'de' && i.country === 'CH' && /ß/.test(t)) issues.push('ß in Swiss German');
    if (WEEKDAY.test(t)) issues.push(`${l}: weekday "${t.match(WEEKDAY)[0]}"`);
    if (TIMEISH.test(t)) issues.push(`${l}: time/price/year "${t.match(TIMEISH)[0]}"`);
    if (BOAST.test(t)) issues.push(`${l}: boast "${t.match(BOAST)[0]}"`);
    if (SELLER.test(t)) issues.push(`${l}: seller matter "${t.match(SELLER)[0]}"`);
  }
  for (const l of Object.keys(o.text ?? {})) if (!i.locales_to_write.includes(l)) issues.push(`wrote ${l}, which this town has no page in`);
  for (const n of o.markets_named ?? []) if (!names.includes(n)) issues.push(`names "${n}", which is not one of the town's markets`);
  if (issues.length) problems.push(`${i.names.de}: ${issues.join('; ')}`);
  else ready.push({ city_id: i.city_id, name: i.names.de, text: o.text, locales: i.locales_to_write });
}
// No two towns share more than MAX_SHARED 4-word runs in one language.
for (const a of ready) for (const b of ready) {
  if (a.city_id >= b.city_id) continue;
  for (const l of a.locales.filter((x) => b.locales.includes(x))) {
    const A = grams(a.text[l]), B = grams(b.text[l]);
    const shared = [...A].filter((g) => B.has(g));
    if (shared.length > MAX_SHARED) problems.push(`${a.name} and ${b.name} share ${shared.length} 4-word runs in ${l}: ${shared.slice(0, 4).join(' | ')}`);
  }
}
console.log(`${inputs.length} towns · ${out.size} answered · ${ready.length} pass their own checks`);
for (const p of problems) console.log('  -', p);

if (process.argv[2] === 'write') {
  if (problems.length) throw new Error('fix the problems first');
  const file = process.argv[3];
  const q = (s) => `$t$${s.replace(/\$t\$/g, '')}$t$`;
  const values = ready.flatMap((r) => r.locales.map((l) => `  ('${r.city_id}'::uuid, '${l}', ${q(r.text[l].trim())})`));
  fs.writeFileSync(file, `-- The paragraph of each town with four or more markets (Delfim, 2026-10-13, design/town-intro-v1.html):
-- ${ready.map((r) => r.name).join(', ')}.
-- Written for each town alone from its own markets' verified facts (intake/town-intros/), checked
-- that no two towns share more than ${MAX_SHARED} 4-word runs in a language. PAGES.md §City 7.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  insert into public.texts (entity_type, entity_id, locale, field, value)
  select 'city', v.id, v.locale, 'description', v.value
    from (values
${values.join(',\n')}
    ) as v(id, locale, value)
  on conflict (entity_type, entity_id, locale, field) do update set value = excluded.value, updated_at = now();
  get diagnostics n = row_count;
  if n <> ${values.length} then raise exception 'expected ${values.length} town texts, wrote %', n; end if;
end $$;

commit;
`);
  console.log(`wrote ${file}: ${values.length} texts for ${ready.length} towns`);
}
process.exit(0);
