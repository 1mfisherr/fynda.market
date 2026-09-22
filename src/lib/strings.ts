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
  regions: string;
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
  noDateYetLede: string;

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
  /** The organiser's own line and where to book a stall — from their page, shown only when set. */
  fromTheOrganiser: string;
  bookAStall: string;

  /* city page */
  cityHeading: (n: number, city: string, year: number) => string;
  /**
   * The tail of a town or canton title: the next date, the one fact that makes
   * fifty-six otherwise identical titles fifty-six different ones. Google
   * rewrites titles that "vary by only a single piece of information" and
   * shows the site name on its own, so the brand suffix is gone and the date
   * took its place (docs/reference/seo-research/plan.md).
   */
  titleNext: (date: string) => string;
  /** The market title: name, venue, town, then the year's dates. */
  marketTitle: (name: string, venue: string | undefined, city: string | undefined, year: number) => string;
  /** A market page with no confirmed date still says what it knows. */
  marketNoDateDescription: (kind: string, city: string, venue: string | undefined, rhythm: string | undefined) => string;
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
  regionHeading: (n: number, region: string, year: number, code: CountryCode) => string;
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

/* --------------------------------------------------------------------------
 * How a region is named in a sentence, per country.
 *
 * "im Kanton Zürich" is how a Swiss person says it; "im Bundesland Bayern" is
 * not how anyone says it — in Germany the Land carries no noun ("Flohmärkte in
 * Bayern"), which is also the query people type. So the country decides the
 * whole phrase, not a swapped-in noun.
 * ------------------------------------------------------------------------ */

