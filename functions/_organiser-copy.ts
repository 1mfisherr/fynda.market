/**
 * What an organiser reads after pressing a button.
 *
 * Four languages, one shape. `%m` is the market, `%d` a date, `%n` a number.
 * The button pages are short on purpose: the button in the mail was the act,
 * this only says it worked. The edit page's copy is docs/PAGES.md §Organiser
 * page, approved line by line on 2026-09-21 — a person writing to a person.
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
  toPage: string;
  /** The edit page — docs/PAGES.md §Organiser page. */
  chooseMarket: string;
  eyebrow: string;
  hello: string;
  whyCount: string;         // %n people — shown from 20 up
  why: string;              // the same line without a number
  nextTitle: string;
  nextChecked: string;      // %d
  nextConfirmed: string;    // %d
  nextNone: string;
  nextYes: string;
  nextChanged: string;
  nextHint: string;         // after the two choices: the button is at the foot
  viewPublic: string;       // link under the name, opens the visitor's page in a new tab
  datesTitle: string;
  datesIntro: string;
  stampConfirmed: string;   // %d
  stampNot: string;
  stampCancelled: string;
  change: string;
  cancel: string;
  remove: string;
  fromLabel: string;
  toLabel: string;
  addDate: string;
  addAnother: string;
  aboutTitle: string;
  aboutIntro: string;
  stallsLabel: string;
  stallsPlaceholder: string;
  settingLabel: string;
  settingIndoor: string;
  settingOutdoor: string;
  settingBoth: string;
  rainLabel: string;
  rainRuns: string;
  rainCancelled: string;
  rainDecided: string;
  rainHint: string;
  feeLabel: string;
  feeFree: string;
  websiteLabel: string;
  bookingLabel: string;
  bookingPlaceholder: string;
  bookingHint: string;
  thereLabel: string;
  therePlaceholder: string;
  tagsLabel: string;
  tags: Record<string, string>;
  tagsHint: string;
  wordsLabel: string;
  wordsPlaceholder: string;
  wordsHint: string;
  photoLabel: string;
  photoHint: string;
  save: string;
  saveHint: string;
  footLink: string;
  footReply: string;
  footOut: string;
  savedTitle: string;
  savedBody: string;
  backToPage: string;
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
    toPage: 'Zur Marktseite',
    chooseMarket: 'Welcher Markt?',
    eyebrow: 'Die Seite Ihres Marktes',
    hello: 'Danke, dass Sie einen Markt organisieren.',
    whyCount: 'Ich bin Delfim, und das ist die Seite Ihres Marktes auf fynda.market, wo Leute aus der Umgebung nach dem nächsten Flohmarkt suchen. Was sie hier finden — Ihre Termine, Ihre Öffnungszeiten, ob er stattfindet — entscheidet, ob sie kommen. %n von ihnen haben im letzten Monat hier nachgesehen. Wenn ein Termin Ihr Wort trägt, vertrauen die Leute ihm und kommen. Mehr verlangt diese Seite nicht von Ihnen: ein Blick und ein Klick.',
    why: 'Ich bin Delfim, und das ist die Seite Ihres Marktes auf fynda.market, wo Leute aus der Umgebung nach dem nächsten Flohmarkt suchen. Was sie hier finden — Ihre Termine, Ihre Öffnungszeiten, ob er stattfindet — entscheidet, ob sie kommen. Wenn ein Termin Ihr Wort trägt, vertrauen die Leute ihm und kommen. Mehr verlangt diese Seite nicht von Ihnen: ein Blick und ein Klick.',
    nextTitle: 'Ihr nächster Termin. Findet er statt?',
    nextChecked: 'Zuletzt von uns geprüft am %d.',
    nextConfirmed: 'Von Ihnen bestätigt am %d.',
    nextNone: 'Noch kein kommender Termin auf Ihrer Seite. Tragen Sie unten einen ein.',
    nextYes: 'Ja, findet statt',
    nextChanged: 'Etwas hat sich geändert',
    nextHint: 'Bestätigen unten, nach einem Blick auf den Rest.',
    viewPublic: 'Ihre Seite so sehen, wie Besucher sie sehen',
    datesTitle: 'Ihre Termine',
    datesIntro: 'Hier ist alles, was wir von Ihnen haben. Ändern Sie, was falsch ist, ergänzen Sie, was fehlt. Wenn Sie einen Termin absagen, erfahren es alle in der Nähe, die Neuigkeiten abonniert haben, noch am selben Tag.',
    stampConfirmed: 'Bestätigt am %d',
    stampNot: 'Noch nicht bestätigt',
    stampCancelled: 'Abgesagt',
    change: 'Ändern',
    cancel: 'Absagen',
    remove: 'Diesen Termin entfernen',
    fromLabel: 'Von',
    toLabel: 'Bis',
    addDate: 'Termin hinzufügen',
    addAnother: 'Noch einen',
    aboutTitle: 'Über den Markt',
    aboutIntro: 'Ein paar Dinge, die Leute fragen, bevor sie kommen. Füllen Sie aus, was Sie wissen, und lassen Sie den Rest weg.',
    stallsLabel: 'Ungefähr wie viele Stände',
    stallsPlaceholder: 'z. B. 80',
    settingLabel: 'Drinnen oder draussen',
    settingIndoor: 'Drinnen',
    settingOutdoor: 'Draussen',
    settingBoth: 'Beides',
    rainLabel: 'Bei Regen',
    rainRuns: 'Findet statt',
    rainCancelled: 'Fällt aus',
    rainDecided: 'Wir entscheiden am Morgen',
    rainHint: '„Wir entscheiden am Morgen“ ist völlig in Ordnung. Die Leute wollen nur wissen, dass sie vorher nachschauen sollen.',
    feeLabel: 'Eintritt für Besucher',
    feeFree: 'Gratis',
    websiteLabel: 'Ihre Website',
    bookingLabel: 'Wo man einen Stand bucht',
    bookingPlaceholder: 'Ein Link, eine E-Mail oder „für 2026 ausgebucht“',
    bookingHint: 'Die Frage, die wir am häufigsten bekommen. Besser, sie fragen Sie.',
    thereLabel: 'Anreise',
    therePlaceholder: 'Haltestelle, Parkplatz — was Sie Ihren eigenen Freunden sagen würden',
    tagsLabel: 'Was man hier findet',
    tags: { antiques: 'Antiquitäten', furniture: 'Möbel', clothes: 'Kleider', records_books: 'Platten & Bücher', kids: 'Kindersachen', food: 'Essen & Trinken' },
    tagsHint: 'Wählen Sie ein paar aus. So findet Sie jemand, der alte Platten sucht.',
    wordsLabel: 'In Ihren Worten',
    wordsPlaceholder: 'Ein paar Sätze über Ihren Markt, in Ihrer Sprache.',
    wordsHint: 'Wir zeigen sie als Ihre, und wir ändern nichts daran.',
    photoLabel: 'Ein Foto',
    photoHint: 'Haben Sie eines? Antworten Sie auf unsere E-Mail damit. Es ist noch in derselben Woche auf der Seite. Ein Handyfoto an einem vollen Morgen ist perfekt.',
    save: 'Bestätigen',
    saveHint: 'Innert einer Stunde auf Ihrer Seite.',
    footLink: 'Dieser Link gehört Ihnen. Wer ihn hat, kann die Seite ändern — geben Sie ihn nur weiter, wenn es jemand soll.',
    footReply: 'Alles andere — der Name, die Adresse, der Tag, an dem er stattfindet — einfach auf die E-Mail antworten. Ich lese jede.',
    footOut: 'Keine E-Mails mehr von uns? Ganz unten in jeder ist ein Link dafür.',
    savedTitle: 'Bestätigt.',
    savedBody: 'Innert einer Stunde auf Ihrer Seite.',
    backToPage: 'Zurück zu Ihrer Seite',
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
    toPage: 'Voir la page du marché',
    chooseMarket: 'Quel marché ?',
    eyebrow: 'La page de votre marché',
    hello: "Merci d'organiser un marché.",
    whyCount: "Je m'appelle Delfim, et voici la page de votre marché sur fynda.market, où les gens des environs cherchent la prochaine brocante. Ce qu'ils trouvent ici — vos dates, vos horaires, si elle a lieu — décide s'ils viennent. %n d'entre eux l'ont regardée le mois dernier. Quand une date porte votre parole, les gens lui font confiance et se déplacent. C'est tout ce que cette page vous demande : un coup d'œil, et un clic.",
    why: "Je m'appelle Delfim, et voici la page de votre marché sur fynda.market, où les gens des environs cherchent la prochaine brocante. Ce qu'ils trouvent ici — vos dates, vos horaires, si elle a lieu — décide s'ils viennent. Quand une date porte votre parole, les gens lui font confiance et se déplacent. C'est tout ce que cette page vous demande : un coup d'œil, et un clic.",
    nextTitle: 'Votre prochaine date. A-t-elle toujours lieu ?',
    nextChecked: 'Vérifié par nous le %d.',
    nextConfirmed: 'Confirmé par vous le %d.',
    nextNone: "Pas encore de date à venir sur votre page. Ajoutez-en une ci-dessous.",
    nextYes: 'Oui, a lieu',
    nextChanged: 'Quelque chose a changé',
    nextHint: "Confirmez en bas, après un coup d'œil au reste.",
    viewPublic: 'Voir votre page comme les visiteurs la voient',
    datesTitle: 'Vos dates',
    datesIntro: "Voici tout ce que nous avons pour vous. Corrigez ce qui est faux, ajoutez ce qui manque. Si vous annulez une date, tous ceux des environs qui se sont inscrits aux nouvelles le sauront le jour même.",
    stampConfirmed: 'Confirmé le %d',
    stampNot: 'Pas encore confirmé',
    stampCancelled: 'Annulé',
    change: 'Modifier',
    cancel: 'Annuler',
    remove: 'Retirer cette date',
    fromLabel: 'De',
    toLabel: 'À',
    addDate: 'Ajouter une date',
    addAnother: 'Encore une',
    aboutTitle: 'À propos du marché',
    aboutIntro: 'Quelques questions que les gens se posent avant de venir. Remplissez ce que vous savez, laissez le reste.',
    stallsLabel: 'Environ combien de stands',
    stallsPlaceholder: 'p. ex. 80',
    settingLabel: 'Intérieur ou extérieur',
    settingIndoor: 'Intérieur',
    settingOutdoor: 'Extérieur',
    settingBoth: 'Les deux',
    rainLabel: "S'il pleut",
    rainRuns: 'A lieu',
    rainCancelled: 'Annulé',
    rainDecided: 'On décide le matin même',
    rainHint: "« On décide le matin même », c'est très bien. Les gens veulent juste savoir qu'il faut vérifier avant.",
    feeLabel: 'Entrée pour les visiteurs',
    feeFree: 'Gratuit',
    websiteLabel: 'Votre site',
    bookingLabel: 'Où réserver un stand',
    bookingPlaceholder: 'Un lien, un e-mail, ou « complet pour 2026 »',
    bookingHint: "La question qu'on nous pose le plus. Mieux vaut qu'ils vous la posent à vous.",
    thereLabel: 'Comment venir',
    therePlaceholder: "L'arrêt de bus, le parking — ce que vous diriez à vos propres amis",
    tagsLabel: "Ce qu'on trouve ici",
    tags: { antiques: 'Antiquités', furniture: 'Meubles', clothes: 'Vêtements', records_books: 'Disques & livres', kids: 'Pour les enfants', food: 'À boire et à manger' },
    tagsHint: "Choisissez-en quelques-uns. C'est ainsi que quelqu'un qui cherche de vieux disques vous trouve.",
    wordsLabel: 'Avec vos mots',
    wordsPlaceholder: 'Quelques phrases sur votre marché, dans votre langue.',
    wordsHint: "Nous les affichons comme les vôtres, et nous n'y touchons pas.",
    photoLabel: 'Une photo',
    photoHint: "Vous en avez une ? Répondez à notre e-mail avec. Elle est en ligne la semaine même. Une photo de téléphone un matin de foule, c'est parfait.",
    save: 'Confirmer',
    saveHint: "Sur votre page dans l'heure.",
    footLink: "Ce lien est le vôtre. Quiconque l'a peut modifier la page — ne le partagez qu'avec quelqu'un qui doit l'avoir.",
    footReply: "Pour tout le reste — le nom, l'adresse, le jour où il a lieu — répondez simplement à l'e-mail. Je lis chacun d'eux.",
    footOut: "Vous ne voulez plus d'e-mails de notre part ? Il y a un lien pour ça en bas de chacun.",
    savedTitle: 'Confirmé.',
    savedBody: "Sur votre page dans l'heure.",
    backToPage: 'Retour à votre page',
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
    toPage: 'Alla pagina del mercatino',
    chooseMarket: 'Quale mercatino?',
    eyebrow: 'La pagina del tuo mercatino',
    hello: 'Grazie per organizzare un mercatino.',
    whyCount: "Sono Delfim, e questa è la pagina del tuo mercatino su fynda.market, dove la gente dei dintorni cerca il prossimo. Quello che trova qui — le tue date, i tuoi orari, se si fa — decide se viene. %n di loro l'hanno guardata il mese scorso. Quando una data porta la tua parola, la gente ci crede e arriva. È tutto ciò che questa pagina ti chiede: un'occhiata e un tocco.",
    why: "Sono Delfim, e questa è la pagina del tuo mercatino su fynda.market, dove la gente dei dintorni cerca il prossimo. Quello che trova qui — le tue date, i tuoi orari, se si fa — decide se viene. Quando una data porta la tua parola, la gente ci crede e arriva. È tutto ciò che questa pagina ti chiede: un'occhiata e un tocco.",
    nextTitle: 'La tua prossima data. Si fa ancora?',
    nextChecked: "Controllato da noi il %d.",
    nextConfirmed: 'Confermato da te il %d.',
    nextNone: 'Nessuna data in arrivo sulla tua pagina. Aggiungine una qui sotto.',
    nextYes: 'Sì, si fa',
    nextChanged: 'È cambiato qualcosa',
    nextHint: "Conferma in fondo, dopo un'occhiata al resto.",
    viewPublic: 'Vedi la tua pagina come la vedono i visitatori',
    datesTitle: 'Le tue date',
    datesIntro: "Ecco tutto quello che abbiamo per te. Correggi quello che è sbagliato, aggiungi quello che manca. Se annulli una data, chi nei dintorni si è iscritto alle novità lo sa il giorno stesso.",
    stampConfirmed: 'Confermato il %d',
    stampNot: 'Non ancora confermato',
    stampCancelled: 'Annullato',
    change: 'Modifica',
    cancel: 'Annulla',
    remove: 'Togli questa data',
    fromLabel: 'Dalle',
    toLabel: 'Alle',
    addDate: 'Aggiungi una data',
    addAnother: "Un'altra",
    aboutTitle: 'Sul mercatino',
    aboutIntro: 'Qualche domanda che la gente si fa prima di venire. Compila quello che sai e salta il resto.',
    stallsLabel: 'Circa quante bancarelle',
    stallsPlaceholder: 'es. 80',
    settingLabel: "Al coperto o all'aperto",
    settingIndoor: 'Al coperto',
    settingOutdoor: "All'aperto",
    settingBoth: 'Entrambi',
    rainLabel: 'Se piove',
    rainRuns: 'Si fa',
    rainCancelled: 'Annullato',
    rainDecided: 'Decidiamo la mattina stessa',
    rainHint: '«Decidiamo la mattina stessa» va benissimo. La gente vuole solo sapere che deve controllare prima.',
    feeLabel: 'Ingresso per i visitatori',
    feeFree: 'Gratis',
    websiteLabel: 'Il tuo sito',
    bookingLabel: 'Dove si prenota una bancarella',
    bookingPlaceholder: 'Un link, una e-mail, o «tutto esaurito per il 2026»',
    bookingHint: 'La domanda che ci fanno più spesso. Meglio che la facciano a te.',
    thereLabel: 'Come arrivare',
    therePlaceholder: 'La fermata, il parcheggio — quello che diresti ai tuoi amici',
    tagsLabel: 'Cosa si trova qui',
    tags: { antiques: 'Antiquariato', furniture: 'Mobili', clothes: 'Vestiti', records_books: 'Dischi e libri', kids: 'Per bambini', food: 'Da mangiare e bere' },
    tagsHint: 'Scegline qualcuno. È così che chi cerca vecchi dischi ti trova.',
    wordsLabel: 'Con le tue parole',
    wordsPlaceholder: 'Qualche frase sul tuo mercatino, nella tua lingua.',
    wordsHint: 'Le mostriamo come tue, e non le tocchiamo.',
    photoLabel: 'Una foto',
    photoHint: "Ne hai una? Rispondi alla nostra e-mail con la foto. È online la settimana stessa. Una foto dal telefono in una mattina piena è perfetta.",
    save: 'Conferma',
    saveHint: "Sulla tua pagina entro un'ora.",
    footLink: 'Questo link è tuo. Chiunque lo abbia può modificare la pagina — passalo solo a chi deve averlo.',
    footReply: "Tutto il resto — il nome, l'indirizzo, il giorno in cui si fa — rispondi semplicemente alla e-mail. Le leggo tutte.",
    footOut: "Non vuoi più e-mail da noi? In fondo a ognuna c'è un link per questo.",
    savedTitle: 'Confermato.',
    savedBody: "Sulla tua pagina entro un'ora.",
    backToPage: 'Torna alla tua pagina',
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
    toPage: 'To the market page',
    chooseMarket: 'Which market?',
    eyebrow: "Your market's page",
    hello: 'Thank you for running a market.',
    whyCount: "I'm Delfim, and this is your market's page on fynda.market, where people nearby look for the next one. What they find here — your dates, your hours, whether it's on — is what decides if they come. %n of them looked last month. When a date carries your word, people trust it and turn up. That's all this page asks of you: a look, and a tap.",
    why: "I'm Delfim, and this is your market's page on fynda.market, where people nearby look for the next one. What they find here — your dates, your hours, whether it's on — is what decides if they come. When a date carries your word, people trust it and turn up. That's all this page asks of you: a look, and a tap.",
    nextTitle: 'Your next date. Is it still on?',
    nextChecked: 'We last checked this on %d.',
    nextConfirmed: 'You confirmed this on %d.',
    nextNone: 'No upcoming date on your page yet. Add one below.',
    nextYes: "Yes, it's on",
    nextChanged: "Something's changed",
    nextHint: 'Confirm at the bottom, after a look at the rest.',
    viewPublic: 'See your page as visitors see it',
    datesTitle: 'Your dates',
    datesIntro: "Here's everything we have for you. Change what's wrong, add what's missing. If you cancel a date, everyone nearby who signed up for news hears the same day.",
    stampConfirmed: 'Confirmed %d',
    stampNot: 'Not yet confirmed',
    stampCancelled: 'Cancelled',
    change: 'Change',
    cancel: 'Cancel',
    remove: 'Remove this date',
    fromLabel: 'From',
    toLabel: 'To',
    addDate: 'Add a date',
    addAnother: 'Add another',
    aboutTitle: 'About the market',
    aboutIntro: 'A few things people ask before they come. Fill in what you know and skip the rest.',
    stallsLabel: 'Roughly how many stalls',
    stallsPlaceholder: 'e.g. 80',
    settingLabel: 'Indoors or out',
    settingIndoor: 'Indoors',
    settingOutdoor: 'Outdoors',
    settingBoth: 'Both',
    rainLabel: 'If it rains',
    rainRuns: 'Goes ahead',
    rainCancelled: 'Cancelled',
    rainDecided: 'We decide that morning',
    rainHint: '“We decide that morning” is fine. People just want to know to check first.',
    feeLabel: 'Entry for visitors',
    feeFree: 'Free',
    websiteLabel: 'Your website',
    bookingLabel: 'Where people book a stall',
    bookingPlaceholder: 'A link, an e-mail, or “full for 2026”',
    bookingHint: 'The question we get asked most. Better they ask you.',
    thereLabel: 'Getting there',
    therePlaceholder: 'Bus stop, parking, whatever you tell your own friends',
    tagsLabel: 'What people find here',
    tags: { antiques: 'Antiques', furniture: 'Furniture', clothes: 'Clothes', records_books: 'Records & books', kids: "Kids' things", food: 'Food & drink' },
    tagsHint: "Pick a few. It's how someone looking for old records finds you.",
    wordsLabel: 'In your words',
    wordsPlaceholder: 'A few sentences about your market, in your own language.',
    wordsHint: "We show them as yours, and we don't touch them.",
    photoLabel: 'A photo',
    photoHint: 'Got one? Reply to our mail with it. It goes up the same week. A phone photo on a busy morning is perfect.',
    save: 'Confirm',
    saveHint: 'On your page within the hour.',
    footLink: 'This link is yours. Anyone who has it can change the page, so only share it with someone who should.',
    footReply: 'Anything else — the name, the address, the day it runs — just reply to the mail. I read every one.',
    footOut: "Don't want mail from us? There's a link at the bottom of every one.",
    savedTitle: 'Confirmed.',
    savedBody: 'On your page within the hour.',
    backToPage: 'Back to your page',
  },
};

export const copyFor = (locale: string | null | undefined): OrganiserCopy =>
  COPY[(locale as Locale) ?? 'en'] ?? COPY.en;
