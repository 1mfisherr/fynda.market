/**
 * German date and time formatting, Swiss conventions.
 *
 * Deliberately not Intl.DateTimeFormat: Node builds vary in ICU data, and the
 * abbreviations Swiss German actually uses ("Sept", not "Sep") are not what
 * every ICU build produces. A directory whose whole product is dates should
 * not have its date strings depend on which Node the build ran on.
 */

import type { Locale } from './i18n';
import { t } from './strings.ts';

/**
 * The locale decides the month names, not the runtime. Formatting still does
 * not go through Intl: a directory whose whole product is dates should not have
 * its date strings depend on which Node the build ran on, and Swiss German
 * wants "Sept" where ICU gives "Sep".
 */
const names = (locale: Locale) => t(locale);

/** Parse YYYY-MM-DD as a local calendar date, with no timezone shifting. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * "Sa 29. Aug" in German, "Sat 29 Aug" in English. The ordinal dot is a German
 * and Italian convention; French and English do not use it.
 */
export function formatDate(iso: string, locale: Locale = 'de'): string {
  const s = names(locale);
  const d = parseDate(iso);
  const dot = locale === 'de' ? '.' : '';
  return `${s.weekdaysShort[d.getDay()]} ${d.getDate()}${dot} ${s.monthsShort[d.getMonth()]}`;
}

/** "29. Sept" — for secondary mentions where the weekday is noise. */
export function formatDateShort(iso: string, locale: Locale = 'de'): string {
  const s = names(locale);
  const d = parseDate(iso);
  const dot = locale === 'de' ? '.' : '';
  return `${d.getDate()}${dot} ${s.monthsShort[d.getMonth()]}`;
}

/** "08:00" from "08:00" or "08:00:00". */
export function formatTime(time?: string): string | undefined {
  if (!time) return undefined;
  return time.slice(0, 5);
}

/** "08:00–17:00", "ab 08:00", or undefined when we know neither. */
export function formatTimeRange(start?: string, end?: string, locale: Locale = 'de'): string | undefined {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s}–${e}`;
  if (s) return `${FROM[locale]} ${s}`;
  return undefined;
}

/** "from 08:00" when only an opening time is known. */
const FROM: Record<Locale, string> = { de: 'ab', fr: 'dès', it: 'dalle', en: 'from' };

/** "Sa 29. Aug · 08:00–17:00" — the accent-coloured line on every card. */
export function formatWhen(date: string, start?: string, end?: string, locale: Locale = 'de'): string {
  const time = formatTimeRange(start, end, locale);
  return time ? `${formatDate(date, locale)} · ${time}` : formatDate(date, locale);
}

/** Today as YYYY-MM-DD in the given zone. Build-time default is Zurich. */
export function todayIso(timeZone = 'Europe/Zurich'): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parts; // en-CA gives YYYY-MM-DD
}

/**
 * The coming Saturday and Sunday, as ISO dates.
 *
 * On a Saturday or Sunday "this weekend" means today and tomorrow, not the
 * weekend after — someone searching on Saturday morning wants today.
 */
export function thisWeekend(fromIso: string = todayIso()): { start: string; end: string } {
  const d = parseDate(fromIso);
  const day = d.getDay(); // 0 Sun … 6 Sat
  const saturday = new Date(d);

  if (day === 0) {
    saturday.setDate(d.getDate() - 1); // Sunday: the weekend started yesterday
  } else {
    saturday.setDate(d.getDate() + ((6 - day + 7) % 7));
  }

  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);

  return { start: toIso(saturday), end: toIso(sunday) };
}

export function toIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * ISO 8601 with the venue's UTC offset, which schema.org startDate requires.
 * Without the offset the markup is invalid; with the wrong one the event is
 * shown at the wrong hour.
 */
export function toIsoWithOffset(date: string, time: string | undefined, timeZone: string): string {
  const t = formatTime(time) ?? '00:00';
  const local = new Date(`${date}T${t}:00Z`);
  const offsetMinutes = tzOffsetMinutes(local, timeZone);
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date}T${t}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

function tzOffsetMinutes(at: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(at).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value])
  ) as Record<string, string>;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  return Math.round((asUtc - at.getTime()) / 60000);
}
