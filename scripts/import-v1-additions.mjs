#!/usr/bin/env node
/**
 * Bring over the markets fleafind has that we do not — and nothing else.
 *
 *   node scripts/import-v1-additions.mjs --dry-run    read both databases, report, write nothing
 *   node scripts/import-v1-additions.mjs              one transaction, additions only
 *
 * The first import (scripts/import-v1.mjs) deletes what it owns and reloads;
 * that stopped being possible the day the live database held things fleafind
 * never had — organiser links, a hand-entered market, corrected opening times,
 * the mail log. This script is the other shape: a market is new when its slug
 * is not here, and a new market brings only what it needs. A canton, a town, a
 * venue or an organiser that already exists is matched and reused, never
 * touched. Nothing that is already here is updated, so a hand edit survives.
 *
 * Both importers read fleafind through scripts/lib/v1.mjs, so a canton, a kind
 * or a date is decided once. Places get their four-locale slugs and names from
 * scripts/lib/places.mjs the moment they are created — no slug is ever
 * published and then retired for a translation.
 *
 * Organisers: an organiser that comes with an e-mail address gets a personal
 * link at once, so the welcome workflow finds them. Nothing is mailed here.
 *
 * Photos: the file name is written to the facts, as the first import did.
 * `node scripts/import-images.mjs` afterwards moves the files and sets the column.
 */

import { withClient, query, secret, DB_URL, V1_URL } from './db.mjs';
import { CANTONS, readV1, plan } from './lib/v1.mjs';
import { LOCALES, regionSlug, regionName, citySlug, cityName } from './lib/places.mjs';
import { sha256Hex, tokenFor } from '../functions/_link.ts';
import { todayIso } from '../src/lib/format.ts';

const DRY_RUN = process.argv.includes('--dry-run');

if (!V1_URL) {
  throw new Error('V1_DATABASE_URL is not set. It is the v1 project connection string, from its Supabase dashboard under Project Settings → Database.');
}
const SIGNING = secret('ADMIN_SIGNING_SECRET');
if (!SIGNING) {
  throw new Error('ADMIN_SIGNING_SECRET is not set; organiser links cannot be minted.');
}

/** The language an organiser is written to, by canton — the same table the CSV loader uses. */
const LANG_OF_REGION = { ZH: 'de', BE: 'de', LU: 'de', UR: 'de', SZ: 'de', OW: 'de', NW: 'de', GL: 'de', ZG: 'de', FR: 'fr', SO: 'de', BS: 'de', BL: 'de', SH: 'de', AR: 'de', AI: 'de', SG: 'de', GR: 'de', AG: 'de', TG: 'de', TI: 'it', VD: 'fr', VS: 'fr', NE: 'fr', GE: 'fr', JU: 'fr' };

const say = (...parts) => console.log(...parts);
const lower = (s) => (s ?? '').trim().toLowerCase();

/* ---------------------------------------------------------------------------
 * what is here already
 * ------------------------------------------------------------------------- */

async function readOurs() {
  const markets = await query(`select id, slug, hub_market_id from public.markets`);
  const regions = await query(`select id, code from public.regions`);
  const cities = await query(`
    select c.id, c.region_id, r.code as region_code, t.value as name
      from public.cities c
      join public.regions r on r.id = c.region_id
      join public.texts t on t.entity_type = 'city' and t.entity_id = c.id and t.locale = 'de' and t.field = 'name'`);
  const venues = await query(`select id, city_id, name, postal_code from public.venues`);
  const organisers = await query(`select id, name, email, locale from public.organisers`);
  const links = await query(`select organiser_id from public.organiser_links where revoked_at is null`);
  const slugs = await query(`select entity_type, entity_id, locale, slug from public.slugs`);
  const country = (await query(`select id from public.countries where iso2 = 'CH'`))[0];
  return { markets, regions, cities, venues, organisers, links, slugs, country };
}

/* ---------------------------------------------------------------------------
 * decide
 * ------------------------------------------------------------------------- */

