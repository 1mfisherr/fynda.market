/**
 * The shapes the templates render.
 *
 * These mirror docs/ARCHITECTURE.md §Data model and the tables in
 * supabase/migrations/20260829120000_initial_schema.sql, flattened for the
 * view layer. The database is normalised; a card is not.
 */

/** Mirrors occurrences.status. Maps 1:1 onto schema.org eventStatus. */
export type OccurrenceStatus = 'confirmed' | 'tentative' | 'cancelled' | 'unverified';

/** Mirrors markets.kind. */
export type MarketKind =
  | 'flohmarkt'
  | 'hallenflohmarkt'
  | 'nachtflohmarkt'
  | 'kinderflohmarkt'
  | 'troedelmarkt'
  | 'brocante'
  | 'antikmarkt'
  | 'strassenmarkt';

export interface Occurrence {
  /** ISO date, YYYY-MM-DD. Never a Date object — timezones are the venue's. */
  date: string;
  startTime?: string;
  endTime?: string;
  status: OccurrenceStatus;
  /** Why it was cancelled, in German, shown verbatim. */
  cancellationNote?: string;
  /** When a human last confirmed this date with a source. */
  confirmedAt?: string;
}

export interface Market {
  slug: string;
  name: string;
  /** The German description, shown verbatim. Never generated — docs/BRAND.md. */
  description?: string;
  kind: MarketKind;
  city: string;
  /** The city's German URL slug, from the database. Never derived in a template. */
  citySlug: string;
  /** Canton in CH, Bundesland in DE. One region level only — docs/ARCHITECTURE.md. */
  region: string;
  regionSlug: string;
  /** "schweiz", "suisse", "svizzera", "switzerland" — the country in this locale. */
  countrySlug: string;
  /** IANA zone from the venue. Required for a correct startDate offset. */
  timezone: string;
  venueName: string;
  addressLine: string;
  postalCode?: string;
  lat: number;
  lng: number;
  /** The one occurrence a market page emits as its single schema.org Event. */
  next?: Occurrence;
  /** Later dates. Visible content, never markup. */
  upcoming: Occurrence[];
  /** Null until we have been there. No stock, no AI images — docs/BRAND.md. */
  imageUrl?: string;
  /** The organiser's own page. Held for 153 of 157 markets and worth a button. */
  websiteUrl?: string;
  stallCount?: number;
  stallCountBadWeather?: number;
  sellerMix?: 'private' | 'mixed' | 'trader' | 'new_goods';
  priceLevel?: 'cheap' | 'flohmarkt' | 'trader';
  packUpFrom?: string;
  entryFee?: number;
  covered?: 'open' | 'partly' | 'indoor';
  groundSurface?: string;
  timing?: { from: string; label: string; note?: string }[];
  gettingThere?: string;
  facilities?: { wc?: boolean; dogs?: boolean; strollers?: string; food?: string; cash?: string };
}
