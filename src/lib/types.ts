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
  /**
   * Where the date came from. Only 'organiser' lets a page say the organiser
   * stands behind it — everything else is us, reading a public source.
   */
  origin?: 'manual' | 'generated' | 'organiser' | 'import';
}

export interface Market {
  slug: string;
  name: string;
  /** The description in the requested locale, shown verbatim. */
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
  /**
   * How often it runs, in the organiser's own words — "Jeden Samstag,
   * ganzjährig". Held for every active market, and it is what lets a list show
   * one row per market instead of one row per date: the sentence says more
   * than eighteen identical Saturdays did. Localised in `texts`, falling back
   * to the German `markets.recurrence_text`.
   */
  recurrenceText?: string;
  /** Null until we have been there. No stock, no AI images — docs/BRAND.md. */
  imageUrl?: string;
  /**
   * Who last checked this market, and when. 'organiser' is the strong claim —
   * 33 of 157 — and it is the only one the accent is spent on. It ages, so the
   * date is always shown with it.
   */
  verifiedBy?: 'team' | 'organiser' | 'community';
  verifiedAt?: string;
  /**
   * Who runs it. Held for 155 of 157. Search Console asks for `organizer` on
   * every Event; it is also the only name a visitor can hold responsible.
   */
  organiserName?: string;
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
