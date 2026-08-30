/**
 * The words and marks the product uses, in one place.
 *
 * Before this file the market kinds lived in three: MARKET_LINE held the code
 * and the colour, TypeLegend held its own short labels, and the market page
 * held a fourth set of full ones. Three sources meant "Halle" on one page and
 * "Hallenflohmarkt" on the next, with nothing to tell you they were the same
 * thing. A kind is one row here, and every surface reads it.
 *
 * Rule: no German string that names a domain concept is written in a template.
 * It is written here, once, and imported. That is what makes a wording change a
 * one-line change and a translation possible at all.
 */

import type { MarketKind, OccurrenceStatus } from './types';

export interface Line {
  /** The two-letter code on the departure board. Several kinds share one. */
  code: string;
  /** The line colour token — docs/BRAND.md, market type as a transit line. */
  token: string;
  /** In a legend, where the code is beside it and space is short. */
  short: string;
  /** In prose and page titles, where it stands alone. */
  full: string;
  /** Whether this kind gets its own swatch in the legend. */
  inLegend: boolean;
}

/**
 * Eight kinds, five lines. Brocante, Antikmarkt and Strassenmarkt ride the
 * Flohmarkt line: they are the same errand to a visitor, and PAGES.md caps the
 * legend at five because 60 categories is what killed v1.
 */
export const LINES: Record<MarketKind, Line> = {
  flohmarkt: { code: 'FM', token: '--line-floh', short: 'Flohmarkt', full: 'Flohmarkt', inLegend: true },
  hallenflohmarkt: { code: 'HA', token: '--line-halle', short: 'Halle', full: 'Hallenflohmarkt', inLegend: true },
  nachtflohmarkt: { code: 'NA', token: '--line-nacht', short: 'Nacht', full: 'Nachtflohmarkt', inLegend: true },
  kinderflohmarkt: { code: 'KI', token: '--line-kinder', short: 'Kinder', full: 'Kinderflohmarkt', inLegend: true },
  troedelmarkt: { code: 'TR', token: '--line-troedel', short: 'Trödel', full: 'Trödelmarkt', inLegend: true },
  brocante: { code: 'FM', token: '--line-floh', short: 'Brocante', full: 'Brocante', inLegend: false },
  antikmarkt: { code: 'FM', token: '--line-floh', short: 'Antik', full: 'Antikmarkt', inLegend: false },
  strassenmarkt: { code: 'FM', token: '--line-floh', short: 'Strasse', full: 'Strassenmarkt', inLegend: false },
};

export const LEGEND = (Object.keys(LINES) as MarketKind[]).filter((kind) => LINES[kind].inLegend);

/** What a date's status is called. Never colour alone — docs/BRAND.md. */
export const STATUS_LABEL: Record<OccurrenceStatus, string> = {
  confirmed: 'Bestätigt',
  tentative: 'Vorläufig',
  cancelled: 'Abgesagt',
  unverified: 'Nicht bestätigt',
};

/**
 * Schema.org eventStatus. A cancelled date keeps its startDate and says so —
 * removing it breaks the markup and throws away the most useful thing we know.
 */
export const EVENT_STATUS: Record<OccurrenceStatus, string> = {
  confirmed: 'https://schema.org/EventScheduled',
  tentative: 'https://schema.org/EventScheduled',
  unverified: 'https://schema.org/EventScheduled',
  cancelled: 'https://schema.org/EventCancelled',
};

/** German counts. The lists are full of ones and "1 Märkte" reads as a bug. */
export const marketCount = (n: number) => `${n} ${n === 1 ? 'Markt' : 'Märkte'}`;
export const dateCount = (n: number) => `${n} ${n === 1 ? 'Termin' : 'Termine'}`;

export const WEEKDAYS_LONG = [
  'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag',
] as const;

export const MONTHS_LONG = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const;
