/**
 * Every word the interface says, in every locale.
 *
 * This is the interface, not the content. The difference matters: these are a
 * few dozen phrases a person writes once per language, so nothing here is
 * mass-translated prose. The market descriptions — the only real prose on the
 * site — are handled separately and appear in a language only once a human has
 * read them.
 *
 * A missing key falls back to German rather than rendering blank, and the
 * build fails on a missing key anyway (TypeScript makes the shape mandatory),
 * so the fallback is a belt on top of braces.
 *
 * Dates and counts are functions, because grammar is not a lookup table:
 * German says "1 Markt / 2 Märkte", French "1 marché / 2 marchés", and Italian
 * changes the article too.
 */

import type { CountryCode } from './i18n';
import type { TagKey } from './types';

import type { Locale } from './i18n';

export interface Strings {
  /* chrome */
  saved: string;
  skipToContent: string;
  backToHome: string;
  languageLabel: string;
  /** Names the header's section links for a screen reader. */
  navLabel: string;

  /* not found */
  notFoundTitle: string;
  notFoundHeading: string;
  notFoundBody: string;

  /* home */
  /** The home page names the countries it covers: one, or several joined. */
  homeTitle: (countries: CountryCode[]) => string;
  homeDescription: (countries: CountryCode[]) => string;
  heroLine1: string;
  heroLine2: string;
  /* the search control — home and the radius view (docs/specs/near-me.md) */
  whereLabel: string;
  /** The town sheet's close button. */
  closeSheet: string;
  whenLabel: string;
  howFarLabel: string;
  /** The Where field before a town is chosen; also the sheet's title. */
  pickTown: string;
  /** The town search: its accessible name, the words in the empty box, and what it says when nothing matches. */
  townSearchLabel: string;
  townSearchPlaceholder: string;
  townNoMatch: string;
  /** Over the five biggest towns under the box. */
  bigTownsLabel: string;
  /** Beside the town remembered from the last visit. */
  lastTime: string;
  /** The radius view's place pill: near a town, or near the visitor's own point. */
  nearTown: (town: string) => string;
  nearYou: string;
  /** A distance band on the radius view: "Bis 10 km", "10–25 km". */
  distanceBand: (from: number, to: number) => string;
  /** The first row of the town sheet, and the round button's name. */
  nearMe: string;
  locating: string;
  yourLocation: string;
  tryAgain: string;
  /** Under the round button on home: what a tap does and does not do. */
  geoHint: string;
  /** The Show button on home, carrying the live count. */
  showCount: (n: number) => string;
  /** Before a location: after the counts, what the list is and is not. */
  noDistancesYet: string;
  askingPhone: string;
  upcoming: (n: number) => string;
  /* The home page answers "this weekend", not "the next four months". */
  /* The claim, first thing on the home page: trust signal, head-term content
     and the sentence an AI answer can quote, in one line. */
  homePromise: (markets: number) => string;
  /** Under the hero, quiet: the one line for organisers who land on home — a question and a pill. */
  homeOrganiserAsk: string;
  homeOrganiserAction: string;
  thisWeekend: string;
  thisWeekendLede: (n: number, from: string, to: string) => string;
  allWeekend: (n: number) => string;
  /** The market page's dates list opens at five; this is the rest of it. */
  allDates: (n: number) => string;
  /* The home page's one question, asked below the markets — TownPicker. */
  yourTown: string;
  cities: string;
  /** "Kantone" in Switzerland, "Bundesländer" in Germany. */
  regionsOf: (code: CountryCode) => string;
  /** Under a country heading on the front door: "222 Märkte · 105 Orte". */
  countryCount: (markets: number, towns: number) => string;
  marketTypes: string;
  /**
   * What the block used to say in three verbs. It is the sentence that
   * separates this site from the category, so it carries a figure and names
   * what we do with a cancellation.
   */
  questions: string;
  cancelledThisWeek: string;
  nothingInPeriod: string;
  /** Over the markets of a town or canton that have no date yet — listed, not hidden. */
  noDateYet: string;
  noDateYetLede: (n: number) => string;

  /* the radius view — /de/umkreis/, /fr/a-proximite/ and the other two */
  radiusTitle: string;
  radiusDescription: string;
  radiusHeading: string;
  /** A location exists: the true count inside the radius. */
  radiusWithin: (n: number, km: number) => string;
  /** The phone said no, or never answered. */
  radiusDenied: string;
  radiusUseLocation: string;
  /** aria-label on the km chips. */
  radiusGroup: string;
  nothingForSelection: string;

  /* filters */
  filterAll: string;
  filterToday: string;
  filterWeekend: string;
  filterPeriodLabel: string;
  /** The calendar chip, before a day is chosen. */
  filterDate: string;
  calendarPrev: string;
  calendarNext: string;
  calendarHint: string;

  /* market page */
  route: string;
  organiserWebsite: string;
  organiser: string;
  addToCalendar: string;
  save: string;
  savedState: string;
  gettingThere: string;
  dates: string;
  wasItDifferent: string;
  reportIntro: string;
  reportDidNotHappen: string;
  reportEndedEarly: string;
  reportSomethingElse: string;
  /**
   * Who stands behind the date. No occurrence we hold came from an organiser
   * — all 1,478 came from the v1 import — so the old "confirmed by the
   * organiser" was claiming a source we do not have. We say what is true: we
   * checked it, on this day.
   */
  confirmedOn: (date: string) => string;
  /** The stronger claim, for when an organiser actually tells us. Accented. */
  organiserConfirmed: string;
  /*
     The status line on a market page. A visitor arrives asking "is it on?",
     and "06" does not answer that — the word does, and it is also the sentence
     an AI answer can quote.

     Today and tomorrow are resolved during the build, which knows its own
     date. `onRightNow` and the clock templates below are filled in by the
     browser instead: the page is written at 03:00 and cannot know what the
     hour will be when someone reads it. They are templates rather than
     functions because the client script receives them as data attributes and
     cannot call into this module.
  */
  statusToday: string;
  statusTomorrow: string;
  onRightNow: string;
  /** `{t}` is a span from the three span templates below. */
  opensIn: string;
  closesIn: string;
  /** Replaces the big word once today's market has closed. */
  overToday: string;
  /** `{t}` is today's time range, shown quiet under "over for today". */
  todayRange: string;
  /** `{d}` is the next date and its times. */
  nextOn: string;
  spanH: string;
  spanM: string;
  spanHM: string;
  /* The other markets on the same day, under the buttons. */
  nearbyToday: string;
  nearbyTomorrow: string;
  nearbyOn: (date: string) => string;
  /** Once this market has closed and others close by are still open. */
  nearbyStillOpen: string;
  straightLine: string;
  share: string;
  linkCopied: string;
  /** Under the distance in a market page's strip. `{town}` is the town the visitor picked. */
  fromTown: string;
  /** Label under the recurrence phrase in the decision strip. */
  howOften: string;
  /* The three things a list row may say about a date, and it says one only
     when it is true — see src/lib/freshness.ts. Silence means confirmed and
     recently checked, which is most rows. */
  flagCancelled: string;
  flagUnconfirmed: string;
  flagStale: (date: string) => string;
  notConfirmed: string;
  /** "Eintritt" over a fee in the decision strip — shown only when there is one. */
  entryLabel: string;
  /** Who runs it. Held for 94% of markets and, until 2026-09-06, only in the
      structured data — a fact we had that nobody could read. */
  hostedBy: (name: string) => string;
  /** The organiser's own line and where to book a stall — from their page, shown only when set. */
  fromTheOrganiser: string;
  bookAStall: string;

  /* city page */
  cityHeading: (n: number, city: string, year?: number) => string;
  /**
   * The tail of a town or canton title: the next date, the one fact that makes
   * fifty-six otherwise identical titles fifty-six different ones. Google
   * rewrites titles that "vary by only a single piece of information" and
   * shows the site name on its own, so the brand suffix is gone and the date
   * took its place (docs/reference/seo-research/plan.md).
   */
  titleNext: (date: string) => string;
  /** The market title: name, venue, town, then the year's dates — no year when no date is coming (a "2026" with no 2026 date is a page that does not match its title). */
  marketTitle: (name: string, venue: string | undefined, city: string | undefined, year?: number) => string;
  /** "Flohmarkt Bürkliplatz – Zürich – nächster Termin 26. Sept 2026" */
  marketTitleNext: (name: string, venue: string | undefined, city: string | undefined, when: string) => string;
  /** The short fallback: "Flohmarkt Bürkliplatz, Zürich – 26. Sept 2026" */
  marketTitleDate: (name: string, city: string | undefined, when: string) => string;
  /** A market page with no confirmed date still says what it knows. */
  marketNoDateDescription: (kind: string, city: string, venue: string | undefined, rhythm: string | undefined, last?: string) => string;
  /**
   * A market page's search snippet: the facts, not the title again. "Flohmarkt,
   * Basel. Der nächste ist Flohmarkt Stücki Basel am…" repeated the title on
   * 168 of 285 markets (Search Console, 2026-09-28).
   */
  marketSnippet: (date: string, time: string | undefined, place: string, setting: string | undefined, later: string[]) => string;
  /** A town with nothing upcoming says when its last market ran. */
  cityLast: (name: string, date: string) => string;
  /** On a market page with no next date: when it last ran. */
  lastHeld: (date: string) => string;
  /** A market with no date, from the months it runs (src/lib/season.ts): "Back in April", "Usually in September". */
  backIn: (month: string) => string;
  usuallyIn: (month: string) => string;
  /** Over the dated markets close by, on a market page with no date. */
  meanwhileNearby: string;
  /** The link under them, to the market's own town. */
  allMarketsIn: (town: string) => string;
  /** The facts in a market page's decision strip: their labels, and the values that need words of their own. */
  settingLabel: string;
  sellersLabel: string;
  sellers: Record<'private' | 'mixed' | 'trader', string>;
  rainLabel: string;
  /** A town page: the towns around it, as links with their distance. */
  townsNearby: string;
  /**
   * "Tell me when it's back" — on a market page with no date, and on a town
   * page with nothing dated, in place of the weekly card. One address, one
   * e-mail the night a date appears; the tick adds the weekly mail too.
   */
  alertEyebrow: string;
  alertTitleMarket: string;
  alertTitleTown: (town: string) => string;
  alertBodyMarket: (name: string) => string;
  alertBodyTown: (town: string) => string;
  alertWeekly: (town: string) => string;
  alertSend: string;
  alertDone: string;
  /**
   * The record: this year's earlier dates on a market page. "Earlier", not
   * "held" — a date was listed; only a visitor's "yes" says it ran (`seenOn`).
   * The summary is one line over a long list: "21 Saturdays since 2 May, none
   * cancelled"; `weekday` is the index of the day they all fell on, if they did.
   */
  earlierThisYear: string;
  earlierSummary: (n: number, weekday: number | undefined, since: string, cancelled: number) => string;
  seenOn: string;
  /** "Were you there?" — the day a market closed and the two days after. */
  wasItOnTitle: (date: string) => string;
  wasItOnToday: string;
  wasItOnBody: string;
  wasItOnYes: string;
  wasItOnNo: string;
  wasItOnThanks: string;
  wasItOnThanksBody: string;
  /** On the claim card of a market people are waiting for. */
  claimWaiting: (n: number) => string;
  /** "Foto" before a photographer's name, under a credited photo. */
  photo: string;
  /** The canton description, built from the data like the town one. */
  regionDescription: (n: number, towns: number, region: string, code: CountryCode, next?: { name: string; city: string; date: string }) => string;
  cityNext: (name: string, date: string, time: string | undefined, venue: string) => string;
  cityNoDate: string;
  cityIntro: (city: string, region: string, code: CountryCode) => string;
  /** The search snippet: the city is named because Google bolds the match. */
  cityDescription: (city: string, name: string, date: string, time: string | undefined, venue: string, n: number, months: number) => string;
  lastChecked: (date: string) => string;
  inNextMonths: (n: number) => string;

