#!/usr/bin/env node
/**
 * Slugs and names for the country, the cantons and the cities.
 *
 *   node scripts/localise-places.mjs --dry-run
 *   node scripts/localise-places.mjs
 *
 * Idempotent. Run it again after adding a city, or after correcting a name.
 *
 * Two different things live here and they follow opposite rules.
 *
 * NAMES are per locale. Zürich is Zurigo in Italian, Basel is Bâle in French,
 * and the page says so. Only the handful with a real exonym are listed below —
 * inventing an Italian name for Winterthur would be worse than useless.
 *
 * SLUGS are not. A city, a canton and a market each carry ONE slug, the same in
 * all four languages, because a place name is a proper noun and an address that
 * moves when you fix a translation is an address that breaks. The country
 * segment is the single exception: schweiz / suisse / svizzera / switzerland is
 * a word rather than a name, it belongs with markt / marche / mercato, and it
 * is the segment "flohmarkt schweiz" is actually searched with.
 *
 * The slug is transliterated in the language the place itself speaks, which is
 * not the same as stripping accents: Bülach and Dübendorf are German towns and
 * write themselves buelach.ch and duebendorf.ch. Genève and Fribourg are French
 * towns and take the French form, not the German exonyms Genf and Freiburg that
 * the import wrote. Zürich is the single exception in both directions — see
 * SLUG_FROM below.
 *
 * Nothing here is translated by a machine. A place name is a fact with one
 * correct answer per language, so they are written out.
 */

import { withClient, DB_URL } from './db.mjs';
import { slugify } from './slugify.mjs';

const DRY_RUN = process.argv.includes('--dry-run');

/** The locales Switzerland is published in. */
const LOCALES = ['de', 'fr', 'it', 'en'];

/**
 * The country segment, per locale — the one part of the path that is still
 * translated. A fixed hand-written set of about fifty entries that never grows
 * with the data, which is why it does not carry the cost that per-locale city
 * slugs did.
 */
const COUNTRY = {
  de: 'Schweiz',
  fr: 'Suisse',
  it: 'Svizzera',
  en: 'Switzerland',
};

/** Canton names, per locale. Keyed by the German name in the database. */
const CANTONS = {
  'Aargau': { fr: 'Argovie', it: 'Argovia', en: 'Aargau' },
  'Basel-Landschaft': { fr: 'Bâle-Campagne', it: 'Basilea Campagna', en: 'Basel-Landschaft' },
  'Basel-Stadt': { fr: 'Bâle-Ville', it: 'Basilea Città', en: 'Basel-Stadt' },
  'Bern': { fr: 'Berne', it: 'Berna', en: 'Bern' },
  'Freiburg': { fr: 'Fribourg', it: 'Friburgo', en: 'Fribourg' },
  'Genf': { fr: 'Genève', it: 'Ginevra', en: 'Geneva' },
  'Graubünden': { fr: 'Grisons', it: 'Grigioni', en: 'Grisons' },
  'Luzern': { fr: 'Lucerne', it: 'Lucerna', en: 'Lucerne' },
  'Schaffhausen': { fr: 'Schaffhouse', it: 'Sciaffusa', en: 'Schaffhausen' },
  'Solothurn': { fr: 'Soleure', it: 'Soletta', en: 'Solothurn' },
  'St. Gallen': { fr: 'Saint-Gall', it: 'San Gallo', en: 'St. Gallen' },
  'Tessin': { fr: 'Tessin', it: 'Ticino', en: 'Ticino' },
  'Waadt': { fr: 'Vaud', it: 'Vaud', en: 'Vaud' },
  'Zürich': { fr: 'Zurich', it: 'Zurigo', en: 'Zurich' },
};

