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
 * of fields, and a note saying what happens when the button is pressed. Writing
 * that shape once means a new locale is a new column here, not twelve new files.
 *
 * All three now post to an endpoint of their own — /n, /r and /o — so the note
 * no longer has to apologise for a mail program. The mailto serialiser stays as
 * the last resort after a failed retry, which is why `subject` is still here.
 *
 * The legal pages are deliberately NOT here: they are Delfim's own documents
 * in src/lib/legal/, one file per page, in all four locales.
 */

import type { Locale } from './i18n';

export const CONTACT = 'contact@fynda.market';

/**
 * One choice in a select.
 *
 * The value is the same in every language and the label is not. It used to be
 * one string doing both jobs, which meant the browser posted a German sentence
 * to an endpoint whose check constraint spells its reasons in English, and the
 * market page had to prefill the control by counting positions in the list. A
 * reordered option would have silently changed what a report meant.
 */
export interface FormOption {
  /** What is posted. Matches `reports.report_type` exactly. */
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'textarea' | 'select';
  hint?: string;
  required?: boolean;
  placeholder?: string;
  options?: FormOption[];
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
  /**
   * The line under the button. On the newsletter page it is also the consent
   * text: whatever it says is what gets stored alongside the address, so that
   * what someone agreed to can be shown rather than asserted.
   */
  note: string;
  /**
   * The mailto subject, used only by the fallback: every form posts to its own
   * endpoint now, and the mail program opens after a second failure that was
   * ours. The market name is appended where there is one.
   */
  subject: string;
  /** Shown in place of the form once it has been sent. */
  success?: string;
  /** Shown when the save failed twice and the mail program opens instead. */
  failure?: string;
  /**
   * What the page says when something goes wrong, under the field it belongs to.
   *
   * These existed nowhere until the newsletter got them. A failed submission
   * opened the visitor's mail program without a word of explanation, and a
   * mistyped address did the same — so the one thing the person could act on,
   * their own typo, was the one thing the page never mentioned.
   *
   * `empty` is the newsletter's alone: it is the only form that turns the
   * browser's own required-field checking off, because it is the only one whose
   * single field is worth interrupting someone over. The other two let the
   * browser ask for a missing field in its own words.
   */
  errors?: {
    /** Submitted with nothing in the field. Newsletter only. */
    empty?: string;
    /** Submitted with something that is not an address. */
    invalid: string;
    /** Saved nowhere: endpoint down, database unreachable, anything at our end. */
    failed: string;
    /** The request never left the device. */
    offline: string;
  };
}

export type FormKey = 'report' | 'newsletter' | 'organiser';

/* -------------------------------------------------------------------------- */
/* report                                                                     */
/* -------------------------------------------------------------------------- */