  /* the search card on the home page */
  /** Section ledes — one line saying what a block is. */
  citiesLede: string;
  regionsLede: string;
  typesLede: string;

  /* faq — real prose, so it says only what we can stand behind */
  faq: readonly { q: string; a: string }[];

  /* footer */
  footerTagline: string;
  footerFynda: string;
  footerLegal: string;
  footerOrganisers: string;
  footerNewsletter: string;
  footerReport: string;
  footerNearby: string;
  footerImprint: string;
  footerPrivacy: string;
  footerTerms: string;
  /** The cookie banner and the footer link that reopens it. */
  footerCookies: string;
  cookieTitle: string;
  cookieBody: string;
  cookieMore: string;
  cookieAccept: string;
  cookieEssential: string;
  footerAbout: string;

  /* canton page */
  regionHeading: (n: number, region: string, year: number | undefined, code: CountryCode) => string;
  regionIntro: (region: string, code: CountryCode) => string;
  /** "Kanton Luzern". The city of Luzern and the canton share a name — the
   *  label is what tells a link on the city page which one it means. */
  regionLabel: (region: string, code: CountryCode) => string;

  /* counts */
  marketCount: (n: number) => string;
  dateCount: (n: number) => string;

  /* cta */
  newsletterTitle: string;
  newsletterBody: string;
  newsletterAction: string;
  /**
   * Where a subscription reaches, as a finished prepositional phrase.
   *
   * One string used by the form and by every line of the weekly mail, because
   * the preposition differs per language and per shape — "im Kanton Zürich"
   * against "im Umkreis von 25 km um Zürich" — and the mail has no business
   * knowing either.
   */
  scopeRegion: (label: string) => string;
  scopeRadius: (km: number, city: string) => string;
  /** The block of markets from the towns around a sparse city. */
  nearbyHeading: (km: number) => string;
  nearbyLede: (city: string) => string;
  /**
   * The same thing for the signup block, which says no canton anywhere.
   *
   * It cannot reuse `scopeRegion`: that one takes "Kanton Zürich" and puts a
   * preposition in front of it, and the preposition a bare canton name wants
   * is not one word in any of these languages — "in Zürich" but "im Wallis",
   * "à Genève" but "dans le Jura". "für / for / pour / per" is the one that
   * fits all fourteen without an article.
   */
  subscribeScopeRegion: (name: string) => string;
  /** The signup block's body when the page knows where it is about. */
  subscribeBodyScope: (scope: string) => string;
  /**
   * The signup card's heading. With a town it names the town — the page already
   * knows it, and "the weekend around Basel" is the thing being offered. A canton
   * page passes nothing: a bare canton name wants a different preposition per
   * canton in every language (see `subscribeScopeRegion`).
   */
  subscribeTitle: (town?: string) => string;
  /** The card's button. The footer and the newsletter page keep the form's own verb. */
  subscribeSend: string;
  /** The body where the card carries the region picker instead of a place. */
  subscribeBodyPick: string;
  /**
   * The picker's label, where the page cannot know.
   *
   * "Region", not "Kanton" — and the options below it are bare names rather
   * than `regionLabel`'s "Kanton Zürich". A picker holding fourteen cantons
   * and nothing else does not need to say the word fourteen times to be
   * understood, and "Kanton" reads as administrative vocabulary in a form
   * whose whole job is to be answered without thinking.
   */
  subscribeRegionLabel: string;
  /** The picker's first option: no region, the whole country. */
  subscribeAnywhere: string;
  organiserTitle: string;
  /*
     The same ask as the organiser card, addressed to one market instead of to
     the country. It is on the page of every market no organiser stands behind
     — 128 of 161 — which is where an organiser looking themselves up will
     actually be. Yelp, TripAdvisor and Apple all put the claim on the listing
     rather than on a marketing page, for the same reason.
  */
  claimTitle: string;
  claimBody: string;
  claimAction: string;
  /** Under the button: the promise, three words. */
  /** The organiser stamp with the date the organiser said so. */
  organiserConfirmedOn: (date: string) => string;
  /** The decision strip's facts: the stall count's label, indoors or out, what rain does. */
  stallsLabel: string;
  setting: Record<'indoor' | 'outdoor' | 'both', string>;
  /** What a visitor finds there (Market.tags), as a phrase in the strip: "Antiques, records & books". */
  soldLabel: string;
  tagLabels: Record<TagKey, string>;
  rain: Record<'runs' | 'cancelled' | 'decided_on_the_day', string>;
  organiserBody: string;
  organiserAction: string;

  /* dates */
  weekdaysShort: readonly string[];
  weekdaysLong: readonly string[];
  monthsShort: readonly string[];
  monthsLong: readonly string[];
  /** "08:00–17:00 Uhr" in German; English has no trailing word. */
  timeSuffix: string;
}

/* --------------------------------------------------------------------------
 * How a region is named in a sentence, per country.
 *
 * "im Kanton Zürich" is how a Swiss person says it; "im Bundesland Bayern" is
 * not how anyone says it — in Germany the Land carries no noun ("Flohmärkte in
 * Bayern"), which is also the query people type. So the country decides the
 * whole phrase, not a swapped-in noun.
 * ------------------------------------------------------------------------ */

/* One German Land takes an article: "im Saarland", never "in Saarland". The
   other fifteen do not, and no canton does. */
const DE_ARTICLE = new Set(['Saarland']);

/* "in der Schweiz", "in Deutschland" — the article belongs to the country, so
   the phrase is a table rather than a noun slotted into a sentence. Every
   locale holds every country: French never renders a German page, but the
   home page of a French visitor still names the countries the site covers. */
const IN_COUNTRY: Record<Locale, Record<CountryCode, string>> = {
  de: { CH: 'in der Schweiz', DE: 'in Deutschland' },
  fr: { CH: 'en Suisse', DE: 'en Allemagne' },
  it: { CH: 'in Svizzera', DE: 'in Germania' },
  en: { CH: 'in Switzerland', DE: 'in Germany' },
};
const AND: Record<Locale, string> = { de: ' und ', fr: ' et ', it: ' e ', en: ' and ' };
const inCountries = (locale: Locale, codes: CountryCode[]) =>
  codes.map((c) => IN_COUNTRY[locale][c]).join(AND[locale]);

const inRegionDe = (region: string, code: CountryCode) =>
  (code === 'CH' ? `im Kanton ${region}` : DE_ARTICLE.has(region) ? `im ${region}` : `in ${region}`);
const regionLabelDe = (region: string, code: CountryCode) =>
  (code === 'CH' ? `Kanton ${region}` : region);
const inRegionEn = (region: string, code: CountryCode) =>
  (code === 'CH' ? `in the canton of ${region}` : `in ${region}`);
const regionLabelEn = (region: string, code: CountryCode) =>
  (code === 'CH' ? `Canton of ${region}` : region);

