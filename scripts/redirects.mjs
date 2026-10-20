/**
 * Every address Fynda has ever published, pointed at the address it has now.
 *
 * A slug row is never deleted — when a place is renamed, a translation is
 * corrected or a commune merges, the old row is marked `is_current = false` and
 * stays there forever (see the slug_ledger migration). This turns those rows
 * into 301s, which is the whole reason they are kept: a link someone shared, a
 * result Google already holds, keeps working.
 *
 * Cloudflare Pages reads `_redirects` natively, so there is no Worker and no
 * runtime lookup — the file is static build output like everything else.
 *
 * Only entities with a published page produce a line. A city whose last market
 * closed has no page to point at, and a redirect to a 404 is worse than a 404.
 */

import { withClient, DB_URL } from './db.mjs';
import { COUNTRY, LOCALE, regionSegment } from '../src/lib/i18n.ts';

/**
 * Retired slugs, with the slug that replaced them, for entities that still have
 * a page. `publishable_markets` is the same view the site builds from, so the
 * two cannot disagree about which places exist.
 */
const RETIRED = `
  select s.entity_type, s.entity_id, s.locale, s.slug as was, cur.slug as now,
         case s.entity_type
           when 'country' then s.entity_id
           when 'region'  then (select r.country_id from public.regions r where r.id = s.entity_id)
           when 'city'    then (select r.country_id from public.regions r
                                  join public.cities c on c.region_id = r.id where c.id = s.entity_id)
           when 'market'  then (select r.country_id from public.regions r
                                  join public.cities c on c.region_id = r.id
                                  join public.venues v on v.city_id = c.id
                                  join public.markets m on m.venue_id = v.id where m.id = s.entity_id)
         end                                          as country_id
    from public.slugs s
    join public.slugs cur
      on cur.entity_type = s.entity_type and cur.entity_id = s.entity_id
     and cur.locale = s.locale and cur.is_current
   where not s.is_current
     and exists (
       select 1 from public.publishable_markets p
        where (s.entity_type = 'city' and p.city_id = s.entity_id)
           or (s.entity_type = 'region' and p.region_id = s.entity_id)
           or (s.entity_type = 'country' and p.country_id = s.entity_id)
           or (s.entity_type = 'market' and p.id = s.entity_id)
     )
   order by s.entity_type, s.locale, s.slug
`;

/* Keyed by country as well as locale: `/de/` now carries both `schweiz` and
   `deutschland`, and a Swiss redirect that picked up Germany's slug would send
   a live Swiss address into a 404. */
const COUNTRY_NOW = `
  select entity_id as country_id, locale, slug from public.slugs
   where entity_type = 'country' and is_current
`;

const ISO2 = `select id, iso2 from public.countries`;

/**
 * Markets that have ended for good, and where their addresses go now.
 *
 * `permanently_closed` takes a market off the site, and without this its page
 * would simply vanish — every shared link and every Google result with it.
 * Instead each of its addresses, current and retired, in every language it
 * had, points at its town's page: someone looking for a market there finds
 * the ones that are still on. If the town has no market left, its page is gone
 * too, and the address goes to the home page in the same language — never to
 * a region page, which the content floor may have withheld.
 *
 * A closed market whose hub is live was merged into it, not ended (2026-10-20,
 * Plainpalais and Rumine: one market per weekday folded into one), and its
 * addresses go to the hub's page instead.
 *
 * The first case (2026-09-27): a vide-grenier in Lausanne that was a one-off
 * inside the city's Caravane des quartiers. Markets that were imported already
 * closed and never had a page get lines too; a redirect nobody follows costs
 * nothing, a 404 on an address someone did follow costs a visitor.
 */
const ENDED = `
  select s.locale, s.slug as was, r.country_id, ci.id as city_id,
         (select cs.slug from public.slugs cs
           where cs.entity_type = 'city' and cs.entity_id = ci.id
             and cs.locale = s.locale and cs.is_current)           as city,
         exists (select 1 from public.publishable_cities pc
                  where pc.city_id = ci.id)                         as city_live,
         (select hs.slug from public.publishable_markets hp
            join public.slugs hs on hs.entity_type = 'market' and hs.entity_id = hp.id
                                and hs.locale = s.locale and hs.is_current
           where hp.id = m.hub_market_id)                            as hub
    from public.markets m
    join public.venues v   on v.id = m.venue_id
    join public.cities ci  on ci.id = v.city_id
    join public.regions r  on r.id = ci.region_id
    join public.slugs s    on s.entity_type = 'market' and s.entity_id = m.id
   where m.status = 'permanently_closed'
   order by s.locale, s.slug
`;

