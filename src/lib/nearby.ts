/**
 * What else is on close by — the block under a market page's buttons. The page
 * used to be a dead end: someone who had decided on Bürkliplatz had nowhere to
 * go from it but Google Maps, and someone who landed on a market between
 * editions had nowhere to go at all.
 *
 * Two questions, one per kind of page, and the page asks whichever is its own:
 *
 *   sameDayNearby    a market with a date: the others on that day, within
 *                    15 km, closest first — the reader is standing here.
 *                    "Also today, nearby".
 *   meanwhileNearby  a market with no date: the soonest markets that have one,
 *                    within 25 km — the reader came for a market that is not
 *                    on. "Meanwhile, nearby" (PAGES.md, 2026-10-10).
 *
 * No new URL, no new page: a block on a page that already exists, absent when
 * nothing qualifies. Straight-line distance. Each result carries the one
 * occurrence its row is about as `next`, so the row shows that day's times.
 */
import type { Market, Occurrence } from './types';
import { distanceKm } from './geo.ts';
import { datedRows, soonestAround, type Nearby } from './lists.ts';

export const NEARBY_KM = 15;
export const NEARBY_MAX = 3;

export function sameDayNearby(market: Market, all: Market[]): Nearby[] {
  const day = market.next;
  if (!day || day.status === 'cancelled') return [];
  return all
    .filter((m) => m.id !== market.id)
    .map((m) => ({ m, on: [m.next, ...m.upcoming].find((o): o is Occurrence => o?.date === day.date && o.status !== 'cancelled') }))
    .filter((x): x is { m: Market; on: Occurrence } => Boolean(x.on))
    .map(({ m, on }) => ({ market: { ...m, next: on }, km: distanceKm(market.lat, market.lng, m.lat, m.lng) }))
    .filter((x) => x.km <= NEARBY_KM)
    .sort((a, b) => a.km - b.km)
    .slice(0, NEARBY_MAX);
}

/** Only dates that are going ahead: a cancelled one is no answer to "what can I go to instead". */
export function meanwhileNearby(market: Market, all: Market[]): Nearby[] {
  if (market.next) return [];
  const rows = datedRows(all.filter((m) => m.id !== market.id)).filter((row) => row.next.status !== 'cancelled');
  return soonestAround(market.lat, market.lng, rows, NEARBY_MAX);
}
