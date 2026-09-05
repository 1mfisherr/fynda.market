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

import type { Locale } from './i18n';
import type { MarketKind, OccurrenceStatus } from './types';

export interface Line {
  /** The two-letter code on the departure board. Several kinds share one. */
  code: string;
  /** The line colour token — docs/BRAND.md, market type as a transit line. */
  token: string;
  /** In a legend or on a tile, where space is short. Per locale. */
  short: Record<Locale, string>;
  /** In prose and page titles, where it stands alone. Per locale. */
  full: Record<Locale, string>;
  /** Whether this kind gets its own swatch in the legend. */
  inLegend: boolean;
  /** The icon on the market-types block. Same set as components/Icon.astro. */
  icon: 'stall' | 'hall' | 'moon' | 'child' | 'crate';
}

/**
 * Eight kinds, five lines. Brocante, Antikmarkt and Strassenmarkt ride the
 * Flohmarkt line: they are the same errand to a visitor, and PAGES.md caps the
 * legend at five because 60 categories is what killed v1.
 *
 * The names are per locale. They were German only, which was invisible while
 * the legend was six words of grey text under a list — and stopped being
 * invisible the moment the market types became a block of five coloured tiles
 * on the French home page.
 */
/**
 * Which kinds earn a badge on a row.
 *
 * 41 of 45 rows on the home page were an ordinary Flohmarkt, so the badge said
 * "this is a flea market" on a flea-market site — decoration on 91% of rows,
 * against BRAND.md's rule that colour carries information or it does not
 * appear. A badge now means "this one is not the usual thing", which is the
 * only version of it worth the ink. Same rule as the entry fee and the city:
 * say the exception, never the rule.
 */
export const BADGED_KINDS: ReadonlySet<MarketKind> = new Set<MarketKind>([
  'hallenflohmarkt', 'nachtflohmarkt', 'kinderflohmarkt', 'troedelmarkt',
]);

export const LINES: Record<MarketKind, Line> = {
  flohmarkt: {
    code: 'FM', token: '--line-floh', inLegend: true, icon: 'stall',
    short: { de: 'Flohmarkt', fr: 'Brocante', it: 'Mercatino', en: 'Flea' },
    full: { de: 'Flohmarkt', fr: 'Brocante', it: 'Mercatino delle pulci', en: 'Flea market' },
  },
  hallenflohmarkt: {
    code: 'HA', token: '--line-halle', inLegend: true, icon: 'hall',
    short: { de: 'Halle', fr: 'Couvert', it: 'Al coperto', en: 'Indoor' },
    full: { de: 'Hallenflohmarkt', fr: 'Brocante couverte', it: 'Mercatino al coperto', en: 'Indoor flea market' },
  },
  nachtflohmarkt: {
    code: 'NA', token: '--line-nacht', inLegend: true, icon: 'moon',
    short: { de: 'Nacht', fr: 'Nocturne', it: 'Notturno', en: 'Night' },
    full: { de: 'Nachtflohmarkt', fr: 'Brocante nocturne', it: 'Mercatino notturno', en: 'Night flea market' },
  },
  kinderflohmarkt: {
    code: 'KI', token: '--line-kinder', inLegend: true, icon: 'child',
    short: { de: 'Kinder', fr: 'Enfants', it: 'Bambini', en: 'Kids' },
    full: { de: 'Kinderflohmarkt', fr: 'Vide-grenier enfants', it: 'Mercatino per bambini', en: "Children's flea market" },
  },
  troedelmarkt: {
    code: 'TR', token: '--line-troedel', inLegend: true, icon: 'crate',
    short: { de: 'Trödel', fr: 'Puces', it: 'Usato', en: 'Bric-a-brac' },
    full: { de: 'Trödelmarkt', fr: 'Marché aux puces', it: "Mercato dell'usato", en: 'Bric-a-brac market' },
  },
  brocante: {
    code: 'FM', token: '--line-floh', inLegend: false, icon: 'stall',
    short: { de: 'Brocante', fr: 'Brocante', it: 'Brocante', en: 'Brocante' },
    full: { de: 'Brocante', fr: 'Brocante', it: 'Brocante', en: 'Brocante' },
  },
  antikmarkt: {
    code: 'FM', token: '--line-floh', inLegend: false, icon: 'stall',
    short: { de: 'Antik', fr: 'Antiquités', it: 'Antiquariato', en: 'Antiques' },
    full: { de: 'Antikmarkt', fr: "Marché d'antiquités", it: 'Mercato di antiquariato', en: 'Antiques market' },
  },
  strassenmarkt: {
    code: 'FM', token: '--line-floh', inLegend: false, icon: 'stall',
    short: { de: 'Strasse', fr: 'Rue', it: 'Strada', en: 'Street' },
    full: { de: 'Strassenmarkt', fr: 'Marché de rue', it: 'Mercato di strada', en: 'Street market' },
  },
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
