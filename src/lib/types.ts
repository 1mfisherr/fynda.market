/**
 * The shapes the templates render.
 *
 * These mirror docs/ARCHITECTURE.md §Data model and the tables in
 * supabase/migrations/20260829120000_initial_schema.sql, flattened for the
 * view layer. The database is normalised; a card is not.
 */

import type { CountryCode } from './i18n';

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
  /** The database id — what a "Were you there?" answer names. Absent in fixtures. */
  id?: string;
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
  /**
   * The database id. Not for URLs — that is `slug` — but analytics_events
   * stores market_id, and a click on a city page has to be able to say which
   * market it was about. The path alone cannot: it names the city.
   */
  id: string;
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
  /** 'CH', 'DE'. Which region word the path takes, and which hreflang tag. */
  countryCode: CountryCode;
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
  /** The photographer and licence, where the licence asks for a credit (Wikimedia Commons, CC BY / BY-SA). */
  imageCredit?: { author: string; licence: string; licenceUrl?: string; sourceUrl: string };
  /**
   * Who last checked this market. 'organiser' is the strong claim — 33 of 157
   * — and it is the only one the accent is spent on. `verifiedAt` is held but
   * not rendered beside it: the badge says that an organiser stands behind the
   * market, not when they last said so.
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
  /** From the organiser, through their edit page. Rendered only when set. */
  stallCount?: number;
  setting?: 'indoor' | 'outdoor' | 'both';
  rainPolicy?: 'runs' | 'cancelled' | 'decided_on_the_day';
  /** Where a vendor books a stall: a URL, an address, or a sentence. */
  stallBooking?: string;
  /** The organiser's own words, shown as theirs in the language they wrote. */
  organiserNote?: string;
  organiserNoteLocale?: string;
  /**
   * The most recent date that has passed and was not cancelled. An annual
   * market between editions says when it last ran, which is a fact, rather
   * than only "no date yet" (Search Console, 2026-09-28).
   */
  lastDate?: string;
  /**
   * The months it runs, 1–12, read from its own rhythm line: "April to
   * October" is 4 / 10, an annual market in September 9 / 9, and a season over
   * the new year wraps. What lets a page with no date say "Back in April" —
   * src/lib/season.ts is the one reading of it.
   */
  seasonFrom?: number;
  seasonTo?: number;
  /** Who sells — what buyers ask most after size. Rendered only when set. */
  sellerMix?: 'private' | 'mixed' | 'trader';
  /**
   * The record: this calendar year's dates that have passed, newest first,
   * cancelled ones included. They were listed; `seen` says a visitor told us
   * one actually ran ("Were you there?", table date_answers).
   */
  earlier?: (Occurrence & { seen?: boolean })[];
  /** How many people asked to be told this market's next date — its own alerts and its town's. */
  waiting?: number;
  entryFee?: number;
  gettingThere?: string;
}
