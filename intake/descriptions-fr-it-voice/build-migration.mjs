// French and Italian market descriptions edited for voice on 2026-10-10 (out-{fr,it}-{1,2}.json,
// from in-*.json; the editors also dropped any sentence addressed to sellers), plus the English and
// German sentences that told sellers what a pitch costs or how to book one (seller-cuts.json).
//   node intake/descriptions-fr-it-voice/build-migration.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { query } from '../../scripts/db.mjs';

const dir = 'intake/descriptions-fr-it-voice';
const rows = new Map(); // slug|locale -> text
for (const loc of ['fr', 'it']) for (const i of [1, 2]) {
  for (const o of JSON.parse(readFileSync(`${dir}/out-${loc}-${i}.json`, 'utf8'))) rows.set(`${o.slug}|${loc}`, o.text);
}
const voice = rows.size;

for (const [slug, locale, cut, put] of JSON.parse(readFileSync(`${dir}/seller-cuts.json`, 'utf8'))) {
  const [r] = await query(`select t.value from texts t join markets m on m.id = t.entity_id where t.entity_type = 'market' and t.field = 'description' and m.slug = $1 and t.locale = $2`, [slug, locale]);
  if (!r?.value.includes(cut)) throw new Error(`not found in ${slug}|${locale}: ${cut}`);
  rows.set(`${slug}|${locale}`, r.value.replace(cut, put));
}

const q = (s) => { if (s.includes('$t$')) throw new Error('dollar tag in text'); return `$t$${s}$t$`; };
const values = [...rows].map(([key, text]) => { const [slug, locale] = key.split('|'); return `  (${q(slug)}, '${locale}', ${q(text)})`; });

const sql = `-- The French and Italian market descriptions, edited for voice (Delfim, 2026-10-10): the same
-- pass as the German one (20261010150000) — calques out, regional words that read oddly across the
-- border out, a market's name not forced masculine, same facts (intake/descriptions-fr-it-voice/).
-- And every language's sentences addressed to sellers — what a pitch costs, how to book or register
-- one — out: descriptions are for visitors (Delfim, 2026-10-08). Who sells stays; it helps a visitor.

begin;

create temporary table new_text (slug text, locale text, value text) on commit drop;
insert into new_text values
${values.join(',\n')};

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t set value = d.value, updated_at = now()
    from public.markets m, new_text d
   where t.entity_type = 'market' and t.entity_id = m.id and t.field = 'description'
     and m.slug = d.slug and t.locale = d.locale;
  get diagnostics n = row_count;
  if n <> (select count(*) from new_text) then
    raise exception 'updated % descriptions, expected %', n, (select count(*) from new_text);
  end if;
end $$;

commit;
`;
writeFileSync('supabase/migrations/20261010160000_french_italian_descriptions_voice.sql', sql);
console.log(`${voice} French/Italian texts, ${rows.size - voice} seller cuts in English/German → the migration`);
process.exit(0);
