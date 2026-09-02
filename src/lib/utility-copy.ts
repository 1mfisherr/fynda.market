/**
 * The words on the four utility pages, in every language.
 *
 * These pages were German files under `src/pages/de/`, so every locale linked
 * to them and every visitor who touched "Gemerkt", a CTA or a report button
 * was dropped out of their own language and into German. That is not a routing
 * bug, it is four pages that only existed once.
 *
 * They are data rather than four templates times four languages, because the
 * three form pages are the same page: a heading, an answer, some prose, a list
 * of fields, and an honest note that the form opens a mail client. Writing that
 * shape once means a new locale is a new column here, not twelve new files.
 *
 * The legal pages are deliberately NOT here. An Impressum and a privacy policy
 * are legal documents, the German ones still carry unfilled placeholders, and a
 * machine-translated privacy policy is the one kind of prose this project
 * should never ship — docs/PLAN.md. They stay German-only until a person
 * writes them, and i18n.ts says so per page rather than per locale.
 */

import type { Locale } from './i18n';

export const CONTACT = 'hallo@fynda.market';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'textarea' | 'select';
  hint?: string;
  required?: boolean;
  placeholder?: string;
  /** Same order in every language: the market page prefills by index. */
  options?: string[];
}

export interface FormPage {
  title: string;
  description: string;
  heading: string;
  answer: string;
  prose: string[];
  listTitle?: string;
  list?: string[];
  after?: string;
  fields: FormField[];
  submit: string;
  note: string;
  /** The mailto subject. The market name is appended where there is one. */
  subject: string;
}

export type FormKey = 'report' | 'newsletter' | 'organiser';

/* -------------------------------------------------------------------------- */
/* report                                                                     */
/* -------------------------------------------------------------------------- */