const de: Strings = {
  saved: 'Gemerkt',
  skipToContent: 'Zum Inhalt springen',
  backToHome: 'Zurück zur Startseite',
  languageLabel: 'Sprache',
  navLabel: 'Hauptnavigation',

  notFoundTitle: 'Seite nicht gefunden — fynda.market',
  notFoundHeading: 'Diese Seite gibt es nicht.',
  notFoundBody: 'Vielleicht ist der Markt umgezogen, vielleicht stimmt die Adresse nicht. Von der Startseite aus findest du jeden Markt.',

  homeTitle: (countries) => `Flohmärkte ${inCountries('de', countries)} — fynda.market`,
  homeDescription: (countries) => `Flohmärkte ${inCountries('de', countries)} mit Terminen, Öffnungszeiten und dem Tag der letzten Prüfung. Absagen bleiben sichtbar. Kostenlos, ohne Werbung.`,
  heroLine1: 'Man weiss nie,',
  heroLine2: 'was man findet.',
  whereLabel: 'Wo',
  closeSheet: 'Schliessen',
  whenLabel: 'Wann',
  howFarLabel: 'Wie weit',
  pickTown: 'Ort wählen',
  townSearchLabel: 'Ort suchen',
  townSearchPlaceholder: 'Ort eingeben',
  townNoMatch: 'Diesen Ort haben wir noch nicht. Versuche es mit einem grösseren in der Nähe.',
  bigTownsLabel: 'Oder direkt in eine Stadt',
  lastTime: 'Zuletzt',
  nearTown: (town) => `In der Nähe von ${town}`,
  nearYou: 'In deiner Nähe',
  distanceBand: (from, to) => (from === 0 ? `Bis ${to} km` : `${from}–${to} km`),
  nearMe: 'In meiner Nähe',
  locating: 'Standort wird ermittelt…',
  yourLocation: 'Dein Standort',
  tryAgain: 'Standort noch einmal abfragen',
  geoHint: 'Dein Standort wird einmal abgefragt und nicht gespeichert.',
  showCount: (n) => `${n} ${n === 1 ? 'Flohmarkt' : 'Flohmärkte'} anzeigen`,
  noDistancesYet: 'nach Datum. Wähle einen Ort oder nutze deinen Standort, um nach Entfernung zu sortieren.',
  askingPhone: 'Dein Handy wird nach dem Standort gefragt…',
  upcoming: (n) => n === 1 ? 'Kommender Termin' : 'Kommende Termine',
  homePromise: () => 'Wir finden die Flohmärkte. Das Stöbern ist deine Sache.',
  homeOrganiserAsk: 'Sie organisieren einen Markt?',
  homeOrganiserAction: 'Ihre Seite übernehmen',
  thisWeekend: 'Dieses Wochenende',
  allWeekend: (n) => `Alle ${n} am Wochenende`,
  allDates: (n) => `Alle ${n} Termine`,
  yourTown: 'Deine Stadt',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'Markt' : 'Märkte'}, ${from}${to === from ? '' : ` und ${to}`}`,
  cities: 'Orte',
  regionsOf: (code) => (code === 'CH' ? 'Kantone' : 'Bundesländer'),
  countryCount: (markets, towns) => `${markets} Märkte · ${towns} ${towns === 1 ? 'Ort' : 'Orte'}`,
  marketTypes: 'Markttypen',
  questions: 'Fragen',
  cancelledThisWeek: 'Diese Woche abgesagt',
  nothingInPeriod: 'Keine Märkte in diesem Zeitraum.',
  noDateYet: 'Noch ohne Termin',
  noDateYetLede: (n) => (n === 1 ? 'Der nächste Termin steht noch nicht fest. Öffne den Markt, und wir sagen dir Bescheid, sobald er feststeht.' : 'Die nächsten Termine stehen noch nicht fest. Öffne einen Markt, und wir sagen dir Bescheid, sobald sein Termin feststeht.'),
  radiusTitle: 'Flohmärkte in der Nähe — fynda.market',
  radiusDescription: 'Flohmärkte in der Nähe: Umkreis und Zeitraum wählen, sortiert nach Entfernung.',
  radiusHeading: 'Flohmärkte in der Nähe',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'Flohmarkt' : 'Flohmärkte'} im Umkreis von ${km} km, die nächsten zuerst.`,
  radiusDenied: 'Kein Standort geteilt. Wähle stattdessen einen Ort oder versuche es noch einmal.',
  radiusUseLocation: 'Meinen Standort verwenden',
  radiusGroup: 'Umkreis',
  nothingForSelection: 'Keine Märkte in diesem Zeitraum. Versuche es mit einem grösseren Umkreis oder einem anderen Zeitraum.',

  filterAll: 'Alle',
  filterToday: 'Heute',
  filterWeekend: 'Wochenende',
  filterDate: 'Datum',
  calendarPrev: 'Vorheriger Monat',
  calendarNext: 'Nächster Monat',
  calendarHint: 'Nur Tage mit Märkten sind wählbar.',
  filterPeriodLabel: 'Zeitraum',

  route: 'Route',
  organiserWebsite: 'Website des Veranstalters',
  organiser: 'Veranstalter',
  addToCalendar: 'In den Kalender eintragen',
  save: 'Merken',
  savedState: 'Gemerkt',
  gettingThere: 'Anfahrt',
  dates: 'Termine',
  wasItDifferent: 'Stimmt etwas nicht?',
  reportIntro: 'Termin verschoben, abgesagt, falsche Adresse? Sag es uns, ein Mensch prüft es.',
  reportDidNotHappen: 'Fand nicht statt',
  reportEndedEarly: 'War schon vorbei',
  reportSomethingElse: 'Etwas anderes',
  confirmedOn: (date) => `Geprüft am ${date}`,
  organiserConfirmed: 'Vom Veranstalter bestätigt',
  statusToday: 'Heute',
  statusTomorrow: 'Morgen',
  onRightNow: 'läuft gerade',
  opensIn: 'Öffnet in {t}',
  closesIn: 'Noch {t} offen',
  overToday: 'Für heute vorbei',
  todayRange: 'Heute, {t}',
  nextOn: 'Nächster Termin: {d}',
  spanH: '{h} Std.',
  spanM: '{m} Min.',
  spanHM: '{h} Std. {m} Min.',
  nearbyToday: 'Heute auch in der Nähe',
  nearbyTomorrow: 'Morgen auch in der Nähe',
  nearbyOn: (date) => `Am ${date} auch in der Nähe`,
  nearbyStillOpen: 'In der Nähe noch offen',
  straightLine: 'Entfernung in Luftlinie.',
  share: 'Teilen',
  linkCopied: 'Link kopiert',
  fromTown: 'von {town}',
  howOften: 'Rhythmus',
  flagCancelled: 'Fällt aus',
  flagUnconfirmed: 'Noch nicht bestätigt',
  flagStale: (date) => `Zuletzt geprüft am ${date}`,
  notConfirmed: 'Noch nicht bestätigt',
  entryLabel: 'Eintritt',
  hostedBy: (name) => `Veranstaltet von ${name}`,
  fromTheOrganiser: 'Vom Veranstalter',
  bookAStall: 'Stand buchen',

  cityHeading: (n, city, year) =>
    n === 1 ? `Der Flohmarkt in ${city}${year ? ` ${year}` : ''}` : `Die ${n} Flohmärkte in ${city}${year ? ` ${year}` : ''}`,
  titleNext: (date) => `nächster Termin ${date}`,
  marketTitle: (name, venue, city, year) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')}${year ? ` – Termine ${year}` : ''}`,
  marketTitleNext: (name, venue, city, when) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')} – nächster Termin ${when}`,
  marketTitleDate: (name, city, when) => `${[name, city].filter(Boolean).join(', ')} – ${when}`,
  marketNoDateDescription: (kind, city, venue, rhythm, last) =>
    `${kind} in ${city}${venue ? `, ${venue}` : ''}. ${rhythm ? `${rhythm}. ` : ''}${last ? `Zuletzt am ${last}. ` : ''}Der nächste Termin ist noch nicht bestätigt — wir prüfen ihn und tragen ihn ein, sobald er feststeht.`,
  marketSnippet: (date, time, place, setting, later) =>
    `${date}${time ? `, ${time} Uhr` : ''}, ${place}${setting ? `, ${setting}` : ''}.${later.length ? ` Danach ${later.join(' und ')}.` : ''}`,
  cityLast: (name, date) => `Zuletzt: ${name} am ${date}.`,
  lastHeld: (date) => `Zuletzt am ${date}`,
  backIn: (month) => `Wieder ab ${month}`,
  usuallyIn: (month) => `Meist im ${month}`,
  meanwhileNearby: 'Bis dahin: Märkte in der Nähe',
  allMarketsIn: (town) => `Alle Märkte in ${town}`,
  settingLabel: 'Drinnen oder draussen',
  sellersLabel: 'Wer verkauft',
  sellers: { private: 'Privatleute', mixed: 'Privatleute und Händler', trader: 'Händler' },
  rainLabel: 'Bei Regen',
  townsNearby: 'Orte in der Nähe',
  alertEyebrow: 'Nächster Termin',
  alertTitleMarket: 'Sag mir Bescheid, wenn er wieder stattfindet',
  alertTitleTown: (town) => `Sag mir Bescheid, wenn es in ${town} einen Termin gibt`,
  alertBodyMarket: (name) => `Eine E-Mail, sobald ${name} den nächsten Termin bekannt gibt. Sonst nichts.`,
  alertBodyTown: (town) => `Eine E-Mail, sobald ein Markt in ${town} den nächsten Termin bekannt gibt. Sonst nichts.`,
  alertWeekly: (town) => `Schick mir auch jeden Freitagmorgen, was am Wochenende rund um ${town} läuft`,
  alertSend: 'Bescheid geben',
  alertDone: 'Erledigt. Du bekommst eine E-Mail, sobald der Termin feststeht.',
  earlierThisYear: 'Bisher in diesem Jahr',
  earlierSummary: (n, weekday, since, cancelled) =>
    `${n} ${weekday === undefined ? 'Termine' : ['Sonntage', 'Montage', 'Dienstage', 'Mittwoche', 'Donnerstage', 'Freitage', 'Samstage'][weekday]} seit dem ${since}, ${cancelled ? `${cancelled} abgesagt` : 'keiner abgesagt'}.`,
  seenOn: 'Fand statt',
  wasItOnTitle: (date) => `Warst du am ${date} dort?`,
  wasItOnToday: 'Warst du heute dort?',
  wasItOnBody: 'Ein Tippen zeigt allen nach dir, dass er wirklich stattgefunden hat.',
  wasItOnYes: 'Ja, er hat stattgefunden',
  wasItOnNo: 'Nein',
  wasItOnThanks: 'Danke.',
  wasItOnThanksBody: 'So stimmt, was hier steht.',
  claimWaiting: (n) => (n === 1 ? 'Jemand wartet auf den nächsten Termin.' : `${n} Leute warten auf den nächsten Termin.`),
  photo: 'Foto',
  regionDescription: (n, towns, region, code, next) =>
    `${n} ${n === 1 ? 'Flohmarkt' : 'Flohmärkte'} in ${towns} ${towns === 1 ? 'Ort' : 'Orten'} ${inRegionDe(region, code)}${next ? `. Nächster: ${next.name} in ${next.city} am ${next.date}` : ''}. Mit Öffnungszeiten und Absagen.`,
  cityNext: (name, date, time, venue) =>
    `Der nächste ist ${name} am ${date}${time ? `, ${time} Uhr` : ''}, ${venue}.`,
  cityNoDate: 'Noch kein nächster Termin.',
  cityDescription: (city, name, date, time, venue, n, months) =>
    `Nächster Flohmarkt in ${city}: ${name} am ${date}${time ? `, ${time} Uhr` : ''}, ${venue}. ${n} ${n === 1 ? 'Termin' : 'Termine'} in den nächsten ${months} Monaten, mit Öffnungszeiten und Absagen.`,
  cityIntro: (city, region, code) =>
    `Alle bekannten Flohmärkte in ${city}, ${regionLabelDe(region, code)} — mit Terminen, Öffnungszeiten und Absagen. Abgesagte Termine bleiben sichtbar.`,
  lastChecked: (date) => `geprüft am ${date}`,
  inNextMonths: (n) => `in den nächsten ${n} Monaten`,

  citiesLede: '',
  regionsLede: 'Für Wochenenden, an denen in deiner Stadt nichts läuft.',
  typesLede: 'Der Streifen am Termin zeigt die Art des Markts.',

  faq: [
    { q: 'Findet er wirklich statt?',
      a: 'Bei jedem Termin steht, wann er zuletzt geprüft wurde. Hat der Veranstalter ihn bestätigt, steht das dabei. Ist er noch nicht bestätigt, steht auch das dabei.' },
    { q: 'Und wenn es regnet?',
      a: 'Die meisten Märkte finden trotzdem statt. Ein abgesagter Termin bleibt auf der Seite und ist als „abgesagt“ markiert. Hallenmärkte erkennst du an „drinnen“.' },
    { q: 'Kostet das etwas?',
      a: 'fynda.market ist kostenlos und ohne Werbung. Die meisten Märkte sind auch gratis; ein Eintritt steht auf der Seite des Markts.' },
    { q: 'Ich organisiere einen Markt.',
      a: 'Er ist wahrscheinlich schon eingetragen. Übernehmen Sie ihn: Termine bestätigen, ein Foto ergänzen, einen Tag absagen. Kostenlos, kein Konto nötig.' },
  ],

  footerTagline: 'Flohmärkte – und ob sie stattfinden.',
  footerFynda: 'fynda.market',
  footerLegal: 'Rechtliches',
  footerOrganisers: 'Für Veranstalter',
  footerNewsletter: 'Newsletter',
  footerReport: 'Problem melden',
  footerNearby: 'In der Nähe',
  footerImprint: 'Impressum',
  footerPrivacy: 'Datenschutz',
  footerTerms: 'Nutzungsbedingungen',
  footerCookies: 'Cookies',
  cookieTitle: 'Cookies?',
  cookieBody: 'Damit sehen wir, wie fynda.market genutzt wird, und können die Seite verbessern. Nie mit dir als Person verknüpft, nie verkauft.',
  cookieMore: 'Mehr dazu',
  cookieAccept: 'Einverstanden',
  cookieEssential: 'Nur notwendige',
  footerAbout: 'Über fynda.market',

  regionHeading: (n, region, year, code) =>
    n === 1 ? `Der Flohmarkt ${inRegionDe(region, code)}${year ? ` ${year}` : ''}` : `Die ${n} Flohmärkte ${inRegionDe(region, code)}${year ? ` ${year}` : ''}`,
  regionIntro: (region, code) =>
    `Alle bekannten Flohmärkte ${inRegionDe(region, code)} — nach Ort und Datum, mit Öffnungszeiten und Absagen. Abgesagte Termine bleiben sichtbar.`,

  regionLabel: regionLabelDe,

  marketCount: (n) => `${n} ${n === 1 ? 'Markt' : 'Märkte'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'Termin' : 'Termine'}`,

  scopeRegion: (label) => `im ${label}`,
  subscribeScopeRegion: (name) => `für ${name}`,
  scopeRadius: (km, city) => `im Umkreis von ${km} km um ${city}`,
  nearbyHeading: (km) => `Im Umkreis von ${km} km`,
  nearbyLede: (city) => `Die nächsten Termine in den Orten um ${city}.`,
  subscribeBodyScope: (scope) => `Eine E-Mail am Freitagmorgen: die Märkte am Wochenende ${scope} – und welche abgesagt wurden.`,
  subscribeTitle: (town) => (town ? `Das Wochenende rund um ${town}, im Postfach` : 'Das Wochenende in deiner Nähe, im Postfach'),
  subscribeSend: 'Schick sie mir',
  subscribeBodyPick: 'Eine E-Mail am Freitagmorgen: die Märkte am Wochenende in der Region, die du unten wählst – und welche abgesagt wurden.',
  subscribeRegionLabel: 'Region',
  subscribeAnywhere: 'Überall',
  newsletterTitle: 'Newsletter',
  newsletterBody: 'Jeden Freitag: was am Wochenende in deiner Nähe läuft.',
  newsletterAction: 'Newsletter abonnieren',
  organiserTitle: 'Für Veranstalter',
  claimTitle: 'Ist das Ihr Markt?',
  claimBody: 'Übernehmen Sie ihn: Termine bestätigen, ein Foto ergänzen, einen Tag absagen. Kostenlos, kein Konto nötig.',
  claimAction: 'Das ist mein Markt',
  organiserConfirmedOn: (date) => `Vom Veranstalter bestätigt, ${date}`,
  stallsLabel: 'Stände',
  setting: { indoor: 'drinnen', outdoor: 'draussen', both: 'drinnen und draussen' },
  soldLabel: 'Was es gibt',
  tagLabels: { antiques: 'Antiquitäten', furniture: 'Möbel', clothes: 'Kleidung', records_books: 'Platten & Bücher', kids: 'Kindersachen', food: 'Essen & Trinken' },
  rain: { runs: 'Findet statt', cancelled: 'Abgesagt', decided_on_the_day: 'Wird am Morgen entschieden' },
  organiserBody: 'Übernehmen Sie Ihren Markt oder tragen Sie einen neuen ein. Kostenlos, kein Konto nötig.',
  organiserAction: 'Markt übernehmen oder eintragen',

  weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  weekdaysLong: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  monthsShort: ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'],
  monthsLong: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
  ],
  timeSuffix: 'Uhr',
};