/** City names, per locale. Everything not listed keeps one name in all four. */
const CITIES = {
  'Basel': { fr: 'Bâle', it: 'Basilea', en: 'Basel' },
  'Bern': { fr: 'Berne', it: 'Berna', en: 'Bern' },
  'Chur': { fr: 'Coire', it: 'Coira', en: 'Chur' },
  'Freiburg': { fr: 'Fribourg', it: 'Friburgo', en: 'Fribourg' },
  'Genf': { fr: 'Genève', it: 'Ginevra', en: 'Geneva' },
  'Luzern': { fr: 'Lucerne', it: 'Lucerna', en: 'Lucerne' },
  'Schaffhausen': { fr: 'Schaffhouse', it: 'Sciaffusa', en: 'Schaffhausen' },
  'St. Gallen': { fr: 'Saint-Gall', it: 'San Gallo', en: 'St. Gallen' },
  'Thun': { fr: 'Thoune', it: 'Thun', en: 'Thun' },
  'Zürich': { fr: 'Zurich', it: 'Zurigo', en: 'Zurich' },
};

/**
 * The name the single slug is built from, where the German name in the database
 * is the wrong one to build it from. Two kinds of entry, for two reasons.
 *
 * ENDONYMS. Genève, Fribourg, Ticino and Vaud are French- and Italian-speaking
 * places that German sources name differently, and the import wrote the German
 * exonym. The place's own name wins. Bern, Graubünden and Basel-Landschaft are
 * officially multilingual too, but their majority language is German, so the
 * German name is already the endonym. The tiebreaker, written down so it does
 * not get re-decided per town: the name the commune itself registers, and where
 * that is itself dual (Biel/Bienne), the majority language.
 *
 * INTERNATIONAL FORMS. Zürich is `zurich`, not `zuerich`. It is the one Swiss
 * place with a settled accent-free form that the whole world already uses —
 * Booking, Airbnb, Tripadvisor and Google Maps all spell it that way — and this
 * slug is now shared by the French, Italian and English pages as well. That is
 * not true of Bülach or Dübendorf, whose own town councils write buelach.ch and
 * duebendorf.ch; they keep the German transliteration. An exception list of one
 * is the right size for "famous enough to have an international spelling".
 */
const SLUG_FROM = {
  region: {
    'Genf': 'Genève', 'Freiburg': 'Fribourg', 'Tessin': 'Ticino', 'Waadt': 'Vaud',
    'Zürich': 'Zurich',
  },
  city: { 'Genf': 'Genève', 'Freiburg': 'Fribourg', 'Zürich': 'Zurich' },
};

