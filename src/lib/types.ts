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
  kind: MarketKind;
  city: string;
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
}