const report: Record<Locale, FormPage> = {
  de: {
    title: 'Etwas melden — Fynda',
    description: 'Markt nicht gefunden, schon vorbei oder falsche Angaben? Meldung senden, wir prüfen von Hand.',
    heading: 'Etwas stimmt nicht?',
    answer: 'Sagen Sie uns, was Sie vor Ort erlebt haben — wir prüfen jede Meldung von Hand.',
    prose: [
      'Melden Sie eine Absage oder eine falsche Angabe, ändert sich nichts automatisch. Wir prüfen jede Meldung, bevor wir etwas an der Marktseite ändern, und zeigen dort dann, wann wir das zuletzt geprüft haben — das Datum ist der Beweis, nicht nur ein Versprechen.',
    ],
    fields: [
      { name: 'grund', label: 'Was ist passiert?', type: 'select', required: true, options: [
        'Der Markt fand nicht statt',
        'Der Markt war früher vorbei',
        'Adresse oder Zeit stimmt nicht',
        'Etwas anderes',
      ] },
      { name: 'markt', label: 'Welcher Markt?', required: true, placeholder: 'z. B. Flohmarkt Zürich Bürkliplatz' },
      { name: 'email', label: 'E-Mail (optional)', type: 'email', hint: 'Falls wir zurückschreiben dürfen.' },
      { name: 'nachricht', label: 'Nachricht', type: 'textarea', placeholder: 'Was genau haben Sie festgestellt?' },
    ],
    submit: 'Meldung senden',
    note: `Absenden öffnet Ihr E-Mail-Programm mit einer vorausgefüllten Nachricht an ${CONTACT} — es gibt noch kein automatisches Versandsystem. Sie sehen die Nachricht, bevor sie abgeschickt wird.`,
    subject: 'Meldung',
  },
  fr: {
    title: 'Signaler quelque chose — Fynda',
    description: "Brocante introuvable, déjà terminée ou informations fausses ? Envoyez-nous un signalement, nous vérifions à la main.",
    heading: "Quelque chose ne joue pas ?",
    answer: 'Dites-nous ce que vous avez constaté sur place — nous vérifions chaque signalement à la main.',
    prose: [
      "Si vous signalez une annulation ou une information fausse, rien ne change automatiquement. Nous vérifions chaque signalement avant de modifier une page, et nous indiquons ensuite quand nous l'avons vérifiée pour la dernière fois — la date est la preuve, pas seulement une promesse.",
    ],
    fields: [
      { name: 'grund', label: "Que s'est-il passé ?", type: 'select', required: true, options: [
        "La brocante n'a pas eu lieu",
        'La brocante était déjà terminée',
        "L'adresse ou l'horaire est faux",
        'Autre chose',
      ] },
      { name: 'markt', label: 'Quelle brocante ?', required: true, placeholder: 'p. ex. Brocante de Plainpalais' },
      { name: 'email', label: 'E-mail (facultatif)', type: 'email', hint: 'Si nous pouvons vous répondre.' },
      { name: 'nachricht', label: 'Message', type: 'textarea', placeholder: "Qu'avez-vous constaté exactement ?" },
    ],
    submit: 'Envoyer le signalement',
    note: `Envoyer ouvre votre logiciel de messagerie avec un message prérempli à ${CONTACT} — il n'y a pas encore de système d'envoi automatique. Vous voyez le message avant qu'il ne parte.`,
    subject: 'Signalement',
  },
  it: {
    title: 'Segnalare qualcosa — Fynda',
    description: 'Mercatino non trovato, già finito o dati sbagliati? Ci invii una segnalazione, verifichiamo a mano.',
    heading: 'Qualcosa non torna?',
    answer: 'Ci dica cosa ha trovato sul posto — verifichiamo ogni segnalazione a mano.',
    prose: [
      "Se segnala una cancellazione o un dato sbagliato, non cambia nulla in automatico. Verifichiamo ogni segnalazione prima di modificare la pagina del mercatino, e lì indichiamo quando l'abbiamo verificata l'ultima volta — la data è la prova, non solo una promessa.",
    ],
    fields: [
      { name: 'grund', label: 'Che cosa è successo?', type: 'select', required: true, options: [
        'Il mercatino non si è svolto',
        'Il mercatino era già finito',
        "L'indirizzo o l'orario non è corretto",
        'Altro',
      ] },
      { name: 'markt', label: 'Quale mercatino?', required: true, placeholder: 'per es. Mercatino di Lugano' },
      { name: 'email', label: 'E-mail (facoltativo)', type: 'email', hint: 'Se possiamo risponderLe.' },
      { name: 'nachricht', label: 'Messaggio', type: 'textarea', placeholder: 'Che cosa ha constatato esattamente?' },
    ],
    submit: 'Inviare la segnalazione',
    note: `L'invio apre il Suo programma di posta con un messaggio precompilato a ${CONTACT} — non esiste ancora un sistema di invio automatico. Vede il messaggio prima che parta.`,
    subject: 'Segnalazione',
  },
  en: {
    title: 'Report something — Fynda',
    description: "Market missing, already over, or the details wrong? Send us a report, we check every one by hand.",
    heading: 'Something not right?',
    answer: 'Tell us what you found on the day — we check every report by hand.',
    prose: [
      'Reporting a cancellation or a wrong detail changes nothing automatically. We check every report before we change a market page, and then we publish when we last checked it — the date is the proof, not just the promise.',
    ],
    fields: [
      { name: 'grund', label: 'What happened?', type: 'select', required: true, options: [
        'The market did not happen',
        'The market was already over',
        'The address or the time is wrong',
        'Something else',
      ] },
      { name: 'markt', label: 'Which market?', required: true, placeholder: 'e.g. Flohmarkt Zürich Bürkliplatz' },
      { name: 'email', label: 'Email (optional)', type: 'email', hint: 'If we may write back.' },
      { name: 'nachricht', label: 'Message', type: 'textarea', placeholder: 'What exactly did you find?' },
    ],
    submit: 'Send report',
    note: `Sending opens your own mail program with a message already filled in to ${CONTACT} — there is no automatic sending system yet. You see the message before it goes.`,
    subject: 'Report',
  },
};