const report: Record<Locale, FormPage> = {
  de: {
    title: 'Ein Problem melden — fynda.market',
    description: 'Markt nicht gefunden, schon vorbei oder falsche Angaben? Schick uns eine Meldung, wir prüfen jede von Hand.',
    heading: 'Stimmt etwas nicht?',
    answer: 'Sag uns, was du vor Ort erlebt hast — wir prüfen jede Meldung von Hand.',
    prose: [
      'Nichts ändert sich automatisch. Ein Mensch liest jede Meldung, prüft sie beim Veranstalter, und erst dann ändert sich die Seite — mit dem Datum der Prüfung.',
    ],
    fields: [
      { name: 'grund', label: 'Was ist passiert?', type: 'select', required: true, options: [
        { value: 'cancelled', label: 'Der Markt fand nicht statt' },
        { value: 'wrong_date', label: 'Der Markt war schon vorbei' },
        { value: 'wrong_location', label: 'Adresse oder Uhrzeit stimmt nicht' },
        { value: 'other', label: 'Etwas anderes' },
      ] },
      { name: 'markt', label: 'Welcher Markt?', required: true, placeholder: 'z. B. Flohmarkt Zürich Bürkliplatz' },
      { name: 'email', label: 'E-Mail (optional)', type: 'email', hint: 'Falls wir zurückschreiben dürfen.' },
      { name: 'nachricht', label: 'Nachricht (optional)', type: 'textarea', placeholder: 'Was genau hast du festgestellt?' },
    ],
    submit: 'Meldung senden',
    note: 'Ein Mensch liest jede Meldung, bevor sich auf der Seite etwas ändert.',
    subject: 'Meldung',
    success: 'Danke — deine Meldung ist angekommen. Wir prüfen sie von Hand, in der Regel innerhalb von ein bis zwei Tagen.',
    failure: 'Das hat gerade nicht geklappt. Wir öffnen dein E-Mail-Programm — schick uns die Meldung einfach von dort.',
    errors: {
      invalid: 'Diese E-Mail-Adresse sieht nicht richtig aus. Prüfe sie noch einmal.',
      failed: 'Das hat gerade nicht geklappt. Versuche es noch einmal.',
      offline: 'Keine Verbindung. Prüfe dein Netz und versuche es noch einmal.',
    },
  },
  fr: {
    title: 'Signaler un problème — fynda.market',
    description: "Brocante absente, déjà terminée ou informations erronées ? Signalez-le-nous : nous vérifions chaque signalement à la main.",
    heading: "Quelque chose ne va pas ?",
    answer: 'Dites-nous ce que vous avez constaté sur place — nous vérifions chaque signalement à la main.',
    prose: [
      "Rien ne change automatiquement. Une personne lit chaque signalement et le vérifie auprès de l'organisateur. Ensuite seulement, la page est corrigée, avec la date de la vérification.",
    ],
    fields: [
      { name: 'grund', label: "Que s'est-il passé ?", type: 'select', required: true, options: [
        { value: 'cancelled', label: "La brocante n'a pas eu lieu" },
        { value: 'wrong_date', label: 'La brocante était déjà terminée' },
        { value: 'wrong_location', label: "L'adresse ou l'horaire est erroné" },
        { value: 'other', label: 'Autre chose' },
      ] },
      { name: 'markt', label: 'Quelle brocante ?', required: true, placeholder: 'p. ex. Brocante de Plainpalais' },
      { name: 'email', label: 'E-mail (facultatif)', type: 'email', hint: 'Pour que nous puissions vous répondre.' },
      { name: 'nachricht', label: 'Message (facultatif)', type: 'textarea', placeholder: "Qu'avez-vous constaté exactement ?" },
    ],
    submit: 'Envoyer le signalement',
    note: 'Une personne lit chaque signalement avant toute modification de la page.',
    subject: 'Signalement',
    success: 'Merci, votre signalement est bien arrivé. Nous le vérifions à la main, en général sous un à deux jours.',
    failure: "Cela n'a pas fonctionné. Votre messagerie va s'ouvrir : envoyez-nous simplement le signalement.",
    errors: {
      invalid: 'Cette adresse e-mail ne semble pas correcte. Merci de la vérifier.',
      failed: "Cela n'a pas fonctionné. Merci de réessayer.",
      offline: 'Pas de connexion. Vérifiez votre réseau et réessayez.',
    },
  },
  it: {
    title: 'Segnala un problema — fynda.market',
    description: 'Mercatino non trovato, già finito o dati sbagliati? Scrivicelo: controlliamo ogni segnalazione a mano.',
    heading: 'Qualcosa non torna?',
    answer: 'Raccontaci cosa hai trovato sul posto: controlliamo ogni segnalazione a mano.',
    prose: [
      "Niente cambia da solo. Una persona legge ogni segnalazione e la controlla con l'organizzatore. Solo dopo la pagina cambia, con la data del controllo.",
    ],
    fields: [
      { name: 'grund', label: 'Che cosa è successo?', type: 'select', required: true, options: [
        { value: 'cancelled', label: 'Il mercatino non si è svolto' },
        { value: 'wrong_date', label: 'Il mercatino era già finito' },
        { value: 'wrong_location', label: "L'indirizzo o l'orario è sbagliato" },
        { value: 'other', label: 'Altro' },
      ] },
      { name: 'markt', label: 'Quale mercatino?', required: true, placeholder: 'es. Mercatino di Lugano' },
      { name: 'email', label: 'E-mail (facoltativo)', type: 'email', hint: 'Se possiamo risponderti.' },
      { name: 'nachricht', label: 'Messaggio (facoltativo)', type: 'textarea', placeholder: 'Che cosa hai visto esattamente?' },
    ],
    submit: 'Invia la segnalazione',
    note: 'Una persona legge ogni segnalazione prima che qualcosa cambi sulla pagina.',
    subject: 'Segnalazione',
    success: 'Grazie — la tua segnalazione è arrivata. La controlliamo a mano, di solito in uno o due giorni.',
    failure: 'Non ha funzionato. Ti apriamo il programma di posta: mandaci la segnalazione da lì.',
    errors: {
      invalid: 'Questo indirizzo e-mail non sembra corretto. Ricontrollalo.',
      failed: 'Non ha funzionato. Riprova.',
      offline: 'Nessuna connessione. Controlla la rete e riprova.',
    },
  },
  en: {
    title: 'Report a problem — fynda.market',
    description: "Market missing, already over, or the details wrong? Send us a report, we check every one by hand.",
    heading: 'Something not right?',
    answer: 'Tell us what you found on the day — we check every report by hand.',
    prose: [
      'Nothing changes automatically. A person reads every report, checks it with the organiser, and then the page changes — with the day it was checked.',
    ],
    fields: [
      { name: 'grund', label: 'What happened?', type: 'select', required: true, options: [
        { value: 'cancelled', label: 'The market did not happen' },
        { value: 'wrong_date', label: 'The market was already over' },
        { value: 'wrong_location', label: 'The address or the time is wrong' },
        { value: 'other', label: 'Something else' },
      ] },
      { name: 'markt', label: 'Which market?', required: true, placeholder: 'e.g. Flohmarkt Zürich Bürkliplatz' },
      { name: 'email', label: 'Email (optional)', type: 'email', hint: 'If we may write back.' },
      { name: 'nachricht', label: 'Message (optional)', type: 'textarea', placeholder: 'What exactly did you find?' },
    ],
    submit: 'Send report',
    note: 'A person reads every report before anything changes on the page.',
    subject: 'Report',
    success: 'Thanks — your report has arrived. We check it by hand, usually within a day or two.',
    failure: 'That did not work. We are opening your mail program instead — just send us the report.',
    errors: {
      invalid: 'That email address does not look right. Please check it.',
      failed: 'That did not work. Please try again.',
      offline: 'No connection. Check your network and try again.',
    },
  },
};

