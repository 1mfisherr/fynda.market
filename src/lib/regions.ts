/**
 * The cantons a person can subscribe to.
 *
 * Fourteen of them, against fifty-five cities, and that is the point: a
 * subscription list cut into fifty-five pieces is fifty-five segments too
 * small to learn anything from, and most of them empty for a long time. A
 * canton is also roughly how far somebody will drive on a Saturday, so
 * "markets in Aargau" is closer to what a person actually wants than "markets
 * in Aarau" — it catches the neighbouring town they would have gone to anyway.
 *
 * Derived from the markets rather than from the regions table, for the same
 * reason a canton earns a page: a canton with nothing in it is not somewhere
 * you can subscribe to.
 */

import { getMarkets } from './markets.ts';
import { t } from './strings.ts';
import type { Locale } from './i18n.ts';

export interface RegionOption {
  /** The URL segment, the same in every language. What the form posts. */
  slug: string;
  /** The canton's own name — "Zürich", "Genève". */
  name: string;
  /** "Kanton Zürich", in this locale. What a person reads. */
  label: string;
  /** How many markets it holds. Orders the list. */
  markets: number;
}

/*
 * One query per locale for the whole build rather than one per page. Astro
 * builds in a single process, so the module lives as long as the build does;
 * without this the picker would cost 944 round trips to Supabase.
 */
const cache = new Map<Locale, RegionOption[]>();

export async function regionOptions(locale: Locale): Promise<RegionOption[]> {
  const held = cache.get(locale);
  if (held) return held;

  const s = t(locale);
  const counted = new Map<string, RegionOption>();

  for (const market of await getMarkets(locale)) {
    const held = counted.get(market.regionSlug);
    if (held) { held.markets += 1; continue; }
    counted.set(market.regionSlug, {
      slug: market.regionSlug,
      name: market.region,
      label: s.regionLabel(market.region),
      markets: 1,
    });
  }

  /* Most markets first. A picker in alphabetical order puts Aargau above
     Zürich, and Zürich is where most of the people are. */
  const list = [...counted.values()].sort((a, b) => b.markets - a.markets || a.name.localeCompare(b.name));
  cache.set(locale, list);
  return list;
}