const inRegionDe = (region: string, code: CountryCode) =>
  (code === 'CH' ? `im Kanton ${region}` : `in ${region}`);
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

  homeTitle: 'Flohmärkte in der Schweiz — fynda.market',
  homeDescription: 'Flohmärkte in der Schweiz mit Terminen, Öffnungszeiten und dem Tag der letzten Prüfung. Absagen bleiben sichtbar. Kostenlos, ohne Werbung.',
  heroLine1: 'Man weiss nie,',
  heroLine2: 'was man findet.',
  whereLabel: 'Wo',
  closeSheet: 'Schliessen',
  whenLabel: 'Wann',
  howFarLabel: 'Wie weit',
  pickTown: 'Ort wählen',
  nearMe: 'In meiner Nähe',
  locating: 'Standort wird ermittelt…',
  yourLocation: 'Dein Standort',
  tryAgain: 'Standort erneut versuchen',
  geoHint: 'Nutzt deinen Standort einmal. Wird nicht gespeichert.',
  showCount: (n) => `${n} ${n === 1 ? 'Flohmarkt' : 'Flohmärkte'} anzeigen`,
  noDistancesYet: 'nach Datum. Wähle einen Ort oder nutze deinen Standort, um nach Entfernung zu sortieren.',
  askingPhone: 'Dein Telefon wird nach dem Standort gefragt…',
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
  regions: 'Kantone',
  marketTypes: 'Markttypen',
  questions: 'Fragen',
  cancelledThisWeek: 'Diese Woche abgesagt',
  nothingInPeriod: 'Keine Märkte in diesem Zeitraum.',
  noDateYet: 'Noch ohne Termin',
  noDateYetLede: 'Der nächste Termin steht noch nicht fest. Sobald er da ist, steht er hier.',
  radiusTitle: 'Flohmärkte in der Nähe — fynda.market',
  radiusDescription: 'Flohmärkte in der Nähe: Umkreis und Zeitraum wählen, sortiert nach Entfernung.',
  radiusHeading: 'Flohmärkte in der Nähe',
  radiusWithin: (n, km) => `${n} ${n === 1 ? 'Flohmarkt' : 'Flohmärkte'} im Umkreis von ${km} km, die nächsten zuerst.`,
  radiusDenied: 'Kein Standort geteilt. Wähle stattdessen einen Ort oder versuche es nochmals.',
  radiusUseLocation: 'Meinen Standort verwenden',
  radiusGroup: 'Umkreis',
  nothingForSelection: 'Keine Märkte in diesem Zeitraum. Versuch einen grösseren Umkreis oder einen anderen Zeitraum.',

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
  whatToExpect: 'Was dich erwartet',
  whenToGo: 'Wann hingehen',
  gettingThere: 'Hinkommen',
  dates: 'Termine',
  wasItDifferent: 'Etwas stimmt nicht?',
  reportIntro: 'Termin verschoben, abgesagt, Adresse falsch: Sag es uns, ein Mensch prüft es.',
  reportDidNotHappen: 'Fand nicht statt',
  reportEndedEarly: 'War schon vorbei',
  reportSomethingElse: 'Etwas anderes',
  confirmedOn: (date) => `Geprüft am ${date}`,
  organiserConfirmed: 'Vom Veranstalter bestätigt',
  statusToday: 'Heute',
  statusTomorrow: 'Morgen',
  onRightNow: 'läuft gerade',
  endsInTemplate: 'endet in {h} Std.',
  endsSoon: 'endet in weniger als einer Stunde',
  howOften: 'Rhythmus',
  flagCancelled: 'Fällt aus',
  flagUnconfirmed: 'Noch nicht bestätigt',
  flagStale: (date) => `Zuletzt geprüft ${date}`,
  notConfirmed: 'Noch nicht bestätigt',
  entryLabel: 'Eintritt',
  entryFree: 'frei',
  packUpFrom: (time) => `Ab ${time} wird abgebaut.`,
  hostedBy: (name) => `Veranstaltet von ${name}`,
  fromTheOrganiser: 'Vom Veranstalter',
  bookAStall: 'Stand buchen',

  cityHeading: (n, city, year) =>
    n === 1 ? `Der Flohmarkt in ${city} ${year}` : `Die ${n} Flohmärkte in ${city} ${year}`,
  titleNext: (date) => `nächster Termin ${date}`,
  marketTitle: (name, venue, city, year) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')} – Termine ${year}`,
  marketNoDateDescription: (kind, city, venue, rhythm) =>
    `${kind} in ${city}${venue ? `, ${venue}` : ''}. ${rhythm ? `${rhythm}. ` : ''}Der nächste Termin ist noch nicht bestätigt — wir prüfen ihn und tragen ihn ein, sobald er feststeht.`,
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
      a: 'Die meisten Märkte finden statt. Ein abgesagter Termin bleibt auf der Seite und heisst „abgesagt“. Hallenmärkte sind als „drinnen“ markiert.' },
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
  cookieBody: 'Wir nutzen sie, um zu sehen, wie fynda.market genutzt wird, und die Seite besser zu machen. Nie mit dir als Person verknüpft, nie verkauft.',
  cookieMore: 'Mehr dazu',
  cookieAccept: 'Einverstanden',
  cookieEssential: 'Nur nötige',
  footerAbout: 'Über fynda.market',

  regionHeading: (n, region, year, code) =>
    n === 1 ? `Der Flohmarkt ${inRegionDe(region, code)} ${year}` : `Die ${n} Flohmärkte ${inRegionDe(region, code)} ${year}`,
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
  subscribeBodyScope: (scope) => `Neue Termine und Absagen ${scope}, jeden Freitagmorgen.`,
  subscribeRegionLabel: 'Region',
  subscribeAnywhere: 'Überall in der Schweiz',
  newsletterTitle: 'Newsletter',
  newsletterBody: 'Jeden Freitag: was am Wochenende in deiner Nähe läuft.',
  newsletterAction: 'Newsletter abonnieren',
  organiserTitle: 'Für Veranstalter',
  claimTitle: 'Ist das Ihr Markt?',
  claimBody: 'Übernehmen Sie ihn: Termine bestätigen, ein Foto ergänzen, einen Tag absagen. Kostenlos, kein Konto nötig.',
  claimAction: 'Das ist mein Markt',
  organiserConfirmedOn: (date) => `Vom Veranstalter bestätigt, ${date}`,
  stallsAbout: (n) => `rund ${n} Stände`,
  setting: { indoor: 'drinnen', outdoor: 'draussen', both: 'drinnen und draussen' },
  rain: { runs: 'findet auch bei Regen statt', cancelled: 'bei Regen abgesagt', decided_on_the_day: 'bei Regen wird am Morgen entschieden' },
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

  homeTitle: 'Flea markets in Switzerland — fynda.market',
  homeDescription: 'Flea markets in Switzerland with dates, opening hours and the day each date was last checked. Cancellations stay visible. Free, no ads.',
  heroLine1: 'You never know',
  heroLine2: "what you'll find.",
  whereLabel: 'Where',
  closeSheet: 'Close',
  whenLabel: 'When',
  howFarLabel: 'How far',
  pickTown: 'Pick a town',
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
  regions: 'Cantons',
  marketTypes: 'Market types',
  questions: 'Questions',
  cancelledThisWeek: 'Cancelled this week',
  nothingInPeriod: 'No markets in this period.',
  noDateYet: 'No date yet',
  noDateYetLede: 'The next date isn\'t out yet. As soon as it is, it\'s here.',
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
  whatToExpect: 'What to expect',
  whenToGo: 'When to go',
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
  endsInTemplate: 'ends in {h} hrs',
  endsSoon: 'ends within the hour',
  howOften: 'How often',
  flagCancelled: 'Cancelled',
  flagUnconfirmed: 'Not confirmed yet',
  flagStale: (date) => `Last checked ${date}`,
  notConfirmed: 'Not confirmed yet',
  entryLabel: 'Entry',
  entryFree: 'free',
  packUpFrom: (time) => `Packing up starts at ${time}.`,
  hostedBy: (name) => `Organised by ${name}`,
  fromTheOrganiser: 'From the organiser',
  bookAStall: 'Book a stall',

  cityHeading: (n, city, year) =>
    n === 1 ? `The flea market in ${city} ${year}` : `The ${n} flea markets in ${city} ${year}`,
  titleNext: (date) => `next on ${date}`,
  marketTitle: (name, venue, city, year) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')} – Dates ${year}`,
  marketNoDateDescription: (kind, city, venue, rhythm) =>
    `${kind} in ${city}${venue ? `, ${venue}` : ''}. ${rhythm ? `${rhythm}. ` : ''}The next date is not confirmed yet — we check and list it as soon as it is set.`,
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
    n === 1 ? `The flea market ${inRegionEn(region, code)} ${year}` : `The ${n} flea markets ${inRegionEn(region, code)} ${year}`,
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
  subscribeBodyScope: (scope) => `New dates and cancellations ${scope}, every Friday morning.`,
  subscribeRegionLabel: 'Region',
  subscribeAnywhere: 'Anywhere in Switzerland',
  newsletterTitle: 'Newsletter',
  newsletterBody: "Every Friday: what's on this weekend near you.",
  newsletterAction: 'Subscribe',
  organiserTitle: 'For organisers',
  claimTitle: 'Is this your market?',
  claimBody: 'Claim it to confirm dates, add a photo or cancel a day. Free, no account needed.',
  claimAction: 'This is my market',
  organiserConfirmedOn: (date) => `Confirmed by the organiser, ${date}`,
  stallsAbout: (n) => `about ${n} stalls`,
  setting: { indoor: 'indoor', outdoor: 'outdoor', both: 'indoor and outdoor' },
  rain: { runs: 'runs in the rain', cancelled: 'cancelled in rain', decided_on_the_day: 'rain: decided on the morning' },
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
  notFoundBody: "Le marché a peut-être changé d'adresse, ou l'adresse est incorrecte. Tous les marchés sont accessibles depuis la page d'accueil.",

  homeTitle: 'Brocantes en Suisse — fynda.market',
  homeDescription: 'Brocantes en Suisse avec dates, horaires et jour de la dernière vérification. Les annulations restent visibles. Gratuit, sans publicité.',
  heroLine1: 'On ne sait jamais',
  heroLine2: "ce qu'on va trouver.",
  whereLabel: 'Où',
  closeSheet: 'Fermer',
  whenLabel: 'Quand',
  howFarLabel: 'Distance',
  pickTown: 'Choisir une ville',
  nearMe: 'Près de moi',
  locating: 'Localisation…',
  yourLocation: 'Votre position',
  tryAgain: 'Réessayer ma position',
  geoHint: "Utilise votre position une fois. Rien n'est enregistré.",
  showCount: (n) => `Afficher ${n} ${n === 1 ? 'brocante' : 'brocantes'}`,
  noDistancesYet: 'par date. Choisissez une ville ou utilisez votre position pour trier par distance.',
  askingPhone: 'Demande de votre position en cours…',
  upcoming: (n) => n === 1 ? 'Prochaine date' : 'Prochaines dates',
  homePromise: () => 'Nous trouvons les brocantes. À vous de chiner.',
  homeOrganiserAsk: 'Vous organisez un marché ?',
  homeOrganiserAction: 'Reprendre votre page',
  thisWeekend: 'Ce week-end',
  allWeekend: (n) => `Les ${n} du week-end`,
  allDates: (n) => `Les ${n} dates`,
  yourTown: 'Votre ville',
  thisWeekendLede: (n, from, to) => `${n} ${n === 1 ? 'brocante' : 'brocantes'}, ${from}${to === from ? '' : ` et ${to}`}`,
  cities: 'Localités',
  regions: 'Cantons',
  marketTypes: 'Types de marché',
  questions: 'Questions',
  cancelledThisWeek: 'Annulé cette semaine',
  nothingInPeriod: 'Pas de brocante sur cette période.',
  noDateYet: 'Pas encore de date',
  noDateYetLede: 'La prochaine date n\'est pas encore connue. Dès qu\'elle l\'est, elle est ici.',
  radiusTitle: 'Brocantes à proximité — fynda.market',
  radiusDescription: 'Brocantes à proximité : choisissez un rayon et une période, triées par distance.',
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
  wasItDifferent: 'Quelque chose ne va pas ?',
  reportIntro: "Une date déplacée, une annulation, une adresse fausse : dites-le-nous, quelqu'un vérifie.",
  reportDidNotHappen: "N'a pas eu lieu",
  reportEndedEarly: 'Était déjà terminé',
  reportSomethingElse: 'Autre chose',
  confirmedOn: (date) => `Vérifié le ${date}`,
  organiserConfirmed: "Confirmé par l'organisateur",
  statusToday: "Aujourd'hui",
  statusTomorrow: 'Demain',
  onRightNow: 'en cours',
  endsInTemplate: 'se termine dans {h} h',
  endsSoon: "se termine dans moins d'une heure",
  howOften: 'Fréquence',
  flagCancelled: 'Annulé',
  flagUnconfirmed: 'Pas encore confirmé',
  flagStale: (date) => `Vérifié le ${date}`,
  notConfirmed: 'Pas encore confirmé',
  entryLabel: 'Entrée',
  entryFree: 'gratuite',
  packUpFrom: (time) => `Démontage à partir de ${time}.`,
  hostedBy: (name) => `Organisé par ${name}`,
  fromTheOrganiser: "De l'organisateur",
  bookAStall: 'Réserver un stand',

  cityHeading: (n, city, year) =>
    n === 1 ? `La brocante à ${city} ${year}` : `Les ${n} brocantes à ${city} ${year}`,
  titleNext: (date) => `prochaine date ${date}`,
  marketTitle: (name, venue, city, year) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')} – Dates ${year}`,
  marketNoDateDescription: (kind, city, venue, rhythm) =>
    `${kind} à ${city}${venue ? `, ${venue}` : ''}. ${rhythm ? `${rhythm}. ` : ''}La prochaine date n'est pas encore confirmée — nous la vérifions et l'ajoutons dès qu'elle est fixée.`,
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
      a: 'La plupart des brocantes ont lieu. Une date annulée reste sur la page et indique « annulé ». Les brocantes couvertes indiquent « intérieur ».' },
    { q: 'Est-ce payant ?',
      a: "fynda.market est gratuit et sans publicité. La plupart des brocantes sont gratuites aussi ; un droit d'entrée figure sur la page de la brocante." },
    { q: "J'organise une brocante.",
      a: 'Elle est probablement déjà répertoriée. Reprenez-la pour confirmer vos dates, ajouter une photo ou annuler une journée. Gratuit, sans compte à créer.' },
  ],

  footerTagline: 'Les brocantes, et si elles ont lieu.',
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
  cookieBody: "Nous les utilisons pour voir comment fynda.market est utilisé et l'améliorer. Jamais liés à vous en tant que personne, jamais vendus.",
  cookieMore: 'En savoir plus',
  cookieAccept: "D'accord",
  cookieEssential: 'Seulement le nécessaire',
  footerAbout: 'À propos',

  regionHeading: (n, region, year) =>
    n === 1 ? `La brocante dans le canton ${deFr(region)} ${year}` : `Les ${n} brocantes dans le canton ${deFr(region)} ${year}`,
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
  subscribeBodyScope: (scope) => `Nouvelles dates et annulations ${scope}, chaque vendredi matin.`,
  subscribeRegionLabel: 'Région',
  subscribeAnywhere: 'Partout en Suisse',
  newsletterTitle: 'Newsletter',
  newsletterBody: 'Chaque vendredi : ce qui se passe ce week-end près de chez vous.',
  newsletterAction: "S'abonner à la newsletter",
  organiserTitle: 'Pour les organisateurs',
  claimTitle: "C'est votre brocante ?",
  claimBody: 'Reprenez-la pour confirmer vos dates, ajouter une photo ou annuler une journée. Gratuit, sans compte à créer.',
  claimAction: "C'est ma brocante",
  organiserConfirmedOn: (date) => `Confirmé par l'organisateur, ${date}`,
  stallsAbout: (n) => `environ ${n} stands`,
  setting: { indoor: 'en intérieur', outdoor: 'en extérieur', both: 'intérieur et extérieur' },
  rain: { runs: 'a lieu même sous la pluie', cancelled: 'annulé en cas de pluie', decided_on_the_day: 'pluie : décidé le matin même' },
  organiserBody: 'Reprenez votre brocante ou ajoutez-en une nouvelle. Gratuit, sans compte à créer.',
  organiserAction: 'Reprendre ou ajouter ma brocante',

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
  homeDescription: "Mercatini delle pulci in Svizzera con date, orari e giorno dell'ultima verifica. Le cancellazioni restano visibili. Gratis, senza pubblicità.",
  heroLine1: 'Non si sa mai',
  heroLine2: 'cosa si trova.',
  whereLabel: 'Dove',
  closeSheet: 'Chiudi',
  whenLabel: 'Quando',
  howFarLabel: 'Distanza',
  pickTown: 'Scegli una località',
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
  regions: 'Cantoni',
  marketTypes: 'Tipi di mercatino',
  questions: 'Domande',
  cancelledThisWeek: 'Cancellato questa settimana',
  nothingInPeriod: 'Nessun mercatino in questo periodo.',
  noDateYet: 'Ancora senza data',
  noDateYetLede: 'La prossima data non è ancora nota. Appena c\'è, la trovi qui.',
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
  whatToExpect: 'Cosa aspettarsi',
  whenToGo: 'Quando andare',
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
  endsInTemplate: 'termina tra {h} ore',
  endsSoon: "termina entro un'ora",
  howOften: 'Cadenza',
  flagCancelled: 'Annullato',
  flagUnconfirmed: 'Non ancora confermato',
  flagStale: (date) => `Verificato il ${date}`,
  notConfirmed: 'Non ancora confermato',
  entryLabel: 'Ingresso',
  entryFree: 'gratuito',
  packUpFrom: (time) => `Lo smontaggio inizia alle ${time}.`,
  hostedBy: (name) => `Organizzato da ${name}`,
  fromTheOrganiser: "Dall'organizzatore",
  bookAStall: 'Prenota una bancarella',

  cityHeading: (n, city, year) =>
    n === 1 ? `Il mercatino delle pulci a ${city} ${year}` : `I ${n} mercatini delle pulci a ${city} ${year}`,
  titleNext: (date) => `prossima data ${date}`,
  marketTitle: (name, venue, city, year) => `${[name, [venue, city].filter(Boolean).join(', ')].filter(Boolean).join(' – ')} – Date ${year}`,
  marketNoDateDescription: (kind, city, venue, rhythm) =>
    `${kind} a ${city}${venue ? `, ${venue}` : ''}. ${rhythm ? `${rhythm}. ` : ''}La prossima data non è ancora confermata — la verifichiamo e la inseriamo appena fissata.`,
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
  newsletterTitle: 'Newsletter',
  newsletterBody: "Ogni venerdì: cosa c'è questo fine settimana vicino a te.",
  newsletterAction: 'Iscriversi alla newsletter',
  organiserTitle: 'Per gli organizzatori',
  claimTitle: 'È il tuo mercatino?',
  claimBody: 'Prendilo in mano per confermare le date, aggiungere una foto o annullare una giornata. Gratis, senza account.',
  claimAction: 'È il mio mercatino',
  organiserConfirmedOn: (date) => `Confermato dall'organizzatore, ${date}`,
  stallsAbout: (n) => `circa ${n} bancarelle`,
  setting: { indoor: 'al coperto', outdoor: "all'aperto", both: "al coperto e all'aperto" },
  rain: { runs: 'si fa anche con la pioggia', cancelled: 'annullato in caso di pioggia', decided_on_the_day: 'pioggia: si decide la mattina' },
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
