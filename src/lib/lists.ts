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

/** Rows grouped by day, earliest first — what a day band renders. */
export function byDay(rows: Dated[]): Dated[][] {
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
 * The coming weekend, as day groups.
 *
 * On a Sunday that is yesterday and today, not next week — someone looking on
 * Sunday morning wants today's markets. `weekendBounds` owns that rule; this
 * only selects against it, and drops a Saturday that has already passed.
 */
export function weekendDays(rows: Dated[], now = new Date()): Dated[][] {
  const { start, end } = weekendBounds(now);
  const today = iso(now);
  return byDay(rows.filter((row) => row.next.date >= start && row.next.date <= end && row.next.date >= today));
}

/**
 * The weekday markets in the next `days` days, one row per market.
 *
 * Midweek is not the business — seven markets across a whole week against
 * thirty-eight on one Saturday — so it is a short block under the weekend
 * rather than a second list of days. A Wednesday market that runs every week
 * needs one row for the same reason a Saturday one does.
 */
export function weekdaysSoon(rows: Dated[], now = new Date(), days = 7): Dated[] {
  const limit = new Date(now);
  limit.setDate(limit.getDate() + days);
  const last = iso(limit);
  const today = iso(now);
  return byMarket(
    rows.filter((row) => {
      const weekday = new Date(`${row.next.date}T00:00:00`).getDay();
      return weekday !== 0 && weekday !== 6 && row.next.date >= today && row.next.date <= last;
    })
  );
}
