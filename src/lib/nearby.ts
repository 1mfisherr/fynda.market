/**
 * The other markets on a market's next date, close by — "Also today, nearby"
 * on the market page. The page used to be a dead end: someone who had decided
 * on Bürkliplatz had nowhere to go from it but Google Maps.
 *
 * No new URL, no new page: a block on a page that already exists, absent when
 * nothing qualifies. Straight-line distance, said so on the page; closest
 * first, because the reader is standing at this market. Each result carries
 * that day's own occurrence as `next`, so its row shows that day's times.
 */
import type { Market, Occurrence } from './types';
import { distanceKm } from './geo.ts';

export const NEARBY_KM = 15;
export const NEARBY_MAX = 3;

export function sameDayNearby(market: Market, all: Market[]): { market: Market; km: number }[] {
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
