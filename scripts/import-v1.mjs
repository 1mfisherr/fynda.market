#!/usr/bin/env node
/**
 * Import the v1 data. docs/ARCHITECTURE.md §Import says what it decides.
 *
 *   node scripts/import-v1.mjs --dry-run    read v1, report, write nothing
 *   node scripts/import-v1.mjs              replace the imported tables
 *
 * Source is always the live v1 Supabase project (V1_DATABASE_URL). Local
 * backups are read for shape, never imported from — CLAUDE.md.
 *
 * The run is one transaction and it is destructive by design: it deletes every
 * row it owns and reloads. Re-running is how the import is corrected, so it has
 * to converge on the same result rather than accumulate. Rows a human has since
 * added by hand do not survive it — nothing is hand-entered yet, and when that
 * changes this script stops being the right tool.
 *
 * Three shapes do not survive the crossing, and each is deliberate:
 *
 *   markets.city / markets.canton   Free-text place names, disagreeing with the
 *     venue in 39 of 161 rows. The new schema has no free-text place: cities are
 *     built from venues.city, cantons from markets.canton with the two known
 *     errors corrected below.
 *
 *   image_url   161 values pointing at files that live in the v1 repo, not this
 *     one. Setting it would render broken images, so it goes to the facts ledger
 *     as a note and markets.image_url stays null. The illustration set is the
 *     designed default. When the photographs are moved across, a second pass
 *     reads those facts back.
 *
 *   type / market_type   v1 knew three types, the Linientafel colours eight, and
 *     `permanent`/`temporary` means recurring/one-off, not indoor/outdoor. Kind
 *     is read from v1's type and then refined from the market name. Every
 *     name-derived kind is written as an `inferred` fact so the guess is
 *     visible and can be overruled by a real one.
 */

import { withClient, DB_URL, V1_URL } from './db.mjs';
import { slugify } from './slugify.mjs';
import { CANTONS, readV1, plan } from './lib/v1.mjs';

const DRY_RUN = process.argv.includes('--dry-run');

if (!V1_URL) {
  throw new Error('V1_DATABASE_URL is not set. It is the v1 project connection string, from its Supabase dashboard under Project Settings → Database.');
}

/* ---------------------------------------------------------------------------
 * reference data
 * ------------------------------------------------------------------------- */

const COUNTRY = { iso2: 'CH', names: { de: 'Schweiz' }, slugs: { de: 'schweiz' } };

/* ---------------------------------------------------------------------------
 * write
 * ------------------------------------------------------------------------- */

