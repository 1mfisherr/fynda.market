#!/usr/bin/env node
/**
 * Which pages the watcher reads: every page we already know says something
 * about a market's dates.
 *
 *   node scripts/watch/sources.mjs            report what would be added
 *   node scripts/watch/sources.mjs --apply    add it (never removes or changes a source)
 *   --country DE (default: every country but CH, which v1 watches — Delfim, 2026-10-09)
 *
 * Per active market: its website, the page in market_private.source_url, and
 * every page a fact about it or its dates was read from (facts.source_type =
 * 'website_crawl'). Facebook and Instagram are recorded as `social` and never
 * fetched — the organiser mail covers those markets.
 */

import { query, withClient, DB_URL } from '../db.mjs';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const COUNTRY = args.includes('--country') ? args[args.indexOf('--country') + 1].toUpperCase() : null;

const SOCIAL = /(^|\.)(facebook|fb|instagram|tiktok|x|twitter)\.com$/i;
/**
 * Listing sites, city guides, tourism boards and encyclopedias: they may tell us
 * a market exists, never its dates (intake/README.md). The first live run put
 * marktcom.de's 2027 Erfurt dates before Delfim as if they were the organiser's
 * (2026-10-09). Such a page is recorded, inactive, so it is never read again.
 */
export const LISTING = /(^|\.)(marktcom\.de|meine-flohmarkt-termine\.de|krencky24\.de|flohmarkt-termine\.net|flohmarktnavi\.de|meinestadt\.de|oldthing\.de|visitberlin\.de|berlin-flohmaerkte\.de|inberlin\.de|top10berlin\.de|frankfurt-inklusiv\.de|visit-hannover\.com|visit\.kassel\.de|wikipedia\.org|in-muenchen\.de|koeln\.de|guidle\.com|myswitzerland\.com|loisirs\.ch|swiss-markt\.ch)$/i;

/** One spelling per page: no fragment, no tracking, lower-case host. */
export function normaliseUrl(raw) {
  try {
    const u = new URL(String(raw).trim());
    if (!/^https?:$/.test(u.protocol)) return null;
    u.hash = '';
    u.host = u.host.toLowerCase();
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|gclid|_ga|_gl)/i.test(k)) u.searchParams.delete(k);
    return u.href;
  } catch {
    return null;
  }
}

const rows = await query(`
  with scope as (
    select m.id, m.slug, m.website_url, mp.source_url
      from public.markets m
      join public.venues v on v.id = m.venue_id
      join public.cities c on c.id = v.city_id
      join public.regions r on r.id = c.region_id
      join public.countries k on k.id = r.country_id
      left join public.market_private mp on mp.market_id = m.id
     where m.status = 'active' and (($1::text is null and k.iso2 <> 'CH') or k.iso2 = $1)
  )
  select s.id as market_id, s.slug, 'website' as via, s.website_url as url from scope s where s.website_url is not null
  union
  select s.id, s.slug, 'private', s.source_url from scope s where s.source_url is not null
  union
  select s.id, s.slug, 'facts', f.source_ref
    from scope s join public.facts f on f.entity_type = 'market' and f.entity_id = s.id
   where f.source_type = 'website_crawl' and f.source_ref ~ '^https?://'
  union
  select s.id, s.slug, 'facts', f.source_ref
    from scope s join public.occurrences o on o.market_id = s.id
    join public.facts f on f.entity_type = 'occurrence' and f.entity_id = o.id
   where f.source_type = 'website_crawl' and f.source_ref ~ '^https?://' and o.date >= current_date`, [COUNTRY]);

const links = new Map(); // url → Map(market_id → via)
for (const r of rows) {
  const url = normaliseUrl(r.url);
  if (!url) continue;
  const m = links.get(url) ?? new Map();
  if (!m.has(r.market_id)) m.set(r.market_id, r.via);
  links.set(url, m);
}

const existing = new Set((await query(`select url from public.watch_sources`)).map((r) => r.url));
const fresh = [...links.keys()].filter((u) => !existing.has(u));
const markets = new Set(rows.map((r) => r.market_id));
const social = [...links.keys()].filter((u) => SOCIAL.test(new URL(u).host.replace(/^www\./, '')));

console.log(`${markets.size} markets, ${links.size} distinct pages (${social.length} social, never fetched); ${fresh.length} new.`);
if (!APPLY) { console.log('Dry run. Add --apply to write.'); process.exit(0); }

await withClient(DB_URL, async (c) => {
  await c.query('begin');
  for (const [url, ms] of links) {
    const host = new URL(url).host.replace(/^www\./, '');
    const access = SOCIAL.test(host) ? 'social' : 'fetch';
    const listing = LISTING.test(host);
    const kind = /\.pdf($|\?)/i.test(url) ? 'pdf' : /\.ics($|\?)/i.test(url) ? 'ics' : 'page';
    const { rows: [src] } = await c.query(
      `insert into public.watch_sources (url, kind, access, active, notes) values ($1, $2, $3, $4, $5)
       on conflict (url) do update set url = excluded.url returning id`,
      [url, kind, access, !listing, listing ? 'a listing site — never a source of dates (intake/README.md)' : null]);
    for (const [marketId, via] of ms) {
      await c.query(`insert into public.watch_source_markets (source_id, market_id, via) values ($1, $2, $3) on conflict do nothing`, [src.id, marketId, via]);
    }
  }
  await c.query('commit');
});
console.log('Written.');
process.exit(0);
