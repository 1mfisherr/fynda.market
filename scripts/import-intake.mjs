#!/usr/bin/env node
/**
 * Load researched markets from intake/<country>/*.json — and nothing else.
 *
 *   node scripts/import-intake.mjs intake/de --dry-run    read, validate, report, write nothing
 *   node scripts/import-intake.mjs intake/de              one transaction, additions only
 *
 * The shape of a file is intake/README.md. The rules are import-v1-additions.mjs's:
 * a market is new when its slug is not here; a country, a Bundesland, a town, a
 * venue or an organiser that exists is matched and reused, never touched; nothing
 * already here is updated. A market arrives as `unverified`, which the build does
 * not publish (publishable_markets reads `active` only) — someone flips it after
 * the spot-check and the photos (docs/GERMANY-SPEC.md).
 *
 * Dates the organiser lists are `confirmed` as of the day they were read; dates
 * derived from a rhythm are `unverified`. An organiser with a published e-mail
 * gets a personal link at once, so the welcome workflow finds them. Nothing is
 * mailed here.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withClient, query, secret, DB_URL } from './db.mjs';
import { sha256Hex, tokenFor } from '../functions/_link.ts';
import { todayIso } from '../src/lib/format.ts';
import * as DE from './lib/places-de.mjs';

const DRY_RUN = process.argv.includes('--dry-run');
const dir = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dir) throw new Error('usage: node scripts/import-intake.mjs intake/<country> [--dry-run]');

const PLACES = { de: { iso2: 'DE', timezone: 'Europe/Berlin', ...DE } };
const country = dir.replace(/[\\/]+$/, '').split(/[\\/]/).pop();
const P = PLACES[country];
if (!P) throw new Error(`no place tables for "${country}" — add scripts/lib/places-${country}.mjs`);

const SIGNING = secret('ADMIN_SIGNING_SECRET');
if (!SIGNING) throw new Error('ADMIN_SIGNING_SECRET is not set; organiser links cannot be minted.');

const KINDS = ['flohmarkt', 'hallenflohmarkt', 'nachtflohmarkt', 'kinderflohmarkt', 'troedelmarkt', 'brocante', 'antikmarkt', 'strassenmarkt'];
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const say = (...parts) => console.log(...parts);
const lower = (s) => (s ?? '').trim().toLowerCase();
const host = (url) => { try { return new URL(url).host.replace(/^www\./, ''); } catch { return null; } };

/* ---------------------------------------------------------------------------
 * read and validate
 * ------------------------------------------------------------------------- */

function readIntake() {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  const rows = [];
  const problems = [];
  const horizon = new Date(); horizon.setDate(horizon.getDate() + 120);
  const limit = horizon.toISOString().slice(0, 10);
  const today = todayIso();

  for (const file of files) {
    let m;
    try { m = JSON.parse(readFileSync(join(dir, file), 'utf8')); } catch (e) { problems.push(`${file}: not JSON (${e.message})`); continue; }
    const bad = (msg) => problems.push(`${file}: ${msg}`);

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(m.slug ?? '')) bad(`slug "${m.slug}" is not lower-case ASCII`);
    if (file !== `${m.slug}.json`) bad(`file name should be ${m.slug}.json`);
    if (!m.name) bad('name missing');
    if (!KINDS.includes(m.kind)) bad(`kind "${m.kind}" is not one of ${KINDS.join(', ')}`);
    if (!m.town) bad('town missing');
    if (!P.REGION_CODE[m.region]) bad(`region "${m.region}" is not a Bundesland name in places-de.mjs`);
    if (!m.venue?.address || !m.venue?.postal_code) bad('venue.address and venue.postal_code are required');
    if (typeof m.lat !== 'number' || typeof m.lng !== 'number') bad('lat/lng must be numbers');
    else if (m.lat < 47 || m.lat > 55.2 || m.lng < 5.8 || m.lng > 15.1) bad(`lat/lng ${m.lat},${m.lng} is not in Germany`);
    if (!m.rhythm?.de || !m.rhythm?.en) bad('rhythm.de and rhythm.en are required');
    if (m.opening?.start && !TIME.test(m.opening.start)) bad(`opening.start "${m.opening.start}"`);
    if (m.opening?.end && !TIME.test(m.opening.end)) bad(`opening.end "${m.opening.end}"`);
    if (!Array.isArray(m.dates)) bad('dates must be a list');
    else {
      for (const d of m.dates) if (!DATE.test(d)) bad(`date "${d}"`);
      const past = m.dates.filter((d) => d < today), far = m.dates.filter((d) => d > limit);
      if (past.length) bad(`${past.length} date(s) in the past`);
      if (far.length) bad(`${far.length} date(s) beyond 120 days (${limit}) — the horizon guardrail`);
    }
    if (!['listed', 'rhythm'].includes(m.dates_from)) bad(`dates_from must be "listed" or "rhythm"`);
    if (m.fee != null && (typeof m.fee !== 'number' || m.fee < 0)) bad('fee must be a number or null');
    if (m.currency && m.currency !== 'EUR') bad(`currency ${m.currency}`);
    if (!m.source_page || !/^https?:\/\//.test(m.source_page)) bad('source_page must be a URL');
    if (m.organiser?.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.organiser.email)) bad(`organiser.email "${m.organiser.email}"`);
    if (!DATE.test(m.checked ?? '')) bad('checked must be a date');
    if (m.description && (!m.description.de || !m.description.en)) bad('description needs de and en');
    rows.push({ file, ...m });
  }
  const slugs = rows.map((r) => r.slug);
  for (const s of slugs) if (slugs.indexOf(s) !== slugs.lastIndexOf(s)) problems.push(`slug "${s}" appears twice`);
  return { rows, problems };
}

