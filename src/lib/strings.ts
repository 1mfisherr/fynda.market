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

  /* home */
  homeTitle: string;
  homeDescription: string;
  heroLine1: string;
  heroLine2: string;
  heroPromise: string;
  controlPlace: string;
  controlPeriod: string;
  controlRadius: string;
  controlSubmit: string;
  upcoming: string;
  cities: string;
  regions: string;
  marketTypes: string;
  whereDataComes: string;
  dataStep1: string;
  dataStep2: string;
  dataStep3: string;
  questions: string;
  cancelledThisWeek: string;
  showMore: (n: number) => string;
  nothingInPeriod: string;

  /* filters */
  filterAll: string;
  filterToday: string;
  filterWeekend: string;
  filterWeek: string;
  filterPeriodLabel: string;

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
  confirmedOn: (date: string) => string;
  notConfirmed: string;
  packUpFrom: (time: string) => string;

  /* city page */
  cityHeading: (n: number, city: string, year: number) => string;
  cityNext: (name: string, date: string, time: string | undefined, venue: string) => string;
  cityNoDate: string;
  cityIntro: (city: string, region: string) => string;
  lastChecked: string;
  inNextMonths: (n: number) => string;

  /* the search card on the home page */
  controlAnywhere: string;
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
  organiserTitle: string;
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

  homeTitle: 'Flohmärkte in der Schweiz — Fynda',
  homeDescription: 'Welcher Flohmarkt findet statt, wo und wann. Termine mit Quelle und Datum, Absagen inklusive.',
  heroLine1: 'Irgendwo ist',
  heroLine2: 'immer Markt.',
  heroPromise: 'Flohmärkte in der Schweiz — mit Daten, die stimmen.',
  controlPlace: 'Ort',
  controlPeriod: 'Zeitraum',
  controlRadius: 'Umkreis',
  controlSubmit: 'Anzeigen',
  upcoming: 'Kommende Termine',
  cities: 'Städte',
  regions: 'Kantone',
  marketTypes: 'Markttypen',
  whereDataComes: 'Woher unsere Daten kommen',
  dataStep1: 'Termine prüfen',
  dataStep2: 'Veranstalter bestätigen',
  dataStep3: 'Absagen sichtbar machen',
  questions: 'Häufige Fragen',
  cancelledThisWeek: 'Diese Woche abgesagt',
  showMore: (n) => `${n} weitere anzeigen`,
  nothingInPeriod: 'Für diesen Zeitraum ist nichts eingetragen.',

  filterAll: 'Alle',
  filterToday: 'Heute',
  filterWeekend: 'Wochenende',
  filterWeek: 'Nächste Woche',
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
  confirmedOn: (date) => `Bestätigt am ${date} durch den Veranstalter`,
  notConfirmed: 'Noch nicht mit dem Veranstalter bestätigt',
  packUpFrom: (time) => `Ab ${time} wird abgebaut.`,

  cityHeading: (n, city, year) =>
    n === 1 ? `Der Flohmarkt in ${city} ${year}` : `Die ${n} Flohmärkte in ${city} ${year}`,
  cityNext: (name, date, time, venue) =>
    `Der nächste ist ${name} am ${date}${time ? `, ${time} Uhr` : ''}, ${venue}.`,
  cityNoDate: 'Zurzeit ist kein Termin bestätigt.',
  cityIntro: (city, region) =>
    `Alle bekannten Flohmärkte in ${city}, Kanton ${region} — mit Terminen, Öffnungszeiten und Absagen. Abgesagte Termine bleiben sichtbar.`,
  lastChecked: 'zuletzt geprüft heute',
  inNextMonths: (n) => `in den nächsten ${n} Monaten`,

  controlAnywhere: 'Überall',
  citiesLede: 'Orte mit mindestens einem bekannten Markt.',
  regionsLede: 'Der ganze Kanton — nützlich, wenn in Ihrer Stadt gerade nichts läuft.',
  typesLede: 'Die Farbe am Rand jedes Termins sagt, welche Art Markt es ist.',

  faq: [
    { q: 'Findet der Markt wirklich statt?',
      a: 'Bei jedem Termin steht, wann wir ihn zuletzt mit dem Veranstalter bestätigt haben. Steht dort nichts, haben wir ihn noch nicht geprüft — und sagen das.' },
    { q: 'Was passiert bei Regen?',
      a: 'Absagen melden wir, sobald wir davon wissen, mit Grund. Der Termin bleibt sichtbar und durchgestrichen. Hallenmärkte sind als solche gekennzeichnet.' },
    { q: 'Kostet der Eintritt etwas?',
      a: 'Die meisten Flohmärkte sind gratis. Wo Eintritt verlangt wird, steht der Preis beim Markt.' },
    { q: 'Wie trage ich meinen Markt ein?',
      a: 'Über das Formular für Veranstalter, ohne Konto und kostenlos. Wir melden uns, wenn etwas unklar ist.' },
  ],

  footerTagline: 'Flohmärkte in der Schweiz. Termine mit Quelle, Absagen inklusive.',
  footerFynda: 'Fynda',
  footerLegal: 'Rechtliches',
  footerOrganisers: 'Für Veranstalter',
  footerNewsletter: 'Newsletter',
  footerReport: 'Termin melden',
  footerNearby: 'In der Nähe',
  footerImprint: 'Impressum',
  footerPrivacy: 'Datenschutz',

  regionHeading: (n, region, year) =>
    n === 1 ? `Der Flohmarkt im Kanton ${region} ${year}` : `Die ${n} Flohmärkte im Kanton ${region} ${year}`,
  regionIntro: (region) =>
    `Alle bekannten Flohmärkte im Kanton ${region} — nach Ort und Datum, mit Öffnungszeiten und Absagen. Abgesagte Termine bleiben sichtbar.`,

  regionLabel: (region) => `Kanton ${region}`,

  marketCount: (n) => `${n} ${n === 1 ? 'Markt' : 'Märkte'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'Termin' : 'Termine'}`,

  newsletterTitle: 'Nichts verpassen',
  newsletterBody: 'Neue Termine und Absagen in Ihrer Region.',
  newsletterAction: 'Newsletter abonnieren',
  organiserTitle: 'Sie organisieren einen Markt?',
  organiserBody: 'Termine eintragen, Absagen melden. Kostenlos, ohne Konto.',
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

  homeTitle: 'Flea markets in Switzerland — Fynda',
  homeDescription: 'Which flea market is on, where and when. Dates with a source and a date, cancellations included.',
  heroLine1: "There's a market",
  heroLine2: 'on somewhere.',
  heroPromise: 'Flea markets in Switzerland — with dates you can trust.',
  controlPlace: 'Place',
  controlPeriod: 'When',
  controlRadius: 'Within',
  controlSubmit: 'Show',
  upcoming: 'Upcoming dates',
  cities: 'Cities',
  regions: 'Cantons',
  marketTypes: 'Market types',
  whereDataComes: 'Where our data comes from',
  dataStep1: 'Check the dates',
  dataStep2: 'Confirm with the organiser',
  dataStep3: 'Show the cancellations',
  questions: 'Common questions',
  cancelledThisWeek: 'Cancelled this week',
  showMore: (n) => `Show ${n} more`,
  nothingInPeriod: 'Nothing is listed for this period.',

  filterAll: 'All',
  filterToday: 'Today',
  filterWeekend: 'This weekend',
  filterWeek: 'Next week',
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
  confirmedOn: (date) => `Confirmed on ${date} with the organiser`,
  notConfirmed: 'Not yet confirmed with the organiser',
  packUpFrom: (time) => `Packing up starts at ${time}.`,

  cityHeading: (n, city, year) =>
    n === 1 ? `The flea market in ${city} ${year}` : `The ${n} flea markets in ${city} ${year}`,
  cityNext: (name, date, time, venue) =>
    `The next one is ${name} on ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: 'No date is confirmed at the moment.',
  cityIntro: (city, region) =>
    `Every known flea market in ${city}, canton of ${region} — with dates, opening hours and cancellations. Cancelled dates stay visible.`,
  lastChecked: 'last checked today',
  inNextMonths: (n) => `in the next ${n} months`,

  controlAnywhere: 'Anywhere',
  citiesLede: 'Towns with at least one market we know of.',
  regionsLede: 'The whole canton — useful when nothing is on in your town.',
  typesLede: 'The colour on the edge of each date says what kind of market it is.',

  faq: [
    { q: 'Is the market really on?',
      a: 'Every date says when we last confirmed it with the organiser. If it says nothing, we have not checked it yet — and we say so.' },
    { q: 'What happens if it rains?',
      a: 'We publish cancellations as soon as we hear, with the reason. The date stays visible, struck through. Indoor markets are marked as such.' },
    { q: 'Is there an entry fee?',
      a: 'Most flea markets are free. Where there is a fee, the price is on the market.' },
    { q: 'How do I list my market?',
      a: 'Through the organiser form. No account, no cost. We get in touch if anything is unclear.' },
  ],

  footerTagline: 'Flea markets in Switzerland. Dates with a source, cancellations included.',
  footerFynda: 'Fynda',
  footerLegal: 'Legal',
  footerOrganisers: 'For organisers',
  footerNewsletter: 'Newsletter',
  footerReport: 'Report a date',
  footerNearby: 'Near me',
  footerImprint: 'Imprint',
  footerPrivacy: 'Privacy',

  regionHeading: (n, region, year) =>
    n === 1 ? `The flea market in the canton of ${region} ${year}` : `The ${n} flea markets in the canton of ${region} ${year}`,
  regionIntro: (region) =>
    `Every known flea market in the canton of ${region} — by town and by date, with opening hours and cancellations. Cancelled dates stay visible.`,

  regionLabel: (region) => `Canton of ${region}`,

  marketCount: (n) => `${n} ${n === 1 ? 'market' : 'markets'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'date' : 'dates'}`,

  newsletterTitle: "Don't miss one",
  newsletterBody: 'New dates and cancellations in your area.',
  newsletterAction: 'Subscribe',
  organiserTitle: 'Do you run a market?',
  organiserBody: 'Add dates, report cancellations. Free, no account.',
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

// French and Italian are written by a native speaker — see docs/PLAN.md. Until
// then they fall back to German rather than shipping a machine translation,
// which is both a quality decision and the thing Google's scaled-content policy
// is actually about.
const fr: Strings = {
  saved: 'Enregistré',
  skipToContent: 'Passer au contenu',
  backToHome: "Retour à l'accueil",
  languageLabel: 'Langue',

  homeTitle: 'Brocantes en Suisse — Fynda',
  homeDescription: 'Quelle brocante a lieu, où et quand. Dates avec source, annulations comprises.',
  heroLine1: 'Il y a toujours',
  heroLine2: 'une brocante quelque part.',
  heroPromise: 'Brocantes en Suisse — des dates fiables.',
  controlPlace: 'Lieu',
  controlPeriod: 'Période',
  controlRadius: 'Rayon',
  controlSubmit: 'Afficher',
  upcoming: 'Prochaines dates',
  cities: 'Villes',
  regions: 'Cantons',
  marketTypes: 'Types de marché',
  whereDataComes: "D'où viennent nos données",
  dataStep1: 'Vérifier les dates',
  dataStep2: "Confirmer auprès de l'organisateur",
  dataStep3: 'Afficher les annulations',
  questions: 'Questions fréquentes',
  cancelledThisWeek: 'Annulé cette semaine',
  showMore: (n) => `Afficher ${n} de plus`,
  nothingInPeriod: "Rien n'est enregistré pour cette période.",

  filterAll: 'Tous',
  filterToday: "Aujourd'hui",
  filterWeekend: 'Ce week-end',
  filterWeek: 'La semaine prochaine',
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
  confirmedOn: (date) => `Confirmé le ${date} par l'organisateur`,
  notConfirmed: "Pas encore confirmé avec l'organisateur",
  packUpFrom: (time) => `Démontage à partir de ${time}.`,

  cityHeading: (n, city, year) =>
    n === 1 ? `La brocante à ${city} ${year}` : `Les ${n} brocantes à ${city} ${year}`,
  cityNext: (name, date, time, venue) =>
    `La prochaine est ${name}, le ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: "Aucune date n'est confirmée pour le moment.",
  cityIntro: (city, region) =>
    `Toutes les brocantes connues à ${city}, canton de ${region} — dates, horaires et annulations. Les dates annulées restent visibles.`,
  lastChecked: "dernière vérification aujourd'hui",
  inNextMonths: (n) => `dans les ${n} prochains mois`,

  controlAnywhere: 'Partout',
  citiesLede: 'Les communes où nous connaissons au moins une brocante.',
  regionsLede: "Le canton entier — utile quand rien n'a lieu dans votre commune.",
  typesLede: 'La couleur au bord de chaque date indique le type de brocante.',

  faq: [
    { q: 'La brocante a-t-elle vraiment lieu ?',
      a: "Chaque date indique quand nous l'avons confirmée pour la dernière fois auprès de l'organisateur. Si rien n'est indiqué, nous ne l'avons pas encore vérifiée — et nous le disons." },
    { q: "Et s'il pleut ?",
      a: 'Nous publions les annulations dès que nous en avons connaissance, avec le motif. La date reste visible, barrée. Les brocantes couvertes sont signalées comme telles.' },
    { q: "L'entrée est-elle payante ?",
      a: "La plupart des brocantes sont gratuites. Lorsqu'une entrée est demandée, le prix figure sur la page de la brocante." },
    { q: 'Comment inscrire ma brocante ?',
      a: "Via le formulaire pour organisateurs, sans compte et gratuitement. Nous vous contactons si quelque chose n'est pas clair." },
  ],

  footerTagline: 'Brocantes en Suisse. Des dates avec source, annulations comprises.',
  footerFynda: 'Fynda',
  footerLegal: 'Informations légales',
  footerOrganisers: 'Pour les organisateurs',
  footerNewsletter: 'Newsletter',
  footerReport: 'Signaler une date',
  footerNearby: 'À proximité',
  footerImprint: 'Mentions légales',
  footerPrivacy: 'Confidentialité',

  regionHeading: (n, region, year) =>
    n === 1 ? `La brocante dans le canton de ${region} ${year}` : `Les ${n} brocantes dans le canton de ${region} ${year}`,
  regionIntro: (region) =>
    `Toutes les brocantes connues dans le canton de ${region} — par commune et par date, avec les horaires et les annulations. Les dates annulées restent visibles.`,

  regionLabel: (region) => `Canton de ${region}`,

  marketCount: (n) => `${n} ${n === 1 ? 'brocante' : 'brocantes'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'date' : 'dates'}`,

  newsletterTitle: 'Ne manquez rien',
  newsletterBody: 'Nouvelles dates et annulations dans votre région.',
  newsletterAction: "S'abonner à la newsletter",
  organiserTitle: 'Vous organisez une brocante ?',
  organiserBody: 'Ajoutez vos dates, signalez les annulations. Gratuit, sans compte.',
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

  homeTitle: 'Mercatini delle pulci in Svizzera — Fynda',
  homeDescription: 'Quale mercatino delle pulci si tiene, dove e quando. Date con fonte, comprese le cancellazioni.',
  heroLine1: 'Da qualche parte',
  heroLine2: "c'è sempre un mercatino.",
  heroPromise: 'Mercatini delle pulci in Svizzera — con date verificate.',
  controlPlace: 'Luogo',
  controlPeriod: 'Periodo',
  controlRadius: 'Raggio',
  controlSubmit: 'Mostra',
  upcoming: 'Prossime date',
  cities: 'Città',
  regions: 'Cantoni',
  marketTypes: 'Tipi di mercatino',
  whereDataComes: 'Da dove vengono i nostri dati',
  dataStep1: 'Verifichiamo le date',
  dataStep2: "Confermiamo con l'organizzatore",
  dataStep3: 'Rendiamo visibili le cancellazioni',
  questions: 'Domande frequenti',
  cancelledThisWeek: 'Cancellato questa settimana',
  showMore: (n) => `Mostra altri ${n}`,
  nothingInPeriod: 'Per questo periodo non risulta nulla.',

  filterAll: 'Tutti',
  filterToday: 'Oggi',
  filterWeekend: 'Fine settimana',
  filterWeek: 'Prossima settimana',
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
  confirmedOn: (date) => `Confermato il ${date} dall'organizzatore`,
  notConfirmed: "Non ancora confermato con l'organizzatore",
  packUpFrom: (time) => `Lo smontaggio inizia alle ${time}.`,

  cityHeading: (n, city, year) =>
    n === 1 ? `Il mercatino delle pulci a ${city} ${year}` : `I ${n} mercatini delle pulci a ${city} ${year}`,
  cityNext: (name, date, time, venue) =>
    `Il prossimo è ${name} il ${date}${time ? `, ${time}` : ''}, ${venue}.`,
  cityNoDate: 'Al momento non è confermata nessuna data.',
  cityIntro: (city, region) =>
    `Tutti i mercatini delle pulci conosciuti a ${city}, Cantone ${region} — con date, orari di apertura e cancellazioni. Le date cancellate restano visibili.`,
  lastChecked: 'ultima verifica oggi',
  inNextMonths: (n) => `nei prossimi ${n} mesi`,

  controlAnywhere: 'Ovunque',
  citiesLede: 'Località con almeno un mercatino che conosciamo.',
  regionsLede: "L'intero Cantone — utile quando nella Sua città non c'è nulla.",
  typesLede: 'Il colore sul bordo di ogni data indica il tipo di mercatino.',

  faq: [
    { q: 'Il mercatino si tiene davvero?',
      a: "Per ogni data indichiamo quando l'abbiamo confermata l'ultima volta con l'organizzatore. Se non c'è nulla, non l'abbiamo ancora verificata — e lo diciamo." },
    { q: 'Cosa succede se piove?',
      a: 'Pubblichiamo le cancellazioni appena ne veniamo a conoscenza, con il motivo. La data resta visibile, barrata. I mercatini al coperto sono segnalati come tali.' },
    { q: "L'ingresso è a pagamento?",
      a: 'La maggior parte dei mercatini è gratuita. Dove è previsto un ingresso, il prezzo è indicato sulla pagina del mercatino.' },
    { q: 'Come inserisco il mio mercatino?',
      a: 'Tramite il modulo per organizzatori, senza account e gratuitamente. La contattiamo se qualcosa non è chiaro.' },
  ],

  footerTagline: 'Mercatini delle pulci in Svizzera. Date con fonte, cancellazioni comprese.',
  footerFynda: 'Fynda',
  footerLegal: 'Note legali',
  footerOrganisers: 'Per gli organizzatori',
  footerNewsletter: 'Newsletter',
  footerReport: 'Segnalare una data',
  footerNearby: 'Nei dintorni',
  footerImprint: 'Note legali',
  footerPrivacy: 'Privacy',

  regionHeading: (n, region, year) =>
    n === 1 ? `Il mercatino delle pulci nel Cantone ${region} ${year}` : `I ${n} mercatini delle pulci nel Cantone ${region} ${year}`,
  regionIntro: (region) =>
    `Tutti i mercatini delle pulci conosciuti nel Cantone ${region} — per località e per data, con orari di apertura e cancellazioni. Le date cancellate restano visibili.`,

  regionLabel: (region) => `Cantone ${region}`,

  marketCount: (n) => `${n} ${n === 1 ? 'mercatino' : 'mercatini'}`,
  dateCount: (n) => `${n} ${n === 1 ? 'data' : 'date'}`,

  newsletterTitle: 'Non perda nessuna data',
  newsletterBody: 'Nuove date e cancellazioni nella Sua regione.',
  newsletterAction: 'Iscriversi alla newsletter',
  organiserTitle: 'Organizza un mercatino?',
  organiserBody: 'Inserisca le date, segnali le cancellazioni. Gratuito, senza account.',
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
