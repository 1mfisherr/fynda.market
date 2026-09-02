/**
 * The date chips, as one rule.
 *
 * Home and city both filter a list by "Heute / Wochenende / Nächste Woche", and
 * both had their own copy of the weekend arithmetic — the kind of duplicate that
 * stays correct until one of them is fixed and the other is not.
 *
 * It runs in the browser, so it takes `now` rather than reading the clock: a
 * filter that cannot be given a date cannot be reasoned about.
 */

/**
 * The named windows, plus one specific day as a plain YYYY-MM-DD. The calendar
 * picks a day, and it goes through the same control and the same filter as the
 * chips — a date is a filter, never a URL (docs/ARCHITECTURE.md).
 */
export type DateWindow = 'all' | 'today' | 'weekend' | (string & {});

/** YYYY-MM-DD in the visitor's own calendar, never UTC. */
export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * The coming weekend. On a Sunday that is today and yesterday, not next week —
 * someone looking on Sunday morning wants today's markets.
 */
export function weekendBounds(now: Date) {
  const day = now.getDay();
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + (day === 0 ? -1 : (6 - day + 7) % 7));
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return { start: iso(saturday), end: iso(sunday) };
}

export function inWindow(date: string, window: DateWindow, now = new Date()): boolean {
  if (window === 'all') return true;
  if (window === 'today') return date === iso(now);
  if (window === 'weekend') {
    const { start, end } = weekendBounds(now);
    return date >= start && date <= end;
  }
  // Anything else is a day the visitor picked out of the calendar.
  return date === window;
}