/* -------------------------------------------------------------------------- */
/* newsletter                                                                 */
/* -------------------------------------------------------------------------- */

const newsletter: Record<Locale, FormPage> = {
  de: {
    title: 'Newsletter — fynda.market',
    description: 'Jeden Freitag: was am Wochenende in deiner Nähe läuft, plus eine kurze Nachricht, wenn ein Markt abgesagt wird. Kostenlos, kein Konto nötig.',
    heading: 'Newsletter',
    answer: 'Jeden Freitagmorgen eine E-Mail: was am Wochenende in deiner Nähe läuft.',
    prose: [
      'Einmal pro Woche, am Freitag, für eine Stadt, einen Kanton oder das ganze Land: die Märkte am Wochenende, die neuen Termine, die abgesagten. Sagt ein Veranstalter danach einen Termin ab, bekommst du noch am selben Tag eine kurze Nachricht — damit du nicht umsonst hinfährst.',
      'Kostenlos, kein Konto nötig. Abmelden kannst du dich mit einem Klick in jeder E-Mail.',
    ],
    fields: [
      { name: 'email', label: 'E-Mail-Adresse', type: 'email', required: true, placeholder: 'name@example.com' },
    ],
    submit: 'Anmelden',
    note: 'Nur diese E-Mail. Deine Adresse geben wir nie weiter, und mit einem Klick bestellst du sie wieder ab.',
    subject: 'Newsletter',
    success: 'Du stehst auf der Liste. Die erste Ausgabe kommt am Freitagmorgen.',
    failure: 'Das hat gerade nicht geklappt. Wir öffnen dein E-Mail-Programm — schick uns die Nachricht einfach von dort.',
    errors: {
      empty: 'Trage deine E-Mail-Adresse ein, damit wir wissen, wohin wir sie schicken sollen.',
      invalid: 'Das sieht nicht nach einer E-Mail-Adresse aus. Prüfe sie noch einmal.',
      failed: `Das hat bei uns nicht geklappt. Versuche es noch einmal, oder schreibe an ${CONTACT} — wir tragen dich von Hand ein.`,
      offline: 'Du scheinst offline zu sein. Versuche es noch einmal, sobald du wieder Verbindung hast.',
    },
  },
  fr: {
    title: 'Newsletter — fynda.market',
    description: "Chaque vendredi, les brocantes du week-end près de chez vous, et un mot si l'une d'elles est annulée. Gratuit, sans compte à créer.",
    heading: 'Newsletter',
    answer: 'Un e-mail chaque vendredi matin : ce qui se passe ce week-end près de chez vous.',
    prose: [
      "Une fois par semaine, le vendredi, pour une commune, un canton ou tout le pays : les brocantes du week-end, les nouvelles dates, celles qui sont annulées. Si un organisateur annule une date après l'envoi, vous recevez un mot le jour même, pour ne pas vous déplacer pour rien.",
      "Gratuit, sans compte à créer. Un clic depuis n'importe quel e-mail suffit pour vous désinscrire.",
    ],
    fields: [
      { name: 'email', label: 'Adresse e-mail', type: 'email', required: true, placeholder: 'name@example.com' },
    ],
    submit: "S'inscrire",
    note: "Uniquement cet e-mail. Votre adresse n'est jamais transmise, et un clic suffit pour arrêter.",
    subject: 'Newsletter',
    success: "Vous êtes sur la liste. Le premier numéro arrive vendredi matin.",
    failure: "Cela n'a pas fonctionné. Votre messagerie va s'ouvrir : envoyez-nous simplement le message.",
    errors: {
      empty: "Indiquez votre adresse e-mail, pour que nous sachions où l'envoyer.",
      invalid: "Cela ne ressemble pas à une adresse e-mail. Vérifiez-la et réessayez.",
      failed: `Le problème vient de chez nous. Réessayez, ou écrivez à ${CONTACT} : nous vous inscrirons à la main.`,
      offline: "Vous semblez hors ligne. Réessayez dès que vous aurez du réseau.",
    },
  },
  it: {
    title: 'Newsletter — fynda.market',
    description: 'Ogni venerdì: cosa c’è questo fine settimana vicino a te, più un avviso se un mercatino viene annullato. Gratis, non serve un account.',
    heading: 'Newsletter',
    answer: 'Ogni venerdì mattina un’e-mail: cosa c’è questo fine settimana vicino a te.',
    prose: [
      'Una volta alla settimana, il venerdì, per una località, un cantone o tutto il paese: i mercatini del fine settimana, le nuove date, quelle annullate. Se poi un organizzatore annulla una data, ricevi un breve avviso il giorno stesso — così non fai il viaggio a vuoto.',
      'Gratis, non serve un account. Per uscire dalla lista basta un clic in una qualsiasi e-mail.',
    ],
    fields: [
      { name: 'email', label: 'Indirizzo e-mail', type: 'email', required: true, placeholder: 'name@example.com' },
    ],
    submit: 'Iscriviti',
    note: 'Solo questa e-mail. Il tuo indirizzo non lo diamo a nessuno, e basta un clic per smettere di riceverla.',
    subject: 'Newsletter',
    success: 'Sei nella lista. Il primo numero arriva venerdì mattina.',
    failure: 'Non ha funzionato. Ti apriamo il programma di posta: mandaci il messaggio da lì.',
    errors: {
      empty: 'Inserisci il tuo indirizzo e-mail, così sappiamo dove scriverti.',
      invalid: 'Questo non sembra un indirizzo e-mail. Controllalo e riprova.',
      failed: `Qualcosa non ha funzionato da noi. Riprova, oppure scrivi a ${CONTACT} e ti iscriviamo a mano.`,
      offline: 'Sembra che tu sia offline. Riprova appena torna la connessione.',
    },
  },
  en: {
    title: 'Newsletter — fynda.market',
    description: "Every Friday: what's on this weekend near you, plus a note if a market is cancelled. Free, no account needed.",
    heading: 'Newsletter',
    answer: "Every Friday morning, one email: what's on this weekend near you.",
    prose: [
      "Once a week, on Friday, for one town, one canton or the whole country: the markets on this weekend, the dates that were added, the ones that were cancelled. If an organiser cancels a date after that, you get a short note the same day — so you don't drive there for nothing.",
      "Free, no account needed. One click in any e-mail and you're off the list.",
    ],
    fields: [
      { name: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'name@example.com' },
    ],
    submit: 'Sign up',
    note: 'Just this email, and your address is never passed on. One click stops it.',
    subject: 'Newsletter',
    success: "You're on the list. The first one arrives on Friday morning.",
    failure: 'That did not work. We are opening your mail program instead — just send us the message.',
    errors: {
      empty: 'Enter your email address so we know where to send it.',
      invalid: "That doesn't look like an email address. Check it and try again.",
      failed: `That did not work at our end. Try again, or write to ${CONTACT} and we will add you by hand.`,
      offline: 'You seem to be offline. Try again when you are back.',
    },
  },
};

