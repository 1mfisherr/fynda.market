/**
 * When a market with no date is back — "Back in April", "Usually in September".
 *
 * A market between editions is a place with a season, not an event that ended
 * (PAGES.md, 2026-10-10). Its page used to say "No next date yet" and stop; the
 * months it runs were in its own rhythm line all along. They are held as two
 * numbers on the market (`season_from`, `season_to`, read from that line), and
 * this is the one reading of them — the market page's status, a town page's
 * answer and every undated list row say the same thing because they all ask
 * here.
 *
 * It only ever says what the months say. Outside a season the market is back
 * when the season opens; an annual market in one month is usually in that
 * month. Inside a season with nothing dated, or with no season held, it says
 * nothing, and the page falls back to when the market last ran — a fact,
 * where a guess about this month would be a promise.
 */
import type { Locale } from './i18n';
import type { Market } from './types';
import { t } from './strings.ts';

export type Season =
  /** Outside its months: back when they start. */
  | { kind: 'back'; month: number }
  /** One month a year: usually in it. */
  | { kind: 'usually'; month: number };

type Seasoned = Pick<Market, 'next' | 'seasonFrom' | 'seasonTo' | 'lastDate'>;

/**
 * Months are 1–12; a season may wrap the new year (October to April). A
 * season whose last month has already had its edition is over: Wollishofen
 * runs April to October, ran on 4 October, and on the 10th it is back in
 * April, not "inside its season".
 */
export function seasonOf(market: Seasoned, today: string): Season | undefined {
  const { next, seasonFrom: from, seasonTo: to, lastDate } = market;
  if (next || !from || !to) return undefined;
  if (from === to) return { kind: 'usually', month: from };
  const month = Number(today.slice(5, 7));
  const inside = from <= to ? month >= from && month <= to : month >= from || month <= to;
  const finished = month === to && lastDate?.slice(0, 7) === today.slice(0, 7);
  return inside && !finished ? undefined : { kind: 'back', month: from };
}

/** The season in words, in the page's language, or undefined when there is none to say. */
export function seasonLabel(market: Seasoned, today: string, locale: Locale): string | undefined {
  const season = seasonOf(market, today);
  if (!season) return undefined;
  const s = t(locale);
  const month = s.monthsLong[season.month - 1];
  return season.kind === 'back' ? s.backIn(month) : s.usuallyIn(month);
}
