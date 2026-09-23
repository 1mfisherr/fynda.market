/**
 * Every town the site covers, as the town search needs it.
 *
 * Built once per page from the markets already in hand, so it can never list a
 * town without a page or miss one that has. The point is the average of the
 * town's market venues — good enough to measure "25 km from Zürich" from, and
 * it needs no extra query.
 */
import { cityPath, countryName, type Locale } from './i18n';
import type { Market } from './types';

export interface TownEntry {
  slug: string;
  name: string;
  href: string;
  region: string;
  country: string;
  n: number;
  lat: number;
  lng: number;
}

export function townIndex(locale: Locale, markets: Market[]): TownEntry[] {
  const by = new Map<string, Market[]>();
  for (const m of markets) by.set(m.citySlug, [...(by.get(m.citySlug) ?? []), m]);
  return [...by.values()]
    .map((mine) => {
      const m = mine[0];
      return {
        slug: m.citySlug,
        name: m.city,
        href: cityPath(locale, m.countrySlug, m.citySlug),
        region: m.region,
        country: countryName(locale, m.countryCode),
        n: mine.length,
        lat: +(mine.reduce((s, x) => s + x.lat, 0) / mine.length).toFixed(4),
        lng: +(mine.reduce((s, x) => s + x.lng, 0) / mine.length).toFixed(4),
      };
    })
    .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, locale));
}