/* ---------------------------------------------------------------------------
 * what is here already
 * ------------------------------------------------------------------------- */

async function readOurs() {
  const country = (await query(`select id from public.countries where iso2 = $1`, [P.iso2]))[0] ?? null;
  const regions = country ? await query(`select id, code from public.regions where country_id = $1`, [country.id]) : [];
  const cities = await query(`
    select c.id, c.region_id, t.value as name
      from public.cities c
      join public.texts t on t.entity_type = 'city' and t.entity_id = c.id and t.field = 'name' and t.locale = 'de'`);
  const venues = await query(`select id, city_id, name, postal_code from public.venues`);
  const organisers = await query(`select id, name, email, channel_type, channel_value from public.organisers`);
  const links = await query(`select organiser_id from public.organiser_links where revoked_at is null`);
  const markets = await query(`select slug from public.markets`);
  const slugs = await query(`select entity_type, slug from public.slugs where is_current`);
  return { country, regions, cities, venues, organisers, links, markets, slugs };
}

/* ---------------------------------------------------------------------------
 * decide
 * ------------------------------------------------------------------------- */

function decide(rows, ours) {
  const warnings = [];
  const have = new Set(ours.markets.map((m) => m.slug));
  const markets = rows.filter((m) => {
    if (have.has(m.slug)) { warnings.push(`${m.slug}: already here, skipped`); return false; }
    return true;
  });

  const newRegions = new Map();     // code → { code }
  const regionIds = new Map(ours.regions.map((r) => [r.code, r.id]));
  const cities = new Map();         // "code|town" → { code, name, existing, venues: Map }
  const takenCity = new Set(ours.slugs.filter((s) => s.entity_type === 'city').map((s) => s.slug));
  const takenRegion = new Set(ours.slugs.filter((s) => s.entity_type === 'region').map((s) => s.slug));

  for (const m of markets) {
    const code = P.REGION_CODE[m.region];
    if (!regionIds.has(code) && !newRegions.has(code)) {
      if (takenRegion.has(P.regionSlug(code))) warnings.push(`region slug "${P.regionSlug(code)}" is taken by another country's region — a hand decision is needed`);
      newRegions.set(code, { code });
    }
    const key = `${code}|${lower(m.town)}`;
    if (!cities.has(key)) {
      const existing = ours.cities.find((c) => lower(c.name) === lower(m.town) && (c.region_id === regionIds.get(code))) ?? null;
      if (!existing && takenCity.has(P.citySlug(m.town))) {
        warnings.push(`${m.slug}: town slug "${P.citySlug(m.town)}" is already published for another town — a hand decision is needed (docs/ARCHITECTURE.md §URLs)`);
      }
      cities.set(key, { code, name: m.town, existing, venues: new Map() });
    }
    const city = cities.get(key);
    const vkey = `${lower(m.venue.name ?? m.venue.address)}|${m.venue.postal_code}`;
    if (!city.venues.has(vkey)) {
      const existing = city.existing
        ? ours.venues.find((v) => v.city_id === city.existing.id && lower(v.name) === lower(m.venue.name ?? m.venue.address) && v.postal_code === m.venue.postal_code) ?? null
        : null;
      city.venues.set(vkey, { ...m.venue, lat: m.lat, lng: m.lng, existing });
    }
    m.cityKey = key; m.venueKey = vkey;
  }

  // --- organisers: by e-mail, then by website host, then by name ---
  const byEmail = new Map(ours.organisers.filter((o) => o.email).map((o) => [lower(o.email), o]));
  const byHost = new Map(ours.organisers.filter((o) => o.channel_type === 'website' && o.channel_value).map((o) => [host(o.channel_value), o]));
  const byName = new Map(ours.organisers.map((o) => [lower(o.name), o]));
  const linked = new Set(ours.links.map((l) => l.organiser_id));
  const organisers = new Map();
  for (const m of markets) {
    const o = m.organiser;
    if (!o?.name) { m.organiserKey = null; continue; }
    const email = lower(o.email) || null;
    const key = email ?? (o.website ? `host:${host(o.website)}` : `name:${lower(o.name)}`);
    m.organiserKey = key;
    if (organisers.has(key)) continue;
    const existing = (email && byEmail.get(email)) || (o.website && byHost.get(host(o.website))) || byName.get(lower(o.name)) || null;
    organisers.set(key, {
      name: o.name, email, website: o.website ?? null, existing,
      mint: !!email && !(existing && linked.has(existing.id)),
    });
  }

  return { markets, newRegions, cities, organisers, warnings };
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
        [type, id, field, JSON.stringify(value), opts.source_type ?? 'import', opts.source_ref ?? null, opts.observed_at ?? new Date(), opts.confidence ?? 'reported']);

    await run('begin');
    try {
      // --- the country ---
      let countryId = ours.country?.id;
      if (!countryId) {
        countryId = (await one(`insert into public.countries (iso2) values ($1) returning id`, [P.iso2])).id;
        for (const locale of P.LOCALES) {
          await slug('country', countryId, locale, P.COUNTRY[locale].toLowerCase());
          await text('country', countryId, locale, 'name', P.COUNTRY[locale]);
        }
      }

      // --- Bundesländer ---
      const regionIds = new Map(ours.regions.map((r) => [r.code, r.id]));
      for (const { code } of d.newRegions.values()) {
        const row = await one(`insert into public.regions (country_id, code) values ($1,$2) returning id`, [countryId, code]);
        regionIds.set(code, row.id);
        for (const locale of P.LOCALES) {
          await slug('region', row.id, locale, P.regionSlug(code));
          await text('region', row.id, locale, 'name', P.regionName(code, locale));
        }
      }

      // --- towns and venues ---
      const venueIds = new Map();
      for (const [key, city] of d.cities) {
        let cityId = city.existing?.id;
        if (!cityId) {
          const vs = [...city.venues.values()];
          const lat = vs.reduce((s, v) => s + v.lat, 0) / vs.length;
          const lng = vs.reduce((s, v) => s + v.lng, 0) / vs.length;
          cityId = (await one(
            `insert into public.cities (region_id, point)
             values ($1, extensions.st_setsrid(extensions.st_makepoint($2,$3),4326)::extensions.geography) returning id`,
            [regionIds.get(city.code), lng, lat])).id;
          for (const locale of P.LOCALES) {
            await slug('city', cityId, locale, P.citySlug(city.name));
            await text('city', cityId, locale, 'name', P.cityName(city.name, locale));
          }
        }
        for (const [vkey, v] of city.venues) {
          if (v.existing) { venueIds.set(`${key}|${vkey}`, v.existing.id); continue; }
          const nv = await one(
            `insert into public.venues (city_id, name, address_line, postal_code, point, timezone)
             values ($1,$2,$3,$4, extensions.st_setsrid(extensions.st_makepoint($5,$6),4326)::extensions.geography, $7) returning id`,
            [cityId, v.name ?? v.address, v.address, v.postal_code, v.lng, v.lat, P.timezone]);
          venueIds.set(`${key}|${vkey}`, nv.id);
          await text('venue', nv.id, 'de', 'name', v.name ?? v.address);
        }
      }

      // --- organisers and their links ---
      const organiserIds = new Map();
      let minted = 0;
      for (const [key, o] of d.organisers) {
        let id = o.existing?.id;
        if (!id) {
          id = (await one(
            `insert into public.organisers (name, channel_type, channel_value, email, locale) values ($1,$2,$3,$4,$5) returning id`,
            [o.name, o.email ? 'email' : o.website ? 'website' : 'unknown', o.email ?? o.website, o.email, o.email ? 'de' : null])).id;
        }
        organiserIds.set(key, id);
        if (o.mint) {
          const fresh = await one(`select gen_random_uuid() as id`);
          const token = await tokenFor(SIGNING, fresh.id);
          await run(`insert into public.organiser_links (id, organiser_id, token_hash) values ($1, $2, $3)`, [fresh.id, id, await sha256Hex(token)]);
          minted += 1;
        }
      }

      // --- markets ---
      let occurrences = 0;
      for (const m of d.markets) {
        const checked = new Date(`${m.checked}T12:00:00Z`);
        const row = await one(
          `insert into public.markets
             (venue_id, organiser_id, slug, status, kind, recurrence_text, entry_fee, currency, website_url, verified_by, verified_at)
           values ($1,$2,$3,'unverified',$4,$5,$6,$7,$8,'team',$9) returning id`,
          [venueIds.get(`${m.cityKey}|${m.venueKey}`), m.organiserKey ? organiserIds.get(m.organiserKey) : null,
            m.slug, m.kind, m.rhythm.de, m.fee ?? null, m.fee == null ? null : 'EUR', m.website ?? m.organiser?.website ?? null, checked]);

        const { file, cityKey, venueKey, organiserKey, ...raw } = m;
        await run(
          `insert into public.market_private (market_id, organiser_email, source_url, admin_notes, raw_import) values ($1,$2,$3,$4,$5::jsonb)`,
          [row.id, m.organiser?.email ?? null, m.source_page,
            [...(m.facts ?? []), m.notes ? `note: ${m.notes}` : null].filter(Boolean).join('\n') || null, JSON.stringify(raw)]);

        for (const locale of P.LOCALES) {
          await slug('market', row.id, locale, m.slug);
          await text('market', row.id, locale, 'name', m.name);
          await text('market', row.id, locale, 'recurrence_text', m.rhythm[locale]);
          if (m.description) await text('market', row.id, locale, 'description', m.description[locale]);
        }
        await fact('market', row.id, 'listing', { slug: m.slug, researched_from: 'organiser site' }, {
          source_type: 'website_crawl', source_ref: m.source_page, observed_at: checked, confidence: 'reported',
        });

        const listed = m.dates_from === 'listed';
        for (const date of m.dates) {
          const occ = await one(
            `insert into public.occurrences (market_id, date, start_time, end_time, status, origin, confirmed_at)
             values ($1,$2,$3,$4,$5,'import',$6) returning id`,
            [row.id, date, m.opening?.start ?? null, m.opening?.end ?? null, listed ? 'confirmed' : 'unverified', listed ? checked : null]);
          occurrences += 1;
          if (listed) {
            await fact('occurrence', occ.id, 'date', date, { source_type: 'website_crawl', source_ref: m.source_page, observed_at: checked, confidence: 'confirmed' });
          }
        }
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
 * main
 * ------------------------------------------------------------------------- */

const { rows, problems } = readIntake();
say(`${rows.length} file(s) in ${dir}`);
if (problems.length) {
  say(`\n${problems.length} problem(s) — nothing is written until every file is clean:`);
  for (const p of problems) say(`  - ${p}`);
  process.exit(1);
}

const ours = await readOurs();
const d = decide(rows, ours);

say(`\n${d.markets.length} new market(s):`);
for (const m of d.markets) {
  say(`  ${m.slug}  ·  ${m.town} (${P.REGION_CODE[m.region]})  ·  ${m.dates.length} date(s) ${m.dates_from}  ·  ${m.organiser?.email ? 'organiser e-mail' : m.organiser?.name ? 'organiser, no e-mail' : 'no organiser'}${m.description ? '' : '  ·  no description yet'}`);
}
say(`\ncountry: ${ours.country ? 'exists' : `new (${P.iso2})`}`);
say(`regions: ${d.newRegions.size} new (${[...d.newRegions.keys()].join(', ') || '—'})`);
say(`towns: ${[...d.cities.values()].filter((c) => !c.existing).length} new, ${[...d.cities.values()].filter((c) => c.existing).length} reused`);
say(`venues: ${[...d.cities.values()].flatMap((c) => [...c.venues.values()]).filter((v) => !v.existing).length} new`);
say(`organisers: ${[...d.organisers.values()].filter((o) => !o.existing).length} new, ${[...d.organisers.values()].filter((o) => o.existing).length} reused, ${[...d.organisers.values()].filter((o) => o.mint).length} link(s) to mint`);
if (d.warnings.length) { say(`\nwarnings:`); for (const w of d.warnings) say(`  - ${w}`); }

if (DRY_RUN) { say('\n--dry-run: nothing written.'); process.exit(0); }
if (d.warnings.some((w) => w.includes('hand decision'))) { say('\nA slug collision needs a hand decision first. Nothing written.'); process.exit(1); }
if (!d.markets.length) { say('\nNothing to do.'); process.exit(0); }

const result = await write(d, ours);
say(`\nWritten: ${result.markets} market(s), ${result.occurrences} occurrence(s), ${result.minted} organiser link(s). All as status = unverified — not built until flipped to active.`);
process.exit(0);