const en: Strings = {
  saved: 'Saved',
  skipToContent: 'Skip to content',
  backToHome: 'Back to the home page',
  languageLabel: 'Language',
  navLabel: 'Main navigation',

  notFoundTitle: 'Page not found — fynda.market',
  notFoundHeading: 'This page does not exist.',
  notFoundBody: 'The market may have moved, or the address may be wrong. Every market is reachable from the home page.',

  homeTitle: (countries) => `Flea markets ${inCountries('en', countries)} — fynda.market`,
  homeDescription: (countries) => `Flea markets ${inCountries('en', countries)} with dates, opening hours and the day each date was last checked. Cancellations stay visible. Free, no ads.`,
  heroLine1: 'You never know',
  heroLine2: "what you'll find.",
  whereLabel: 'Where',
  closeSheet: 'Close',
  whenLabel: 'When',
  howFarLabel: 'How far',
  pickTown: 'Pick a town',
  townSearchLabel: 'Find a town',
  townSearchPlaceholder: 'Type a town',
  townNoMatch: "We don't cover that town yet. Try a bigger one nearby.",
  bigTownsLabel: 'Or jump to a city',
  lastTime: 'Last time',
  nearTown: (town) => `Near ${town}`,
  nearYou: 'Near you',
  distanceBand: (from, to) => (from === 0 ? `Within ${to} km` : `${from}–${to} km`),
  nearMe: 'Near me',
  locating: 'Locating…',
  yourLocation: 'Your location',
  tryAgain: 'Try my location again',
  geoHint: 'Uses your location once. Not stored.',
  showCount: (n) => `Show ${n} ${n === 1 ? 'market' : 'markets'}`,
  noDistancesYet: 'by date. Pick a town or use your location to sort by distance.',
  askingPhone: 'Asking your phone where you are…',
  upcoming: (n) => n === 1 ? 'Upcoming date' : 'Upcoming dates',
  homePromise: () => 'We find the flea markets. You do the hunting.',
  homeOrganiserAsk: 'Run a market?',
  homeOrganiserAction: 'Claim your page',
  thisWeekend: 'This weekend',
  allWeekend: (n) => `All ${n} this weekend`,
  allDates: (n) => `All ${n} dates`,
  yourTown: 'Your town',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'market' : 'markets'}, ${from}${to === from ? '' : ` and ${to}`}`,
  cities: 'Towns',
  regionsOf: (code) => (code === 'CH' ? 'Cantons' : 'States'),
  countryCount: (markets, towns) => `${markets} markets · ${towns} ${towns === 1 ? 'town' : 'towns'}`,
  marketTypes: 'Market types',
  questions: 'Questions',
  cancelledThisWeek: 'Cancelled this week',
  nothingInPeriod: 'No markets in this period.',
  noDateYet: 'No date yet',
  noDateYetLede: (n) => (n === 1 ? "Its next date isn't out yet. Open it and we'll tell you when it is." : "Their next dates aren't out yet. Open one and we'll tell you when it has one."),
  radiusTitle: 'Flea markets near me — fynda.market',
  radiusDescription: 'Flea markets near you: choose a radius and a period, sorted by distance.',
  radiusHeading: 'Flea markets near me',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'market' : 'markets'} within ${km} km of you, nearest first.`,
  radiusDenied: 'Location not shared. Pick a town instead, or try again.',
  radiusUseLocation: 'Use my location',
  radiusGroup: 'Radius',
  nothingForSelection: 'No markets in this period. Try a larger radius or another period.',

  filterAll: 'All',
  filterToday: 'Today',
  filterWeekend: 'This weekend',
  filterDate: 'Date',
  calendarPrev: 'Previous month',
  calendarNext: 'Next month',
  calendarHint: 'Only days with markets can be chosen.',
  filterPeriodLabel: 'Period',

  route: 'Directions',
  organiserWebsite: "Organiser's website",
  organiser: 'Organiser',
  addToCalendar: 'Add to calendar',
  save: 'Save',
  savedState: 'Saved',
  gettingThere: 'Getting there',
  dates: 'Dates',
  wasItDifferent: 'Something not right?',
  reportIntro: 'A date moved, a cancellation, a wrong address: tell us and a person checks it.',
  reportDidNotHappen: "Didn't happen",
  reportEndedEarly: 'Was already over',
  reportSomethingElse: 'Something else',
  confirmedOn: (date) => `Checked ${date}`,
  organiserConfirmed: 'Confirmed by the organiser',
  statusToday: 'Today',
  statusTomorrow: 'Tomorrow',
  onRightNow: 'on right now',
  opensIn: 'Opens in {t}',
  closesIn: 'Closes in {t}',
  overToday: 'Over for today',
  todayRange: 'Today, {t}',
  nextOn: 'Next: {d}',
  spanH: '{h} h',
  spanM: '{m} min',
  spanHM: '{h} h {m} min',
  nearbyToday: 'Also today, nearby',
  nearbyTomorrow: 'Also tomorrow, nearby',
  nearbyOn: (date) => `Also on ${date}, nearby`,
  nearbyStillOpen: 'Still open nearby',
  straightLine: 'Distances as the crow flies.',
  share: 'Share',
  linkCopied: 'Link copied',
  fromTown: 'from {town}',
  howOften: 'How often',
  flagCancelled: 'Cancelled',
  flagUnconfirmed: 'Not confirmed yet',
  flagStale: (date) => `Last checked ${date}`,
  notConfirmed: 'Not confirmed yet',
  entryLabel: 'Entry',
  hostedBy: (name) => `Organised by ${name}`,
  fromTheOrganiser: 'From the organiser',
  bookAStall: 'Book a stall',

  cityHeading: (n, city, year) =>
    n === 1 ? `The flea market in ${city}${year ? ` ${year}` : ''}` : `The ${n} flea markets in ${city}${year ? ` ${year}` : ''}`,
  titleNext: (date) => `next on ${date}`,
  marketTitle: (name, venue, city, year) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')}${year ? ` – Dates ${year}` : ''}`,
  marketTitleNext: (name, venue, city, when) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')} – next on ${when}`,
  marketTitleDate: (name, city, when) => `${[name, city].filter(Boolean).join(', ')} – ${when}`,
  marketNoDateDescription: (kind, city, venue, rhythm, last) =>
    `${kind} in ${city}${venue ? `, ${venue}` : ''}. ${rhythm ? `${rhythm}. ` : ''}${last ? `Last held ${last}. ` : ''}The next date is not confirmed yet — we check and list it as soon as it is set.`,
  marketSnippet: (date, time, place, setting, later) =>
    `${date}${time ? `, ${time}` : ''}, ${place}${setting ? `, ${setting}` : ''}.${later.length ? ` Then ${later.join(' and ')}.` : ''}`,
  cityLast: (name, date) => `Last: ${name} on ${date}.`,
  lastHeld: (date) => `Last held ${date}`,
  backIn: (month) => `Back in ${month}`,
  usuallyIn: (month) => `Usually in ${month}`,
  meanwhileNearby: 'Meanwhile, nearby',
  allMarketsIn: (town) => `All markets in ${town}`,
  settingLabel: 'Setting',
  sellersLabel: 'Who sells',
  sellers: { private: 'Private people', mixed: 'Private people and dealers', trader: 'Dealers' },
  rainLabel: 'If it rains',
  townsNearby: 'Towns nearby',
  alertEyebrow: "When it's back",
  alertTitleMarket: "Tell me when it's back",
  alertTitleTown: (town) => `Tell me when ${town} has a date`,
  alertBodyMarket: (name) => `One email, the day ${name} puts out its next date. Nothing else.`,
  alertBodyTown: (town) => `One email, the day a market in ${town} puts out its next date. Nothing else.`,
  alertWeekly: (town) => `Also send me the weekend around ${town}, every Friday morning`,
  alertSend: 'Tell me',
  alertDone: "Done. You'll get one email, the day the date is out.",
  earlierThisYear: 'Earlier this year',
  earlierSummary: (n, weekday, since, cancelled) =>
    `${n} ${weekday === undefined ? 'dates' : ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'][weekday]} since ${since}, ${cancelled ? `${cancelled} cancelled` : 'none cancelled'}.`,
  seenOn: 'Seen on',
  wasItOnTitle: (date) => `Were you there on ${date}?`,
  wasItOnToday: 'Were you there today?',
  wasItOnBody: 'One tap tells the next person it really happened.',
  wasItOnYes: 'Yes, it was on',
  wasItOnNo: "No, it wasn't",
  wasItOnThanks: 'Thank you.',
  wasItOnThanksBody: "That's how this page stays true.",
  claimWaiting: (n) => (n === 1 ? 'One person is waiting for its next date.' : `${n} people are waiting for its next date.`),
  photo: 'Photo',
  regionDescription: (n, towns, region, code, next) =>
    `${n} flea ${n === 1 ? 'market' : 'markets'} in ${towns} ${towns === 1 ? 'town' : 'towns'} ${inRegionEn(region, code)}${next ? `. Next: ${next.name} in ${next.city} on ${next.date}` : ''}. With opening hours and cancellations.`,
  cityNext: (name, date, time, venue) =>
    `The next one is ${name} on ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: 'No next date yet.',
  cityDescription: (city, name, date, time, venue, n, months) =>
    `Next flea market in ${city}: ${name} on ${date}${time ? `, ${time}` : ''}, ${venue}. ${n} ${n === 1 ? 'date' : 'dates'} in the next ${months} months, with opening hours and cancellations.`,
  cityIntro: (city, region, code) =>
    `Every known flea market in ${city}, ${code === 'CH' ? `canton of ${region}` : region} — with dates, opening hours and cancellations. Cancelled dates stay visible.`,
  lastChecked: (date) => `checked ${date}`,
  inNextMonths: (n) => `in the next ${n} months`,

  citiesLede: '',
  regionsLede: 'For when your own town has a quiet weekend.',
  typesLede: 'The stripe on a date shows the kind of market.',

  faq: [
    { q: 'Is it actually on?',
      a: "Every date shows when it was last checked. When the organiser has confirmed it, the date says so. When it isn't confirmed yet, it says that too." },
    { q: 'What if it rains?',
      a: 'Most markets go ahead. A cancelled date stays on the page and says cancelled. Indoor markets say indoor.' },
    { q: 'Does it cost anything?',
      a: "fynda.market is free and has no ads. Most markets are free too; an entry fee is shown on the market's page." },
    { q: 'I run a market.',
      a: "It's probably already listed. Claim it to confirm dates, add a photo or cancel a day. Free, no account needed." },
  ],

  footerTagline: "Flea markets, and whether they're on.",
  footerFynda: 'fynda.market',
  footerLegal: 'Legal',
  footerOrganisers: 'For organisers',
  footerNewsletter: 'Newsletter',
  footerReport: 'Report a problem',
  footerNearby: 'Near me',
  footerImprint: 'Imprint',
  footerPrivacy: 'Privacy',
  footerTerms: 'Terms',
  footerCookies: 'Cookies',
  cookieTitle: 'Cookies?',
  cookieBody: 'We use them to see how fynda.market is used and make it better. Never linked to you as a person, never sold.',
  cookieMore: 'More',
  cookieAccept: 'Accept',
  cookieEssential: 'Only essential',
  footerAbout: 'About fynda.market',

  regionHeading: (n, region, year, code) =>
    n === 1 ? `The flea market ${inRegionEn(region, code)}${year ? ` ${year}` : ''}` : `The ${n} flea markets ${inRegionEn(region, code)}${year ? ` ${year}` : ''}`,
  regionIntro: (region, code) =>
    `Every known flea market ${inRegionEn(region, code)} — by town and by date, with opening hours and cancellations. Cancelled dates stay visible.`,

  regionLabel: regionLabelEn,

  marketCount: (n) => `${n} ${n === 1 ? 'market' : 'markets'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'date' : 'dates'}`,

  scopeRegion: (label) => `in the ${label}`,
  subscribeScopeRegion: (name) => `for ${name}`,
  scopeRadius: (km, city) => `within ${km} km of ${city}`,
  nearbyHeading: (km) => `Within ${km} km`,
  nearbyLede: (city) => `The next dates in the towns around ${city}.`,
  subscribeBodyScope: (scope) => `One email on Friday morning: the weekend's markets ${scope}, and any that were called off.`,
  subscribeTitle: (town) => (town ? `The weekend around ${town}, in your inbox` : 'The weekend near you, in your inbox'),
  subscribeSend: 'Send it to me',
  subscribeBodyPick: "One email on Friday morning: the weekend's markets in the region you pick below, and any that were called off.",
  subscribeRegionLabel: 'Region',
  subscribeAnywhere: 'Anywhere',
  newsletterTitle: 'Newsletter',
  newsletterBody: "Every Friday: what's on this weekend near you.",
  newsletterAction: 'Subscribe',
  organiserTitle: 'For organisers',
  claimTitle: 'Is this your market?',
  claimBody: 'Claim it to confirm dates, add a photo or cancel a day. Free, no account needed.',
  claimAction: 'This is my market',
  organiserConfirmedOn: (date) => `Confirmed by the organiser, ${date}`,
  stallsLabel: 'Stalls',
  setting: { indoor: 'indoor', outdoor: 'outdoor', both: 'indoor and outdoor' },
  soldLabel: "What's sold",
  tagLabels: { antiques: 'antiques', furniture: 'furniture', clothes: 'clothes', records_books: 'records & books', kids: "kids' things", food: 'food & drink' },
  rain: { runs: 'Goes ahead', cancelled: 'Called off', decided_on_the_day: 'Decided that morning' },
  organiserBody: 'Claim your market or add a new one. Free, no account needed.',
  organiserAction: 'Claim or add your market',

  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  weekdaysLong: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  monthsLong: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  timeSuffix: '',
};

