/**
 * How a list of markets is shaped for a page.
 *
 * The rule these all serve, decided 2026-09-04: **a list shows one row per
 * market, or one row per date, and it has to be the right one.**
 *
 * Before this, every list was one row per date over the full 120-day horizon.
 * On the home page that was 451 rows for 108 markets — Marché de Rumine
 * appeared seventy times on one page — and on the Zürich page 61 rows for 14
 * markets under a heading that said "17 Flohmärkte". A weekly market repeated
 * itself until the page was mostly itself.
 *
 * It is the same instinct that killed fleafind.ch one layer down: that site
 * minted a URL per date, this one merely rendered one. The cure is the same —
 * a row exists because it says something new.
 *
 * So: dates are shown where a date is the question (a weekend has no
 * repetition in it), and markets are shown where the market is the question
 * ("what is there in Zürich"), carrying `recurrenceText` to say how often it
 * runs. Nothing is hidden either way: "Jeden Samstag, ganzjährig" tells a
 * visitor more than eighteen identical Saturdays did.
 */
import type { Market, Occurrence } from './types';
import { iso, weekendBounds } from './date-window';
import { withinHorizon } from './markets';

/** A market paired with the one occurrence a row is about. */
export type Dated = Market & { next: Occurrence };

/** Every occurrence inside the horizon, as one row each. The date view. */
export function datedRows(markets: Market[]): Dated[] {
  return markets.flatMap((market) =>
    withinHorizon([market.next, ...market.upcoming].filter(Boolean) as Occurrence[])
      .map((next) => ({ ...market, next }))
  );
}

/** Rows grouped by day, earliest first. Internal: only weekendDays needs it. */
function byDay(rows: Dated[]): Dated[][] {
  const days = new Map<string, Dated[]>();
  for (const row of rows) {
    const list = days.get(row.next.date) ?? [];
    list.push(row);
    days.set(row.next.date, list);
  }
  return [...days.values()].sort((a, b) => a[0].next.date.localeCompare(b[0].next.date));
}

/**
 * One row per market, soonest first — the market view.
 *
 * The row carries the market's *next* date, which is also the date it filters
 * on — so the date a visitor is shown and the date the chips matched can never
 * disagree.
 */
export function byMarket(rows: Dated[]): Dated[] {
  const first = new Map<string, Dated>();
  for (const row of rows) {
    const held = first.get(row.slug);
    if (!held || row.next.date < held.next.date) first.set(row.slug, row);
  }
  return [...first.values()].sort(
    (a, b) =>
      a.next.date.localeCompare(b.next.date) ||
      (a.next.startTime ?? '').localeCompare(b.next.startTime ?? '')
  );
}

/**
 * How many dates a market has inside the horizon.
 *
 * A market row stands for all of them, so anything that used to count rows —
 * the saved page's "3 gemerkt, 41 kommende Termine" — has to count these
 * instead, or it would report one date per market and be wrong.
 */
export function countDates(market: Market): number {
  return withinHorizon([market.next, ...market.upcoming].filter(Boolean) as Occurrence[]).length;
}

/**
 * The coming weekend, as day groups. Internal — weekendLead is the door.
 *
 * On a Sunday that is yesterday and today, not next week — someone looking on
 * Sunday morning wants today's markets. `weekendBounds` owns that rule; this
 * only selects against it, and drops a Saturday that has already passed.
 */
function weekendDays(rows: Dated[], now = new Date()): Dated[][] {
  const { start, end } = weekendBounds(now);
  const today = iso(now);
  return byDay(rows.filter((row) => row.next.date >= start && row.next.date <= end && row.next.date >= today));
}

/**
 * What the home page shows of the coming weekend.
 *
 * `count` markets, at most one per town, biggest towns first — then the total
 * so the page can say how many it is not showing. A nationwide list helps
 * nobody in particular: sorted by clock time it interleaved 22 towns at
 * random. One per town reads as a country instead of as one city's diary, and
 * the picker under it is the way out.
 */
export function weekendLead(
  rows: Dated[],
  count = 6,
  now = new Date()
): { lead: Dated[]; rest: Dated[]; more: Dated[]; total: number; from: string; to: string } {
  const days = weekendDays(rows, now);
  const all = days.flat();
  const total = new Set(all.map((r) => r.slug)).size;

  /* Towns with the most markets first — the closest we have to "somewhere a
     visitor is likely to be" without asking anyone where they are. */
  const size = new Map<string, number>();
  for (const row of rows) size.set(row.citySlug, (size.get(row.citySlug) ?? 0) + 1);

  const picked: Dated[] = [];
  const towns = new Set<string>();
  for (const row of [...all].sort((a, b) => (size.get(b.citySlug) ?? 0) - (size.get(a.citySlug) ?? 0))) {
    if (towns.has(row.citySlug)) continue;
    towns.add(row.citySlug);
    picked.push(row);
    if (picked.length === count) break;
  }

  /* Back into date order once chosen, so the block still reads chronologically. */
  picked.sort((a, b) => a.next.date.localeCompare(b.next.date) ||
    (a.next.startTime ?? '').localeCompare(b.next.startTime ?? ''));

  /* Everything the six did not cover, in date order. It is rendered too, and
     hidden — "Alle 38" opens it in place. A button that says "all of them"
     must not navigate to a page that holds something else. */
  const chosen = new Set(picked);
  const more = all
    .filter((row) => !chosen.has(row))
    .sort((a, b) => a.next.date.localeCompare(b.next.date) ||
      (a.next.startTime ?? '').localeCompare(b.next.startTime ?? ''));

  return {
    lead: picked.slice(0, 2),
    rest: picked.slice(2),
    more,
    total,
    from: all[0]?.next.date ?? '',
    to: all[all.length - 1]?.next.date ?? '',
  };
}
