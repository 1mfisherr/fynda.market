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
    description: 'Markt nicht gefunden, schon vorbei oder falsche Angaben? Meldung senden, wir prüfen von Hand.',
    heading: 'Etwas stimmt nicht?',
    answer: 'Sag uns, was du vor Ort erlebt hast — wir prüfen jede Meldung von Hand.',
    prose: [
      'Nichts ändert sich automatisch. Ein Mensch liest jede Meldung, prüft sie beim Veranstalter, und dann ändert sich die Seite — mit dem Tag der Prüfung.',
    ],
    fields: [
      { name: 'grund', label: 'Was ist passiert?', type: 'select', required: true, options: [
        { value: 'cancelled', label: 'Der Markt fand nicht statt' },
        { value: 'wrong_date', label: 'Der Markt war früher vorbei' },
        { value: 'wrong_location', label: 'Adresse oder Zeit stimmt nicht' },
        { value: 'other', label: 'Etwas anderes' },
      ] },
      { name: 'markt', label: 'Welcher Markt?', required: true, placeholder: 'z. B. Flohmarkt Zürich Bürkliplatz' },
      { name: 'email', label: 'E-Mail (optional)', type: 'email', hint: 'Falls wir zurückschreiben dürfen.' },
      { name: 'nachricht', label: 'Nachricht (optional)', type: 'textarea', placeholder: 'Was genau hast du festgestellt?' },
    ],
    submit: 'Meldung senden',
    note: 'Ein Mensch liest jede Meldung, bevor sich auf der Seite etwas ändert.',
    subject: 'Meldung',
    success: 'Danke — deine Meldung ist angekommen. Wir prüfen sie von Hand, in der Regel innert ein bis zwei Tagen.',
    failure: 'Das hat gerade nicht geklappt. Wir öffnen dein E-Mail-Programm — schicke uns die Meldung einfach so.',
    errors: {
      invalid: 'Diese E-Mail-Adresse sieht nicht richtig aus. Prüfe sie noch einmal.',
      failed: 'Das hat gerade nicht geklappt. Versuche es noch einmal.',
      offline: 'Keine Verbindung. Prüfe dein Netz und versuche es noch einmal.',
    },
  },
  fr: {
    title: 'Signaler un problème — fynda.market',
    description: "Brocante introuvable, déjà terminée ou informations fausses ? Envoyez-nous un signalement, nous vérifions à la main.",
    heading: "Quelque chose ne joue pas ?",
    answer: 'Dites-nous ce que vous avez constaté sur place — nous vérifions chaque signalement à la main.',
    prose: [
      "Rien ne change automatiquement. Une personne lit chaque signalement, le vérifie auprès de l'organisateur, et la page change ensuite — avec le jour de la vérification.",
    ],
    fields: [
      { name: 'grund', label: "Que s'est-il passé ?", type: 'select', required: true, options: [
        { value: 'cancelled', label: "La brocante n'a pas eu lieu" },
        { value: 'wrong_date', label: 'La brocante était déjà terminée' },
        { value: 'wrong_location', label: "L'adresse ou l'horaire est faux" },
        { value: 'other', label: 'Autre chose' },
      ] },
      { name: 'markt', label: 'Quelle brocante ?', required: true, placeholder: 'p. ex. Brocante de Plainpalais' },
      { name: 'email', label: 'E-mail (facultatif)', type: 'email', hint: 'Si nous pouvons vous répondre.' },
      { name: 'nachricht', label: 'Message (facultatif)', type: 'textarea', placeholder: "Qu'avez-vous constaté exactement ?" },
    ],
    submit: 'Envoyer le signalement',
    note: 'Une personne lit chaque signalement avant que quoi que ce soit change sur la page.',
    subject: 'Signalement',
    success: 'Merci — votre signalement nous est parvenu. Nous le vérifions à la main, en général en un à deux jours.',
    failure: "Cela n'a pas fonctionné. Nous ouvrons votre logiciel de messagerie — envoyez-nous simplement le signalement.",
    errors: {
      invalid: 'Cette adresse e-mail ne semble pas correcte. Merci de la vérifier.',
      failed: "Cela n'a pas fonctionné. Merci de réessayer.",
      offline: 'Pas de connexion. Vérifiez votre réseau et réessayez.',
    },
  },
  it: {
    title: 'Segnalare un problema — fynda.market',
    description: 'Mercatino non trovato, già finito o dati sbagliati? Mandaci una segnalazione, verifichiamo a mano.',
    heading: 'Qualcosa non torna?',
    answer: 'Dicci cosa hai trovato sul posto — verifichiamo ogni segnalazione a mano.',
    prose: [
      "Nulla cambia in automatico. Una persona legge ogni segnalazione, la verifica con l'organizzatore, e poi la pagina cambia — con il giorno della verifica.",
    ],
    fields: [
      { name: 'grund', label: 'Che cosa è successo?', type: 'select', required: true, options: [
        { value: 'cancelled', label: 'Il mercatino non si è svolto' },
        { value: 'wrong_date', label: 'Il mercatino era già finito' },
        { value: 'wrong_location', label: "L'indirizzo o l'orario non è corretto" },
        { value: 'other', label: 'Altro' },
      ] },
      { name: 'markt', label: 'Quale mercatino?', required: true, placeholder: 'per es. Mercatino di Lugano' },
      { name: 'email', label: 'E-mail (facoltativo)', type: 'email', hint: 'Se possiamo risponderti.' },
      { name: 'nachricht', label: 'Messaggio (facoltativo)', type: 'textarea', placeholder: 'Che cosa hai visto esattamente?' },
    ],
    submit: 'Inviare la segnalazione',
    note: 'Una persona legge ogni segnalazione prima che qualcosa cambi sulla pagina.',
    subject: 'Segnalazione',
    success: 'Grazie — la tua segnalazione è arrivata. La controlliamo a mano, di solito in uno o due giorni.',
    failure: 'Non ha funzionato. Apriamo il tuo programma di posta — mandaci semplicemente la segnalazione.',
    errors: {
      invalid: 'Questo indirizzo e-mail non sembra corretto. Controllalo ancora una volta.',
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
      'Kostenlos, kein Konto nötig. Ein Klick in jeder E-Mail, und du bist von der Liste.',
    ],
    fields: [
      { name: 'email', label: 'E-Mail-Adresse', type: 'email', required: true, placeholder: 'name@example.com' },
    ],
    submit: 'Anmelden',
    note: 'Nur diese E-Mail, und deine Adresse wird nie weitergegeben. Ein Klick, und sie hört auf.',
    subject: 'Newsletter',
    success: 'Du stehst auf der Liste. Die erste Ausgabe kommt am Freitagmorgen.',
    failure: 'Das hat gerade nicht geklappt. Wir öffnen dein E-Mail-Programm — schicke uns die Nachricht einfach so.',
    errors: {
      empty: 'Trage deine E-Mail-Adresse ein, damit wir wissen, wohin.',
      invalid: 'Das sieht nicht nach einer E-Mail-Adresse aus. Prüfe sie noch einmal.',
      failed: `Das hat bei uns nicht geklappt. Versuche es noch einmal, oder schreibe an ${CONTACT} — wir tragen dich von Hand ein.`,
      offline: 'Du scheinst offline zu sein. Versuche es noch einmal, sobald du wieder Verbindung hast.',
    },
  },
  fr: {
    title: 'Newsletter — fynda.market',
    description: "Chaque vendredi : ce qui se passe ce week-end près de chez vous, plus un mot si une brocante est annulée. Gratuit, sans compte à créer.",
    heading: 'Newsletter',
    answer: 'Un e-mail chaque vendredi matin : ce qui se passe ce week-end près de chez vous.',
    prose: [
      "Une fois par semaine, le vendredi, pour une commune, un canton ou tout le pays : les brocantes du week-end, les nouvelles dates, celles qui sont annulées. Si un organisateur annule une date ensuite, vous recevez un mot le jour même — pour ne pas faire le déplacement pour rien.",
      "Gratuit, sans compte à créer. Un clic dans n'importe quel e-mail, et vous quittez la liste.",
    ],
    fields: [
      { name: 'email', label: 'Adresse e-mail', type: 'email', required: true, placeholder: 'name@example.com' },
    ],
    submit: "S'inscrire",
    note: "Seulement cet e-mail, et votre adresse n'est jamais transmise. Un clic suffit pour l'arrêter.",
    subject: 'Newsletter',
    success: "Vous êtes sur la liste. Le premier numéro arrive vendredi matin.",
    failure: "Cela n'a pas fonctionné. Nous ouvrons votre logiciel de messagerie — envoyez-nous simplement le message.",
    errors: {
      empty: "Indiquez votre adresse e-mail, que nous sachions où l'envoyer.",
      invalid: "Cela ne ressemble pas à une adresse e-mail. Vérifiez-la et réessayez.",
      failed: `Cela n'a pas fonctionné chez nous. Réessayez, ou écrivez à ${CONTACT} et nous vous inscrirons à la main.`,
      offline: "Vous semblez hors ligne. Réessayez dès que vous aurez du réseau.",
    },
  },
  it: {
    title: 'Newsletter — fynda.market',
    description: 'Ogni venerdì: cosa c’è questo fine settimana vicino a te, più un avviso se un mercatino viene annullato. Gratis, senza account.',
    heading: 'Newsletter',
    answer: 'Ogni venerdì mattina una e-mail: cosa c’è questo fine settimana vicino a te.',
    prose: [
      'Una volta alla settimana, il venerdì, per una città, un cantone o tutto il paese: i mercatini del fine settimana, le nuove date, quelle annullate. Se poi un organizzatore annulla una data, ricevi un breve avviso lo stesso giorno — così non fai il viaggio per niente.',
      'Gratis, senza account. Un clic in qualsiasi e-mail, e sei fuori dalla lista.',
    ],
    fields: [
      { name: 'email', label: 'Indirizzo e-mail', type: 'email', required: true, placeholder: 'name@example.com' },
    ],
    submit: 'Iscriversi',
    note: 'Solo questa e-mail, e il tuo indirizzo non viene mai passato a nessuno. Basta un clic per fermarla.',
    subject: 'Newsletter',
    success: 'Sei sulla lista. Il primo numero arriva venerdì mattina.',
    failure: 'Non ha funzionato. Apriamo il tuo programma di posta — mandaci semplicemente il messaggio.',
    errors: {
      empty: 'Inserisci il tuo indirizzo e-mail, così sappiamo dove scriverti.',
      invalid: 'Questo non sembra un indirizzo e-mail. Controllalo e riprova.',
      failed: `Da parte nostra non ha funzionato. Riprova, oppure scrivi a ${CONTACT} e ti iscriviamo a mano.`,
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
    description: 'Ihr Flohmarkt ist wahrscheinlich schon bei fynda.market gelistet. Holen Sie sich Ihre Marktseite — kostenlos, kein Konto nötig.',
    heading: 'Ihr Markt ist wahrscheinlich schon eingetragen.',
    answer: 'Übernehmen Sie ihn, und die Seite gehört Ihnen — kostenlos, kein Konto nötig.',
    prose: [
      'fynda.market führt Flohmärkte nach den Websites und Kalendern der Veranstalter, ob sie sich gemeldet haben oder nicht. Ihr Markt hat deshalb sehr wahrscheinlich schon eine Seite, mit Terminen, Adresse und Öffnungszeiten. Wer sie übernimmt, bestimmt, was darauf steht.',
    ],
    listTitle: 'Was das bringt',
    list: [
      'Ein persönlicher Link per E-Mail — kein Passwort, kein Konto nötig. Er öffnet Ihre Seite: Termine, Standzahl, drinnen oder draussen, was bei Regen gilt.',
      'Sieben Tage vor jedem Termin eine E-Mail mit drei Knöpfen: findet statt · abgesagt · etwas hat sich geändert. Ein Tipp genügt.',
      'Jeder Termin, den Sie bestätigen, trägt „Vom Veranstalter bestätigt“ und den Tag, an dem Sie es getan haben.',
      'Eine Absage steht innert einer Stunde auf der Seite, und wer den Newsletter für Ihre Gegend hat, erfährt es sofort.',
    ],
    after: 'Fragen? Schreiben Sie an contact@fynda.market.',
    fields: [
      { name: 'name', label: 'Ihr Name', required: true },
      { name: 'email', label: 'E-Mail-Adresse', type: 'email', required: true },
      { name: 'markt', label: 'Name des Marktes', required: true },
      { name: 'ort', label: 'Ort', required: true },
      { name: 'nachricht', label: 'Nachricht (optional)', type: 'textarea', hint: 'Zum Beispiel: welches Datum wir aktualisieren sollen.' },
    ],
    submit: 'Meinen Markt übernehmen',
    note: 'Delfim liest jede Anfrage selbst. Ihr persönlicher Link kommt per E-Mail, meist innert eines Tages.',
    subject: 'Veranstalter',
    success: 'Danke — Ihre Anfrage ist angekommen. Ihr persönlicher Link kommt per E-Mail, meist innert eines Tages.',
    failure: 'Das hat gerade nicht geklappt. Wir öffnen Ihr E-Mail-Programm — schicken Sie uns die Nachricht einfach so.',
    errors: {
      invalid: 'Diese E-Mail-Adresse sieht nicht richtig aus. Prüfe sie noch einmal.',
      failed: 'Das hat gerade nicht geklappt. Versuche es noch einmal.',
      offline: 'Keine Verbindung. Prüfe dein Netz und versuche es noch einmal.',
    },
  },
  fr: {
    title: 'Pour les organisateurs — fynda.market',
    description: 'Votre brocante est probablement déjà sur fynda.market. Réclamez votre page — gratuitement, sans compte à créer.',
    heading: 'Votre brocante est probablement déjà répertoriée.',
    answer: 'Reprenez-la, et la page est à vous — gratuit, sans compte à créer.',
    prose: [
      "fynda.market répertorie les brocantes d'après les sites et calendriers des organisateurs, qu'ils nous aient contactés ou non. Votre brocante a donc très probablement déjà une page, avec ses dates, son adresse et ses horaires. La reprendre, c'est décider de ce qu'elle dit.",
    ],
    listTitle: 'Ce que cela vous apporte',
    list: [
      "Un lien personnel par e-mail — pas de mot de passe, pas de compte à créer. Il ouvre votre page : dates, nombre de stands, intérieur ou extérieur, ce qui se passe en cas de pluie.",
      "Sept jours avant chaque date, un e-mail avec trois boutons : a lieu · annulé · quelque chose a changé. Un clic suffit.",
      "Chaque date que vous confirmez porte « Confirmé par l'organisateur » et le jour où vous l'avez fait.",
      "Une annulation apparaît sur la page dans l'heure, et les abonnés de la newsletter de votre région sont prévenus aussitôt.",
    ],
    after: 'Une question ? Écrivez à contact@fynda.market.',
    fields: [
      { name: 'name', label: 'Votre nom', required: true },
      { name: 'email', label: 'Adresse e-mail', type: 'email', required: true },
      { name: 'markt', label: 'Nom de la brocante', required: true },
      { name: 'ort', label: 'Commune', required: true },
      { name: 'nachricht', label: 'Message (facultatif)', type: 'textarea', hint: 'Par exemple : quelle date nous devons mettre à jour.' },
    ],
    submit: 'Reprendre ma brocante',
    note: 'Delfim lit chaque demande lui-même. Votre lien personnel arrive par e-mail, en général sous un jour.',
    subject: 'Organisateur',
    success: 'Merci — votre demande nous est parvenue. Votre lien personnel arrive par e-mail, en général sous un jour.',
    failure: "Cela n'a pas fonctionné. Nous ouvrons votre logiciel de messagerie — envoyez-nous simplement le message.",
    errors: {
      invalid: 'Cette adresse e-mail ne semble pas correcte. Merci de la vérifier.',
      failed: "Cela n'a pas fonctionné. Merci de réessayer.",
      offline: 'Pas de connexion. Vérifiez votre réseau et réessayez.',
    },
  },
  it: {
    title: 'Per gli organizzatori — fynda.market',
    description: 'Il tuo mercatino è probabilmente già su fynda.market. Prendi in mano la tua pagina — gratis, senza account.',
    heading: 'Il tuo mercatino è probabilmente già in elenco.',
    answer: 'Prendilo in mano, e la pagina è tua — gratis, senza account.',
    prose: [
      'fynda.market elenca i mercatini a partire dai siti e dai calendari degli organizzatori, che ci abbiano contattato o no. Il tuo mercatino ha quindi molto probabilmente già una pagina, con date, indirizzo e orari. Prenderla in mano significa decidere cosa dice.',
    ],
    listTitle: 'A cosa serve',
    list: [
      "Un link personale via e-mail — nessuna password, nessun account. Apre la tua pagina: date, numero di bancarelle, al coperto o all'aperto, cosa succede se piove.",
      "Sette giorni prima di ogni data, un'e-mail con tre pulsanti: si fa · annullato · qualcosa è cambiato. Basta un tocco.",
      "Ogni data che confermi riporta «Confermato dall'organizzatore» e il giorno in cui l'hai fatto.",
      "Un annullamento compare sulla pagina entro un'ora, e chi ha la newsletter per la tua zona lo sa subito.",
    ],
    after: 'Domande? Scrivi a contact@fynda.market.',
    fields: [
      { name: 'name', label: 'Il tuo nome', required: true },
      { name: 'email', label: 'Indirizzo e-mail', type: 'email', required: true },
      { name: 'markt', label: 'Nome del mercatino', required: true },
      { name: 'ort', label: 'Località', required: true },
      { name: 'nachricht', label: 'Messaggio (facoltativo)', type: 'textarea', hint: 'Per esempio: quale data dobbiamo aggiornare.' },
    ],
    submit: 'Prendere in mano il mio mercatino',
    note: 'Delfim legge ogni richiesta di persona. Il tuo link personale arriva via e-mail, di solito entro un giorno.',
    subject: 'Organizzatore',
    success: 'Grazie — la tua richiesta è arrivata. Il tuo link personale arriva via e-mail, di solito entro un giorno.',
    failure: 'Non ha funzionato. Apriamo il tuo programma di posta — mandaci semplicemente il messaggio.',
    errors: {
      invalid: 'Questo indirizzo e-mail non sembra corretto. Lo controlli ancora una volta.',
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
      "Seven days before each date, an e-mail with three buttons: it's on · cancelled · something changed. One tap.",
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
    note: 'Gemerkte Märkte bleiben in diesem Browser gespeichert — kein Konto, keine Anmeldung nötig. Wer den Browser wechselt oder die Daten löscht, beginnt neu.',
    empty: 'Auf jeder Marktseite gibt es «Merken». Gemerkte Märkte erscheinen hier mit ihren nächsten Terminen.',
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
    note: "Les brocantes enregistrées restent dans ce navigateur — sans compte ni inscription à créer. Si vous changez de navigateur ou effacez ses données, la liste repart de zéro.",
    empty: "Sur chaque page de brocante il y a « Enregistrer ». Les brocantes enregistrées apparaissent ici avec leurs prochaines dates.",
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
    note: 'I mercatini salvati restano in questo browser — nessun account, nessuna registrazione richiesta. Se cambi browser o ne cancelli i dati, si riparte da zero.',
    empty: 'Su ogni pagina di mercatino c’è «Salva». I mercatini salvati compaiono qui con le loro prossime date.',
    browse: 'Sfogliare i mercatini',
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
