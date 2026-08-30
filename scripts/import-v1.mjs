#!/usr/bin/env node
/**
 * PLAN.md 3.4 — import the v1 data.
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

const DRY_RUN = process.argv.includes('--dry-run');

if (!V1_URL) {
  throw new Error('V1_DATABASE_URL is not set. It is the v1 project connection string, from its Supabase dashboard under Project Settings → Database.');
}

/* ---------------------------------------------------------------------------
 * reference data
 * ------------------------------------------------------------------------- */

const COUNTRY = { iso2: 'CH', names: { de: 'Schweiz' }, slugs: { de: 'schweiz' } };

/** German canton names, for the region slug and name. Only what CH needs. */
const CANTONS = {
  AG: 'Aargau', AI: 'Appenzell Innerrhoden', AR: 'Appenzell Ausserrhoden',
  BE: 'Bern', BL: 'Basel-Landschaft', BS: 'Basel-Stadt', FR: 'Freiburg',
  GE: 'Genf', GL: 'Glarus', GR: 'Graubünden', JU: 'Jura', LU: 'Luzern',
  NE: 'Neuenburg', NW: 'Nidwalden', OW: 'Obwalden', SG: 'St. Gallen',
  SH: 'Schaffhausen', SO: 'Solothurn', SZ: 'Schwyz', TG: 'Thurgau',
  TI: 'Tessin', UR: 'Uri', VD: 'Waadt', VS: 'Wallis', ZG: 'Zug', ZH: 'Zürich',
};

/**
 * Cities v1 filed under the wrong canton, by postal code. Both are real errors
 * in the source, not disagreements about method, so they are corrected here
 * rather than carried across and cleaned later.
 */
const CANTON_FIXES = {
  Pratteln: 'BL',   // 4133, Basel-Landschaft; v1 has one row saying BS
  Subingen: 'SO',   // 4553, Solothurn; v1 says BE
};

/** v1 type → the new kind vocabulary. The starting point, before the name pass. */
const KIND_FROM_TYPE = {
  flea_market: 'flohmarkt',
  brocante: 'brocante',
  antique: 'antikmarkt',
};

/**
 * Name patterns that identify a more specific line. Order matters: a
 * Kinderflohmarkt in a hall is a Kinderflohmarkt, because that is what decides
 * whether someone goes.
 */
const KIND_FROM_NAME = [
  [/\b(kinder|chind|b[ée]b[ée]|puericultura|enfant)/i, 'kinderflohmarkt'],
  [/\bnacht|\bnight|nocturne|notturn/i, 'nachtflohmarkt'],
  [/\bhallen|halle\b|indoor/i, 'hallenflohmarkt'],
  [/\btr(ö|oe)del/i, 'troedelmarkt'],
  [/\bantik|antiqu/i, 'antikmarkt'],
  [/\bbrocante/i, 'brocante'],
  [/\bstrassen|street/i, 'strassenmarkt'],
];

/** v1 date status → occurrences.status. v1 had no 'unverified'. */
const STATUS_FROM_V1 = {
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  tentative: 'tentative',
};

const LOCALES = ['de', 'fr', 'it', 'en'];

/* ---------------------------------------------------------------------------
 * slugs
 * ------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * read v1
 * ------------------------------------------------------------------------- */

async function readV1() {
  return withClient(V1_URL, async (c) => {
    const rows = async (sql) => (await c.query(sql)).rows;
    return {
      markets: await rows(`
        select m.*, v.city as venue_city
          from public.markets m
          join public.venues v on v.id = m.venue_id
         order by m.created_at`),
      venues: await rows(`select * from public.venues order by created_at`),
      dates: await rows(`select * from public.market_dates order by market_id, date`),
      locales: await rows(`select * from public.market_locales`),
      private: await rows(`select * from public.market_private`),
    };
  });
}

/* ---------------------------------------------------------------------------
 * shape the rows
 * ------------------------------------------------------------------------- */

function normaliseCanton(value) {
  const raw = (value ?? '').trim();
  if (CANTONS[raw.toUpperCase()]) return raw.toUpperCase();
  // 'Aargau' and friends: match the German name back to its code.
  const byName = Object.entries(CANTONS).find(([, name]) => name.toLowerCase() === raw.toLowerCase());
  return byName ? byName[0] : null;
}

function kindFor(market) {
  for (const [pattern, kind] of KIND_FROM_NAME) {
    if (pattern.test(market.name)) return { kind, inferred: true };
  }
  return { kind: KIND_FROM_TYPE[market.type] ?? 'flohmarkt', inferred: false };
}

/**
 * Everything the write step needs, derived and checked before a single row is
 * written. A dry run stops here, which is what makes it worth having.
 */