async function write(p) {
  return withClient(DB_URL, async (c) => {
    const one = async (sql, params) => (await c.query(sql, params)).rows[0];
    const run = (sql, params) => c.query(sql, params);

    await run('begin');
    try {
      // Owned tables, children first. slugs/texts/facts have no foreign key,
      // so the delete triggers on the parents do not reach them — clear them
      // by hand, or a re-run leaves orphans behind.
      await run(`delete from public.occurrences`);
      await run(`delete from public.market_private`);
      await run(`delete from public.markets`);
      await run(`delete from public.venues`);
      await run(`delete from public.cities`);
      await run(`delete from public.regions`);
      await run(`delete from public.countries`);
      await run(`delete from public.organisers`);
      await run(`delete from public.slugs`);
      await run(`delete from public.texts`);
      await run(`delete from public.facts`);

      const slug = (type, id, locale, value) =>
        run(`insert into public.slugs (entity_type, entity_id, locale, slug) values ($1,$2,$3,$4)`,
          [type, id, locale, value]);
      const text = (type, id, locale, field, value) =>
        run(`insert into public.texts (entity_type, entity_id, locale, field, value) values ($1,$2,$3,$4,$5)`,
          [type, id, locale, field, value]);
      const fact = (type, id, field, value, opts = {}) =>
        run(`insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
             values ($1,$2,$3,$4::jsonb,$5,$6,$7,$8)`,
          [type, id, field, JSON.stringify(value), opts.source_type ?? 'import',
            opts.source_ref ?? null, opts.observed_at ?? new Date(), opts.confidence ?? 'reported']);

      // --- country ---
      const country = await one(
        `insert into public.countries (iso2) values ($1) returning id`, [COUNTRY.iso2]);
      await slug('country', country.id, 'de', COUNTRY.slugs.de);
      await text('country', country.id, 'de', 'name', COUNTRY.names.de);

      // --- regions ---
      const regionIds = new Map();
      for (const code of p.regions) {
        const r = await one(
          `insert into public.regions (country_id, code) values ($1,$2) returning id`,
          [country.id, code]);
        regionIds.set(code, r.id);
        await slug('region', r.id, 'de', slugify(CANTONS[code]));
        await text('region', r.id, 'de', 'name', CANTONS[code]);
      }

      // --- cities and venues ---
      const venueIds = new Map();   // v1 venue id → new id
      for (const city of p.cities) {
        // Centroid of the venues, so "near me" has a sensible default before
        // any real city geometry exists.
        const lat = city.venues.reduce((s, v) => s + v.lat, 0) / city.venues.length;
        const lng = city.venues.reduce((s, v) => s + v.lng, 0) / city.venues.length;

        const row = await one(
          `insert into public.cities (region_id, point)
           values ($1, extensions.st_setsrid(extensions.st_makepoint($2,$3),4326)::extensions.geography)
           returning id`,
          [regionIds.get(city.canton), lng, lat]);
        await slug('city', row.id, 'de', city.slug);
        await text('city', row.id, 'de', 'name', city.name);

        for (const v of city.venues) {
          const nv = await one(
            `insert into public.venues (city_id, name, address_line, postal_code, point, google_place_id, timezone)
             values ($1,$2,$3,$4, extensions.st_setsrid(extensions.st_makepoint($5,$6),4326)::extensions.geography, $7,$8)
             returning id`,
            [row.id, v.venue_name, v.address_line, v.postal_code, v.lng, v.lat,
              v.google_place_id, v.timezone ?? 'Europe/Zurich']);
          venueIds.set(v.id, nv.id);
          await text('venue', nv.id, 'de', 'name', v.venue_name);
        }
      }

      // --- organisers ---
      const organiserIds = new Map();
      for (const o of p.organisers) {
        const row = await one(
          `insert into public.organisers (name, channel_type, channel_value) values ($1,$2,$3) returning id`,
          [o.name, o.channel_type, o.channel_value]);
        organiserIds.set(o.name, row.id);
      }

      // --- markets ---
      const marketIds = new Map();   // slug → new id
      for (const m of p.markets) {
        const row = await one(
          `insert into public.markets
             (venue_id, organiser_id, slug, status, kind, recurrence_text, entry_fee, currency, website_url)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
          [venueIds.get(m.venue_id), m.organiser_name ? organiserIds.get(m.organiser_name) : null,
            m.slug, m.status, m.kind, m.recurrence_text, m.entry_fee, m.currency, m.website_url]);
        marketIds.set(m.slug, row.id);

        await run(
          `insert into public.market_private (market_id, organiser_email, source_url, admin_notes, raw_import)
           values ($1,$2,$3,$4,$5::jsonb)`,
          [row.id, m.organiser_email, m.source_url, m.admin_notes, JSON.stringify(m.raw)]);

        await slug('market', row.id, 'de', m.slug);
        for (const [locale, name] of Object.entries(m.names)) {
          await text('market', row.id, locale, 'name', name);
        }
        for (const [locale, description] of Object.entries(m.descriptions)) {
          await text('market', row.id, locale, 'description', description);
        }

        // Provenance. Every market carries the URL it came from, which is what
        // makes "Bestätigt am ..." an honest sentence rather than a decoration.
        if (m.source_url) {
          await fact('market', row.id, 'listing', { slug: m.slug, imported_from: 'fleafind.ch' }, {
            source_type: 'website_crawl',
            source_ref: m.source_url,
            observed_at: m.last_verified_at ?? new Date(),
            confidence: m.status === 'active' ? 'reported' : 'confirmed',
          });
        }
        if (m.kind_inferred) {
          await fact('market', row.id, 'kind', m.kind, {
            source_type: 'import',
            source_ref: `derived from the market name: ${m.raw.name}`,
            confidence: 'inferred',
          });
        }
        // The photograph exists in the v1 repo. Recorded so the second pass can
        // find it; markets.image_url stays null until the file is here.
        if (m.image_url_v1) {
          await fact('market', row.id, 'image_url', m.image_url_v1, {
            source_type: 'import',
            source_ref: 'fleafind v1 repository, public/images',
            confidence: 'reported',
          });
        }

        for (const d of m.dates) {
          const occurrence = await one(
            `insert into public.occurrences
               (market_id, date, start_time, end_time, status, origin, cancellation_note, confirmed_at)
             values ($1,$2,$3,$4,$5,'import',$6,$7) returning id`,
            [row.id, d.date, d.start_time, d.end_time, d.status, d.cancellation_note, d.confirmed_at]);

          if (d.status === 'confirmed' && d.confirmed_at) {
            await fact('occurrence', occurrence.id, 'date', d.date, {
              source_type: 'website_crawl',
              source_ref: m.source_url,
              observed_at: d.confirmed_at,
              confidence: 'confirmed',
            });
          }
        }
      }

      // --- hubs, once every market exists ---
      for (const m of p.markets) {
        if (!m.hub_key) continue;
        const hubSlug = p.hubs.get(m.hub_key);
        if (hubSlug === m.slug) continue;
        await run(`update public.markets set hub_market_id = $1 where id = $2`,
          [marketIds.get(hubSlug), marketIds.get(m.slug)]);
      }

      await run('commit');
      return marketIds.size;
    } catch (error) {
      await run('rollback');
      throw error;
    }
  });
}

/* ---------------------------------------------------------------------------
 * run
 * ------------------------------------------------------------------------- */

const v1 = await readV1();
const p = plan(v1);

const occurrences = p.markets.reduce((n, m) => n + m.dates.length, 0);
const inferred = p.markets.filter((m) => m.kind_inferred).length;
const kinds = {};
for (const m of p.markets) kinds[m.kind] = (kinds[m.kind] ?? 0) + 1;

console.log(`\n  v1 → fynda`);
console.log(`  ${p.markets.length} markets, ${occurrences} dates, ${p.cities.length} cities, ${p.regions.length} cantons, ${p.organisers.length} organisers`);
console.log(`  kinds: ${Object.entries(kinds).map(([k, n]) => `${k}=${n}`).join('  ')}`);
console.log(`  ${inferred} kinds inferred from the market name, each written as an inferred fact`);
console.log(`  ${p.markets.filter((m) => m.status !== 'active').length} markets are not active and will not publish`);

if (p.warnings.length) {
  console.log(`\n  ${p.warnings.length} warning(s):`);
  for (const w of p.warnings) console.log(`    - ${w}`);
}

if (DRY_RUN) {
  console.log('\n  --dry-run: nothing written.\n');
} else {
  const written = await write(p);
  console.log(`\n  written: ${written} markets. Run npm run verify.\n`);
}
