/**
 * Where today's market stands at this minute — for the browser.
 *
 * The build runs at 03:00 and knows which day a market is on, never the hour.
 * Everything that depends on the hour is worked out here, in the visitor's
 * browser, from two instants the build writes into the page (`data-start`,
 * `data-end`, ISO with the venue's offset). With no JavaScript the page still
 * says "Today" and the times, which is the whole answer minus the minute.
 *
 * One module, because the market page and every list row must agree on when
 * "closes in" starts and when a market counts as over.
 */

export type Phase = 'before' | 'open' | 'closing' | 'over';

/** "Closes in" starts this long before the end, and "Opens in" this long before the start. */
export const WINDOW_MIN = 120;

export interface ClockState {
  phase: Phase;
  /** Minutes to the next edge: to opening for 'before', to closing for 'open' and 'closing'. */
  minutes: number;
}

export function clockState(start: Date, end: Date, now = new Date()): ClockState | undefined {
  const s = start.valueOf(), e = end.valueOf(), n = now.valueOf();
  if (Number.isNaN(s) || Number.isNaN(e) || e <= s) return undefined;
  // Rounded up, so the last stretch reads "1 min" and never "0 min".
  const until = (t: number) => Math.max(1, Math.ceil((t - n) / 60_000));
  if (n < s) return { phase: 'before', minutes: until(s) };
  if (n >= e) return { phase: 'over', minutes: 0 };
  const left = until(e);
  return { phase: left <= WINDOW_MIN ? 'closing' : 'open', minutes: left };
}

/** The words, as the page hands them over: templates, because a client script cannot call strings.ts. */
export interface ClockWords {
  opensIn: string;
  closesIn: string;
  onRightNow: string;
  overToday: string;
  spanH: string;
  spanM: string;
  spanHM: string;
}

/** "1 h 10 min", "40 min", "2 h" — in the page's language. */
export function formatSpan(minutes: number, w: ClockWords): string {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  if (!h) return w.spanM.replace('{m}', String(m));
  if (!m) return w.spanH.replace('{h}', String(h));
  return w.spanHM.replace('{h}', String(h)).replace('{m}', String(m).padStart(2, '0'));
}

/** Read the words the layout printed once per page. */
export function clockWords(): ClockWords | undefined {
  const el = document.getElementById('clock-words');
  try { return el?.textContent ? JSON.parse(el.textContent) : undefined; } catch { return undefined; }
}

/** The instants an element carries, if it carries both. */
export function instantsOf(el: HTMLElement): [Date, Date] | undefined {
  const { start, end } = el.dataset;
  return start && end ? [new Date(start), new Date(end)] : undefined;
}
