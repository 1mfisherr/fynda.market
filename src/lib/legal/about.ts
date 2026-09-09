/**
 * About — `/en/about/`, `/de/ueber-uns/`, `/fr/a-propos/`, `/it/chi-siamo/`.
 *
 * Delfim's own text, carried over from fleafind.ch. It is the only page on the
 * site that says who is behind it, which is the thing a directory has to answer
 * before anyone believes its dates.
 */
import type { Locale } from '../i18n';
import type { LegalDoc } from './doc';

export const ABOUT: Record<Locale, LegalDoc> = {
  en: {
    title: 'About Fynda',
    description: 'Who is behind Fynda, and how the market information stays accurate.',
    heading: 'About Fynda',
    blocks: [
      {
        h: 'The story',
        p: [
          "I'm Delfim, and I built Fynda because I kept finding out about flea markets after they'd already happened. A friend would mention one, or I'd see photos online — always a day too late. Switzerland has hundreds of these markets, but no single place actually tracks them properly: dates change, markets get cancelled, and most listings you find are months out of date the moment you see them.",
          'So I started checking. Every market on Fynda is verified against its actual organiser — not scraped from somewhere and left to rot.',
        ],
      },
      {
        h: 'How we stay accurate',
        p: [
          "Every listing shows who checked it — the organiser directly, our team, or the community. If a market's cancelled, it stays visible and marked as cancelled, not silently deleted. If something's wrong, you can report it in one click, and it gets fixed by a person, not an algorithm.",
        ],
      },
      {
        h: "It's free",
        p: ['Fynda is free to use and always will be.'],
      },
      {
        h: 'Help make it better',
        p: [
          "Right now it's just me, building this properly, market by market. If you spot something wrong, reach out — it's the fastest way to make Fynda better for the next person. You can also reach me directly at contact@fynda.market.",
        ],
      },
    ],
  },

  de: {
    title: 'Über Fynda',
    description: 'Wer hinter Fynda steht und wie die Marktangaben aktuell bleiben.',
    heading: 'Über Fynda',
    blocks: [
      {
        h: 'Die Geschichte',
        p: [
          'Ich bin Delfim, und ich habe Fynda gebaut, weil ich von Flohmärkten immer erst erfahren habe, wenn sie schon vorbei waren. Jemand erwähnte einen, oder ich sah Fotos im Netz — immer einen Tag zu spät. In der Schweiz gibt es Hunderte solcher Märkte, aber keinen einzigen Ort, der sie sauber nachführt: Termine ändern sich, Märkte fallen aus, und die meisten Einträge, die man findet, sind schon veraltet, wenn man sie sieht.',
          'Also habe ich angefangen nachzufragen. Jeder Markt auf Fynda ist beim Veranstalter selbst geprüft — nicht irgendwo abgeschöpft und dann liegen gelassen.',
        ],
      },
      {
        h: 'Wie wir aktuell bleiben',
        p: [
          'Jeder Eintrag zeigt, wer ihn geprüft hat — der Veranstalter direkt, wir, oder die Community. Fällt ein Markt aus, bleibt er sichtbar und wird als abgesagt gekennzeichnet, statt stillschweigend gelöscht zu werden. Stimmt etwas nicht, können Sie es mit einem Klick melden, und es wird von einem Menschen korrigiert, nicht von einem Algorithmus.',
        ],
      },
      {
        h: 'Es ist kostenlos',
        p: ['Fynda ist kostenlos und bleibt es.'],
      },
      {
        h: 'Helfen Sie mit',
        p: [
          'Im Moment bin das nur ich, Markt für Markt. Wenn Ihnen etwas Falsches auffällt, schreiben Sie mir — das ist der schnellste Weg, Fynda für die nächste Person besser zu machen. Sie erreichen mich direkt unter contact@fynda.market.',
        ],
      },
    ],
  },

  fr: {
    title: 'À propos de Fynda',
    description: 'Qui est derrière Fynda, et comment les informations restent exactes.',
    heading: 'À propos de Fynda',
    blocks: [
      {
        h: "L'histoire",
        p: [
          "Je m'appelle Delfim, et j'ai créé Fynda parce que j'apprenais toujours l'existence des brocantes une fois qu'elles étaient passées. Quelqu'un en mentionnait une, ou je voyais des photos en ligne — toujours un jour trop tard. La Suisse compte des centaines de ces marchés, mais aucun endroit ne les suit vraiment : les dates changent, des marchés sont annulés, et la plupart des annonces que l'on trouve sont périmées au moment même où on les lit.",
          "Alors j'ai commencé à vérifier. Chaque marché sur Fynda est vérifié auprès de son organisateur — pas aspiré quelque part puis laissé à l'abandon.",
        ],
      },
      {
        h: 'Comment nous restons exacts',
        p: [
          "Chaque annonce indique qui l'a vérifiée — l'organisateur directement, nous, ou la communauté. Si un marché est annulé, il reste visible et signalé comme annulé, il n'est pas supprimé en silence. Si quelque chose est faux, vous pouvez le signaler en un clic, et c'est une personne qui le corrige, pas un algorithme.",
        ],
      },
      {
        h: "C'est gratuit",
        p: ['Fynda est gratuit et le restera.'],
      },
      {
        h: 'Aidez-nous à faire mieux',
        p: [
          "Pour l'instant, il n'y a que moi, marché après marché. Si vous repérez une erreur, écrivez-moi — c'est le moyen le plus rapide d'améliorer Fynda pour la personne suivante. Vous pouvez me joindre directement à contact@fynda.market.",
        ],
      },
    ],
  },

  it: {
    title: 'Chi siamo',
    description: 'Chi c’è dietro Fynda e come le informazioni restano esatte.',
    heading: 'Chi siamo',
    blocks: [
      {
        h: 'La storia',
        p: [
          'Sono Delfim e ho creato Fynda perché dei mercatini delle pulci venivo a sapere sempre a cose fatte. Qualcuno ne nominava uno, o vedevo delle foto online — sempre con un giorno di ritardo. In Svizzera ci sono centinaia di questi mercatini, ma nessun posto li segue davvero: le date cambiano, i mercatini vengono annullati e la maggior parte degli annunci che si trovano è già vecchia nel momento in cui la si legge.',
          'Così ho cominciato a verificare. Ogni mercatino su Fynda è verificato presso il suo organizzatore — non raccolto da qualche parte e poi lasciato lì.',
        ],
      },
      {
        h: 'Come restiamo esatti',
        p: [
          'Ogni scheda indica chi l’ha verificata — l’organizzatore stesso, noi, o la comunità. Se un mercatino viene annullato resta visibile e segnalato come annullato, non sparisce in silenzio. Se qualcosa non torna, può segnalarlo con un clic, e a correggerlo è una persona, non un algoritmo.',
        ],
      },
      {
        h: 'È gratuito',
        p: ['Fynda è gratuito e lo resterà.'],
      },
      {
        h: 'Ci aiuti a migliorarlo',
        p: [
          'Per ora ci sono soltanto io, un mercatino alla volta. Se nota qualcosa di sbagliato, mi scriva — è il modo più veloce per rendere Fynda migliore per la persona successiva. Mi può raggiungere direttamente a contact@fynda.market.',
        ],
      },
    ],
  },
};
