/**
 * The facts line under a bigger town's answer sentence — "2 every week · 5 for
 * children · 6 indoors" (Delfim, 2026-10-12). Counted from what each market
 * holds, so every town's line is its own; a town paragraph written once for
 * all of them is the templated text the spam update punished (PAGES.md §City).
 */
import type { Market } from './types';

export type TownFact = 'weekly' | 'kids' | 'indoor' | 'night' | 'antiques' | 'records';

/** Below this many markets the list is short enough to read whole. */
export const TOWN_FACTS_FROM = 4;
const MAX_FACTS = 3;

/** Monday-based week number of an ISO day, for "a different week each time". */
const weekOf = (iso: string) => Math.floor((Date.parse(`${iso}T12:00:00Z`) / 86_400_000 + 3) / 7);

/**
 * Weekly means a date in each of the next three weeks, read off the dates
 * themselves — the rhythm line is the organiser's prose. A four-day fair is
 * one week, a fortnightly market two; a weekly one that skips a holiday
 * week is not counted, which undersells rather than promises. Three, not
 * four: Bürkliplatz, every Saturday to the end of October, read as not weekly
 * on 12 October beside its own "Every Saturday".
 */
export function runsWeekly(market: Market, today: string): boolean {
  const until = new Date(Date.parse(`${today}T12:00:00Z`) + 20 * 86_400_000).toISOString().slice(0, 10);
  const weeks = new Set(
    [market.next, ...market.upcoming]
      .filter((o) => o && o.status !== 'cancelled' && o.date >= today && o.date <= until)
      .map((o) => weekOf(o!.date))
  );
  return weeks.size >= 3;
}

const TESTS: [TownFact, (m: Market, today: string) => boolean][] = [
  ['weekly', runsWeekly],
  ['kids', (m) => m.kind === 'kinderflohmarkt' || !!m.tags?.includes('kids')],
  ['indoor', (m) => m.setting === 'indoor'],
  ['night', (m) => m.kind === 'nachtflohmarkt'],
  ['antiques', (m) => m.kind === 'antikmarkt' || !!m.tags?.includes('antiques')],
  ['records', (m) => !!m.tags?.includes('records_books')],
];

/** At most three facts, in a fixed order, each held by at least one market. None below four markets. */
export function townFacts(markets: Market[], today: string): { fact: TownFact; n: number }[] {
  if (markets.length < TOWN_FACTS_FROM) return [];
  return TESTS.map(([fact, holds]) => ({ fact, n: markets.filter((m) => holds(m, today)).length }))
    .filter(({ n }) => n > 0)
    .slice(0, MAX_FACTS);
}
