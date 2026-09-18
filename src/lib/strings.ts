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
  homeTitle: string;
  homeDescription: string;
  heroLine1: string;
  heroLine2: string;
  heroPromise: string;
  /* the search control — home and the radius view (docs/specs/near-me.md) */
  whereLabel: string;
  /** The town sheet's close button. */
  closeSheet: string;
  whenLabel: string;
  howFarLabel: string;
  /** The Where field before a town is chosen; also the sheet's title. */
  pickTown: string;
  /** The first row of the town sheet, and the round button's name. */
  nearMe: string;
  locating: string;
  yourLocation: string;
  tryAgain: string;
  /** Under the round button on home: what a tap does and does not do. */
  geoHint: string;
  /** The home count line. `label` is a formatted day when kind is 'date'. */
  countFor: (n: number, kind: 'all' | 'today' | 'weekend' | 'date', label?: string) => string;
  /** Before a location: after the counts, what the list is and is not. */
  noDistancesYet: string;
  askingPhone: string;
  upcoming: string;
  /* The home page answers "this weekend", not "the next four months". */
  /* The claim, first thing on the home page: trust signal, head-term content
     and the sentence an AI answer can quote, in one line. */
  homePromise: (markets: number) => string;
  homeProof: string;
  thisWeekend: string;
  thisWeekendLede: (n: number, from: string, to: string) => string;
  allWeekend: (n: number) => string;
  /** The market page's dates list opens at five; this is the rest of it. */
  allDates: (n: number) => string;
  /* The home page's one question, asked below the markets — TownPicker. */
  yourTown: string;
  cities: string;
  regions: string;
  marketTypes: string;
  whereDataComes: string;
  /**
   * What the block used to say in three verbs. It is the sentence that
   * separates this site from the category, so it carries a figure and names
   * what we do with a cancellation.
   */
  dataProvenance: (dates: number) => string;
  questions: string;
  cancelledThisWeek: string;
  nothingInPeriod: string;

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
  whatToExpect: string;
  whenToGo: string;
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
     date. `onRightNow` and the two ends-in strings are filled in by the
     browser instead: the page is written at 03:00 and cannot know what the
     hour will be when someone reads it. They are templates rather than
     functions because the client script receives them as data attributes and
     cannot call into this module.
  */
  statusToday: string;
  statusTomorrow: string;
  onRightNow: string;
  /** `{h}` is replaced with whole hours remaining. */
  endsInTemplate: string;
  endsSoon: string;
  /** Label under the recurrence phrase in the decision strip. */
  howOften: string;
  /* The three things a list row may say about a date, and it says one only
     when it is true — see src/lib/freshness.ts. Silence means confirmed and
     recently checked, which is most rows. */
  flagCancelled: string;
  flagUnconfirmed: string;
  flagStale: (date: string) => string;
  notConfirmed: string;
  /** "Eintritt" / "frei" — the one fact under What to expect. */
  entryLabel: string;
  entryFree: string;
  packUpFrom: (time: string) => string;
  /** Who runs it. Held for 94% of markets and, until 2026-09-06, only in the
      structured data — a fact we had that nobody could read. */
  hostedBy: (name: string) => string;

  /* city page */
  cityHeading: (n: number, city: string, year: number) => string;
  cityNext: (name: string, date: string, time: string | undefined, venue: string) => string;
  cityNoDate: string;
  cityIntro: (city: string, region: string) => string;
  /** The search snippet: the city is named because Google bolds the match. */
  cityDescription: (city: string, name: string, date: string, time: string | undefined, venue: string, n: number, months: number) => string;
  lastChecked: string;
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
  regionHeading: (n: number, region: string, year: number) => string;
  regionIntro: (region: string) => string;
  /** "Kanton Luzern". The city of Luzern and the canton share a name — the
   *  label is what tells a link on the city page which one it means. */
  regionLabel: (region: string) => string;

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
  claimFree: string;
  /** The organiser stamp with the date the organiser said so. */
  organiserConfirmedOn: (date: string) => string;
  /** The owned line: "about 120 stalls", the setting, the rain answer. */
  stallsAbout: (n: number) => string;
  setting: Record<'indoor' | 'outdoor' | 'both', string>;
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

