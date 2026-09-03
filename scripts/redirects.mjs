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
import { LOCALE } from '../src/lib/i18n.ts';

/**
 * Retired slugs, with the slug that replaced them, for entities that still have
 * a page. `publishable_markets` is the same view the site builds from, so the
 * two cannot disagree about which places exist.
 */
const RETIRED = `
  select s.entity_type, s.entity_id, s.locale, s.slug as was, cur.slug as now
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

const COUNTRY_NOW = `
  select locale, slug from public.slugs
   where entity_type = 'country' and is_current
`;

/**
 * @returns {Promise<{from: string, to: string}[]>} in `_redirects` order —
 * exact paths first, wildcards last, because Cloudflare takes the first match.
 */
export async function buildRedirects() {
  return withClient(DB_URL, async (client) => {
    const rows = async (sql) => (await client.query(sql)).rows;

    const countryNow = new Map((await rows(COUNTRY_NOW)).map((r) => [r.locale, r.slug]));
    const retired = await rows(RETIRED);

    const exact = [];
    const wildcard = [];

    for (const r of retired) {
      const { locale, was, now } = r;
      const country = countryNow.get(locale);
      const segments = LOCALE[locale]?.segments;
      if (!segments || !country) continue;

      if (r.entity_type === 'city') {
        exact.push({ from: `/${locale}/${country}/${was}/`, to: `/${locale}/${country}/${now}/` });
      } else if (r.entity_type === 'region') {
        const seg = segments.region;
        exact.push({
          from: `/${locale}/${country}/${seg}/${was}/`,
          to: `/${locale}/${country}/${seg}/${now}/`,
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
