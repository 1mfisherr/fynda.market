/**
 * What an organiser reads after pressing a button.
 *
 * Four languages, one shape. `%m` is the market, `%d` the date. The pages are
 * short on purpose: the button in the mail was the act, this only says it
 * worked and what happens next.
 */

import type { Locale } from './_mail';

export interface OrganiserCopy {
  /** The link is not one we know. */
  invalidTitle: string;
  invalidBody: string;
  /** The date is not one of this organiser's. */
  notYoursTitle: string;
  notYoursBody: string;
  /** GET without a person behind it: one button to be sure. */
  confirmTitle: string;
  confirmBody: string;
  confirmButton: string;
  /** After "on". */
  onTitle: string;
  onBody: string;
  /** The follow-up to "cancelled". */
  cancelTitle: string;
  cancelBody: string;
  cancelDate: string;
  cancelMarket: string;
  /** After "just this date". */
  cancelledTitle: string;
  cancelledBody: string;
  /** After "the market has stopped". */
  stoppedTitle: string;
  stoppedBody: string;
  /** Edit page placeholder until it exists. */
  editSoonTitle: string;
  editSoonBody: string;
  toPage: string;
}

export const COPY: Record<Locale, OrganiserCopy> = {
  de: {
    invalidTitle: 'Dieser Link ist nicht mehr gültig',
    invalidBody: 'Vielleicht wurde ein neuer ausgestellt. Antworten Sie auf eine unserer E-Mails, und wir schicken Ihnen den aktuellen.',
    notYoursTitle: 'Dieser Termin gehört nicht zu Ihrem Markt',
    notYoursBody: 'Nichts wurde geändert. Wenn das ein Irrtum ist, antworten Sie auf unsere E-Mail.',
    confirmTitle: '%m am %d — findet statt?',
    confirmBody: 'Ein Tipp, und Ihre Seite zeigt es innert einer Stunde.',
    confirmButton: 'Ja, findet statt',
    onTitle: 'Danke — findet statt.',
    onBody: '%m am %d steht innert einer Stunde als „Vom Veranstalter bestätigt“ auf Ihrer Seite.',
    cancelTitle: '%m am %d — abgesagt',
    cancelBody: 'Nur dieser Termin, oder findet der Markt gar nicht mehr statt?',
    cancelDate: 'Nur dieser Termin',
    cancelMarket: 'Der Markt findet nicht mehr statt',
    cancelledTitle: 'Danke — abgesagt.',
    cancelledBody: '%m am %d steht innert einer Stunde als abgesagt auf Ihrer Seite. Wer den Termin im Newsletter abonniert hat, erfährt es jetzt.',
    stoppedTitle: 'Danke, wir haben es notiert.',
    stoppedBody: 'Delfim schaut es sich an und meldet sich bei Ihnen. Bis dahin bleibt die Seite, wie sie ist.',
    editSoonTitle: 'Ihre Seite zum Bearbeiten kommt in Kürze',
    editSoonBody: 'Termine, Standzahl, drinnen oder draussen, Regen — in ein paar Tagen können Sie das hier selbst eintragen. Bis dahin: einfach auf unsere E-Mail antworten.',
    toPage: 'Zur Marktseite',
  },
  fr: {
    invalidTitle: "Ce lien n'est plus valable",
    invalidBody: "Un nouveau a peut-être été émis. Répondez à l'un de nos e-mails et nous vous envoyons le lien actuel.",
    notYoursTitle: "Cette date n'appartient pas à votre marché",
    notYoursBody: "Rien n'a été modifié. Si c'est une erreur, répondez à notre e-mail.",
    confirmTitle: '%m le %d — a lieu ?',
    confirmBody: "Un clic, et votre page l'affiche dans l'heure.",
    confirmButton: 'Oui, a lieu',
    onTitle: 'Merci — a lieu.',
    onBody: "%m le %d apparaît dans l'heure sur votre page comme « Confirmé par l'organisateur ».",
    cancelTitle: '%m le %d — annulé',
    cancelBody: "Seulement cette date, ou le marché n'a plus lieu du tout ?",
    cancelDate: 'Seulement cette date',
    cancelMarket: "Le marché n'a plus lieu",
    cancelledTitle: 'Merci — annulé.',
    cancelledBody: "%m le %d apparaît dans l'heure comme annulé sur votre page. Les abonnés de la newsletter concernés sont prévenus maintenant.",
    stoppedTitle: "Merci, c'est noté.",
    stoppedBody: "Delfim regarde et revient vers vous. D'ici là, la page reste telle quelle.",
    editSoonTitle: 'Votre page à modifier arrive bientôt',
    editSoonBody: "Dates, nombre de stands, intérieur ou extérieur, pluie — dans quelques jours vous pourrez l'indiquer ici vous-même. En attendant : répondez simplement à notre e-mail.",
    toPage: 'Voir la page du marché',
  },
  it: {
    invalidTitle: 'Questo link non è più valido',
    invalidBody: 'Forse ne è stato emesso uno nuovo. Rispondi a una nostra e-mail e ti mandiamo quello attuale.',
    notYoursTitle: 'Questa data non appartiene al tuo mercatino',
    notYoursBody: 'Non è stato modificato nulla. Se è un errore, rispondi alla nostra e-mail.',
    confirmTitle: '%m il %d — si fa?',
    confirmBody: "Un tocco, e la tua pagina lo mostra entro un'ora.",
    confirmButton: 'Sì, si fa',
    onTitle: 'Grazie — si fa.',
    onBody: "%m il %d compare entro un'ora sulla tua pagina come «Confermato dall'organizzatore».",
    cancelTitle: '%m il %d — annullato',
    cancelBody: 'Solo questa data, o il mercatino non si fa più?',
    cancelDate: 'Solo questa data',
    cancelMarket: 'Il mercatino non si fa più',
    cancelledTitle: 'Grazie — annullato.',
    cancelledBody: "%m il %d compare entro un'ora come annullato sulla tua pagina. Chi ha la newsletter per questa zona lo sa adesso.",
    stoppedTitle: 'Grazie, ne abbiamo preso nota.',
    stoppedBody: 'Delfim ci dà un\'occhiata e ti scrive. Fino ad allora la pagina resta com\'è.',
    editSoonTitle: 'La tua pagina da modificare arriva presto',
    editSoonBody: 'Date, numero di bancarelle, al coperto o all\'aperto, pioggia — tra qualche giorno potrai inserirlo qui tu stesso. Nel frattempo: rispondi semplicemente alla nostra e-mail.',
    toPage: 'Alla pagina del mercatino',
  },
  en: {
    invalidTitle: 'This link is no longer valid',
    invalidBody: 'A new one may have been issued. Reply to any of our e-mails and we will send you the current link.',
    notYoursTitle: 'This date is not one of your markets',
    notYoursBody: 'Nothing was changed. If this is a mistake, reply to our e-mail.',
    confirmTitle: '%m on %d — still on?',
    confirmBody: 'One tap, and your page shows it within the hour.',
    confirmButton: "Yes, it's on",
    onTitle: 'Thanks — it\'s on.',
    onBody: '%m on %d shows as “Confirmed by the organiser” on your page within the hour.',
    cancelTitle: '%m on %d — cancelled',
    cancelBody: 'Just this date, or has the market stopped altogether?',
    cancelDate: 'Just this date',
    cancelMarket: 'The market has stopped',
    cancelledTitle: 'Thanks — cancelled.',
    cancelledBody: '%m on %d shows as cancelled on your page within the hour. Newsletter subscribers nearby are being told now.',
    stoppedTitle: 'Thanks, noted.',
    stoppedBody: 'Delfim will look at it and get back to you. Until then the page stays as it is.',
    editSoonTitle: 'Your edit page is coming shortly',
    editSoonBody: 'Dates, number of stalls, indoor or outdoor, rain — in a few days you can enter these here yourself. Until then, just reply to our e-mail.',
    toPage: 'To the market page',
  },
};

export const copyFor = (locale: string | null | undefined): OrganiserCopy =>
  COPY[(locale as Locale) ?? 'en'] ?? COPY.en;