function decide(p, ours) {
  const warnings = [];
  const stop = [];   // anything here and nothing is written

  const haveMarket = new Set(ours.markets.map((m) => m.slug));
  const markets = p.markets.filter((m) => !haveMarket.has(m.slug));

  // A slug is an address. One that any entity holds — live or retired — cannot
  // be handed to a new market, or an old redirect starts landing on it.
  const heldMarketSlugs = new Set(ours.slugs.filter((s) => s.entity_type === 'market').map((s) => s.slug));
  for (const m of markets) {
    if (heldMarketSlugs.has(m.slug)) stop.push(`market slug "${m.slug}" is already held by another market`);
  }

  // --- towns and cantons the new markets stand in ---
  const venueOfMarket = new Map();
  for (const city of p.cities) for (const v of city.venues) venueOfMarket.set(v.id, { city, venue: v });

  const cityByName = new Map(ours.cities.map((c) => [c.name, c]));
  const regionByCode = new Map(ours.regions.map((r) => [r.code, r]));
  const heldCitySlugs = new Map();   // slug → entity_id, any locale
  for (const s of ours.slugs) if (s.entity_type === 'city') heldCitySlugs.set(s.slug, s.entity_id);

  const newRegions = new Map();   // code → { code, name }
  const cities = new Map();       // name → { plan city, existing | null, venuesNeeded: [] }

  for (const m of markets) {
    const at = venueOfMarket.get(m.venue_id);
    if (!at) { stop.push(`market "${m.slug}" sits on a venue the plan skipped`); continue; }
    const { city, venue } = at;

    if (!cities.has(city.name)) {
      const existing = cityByName.get(city.name) ?? null;
      if (existing && existing.region_code !== city.canton) {
        stop.push(`town "${city.name}" exists in ${existing.region_code}; fleafind puts this one in ${city.canton} — disambiguate the name first`);
      }
      if (!existing) {
        const slug = citySlug(city.name);
        if (heldCitySlugs.has(slug)) stop.push(`town slug "${slug}" for "${city.name}" is already held by another town`);
        if (!regionByCode.has(city.canton) && !newRegions.has(city.canton)) {
          newRegions.set(city.canton, { code: city.canton, name: CANTONS[city.canton] });
        }
      }
      cities.set(city.name, { city, existing, venues: new Map() });
    }
    const entry = cities.get(city.name);
    if (!entry.venues.has(venue.id)) entry.venues.set(venue.id, venue);
  }

  // --- venues: match on the town, the name and the postal code ---
  const venueKey = (cityId, name, postal) => `${cityId}|${lower(name)}|${(postal ?? '').trim()}`;
  const venueByKey = new Map(ours.venues.map((v) => [venueKey(v.city_id, v.name, v.postal_code), v]));
  let venuesNew = 0, venuesMatched = 0;
  for (const entry of cities.values()) {
    for (const v of entry.venues.values()) {
      v.existing = entry.existing ? venueByKey.get(venueKey(entry.existing.id, v.venue_name, v.postal_code)) ?? null : null;
      if (v.existing) venuesMatched += 1; else venuesNew += 1;
    }
  }

  // --- organisers: by e-mail first, then by name ---
  const orgByEmail = new Map(ours.organisers.filter((o) => o.email).map((o) => [lower(o.email), o]));
  const orgByName = new Map(ours.organisers.map((o) => [lower(o.name), o]));
  const linked = new Set(ours.links.map((l) => l.organiser_id));
  const organisers = new Map();   // key → { name, email, locale, channel_type, channel_value, existing, setEmail, mint }

  for (const m of markets) {
    if (!m.organiser_name) continue;
    const at = venueOfMarket.get(m.venue_id);
    const email = lower(m.organiser_email) || null;
    const locale = LANG_OF_REGION[at?.city.canton] ?? 'en';
    const key = email ?? `name:${lower(m.organiser_name)}`;
    if (organisers.has(key)) { m.organiser_key = key; continue; }

    const existing = (email && orgByEmail.get(email)) || orgByName.get(lower(m.organiser_name)) || null;
    const planned = p.organisers.find((o) => o.name === m.organiser_name);
    const entry = {
      name: m.organiser_name,
      email,
      locale,
      channel_type: planned?.channel_type ?? 'unknown',
      channel_value: planned?.channel_value ?? null,
      existing,
      // An existing organiser without an address gets the one fleafind found;
      // one that has an address keeps it (the CSV loader's rule).
      setEmail: Boolean(existing && email && !existing.email),
      mint: false,
    };
    if (existing && existing.email && email && lower(existing.email) !== email) {
      warnings.push(`organiser "${existing.name}" already has ${existing.email}; fleafind says ${email} for ${m.slug} — keeping ours`);
    }
    const willHaveEmail = existing ? Boolean(existing.email) || entry.setEmail : Boolean(email);
    entry.mint = willHaveEmail && !(existing && linked.has(existing.id));
    organisers.set(key, entry);
    m.organiser_key = key;
  }

  // --- hubs: a new market may join a hub that already exists ---
  const idBySlug = new Map(ours.markets.map((m) => [m.slug, m.id]));
  for (const m of markets) {
    if (!m.hub_key) continue;
    const hubSlug = p.hubs.get(m.hub_key);
    if (hubSlug === m.slug) continue;
    m.hub_slug = hubSlug;
    if (!idBySlug.has(hubSlug) && !markets.some((n) => n.slug === hubSlug)) {
      warnings.push(`market "${m.slug}" belongs to hub "${hubSlug}", which is neither here nor new; imported without a hub`);
      m.hub_slug = null;
    }
  }

  return { markets, cities, newRegions, organisers, venuesNew, venuesMatched, warnings, stop };
}