/* -------------------------------------------------------------------------- */
/* organiser                                                                  */
/* -------------------------------------------------------------------------- */

const organiser: Record<Locale, FormPage> = {
  de: {
    title: 'Für Veranstalter — fynda.market',
    description: 'Ihr Flohmarkt ist wahrscheinlich schon bei fynda.market eingetragen. Übernehmen Sie Ihre Marktseite — kostenlos, kein Konto nötig.',
    heading: 'Ihr Markt ist wahrscheinlich schon eingetragen.',
    answer: 'Übernehmen Sie ihn, und die Seite gehört Ihnen — kostenlos, kein Konto nötig.',
    prose: [
      'fynda.market trägt Flohmärkte anhand der Websites und Kalender der Veranstalter ein, ob diese sich bei uns gemeldet haben oder nicht. Ihr Markt hat deshalb sehr wahrscheinlich schon eine Seite, mit Terminen, Adresse und Öffnungszeiten. Wenn Sie sie übernehmen, bestimmen Sie, was darauf steht.',
    ],
    listTitle: 'Was Sie davon haben',
    list: [
      'Ein persönlicher Link per E-Mail — Sie brauchen weder Passwort noch Konto. Er öffnet Ihre Seite: Termine, Zahl der Stände, drinnen oder draussen, was bei Regen gilt.',
      'Sieben Tage vor jedem Termin eine E-Mail mit drei Knöpfen: findet statt · abgesagt · etwas hat sich geändert. Ein Klick auf den passenden genügt als Antwort.',
      'Jeder Termin, den Sie bestätigen, trägt den Vermerk „Vom Veranstalter bestätigt“, mit dem Datum Ihrer Bestätigung.',
      'Eine Absage steht innerhalb einer Stunde auf der Seite, und wer den Newsletter für Ihre Gegend abonniert hat, erfährt es sofort.',
    ],
    after: 'Fragen? Schreiben Sie an contact@fynda.market.',
    fields: [
      { name: 'name', label: 'Ihr Name', required: true },
      { name: 'email', label: 'E-Mail-Adresse', type: 'email', required: true },
      { name: 'markt', label: 'Name des Marktes', required: true },
      { name: 'ort', label: 'Ort', required: true },
      { name: 'nachricht', label: 'Nachricht (optional)', type: 'textarea', hint: 'Zum Beispiel, welchen Termin wir ändern sollen.' },
    ],
    submit: 'Meinen Markt übernehmen',
    note: 'Delfim liest jede Anfrage selbst. Ihr persönlicher Link kommt per E-Mail, meist innerhalb eines Tages.',
    subject: 'Veranstalter',
    success: 'Danke — Ihre Anfrage ist angekommen. Ihr persönlicher Link kommt per E-Mail, meist innerhalb eines Tages.',
    failure: 'Das hat gerade nicht geklappt. Wir öffnen Ihr E-Mail-Programm — schicken Sie uns die Nachricht einfach von dort.',
    errors: {
      invalid: 'Diese E-Mail-Adresse sieht nicht richtig aus. Bitte prüfen Sie sie noch einmal.',
      failed: 'Das hat gerade nicht geklappt. Bitte versuchen Sie es noch einmal.',
      offline: 'Keine Verbindung. Bitte prüfen Sie Ihr Netz und versuchen Sie es noch einmal.',
    },
  },
  fr: {
    title: 'Pour les organisateurs — fynda.market',
    description: 'Votre brocante est probablement déjà sur fynda.market. Prenez votre page en main — gratuitement, sans compte à créer.',
    heading: 'Votre brocante est probablement déjà répertoriée.',
    answer: 'Prenez-la en main, et la page est à vous. Gratuit, sans compte à créer.',
    prose: [
      "fynda.market répertorie les brocantes d'après les sites et calendriers des organisateurs, qu'ils nous aient contactés ou non. Votre brocante a donc très probablement déjà une page, avec ses dates, son adresse et ses horaires. En la prenant en main, c'est vous qui décidez de ce qu'elle dit.",
    ],
    listTitle: 'Ce que cela vous apporte',
    list: [
      "Un lien personnel par e-mail — pas de mot de passe, pas de compte à créer. Il ouvre votre page : dates, nombre de stands, intérieur ou extérieur, ce qui se passe en cas de pluie.",
      "Sept jours avant chaque date, un e-mail avec trois boutons : maintenu · annulé · quelque chose a changé. Un clic suffit.",
      "Chaque date que vous confirmez porte la mention « Confirmé par l'organisateur », avec le jour de votre confirmation.",
      "Une annulation apparaît sur la page dans l'heure, et les abonnés de la newsletter de votre région sont prévenus aussitôt.",
    ],
    after: 'Une question ? Écrivez à contact@fynda.market.',
    fields: [
      { name: 'name', label: 'Votre nom', required: true },
      { name: 'email', label: 'Adresse e-mail', type: 'email', required: true },
      { name: 'markt', label: 'Nom de la brocante', required: true },
      { name: 'ort', label: 'Commune', required: true },
      { name: 'nachricht', label: 'Message (facultatif)', type: 'textarea', hint: 'Par exemple : la date à mettre à jour.' },
    ],
    submit: 'Prendre en main ma brocante',
    note: 'Delfim lit chaque demande lui-même. Votre lien personnel arrive par e-mail, en général sous 24 heures.',
    subject: 'Organisateur',
    success: 'Merci, votre demande est bien arrivée. Votre lien personnel arrive par e-mail, en général sous 24 heures.',
    failure: "Cela n'a pas fonctionné. Votre messagerie va s'ouvrir : envoyez-nous simplement le message.",
    errors: {
      invalid: 'Cette adresse e-mail ne semble pas correcte. Merci de la vérifier.',
      failed: "Cela n'a pas fonctionné. Merci de réessayer.",
      offline: 'Pas de connexion. Vérifiez votre réseau et réessayez.',
    },
  },
  it: {
    title: 'Per gli organizzatori — fynda.market',
    description: 'Probabilmente il tuo mercatino è già su fynda.market. Prendi in mano la tua pagina — gratis, non serve un account.',
    heading: "Probabilmente il tuo mercatino c'è già.",
    answer: 'Prendilo in mano e la pagina è tua. Gratis, non serve un account.',
    prose: [
      "fynda.market raccoglie i mercatini dai siti e dai calendari degli organizzatori, che ci abbiano scritto o no. Quindi il tuo mercatino ha molto probabilmente già una pagina, con date, indirizzo e orari. Se la prendi in mano, decidi tu cosa c'è scritto.",
    ],
    listTitle: 'A cosa serve',
    list: [
      "Un link personale via e-mail — non servono né password né account. Apre la tua pagina: date, numero di bancarelle, al coperto o all'aperto, cosa succede se piove.",
      "Sette giorni prima di ogni data, un'e-mail con tre pulsanti: si fa · annullato · è cambiato qualcosa. Per rispondere basta un clic su quello giusto.",
      "Ogni data che confermi porta la scritta «Confermato dall'organizzatore», con il giorno della conferma.",
      "Una data annullata compare sulla pagina entro un'ora, e chi riceve la newsletter della tua zona lo sa subito.",
    ],
    after: 'Domande? Scrivi a contact@fynda.market.',
    fields: [
      { name: 'name', label: 'Il tuo nome', required: true },
      { name: 'email', label: 'Indirizzo e-mail', type: 'email', required: true },
      { name: 'markt', label: 'Nome del mercatino', required: true },
      { name: 'ort', label: 'Località', required: true },
      { name: 'nachricht', label: 'Messaggio (facoltativo)', type: 'textarea', hint: 'Per esempio: quale data dobbiamo aggiornare.' },
    ],
    submit: 'Prendo in mano il mio mercatino',
    note: 'Delfim legge personalmente ogni richiesta. Il tuo link personale arriva via e-mail, di solito entro un giorno.',
    subject: 'Organizzatore',
    success: 'Grazie — la tua richiesta è arrivata. Il tuo link personale arriva via e-mail, di solito entro un giorno.',
    failure: 'Non ha funzionato. Ti apriamo il programma di posta: mandaci il messaggio da lì.',
    errors: {
      invalid: 'Questo indirizzo e-mail non sembra corretto. Ricontrollalo.',
      failed: 'Non ha funzionato. Riprova.',
      offline: 'Nessuna connessione. Controlla la rete e riprova.',
    },
  },
  en: {
    title: 'For organisers — fynda.market',
    description: 'Your flea market is probably already on fynda.market. Claim your page — free, no account needed.',
    heading: 'Your market is probably already listed.',
    answer: 'Claim it and the page is yours — free, no account needed.',
    prose: [
      "fynda.market lists flea markets from organisers' own websites and calendars, whether or not they got in touch. So your market most likely has a page already, with its dates, address and opening hours. Claiming it puts you in charge of what it says.",
    ],
    listTitle: 'What you get',
    list: [
      'A personal link by e-mail — no password, no account needed. It opens your page: dates, number of stalls, indoor or outdoor, what happens when it rains.',
      "Seven days before each date, an e-mail with three buttons: it's on · cancelled · something changed. One click on the right one is your answer.",
      'Every date you confirm says "Confirmed by the organiser", with the day you did.',
      'A cancellation is on the page within the hour, and newsletter subscribers in your area hear at once.',
    ],
    after: 'Questions? Write to contact@fynda.market.',
    fields: [
      { name: 'name', label: 'Your name', required: true },
      { name: 'email', label: 'Email address', type: 'email', required: true },
      { name: 'markt', label: 'Name of the market', required: true },
      { name: 'ort', label: 'Town', required: true },
      { name: 'nachricht', label: 'Message (optional)', type: 'textarea', hint: 'For example: which date we should update.' },
    ],
    submit: 'Claim my market',
    note: 'Delfim reads every claim himself. Your personal link arrives by e-mail, usually within a day.',
    subject: 'Organiser',
    success: 'Thanks — your claim has arrived. Your personal link comes by e-mail, usually within a day.',
    failure: 'That did not work. We are opening your mail program instead — just send us the message.',
    errors: {
      invalid: 'That email address does not look right. Please check it.',
      failed: 'That did not work. Please try again.',
      offline: 'No connection. Check your network and try again.',
    },
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
  /** The word after the date count: one, many. "1 dates" was live until 2026-09-17. */
  dateOne: string;
  dateOther: string;
}

export const SAVED: Record<Locale, SavedPage> = {
  de: {
    title: 'Gemerkte Märkte — fynda.market',
    description: 'Deine gemerkten Flohmärkte, mit den nächsten Terminen.',
    heading: 'Gemerkt',
    none: 'Noch nichts gemerkt.',
    note: 'Gemerkte Märkte bleiben in diesem Browser gespeichert — kein Konto, keine Anmeldung nötig. Wenn du den Browser wechselst oder seine Daten löschst, beginnt die Liste von vorn.',
    empty: 'Auf jeder Marktseite gibt es den Knopf „Merken“. Gemerkte Märkte erscheinen hier mit ihren nächsten Terminen.',
    browse: 'Märkte durchsuchen',
    summary: '{markets} gemerkt, {dates}.',
    dateOne: 'kommender Termin',
    dateOther: 'kommende Termine',
  },
  fr: {
    title: 'Brocantes enregistrées — fynda.market',
    description: 'Vos brocantes enregistrées, avec leurs prochaines dates.',
    heading: 'Enregistré',
    none: "Rien d'enregistré pour l'instant.",
    note: "Les brocantes enregistrées sont gardées dans ce navigateur, sans compte ni inscription nécessaires. Si vous changez de navigateur ou effacez ses données, la liste repart de zéro.",
    empty: "Chaque page de brocante a un bouton « Enregistrer ». Les brocantes enregistrées apparaissent ici, avec leurs prochaines dates.",
    browse: 'Parcourir les brocantes',
    summary: '{markets} enregistrées, {dates}.',
    dateOne: 'date à venir',
    dateOther: 'dates à venir',
  },
  it: {
    title: 'Mercatini salvati — fynda.market',
    description: 'I tuoi mercatini salvati, con le prossime date.',
    heading: 'Salvati',
    none: 'Non hai ancora salvato nulla.',
    note: 'I mercatini salvati restano in questo browser — non servono né account né registrazione. Se cambi browser o ne cancelli i dati, si riparte da zero.',
    empty: 'Su ogni pagina di mercatino c’è il pulsante «Salva». I mercatini salvati compaiono qui con le loro prossime date.',
    browse: 'Sfoglia i mercatini',
    summary: '{markets} salvati, {dates}.',
    dateOne: 'data in arrivo',
    dateOther: 'date in arrivo',
  },
  en: {
    title: 'Saved markets — fynda.market',
    description: 'Your saved flea markets, with their next dates.',
    heading: 'Saved',
    none: 'Nothing saved yet.',
    note: 'Saved markets stay in this browser — no account or sign-in needed. Change browser or clear its data and the list starts again.',
    empty: 'Every market page has a "Save" button. Saved markets appear here with their next dates.',
    browse: 'Browse markets',
    summary: '{markets} saved, {dates}.',
    dateOne: 'date coming up',
    dateOther: 'dates coming up',
  },
};