/* -------------------------------------------------------------------------- */
/* newsletter                                                                 */
/* -------------------------------------------------------------------------- */

const newsletter: Record<Locale, FormPage> = {
  de: {
    title: 'Newsletter — Fynda',
    description: 'Jeden Freitag eine E-Mail: neue Termine und Absagen für Ihre Stadt. Kostenlos, ohne Konto.',
    heading: 'Newsletter',
    answer: 'Jeden Freitag eine E-Mail: was am Wochenende in Ihrer Stadt los ist.',
    prose: [
      'Flohmärkte laufen im Wochenrhythmus, also läuft die E-Mail auch so: einmal pro Woche, freitags, nie öfter. Für eine Stadt oder eine Region — neue Termine, die dazugekommen sind, und Absagen, damit Sie nicht umsonst hinfahren.',
      'Kostenlos, ohne Konto, ohne Werbung. Sie melden sich mit Ihrer E-Mail-Adresse an, wir bestätigen sie, und ab dann bekommen Sie freitags eine Nachricht — mehr nicht.',
    ],
    fields: [
      { name: 'email', label: 'E-Mail-Adresse', type: 'email', required: true, placeholder: 'ihre@email.ch' },
      { name: 'stadt', label: 'Stadt', hint: 'Leer lassen für die ganze Schweiz.', placeholder: 'z. B. Zürich' },
    ],
    submit: 'Anmelden',
    note: 'Die Anmeldung läuft im Moment noch per E-Mail an uns — es gibt noch kein automatisches Versandsystem. Wir bestätigen jede Adresse persönlich, bevor wir etwas verschicken.',
    subject: 'Newsletter',
  },
  fr: {
    title: 'Newsletter — Fynda',
    description: 'Chaque vendredi un e-mail : nouvelles dates et annulations pour votre commune. Gratuit, sans compte.',
    heading: 'Newsletter',
    answer: 'Chaque vendredi un e-mail : ce qui se passe ce week-end près de chez vous.',
    prose: [
      "Les brocantes suivent un rythme hebdomadaire, l'e-mail aussi : une fois par semaine, le vendredi, jamais plus souvent. Pour une commune ou une région — les nouvelles dates et les annulations, pour que vous ne fassiez pas le déplacement pour rien.",
      "Gratuit, sans compte, sans publicité. Vous vous inscrivez avec votre adresse e-mail, nous la confirmons, et vous recevez ensuite un message le vendredi — rien de plus.",
    ],
    fields: [
      { name: 'email', label: 'Adresse e-mail', type: 'email', required: true, placeholder: 'votre@email.ch' },
      { name: 'stadt', label: 'Commune', hint: 'Laissez vide pour toute la Suisse.', placeholder: 'p. ex. Lausanne' },
    ],
    submit: "S'inscrire",
    note: "L'inscription passe pour l'instant par un e-mail qui nous est adressé — il n'y a pas encore de système d'envoi automatique. Nous confirmons chaque adresse personnellement avant d'envoyer quoi que ce soit.",
    subject: 'Newsletter',
  },
  it: {
    title: 'Newsletter — Fynda',
    description: 'Ogni venerdì una e-mail: nuove date e cancellazioni per la Sua città. Gratuito, senza account.',
    heading: 'Newsletter',
    answer: 'Ogni venerdì una e-mail: cosa succede questo fine settimana nella Sua zona.',
    prose: [
      "I mercatini seguono un ritmo settimanale, e così anche l'e-mail: una volta alla settimana, il venerdì, mai più spesso. Per una città o una regione — le nuove date e le cancellazioni, così non fa il viaggio per niente.",
      'Gratuito, senza account, senza pubblicità. Si iscrive con il Suo indirizzo e-mail, noi lo confermiamo, e da lì riceve un messaggio il venerdì — nient’altro.',
    ],
    fields: [
      { name: 'email', label: 'Indirizzo e-mail', type: 'email', required: true, placeholder: 'sua@email.ch' },
      { name: 'stadt', label: 'Città', hint: 'Lasci vuoto per tutta la Svizzera.', placeholder: 'per es. Lugano' },
    ],
    submit: 'Iscriversi',
    note: "L'iscrizione passa per ora da una e-mail a noi — non esiste ancora un sistema di invio automatico. Confermiamo ogni indirizzo personalmente prima di inviare qualcosa.",
    subject: 'Newsletter',
  },
  en: {
    title: 'Newsletter — Fynda',
    description: 'One email every Friday: new dates and cancellations for your town. Free, no account.',
    heading: 'Newsletter',
    answer: "One email every Friday: what's on this weekend near you.",
    prose: [
      'Flea markets run on a weekly rhythm, so the email does too: once a week, on a Friday, never more often. For one town or one region — the dates that have been added, and the cancellations, so you do not make the trip for nothing.',
      'Free, no account, no advertising. You sign up with your email address, we confirm it, and from then on you get a message on Fridays. That is all.',
    ],
    fields: [
      { name: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'you@email.ch' },
      { name: 'stadt', label: 'Town', hint: 'Leave empty for the whole of Switzerland.', placeholder: 'e.g. Zürich' },
    ],
    submit: 'Sign up',
    note: 'Signing up currently goes through an email to us — there is no automatic sending system yet. We confirm every address personally before we send anything.',
    subject: 'Newsletter',
  },
};