/* ---------------------------------------------------------------------------
 * write
 * ------------------------------------------------------------------------- */

async function write(d, ours) {
  return withClient(DB_URL, async (c) => {
    const one = async (sql, params) => (await c.query(sql, params)).rows[0];
    const run = (sql, params) => c.query(sql, params);

    const slug = (type, id, locale, value) =>
      run(`insert into public.slugs (entity_type, entity_id, locale, slug) values ($1,$2,$3,$4)`, [type, id, locale, value]);
    const text = (type, id, locale, field, value) =>
      run(`insert into public.texts (entity_type, entity_id, locale, field, value) values ($1,$2,$3,$4,$5)`, [type, id, locale, field, value]);
    const fact = (type, id, field, value, opts = {}) =>
      run(`insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
           values ($1,$2,$3,$4::jsonb,$5,$6,$7,$8)`,
        [type, id, field, JSON.stringify(value), opts.source_type ?? 'import',
          opts.source_ref ?? null, opts.observed_at ?? new Date(), opts.confidence ?? 'reported']);

    await run('begin');
    try {
      // --- cantons ---
      const regionIds = new Map(ours.regions.map((r) => [r.code, r.id]));
      for (const r of d.newRegions.values()) {
        const row = await one(`insert into public.regions (country_id, code) values ($1,$2) returning id`, [ours.country.id, r.code]);
        regionIds.set(r.code, row.id);
        for (const locale of LOCALES) {
          await slug('region', row.id, locale, regionSlug(r.name));
          await text('region', row.id, locale, 'name', regionName(r.name, locale));
        }
      }

      // --- towns and venues ---
      const venueIds = new Map();   // v1 venue id → ours
      for (const entry of d.cities.values()) {
        let cityId = entry.existing?.id;
        if (!cityId) {
          const vs = [...entry.city.venues];
          const lat = vs.reduce((s, v) => s + v.lat, 0) / vs.length;
          const lng = vs.reduce((s, v) => s + v.lng, 0) / vs.length;
          const row = await one(
            `insert into public.cities (region_id, point)
             values ($1, extensions.st_setsrid(extensions.st_makepoint($2,$3),4326)::extensions.geography)
             returning id`,
            [regionIds.get(entry.city.canton), lng, lat]);
          cityId = row.id;
          for (const locale of LOCALES) {
            await slug('city', cityId, locale, citySlug(entry.city.name));
            await text('city', cityId, locale, 'name', cityName(entry.city.name, locale));
          }
        }
        for (const v of entry.venues.values()) {
          if (v.existing) { venueIds.set(v.id, v.existing.id); continue; }
          const nv = await one(
            `insert into public.venues (city_id, name, address_line, postal_code, point, google_place_id, timezone)
             values ($1,$2,$3,$4, extensions.st_setsrid(extensions.st_makepoint($5,$6),4326)::extensions.geography, $7,$8)
             returning id`,
            [cityId, v.venue_name, v.address_line, v.postal_code, v.lng, v.lat, v.google_place_id, v.timezone ?? 'Europe/Zurich']);
          venueIds.set(v.id, nv.id);
          await text('venue', nv.id, 'de', 'name', v.venue_name);
        }
      }

      // --- organisers and their links ---
      const organiserIds = new Map();
      let minted = 0;
      for (const [key, o] of d.organisers) {
        let id = o.existing?.id;
        if (!id) {
          const row = await one(
            `insert into public.organisers (name, channel_type, channel_value, email, locale) values ($1,$2,$3,$4,$5) returning id`,
            [o.name, o.channel_type, o.channel_value, o.email, o.email ? o.locale : null]);
          id = row.id;
        } else if (o.setEmail) {
          await run(`update public.organisers set email = $2, locale = coalesce(locale, $3), updated_at = now() where id = $1`, [id, o.email, o.locale]);
        }
        organiserIds.set(key, id);
        if (o.mint) {
          // The token is derived from the link's id, so the id comes first.
          const fresh = await one(`select gen_random_uuid() as id`);
          const token = await tokenFor(SIGNING, fresh.id);
          await run(`insert into public.organiser_links (id, organiser_id, token_hash) values ($1, $2, $3)`, [fresh.id, id, await sha256Hex(token)]);
          minted += 1;
        }
      }

      // --- markets ---
      const marketIds = new Map(ours.markets.map((m) => [m.slug, m.id]));
      let occurrences = 0;
      for (const m of d.markets) {
        const row = await one(
          `insert into public.markets
             (venue_id, organiser_id, slug, status, kind, recurrence_text, entry_fee, currency, website_url)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
          [venueIds.get(m.venue_id), m.organiser_key ? organiserIds.get(m.organiser_key) : null,
            m.slug, m.status, m.kind, m.recurrence_text, m.entry_fee, m.currency, m.website_url]);
        marketIds.set(m.slug, row.id);

        await run(
          `insert into public.market_private (market_id, organiser_email, source_url, admin_notes, raw_import)
           values ($1,$2,$3,$4,$5::jsonb)`,
          [row.id, m.organiser_email, m.source_url, m.admin_notes, JSON.stringify(m.raw)]);

        for (const locale of LOCALES) await slug('market', row.id, locale, m.slug);
        for (const [locale, name] of Object.entries(m.names)) await text('market', row.id, locale, 'name', name);
        for (const [locale, description] of Object.entries(m.descriptions)) await text('market', row.id, locale, 'description', description);

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
        if (m.image_url_v1) {
          await fact('market', row.id, 'image_url', m.image_url_v1, {
            source_type: 'import',
            source_ref: 'fleafind v1 repository, public/images',
            confidence: 'reported',
          });
        }

        for (const dte of m.dates) {
          const occurrence = await one(
            `insert into public.occurrences
               (market_id, date, start_time, end_time, status, origin, cancellation_note, confirmed_at)
             values ($1,$2,$3,$4,$5,'import',$6,$7) returning id`,
            [row.id, dte.date, dte.start_time, dte.end_time, dte.status, dte.cancellation_note, dte.confirmed_at]);
          occurrences += 1;
          if (dte.status === 'confirmed' && dte.confirmed_at) {
            await fact('occurrence', occurrence.id, 'date', dte.date, {
              source_type: 'website_crawl',
              source_ref: m.source_url,
              observed_at: dte.confirmed_at,
              confidence: 'confirmed',
            });
          }
        }
      }

      // --- hubs, once every market exists ---
      for (const m of d.markets) {
        if (!m.hub_slug) continue;
        await run(`update public.markets set hub_market_id = $1 where id = $2`, [marketIds.get(m.hub_slug), marketIds.get(m.slug)]);
      }

      await run('commit');
      return { markets: d.markets.length, occurrences, minted };
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
const ours = await readOurs();
const d = decide(p, ours);

const today = todayIso();
const newTowns = [...d.cities.values()].filter((e) => !e.existing);
const existingTowns = [...d.cities.values()].filter((e) => e.existing);
const orgs = [...d.organisers.values()];

say(`\n  fleafind → fynda.market, additions only`);
say(`  fleafind has ${p.markets.length} markets; ${ours.markets.length} are here; ${d.markets.length} new.\n`);

if (d.markets.length) {
  say(`  cantons: ${d.newRegions.size} new${d.newRegions.size ? ` (${[...d.newRegions.values()].map((r) => r.name).join(', ')})` : ''}`);
  say(`  towns:   ${newTowns.length} new, ${existingTowns.length} existing`);
  for (const e of newTowns) say(`    + ${e.city.name} (${e.city.canton}) /${citySlug(e.city.name)}/`);
  for (const e of existingTowns) say(`    = ${e.city.name} (${e.existing.region_code})`);
  say(`  venues:  ${d.venuesNew} new, ${d.venuesMatched} existing`);
  say(`  organisers: ${orgs.filter((o) => !o.existing).length} new, ${orgs.filter((o) => o.existing).length} existing` +
    `; ${orgs.filter((o) => o.setEmail).length} existing get an address; ${orgs.filter((o) => o.mint).length} links to mint`);
  for (const o of orgs.filter((o) => o.existing)) say(`    = ${o.name}${o.setEmail ? ` ← ${o.email}` : ''}`);

  say(`\n  markets:`);
  for (const m of d.markets) {
    const upcoming = m.dates.filter((x) => x.date >= today);
    const next = upcoming[0]?.date ?? '—';
    say(`    ${m.slug.padEnd(52)} ${m.kind.padEnd(16)} ${String(m.dates.length).padStart(2)} dates, next ${next}` +
      `${m.image_url_v1 ? '' : '  NO PHOTO'}${m.organiser_email ? '' : '  no e-mail'}${m.hub_slug ? `  hub ${m.hub_slug}` : ''}`);
  }
  const noUpcoming = d.markets.filter((m) => !m.dates.some((x) => x.date >= today)).length;
  const kinds = {};
  for (const m of d.markets) kinds[m.kind] = (kinds[m.kind] ?? 0) + 1;
  say(`\n  kinds: ${Object.entries(kinds).map(([k, n]) => `${k}=${n}`).join('  ')}`);
  say(`  ${noUpcoming} with no upcoming date (annual, waiting for next year's date), ${d.markets.filter((m) => m.kind_inferred).length} kinds inferred from the name`);
}

if (d.warnings.length) {
  say(`\n  ${d.warnings.length} warning(s):`);
  for (const w of d.warnings) say(`    - ${w}`);
}
if (d.stop.length) {
  say(`\n  ${d.stop.length} problem(s) — nothing written:`);
  for (const s of d.stop) say(`    ! ${s}`);
  process.exit(1);
}

if (DRY_RUN || !d.markets.length) {
  say(DRY_RUN ? '\n  --dry-run: nothing written.\n' : '\n  Nothing to add.\n');
} else {
  const r = await write(d, ours);
  say(`\n  written: ${r.markets} markets, ${r.occurrences} dates, ${r.minted} organiser links.`);
  // fleafind's rhythm line ("Zweimal jährlich, sonntags") is German only. The
  // page falls back to it in every locale, so the other three go into `texts`
  // by hand — the first 160 were done that way in the copy pass.
  const rhythm = d.markets.filter((m) => m.recurrence_text);
  if (rhythm.length) {
    say(`\n  ${rhythm.length} recurrence lines are German only — write them in en/fr/it into texts (field recurrence_text):`);
    for (const m of rhythm) say(`    ${m.slug} | ${m.recurrence_text}`);
  }
  say(`  Next: node scripts/import-images.mjs, then FYNDA_DATA_SOURCE=supabase npm run verify.\n`);
}
process.exit(0);
