/**
 * About — `/en/about/`, `/de/ueber-uns/`, `/fr/a-propos/`, `/it/chi-siamo/`.
 *
 * Delfim's own page, first person (rewritten 2026-09-19). It is the only page
 * on the site that says who is behind it, which is the thing a directory has
 * to answer before anyone believes its dates — so nothing here may claim more
 * than the market pages show.
 */
import type { Locale } from '../i18n';
import type { LegalDoc } from './doc';

export const ABOUT: Record<Locale, LegalDoc> = {
  en: {
    title: 'About fynda.market',
    description: 'Who is behind fynda.market, and how the dates stay right.',
    heading: 'About fynda.market',
    blocks: [
      {
        h: 'The story',
        p: [
          "I'm Delfim. I built fynda.market because I kept finding out about flea markets after they'd happened — a friend would mention one, or photos would turn up online, always a day late. There are hundreds of these markets in every country, and nobody keeps track of them properly: dates move, markets get cancelled, and most lists are out of date the moment you read them.",
          'So I started keeping track. fynda.market began in Switzerland, in four languages. Germany is next, and the rest of Europe after that.',
        ],
      },
      {
        h: 'How the dates stay right',
        p: [
          "Every date comes from the organiser's own website or calendar, and every date says when it was last checked. Organisers can go one better: one tap from their e-mail and the date says “confirmed by the organiser”. A cancelled date stays on the page, marked as cancelled, instead of quietly disappearing. And when something's wrong, you can tell us in one click — a person reads it and fixes it.",
        ],
      },
      {
        h: 'Free, no ads',
        p: ["fynda.market costs nothing and shows no ads. That won't change."],
      },
      {
        h: 'Help make it better',
        p: [
          "It's just me, doing this market by market. If you spot something wrong, say so — it's the fastest way to make it better for the next person. contact@fynda.market.",
        ],
      },
    ],
  },

  de: {
    title: 'Über fynda.market',
    description: 'Wer hinter fynda.market steht und wie die Termine stimmen.',
    heading: 'Über fynda.market',
    blocks: [
      {
        h: 'Die Geschichte',
        p: [
          'Ich bin Delfim. Ich habe fynda.market gebaut, weil ich von Flohmärkten immer erst erfahren habe, wenn sie schon vorbei waren — jemand erwähnte einen, oder es tauchten Fotos auf, immer einen Tag zu spät. In jedem Land gibt es Hunderte solcher Märkte, und niemand führt sie sauber nach: Termine verschieben sich, Märkte fallen aus, und die meisten Listen sind schon veraltet, wenn man sie liest.',
          'Also habe ich angefangen, sie nachzuführen. fynda.market hat in der Schweiz begonnen, in vier Sprachen. Deutschland kommt als Nächstes, danach der Rest von Europa.',
        ],
      },
      {
        h: 'Wie die Termine stimmen',
        p: [
          'Jeder Termin stammt von der Website oder dem Kalender des Veranstalters, und bei jedem Termin steht, wann er zuletzt geprüft wurde. Veranstalter können noch einen Schritt weitergehen: ein Tipp in ihrer E-Mail, und beim Termin steht „Vom Veranstalter bestätigt“. Ein abgesagter Termin bleibt auf der Seite, als abgesagt markiert, statt still zu verschwinden. Und wenn etwas nicht stimmt, sagst du es uns mit einem Klick — ein Mensch liest es und korrigiert es.',
        ],
      },
      {
        h: 'Kostenlos, ohne Werbung',
        p: ['fynda.market kostet nichts und zeigt keine Werbung. Das bleibt so.'],
      },
      {
        h: 'Hilf mit',
        p: [
          'Das bin nur ich, Markt für Markt. Wenn dir etwas Falsches auffällt, sag es — es ist der schnellste Weg, fynda.market für die nächste Person besser zu machen. contact@fynda.market.',
        ],
      },
    ],
  },

  fr: {
    title: 'À propos de fynda.market',
    description: 'Qui est derrière fynda.market, et comment les dates restent justes.',
    heading: 'À propos de fynda.market',
    blocks: [
      {
        h: "L'histoire",
        p: [
          "Je m'appelle Delfim. J'ai construit fynda.market parce que j'apprenais toujours l'existence des brocantes une fois qu'elles étaient passées — un ami en parlait, ou des photos apparaissaient en ligne, toujours un jour trop tard. Il y a des centaines de brocantes dans chaque pays, et personne ne les suit correctement : les dates bougent, des marchés sont annulés, et la plupart des listes sont périmées au moment où on les lit.",
          "Alors j'ai commencé à les suivre. fynda.market a démarré en Suisse, en quatre langues. L'Allemagne vient ensuite, puis le reste de l'Europe.",
        ],
      },
      {
        h: 'Comment les dates restent justes',
        p: [
          "Chaque date vient du site ou du calendrier de l'organisateur, et chaque date indique quand elle a été vérifiée pour la dernière fois. Les organisateurs peuvent faire mieux encore : un clic depuis leur e-mail, et la date affiche « confirmé par l'organisateur ». Une date annulée reste sur la page, marquée comme annulée, au lieu de disparaître en silence. Et quand quelque chose ne va pas, vous nous le dites en un clic — une personne le lit et le corrige.",
        ],
      },
      {
        h: 'Gratuit, sans publicité',
        p: ['fynda.market ne coûte rien et ne montre aucune publicité. Cela ne changera pas.'],
      },
      {
        h: 'Aidez à faire mieux',
        p: [
          "Il n'y a que moi, marché après marché. Si vous voyez une erreur, dites-le — c'est le moyen le plus rapide de rendre fynda.market meilleur pour la personne suivante. contact@fynda.market.",
        ],
      },
    ],
  },

  it: {
    title: 'Chi c’è dietro fynda.market',
    description: 'Chi c’è dietro fynda.market e come le date restano giuste.',
    heading: 'Chi c’è dietro fynda.market',
    blocks: [
      {
        h: 'La storia',
        p: [
          'Sono Delfim. Ho costruito fynda.market perché dei mercatini venivo sempre a sapere quando erano già passati — un amico ne parlava, o spuntavano foto online, sempre un giorno troppo tardi. In ogni paese ci sono centinaia di mercatini, e nessuno li tiene d’occhio come si deve: le date si spostano, i mercatini vengono annullati, e la maggior parte degli elenchi è già vecchia nel momento in cui la leggi.',
          'Così ho iniziato a tenerli d’occhio io. fynda.market è partito in Svizzera, in quattro lingue. Poi viene la Germania, e dopo il resto d’Europa.',
        ],
      },
      {
        h: 'Come le date restano giuste',
        p: [
          'Ogni data viene dal sito o dal calendario dell’organizzatore, e ogni data dice quando è stata verificata l’ultima volta. Gli organizzatori possono fare di più: un tocco dalla loro e-mail, e la data mostra «confermato dall’organizzatore». Una data annullata resta sulla pagina, segnata come annullata, invece di sparire in silenzio. E quando qualcosa non torna, ce lo dici con un clic — una persona lo legge e lo corregge.',
        ],
      },
      {
        h: 'Gratis, senza pubblicità',
        p: ['fynda.market non costa nulla e non mostra pubblicità. E resterà così.'],
      },
      {
        h: 'Aiuta a migliorarlo',
        p: [
          'Ci sono solo io, un mercatino alla volta. Se noti un errore, dillo — è il modo più veloce per rendere fynda.market migliore per la prossima persona. contact@fynda.market.',
        ],
      },
    ],
  },
};
