/**
 * Legal notice — `/en/imprint/`, `/de/impressum/`, `/fr/mentions-legales/`,
 * `/it/note-legali/`.
 *
 * Replaces the placeholder-carrying German-only page. The operator details are
 * the ones Delfim published on fleafind.ch: a name, a city and an address to
 * write to. Swiss law asks for a way to reach the operator, not for a street
 * number, so this is complete rather than abbreviated.
 */
import type { Locale } from '../i18n';
import type { LegalDoc } from './doc';

export const IMPRINT: Record<Locale, LegalDoc> = {
  en: {
    title: 'Legal Notice — Fynda',
    description: 'Who operates Fynda, and the limits of the market information published here.',
    heading: 'Legal Notice',
    blocks: [
      {
        h: 'Website operator',
        p: [
          'Fynda is operated by:',
          'Delfim Almeida\nZurich, Switzerland\nEmail: contact@fynda.market',
          'Fynda is a digital directory for flea markets, brocantes and secondhand markets across Switzerland.',
        ],
      },
      {
        h: 'Accuracy of market information',
        p: [
          'Fynda researches market information from organisers and other public sources and, where possible, verifies it directly with organisers.',
          'Market dates, opening times, locations and other details can still change at short notice. Fynda cannot guarantee that every listing is complete or current at all times.',
          "Please check the organiser's website or contact the organiser directly before travelling, especially for markets affected by weather, public holidays or last-minute changes.",
        ],
      },
      {
        h: 'External links',
        p: [
          'Fynda links to organiser websites, maps and other external services.',
          'The operators of those websites are responsible for their own content. Fynda has no control over changes made to external websites after a link has been added.',
        ],
      },
      {
        h: 'Copyright',
        p: [
          '© Fynda.',
          "Fynda's original text, design and graphics may not be reused without permission. Third-party content is identified where used and remains subject to the rights of its respective owner.",
        ],
      },
    ],
  },

  de: {
    title: 'Impressum — Fynda',
    description: 'Wer Fynda betreibt und wie verbindlich die hier veröffentlichten Marktangaben sind.',
    heading: 'Impressum',
    blocks: [
      {
        h: 'Betreiber der Website',
        p: [
          'Fynda wird betrieben von:',
          'Delfim Almeida\nZürich, Schweiz\nE-Mail: contact@fynda.market',
          'Fynda ist ein digitales Verzeichnis für Flohmärkte, Brockenstuben und Secondhand-Märkte in der ganzen Schweiz.',
        ],
      },
      {
        h: 'Richtigkeit der Marktangaben',
        p: [
          'Fynda recherchiert Marktangaben bei Veranstaltern und aus anderen öffentlichen Quellen und prüft sie, wo möglich, direkt beim Veranstalter.',
          'Termine, Öffnungszeiten, Orte und weitere Angaben können sich trotzdem kurzfristig ändern. Fynda kann nicht garantieren, dass jeder Eintrag jederzeit vollständig und aktuell ist.',
          'Bitte prüfen Sie vor der Anreise die Website des Veranstalters oder fragen Sie direkt nach — besonders bei Märkten, die von Wetter, Feiertagen oder kurzfristigen Änderungen betroffen sind.',
        ],
      },
      {
        h: 'Externe Links',
        p: [
          'Fynda verlinkt auf Veranstalter-Websites, Karten und andere externe Dienste.',
          'Für deren Inhalte sind die jeweiligen Betreiber verantwortlich. Fynda hat keinen Einfluss darauf, was sich auf einer externen Website ändert, nachdem der Link gesetzt wurde.',
        ],
      },
      {
        h: 'Urheberrecht',
        p: [
          '© Fynda.',
          'Texte, Gestaltung und Grafiken von Fynda dürfen nicht ohne Erlaubnis weiterverwendet werden. Inhalte Dritter sind als solche gekennzeichnet und bleiben Eigentum der jeweiligen Rechteinhaber.',
        ],
      },
    ],
  },

  fr: {
    title: 'Mentions légales — Fynda',
    description: 'Qui exploite Fynda, et la portée des informations publiées ici.',
    heading: 'Mentions légales',
    blocks: [
      {
        h: 'Exploitant du site',
        p: [
          'Fynda est exploité par :',
          'Delfim Almeida\nZurich, Suisse\nCourriel : contact@fynda.market',
          "Fynda est un annuaire numérique des brocantes, vide-greniers et marchés d'occasion en Suisse.",
        ],
      },
      {
        h: 'Exactitude des informations',
        p: [
          "Fynda recherche les informations auprès des organisateurs et d'autres sources publiques et les vérifie, dans la mesure du possible, directement auprès des organisateurs.",
          'Les dates, horaires, lieux et autres détails peuvent malgré tout changer à court terme. Fynda ne peut garantir que chaque annonce est complète et à jour à tout moment.',
          "Avant de vous déplacer, consultez le site de l'organisateur ou contactez-le directement, en particulier pour les marchés soumis à la météo, aux jours fériés ou à des changements de dernière minute.",
        ],
      },
      {
        h: 'Liens externes',
        p: [
          "Fynda renvoie vers des sites d'organisateurs, des cartes et d'autres services externes.",
          "Les exploitants de ces sites sont responsables de leur propre contenu. Fynda n'a aucun contrôle sur les modifications apportées à un site externe après l'ajout d'un lien.",
        ],
      },
      {
        h: "Droits d'auteur",
        p: [
          '© Fynda.',
          "Les textes, la conception et les graphismes propres à Fynda ne peuvent être réutilisés sans autorisation. Les contenus de tiers sont signalés comme tels et restent soumis aux droits de leurs titulaires respectifs.",
        ],
      },
    ],
  },

  it: {
    title: 'Note legali — Fynda',
    description: 'Chi gestisce Fynda e quanto sono vincolanti le informazioni pubblicate qui.',
    heading: 'Note legali',
    blocks: [
      {
        h: 'Gestore del sito',
        p: [
          'Fynda è gestito da:',
          'Delfim Almeida\nZurigo, Svizzera\nE-mail: contact@fynda.market',
          "Fynda è un elenco digitale di mercatini delle pulci, mercatini dell'usato e mercati di seconda mano in tutta la Svizzera.",
        ],
      },
      {
        h: 'Esattezza delle informazioni',
        p: [
          'Fynda raccoglie le informazioni presso gli organizzatori e da altre fonti pubbliche e, dove possibile, le verifica direttamente con gli organizzatori.',
          'Date, orari, luoghi e altri dettagli possono comunque cambiare con breve preavviso. Fynda non può garantire che ogni scheda sia completa e aggiornata in ogni momento.',
          "Prima di mettersi in viaggio consulti il sito dell'organizzatore o lo contatti direttamente, soprattutto per i mercatini soggetti al meteo, ai giorni festivi o a cambiamenti dell'ultimo minuto.",
        ],
      },
      {
        h: 'Link esterni',
        p: [
          'Fynda rimanda a siti di organizzatori, mappe e altri servizi esterni.',
          'I gestori di quei siti sono responsabili dei propri contenuti. Fynda non ha alcun controllo sulle modifiche apportate a un sito esterno dopo che il link è stato inserito.',
        ],
      },
      {
        h: "Diritto d'autore",
        p: [
          '© Fynda.',
          'Testi, grafica e progettazione originali di Fynda non possono essere riutilizzati senza autorizzazione. I contenuti di terzi sono indicati come tali e restano soggetti ai diritti dei rispettivi titolari.',
        ],
      },
    ],
  },
};
