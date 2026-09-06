/**
 * General site terms — `/en/terms/`, `/de/nutzungsbedingungen/`,
 * `/fr/conditions-generales/`, `/it/condizioni-generali/`.
 *
 * Delfim's text from fleafind.ch, changed only where the facts changed: the
 * name, the domain, and the date it takes effect. Nothing here describes
 * machinery, so nothing here needed rewriting.
 */
import type { Locale } from '../i18n';
import type { LegalDoc } from './doc';

export const TERMS: Record<Locale, LegalDoc> = {
  en: {
    title: 'General Site Terms — Fynda',
    description: 'How Fynda works, and what applies when you use the site or submit something through a form.',
    heading: 'General Site Terms',
    effective: 'Effective from 6 September 2026',
    lede: [
      'These terms explain how Fynda works, and what applies when you use fynda.market or submit something through our forms.',
    ],
    blocks: [
      {
        h: '1. Who this covers',
        p: [
          'Fynda is operated by Delfim Almeida, Zurich, Switzerland. These terms apply to anyone who browses fynda.market or submits a correction, market suggestion, or organiser contact through our forms.',
        ],
      },
      {
        h: '2. What Fynda is',
        p: [
          'Fynda is a directory. We research and publish information about flea markets, brocantes, and secondhand events across Switzerland.',
          "Fynda does not organise any of the listed markets, does not sell tickets or stands, and is not part of any agreement between a visitor and a market organiser. We don't control whether a market actually happens.",
        ],
      },
      {
        h: '3. Market information',
        p: [
          "We research market information and verify it directly with organisers wherever we can. Even so, dates, times, locations, and other details can change at short notice. We can't guarantee every listing is complete or current at every moment — please check with the organiser before travelling if the exact date matters to you.",
        ],
      },
      {
        h: '4. If you submit something to us',
        p: [
          'When you send us a correction, suggest a market, or contact us as an organiser, you confirm that:',
        ],
        ul: [
          "what you're telling us is accurate, to the best of your knowledge;",
          'you have the right to share any text, image, or link you send us;',
          "it doesn't infringe anyone's rights, impersonate anyone, or contain anything unlawful.",
        ],
      },
      {
        p: [
          "You give Fynda permission to verify, edit, translate, publish, or combine what you submit as part of running the directory. It stays yours — we're not taking ownership, just permission to use it for Fynda. Submitting something doesn't guarantee we'll publish it.",
        ],
      },
      {
        h: '5. Using Fynda fairly',
        p: ["Please don't:"],
        ul: [
          'send spam or malicious submissions;',
          "try to access anything you're not meant to;",
          'upload malware or harmful code;',
          'impersonate someone else;',
          'submit information you know is false;',
          'use automated tools to overload the site or bypass its normal controls;',
          "copy Fynda's database or content to build a competing directory.",
        ],
      },
      {
        p: ['Normal search engine crawling and sharing Fynda links is completely fine.'],
      },
      {
        h: '6. Ownership',
        p: [
          "Fynda's own text, design, and database organisation belong to us and shouldn't be reused without permission. Third-party names, logos, photos, and organiser materials belong to their respective owners.",
        ],
      },
      {
        h: "7. What we're responsible for",
        p: [
          "We can't guarantee every listing is complete, current, or error-free, and we're not responsible if an organiser changes or cancels their event. We can't promise the website will always be available without interruption. Websites we link to are outside our control.",
          "Our liability is limited to what's allowed under Swiss law — we can't and don't try to exclude liability for intentional harm or gross negligence.",
        ],
      },
      {
        h: '8. Changes',
        p: [
          "We can update Fynda, correct or remove listings, and update these terms as the site develops. If we make a significant change to these terms, we'll update the effective date above.",
        ],
      },
      {
        h: '9. Governing law',
        p: ['These terms are governed by Swiss law.'],
      },
    ],
  },

  de: {
    title: 'Nutzungsbedingungen — Fynda',
    description: 'Wie Fynda funktioniert und was gilt, wenn Sie die Seite nutzen oder ein Formular abschicken.',
    heading: 'Allgemeine Nutzungsbedingungen',
    effective: 'Gültig ab 6. September 2026',
    lede: [
      'Diese Bedingungen erklären, wie Fynda funktioniert und was gilt, wenn Sie fynda.market nutzen oder uns über eines unserer Formulare etwas schicken.',
    ],
    blocks: [
      {
        h: '1. Für wen das gilt',
        p: [
          'Fynda wird betrieben von Delfim Almeida, Zürich, Schweiz. Diese Bedingungen gelten für alle, die fynda.market besuchen oder uns über unsere Formulare eine Korrektur, einen Marktvorschlag oder eine Veranstalter-Anfrage schicken.',
        ],
      },
      {
        h: '2. Was Fynda ist',
        p: [
          'Fynda ist ein Verzeichnis. Wir recherchieren und veröffentlichen Angaben zu Flohmärkten, Brockenstuben und Secondhand-Anlässen in der ganzen Schweiz.',
          'Fynda organisiert keinen der aufgeführten Märkte, verkauft keine Tickets und keine Standplätze und ist nicht Teil einer Vereinbarung zwischen Besucherinnen und Veranstaltern. Wir haben keinen Einfluss darauf, ob ein Markt tatsächlich stattfindet.',
        ],
      },
      {
        h: '3. Marktangaben',
        p: [
          'Wir recherchieren die Angaben und prüfen sie, wo immer möglich, direkt beim Veranstalter. Trotzdem können sich Termine, Zeiten, Orte und weitere Angaben kurzfristig ändern. Wir können nicht garantieren, dass jeder Eintrag jederzeit vollständig und aktuell ist — fragen Sie vor der Anreise beim Veranstalter nach, wenn es auf den genauen Termin ankommt.',
        ],
      },
      {
        h: '4. Wenn Sie uns etwas schicken',
        p: [
          'Wenn Sie uns eine Korrektur schicken, einen Markt vorschlagen oder uns als Veranstalter kontaktieren, bestätigen Sie:',
        ],
        ul: [
          'dass Ihre Angaben nach bestem Wissen richtig sind;',
          'dass Sie das Recht haben, den Text, das Bild oder den Link zu teilen, den Sie uns schicken;',
          'dass es keine Rechte Dritter verletzt, niemanden vortäuscht und nichts Rechtswidriges enthält.',
        ],
      },
      {
        p: [
          'Sie erlauben Fynda, das Eingereichte im Rahmen des Verzeichnisses zu prüfen, zu bearbeiten, zu übersetzen, zu veröffentlichen oder mit anderen Angaben zusammenzuführen. Es bleibt Ihres — wir übernehmen kein Eigentum, sondern nur die Erlaubnis zur Nutzung für Fynda. Eine Einreichung bedeutet nicht, dass wir sie veröffentlichen.',
        ],
      },
      {
        h: '5. Fairer Umgang mit Fynda',
        p: ['Bitte unterlassen Sie es:'],
        ul: [
          'Spam oder schädliche Einsendungen zu schicken;',
          'auf etwas zuzugreifen, das nicht für Sie bestimmt ist;',
          'Schadsoftware oder schädlichen Code hochzuladen;',
          'sich als jemand anderes auszugeben;',
          'Angaben zu machen, von denen Sie wissen, dass sie falsch sind;',
          'die Seite mit automatisierten Werkzeugen zu überlasten oder ihre üblichen Schutzmechanismen zu umgehen;',
          'die Datenbank oder die Inhalte von Fynda zu kopieren, um ein konkurrierendes Verzeichnis aufzubauen.',
        ],
      },
      {
        p: ['Normales Crawling durch Suchmaschinen und das Teilen von Fynda-Links sind völlig in Ordnung.'],
      },
      {
        h: '6. Eigentum',
        p: [
          'Texte, Gestaltung und Datenbankstruktur von Fynda gehören uns und dürfen nicht ohne Erlaubnis weiterverwendet werden. Namen, Logos, Fotos und Materialien Dritter gehören den jeweiligen Rechteinhabern.',
        ],
      },
      {
        h: '7. Wofür wir haften',
        p: [
          'Wir können nicht garantieren, dass jeder Eintrag vollständig, aktuell und fehlerfrei ist, und wir haften nicht dafür, wenn ein Veranstalter seinen Anlass ändert oder absagt. Wir können nicht zusichern, dass die Website immer ohne Unterbruch erreichbar ist. Verlinkte Websites liegen ausserhalb unseres Einflusses.',
          'Unsere Haftung ist auf das beschränkt, was das Schweizer Recht zulässt — für Vorsatz und grobe Fahrlässigkeit können und wollen wir die Haftung nicht ausschliessen.',
        ],
      },
      {
        h: '8. Änderungen',
        p: [
          'Wir können Fynda weiterentwickeln, Einträge korrigieren oder entfernen und diese Bedingungen anpassen. Bei einer wesentlichen Änderung aktualisieren wir das Datum oben.',
        ],
      },
      {
        h: '9. Anwendbares Recht',
        p: ['Es gilt Schweizer Recht.'],
      },
    ],
  },

  fr: {
    title: "Conditions générales d'utilisation — Fynda",
    description: "Comment Fynda fonctionne, et ce qui s'applique quand vous utilisez le site ou envoyez un formulaire.",
    heading: "Conditions générales d'utilisation",
    effective: 'En vigueur depuis le 6 septembre 2026',
    lede: [
      "Ces conditions expliquent comment Fynda fonctionne, et ce qui s'applique lorsque vous utilisez fynda.market ou nous envoyez quelque chose via l'un de nos formulaires.",
    ],
    blocks: [
      {
        h: '1. Qui est concerné',
        p: [
          "Fynda est exploité par Delfim Almeida, Zurich, Suisse. Ces conditions s'appliquent à toute personne qui consulte fynda.market ou nous envoie une correction, une suggestion de marché ou un message d'organisateur via nos formulaires.",
        ],
      },
      {
        h: '2. Ce qu’est Fynda',
        p: [
          "Fynda est un annuaire. Nous recherchons et publions des informations sur les brocantes, vide-greniers et événements d'occasion en Suisse.",
          "Fynda n'organise aucun des marchés répertoriés, ne vend ni billets ni emplacements, et n'est partie à aucun accord entre un visiteur et un organisateur. Nous ne contrôlons pas si un marché a réellement lieu.",
        ],
      },
      {
        h: '3. Informations sur les marchés',
        p: [
          "Nous recherchons ces informations et les vérifions directement auprès des organisateurs dès que possible. Malgré cela, les dates, horaires, lieux et autres détails peuvent changer à court terme. Nous ne pouvons pas garantir que chaque annonce est complète et à jour à tout instant — vérifiez auprès de l'organisateur avant de vous déplacer si la date exacte compte pour vous.",
        ],
      },
      {
        h: '4. Si vous nous envoyez quelque chose',
        p: [
          "Lorsque vous nous envoyez une correction, suggérez un marché ou nous contactez en tant qu'organisateur, vous confirmez que :",
        ],
        ul: [
          'ce que vous nous dites est exact, à votre connaissance ;',
          'vous avez le droit de partager le texte, l’image ou le lien que vous nous envoyez ;',
          "cela ne porte atteinte aux droits de personne, n'usurpe l'identité de personne et ne contient rien d'illicite.",
        ],
      },
      {
        p: [
          "Vous autorisez Fynda à vérifier, modifier, traduire, publier ou combiner ce que vous envoyez dans le cadre de l'annuaire. Cela reste à vous — nous n'en prenons pas la propriété, seulement l'autorisation de l'utiliser pour Fynda. Un envoi ne garantit pas que nous le publierons.",
        ],
      },
      {
        h: '5. Un usage correct de Fynda',
        p: ['Merci de ne pas :'],
        ul: [
          'envoyer du spam ou des soumissions malveillantes ;',
          "tenter d'accéder à ce qui ne vous est pas destiné ;",
          'téléverser des logiciels malveillants ou du code nuisible ;',
          "usurper l'identité d'autrui ;",
          'transmettre des informations que vous savez fausses ;',
          "utiliser des outils automatisés pour surcharger le site ou contourner ses contrôles habituels ;",
          'copier la base de données ou le contenu de Fynda pour créer un annuaire concurrent.',
        ],
      },
      {
        p: ["L'exploration normale par les moteurs de recherche et le partage de liens Fynda sont tout à fait bienvenus."],
      },
      {
        h: '6. Propriété',
        p: [
          "Les textes, la conception et l'organisation de la base de données de Fynda nous appartiennent et ne doivent pas être réutilisés sans autorisation. Les noms, logos, photos et documents de tiers appartiennent à leurs titulaires respectifs.",
        ],
      },
      {
        h: '7. Notre responsabilité',
        p: [
          "Nous ne pouvons pas garantir que chaque annonce est complète, à jour ou exempte d'erreurs, et nous ne sommes pas responsables si un organisateur modifie ou annule son événement. Nous ne pouvons pas promettre que le site sera toujours disponible sans interruption. Les sites vers lesquels nous renvoyons échappent à notre contrôle.",
          "Notre responsabilité est limitée à ce que permet le droit suisse — nous ne pouvons ni ne cherchons à exclure la responsabilité en cas de faute intentionnelle ou de négligence grave.",
        ],
      },
      {
        h: '8. Modifications',
        p: [
          "Nous pouvons faire évoluer Fynda, corriger ou retirer des annonces et modifier ces conditions. En cas de changement important, nous mettons à jour la date d'entrée en vigueur ci-dessus.",
        ],
      },
      {
        h: '9. Droit applicable',
        p: ['Ces conditions sont régies par le droit suisse.'],
      },
    ],
  },

  it: {
    title: 'Condizioni generali — Fynda',
    description: 'Come funziona Fynda e che cosa vale quando usa il sito o invia un modulo.',
    heading: 'Condizioni generali di utilizzo',
    effective: 'In vigore dal 6 settembre 2026',
    lede: [
      'Queste condizioni spiegano come funziona Fynda e che cosa vale quando usa fynda.market o ci invia qualcosa tramite uno dei nostri moduli.',
    ],
    blocks: [
      {
        h: '1. A chi si applicano',
        p: [
          'Fynda è gestito da Delfim Almeida, Zurigo, Svizzera. Queste condizioni valgono per chiunque consulti fynda.market o ci invii una correzione, la segnalazione di un mercatino o un messaggio come organizzatore tramite i nostri moduli.',
        ],
      },
      {
        h: '2. Che cos’è Fynda',
        p: [
          "Fynda è un elenco. Raccogliamo e pubblichiamo informazioni su mercatini delle pulci, mercatini dell'usato ed eventi di seconda mano in tutta la Svizzera.",
          'Fynda non organizza nessuno dei mercatini elencati, non vende biglietti né banchi e non è parte di alcun accordo tra un visitatore e un organizzatore. Non abbiamo alcun controllo sul fatto che un mercatino si tenga davvero.',
        ],
      },
      {
        h: '3. Informazioni sui mercatini',
        p: [
          "Raccogliamo le informazioni e le verifichiamo direttamente con gli organizzatori ogni volta che possiamo. Ciononostante date, orari, luoghi e altri dettagli possono cambiare con breve preavviso. Non possiamo garantire che ogni scheda sia completa e aggiornata in ogni momento — se la data esatta è importante per Lei, verifichi con l'organizzatore prima di mettersi in viaggio.",
        ],
      },
      {
        h: '4. Se ci invia qualcosa',
        p: [
          'Quando ci invia una correzione, segnala un mercatino o ci contatta come organizzatore, conferma che:',
        ],
        ul: [
          'quanto ci comunica è esatto, per quanto Le risulta;',
          'ha il diritto di condividere il testo, l’immagine o il link che ci invia;',
          'non viola i diritti di nessuno, non finge di essere un altro e non contiene nulla di illecito.',
        ],
      },
      {
        p: [
          "Autorizza Fynda a verificare, modificare, tradurre, pubblicare o combinare quanto invia nell'ambito dell'elenco. Resta Suo — non ne acquisiamo la proprietà, soltanto il permesso di usarlo per Fynda. Un invio non garantisce che lo pubblicheremo.",
        ],
      },
      {
        h: '5. Un uso corretto di Fynda',
        p: ['La preghiamo di non:'],
        ul: [
          'inviare spam o contenuti dannosi;',
          'tentare di accedere a ciò che non Le è destinato;',
          'caricare malware o codice nocivo;',
          'spacciarsi per un’altra persona;',
          'trasmettere informazioni che sa essere false;',
          'usare strumenti automatici per sovraccaricare il sito o aggirarne i normali controlli;',
          'copiare la banca dati o i contenuti di Fynda per costruire un elenco concorrente.',
        ],
      },
      {
        p: ['La normale scansione da parte dei motori di ricerca e la condivisione dei link di Fynda vanno benissimo.'],
      },
      {
        h: '6. Proprietà',
        p: [
          "I testi, la progettazione e l'organizzazione della banca dati di Fynda appartengono a noi e non vanno riutilizzati senza autorizzazione. Nomi, loghi, fotografie e materiali di terzi appartengono ai rispettivi titolari.",
        ],
      },
      {
        h: '7. Di che cosa rispondiamo',
        p: [
          "Non possiamo garantire che ogni scheda sia completa, aggiornata o priva di errori, e non rispondiamo se un organizzatore modifica o annulla il proprio evento. Non possiamo promettere che il sito sia sempre raggiungibile senza interruzioni. I siti a cui rimandiamo sono fuori dal nostro controllo.",
          'La nostra responsabilità è limitata a quanto consentito dal diritto svizzero — non possiamo e non intendiamo escludere la responsabilità per dolo o colpa grave.',
        ],
      },
      {
        h: '8. Modifiche',
        p: [
          "Possiamo sviluppare Fynda, correggere o rimuovere schede e aggiornare queste condizioni. In caso di modifica sostanziale aggiorniamo la data d'entrata in vigore qui sopra.",
        ],
      },
      {
        h: '9. Diritto applicabile',
        p: ['Queste condizioni sono rette dal diritto svizzero.'],
      },
    ],
  },
};