// Interface strings are written per language (CLAUDE.md §Settled). A missing
// key falls back to German rather than to a machine translation, which is both
// a quality decision and the thing Google's scaled-content policy is about.
/** "canton de Vaud" but "canton d'Argovie", "d'Obwald", "d'Uri": the elision French does before a vowel. */
const deFr = (name: string) => (/^[aeiouyàâéèêëîïôöûü]/i.test(name) ? `d'${name}` : `de ${name}`);

const fr: Strings = {
  saved: 'Enregistré',
  skipToContent: 'Passer au contenu',
  backToHome: "Retour à l'accueil",
  languageLabel: 'Langue',
  navLabel: 'Navigation principale',

  notFoundTitle: 'Page introuvable — fynda.market',
  notFoundHeading: "Cette page n'existe pas.",
  notFoundBody: "Le marché a peut-être déménagé, ou le lien est erroné. Vous retrouverez tous les marchés depuis la page d'accueil.",

  homeTitle: (countries) => `Brocantes ${inCountries('fr', countries)} — fynda.market`,
  homeDescription: (countries) => `Brocantes ${inCountries('fr', countries)} avec leurs dates, leurs horaires et le jour de leur dernière vérification. Les annulations restent affichées. Gratuit et sans publicité.`,
  heroLine1: 'On ne sait jamais',
  heroLine2: "ce qu'on va trouver.",
  whereLabel: 'Où',
  closeSheet: 'Fermer',
  whenLabel: 'Quand',
  howFarLabel: 'Distance',
  pickTown: 'Choisir une ville',
  townSearchLabel: 'Chercher une localité',
  townSearchPlaceholder: 'Tapez une localité',
  townNoMatch: "Nous ne couvrons pas encore cette localité. Essayez une ville plus grande à proximité.",
  bigTownsLabel: 'Ou choisissez directement une ville',
  lastTime: 'La dernière fois',
  nearTown: (town) => `Près de ${town}`,
  nearYou: 'Près de vous',
  distanceBand: (from, to) => (from === 0 ? `À moins de ${to} km` : `${from}–${to} km`),
  nearMe: 'Près de moi',
  locating: 'Localisation…',
  yourLocation: 'Votre position',
  tryAgain: 'Réessayer avec ma position',
  geoHint: "Votre position ne sert qu'une fois. Elle n'est pas enregistrée.",
  showCount: (n) => `Afficher ${n} ${n === 1 ? 'brocante' : 'brocantes'}`,
  noDistancesYet: 'par date. Choisissez une ville ou utilisez votre position pour trier par distance.',
  askingPhone: 'Demande de votre position en cours…',
  upcoming: (n) => n === 1 ? 'Prochaine date' : 'Prochaines dates',
  homePromise: () => 'Nous trouvons les brocantes. À vous de chiner.',
  homeOrganiserAsk: 'Vous organisez un marché ?',
  homeOrganiserAction: 'Prendre en main votre page',
  thisWeekend: 'Ce week-end',
  allWeekend: (n) => `Les ${n} du week-end`,
  allDates: (n) => `Les ${n} dates`,
  yourTown: 'Votre ville',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'brocante' : 'brocantes'}, ${from}${to === from ? '' : ` et ${to}`}`,
  cities: 'Localités',
  regionsOf: () => 'Cantons',
  countryCount: (markets, towns) => `${markets} brocantes · ${towns} ${towns === 1 ? 'localité' : 'localités'}`,
  marketTypes: 'Types de marché',
  questions: 'Questions',
  cancelledThisWeek: 'Annulé cette semaine',
  nothingInPeriod: 'Pas de brocante sur cette période.',
  noDateYet: 'Pas encore de date',
  noDateYetLede: (n) => (n === 1 ? "Sa prochaine date n'est pas encore connue. Ouvrez sa page : nous vous préviendrons dès qu'elle sera annoncée." : "Leurs prochaines dates ne sont pas encore connues. Ouvrez une page : nous vous préviendrons dès qu'une date sera annoncée."),
  radiusTitle: 'Brocantes à proximité — fynda.market',
  radiusDescription: 'Les brocantes près de chez vous, triées par distance. Choisissez un rayon et une période.',
  radiusHeading: 'Brocantes à proximité',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'brocante' : 'brocantes'} dans un rayon de ${km} km, les plus proches d'abord.`,
  radiusDenied: 'Position non partagée. Choisissez une ville, ou réessayez.',
  radiusUseLocation: 'Utiliser ma position',
  radiusGroup: 'Rayon',
  nothingForSelection: 'Pas de brocante sur cette période. Essayez un rayon plus grand ou une autre période.',

  filterAll: 'Tous',
  filterToday: "Aujourd'hui",
  filterWeekend: 'Ce week-end',
  filterDate: 'Date',
  calendarPrev: 'Mois précédent',
  calendarNext: 'Mois suivant',
  calendarHint: 'Seuls les jours de brocante peuvent être choisis.',
  filterPeriodLabel: 'Période',

  route: 'Itinéraire',
  organiserWebsite: "Site de l'organisateur",
  organiser: 'Organisateur',
  addToCalendar: 'Ajouter au calendrier',
  save: 'Enregistrer',
  savedState: 'Enregistré',
  gettingThere: "Comment s'y rendre",
  dates: 'Dates',
  wasItDifferent: 'Quelque chose ne va pas ?',
  reportIntro: "Une date déplacée, une annulation, une adresse erronée : dites-le-nous, quelqu'un vérifiera.",
  reportDidNotHappen: "N'a pas eu lieu",
  reportEndedEarly: "C'était déjà fini",
  reportSomethingElse: 'Autre chose',
  confirmedOn: (date) => `Vérifié le ${date}`,
  organiserConfirmed: "Confirmé par l'organisateur",
  statusToday: "Aujourd'hui",
  statusTomorrow: 'Demain',
  onRightNow: 'en cours',
  opensIn: 'Ouvre dans {t}',
  closesIn: 'Ferme dans {t}',
  overToday: "Terminé pour aujourd'hui",
  todayRange: "Aujourd'hui, {t}",
  nextOn: 'Prochaine date : {d}',
  spanH: '{h} h',
  spanM: '{m} min',
  spanHM: '{h} h {m}',
  nearbyToday: "Aussi aujourd'hui, tout près",
  nearbyTomorrow: 'Aussi demain, tout près',
  nearbyOn: (date) => `Aussi le ${date}, tout près`,
  nearbyStillOpen: 'Encore ouverts tout près',
  straightLine: "Distances à vol d'oiseau.",
  share: 'Partager',
  linkCopied: 'Lien copié',
  fromTown: 'de {town}',
  howOften: 'Fréquence',
  flagCancelled: 'Annulé',
  flagUnconfirmed: 'Pas encore confirmé',
  flagStale: (date) => `Vérifié le ${date}`,
  notConfirmed: 'Pas encore confirmé',
  entryLabel: 'Entrée',
  hostedBy: (name) => `Organisé par ${name}`,
  fromTheOrganiser: "De l'organisateur",
  bookAStall: 'Réserver un stand',

  cityHeading: (n, city, year) =>
    n === 1 ? `La brocante à ${city}${year ? ` ${year}` : ''}` : `Les ${n} brocantes à ${city}${year ? ` ${year}` : ''}`,
  titleNext: (date) => `prochaine date ${date}`,
  marketTitle: (name, venue, city, year) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')}${year ? ` – Dates ${year}` : ''}`,
  marketTitleNext: (name, venue, city, when) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')} – prochaine date ${when}`,
  marketTitleDate: (name, city, when) => `${[name, city].filter(Boolean).join(', ')} – ${when}`,
  marketNoDateDescription: (kind, city, venue, rhythm, last) =>
    `${kind} à ${city}${venue ? `, ${venue}` : ''}. ${rhythm ? `${rhythm}. ` : ''}${last ? `Dernière édition le ${last}. ` : ''}La prochaine date n'est pas encore confirmée — nous la vérifions et l'ajoutons dès qu'elle est fixée.`,
  marketSnippet: (date, time, place, setting, later) =>
    `${date}${time ? `, ${time}` : ''}, ${place}${setting ? `, ${setting}` : ''}.${later.length ? ` Puis ${later.join(' et ')}.` : ''}`,
  cityLast: (name, date) => `Dernière : ${name}, le ${date}.`,
  lastHeld: (date) => `Dernière édition le ${date}`,
  backIn: (month) => `De retour en ${month}`,
  usuallyIn: (month) => `D'habitude en ${month}`,
  meanwhileNearby: 'En attendant, tout près',
  allMarketsIn: (town) => `Tous les marchés à ${town}`,
  settingLabel: 'Cadre',
  sellersLabel: 'Exposants',
  sellers: { private: 'Particuliers', mixed: 'Particuliers et professionnels', trader: 'Professionnels' },
  rainLabel: "S'il pleut",
  townsNearby: 'Localités voisines',
  alertEyebrow: 'Prochaine date',
  alertTitleMarket: 'Prévenez-moi de son retour',
  alertTitleTown: (town) => `Prévenez-moi dès qu'il y a une date à ${town}`,
  alertBodyMarket: (name) => `Un seul e-mail, le jour où ${name} annonce sa prochaine date. Rien d'autre.`,
  alertBodyTown: (town) => `Un seul e-mail, le jour où un marché à ${town} annonce sa prochaine date. Rien d'autre.`,
  alertWeekly: (town) => `Envoyez-moi aussi, chaque vendredi matin, les brocantes du week-end autour de ${town}`,
  alertSend: 'Prévenez-moi',
  alertDone: "C'est noté. Vous recevrez un seul e-mail, le jour où la date sera annoncée.",
  earlierThisYear: 'Plus tôt cette année',
  /* "dates" is feminine, every weekday masculine: the agreement follows. */
  earlierSummary: (n, weekday, since, cancelled) => {
    const noun = weekday === undefined ? 'dates' : ['dimanches', 'lundis', 'mardis', 'mercredis', 'jeudis', 'vendredis', 'samedis'][weekday];
    const f = weekday === undefined;
    return `${n} ${noun} depuis le ${since}, ${cancelled ? `${cancelled} ${f ? 'annulée' : 'annulé'}${cancelled > 1 ? 's' : ''}` : f ? 'aucune annulée' : 'aucun annulé'}.`;
  },
  seenOn: 'A eu lieu',
  wasItOnTitle: (date) => `Vous y étiez le ${date} ?`,
  wasItOnToday: "Vous y étiez aujourd'hui ?",
  wasItOnBody: "Un clic, et le prochain visiteur saura que le marché a bien eu lieu.",
  wasItOnYes: 'Oui, il a bien eu lieu',
  wasItOnNo: 'Non',
  wasItOnThanks: 'Merci.',
  wasItOnThanksBody: "C'est comme ça que cette page reste exacte.",
  claimWaiting: (n) => (n === 1 ? 'Une personne attend sa prochaine date.' : `${n} personnes attendent sa prochaine date.`),
  photo: 'Photo',
  regionDescription: (n, towns, region, _code, next) =>
    `${n} ${n === 1 ? 'brocante' : 'brocantes'} dans ${towns} ${towns === 1 ? 'localité' : 'localités'} du canton ${deFr(region)}${next ? `. Prochaine : ${next.name} à ${next.city} le ${next.date}` : ''}. Avec horaires et annulations.`,
  cityNext: (name, date, time, venue) =>
    `La prochaine est ${name}, le ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: 'Pas encore de prochaine date.',
  cityDescription: (city, name, date, time, venue, n, months) =>
    `Prochaine brocante à ${city} : ${name}, le ${date}${time ? `, ${time}` : ''}, ${venue}. ${n} ${n === 1 ? 'date' : 'dates'} dans les ${months} prochains mois, avec horaires et annulations.`,
  cityIntro: (city, region) =>
    `Toutes les brocantes connues à ${city}, canton ${deFr(region)} — dates, horaires et annulations. Les dates annulées restent visibles.`,
  lastChecked: (date) => `vérifié le ${date}`,
  inNextMonths: (n) => `dans les ${n} prochains mois`,

  citiesLede: '',
  regionsLede: "Pour les week-ends où il ne se passe rien dans votre commune.",
  typesLede: 'La bande sur une date indique le type de brocante.',

  faq: [
    { q: 'A-t-elle vraiment lieu ?',
      a: "Chaque date indique quand elle a été vérifiée pour la dernière fois. Si l'organisateur l'a confirmée, c'est écrit. Si elle n'est pas encore confirmée, c'est écrit aussi." },
    { q: "Et s'il pleut ?",
      a: 'La plupart des brocantes sont maintenues. Une date annulée reste affichée, avec la mention « annulé ». Les brocantes couvertes portent la mention « en intérieur ».' },
    { q: 'Est-ce payant ?',
      a: "fynda.market est gratuit et sans publicité. La plupart des brocantes le sont aussi ; quand l'entrée est payante, c'est indiqué sur sa page." },
    { q: "J'organise une brocante.",
      a: 'Elle est probablement déjà répertoriée. Prenez-la en main pour confirmer vos dates, ajouter une photo ou annuler une journée. Gratuit, sans compte à créer.' },
  ],

  footerTagline: 'Les brocantes, et si elles ont bien lieu.',
  footerFynda: 'fynda.market',
  footerLegal: 'Informations légales',
  footerOrganisers: 'Pour les organisateurs',
  footerNewsletter: 'Newsletter',
  footerReport: 'Signaler un problème',
  footerNearby: 'À proximité',
  footerImprint: 'Mentions légales',
  footerPrivacy: 'Confidentialité',
  footerTerms: "Conditions d'utilisation",
  footerCookies: 'Cookies',
  cookieTitle: 'Des cookies ?',
  cookieBody: "Ils nous servent à comprendre comment fynda.market est utilisé, pour l'améliorer. Jamais reliés à votre personne, jamais vendus.",
  cookieMore: 'En savoir plus',
  cookieAccept: "D'accord",
  cookieEssential: 'Seulement le nécessaire',
  footerAbout: 'À propos',

  regionHeading: (n, region, year) =>
    n === 1 ? `La brocante dans le canton ${deFr(region)}${year ? ` ${year}` : ''}` : `Les ${n} brocantes dans le canton ${deFr(region)}${year ? ` ${year}` : ''}`,
  regionIntro: (region) =>
    `Toutes les brocantes connues dans le canton ${deFr(region)} — par commune et par date, avec les horaires et les annulations. Les dates annulées restent visibles.`,

  regionLabel: (region) => `Canton ${deFr(region)}`,

  marketCount: (n) => `${n} ${n === 1 ? 'brocante' : 'brocantes'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'date' : 'dates'}`,

  scopeRegion: (label) => `dans le ${label}`,
  subscribeScopeRegion: (name) => `pour ${name}`,
  scopeRadius: (km, city) => `dans un rayon de ${km} km autour de ${city}`,
  nearbyHeading: (km) => `Dans un rayon de ${km} km`,
  nearbyLede: (city) => `Les prochaines dates dans les localités autour de ${city}.`,
  subscribeBodyScope: (scope) => `Un e-mail le vendredi matin : les brocantes du week-end ${scope}, et celles qui sont annulées.`,
  subscribeTitle: (town) => (town ? `Le week-end autour de ${town}, dans votre boîte mail` : 'Le week-end près de chez vous, dans votre boîte mail'),
  subscribeSend: 'Je veux le recevoir',
  subscribeBodyPick: 'Un e-mail le vendredi matin : les brocantes du week-end dans la région choisie ci-dessous, et celles qui sont annulées.',
  subscribeRegionLabel: 'Région',
  subscribeAnywhere: 'Partout',
  newsletterTitle: 'Newsletter',
  newsletterBody: 'Chaque vendredi : ce qui se passe ce week-end près de chez vous.',
  newsletterAction: "S'abonner à la newsletter",
  organiserTitle: 'Pour les organisateurs',
  claimTitle: "C'est votre brocante ?",
  claimBody: 'Prenez-la en main pour confirmer vos dates, ajouter une photo ou annuler une journée. Gratuit, sans compte à créer.',
  claimAction: "C'est ma brocante",
  organiserConfirmedOn: (date) => `Confirmé par l'organisateur, ${date}`,
  stallsLabel: 'Stands',
  setting: { indoor: 'en intérieur', outdoor: 'en extérieur', both: 'intérieur et extérieur' },
  soldLabel: 'On y trouve',
  tagLabels: { antiques: 'antiquités', furniture: 'meubles', clothes: 'vêtements', records_books: 'disques & livres', kids: "affaires d'enfants", food: 'à boire et à manger' },
  rain: { runs: 'A lieu quand même', cancelled: 'Annulé', decided_on_the_day: 'Décidé le matin même' },
  organiserBody: 'Prenez votre brocante en main, ou ajoutez-en une nouvelle. Gratuit, sans compte à créer.',
  organiserAction: 'Prendre en main ou ajouter ma brocante',

  weekdaysShort: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
  weekdaysLong: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  monthsShort: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  monthsLong: [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ],
  timeSuffix: '',
};

