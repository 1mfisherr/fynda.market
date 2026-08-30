#!/usr/bin/env node
/**
 * Names and slugs for the country, the cantons and the cities, in every locale
 * we publish. Idempotent: run it again after adding a city.
 *
 *   node scripts/localise-places.mjs --dry-run
 *   node scripts/localise-places.mjs
 *
 * Switzerland is served in de, fr, it and en. Every other country will be
 * served in its own language plus English.
 *
 * Most Swiss place names are the same in all four — Lausanne is Lausanne. Only
 * the handful with real exonyms are listed below, and only where the exonym is
 * the name people actually use and search for: Basel is Bâle in French and
 * Basilea in Italian, and a French speaker types "brocante Bâle".
 *
 * Nothing here is translated by a machine. A place name is a fact with one
 * correct answer per language, so they are written out.
 */

import { withClient, DB_URL } from './db.mjs';
import { slugify } from './slugify.mjs';

const DRY_RUN = process.argv.includes('--dry-run');

/** The locales Switzerland is published in. */
const LOCALES = ['de', 'fr', 'it', 'en'];

const COUNTRY = {
  de: 'Schweiz',
  fr: 'Suisse',
  it: 'Svizzera',
  en: 'Switzerland',
};

/** Canton names. Keyed by the German name already in the database. */
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

/**
 * Cities whose name genuinely changes. Everything not listed keeps its German
 * name in every locale, which is correct for Lausanne, Lugano, Winterthur and
 * the other 45 — inventing a translation for those would be worse than useless.
 */
const CITIES = {
  'Basel': { fr: 'Bâle', it: 'Basilea', en: 'Basel' },
  'Bern': { fr: 'Berne', it: 'Berna', en: 'Bern' },
  'Chur': { fr: 'Coire', it: 'Coira', en: 'Chur' },
  'Fribourg': { de: 'Freiburg', it: 'Friburgo', en: 'Fribourg' },
  'Genève': { de: 'Genf', it: 'Ginevra', en: 'Geneva' },
  'Luzern': { fr: 'Lucerne', it: 'Lucerna', en: 'Lucerne' },
  'Schaffhausen': { fr: 'Schaffhouse', it: 'Sciaffusa', en: 'Schaffhausen' },
  'St. Gallen': { fr: 'Saint-Gall', it: 'San Gallo', en: 'St. Gallen' },
  'Thun': { fr: 'Thoune', it: 'Thun', en: 'Thun' },
  'Zürich': { fr: 'Zurich', it: 'Zurigo', en: 'Zurich' },
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
       where entity_type = 'market' and locale = 'de'`);

    const planned = [];
    const add = (type, id, locale, name, slug) => planned.push({ type, id, locale, name, slug });

    for (const locale of LOCALES) {
      if (locale !== 'de') add('country', country.id, locale, COUNTRY[locale], slugify(COUNTRY[locale]));

      for (const region of regions) {
        const name = CANTONS[region.name]?.[locale] ?? region.name;
        if (locale !== 'de') add('region', region.id, locale, name, slugify(name));
      }

      for (const city of cities) {
        const name = CITIES[city.name]?.[locale] ?? city.name;
        // German rows already exist, except where a French or Italian city has a
        // German exonym worth correcting (Genève -> Genf).
        if (locale === 'de' && !CITIES[city.name]?.de) continue;
        add('city', city.id, locale, name, slugify(name));
      }

      // A market keeps one slug in every language. Its name is a proper noun —
      // "Flohmarkt Bürkliplatz" is what it is called on the poster, in any
      // language — so translating the URL would break links and gain nothing.
      // The displayed name still comes from `texts`, which v1 gave us per locale.
      if (locale !== 'de') {
        for (const market of markets) add('market', market.id, locale, null, market.slug);
      }
    }

    const slugRows = planned.length;
    const nameRows = planned.filter((p) => p.name).length;
    console.log(`\n  ${slugRows} slug rows, ${nameRows} name rows across ${LOCALES.join(', ')}`);

    // A slug must be unique per (entity_type, locale). Two cities that collide
    // in one language would silently overwrite each other, so check first.
    const seen = new Map();
    for (const p of planned) {
      const key = `${p.type}/${p.locale}/${p.slug}`;
      if (seen.has(key)) throw new Error(`slug collision: ${key} wanted by two entities`);
      seen.set(key, p.id);
    }
    console.log('  no slug collisions');

    if (DRY_RUN) {
      const sample = planned.filter((p) => p.type === 'city' && p.name).slice(0, 8);
      for (const p of sample) console.log(`    ${p.locale}  ${p.name}  ->  /${p.slug}/`);
      console.log('\n  --dry-run: nothing written.\n');
      return;
    }

    await client.query('begin');
    try {
      for (const p of planned) {
        await client.query(
          `insert into public.slugs (entity_type, entity_id, locale, slug)
           values ($1, $2, $3, $4)
           on conflict (entity_type, entity_id, locale) do update set slug = excluded.slug`,
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