/**
 * Towns of one market, whose town page is no longer built (2026-10-20).
 *
 * Each repeated its only market's page, and the two traded the same query
 * between them for weeks; Google's doorway rule names "pages targeted at
 * specific regions or cities that funnel users to one page". So the market's
 * page is the town's page, and the town's address — published for six weeks,
 * in Google's index and people's bookmarks — 301s to it. `publishable_cities`
 * counts what the site builds from, so this cannot disagree with the pages;
 * the moment a second market goes live, the row leaves this query and the
 * town page is built again. Current slugs in both tables: a retired town slug
 * is in RETIRED and resolved through `lone` there.
 */
const LONE = `
  select pc.city_id, cs.locale, cs.slug as city, ms.slug as market, r.country_id
    from public.publishable_cities pc
    join public.publishable_markets pm on pm.city_id = pc.city_id
    join public.regions r on r.id = pc.region_id
    join public.slugs cs on cs.entity_type = 'city' and cs.entity_id = pc.city_id and cs.is_current
    join public.slugs ms on ms.entity_type = 'market' and ms.entity_id = pm.id and ms.is_current
                        and ms.locale = cs.locale
   where pc.market_count = 1
   order by cs.locale, cs.slug
`;

/**
 * Cantons and Bundesländer of one market (2026-10-20: Jura, Obwalden, Uri) —
 * the same rule as LONE one level up: no page of their own, the address 301s
 * to the market. City-states are skipped below: they never had a region page,
 * and their old one is the city-state line in buildRedirects.
 */
const LONE_REGION = `
  select pr.region_id, rs.locale, rs.slug as region, ms.slug as market, pr.country_id
    from public.publishable_regions pr
    join public.publishable_markets pm on pm.region_id = pr.region_id
    join public.slugs rs on rs.entity_type = 'region' and rs.entity_id = pr.region_id and rs.is_current
    join public.slugs ms on ms.entity_type = 'market' and ms.entity_id = pm.id and ms.is_current
                        and ms.locale = rs.locale
   where pr.market_count = 1
   order by rs.locale, rs.slug
`;

/**
 * Pages we have moved by hand, as opposed to places renamed in the database.
 *
 * The slug ledger only knows about entities. `/umkreis/` was a page of our own
 * making — one unprefixed radius view — and it was published, so the rule is
 * the same: a published address never dies. It now lives at `/de/umkreis/`
 * with a sister in each of the other three languages.
 */
const MOVED = [{ from: '/umkreis/', to: '/de/umkreis/' }];

/**
 * @returns {Promise<{from: string, to: string}[]>} in `_redirects` order —
 * exact paths first, wildcards last, because Cloudflare takes the first match.
 */