function plan(v1) {
  const warnings = [];

  // --- cities, from venues, with the canton of the markets standing on them ---
  const marketsByVenue = new Map();
  for (const m of v1.markets) {
    if (!marketsByVenue.has(m.venue_id)) marketsByVenue.set(m.venue_id, []);
    marketsByVenue.get(m.venue_id).push(m);
  }

  const cities = new Map();   // city name → { name, canton, venues: [], slug }
  for (const venue of v1.venues) {
    const atVenue = marketsByVenue.get(venue.id) ?? [];
    if (atVenue.length === 0) {
      warnings.push(`venue "${venue.venue_name}" (${venue.city}) has no market and is skipped`);
      continue;
    }

    const name = venue.city.trim();
    // Majority canton across the markets here, then the known corrections.
    const votes = {};
    for (const m of atVenue) {
      const code = normaliseCanton(m.canton);
      if (code) votes[code] = (votes[code] ?? 0) + 1;
    }
    let canton = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    if (CANTON_FIXES[name] && CANTON_FIXES[name] !== canton) {
      warnings.push(`canton corrected for ${name}: v1 says ${canton ?? 'nothing'}, importing as ${CANTON_FIXES[name]}`);
      canton = CANTON_FIXES[name];
    }
    if (!canton) {
      warnings.push(`no canton could be resolved for ${name}; venue skipped`);
      continue;
    }

    if (!cities.has(name)) cities.set(name, { name, canton, slug: slugify(name), venues: [] });
    const city = cities.get(name);
    if (city.canton !== canton) {
      warnings.push(`${name} appears in both ${city.canton} and ${canton}; keeping ${city.canton}`);
    }
    city.venues.push(venue);
  }

  // A city slug has to be unique within its locale, and two cantons can hold
  // the same name. Nothing collides today; this fails loudly if that changes.
  const bySlug = new Map();
  for (const city of cities.values()) {
    if (bySlug.has(city.slug)) {
      throw new Error(`city slug collision: "${city.name}" and "${bySlug.get(city.slug).name}" both slugify to ${city.slug}. Disambiguate before importing.`);
    }
    bySlug.set(city.slug, city);
  }

  const regions = [...new Set([...cities.values()].map((c) => c.canton))].sort();

  // --- markets ---
  const privateByMarket = new Map(v1.private.map((p) => [p.market_id, p]));
  const localesByMarket = new Map();
  for (const l of v1.locales) {
    if (!localesByMarket.has(l.market_id)) localesByMarket.set(l.market_id, {});
    localesByMarket.get(l.market_id)[l.locale] = l;
  }
  const datesByMarket = new Map();
  for (const d of v1.dates) {
    if (!datesByMarket.has(d.market_id)) datesByMarket.set(d.market_id, []);
    datesByMarket.get(d.market_id).push(d);
  }

  const venueIds = new Set([...cities.values()].flatMap((c) => c.venues.map((v) => v.id)));
  const organisers = new Map();   // name → { name, channel_type, channel_value }
  const markets = [];

  for (const m of v1.markets) {
    if (!venueIds.has(m.venue_id)) {
      warnings.push(`market "${m.slug}" sits on a skipped venue and is not imported`);
      continue;
    }

    const { kind, inferred } = kindFor(m);
    const priv = privateByMarket.get(m.id);

    if (m.organiser_name) {
      const key = m.organiser_name.trim();
      if (!organisers.has(key)) {
        organisers.set(key, {
          name: key,
          channel_type: priv?.organiser_email ? 'email' : m.website_url ? 'website' : 'unknown',
          channel_value: priv?.organiser_email ?? m.website_url ?? null,
        });
      }
    }

    const dates = (datesByMarket.get(m.id) ?? []).map((d) => ({
      // The column is a `date`; pg hands it back as a Date at UTC midnight, and
      // toISOString would shift it a day west of Zurich. Format it by hand.
      date: [d.date.getFullYear(), d.date.getMonth() + 1, d.date.getDate()]
        .map((n, i) => String(n).padStart(i === 0 ? 4 : 2, '0')).join('-'),
      start_time: d.start_time,
      end_time: d.end_time,
      status: STATUS_FROM_V1[d.status] ?? 'unverified',
      cancellation_note: d.cancellation_note,
      confirmed_at: d.verified_at,
    }));

    markets.push({
      v1_id: m.id,
      slug: m.slug,
      venue_id: m.venue_id,
      organiser_name: m.organiser_name?.trim() ?? null,
      status: m.status === 'active' ? 'active' : m.status === 'permanently_closed' ? 'permanently_closed' : 'unverified',
      kind,
      kind_inferred: inferred,
      recurrence_text: m.recurrence_display,
      entry_fee: m.entry_fee,
      currency: m.entry_fee === null ? null : 'CHF',
      website_url: m.website_url,
      hub_key: m.market_group,
      image_url_v1: m.image_url,
      last_verified_at: m.last_verified_at,
      source_url: priv?.source_url ?? null,
      organiser_email: priv?.organiser_email ?? null,
      admin_notes: priv?.admin_notes ?? null,
      names: Object.fromEntries(
        LOCALES.map((l) => [l, localesByMarket.get(m.id)?.[l]?.display_name ?? null]).filter(([, v]) => v)
      ),
      descriptions: Object.fromEntries(
        [['de', m.description], ['fr', m.description_fr], ['it', m.description_it], ['en', m.description_en]]
          .filter(([, v]) => v)
      ),
      dates,
      raw: m,
    });
  }

  // Hubs: v1's market_group, a text key matched by convention. The first member
  // by creation date becomes the hub the others point at.
  const hubs = new Map();
  for (const m of markets) {
    if (!m.hub_key) continue;
    if (!hubs.has(m.hub_key)) hubs.set(m.hub_key, m.slug);
  }

  return { cities: [...cities.values()], regions, organisers: [...organisers.values()], markets, hubs, warnings };
}

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
