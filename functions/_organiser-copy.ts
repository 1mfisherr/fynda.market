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
  /** No date, and people asked to be told it: the card says how many, and nothing else (Delfim, 2026-10-10). %n from 2 up. */
  waitingOne: string;
  waitingMany: string;
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
  /** The terms line. The part in {braces} becomes the link to the terms page in this language. */
  footTerms: string;
  savedTitle: string;
  savedBody: string;
  backToPage: string;
}

export const COPY: Record<Locale, OrganiserCopy> = {
  de: {
    invalidTitle: 'Dieser Link ist nicht mehr gültig',
    invalidBody: 'Vielleicht gibt es inzwischen einen neuen. Antworten Sie auf eine unserer E-Mails, und wir schicken Ihnen den aktuellen.',
    notYoursTitle: 'Dieser Termin gehört nicht zu Ihrem Markt',
    notYoursBody: 'Es wurde nichts geändert. Wenn das ein Irrtum ist, antworten Sie auf unsere E-Mail.',
    confirmTitle: '%m am %d — findet er statt?',
    confirmBody: 'Ein Klick genügt, und innerhalb einer Stunde steht es auf Ihrer Seite.',
    confirmButton: 'Ja, er findet statt',
    onTitle: 'Danke — er findet statt.',
    onBody: '%m am %d steht innerhalb einer Stunde als „Vom Veranstalter bestätigt“ auf Ihrer Seite.',
    cancelTitle: '%m am %d — abgesagt',
    cancelBody: 'Nur dieser Termin, oder findet der Markt gar nicht mehr statt?',
    cancelDate: 'Nur dieser Termin',
    cancelMarket: 'Der Markt findet nicht mehr statt',
    cancelledTitle: 'Danke — abgesagt.',
    cancelledBody: '%m am %d steht innerhalb einer Stunde als abgesagt auf Ihrer Seite. Wer in der Nähe den Newsletter abonniert hat, erfährt es jetzt.',
    stoppedTitle: 'Danke, wir haben es notiert.',
    stoppedBody: 'Delfim schaut es sich an und meldet sich bei Ihnen. Bis dahin bleibt die Seite, wie sie ist.',
    toPage: 'Zur Marktseite',
    chooseMarket: 'Welcher Markt?',
    eyebrow: 'Die Seite Ihres Marktes',
    hello: 'Danke, dass Sie einen Markt organisieren.',
    whyCount: 'Ich bin Delfim, und das ist die Seite Ihres Marktes auf fynda.market, wo Leute aus der Umgebung nach dem nächsten Flohmarkt suchen. Was sie hier finden — Ihre Termine, Ihre Öffnungszeiten, ob er stattfindet — entscheidet, ob sie kommen. %n von ihnen haben im letzten Monat hier nachgesehen. Steht Ihr Wort hinter einem Termin, verlassen sich die Leute darauf und kommen. Mehr verlangt diese Seite nicht von Ihnen: einen Blick und einen Klick.',
    why: 'Ich bin Delfim, und das ist die Seite Ihres Marktes auf fynda.market, wo Leute aus der Umgebung nach dem nächsten Flohmarkt suchen. Was sie hier finden — Ihre Termine, Ihre Öffnungszeiten, ob er stattfindet — entscheidet, ob sie kommen. Steht Ihr Wort hinter einem Termin, verlassen sich die Leute darauf und kommen. Mehr verlangt diese Seite nicht von Ihnen: einen Blick und einen Klick.',
    nextTitle: 'Ihr nächster Termin. Findet er statt?',
    nextChecked: 'Zuletzt von uns geprüft am %d.',
    nextConfirmed: 'Von Ihnen bestätigt am %d.',
    nextNone: 'Noch kein kommender Termin auf Ihrer Seite. Tragen Sie unten einen ein.',
    waitingOne: 'Eine Person wartet auf Ihren nächsten Termin.',
    waitingMany: '%n Personen warten auf Ihren nächsten Termin.',
    nextYes: 'Ja, er findet statt',
    nextChanged: 'Etwas hat sich geändert',
    nextHint: 'Bestätigen können Sie ganz unten, nach einem Blick auf den Rest.',
    viewPublic: 'Ihre Seite so sehen, wie Besucher sie sehen',
    datesTitle: 'Ihre Termine',
    datesIntro: 'Das ist alles, was wir bisher zu Ihrem Markt haben. Korrigieren Sie, was falsch ist, und ergänzen Sie, was fehlt. Wenn Sie einen Termin absagen, erfahren es alle in der Nähe, die Neuigkeiten abonniert haben, noch am selben Tag.',
    stampConfirmed: 'Bestätigt am %d',
    stampNot: 'Noch nicht bestätigt',
    stampCancelled: 'Abgesagt',
    change: 'Ändern',
    cancel: 'Absagen',
    remove: 'Diesen Termin entfernen',
    fromLabel: 'Von',
    toLabel: 'Bis',
    addDate: 'Termin hinzufügen',
    addAnother: 'Noch einen hinzufügen',
    aboutTitle: 'Über den Markt',
    aboutIntro: 'Ein paar Fragen, die sich Besucher stellen, bevor sie kommen. Füllen Sie aus, was Sie wissen, und lassen Sie den Rest einfach leer.',
    stallsLabel: 'Wie viele Stände ungefähr',
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
    bookingHint: 'Das ist die Frage, die uns am häufigsten gestellt wird. Besser, man fragt direkt Sie.',
    thereLabel: 'Anreise',
    therePlaceholder: 'Haltestelle, Parkplatz — was Sie auch Freunden sagen würden',
    tagsLabel: 'Was man hier findet',
    tags: { antiques: 'Antiquitäten', furniture: 'Möbel', clothes: 'Kleidung', records_books: 'Platten & Bücher', kids: 'Kindersachen', food: 'Essen & Trinken' },
    tagsHint: 'Wählen Sie ein paar aus. So findet Sie jemand, der alte Platten sucht.',
    wordsLabel: 'In Ihren Worten',
    wordsPlaceholder: 'Ein paar Sätze über Ihren Markt, in Ihrer Sprache.',
    wordsHint: 'Wir zeigen sie als Ihre eigenen Worte und ändern nichts daran.',
    photoLabel: 'Ein Foto',
    photoHint: 'Haben Sie eines? Schicken Sie es einfach als Antwort auf unsere E-Mail. Es ist noch in derselben Woche auf der Seite. Ein Handyfoto an einem gut besuchten Morgen ist perfekt.',
    save: 'Bestätigen',
    saveHint: 'Innerhalb einer Stunde auf Ihrer Seite.',
    footLink: 'Dieser Link gehört Ihnen. Wer ihn hat, kann die Seite ändern — geben Sie ihn also nur an jemanden weiter, der das auch soll.',
    footReply: 'Für alles andere — den Namen, die Adresse, den Tag, an dem er stattfindet — antworten Sie einfach auf die E-Mail. Ich lese jede.',
    footOut: 'Sie möchten keine E-Mails mehr von uns? Ganz unten in jeder finden Sie einen Link dafür.',
    footTerms: 'Alles, was Sie uns schicken, bleibt Ihres. Unsere {Nutzungsbedingungen} erklären, wie wir es verwenden.',
    savedTitle: 'Bestätigt.',
    savedBody: 'Danke. Innerhalb einer Stunde steht es auf Ihrer Seite.',
    backToPage: 'Zurück zu Ihrer Seite',
  },
  fr: {
    invalidTitle: "Ce lien n'est plus valable",
    invalidBody: "Un nouveau lien vous a peut-être été envoyé depuis. Répondez à l'un de nos e-mails, et nous vous enverrons le bon.",
    notYoursTitle: "Cette date ne concerne pas votre marché",
    notYoursBody: "Rien n'a été modifié. Si c'est une erreur, répondez à notre e-mail.",
    confirmTitle: "%m le %d — toujours d'actualité ?",
    confirmBody: "Un clic, et votre page l'affiche dans l'heure.",
    confirmButton: "Oui, c'est maintenu",
    onTitle: "Merci — c'est maintenu.",
    onBody: "D'ici une heure, %m le %d portera la mention « Confirmé par l'organisateur » sur votre page.",
    cancelTitle: '%m le %d — annulé',
    cancelBody: "Seulement cette date, ou le marché s'arrête définitivement ?",
    cancelDate: 'Seulement cette date',
    cancelMarket: "Le marché s'arrête",
    cancelledTitle: "Merci — c'est annulé.",
    cancelledBody: "D'ici une heure, %m le %d apparaîtra comme annulé sur votre page. Les abonnés à la newsletter de la région sont prévenus dès maintenant.",
    stoppedTitle: "Merci, c'est noté.",
    stoppedBody: "Delfim va regarder et vous répondra. D'ici là, la page reste telle quelle.",
    toPage: 'Voir la page du marché',
    chooseMarket: 'Quel marché ?',
    eyebrow: 'La page de votre marché',
    hello: "Merci d'organiser un marché.",
    whyCount: "Je suis Delfim. Voici la page de votre marché sur fynda.market, là où les gens des environs cherchent leur prochaine brocante. Ce qu'ils y trouvent — vos dates, vos horaires, s'il a bien lieu — décide s'ils viennent ou non. %n d'entre eux l'ont consultée le mois dernier. Quand c'est vous qui confirmez une date, les gens lui font confiance et se déplacent. C'est tout ce que cette page vous demande : un coup d'œil et un clic.",
    why: "Je suis Delfim. Voici la page de votre marché sur fynda.market, là où les gens des environs cherchent leur prochaine brocante. Ce qu'ils y trouvent — vos dates, vos horaires, s'il a bien lieu — décide s'ils viennent ou non. Quand c'est vous qui confirmez une date, les gens lui font confiance et se déplacent. C'est tout ce que cette page vous demande : un coup d'œil et un clic.",
    nextTitle: 'Votre prochaine date. A-t-elle toujours lieu ?',
    nextChecked: "Nous l'avons vérifiée le %d.",
    nextConfirmed: "Vous l'avez confirmée le %d.",
    nextNone: "Aucune date à venir sur votre page pour l'instant. Ajoutez-en une ci-dessous.",
    waitingOne: 'Une personne attend votre prochaine date.',
    waitingMany: '%n personnes attendent votre prochaine date.',
    nextYes: 'Oui, elle a lieu',
    nextChanged: 'Quelque chose a changé',
    nextHint: "Confirmez tout en bas, après avoir jeté un œil au reste.",
    viewPublic: 'Voir votre page comme les visiteurs la voient',
    datesTitle: 'Vos dates',
    datesIntro: "Voici tout ce que nous savons de votre marché. Corrigez ce qui est faux, ajoutez ce qui manque. Si vous annulez une date, les abonnés des environs en seront informés le jour même.",
    stampConfirmed: 'Confirmé le %d',
    stampNot: 'Pas encore confirmé',
    stampCancelled: 'Annulé',
    change: 'Modifier',
    cancel: 'Annuler',
    remove: 'Retirer cette date',
    fromLabel: 'De',
    toLabel: 'À',
    addDate: 'Ajouter une date',
    addAnother: 'En ajouter une autre',
    aboutTitle: 'À propos du marché',
    aboutIntro: 'Les questions que les visiteurs se posent avant de venir. Répondez à ce que vous savez, laissez le reste vide.',
    stallsLabel: 'Nombre de stands, environ',
    stallsPlaceholder: 'p. ex. 80',
    settingLabel: 'Intérieur ou extérieur',
    settingIndoor: 'Intérieur',
    settingOutdoor: 'Extérieur',
    settingBoth: 'Les deux',
    rainLabel: "S'il pleut",
    rainRuns: 'A lieu quand même',
    rainCancelled: 'Annulé',
    rainDecided: 'On décide le matin même',
    rainHint: "« On décide le matin même » convient très bien. Les gens veulent juste savoir qu'il faut se renseigner avant de partir.",
    feeLabel: 'Entrée pour les visiteurs',
    feeFree: 'Gratuit',
    websiteLabel: 'Votre site',
    bookingLabel: 'Où réserver un stand',
    bookingPlaceholder: 'Un lien, un e-mail, ou « complet pour 2026 »',
    bookingHint: "C'est la question qu'on nous pose le plus souvent. Mieux vaut qu'on vous la pose à vous.",
    thereLabel: 'Comment venir',
    therePlaceholder: "L'arrêt de bus, le parking : ce que vous diriez à des amis",
    tagsLabel: "Ce qu'on trouve ici",
    tags: { antiques: 'Antiquités', furniture: 'Meubles', clothes: 'Vêtements', records_books: 'Disques & livres', kids: 'Pour les enfants', food: 'À boire et à manger' },
    tagsHint: "Choisissez-en quelques-uns. C'est comme ça qu'une personne qui cherche de vieux disques vous trouvera.",
    wordsLabel: 'Avec vos mots',
    wordsPlaceholder: 'Quelques phrases sur votre marché, dans votre langue.',
    wordsHint: "Nous les affichons comme étant les vôtres, sans y changer un mot.",
    photoLabel: 'Une photo',
    photoHint: "Vous en avez une ? Envoyez-la simplement en réponse à notre e-mail. Elle sera en ligne dans la semaine. Une photo prise au téléphone, un matin d'affluence : c'est parfait.",
    save: 'Confirmer',
    saveHint: "Sur votre page dans l'heure.",
    footLink: "Ce lien est personnel. Toute personne qui l'a peut modifier la page : ne le transmettez qu'à quelqu'un qui doit pouvoir le faire.",
    footReply: "Pour tout le reste — le nom, l'adresse, le jour où il a lieu —, répondez simplement à l'e-mail. Je les lis tous.",
    footOut: "Vous ne souhaitez plus recevoir nos e-mails ? Un lien en bas de chacun d'eux le permet.",
    footTerms: 'Tout ce que vous nous envoyez reste à vous. Nos {conditions générales} expliquent comment nous l’utilisons.',
    savedTitle: 'Confirmé.',
    savedBody: "Merci. Ce sera sur votre page dans l'heure.",
    backToPage: 'Retour à votre page',
  },
  it: {
    invalidTitle: 'Questo link non è più valido',
    invalidBody: 'Forse nel frattempo ne è arrivato uno nuovo. Rispondi a una delle nostre e-mail e ti mandiamo quello valido.',
    notYoursTitle: 'Questa data non è di un tuo mercatino',
    notYoursBody: 'Non abbiamo cambiato niente. Se è un errore, rispondi alla nostra e-mail.',
    confirmTitle: '%m il %d — si fa?',
    confirmBody: "Un clic, e la tua pagina lo mostra entro un'ora.",
    confirmButton: 'Sì, si fa',
    onTitle: 'Grazie — si fa.',
    onBody: "%m il %d compare entro un'ora sulla tua pagina come «Confermato dall'organizzatore».",
    cancelTitle: '%m il %d — non si fa',
    cancelBody: 'Solo questa data, o il mercatino non si fa più?',
    cancelDate: 'Solo questa data',
    cancelMarket: 'Il mercatino non si fa più',
    cancelledTitle: 'Grazie — non si fa.',
    cancelledBody: "%m il %d compare entro un'ora sulla tua pagina come «Annullato». Chi riceve la newsletter in zona viene avvisato adesso.",
    stoppedTitle: 'Grazie, ne abbiamo preso nota.',
    stoppedBody: 'Delfim ci dà un\'occhiata e ti scrive. Fino ad allora la pagina resta com\'è.',
    toPage: 'Alla pagina del mercatino',
    chooseMarket: 'Quale mercatino?',
    eyebrow: 'La pagina del tuo mercatino',
    hello: 'Grazie per il mercatino che organizzi.',
    whyCount: "Sono Delfim, e questa è la pagina del tuo mercatino su fynda.market, dove la gente della zona cerca il prossimo mercatino. Quello che trova qui — le tue date, i tuoi orari, se si fa — decide se viene. %n persone l'hanno guardata il mese scorso. Quando una data l'hai confermata tu, la gente ci crede e viene. Questa pagina ti chiede solo questo: un'occhiata e un tocco.",
    why: "Sono Delfim, e questa è la pagina del tuo mercatino su fynda.market, dove la gente della zona cerca il prossimo mercatino. Quello che trova qui — le tue date, i tuoi orari, se si fa — decide se viene. Quando una data l'hai confermata tu, la gente ci crede e viene. Questa pagina ti chiede solo questo: un'occhiata e un tocco.",
    nextTitle: 'La tua prossima data. Si fa ancora?',
    nextChecked: "L'abbiamo controllata il %d.",
    nextConfirmed: "L'hai confermata il %d.",
    nextNone: "Sulla tua pagina non c'è nessuna data in programma. Aggiungine una qui sotto.",
    waitingOne: 'Una persona aspetta la tua prossima data.',
    waitingMany: '%n persone aspettano la tua prossima data.',
    nextYes: 'Sì, si fa',
    nextChanged: 'È cambiato qualcosa',
    nextHint: "Dai un'occhiata al resto, poi conferma in fondo.",
    viewPublic: 'Vedi la tua pagina come la vedono i visitatori',
    datesTitle: 'Le tue date',
    datesIntro: "Ecco tutto quello che abbiamo. Correggi ciò che è sbagliato, aggiungi ciò che manca. Se annulli una data, chi in zona si è iscritto alle novità lo sa il giorno stesso.",
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
    rainCancelled: 'Non si fa',
    rainDecided: 'Decidiamo la mattina stessa',
    rainHint: '«Decidiamo la mattina stessa» va benissimo. La gente vuole solo sapere che deve controllare prima.',
    feeLabel: 'Ingresso per i visitatori',
    feeFree: 'Gratis',
    websiteLabel: 'Il tuo sito',
    bookingLabel: 'Dove si prenota una bancarella',
    bookingPlaceholder: "Un link, un'e-mail, o «tutto esaurito per il 2026»",
    bookingHint: 'La domanda che ci fanno più spesso. Meglio che la facciano a te.',
    thereLabel: 'Come arrivare',
    therePlaceholder: 'La fermata, il parcheggio — quello che diresti ai tuoi amici',
    tagsLabel: 'Cosa si trova qui',
    tags: { antiques: 'Antiquariato', furniture: 'Mobili', clothes: 'Vestiti', records_books: 'Dischi e libri', kids: 'Per bambini', food: 'Da mangiare e da bere' },
    tagsHint: 'Scegline qualcuno. È così che chi cerca vecchi dischi ti trova.',
    wordsLabel: 'Con le tue parole',
    wordsPlaceholder: 'Qualche frase sul tuo mercatino, nella tua lingua.',
    wordsHint: 'Le mostriamo come tue, e non le tocchiamo.',
    photoLabel: 'Una foto',
    photoHint: "Ne hai una? Rispondi alla nostra e-mail allegandola. Sarà online in settimana. Una foto col telefono, in una mattina di gran movimento, è perfetta.",
    save: 'Conferma',
    saveHint: "Sulla tua pagina entro un'ora.",
    footLink: 'Questo link è tuo. Chiunque lo abbia può modificare la pagina — passalo solo a chi deve averlo.',
    footReply: "Per tutto il resto — il nome, l'indirizzo, il giorno in cui si fa — basta rispondere all'e-mail. Le leggo tutte.",
    footOut: "Non vuoi più e-mail da noi? In fondo a ognuna c'è il link per disiscriverti.",
    footTerms: 'Tutto ciò che ci mandi resta tuo. Le nostre {condizioni generali} spiegano come lo usiamo.',
    savedTitle: 'Confermato.',
    savedBody: "Grazie. È sulla tua pagina entro un'ora.",
    backToPage: 'Torna alla tua pagina',
  },
  en: {
    invalidTitle: 'This link is no longer valid',
    invalidBody: 'A new one may have been issued. Reply to any of our e-mails and we will send you the current link.',
    notYoursTitle: 'This date is not one of your markets',
    notYoursBody: 'Nothing was changed. If this is a mistake, reply to our e-mail.',
    confirmTitle: '%m on %d — still on?',
    confirmBody: 'One click, and your page shows it within the hour.',
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
    waitingOne: 'One person is waiting for your next date.',
    waitingMany: '%n people are waiting for your next date.',
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
    footTerms: 'Everything you send us stays yours. Our {terms} explain how we use it.',
    savedTitle: 'Confirmed.',
    savedBody: 'Thank you. It’s on your page within the hour.',
    backToPage: 'Back to your page',
  },
};

export const copyFor = (locale: string | null | undefined): OrganiserCopy =>
  COPY[(locale as Locale) ?? 'en'] ?? COPY.en;