/* -------------------------------------------------------------------------- */
/* organiser                                                                  */
/* -------------------------------------------------------------------------- */

const organiser: Record<Locale, FormPage> = {
  de: {
    title: 'Für Veranstalter — Fynda',
    description: 'Ihr Flohmarkt ist wahrscheinlich schon bei Fynda gelistet. Holen Sie sich Ihre Marktseite — kostenlos, ohne Konto.',
    heading: 'Das ist Ihre Marktseite',
    answer: 'Ihr Flohmarkt ist wahrscheinlich schon bei uns gelistet. Holen Sie ihn sich.',
    prose: [
      'Fynda sammelt Flohmärkte in der ganzen Schweiz, auch solche, deren Veranstalter sich nie bei uns gemeldet haben. Ihr Markt hat deshalb vermutlich schon eine Seite, mit Termin, Adresse und Öffnungszeiten. Sie können diese Seite beanspruchen.',
    ],
    listTitle: 'Was das bringt',
    list: [
      'Eine Nachricht von Ihnen genügt, und wir aktualisieren das Datum überall, wo es steht.',
      'Eine Absage erreicht Besucherinnen und Besucher noch am selben Tag.',
      'Eine Seite, die Sie von Ihrer eigenen Website oder einem Plakat aus verlinken können.',
      'Bevor wir etwas an Ihrer Seite ändern, fragen wir Sie.',
    ],
    after: 'Das Ganze ist kostenlos, für immer, und ohne Konto.',
    fields: [
      { name: 'name', label: 'Ihr Name', required: true },
      { name: 'email', label: 'E-Mail-Adresse', type: 'email', required: true },
      { name: 'markt', label: 'Name des Marktes', required: true },
      { name: 'ort', label: 'Ort', required: true },
      { name: 'nachricht', label: 'Nachricht', type: 'textarea', hint: 'Zum Beispiel: welches Datum wir aktualisieren sollen.' },
    ],
    submit: 'Nachricht senden',
    note: 'Auch dieses Formular läuft im Moment per E-Mail an uns — wir melden uns persönlich zurück, meist innert weniger Tage.',
    subject: 'Veranstalter',
  },
  fr: {
    title: 'Pour les organisateurs — Fynda',
    description: 'Votre brocante est probablement déjà sur Fynda. Réclamez votre page — gratuitement, sans compte.',
    heading: "C'est votre page",
    answer: 'Votre brocante est probablement déjà chez nous. Venez la chercher.',
    prose: [
      "Fynda réunit les brocantes de toute la Suisse, y compris celles dont les organisateurs ne nous ont jamais contactés. Votre brocante a donc sans doute déjà une page, avec sa date, son adresse et ses horaires. Vous pouvez la réclamer.",
    ],
    listTitle: 'Ce que cela vous apporte',
    list: [
      'Un message de votre part suffit, et nous mettons la date à jour partout où elle figure.',
      'Une annulation atteint les visiteurs le jour même.',
      'Une page que vous pouvez mettre en lien depuis votre propre site ou une affiche.',
      'Avant de modifier votre page, nous vous demandons.',
    ],
    after: "Le tout est gratuit, pour toujours, et sans compte.",
    fields: [
      { name: 'name', label: 'Votre nom', required: true },
      { name: 'email', label: 'Adresse e-mail', type: 'email', required: true },
      { name: 'markt', label: 'Nom de la brocante', required: true },
      { name: 'ort', label: 'Commune', required: true },
      { name: 'nachricht', label: 'Message', type: 'textarea', hint: 'Par exemple : quelle date nous devons mettre à jour.' },
    ],
    submit: 'Envoyer le message',
    note: "Ce formulaire passe lui aussi pour l'instant par un e-mail qui nous est adressé — nous vous répondons personnellement, en général en quelques jours.",
    subject: 'Organisateur',
  },
  it: {
    title: 'Per gli organizzatori — Fynda',
    description: 'Il Suo mercatino è probabilmente già su Fynda. Rivendichi la Sua pagina — gratis, senza account.',
    heading: 'Questa è la Sua pagina',
    answer: 'Il Suo mercatino è probabilmente già da noi. Se lo prenda.',
    prose: [
      'Fynda raccoglie i mercatini di tutta la Svizzera, anche quelli i cui organizzatori non ci hanno mai contattato. Il Suo mercatino ha quindi probabilmente già una pagina, con data, indirizzo e orari. Può rivendicarla.',
    ],
    listTitle: 'A cosa serve',
    list: [
      'Basta un Suo messaggio e aggiorniamo la data ovunque compaia.',
      'Una cancellazione raggiunge i visitatori lo stesso giorno.',
      'Una pagina che può collegare dal Suo sito o da un manifesto.',
      'Prima di modificare qualcosa sulla Sua pagina, Le chiediamo.',
    ],
    after: 'Tutto questo è gratuito, per sempre, e senza account.',
    fields: [
      { name: 'name', label: 'Il Suo nome', required: true },
      { name: 'email', label: 'Indirizzo e-mail', type: 'email', required: true },
      { name: 'markt', label: 'Nome del mercatino', required: true },
      { name: 'ort', label: 'Località', required: true },
      { name: 'nachricht', label: 'Messaggio', type: 'textarea', hint: 'Per esempio: quale data dobbiamo aggiornare.' },
    ],
    submit: 'Inviare il messaggio',
    note: 'Anche questo modulo passa per ora da una e-mail a noi — Le rispondiamo personalmente, di solito in pochi giorni.',
    subject: 'Organizzatore',
  },
  en: {
    title: 'For organisers — Fynda',
    description: 'Your flea market is probably already on Fynda. Claim your page — free, no account.',
    heading: 'This is your page',
    answer: 'Your flea market is probably already with us. Come and claim it.',
    prose: [
      'Fynda collects flea markets across the whole of Switzerland, including ones whose organisers never got in touch. So your market probably already has a page, with its date, address and opening hours. You can claim it.',
    ],
    listTitle: 'What you get',
    list: [
      'One message from you and we update the date everywhere it appears.',
      'A cancellation reaches visitors the same day.',
      'A page you can link to from your own site or a poster.',
      'Before we change anything on your page, we ask you.',
    ],
    after: 'All of it is free, forever, and without an account.',
    fields: [
      { name: 'name', label: 'Your name', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'markt', label: 'Name of the market', required: true },
      { name: 'ort', label: 'Town', required: true },
      { name: 'nachricht', label: 'Message', type: 'textarea', hint: 'For example: which date we should update.' },
    ],
    submit: 'Send message',
    note: 'This form also runs on an email to us for now — we reply personally, usually within a few days.',
    subject: 'Organiser',
  },
};