async function main() {
  await withClient(DB_URL, async (client) => {
    const rows = async (sql, params = []) => (await client.query(sql, params)).rows;

    const country = (await rows(`select id from public.countries where iso2 = 'CH'`))[0];
    const regions = await rows(`
      select r.id, t.value as name
        from public.regions r
        join public.texts t on t.entity_type = 'region' and t.entity_id = r.id
                           and t.locale = 'de' and t.field = 'name'`);
    const cities = await rows(`
      select c.id, t.value as name
        from public.cities c
        join public.texts t on t.entity_type = 'city' and t.entity_id = c.id
                           and t.locale = 'de' and t.field = 'name'`);
    const markets = await rows(`
      select entity_id as id, slug from public.slugs
       where entity_type = 'market' and locale = 'de' and is_current`);

    /** What every row should hold: its slug, and its name where it has one. */
    const planned = [];
    const add = (type, id, locale, name, slug) => planned.push({ type, id, locale, name, slug });

    for (const locale of LOCALES) {
      // The country: a translated word, so a different slug in each locale.
      add('country', country.id, locale, COUNTRY[locale], slugify(COUNTRY[locale]));

      // Everything else: one slug, built from the endonym, repeated in every
      // locale. The row-per-locale shape is kept so that the query layer and
      // the country case stay a single code path.
      for (const region of regions) {
        const slug = slugify(SLUG_FROM.region[region.name] ?? region.name);
        add('region', region.id, locale, CANTONS[region.name]?.[locale] ?? region.name, slug);
      }

      for (const city of cities) {
        const slug = slugify(SLUG_FROM.city[city.name] ?? city.name);
        add('city', city.id, locale, CITIES[city.name]?.[locale] ?? city.name, slug);
      }

      // A market's slug came from v1 and was already one across all four. Its
      // displayed name still comes from `texts`, per locale.
      for (const market of markets) add('market', market.id, locale, null, market.slug);
    }

    /* ---------------------------------------------------------------------
     * Preflight. Two different collisions, both of which corrupt URLs.
     * ------------------------------------------------------------------- */

    // Two entities of the same type wanting the same slug in the same locale.
    const seen = new Map();
    for (const p of planned) {
      const key = `${p.type}/${p.locale}/${p.slug}`;
      if (seen.has(key) && seen.get(key) !== p.id) {
        throw new Error(`slug collision: ${key} wanted by two entities`);
      }
      seen.set(key, p.id);
    }

    // A slug already held — live or retired — by a DIFFERENT entity. The unique
    // constraint would reject the insert anyway, but it would name a constraint
    // rather than the two towns, and this is the one failure needing a human.
    const held = await rows(`select entity_type, entity_id, locale, slug, is_current from public.slugs`);
    for (const p of planned) {
      const clash = held.find(
        (h) => h.entity_type === p.type && h.locale === p.locale && h.slug === p.slug && h.entity_id !== p.id
      );
      if (clash) {
        throw new Error(
          `slug "${p.slug}" (${p.type}, ${p.locale}) is already held by another entity. ` +
          `Retired slugs stay reserved forever, so their redirects cannot start pointing ` +
          `at the wrong place. Pick a different slug.`
        );
      }
    }
    console.log('  no slug collisions, live or retired');

    /* ------------------------------------------------------------------- */

    const retiring = [];
    for (const p of planned) {
      const current = held.find(
        (h) => h.entity_type === p.type && h.entity_id === p.id && h.locale === p.locale && h.is_current
      );
      if (current && current.slug !== p.slug) retiring.push({ ...p, was: current.slug });
    }

    const entities = new Set(retiring.map((r) => `${r.type}/${r.id}`)).size;
    console.log(`  ${planned.length} slug rows planned`);
    console.log(`  ${retiring.length} slugs change across ${entities} entities — each becomes a 301`);

    if (DRY_RUN) {
      for (const r of retiring.slice(0, 24)) {
        console.log(`    ${r.locale}  ${r.type.padEnd(7)}  ${r.was}  ->  ${r.slug}`);
      }
      if (retiring.length > 24) console.log(`    ... and ${retiring.length - 24} more`);
      console.log('\n  --dry-run: nothing written.\n');
      return;
    }

    await client.query('begin');
    try {
      for (const p of planned) {
        // Retire first. slugs_one_current permits only one live row per locale,
        // so the insert below fails until the old one steps aside — losing an
        // old slug is impossible rather than merely discouraged.
        await client.query(
          `update public.slugs set is_current = false, updated_at = now()
            where entity_type = $1 and entity_id = $2 and locale = $3
              and is_current and slug <> $4`,
          [p.type, p.id, p.locale, p.slug]
        );
        await client.query(
          `insert into public.slugs (entity_type, entity_id, locale, slug, is_current)
           values ($1, $2, $3, $4, true)
           on conflict (entity_type, entity_id, locale, slug)
             do update set is_current = true, updated_at = now()`,
          [p.type, p.id, p.locale, p.slug]
        );
        if (p.name) {
          await client.query(
            `insert into public.texts (entity_type, entity_id, locale, field, value)
             values ($1, $2, $3, 'name', $4)
             on conflict (entity_type, entity_id, locale, field) do update set value = excluded.value`,
            [p.type, p.id, p.locale, p.name]
          );
        }
      }
      await client.query('commit');
      console.log('  written.\n');
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
  });
}

await main();