const de: Strings = {
  saved: 'Gemerkt',
  skipToContent: 'Zum Inhalt springen',
  backToHome: 'Zurück zur Startseite',
  languageLabel: 'Sprache',
  navLabel: 'Hauptnavigation',

  notFoundTitle: 'Seite nicht gefunden — fynda.market',
  notFoundHeading: 'Diese Seite gibt es nicht.',
  notFoundBody: 'Vielleicht ist der Markt umgezogen, vielleicht stimmt die Adresse nicht. Von der Startseite aus finden Sie jeden Markt.',

  homeTitle: 'Flohmärkte in der Schweiz — fynda.market',
  homeDescription: 'Welcher Flohmarkt findet statt, wo und wann. Termine mit Quelle und Datum, Absagen inklusive.',
  heroLine1: 'Irgendwo ist',
  heroLine2: 'immer Markt.',
  heroPromise: 'Flohmärkte in der Schweiz — mit Daten, die stimmen.',
  whereLabel: 'Wo',
  closeSheet: 'Schliessen',
  whenLabel: 'Wann',
  howFarLabel: 'Wie weit',
  pickTown: 'Ort wählen',
  nearMe: 'In meiner Nähe',
  locating: 'Standort wird ermittelt…',
  yourLocation: 'Dein Standort',
  tryAgain: 'Standort erneut versuchen',
  geoHint: 'Fragt dein Telefon einmal nach dem Standort. Nichts wird gespeichert.',
  countFor: (n, kind, label) => {
    const m = `${n} ${n === 1 ? 'Flohmarkt' : 'Flohmärkte'}`;
    if (kind === 'today') return `${m} heute.`;
    if (kind === 'weekend') return `${m} am Wochenende.`;
    if (kind === 'date') return `${m} am ${label}.`;
    return `${m}, alle Termine.`;
  },
  noDistancesYet: 'nach Datum, noch ohne Entfernung',
  askingPhone: 'Dein Telefon wird nach dem Standort gefragt…',
  upcoming: 'Kommende Termine',
  homePromise: (n) => `<b>${n} Flohmärkte</b> in der Schweiz — jeder Termin mit Quelle und Prüfdatum.`,
  homeProof: 'Wir schreiben zu jedem Termin, wann wir ihn zuletzt geprüft haben. Steht der Veranstalter dahinter, sagen wir das auch. Absagen bleiben stehen, mit Grund.',
  thisWeekend: 'Dieses Wochenende',
  allWeekend: (n) => `Alle ${n} Märkte am Wochenende`,
  allDates: (n) => `Alle ${n} Termine`,
  yourTown: 'Ihre Stadt',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'Markt' : 'Märkte'} am ${from}${to === from ? '' : ` und ${to}`}.`,
  cities: 'Städte',
  regions: 'Kantone',
  marketTypes: 'Markttypen',
  whereDataComes: 'Woher unsere Daten kommen',
  dataProvenance: (n) =>
    `Zu jedem der ${n} kommenden Termine gehört die Quelle, aus der er stammt, und das Datum, `
    + 'an dem wir ihn zuletzt geprüft haben. Wo der Veranstalter selbst bestätigt hat, steht das dabei. '
    + 'Abgesagte Termine löschen wir nicht — sie bleiben stehen, mit Grund.',
  questions: 'Häufige Fragen',
  cancelledThisWeek: 'Diese Woche abgesagt',
  nothingInPeriod: 'Für diesen Zeitraum ist nichts eingetragen.',
  radiusTitle: 'Flohmärkte in der Nähe | fynda.market',
  radiusDescription: 'Flohmärkte in der Nähe: Umkreis und Zeitraum wählen, sortiert nach Entfernung.',
  radiusHeading: 'Flohmärkte in der Nähe',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'Flohmarkt' : 'Flohmärkte'} im Umkreis von ${km} km, die nächsten zuerst.`,
  radiusDenied: 'Dein Telefon hat keinen Standort geteilt, deshalb gibt es keine Entfernungen. Wähle stattdessen einen Ort oder versuche es nochmals.',
  radiusUseLocation: 'Meinen Standort verwenden',
  radiusGroup: 'Umkreis',
  nothingForSelection: 'Für diese Auswahl ist nichts eingetragen.',

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
  addToCalendar: 'In Kalender eintragen',
  save: 'Merken',
  savedState: 'Gemerkt',
  whatToExpect: 'Was Sie erwartet',
  whenToGo: 'Wann hingehen',
  gettingThere: 'Hinkommen',
  dates: 'Termine',
  wasItDifferent: 'War es anders?',
  reportIntro:
    'Termin verschoben, abgesagt oder die Adresse falsch? Sagen Sie uns Bescheid — wir prüfen es und schreiben dazu, wann wir es zuletzt bestätigt haben.',
  reportDidNotHappen: 'Fand nicht statt',
  reportEndedEarly: 'War schon vorbei',
  reportSomethingElse: 'Etwas anderes',
  confirmedOn: (date) => `Von uns bestätigt am ${date}`,
  organiserConfirmed: 'Vom Veranstalter bestätigt',
  statusToday: 'Heute',
  statusTomorrow: 'Morgen',
  onRightNow: 'läuft gerade',
  endsInTemplate: 'endet in {h} Std.',
  endsSoon: 'endet in weniger als einer Stunde',
  howOften: 'Rhythmus',
  flagCancelled: 'Fällt aus',
  flagUnconfirmed: 'Nicht bestätigt',
  flagStale: (date) => `Zuletzt geprüft ${date}`,
  notConfirmed: 'Aus öffentlicher Quelle',
  entryLabel: 'Eintritt',
  entryFree: 'frei',
  packUpFrom: (time) => `Ab ${time} wird abgebaut.`,
  hostedBy: (name) => `Veranstaltet von ${name}`,

  cityHeading: (n, city, year) =>
    n === 1 ? `Der Flohmarkt in ${city} ${year}` : `Die ${n} Flohmärkte in ${city} ${year}`,
  cityNext: (name, date, time, venue) =>
    `Der nächste ist ${name} am ${date}${time ? `, ${time} Uhr` : ''}, ${venue}.`,
  cityNoDate: 'Zurzeit ist kein Termin bestätigt.',
  cityDescription: (city, name, date, time, venue, n, months) =>
    `Nächster Flohmarkt in ${city}: ${name} am ${date}${time ? `, ${time} Uhr` : ''}, ${venue}. ${n} ${n === 1 ? 'Termin' : 'Termine'} in den nächsten ${months} Monaten, mit Prüfdatum und Absagen.`,
  cityIntro: (city, region) =>
    `Alle bekannten Flohmärkte in ${city}, Kanton ${region} — mit Terminen, Öffnungszeiten und Absagen. Abgesagte Termine bleiben sichtbar.`,
  lastChecked: 'zuletzt geprüft heute',
  inNextMonths: (n) => `in den nächsten ${n} Monaten`,

  citiesLede: 'Orte mit mindestens einem bekannten Markt.',
  regionsLede: 'Der ganze Kanton — nützlich, wenn in Ihrer Stadt gerade nichts läuft.',
  typesLede: 'Die Farbe am Rand jedes Termins sagt, welche Art Markt es ist.',

  faq: [
    { q: 'Findet der Markt wirklich statt?',
      a: 'Bei jedem Termin steht, wann wir ihn zuletzt geprüft haben. Steht dort nichts, kommt er aus einer öffentlichen Quelle — und wir sagen das. Bei Märkten, die der Veranstalter selbst bestätigt hat, steht es orange dabei.' },
    { q: 'Was passiert bei Regen?',
      a: 'Absagen melden wir, sobald wir davon wissen, mit Grund. Der Termin bleibt sichtbar und durchgestrichen. Hallenmärkte sind als solche gekennzeichnet.' },
    { q: 'Kostet der Eintritt etwas?',
      a: 'Die meisten Flohmärkte sind gratis. Wo Eintritt verlangt wird, steht der Preis beim Markt.' },
    { q: 'Wie trage ich meinen Markt ein?',
      a: 'Über das Formular für Veranstalter — kostenlos, kein Konto nötig. Wir melden uns, wenn etwas unklar ist.' },
  ],

  footerTagline: 'Flohmärkte in der Schweiz. Termine mit Quelle, Absagen inklusive.',
  footerFynda: 'fynda.market',
  footerLegal: 'Rechtliches',
  footerOrganisers: 'Für Veranstalter',
  footerNewsletter: 'Newsletter',
  footerReport: 'Termin melden',
  footerNearby: 'In der Nähe',
  footerImprint: 'Impressum',
  footerPrivacy: 'Datenschutz',
  footerTerms: 'Nutzungsbedingungen',
  footerCookies: 'Cookies',
  cookieTitle: 'Cookies?',
  cookieBody: 'Wir nutzen sie, um zu sehen, wie fynda.market genutzt wird, und die Seite besser zu machen. Nie verknüpft mit Ihnen als Person, nie verkauft.',
  cookieMore: 'Mehr dazu',
  cookieAccept: 'Einverstanden',
  cookieEssential: 'Nur nötige',
  footerAbout: 'Über fynda.market',

  regionHeading: (n, region, year) =>
    n === 1 ? `Der Flohmarkt im Kanton ${region} ${year}` : `Die ${n} Flohmärkte im Kanton ${region} ${year}`,
  regionIntro: (region) =>
    `Alle bekannten Flohmärkte im Kanton ${region} — nach Ort und Datum, mit Öffnungszeiten und Absagen. Abgesagte Termine bleiben sichtbar.`,

  regionLabel: (region) => `Kanton ${region}`,

  marketCount: (n) => `${n} ${n === 1 ? 'Markt' : 'Märkte'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'Termin' : 'Termine'}`,

  scopeRegion: (label) => `im ${label}`,
  subscribeScopeRegion: (name) => `für ${name}`,
  scopeRadius: (km, city) => `im Umkreis von ${km} km um ${city}`,
  nearbyHeading: (km) => `Im Umkreis von ${km} km`,
  nearbyLede: (city) => `Die nächsten Termine in den Orten um ${city}.`,
  subscribeBodyScope: (scope) => `Neue Termine und Absagen ${scope}, jeden Freitagmorgen.`,
  subscribeRegionLabel: 'Region',
  subscribeAnywhere: 'Überall in der Schweiz',
  newsletterTitle: 'Nichts verpassen',
  newsletterBody: 'Neue Termine und Absagen in Ihrer Region.',
  newsletterAction: 'Newsletter abonnieren',
  organiserTitle: 'Sie organisieren einen Markt?',
  claimTitle: 'Ist das Ihr Markt?',
  claimBody: 'Übernehmen Sie ihn. Termine bestätigen, ein Foto ergänzen, an einem Regenmorgen absagen — ein Klick, kein Konto nötig.',
  claimAction: 'Das ist mein Markt',
  claimFree: 'Kostenlos. Für immer.',
  organiserConfirmedOn: (date) => `Vom Veranstalter bestätigt am ${date}`,
  stallsAbout: (n) => `rund ${n} Stände`,
  setting: { indoor: 'drinnen', outdoor: 'draussen', both: 'drinnen und draussen' },
  rain: { runs: 'findet auch bei Regen statt', cancelled: 'bei Regen abgesagt', decided_on_the_day: 'bei Regen wird am Morgen entschieden' },
  organiserBody: 'Termine bestätigen, Absagen melden. Kostenlos, kein Konto nötig.',
  organiserAction: 'Markt eintragen',

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

  homeTitle: 'Flea markets in Switzerland — fynda.market',
  homeDescription: 'Which flea market is on, where and when. Dates with a source and a date, cancellations included.',
  heroLine1: "There's a market",
  heroLine2: 'on somewhere.',
  heroPromise: 'Flea markets in Switzerland — with dates you can trust.',
  whereLabel: 'Where',
  closeSheet: 'Close',
  whenLabel: 'When',
  howFarLabel: 'How far',
  pickTown: 'Pick a town',
  nearMe: 'Near me',
  locating: 'Locating…',
  yourLocation: 'Your location',
  tryAgain: 'Try my location again',
  geoHint: 'Asks your phone for your location once. Nothing is stored.',
  countFor: (n, kind, label) => {
    const m = `${n} ${n === 1 ? 'market' : 'markets'}`;
    if (kind === 'today') return `${m} today.`;
    if (kind === 'weekend') return `${m} this weekend.`;
    if (kind === 'date') return `${m} on ${label}.`;
    return `${m}, all dates.`;
  },
  noDistancesYet: 'by date, no distances yet',
  askingPhone: 'Asking your phone where you are…',
  upcoming: 'Upcoming dates',
  homePromise: (n) => `<b>${n} flea markets</b> in Switzerland — every date with a source and a check date.`,
  homeProof: 'For every date we write down when we last checked it. Where the organiser stands behind a market, we say so. Cancellations stay on the page, with the reason.',
  thisWeekend: 'This weekend',
  allWeekend: (n) => `All ${n} markets this weekend`,
  allDates: (n) => `All ${n} dates`,
  yourTown: 'Your town',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'market' : 'markets'} on ${from}${to === from ? '' : ` and ${to}`}.`,
  cities: 'Cities',
  regions: 'Cantons',
  marketTypes: 'Market types',
  whereDataComes: 'Where our data comes from',
  dataProvenance: (n) =>
    `Every one of the ${n} upcoming dates carries the source it came from and the date we last `
    + 'checked it. Where the organiser confirmed it themselves, we say so. Cancelled dates are not '
    + 'deleted — they stay, with the reason.',
  questions: 'Common questions',
  cancelledThisWeek: 'Cancelled this week',
  nothingInPeriod: 'Nothing is listed for this period.',
  radiusTitle: 'Flea markets near me | fynda.market',
  radiusDescription: 'Flea markets near you: choose a radius and a period, sorted by distance.',
  radiusHeading: 'Flea markets near me',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'market' : 'markets'} within ${km} km of you, nearest first.`,
  radiusDenied: "Your phone didn't share a location, so there are no distances to give. Pick a town instead, or try again.",
  radiusUseLocation: 'Use my location',
  radiusGroup: 'Radius',
  nothingForSelection: 'Nothing is listed for this selection.',

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
  whatToExpect: 'What to expect',
  whenToGo: 'When to go',
  gettingThere: 'Getting there',
  dates: 'Dates',
  wasItDifferent: 'Was it different?',
  reportIntro:
    'Date moved, cancelled, or the address wrong? Tell us — we check it, and we publish when we last confirmed it.',
  reportDidNotHappen: "Didn't happen",
  reportEndedEarly: 'Was already over',
  reportSomethingElse: 'Something else',
  confirmedOn: (date) => `Confirmed by us on ${date}`,
  organiserConfirmed: 'Confirmed by the organiser',
  statusToday: 'Today',
  statusTomorrow: 'Tomorrow',
  onRightNow: 'on right now',
  endsInTemplate: 'ends in {h} hrs',
  endsSoon: 'ends within the hour',
  howOften: 'How often',
  flagCancelled: 'Cancelled',
  flagUnconfirmed: 'Not confirmed',
  flagStale: (date) => `Last checked ${date}`,
  notConfirmed: 'From a public source',
  entryLabel: 'Entry',
  entryFree: 'free',
  packUpFrom: (time) => `Packing up starts at ${time}.`,
  hostedBy: (name) => `Organised by ${name}`,

  cityHeading: (n, city, year) =>
    n === 1 ? `The flea market in ${city} ${year}` : `The ${n} flea markets in ${city} ${year}`,
  cityNext: (name, date, time, venue) =>
    `The next one is ${name} on ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: 'No date is confirmed at the moment.',
  cityDescription: (city, name, date, time, venue, n, months) =>
    `Next flea market in ${city}: ${name} on ${date}${time ? `, ${time}` : ''}, ${venue}. ${n} ${n === 1 ? 'date' : 'dates'} in the next ${months} months, each with a check date, cancellations shown.`,
  cityIntro: (city, region) =>
    `Every known flea market in ${city}, canton of ${region} — with dates, opening hours and cancellations. Cancelled dates stay visible.`,
  lastChecked: 'last checked today',
  inNextMonths: (n) => `in the next ${n} months`,

  citiesLede: 'Towns with at least one market we know of.',
  regionsLede: 'The whole canton — useful when nothing is on in your town.',
  typesLede: 'The colour on the edge of each date says what kind of market it is.',

  faq: [
    { q: 'Is the market really on?',
      a: 'Every date says when we last checked it. If it says nothing, it comes from a public source — and we say so. Markets the organiser has confirmed themselves are marked in orange.' },
    { q: 'What happens if it rains?',
      a: 'We publish cancellations as soon as we hear, with the reason. The date stays visible, struck through. Indoor markets are marked as such.' },
    { q: 'Is there an entry fee?',
      a: 'Most flea markets are free. Where there is a fee, the price is on the market.' },
    { q: 'How do I list my market?',
      a: 'Through the organiser form — free, no account needed. We get in touch if anything is unclear.' },
  ],

  footerTagline: 'Flea markets in Switzerland. Dates with a source, cancellations included.',
  footerFynda: 'fynda.market',
  footerLegal: 'Legal',
  footerOrganisers: 'For organisers',
  footerNewsletter: 'Newsletter',
  footerReport: 'Report a date',
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

  regionHeading: (n, region, year) =>
    n === 1 ? `The flea market in the canton of ${region} ${year}` : `The ${n} flea markets in the canton of ${region} ${year}`,
  regionIntro: (region) =>
    `Every known flea market in the canton of ${region} — by town and by date, with opening hours and cancellations. Cancelled dates stay visible.`,

  regionLabel: (region) => `Canton of ${region}`,

  marketCount: (n) => `${n} ${n === 1 ? 'market' : 'markets'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'date' : 'dates'}`,

  scopeRegion: (label) => `in the ${label}`,
  subscribeScopeRegion: (name) => `for ${name}`,
  scopeRadius: (km, city) => `within ${km} km of ${city}`,
  nearbyHeading: (km) => `Within ${km} km`,
  nearbyLede: (city) => `The next dates in the towns around ${city}.`,
  subscribeBodyScope: (scope) => `New dates and cancellations ${scope}, every Friday morning.`,
  subscribeRegionLabel: 'Region',
  subscribeAnywhere: 'Anywhere in Switzerland',
  newsletterTitle: "Don't miss one",
  newsletterBody: 'New dates and cancellations in your area.',
  newsletterAction: 'Subscribe',
  organiserTitle: 'Do you run a market?',
  claimTitle: 'Is this your market?',
  claimBody: 'Take it over. Confirm dates, add a photo, cancel on a rainy morning — one click, no account needed.',
  claimAction: 'This is my market',
  claimFree: 'Free. Always.',
  organiserConfirmedOn: (date) => `Confirmed by the organiser on ${date}`,
  stallsAbout: (n) => `about ${n} stalls`,
  setting: { indoor: 'indoor', outdoor: 'outdoor', both: 'indoor and outdoor' },
  rain: { runs: 'runs in the rain', cancelled: 'cancelled in rain', decided_on_the_day: 'rain: decided on the morning' },
  organiserBody: 'Confirm dates, report cancellations. Free, no account needed.',
  organiserAction: 'Add your market',

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
const fr: Strings = {
  saved: 'Enregistré',
  skipToContent: 'Passer au contenu',
  backToHome: "Retour à l'accueil",
  languageLabel: 'Langue',
  navLabel: 'Navigation principale',

  notFoundTitle: 'Page introuvable — fynda.market',
  notFoundHeading: "Cette page n'existe pas.",
  notFoundBody: "Le marché a peut-être changé d'adresse, ou l'adresse est incorrecte. Tous les marchés sont accessibles depuis la page d'accueil.",

  homeTitle: 'Brocantes en Suisse — fynda.market',
  homeDescription: 'Quelle brocante a lieu, où et quand. Dates avec source, annulations comprises.',
  heroLine1: 'Il y a toujours',
  heroLine2: 'une brocante quelque part.',
  heroPromise: 'Brocantes en Suisse — des dates fiables.',
  whereLabel: 'Où',
  closeSheet: 'Fermer',
  whenLabel: 'Quand',
  howFarLabel: 'Distance',
  pickTown: 'Choisir une ville',
  nearMe: 'Près de moi',
  locating: 'Localisation…',
  yourLocation: 'Votre position',
  tryAgain: 'Réessayer ma position',
  geoHint: 'Demande votre position à votre téléphone, une fois. Rien n\'est enregistré.',
  countFor: (n, kind, label) => {
    const m = `${n} ${n === 1 ? 'brocante' : 'brocantes'}`;
    if (kind === 'today') return `${m} aujourd'hui.`;
    if (kind === 'weekend') return `${m} ce week-end.`;
    if (kind === 'date') return `${m} le ${label}.`;
    return `${m}, toutes dates confondues.`;
  },
  noDistancesYet: 'par date, sans distance pour l\'instant',
  askingPhone: 'Demande de votre position en cours…',
  upcoming: 'Prochaines dates',
  homePromise: (n) => `<b>${n} brocantes</b> en Suisse — chaque date avec sa source et sa date de vérification.`,
  homeProof: "Pour chaque date, nous indiquons quand nous l'avons vérifiée. Quand l'organisateur confirme un marché, nous le signalons. Les annulations restent affichées, avec le motif.",
  thisWeekend: 'Ce week-end',
  allWeekend: (n) => `Les ${n} marchés du week-end`,
  allDates: (n) => `Les ${n} dates`,
  yourTown: 'Votre ville',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'marché' : 'marchés'} le ${from}${to === from ? '' : ` et le ${to}`}.`,
  cities: 'Villes',
  regions: 'Cantons',
  marketTypes: 'Types de marché',
  whereDataComes: "D'où viennent nos données",
  dataProvenance: (n) =>
    `Chacune des ${n} dates à venir porte la source dont elle provient et la date de notre dernière `
    + "vérification. Lorsque l'organisateur l'a confirmée lui-même, nous le disons. Les dates annulées "
    + 'ne sont pas supprimées — elles restent, avec le motif.',
  questions: 'Questions fréquentes',
  cancelledThisWeek: 'Annulé cette semaine',
  nothingInPeriod: "Rien n'est enregistré pour cette période.",
  radiusTitle: 'Brocantes à proximité | fynda.market',
  radiusDescription: 'Brocantes à proximité : choisissez un rayon et une période, triées par distance.',
  radiusHeading: 'Brocantes à proximité',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'brocante' : 'brocantes'} dans un rayon de ${km} km, les plus proches d'abord.`,
  radiusDenied: 'Votre téléphone n\'a pas partagé votre position, donc aucune distance. Choisissez une ville, ou réessayez.',
  radiusUseLocation: 'Utiliser ma position',
  radiusGroup: 'Rayon',
  nothingForSelection: "Rien n'est enregistré pour cette sélection.",

  filterAll: 'Tous',
  filterToday: "Aujourd'hui",
  filterWeekend: 'Ce week-end',
  filterDate: 'Date',
  calendarPrev: 'Mois précédent',
  calendarNext: 'Mois suivant',
  calendarHint: 'Seuls les jours avec des brocantes sont sélectionnables.',
  filterPeriodLabel: 'Période',

  route: 'Itinéraire',
  organiserWebsite: "Site de l'organisateur",
  organiser: 'Organisateur',
  addToCalendar: 'Ajouter au calendrier',
  save: 'Enregistrer',
  savedState: 'Enregistré',
  whatToExpect: "À quoi s'attendre",
  whenToGo: 'Quand y aller',
  gettingThere: "Comment s'y rendre",
  dates: 'Dates',
  wasItDifferent: "C'était différent ?",
  reportIntro:
    "La date a changé, la brocante est annulée, ou l'adresse est fausse ? Dites-le-nous — nous vérifions, et indiquons quand nous avons confirmé pour la dernière fois.",
  reportDidNotHappen: "N'a pas eu lieu",
  reportEndedEarly: 'Était déjà terminé',
  reportSomethingElse: 'Autre chose',
  confirmedOn: (date) => `Vérifié par nous le ${date}`,
  organiserConfirmed: "Confirmé par l'organisateur",
  statusToday: "Aujourd'hui",
  statusTomorrow: 'Demain',
  onRightNow: 'en cours',
  endsInTemplate: 'se termine dans {h} h',
  endsSoon: "se termine dans moins d'une heure",
  howOften: 'Fréquence',
  flagCancelled: 'Annulé',
  flagUnconfirmed: 'Non confirmé',
  flagStale: (date) => `Vérifié le ${date}`,
  notConfirmed: 'Source publique',
  entryLabel: 'Entrée',
  entryFree: 'gratuite',
  packUpFrom: (time) => `Démontage à partir de ${time}.`,
  hostedBy: (name) => `Organisé par ${name}`,

  cityHeading: (n, city, year) =>
    n === 1 ? `La brocante à ${city} ${year}` : `Les ${n} brocantes à ${city} ${year}`,
  cityNext: (name, date, time, venue) =>
    `La prochaine est ${name}, le ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: "Aucune date n'est confirmée pour le moment.",
  cityDescription: (city, name, date, time, venue, n, months) =>
    `Prochaine brocante à ${city} : ${name}, le ${date}${time ? `, ${time}` : ''}, ${venue}. ${n} ${n === 1 ? 'date' : 'dates'} dans les ${months} prochains mois, avec date de vérification et annulations.`,
  cityIntro: (city, region) =>
    `Toutes les brocantes connues à ${city}, canton de ${region} — dates, horaires et annulations. Les dates annulées restent visibles.`,
  lastChecked: "dernière vérification aujourd'hui",
  inNextMonths: (n) => `dans les ${n} prochains mois`,

  citiesLede: 'Les communes où nous connaissons au moins une brocante.',
  regionsLede: "Le canton entier — utile quand rien n'a lieu dans votre commune.",
  typesLede: 'La couleur au bord de chaque date indique le type de brocante.',

  faq: [
    { q: 'La brocante a-t-elle vraiment lieu ?',
      a: "Chaque date indique quand nous l'avons vérifiée pour la dernière fois. Si rien n'est indiqué, elle provient d'une source publique — et nous le disons. Les marchés confirmés par l'organisateur sont signalés en orange." },
    { q: "Et s'il pleut ?",
      a: 'Nous publions les annulations dès que nous en avons connaissance, avec le motif. La date reste visible, barrée. Les brocantes couvertes sont signalées comme telles.' },
    { q: "L'entrée est-elle payante ?",
      a: "La plupart des brocantes sont gratuites. Lorsqu'une entrée est demandée, le prix figure sur la page de la brocante." },
    { q: 'Comment inscrire ma brocante ?',
      a: "Via le formulaire pour organisateurs — gratuit, sans compte à créer. Nous vous contactons si quelque chose n'est pas clair." },
  ],

  footerTagline: 'Brocantes en Suisse. Des dates avec source, annulations comprises.',
  footerFynda: 'fynda.market',
  footerLegal: 'Informations légales',
  footerOrganisers: 'Pour les organisateurs',
  footerNewsletter: 'Newsletter',
  footerReport: 'Signaler une date',
  footerNearby: 'À proximité',
  footerImprint: 'Mentions légales',
  footerPrivacy: 'Confidentialité',
  footerTerms: "Conditions d'utilisation",
  footerCookies: 'Cookies',
  cookieTitle: 'Des cookies ?',
  cookieBody: "Nous les utilisons pour voir comment fynda.market est utilisé et l'améliorer. Jamais liés à vous en tant que personne, jamais vendus.",
  cookieMore: 'En savoir plus',
  cookieAccept: "D'accord",
  cookieEssential: 'Seulement le nécessaire',
  footerAbout: 'À propos',

  regionHeading: (n, region, year) =>
    n === 1 ? `La brocante dans le canton de ${region} ${year}` : `Les ${n} brocantes dans le canton de ${region} ${year}`,
  regionIntro: (region) =>
    `Toutes les brocantes connues dans le canton de ${region} — par commune et par date, avec les horaires et les annulations. Les dates annulées restent visibles.`,

  regionLabel: (region) => `Canton de ${region}`,

  marketCount: (n) => `${n} ${n === 1 ? 'brocante' : 'brocantes'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'date' : 'dates'}`,

  scopeRegion: (label) => `dans le ${label}`,
  subscribeScopeRegion: (name) => `pour ${name}`,
  scopeRadius: (km, city) => `dans un rayon de ${km} km autour de ${city}`,
  nearbyHeading: (km) => `Dans un rayon de ${km} km`,
  nearbyLede: (city) => `Les prochaines dates dans les localités autour de ${city}.`,
  subscribeBodyScope: (scope) => `Nouvelles dates et annulations ${scope}, chaque vendredi matin.`,
  subscribeRegionLabel: 'Région',
  subscribeAnywhere: 'Partout en Suisse',
  newsletterTitle: 'Ne manquez rien',
  newsletterBody: 'Nouvelles dates et annulations dans votre région.',
  newsletterAction: "S'abonner à la newsletter",
  organiserTitle: 'Vous organisez une brocante ?',
  claimTitle: "C'est votre brocante ?",
  claimBody: "Prenez-la en main. Confirmer les dates, ajouter une photo, annuler un matin de pluie — un clic, sans compte à créer.",
  claimAction: "C'est ma brocante",
  claimFree: 'Gratuit. Pour toujours.',
  organiserConfirmedOn: (date) => `Confirmé par l'organisateur le ${date}`,
  stallsAbout: (n) => `environ ${n} stands`,
  setting: { indoor: 'en intérieur', outdoor: 'en extérieur', both: 'intérieur et extérieur' },
  rain: { runs: 'a lieu même sous la pluie', cancelled: 'annulé en cas de pluie', decided_on_the_day: 'pluie : décidé le matin même' },
  organiserBody: 'Confirmez vos dates, signalez les annulations. Gratuit, sans compte à créer.',
  organiserAction: 'Ajouter votre brocante',

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

  homeTitle: 'Mercatini delle pulci in Svizzera — fynda.market',
  homeDescription: 'Quale mercatino delle pulci si tiene, dove e quando. Date con fonte, comprese le cancellazioni.',
  heroLine1: 'Da qualche parte',
  heroLine2: "c'è sempre un mercatino.",
  heroPromise: 'Mercatini delle pulci in Svizzera — con date verificate.',
  whereLabel: 'Dove',
  closeSheet: 'Chiudi',
  whenLabel: 'Quando',
  howFarLabel: 'Distanza',
  pickTown: 'Scegli una località',
  nearMe: 'Vicino a me',
  locating: 'Localizzazione…',
  yourLocation: 'La sua posizione',
  tryAgain: 'Riprova con la posizione',
  geoHint: 'Chiede la posizione al telefono, una volta sola. Nulla viene salvato.',
  countFor: (n, kind, label) => {
    const m = `${n} ${n === 1 ? 'mercatino' : 'mercatini'}`;
    if (kind === 'today') return `${m} oggi.`;
    if (kind === 'weekend') return `${m} nel fine settimana.`;
    if (kind === 'date') return `${m} il ${label}.`;
    return `${m}, tutte le date.`;
  },
  noDistancesYet: 'per data, ancora senza distanze',
  askingPhone: 'Chiedo la posizione al telefono…',
  upcoming: 'Prossime date',
  homePromise: (n) => `<b>${n} mercatini</b> in Svizzera — ogni data con fonte e data di verifica.`,
  homeProof: "Per ogni data indichiamo quando l'abbiamo verificata. Quando l'organizzatore conferma un mercatino, lo segnaliamo. Le cancellazioni restano visibili, con il motivo.",
  thisWeekend: 'Questo fine settimana',
  allWeekend: (n) => `Tutti i ${n} mercatini del fine settimana`,
  allDates: (n) => `Tutte le ${n} date`,
  yourTown: 'La vostra città',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'mercato' : 'mercati'} il ${from}${to === from ? '' : ` e il ${to}`}.`,
  cities: 'Città',
  regions: 'Cantoni',
  marketTypes: 'Tipi di mercatino',
  whereDataComes: 'Da dove vengono i nostri dati',
  dataProvenance: (n) =>
    `Ognuna delle ${n} date in arrivo porta con sé la fonte da cui proviene e la data dell'ultima `
    + "verifica. Quando è l'organizzatore stesso a confermarla, lo diciamo. Le date annullate non "
    + 'vengono cancellate — restano, con il motivo.',
  questions: 'Domande frequenti',
  cancelledThisWeek: 'Cancellato questa settimana',
  nothingInPeriod: 'Per questo periodo non risulta nulla.',
  radiusTitle: 'Mercatini delle pulci nei dintorni | fynda.market',
  radiusDescription: 'Mercatini delle pulci nei dintorni: scelga raggio e periodo, ordinati per distanza.',
  radiusHeading: 'Mercatini delle pulci nei dintorni',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'mercatino' : 'mercatini'} entro ${km} km da lei, i più vicini prima.`,
  radiusDenied: 'Il telefono non ha condiviso la posizione, quindi niente distanze. Scelga una località, oppure riprovi.',
  radiusUseLocation: 'Usare la mia posizione',
  radiusGroup: 'Raggio',
  nothingForSelection: 'Per questa selezione non risulta nulla.',

  filterAll: 'Tutti',
  filterToday: 'Oggi',
  filterWeekend: 'Fine settimana',
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
  whatToExpect: 'Cosa aspettarsi',
  whenToGo: 'Quando andare',
  gettingThere: 'Come arrivare',
  dates: 'Date',
  wasItDifferent: 'È stato diverso?',
  reportIntro:
    "Data spostata, mercatino annullato o indirizzo sbagliato? Ce lo segnali — verifichiamo e indichiamo quando l'abbiamo confermato l'ultima volta.",
  reportDidNotHappen: 'Non si è svolto',
  reportEndedEarly: 'Era già finito',
  reportSomethingElse: 'Altro',
  confirmedOn: (date) => `Verificato da noi il ${date}`,
  organiserConfirmed: "Confermato dall'organizzatore",
  statusToday: 'Oggi',
  statusTomorrow: 'Domani',
  onRightNow: 'in corso',
  endsInTemplate: 'termina tra {h} ore',
  endsSoon: "termina entro un'ora",
  howOften: 'Cadenza',
  flagCancelled: 'Annullato',
  flagUnconfirmed: 'Non confermato',
  flagStale: (date) => `Verificato il ${date}`,
  notConfirmed: 'Fonte pubblica',
  entryLabel: 'Ingresso',
  entryFree: 'gratuito',
  packUpFrom: (time) => `Lo smontaggio inizia alle ${time}.`,
  hostedBy: (name) => `Organizzato da ${name}`,

  cityHeading: (n, city, year) =>
    n === 1 ? `Il mercatino delle pulci a ${city} ${year}` : `I ${n} mercatini delle pulci a ${city} ${year}`,
  cityNext: (name, date, time, venue) =>
    `Il prossimo è ${name} il ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: 'Al momento non è confermata nessuna data.',
  cityDescription: (city, name, date, time, venue, n, months) =>
    `Prossimo mercatino delle pulci a ${city}: ${name} il ${date}${time ? `, ${time}` : ''}, ${venue}. ${n} ${n === 1 ? 'data' : 'date'} nei prossimi ${months} mesi, con data di verifica e cancellazioni.`,
  cityIntro: (city, region) =>
    `Tutti i mercatini delle pulci conosciuti a ${city}, Cantone ${region} — con date, orari di apertura e cancellazioni. Le date cancellate restano visibili.`,
  lastChecked: 'ultima verifica oggi',
  inNextMonths: (n) => `nei prossimi ${n} mesi`,

  citiesLede: 'Località con almeno un mercatino che conosciamo.',
  regionsLede: "L'intero Cantone — utile quando nella Sua città non c'è nulla.",
  typesLede: 'Il colore sul bordo di ogni data indica il tipo di mercatino.',

  faq: [
    { q: 'Il mercatino si tiene davvero?',
      a: "Per ogni data indichiamo quando l'abbiamo verificata l'ultima volta. Se non c'è nulla, proviene da una fonte pubblica — e lo diciamo. I mercatini confermati dall'organizzatore sono segnalati in arancione." },
    { q: 'Cosa succede se piove?',
      a: 'Pubblichiamo le cancellazioni appena ne veniamo a conoscenza, con il motivo. La data resta visibile, barrata. I mercatini al coperto sono segnalati come tali.' },
    { q: "L'ingresso è a pagamento?",
      a: 'La maggior parte dei mercatini è gratuita. Dove è previsto un ingresso, il prezzo è indicato sulla pagina del mercatino.' },
    { q: 'Come inserisco il mio mercatino?',
      a: 'Tramite il modulo per organizzatori — gratis, nessun account richiesto. La contattiamo se qualcosa non è chiaro.' },
  ],

  footerTagline: 'Mercatini delle pulci in Svizzera. Date con fonte, cancellazioni comprese.',
  footerFynda: 'fynda.market',
  footerLegal: 'Note legali',
  footerOrganisers: 'Per gli organizzatori',
  footerNewsletter: 'Newsletter',
  footerReport: 'Segnalare una data',
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
    n === 1 ? `Il mercatino delle pulci nel Cantone ${region} ${year}` : `I ${n} mercatini delle pulci nel Cantone ${region} ${year}`,
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
  subscribeBodyScope: (scope) => `Nuove date e cancellazioni ${scope}, ogni venerdì mattina.`,
  subscribeRegionLabel: 'Regione',
  subscribeAnywhere: 'Ovunque in Svizzera',
  newsletterTitle: 'Non perda nessuna data',
  newsletterBody: 'Nuove date e cancellazioni nella Sua regione.',
  newsletterAction: 'Iscriversi alla newsletter',
  organiserTitle: 'Organizza un mercatino?',
  claimTitle: 'È il tuo mercatino?',
  claimBody: 'Prendilo in mano. Confermare le date, aggiungere una foto, annullare in una mattina di pioggia — un clic, nessun account richiesto.',
  claimAction: 'È il mio mercatino',
  claimFree: 'Gratis. Per sempre.',
  organiserConfirmedOn: (date) => `Confermato dall'organizzatore il ${date}`,
  stallsAbout: (n) => `circa ${n} bancarelle`,
  setting: { indoor: 'al coperto', outdoor: "all'aperto", both: "al coperto e all'aperto" },
  rain: { runs: 'si fa anche con la pioggia', cancelled: 'annullato in caso di pioggia', decided_on_the_day: 'pioggia: si decide la mattina' },
  organiserBody: 'Confermi le date, segnali le cancellazioni. Gratis, nessun account richiesto.',
  organiserAction: 'Inserire il mercatino',

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
