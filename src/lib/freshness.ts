/**
 * When a date is worth saying something about.
 *
 * The rule, decided 2026-09-05: **silence is the good state.**
 *
 * Every confirmed row used to carry "Bestätigt am 11. Juni durch den
 * Veranstalter". On one screen of the home page that string appeared 26 times
 * — identical, on 26 different markets. A fact true of nearly every row is
 * furniture, not information, and the cost was that the rows which *did* need
 * a warning were buried among the ones that did not.
 *
 * So a list row says nothing when a date is confirmed and recently checked,
 * and speaks up when it is cancelled, unconfirmed, or has gone stale. That
 * makes the warning visible precisely because it is rare.
 *
 * This is the one place the rule lives. The market page still prints the long
 * sentence — there it is the whole claim, and the thing an AI answer quotes —
 * but no list anywhere invents its own version of "is this fresh enough".
 */
import type { Occurrence } from './types';
import type { Strings } from './strings';
import { formatDateShort, todayIso } from './format';
import type { Locale } from './i18n';

export interface Flag {
  text: string;
  /** 'bad' is the accent and means it is not happening. 'warn' is quiet grey. */
  tone: 'bad' | 'warn';
}

/**
 * How old a confirmation may be before we say so.
 *
 * 90 days, because the publication horizon is 120: a date checked inside the
 * last quarter was checked while the market's current season was running.
 * Anything older was checked about a different season.
 */
export const STALE_AFTER_DAYS = 90;

export function flagFor(
  occurrence: Occurrence | undefined,
  s: Strings,
  locale: Locale,
  today: string = todayIso()
): Flag | null {
  if (!occurrence) return null;

  if (occurrence.status === 'cancelled') {
    const note = occurrence.cancellationNote;
    return { text: note ? `${s.flagCancelled} — ${note}` : s.flagCancelled, tone: 'bad' };
  }

  if (!occurrence.confirmedAt) return { text: s.flagUnconfirmed, tone: 'warn' };

  const days = (Date.parse(today) - Date.parse(occurrence.confirmedAt.slice(0, 10))) / 86_400_000;
  if (days > STALE_AFTER_DAYS) {
    return { text: s.flagStale(formatDateShort(occurrence.confirmedAt, locale)), tone: 'warn' };
  }

  return null;
}