const it: Strings = {
  saved: 'Salvato',
  skipToContent: 'Vai al contenuto',
  backToHome: 'Torna alla pagina iniziale',
  languageLabel: 'Lingua',
  navLabel: 'Navigazione principale',

  notFoundTitle: 'Pagina non trovata — fynda.market',
  notFoundHeading: 'Questa pagina non esiste.',
  notFoundBody: "Il mercatino potrebbe aver cambiato indirizzo, oppure l'indirizzo non è corretto. Dalla pagina iniziale si raggiunge ogni mercatino.",

  homeTitle: (countries) => `Mercatini delle pulci ${inCountries('it', countries)} — fynda.market`,
  homeDescription: (countries) => `Mercatini delle pulci ${inCountries('it', countries)} con date, orari e giorno dell'ultima verifica. Le cancellazioni restano visibili. Gratis, senza pubblicità.`,
  heroLine1: 'Non si sa mai',
  heroLine2: 'cosa si trova.',
  whereLabel: 'Dove',
  closeSheet: 'Chiudi',
  whenLabel: 'Quando',
  howFarLabel: 'Distanza',
  pickTown: 'Scegli una località',
  townSearchLabel: 'Cerca una località',
  townSearchPlaceholder: 'Scrivi una località',
  townNoMatch: 'Questa località non la copriamo ancora. Prova con una più grande qui vicino.',
  bigTownsLabel: 'Oppure direttamente in una città',
  lastTime: "L'ultima volta",
  nearTown: (town) => `Vicino a ${town}`,
  nearYou: 'Vicino a te',
  distanceBand: (from, to) => (from === 0 ? `Entro ${to} km` : `${from}–${to} km`),
  nearMe: 'Vicino a me',
  locating: 'Localizzazione…',
  yourLocation: 'La sua posizione',
  tryAgain: 'Riprova con la posizione',
  geoHint: 'Usa la tua posizione una volta. Non viene salvata.',
  showCount: (n) => `Mostra ${n} ${n === 1 ? 'mercatino' : 'mercatini'}`,
  noDistancesYet: 'per data. Scegli una località o usa la tua posizione per ordinare per distanza.',
  askingPhone: 'Chiedo la posizione al telefono…',
  upcoming: (n) => n === 1 ? 'Prossima data' : 'Prossime date',
  homePromise: () => 'Noi troviamo i mercatini. A te la caccia.',
  homeOrganiserAsk: 'Organizzi un mercatino?',
  homeOrganiserAction: 'Prendi in mano la tua pagina',
  thisWeekend: 'Questo fine settimana',
  allWeekend: (n) => `Tutti i ${n} del fine settimana`,
  allDates: (n) => `Tutte le ${n} date`,
  yourTown: 'La vostra città',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'mercatino' : 'mercatini'}, ${from}${to === from ? '' : ` e ${to}`}`,
  cities: 'Località',
  regionsOf: () => 'Cantoni',
  countryCount: (markets, towns) => `${markets} mercatini · ${towns} ${towns === 1 ? 'località' : 'località'}`,
  marketTypes: 'Tipi di mercatino',
  questions: 'Domande',
  cancelledThisWeek: 'Cancellato questa settimana',
  nothingInPeriod: 'Nessun mercatino in questo periodo.',
  noDateYet: 'Ancora senza data',
  noDateYetLede: (n) => (n === 1 ? 'La prossima data non è ancora nota. Apri il mercatino e ti avvisiamo appena esce.' : 'Le prossime date non sono ancora note. Apri un mercatino e ti avvisiamo appena ne ha una.'),
  radiusTitle: 'Mercatini delle pulci nei dintorni — fynda.market',
  radiusDescription: 'Mercatini delle pulci nei dintorni: scelga raggio e periodo, ordinati per distanza.',
  radiusHeading: 'Mercatini delle pulci nei dintorni',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'mercatino' : 'mercatini'} entro ${km} km da lei, i più vicini prima.`,
  radiusDenied: 'Posizione non condivisa. Scegli una località, oppure riprova.',
  radiusUseLocation: 'Usare la mia posizione',
  radiusGroup: 'Raggio',
  nothingForSelection: 'Nessun mercatino in questo periodo. Prova un raggio più ampio o un altro periodo.',

  filterAll: 'Tutti',
  filterToday: 'Oggi',
  filterWeekend: 'Weekend',
  filterDate: 'Data',
  calendarPrev: 'Mese precedente',
  calendarNext: 'Mese successivo',
  calendarHint: 'Si possono scegliere solo i giorni con mercatini.',
  filterPeriodLabel: 'Periodo',

  route: 'Itinerario',
  organiserWebsite: "Sito dell'organizzatore",
  organiser: 'Organizzatore',
  addToCalendar: 'Aggiungi al calendario',
  save: 'Salva',
  savedState: 'Salvato',
  gettingThere: 'Come arrivare',
  dates: 'Date',
  wasItDifferent: 'Qualcosa non torna?',
  reportIntro: 'Una data spostata, una cancellazione, un indirizzo sbagliato: dicci, una persona controlla.',
  reportDidNotHappen: 'Non si è svolto',
  reportEndedEarly: 'Era già finito',
  reportSomethingElse: 'Altro',
  confirmedOn: (date) => `Verificato il ${date}`,
  organiserConfirmed: "Confermato dall'organizzatore",
  statusToday: 'Oggi',
  statusTomorrow: 'Domani',
  onRightNow: 'in corso',
  opensIn: 'Apre tra {t}',
  closesIn: 'Chiude tra {t}',
  overToday: 'Finito per oggi',
  todayRange: 'Oggi, {t}',
  nextOn: 'Prossima data: {d}',
  spanH: '{h} h',
  spanM: '{m} min',
  spanHM: '{h} h {m} min',
  nearbyToday: 'Anche oggi, qui vicino',
  nearbyTomorrow: 'Anche domani, qui vicino',
  nearbyOn: (date) => `Anche il ${date}, qui vicino`,
  nearbyStillOpen: 'Ancora aperti qui vicino',
  straightLine: "Distanze in linea d'aria.",
  share: 'Condividi',
  linkCopied: 'Link copiato',
  fromTown: 'da {town}',
  howOften: 'Cadenza',
  flagCancelled: 'Annullato',
  flagUnconfirmed: 'Non ancora confermato',
  flagStale: (date) => `Verificato il ${date}`,
  notConfirmed: 'Non ancora confermato',
  entryLabel: 'Ingresso',
  hostedBy: (name) => `Organizzato da ${name}`,
  fromTheOrganiser: "Dall'organizzatore",
  bookAStall: 'Prenota una bancarella',

  cityHeading: (n, city, year) =>
    n === 1 ? `Il mercatino delle pulci a ${city}${year ? ` ${year}` : ''}` : `I ${n} mercatini delle pulci a ${city}${year ? ` ${year}` : ''}`,
  titleNext: (date) => `prossima data ${date}`,
  marketTitle: (name, venue, city, year) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')}${year ? ` – Date ${year}` : ''}`,
  marketTitleNext: (name, venue, city, when) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')} – prossima data ${when}`,
  marketTitleDate: (name, city, when) => `${[name, city].filter(Boolean).join(', ')} – ${when}`,
  marketNoDateDescription: (kind, city, venue, rhythm, last) =>
    `${kind} a ${city}${venue ? `, ${venue}` : ''}. ${rhythm ? `${rhythm}. ` : ''}${last ? `Ultima edizione il ${last}. ` : ''}La prossima data non è ancora confermata — la verifichiamo e la inseriamo appena fissata.`,
  marketSnippet: (date, time, place, setting, later) =>
    `${date}${time ? `, ${time}` : ''}, ${place}${setting ? `, ${setting}` : ''}.${later.length ? ` Poi ${later.join(' e ')}.` : ''}`,
  cityLast: (name, date) => `L'ultimo: ${name} il ${date}.`,
  lastHeld: (date) => `Ultima edizione il ${date}`,
  /* "ad aprile", "ad agosto", but "a ottobre": the d goes only before an a. */
  backIn: (month) => `Torna ${month.startsWith('a') ? 'ad' : 'a'} ${month}`,
  usuallyIn: (month) => `Di solito ${month.startsWith('a') ? 'ad' : 'a'} ${month}`,
  meanwhileNearby: 'Nel frattempo, qui vicino',
  allMarketsIn: (town) => `Tutti i mercatini a ${town}`,
  settingLabel: 'Luogo',
  sellersLabel: 'Chi vende',
  sellers: { private: 'Privati', mixed: 'Privati e commercianti', trader: 'Commercianti' },
  rainLabel: 'Se piove',
  townsNearby: 'Località vicine',
  alertEyebrow: 'Prossima data',
  alertTitleMarket: 'Avvisami quando torna',
  alertTitleTown: (town) => `Avvisami quando c'è una data a ${town}`,
  alertBodyMarket: (name) => `Una sola e-mail, il giorno in cui ${name} annuncia la prossima data. Nient'altro.`,
  alertBodyTown: (town) => `Una sola e-mail, il giorno in cui un mercatino a ${town} annuncia la prossima data. Nient'altro.`,
  alertWeekly: (town) => `Mandami anche il fine settimana intorno a ${town}, ogni venerdì mattina`,
  alertSend: 'Avvisami',
  alertDone: "Fatto. Riceverai un'e-mail il giorno in cui esce la data.",
  earlierThisYear: "Prima, quest'anno",
  /* "date" and "domeniche" are feminine, the other weekdays masculine. */
  earlierSummary: (n, weekday, since, cancelled) => {
    const noun = weekday === undefined ? 'date' : ['domeniche', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabati'][weekday];
    const f = weekday === undefined || weekday === 0;
    return `${n} ${noun} dal ${since}, ${cancelled ? `${cancelled} ${f ? 'annullate' : 'annullati'}` : f ? 'nessuna annullata' : 'nessuno annullato'}.`;
  },
  seenOn: 'Si è svolto',
  wasItOnTitle: (date) => `Eri lì il ${date}?`,
  wasItOnToday: 'Eri lì oggi?',
  wasItOnBody: 'Un tocco dice al prossimo che si è svolto davvero.',
  wasItOnYes: "Sì, c'era",
  wasItOnNo: 'No',
  wasItOnThanks: 'Grazie.',
  wasItOnThanksBody: 'È così che questa pagina resta vera.',
  claimWaiting: (n) => (n === 1 ? 'Una persona aspetta la prossima data.' : `${n} persone aspettano la prossima data.`),
  photo: 'Foto',
  regionDescription: (n, towns, region, _code, next) =>
    `${n} ${n === 1 ? 'mercatino' : 'mercatini'} in ${towns} ${towns === 1 ? 'località' : 'località'} nel Canton ${region}${next ? `. Prossimo: ${next.name} a ${next.city} il ${next.date}` : ''}. Con orari e cancellazioni.`,
  cityNext: (name, date, time, venue) =>
    `Il prossimo è ${name} il ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: 'Ancora nessuna prossima data.',
  cityDescription: (city, name, date, time, venue, n, months) =>
    `Prossimo mercatino delle pulci a ${city}: ${name} il ${date}${time ? `, ${time}` : ''}, ${venue}. ${n} ${n === 1 ? 'data' : 'date'} nei prossimi ${months} mesi, con orari e cancellazioni.`,
  cityIntro: (city, region) =>
    `Tutti i mercatini delle pulci conosciuti a ${city}, Cantone ${region} — con date, orari di apertura e cancellazioni. Le date cancellate restano visibili.`,
  lastChecked: (date) => `verificato il ${date}`,
  inNextMonths: (n) => `nei prossimi ${n} mesi`,

  citiesLede: '',
  regionsLede: "Per i fine settimana in cui nella tua città non c'è niente.",
  typesLede: 'La striscia sulla data indica il tipo di mercatino.',

  faq: [
    { q: 'Si fa davvero?',
      a: "Ogni data mostra quando è stata verificata l'ultima volta. Se l'organizzatore l'ha confermata, c'è scritto. Se non è ancora confermata, c'è scritto anche quello." },
    { q: 'E se piove?',
      a: 'La maggior parte dei mercatini si fa comunque. Una data annullata resta sulla pagina con la scritta «annullato». I mercatini al coperto riportano «al coperto».' },
    { q: 'Costa qualcosa?',
      a: 'fynda.market è gratuito e senza pubblicità. Anche la maggior parte dei mercatini è gratis; un eventuale ingresso è indicato sulla pagina del mercatino.' },
    { q: 'Organizzo un mercatino.',
      a: 'Probabilmente è già in elenco. Prendilo in mano per confermare le date, aggiungere una foto o annullare una giornata. Gratis, senza account.' },
  ],

  footerTagline: 'I mercatini delle pulci, e se si fanno.',
  footerFynda: 'fynda.market',
  footerLegal: 'Note legali',
  footerOrganisers: 'Per gli organizzatori',
  footerNewsletter: 'Newsletter',
  footerReport: 'Segnalare un problema',
  footerNearby: 'Nei dintorni',
  footerImprint: 'Note legali',
  footerPrivacy: 'Privacy',
  footerTerms: 'Condizioni generali',
  footerCookies: 'Cookie',
  cookieTitle: 'Cookie?',
  cookieBody: 'Li usiamo per vedere come viene usato fynda.market e renderlo migliore. Mai collegati a te come persona, mai venduti.',
  cookieMore: 'Scopri di più',
  cookieAccept: 'Va bene',
  cookieEssential: 'Solo necessari',
  footerAbout: 'Chi siamo',

  regionHeading: (n, region, year) =>
    n === 1 ? `Il mercatino delle pulci nel Cantone ${region}${year ? ` ${year}` : ''}` : `I ${n} mercatini delle pulci nel Cantone ${region}${year ? ` ${year}` : ''}`,
  regionIntro: (region) =>
    `Tutti i mercatini delle pulci conosciuti nel Cantone ${region} — per località e per data, con orari di apertura e cancellazioni. Le date cancellate restano visibili.`,

  regionLabel: (region) => `Cantone ${region}`,

  marketCount: (n) => `${n} ${n === 1 ? 'mercatino' : 'mercatini'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'data' : 'date'}`,

  scopeRegion: (label) => `nel ${label}`,
  subscribeScopeRegion: (name) => `per ${name}`,
  scopeRadius: (km, city) => `entro ${km} km da ${city}`,
  nearbyHeading: (km) => `Entro ${km} km`,
  nearbyLede: (city) => `Le prossime date nelle località intorno a ${city}.`,
  subscribeBodyScope: (scope) => `Una e-mail il venerdì mattina: i mercatini del fine settimana ${scope}, e quelli annullati.`,
  subscribeTitle: (town) => (town ? `Il fine settimana intorno a ${town}, nella tua casella` : 'Il fine settimana vicino a te, nella tua casella'),
  subscribeSend: 'Mandamela',
  subscribeBodyPick: 'Una e-mail il venerdì mattina: i mercatini del fine settimana nella regione che scegli qui sotto, e quelli annullati.',
  subscribeRegionLabel: 'Regione',
  subscribeAnywhere: 'Ovunque',
  newsletterTitle: 'Newsletter',
  newsletterBody: "Ogni venerdì: cosa c'è questo fine settimana vicino a te.",
  newsletterAction: 'Iscriversi alla newsletter',
  organiserTitle: 'Per gli organizzatori',
  claimTitle: 'È il tuo mercatino?',
  claimBody: 'Prendilo in mano per confermare le date, aggiungere una foto o annullare una giornata. Gratis, senza account.',
  claimAction: 'È il mio mercatino',
  organiserConfirmedOn: (date) => `Confermato dall'organizzatore, ${date}`,
  stallsLabel: 'Bancarelle',
  setting: { indoor: 'al coperto', outdoor: "all'aperto", both: "al coperto e all'aperto" },
  soldLabel: 'Cosa si trova',
  tagLabels: { antiques: 'antiquariato', furniture: 'mobili', clothes: 'vestiti', records_books: 'dischi e libri', kids: 'cose per bambini', food: 'da mangiare e bere' },
  rain: { runs: 'Si fa', cancelled: 'Annullato', decided_on_the_day: 'Si decide la mattina' },
  organiserBody: 'Prendi in mano il tuo mercatino o aggiungine uno nuovo. Gratis, senza account.',
  organiserAction: 'Prendi in mano o aggiungi il tuo mercatino',

  weekdaysShort: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
  weekdaysLong: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
  monthsShort: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
  monthsLong: [
    'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
  ],
  timeSuffix: '',
};


export const STRINGS: Record<Locale, Strings> = { de, fr, it, en };

export const t = (locale: Locale): Strings => STRINGS[locale] ?? de;
