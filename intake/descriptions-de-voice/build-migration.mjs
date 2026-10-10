// The German descriptions, edited for voice on 2026-10-10 (out-1..3.json, from in-1..3.json),
// into one migration. Plus: four markets whose texts told sellers what a pitch costs — the rule
// is visitors only (PLAN.md, Delfim 2026-10-08) — lose that sentence in every language.
//   node intake/descriptions-de-voice/build-migration.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { query } from '../../scripts/db.mjs';

const dir = 'intake/descriptions-de-voice';
const rows = new Map(); // slug|locale -> text
for (const i of [1, 2, 3]) for (const o of JSON.parse(readFileSync(`${dir}/out-${i}.json`, 'utf8'))) rows.set(`${o.slug}|de`, o.de);

/* The seller sentences, per language: [slug, locale, exact text to cut, what replaces it]. */
const CUT = [
  ['flohmarkt-alte-holzbruecke-olten', 'en', ' Sellers just turn up with a table and pay CHF 8 per metre on the spot – no registration.', ''],
  ['flohmarkt-alte-holzbruecke-olten', 'de', ' Wer verkaufen will, kommt einfach mit einem Tisch und zahlt 8 Franken pro Meter vor Ort – ohne Anmeldung.', ''],
  ['flohmarkt-alte-holzbruecke-olten', 'fr', " Pour vendre, on vient avec sa table et on paie 8 francs le mètre sur place – sans inscription.", ''],
  ['flohmarkt-alte-holzbruecke-olten', 'it', ' Chi vuole vendere arriva con il tavolo e paga 8 franchi al metro sul posto – senza iscrizione.', ''],
  ['flohmarkt-dorfplatz-horgen', 'en', 'Art, secondhand, toys, clothes – and anyone can sell: a small outdoor spot costs CHF 5 with no registration, children free.', 'Art, secondhand, toys and clothes.'],
  ['flohmarkt-dorfplatz-horgen', 'de', 'Kunst, Secondhand, Spielzeug, Kleidung – und verkaufen kann jeder: Ein kleiner Platz im Freien kostet 5 Franken ohne Anmeldung, Kinder gratis.', 'Kunst, Secondhand, Spielzeug und Kleidung.'],
  ['flohmarkt-dorfplatz-horgen', 'fr', 'Art, seconde main, jouets, habits – et chacun peut vendre : une petite place en plein air coûte 5 francs sans inscription, gratuit pour les enfants.', 'Art, seconde main, jouets et habits.'],
  ['flohmarkt-dorfplatz-horgen', 'it', "Arte, seconda mano, giocattoli, vestiti – e chiunque può vendere: un piccolo posto all'aperto costa 5 franchi senza iscrizione, bambini gratis.", 'Arte, seconda mano, giocattoli e vestiti.'],
  ['herbst-flohmarkt-richterswil', 'en', ' Anyone who registers with the municipality may sell – residents have priority – on three by three metre plots for CHF 20.', ''],
  ['herbst-flohmarkt-richterswil', 'de', ' Verkaufen darf, wer sich bei der Gemeinde anmeldet – Einheimische haben Vorrang –, auf Plätzen von drei mal drei Metern für 20 Franken.', ''],
  ['herbst-flohmarkt-richterswil', 'fr', " Peut vendre qui s'inscrit auprès de la commune – les habitants ont la priorité –, sur des emplacements de 3 m sur 3 à 20 francs.", ''],
  ['herbst-flohmarkt-richterswil', 'it', ' Può vendere chi si iscrive presso il comune – i residenti hanno la precedenza – su piazzole di 3 metri per 3 a 20 franchi.', ''],
  ['floh-raritaetenmarkt-europaplatz-bern', 'en', ' Stall spaces start at CHF 20.', ''],
  ['floh-raritaetenmarkt-europaplatz-bern', 'fr', ' Emplacements dès CHF 20.–.', ''],
  ['floh-raritaetenmarkt-europaplatz-bern', 'it', ' Posti espositivi a partire da CHF 20.', ''],
];
for (const [slug, locale, cut, put] of CUT) {
  const key = `${slug}|${locale}`;
  let text = rows.get(key);
  if (text === undefined) {
    const [r] = await query(`select t.value from texts t join markets m on m.id = t.entity_id where t.entity_type = 'market' and t.field = 'description' and m.slug = $1 and t.locale = $2`, [slug, locale]);
    text = r?.value;
  }
  if (!text?.includes(cut)) throw new Error(`not found in ${key}: ${cut}`);
  rows.set(key, text.replace(cut, put));
}

const q = (s) => { if (s.includes('$t$')) throw new Error('dollar tag in text'); return `$t$${s}$t$`; };
const values = [...rows].map(([key, text]) => { const [slug, locale] = key.split('|'); return `  (${q(slug)}, '${locale}', ${q(text)})`; });

const sql = `-- The German market descriptions, edited for voice (Delfim, 2026-10-10): 213 of 339 read like
-- English translated word for word — calques, Swiss-only words ("parkieren", "Estrich", "Kleider"),
-- broken fragments — and a few had drifted from the English, which is the reference. Same facts,
-- natural German, "ss" (intake/descriptions-de-voice/: in-*.json the old, out-*.json the new).
-- Four markets also lose the sentence that told sellers what a pitch costs, in every language:
-- descriptions are for visitors (Delfim, 2026-10-08) — Olten, Horgen, Richterswil, Bern Europaplatz.

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
writeFileSync('supabase/migrations/20261010150000_german_descriptions_voice.sql', sql);
console.log(rows.size, 'texts →', 'supabase/migrations/20261010150000_german_descriptions_voice.sql');
process.exit(0);