export async function buildRedirects() {
  return withClient(DB_URL, async (client) => {
    const rows = async (sql) => (await client.query(sql)).rows;

    const countryNow = new Map((await rows(COUNTRY_NOW)).map((r) => [`${r.country_id}|${r.locale}`, r.slug]));
    const iso2 = new Map((await rows(ISO2)).map((r) => [r.id, r.iso2]));
    const retired = await rows(RETIRED);

    const exact = [...MOVED];

    /* Where a town's address lands: its page, or its only market's page. Every
       line below that points at a town asks this, so a closed market's address
       or a town's retired slug never lands on a second redirect — Cloudflare
       follows none. */
    const lone = new Map();
    const loneBySlug = new Map();
    for (const r of await rows(LONE)) {
      const segments = LOCALE[r.locale]?.segments;
      const country = countryNow.get(`${r.country_id}|${r.locale}`);
      // Only the locales the country publishes in: a German town has no French address to move.
      if (!segments || !country || !COUNTRY[iso2.get(r.country_id)]?.locales.includes(r.locale)) continue;
      const to = `/${r.locale}/${segments.market}/${r.market}/`;
      lone.set(`${r.city_id}|${r.locale}`, to);
      loneBySlug.set(`${r.country_id}|${r.locale}|${r.city}`, to);
      exact.push({ from: `/${r.locale}/${country}/${r.city}/`, to });
    }
    const townPage = (cityId, locale, country, slug) => lone.get(`${cityId}|${locale}`) ?? `/${locale}/${country}/${slug}/`;

    const loneRegion = new Map();
    for (const r of await rows(LONE_REGION)) {
      const segments = LOCALE[r.locale]?.segments;
      const country = countryNow.get(`${r.country_id}|${r.locale}`);
      const code = iso2.get(r.country_id);
      if (!segments || !country || !COUNTRY[code]?.locales.includes(r.locale)) continue;
      if ((COUNTRY[code].cityStates ?? []).includes(r.region)) continue;
      const to = `/${r.locale}/${segments.market}/${r.market}/`;
      loneRegion.set(`${r.region_id}|${r.locale}`, to);
      exact.push({ from: `/${r.locale}/${country}/${regionSegment(r.locale, code)}/${r.region}/`, to });
    }
    const regionPage = (regionId, locale, country, code, slug) =>
      loneRegion.get(`${regionId}|${locale}`) ?? `/${locale}/${country}/${regionSegment(locale, code)}/${slug}/`;

    /* A city-state's region page was published for one night (2026-09-22)
       before it was folded into its town page, and a published address never
       dies. Its words come from the country, so a new city-state needs no line
       here — only its slug in src/lib/i18n.ts. */
    for (const [countryId, code] of iso2) {
      for (const slug of COUNTRY[code]?.cityStates ?? []) {
        for (const locale of COUNTRY[code].locales) {
          const country = countryNow.get(`${countryId}|${locale}`);
          if (!country) continue;
          exact.push({
            from: `/${locale}/${country}/${regionSegment(locale, code)}/${slug}/`,
            // Bremen has one market, so its town page is that market's page (2026-10-20).
            to: loneBySlug.get(`${countryId}|${locale}|${slug}`) ?? `/${locale}/${country}/${slug}/`,
          });
        }
      }
    }
    for (const r of await rows(ENDED)) {
      const country = countryNow.get(`${r.country_id}|${r.locale}`);
      const segments = LOCALE[r.locale]?.segments;
      if (!segments || !country) continue;
      exact.push({
        from: `/${r.locale}/${segments.market}/${r.was}/`,
        /* Closed with a live hub is merged, not ended: the address goes to the
           market that holds its dates now (Plainpalais, Rumine — 2026-10-20). */
        to: r.hub
          ? `/${r.locale}/${segments.market}/${r.hub}/`
          : r.city_live && r.city ? townPage(r.city_id, r.locale, country, r.city) : `/${r.locale}/`,
      });
    }

    const wildcard = [];

    for (const r of retired) {
      const { locale, was, now } = r;
      const country = countryNow.get(`${r.country_id}|${locale}`);
      const code = iso2.get(r.country_id);
      const segments = LOCALE[locale]?.segments;
      if (!segments || !country || !code) continue;

      if (r.entity_type === 'city') {
        exact.push({ from: `/${locale}/${country}/${was}/`, to: townPage(r.entity_id, locale, country, now) });
      } else if (r.entity_type === 'region') {
        const seg = regionSegment(locale, code);
        exact.push({
          from: `/${locale}/${country}/${seg}/${was}/`,
          to: regionPage(r.entity_id, locale, country, code, now),
        });
      } else if (r.entity_type === 'market') {
        const seg = segments.market;
        exact.push({ from: `/${locale}/${seg}/${was}/`, to: `/${locale}/${seg}/${now}/` });
      } else if (r.entity_type === 'country') {
        // A country segment sits above the cities and cantons, so renaming it
        // moves every page beneath it too. One splat covers the subtree; the
        // exact line covers the country page itself.
        exact.push({ from: `/${locale}/${was}/`, to: `/${locale}/${now}/` });
        wildcard.push({ from: `/${locale}/${was}/*`, to: `/${locale}/${now}/:splat` });
      }
    }

    return [...exact, ...wildcard];
  });
}
