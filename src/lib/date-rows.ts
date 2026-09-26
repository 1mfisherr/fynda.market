/**
 * Every date a list row stands for — for the When control, in the browser.
 *
 * A town or canton list shows one row per market, at its next date (lists.ts).
 * The When control filtered on that one date, so a weekly market whose next
 * date was today could never be found on the Saturday after: Zürich offered
 * no 3 October in its calendar though three markets ran that day (found
 * 2026-09-26). The row now carries all its dates inside the horizon, each
 * with that day's hours, and the page shows it for whichever one matches.
 *
 * Written by MarketRow (`allDates`) as `data-dates="2026-10-03=07:00–17:00;…"`.
 */
import { inWindow, type DateWindow } from './date-window';

export interface RowDate { date: string; hours: string }

/** The encoding MarketRow writes. Hours may be empty. */
export const encodeDates = (dates: RowDate[]): string => dates.map((d) => `${d.date}=${d.hours}`).join(';');

export function datesOf(row: HTMLElement): RowDate[] {
  const raw = row.dataset.dates;
  if (!raw) return row.dataset.date ? [{ date: row.dataset.date, hours: '' }] : [];
  return raw.split(';').map((part) => {
    const [date, hours = ''] = part.split('=');
    return { date, hours };
  });
}

/** The row's dates inside a window, soonest first. */
export const matching = (row: HTMLElement, window: DateWindow, now = new Date()): RowDate[] =>
  datesOf(row).filter((d) => inWindow(d.date, window, now));