export const FORMS: Record<FormKey, Record<Locale, FormPage>> = { report, newsletter, organiser };

/* -------------------------------------------------------------------------- */
/* saved                                                                      */
/* -------------------------------------------------------------------------- */

export interface SavedPage {
  title: string;
  description: string;
  heading: string;
  /** The answer line before anything is saved. */
  none: string;
  note: string;
  empty: string;
  browse: string;
  /**
   * "{markets} gemerkt, {dates} kommende Termine." Filled in by the browser,
   * so it is a template rather than a function: the page ships one locale's
   * words as data instead of shipping all four locales' strings as code.
   */
  summary: string;
}

export const SAVED: Record<Locale, SavedPage> = {
  de: {
    title: 'Gemerkte Märkte | Fynda',
    description: 'Ihre gemerkten Flohmärkte, mit den nächsten Terminen.',
    heading: 'Gemerkt',
    none: 'Noch nichts gemerkt.',
    note: 'Gemerkte Märkte bleiben in diesem Browser gespeichert — ohne Konto, ohne Anmeldung. Wer den Browser wechselt oder die Daten löscht, beginnt neu.',
    empty: 'Auf jeder Marktseite gibt es «Merken». Gemerkte Märkte erscheinen hier mit ihren nächsten Terminen.',
    browse: 'Märkte durchsuchen',
    summary: '{markets} gemerkt, {dates} kommende Termine.',
  },
  fr: {
    title: 'Brocantes enregistrées | Fynda',
    description: 'Vos brocantes enregistrées, avec leurs prochaines dates.',
    heading: 'Enregistré',
    none: "Rien d'enregistré pour l'instant.",
    note: "Les brocantes enregistrées restent dans ce navigateur — sans compte, sans inscription. Si vous changez de navigateur ou effacez ses données, la liste repart de zéro.",
    empty: "Sur chaque page de brocante il y a « Enregistrer ». Les brocantes enregistrées apparaissent ici avec leurs prochaines dates.",
    browse: 'Parcourir les brocantes',
    summary: '{markets} enregistrées, {dates} dates à venir.',
  },
  it: {
    title: 'Mercatini salvati | Fynda',
    description: 'I Suoi mercatini salvati, con le prossime date.',
    heading: 'Salvati',
    none: 'Non ha ancora salvato nulla.',
    note: 'I mercatini salvati restano in questo browser — senza account, senza registrazione. Se cambia browser o ne cancella i dati, si riparte da zero.',
    empty: 'Su ogni pagina di mercatino c’è «Salva». I mercatini salvati compaiono qui con le loro prossime date.',
    browse: 'Sfogliare i mercatini',
    summary: '{markets} salvati, {dates} date in arrivo.',
  },
  en: {
    title: 'Saved markets | Fynda',
    description: 'Your saved flea markets, with their next dates.',
    heading: 'Saved',
    none: 'Nothing saved yet.',
    note: 'Saved markets stay in this browser — no account, no sign-in. Change browser or clear its data and the list starts again.',
    empty: 'Every market page has a "Save" button. Saved markets appear here with their next dates.',
    browse: 'Browse markets',
    summary: '{markets} saved, {dates} dates coming up.',
  },
};
