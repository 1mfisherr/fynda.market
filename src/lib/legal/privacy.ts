/**
 * Privacy policy — `/en/privacy/`, `/de/datenschutz/`, `/fr/confidentialite/`,
 * `/it/privacy/`.
 *
 * Rewritten 2026-09-16, Delfim's call: reassurance first, mechanics later,
 * and nothing that stops being true the day an analytics tool is added. It
 * says what is done — anonymous usage data, a cookie that recognises a
 * returning browser once accepted, our own database, providers named — in
 * calm words, and it does not promise more privacy than the site needs to.
 * "No account" is never claimed; "no account needed" is.
 *
 * The facts have to match the code. Sections 3, 4, 7 and 10 describe what
 * the analytics, the cookie, the newsletter and the providers actually do.
 * Change the mechanism, change them in the same commit.
 */
import type { Locale } from '../i18n';
import type { LegalDoc } from './doc';

export const PRIVACY: Record<Locale, LegalDoc> = {
  en: {
    title: 'Privacy — fynda.market',
    description: 'Your visit is anonymous and your data stays that way. What fynda.market collects, what it is for, and who helps us run the site.',
    heading: 'Privacy',
    effective: 'Effective from 17 September 2026',
    lede: [
      'Your visit is anonymous. Your data stays that way.',
      'fynda.market never asks who you are — you need no account to use it. We do keep track of how the site is used, so we can make it better: which markets get looked at, which pages help, where people give up. None of it is linked to you as a person, and none of it is ever sold.',
      'This page says what we collect, what it is for, and who helps us run the site.',
    ],
    blocks: [
      {
        h: '1. Who is responsible',
        p: ['fynda.market is run by:', 'Delfim Almeida\nZurich, Switzerland\ncontact@fynda.market'],
      },
      {
        h: '2. When this applies',
        p: ['This policy applies when you browse fynda.market, subscribe to the newsletter, write to us, report a correction, or deal with us as a market organiser.'],
      },
      {
        h: '3. What we collect when you visit',
        p: [
          'To understand how fynda.market is used, we record what happens on it: the pages you open, which markets and dates you look at, the filters you set, the links you follow, how you arrived, and whether something went wrong. Alongside it, the basics every website receives: your IP address, your browser and device type, your approximate country.',
          'If you accept cookies, a small identifier is stored in your browser so that we recognise it on a return visit — that is how we can tell a new visitor from someone coming back. Without it, each day\'s visit is counted on its own and not connected to the next.',
          'None of this carries your name or e-mail address. We do not know who you are, and we never combine what you do on fynda.market with your identity.',
        ],
      },
      {
        h: '4. Cookies',
        p: [
          'fynda.market uses cookies. On your first visit you choose whether to allow the ones that help us understand how the site is used; the site works the same either way. You can change your choice at any time through the link in the footer.',
          'A few cookies and browser settings are needed for the site itself — your cookie choice, the markets you save, the town you pick. Those never leave your browser.',
        ],
      },
      {
        h: '5. What we use it for',
        p: ['We use this information to:'],
        ul: [
          'make fynda.market better — see which pages help people and which do not;',
          'understand which markets, towns and dates people are interested in;',
          'keep the site fast, secure and free of abuse;',
          'decide where to grow next.',
        ],
      },
      {
        p: [
          'From it we also draw broader patterns — interest by town or region, the popularity of markets and seasons, gaps in coverage. These patterns describe crowds, not people; we may publish them, share them with organisers, or use them commercially. They cannot be traced back to any visitor.',
        ],
      },
      {
        h: '6. Saved markets and your town',
        p: [
          'The markets you save and the town you pick on the home page stay in your own browser. They are not sent to us. They disappear if you clear your browser data or use another device.',
        ],
      },
      {
        h: '7. The newsletter',
        p: [
          'When you sign up we keep your e-mail address, the town or canton you chose and the language of the page, and we use them to send you the newsletter you asked for. The subscription starts at once — there is no confirmation mail to click. We also note when and where you signed up and the wording you agreed to, so that your consent can be shown rather than asserted.',
          'Our mails are delivered by Resend (Resend Inc., USA), which receives your address and the content of each mail for delivery only. Resend tells us whether a mail arrived, bounced, was opened or which link was clicked, and we use that to keep the list healthy: an address that bounces for good or reports us as spam comes off the list at once, and an address that has opened nothing for a long time may be removed so we stop writing to nobody.',
          'Your e-mail address is used for the newsletter and for replying to you — it is not connected to what you do on the site.',
          'You can unsubscribe with the link in any mail or by writing to contact@fynda.market. Afterwards we keep only your address and the dates you joined and left, so that we never contact you again by mistake.',
        ],
      },
      {
        h: '8. Writing to us, and organisers',
        p: [
          'When you report a correction, suggest a market or contact us as an organiser, we keep what you send — typically your name, e-mail address, the market and your message — together with the language and the page the form was sent from. We use it to reply, to check the report and to keep the market information right. If you give an e-mail address you get a short acknowledgement; for a report it is optional.',
          'Organisers who take over their market\'s page get a personal link by e-mail and, before each date, a short mail asking whether it is still on. Their answers are shown on the market page as "confirmed by the organiser" with the date. Reports and organiser correspondence are the record of when a detail was last checked, so they are kept; you can ask for deletion at any time.',
        ],
      },
      {
        h: '9. Public market information',
        p: [
          'fynda.market researches and publishes information about flea markets and secondhand events, from organisers, official market websites, municipalities, associations, public event calendars and other public sources. We use it to create, check and update listings.',
        ],
      },
      {
        h: '10. Who helps us run fynda.market',
        p: [
          'A small number of providers work for us under our instructions:',
        ],
        ul: [
          'Cloudflare (USA) hosts and delivers the site and protects it against abuse; it sees IP addresses, requested pages and technical details, from servers around the world.',
          'Supabase (EU region) holds our database: market information, usage data, newsletter subscriptions, messages and organiser records.',
          'Resend (USA) delivers our e-mails — see section 7.',
          'Google Search Console shows us which searches bring people to fynda.market; it reads Google\'s own index and places nothing on this site.',
        ],
      },
      {
        p: [
          'To understand how the site is used we may also work with analytics tools such as Google Analytics or Microsoft Clarity. Any such tool is covered by your cookie choice, receives no name or e-mail address, and is listed here when we add it.',
          'We may disclose personal data where the law requires it, to protect fynda.market or another person, or to establish or defend a legal claim.',
        ],
      },
      {
        h: '11. Outside Switzerland',
        p: [
          'Some providers are based in, or use servers in, the United States and other countries. Where that applies, the transfer rests on recognised safeguards: the Swiss-U.S. and EU-U.S. Data Privacy Frameworks and Standard Contractual Clauses with their Swiss additions. Our database stays in an EU region.',
        ],
      },
      {
        h: '12. How long we keep it',
        ul: [
          'newsletter data: while you are subscribed, then only the suppression record described above;',
          'messages, reports and organiser correspondence: while they remain relevant, as part of the record of when a listing was last checked;',
          'usage data: kept, so trends can be followed over years — it carries no name, no e-mail address and no readable IP address;',
          'short-lived security records: deleted when no longer needed.',
        ],
      },
      {
        h: '13. How we protect it',
        p: [
          'The published site is a set of static pages with no access to our database. Database access is restricted with permissions and row-level security. Every connection uses HTTPS. IP addresses used for counting and abuse prevention are stored hashed, not in readable form. Access to personal data is limited to the tools needed to run the site.',
        ],
      },
      {
        h: '14. Your rights',
        p: ['You can ask us at any time to tell you what personal data we hold about you, to correct or delete it, to give you a copy, to withdraw a consent, or to stop a particular use. Write to contact@fynda.market; we may ask you to confirm your identity first. You can also complain to the Swiss Federal Data Protection and Information Commissioner.'],
      },
      {
        h: '15. Law, changes, contact',
        p: [
          'For visitors in Switzerland the Swiss Federal Act on Data Protection applies; where fynda.market is active in the European Union, the GDPR applies in addition.',
          'When our practices change, this page changes with them, and the date at the top shows when the latest version began to apply.',
          'For any privacy question: contact@fynda.market.',
        ],
      },
    ],
  },

  de: {
    title: 'Datenschutz — fynda.market',
    description: 'Ihr Besuch ist anonym, und Ihre Daten bleiben es. Was fynda.market erhebt, wofür, und wer uns beim Betrieb hilft.',
    heading: 'Datenschutz',
    effective: 'Gültig ab 17. September 2026',
    lede: [
      'Ihr Besuch ist anonym. Ihre Daten bleiben es.',
      'fynda.market fragt nie, wer Sie sind — Sie brauchen kein Konto. Wir halten aber fest, wie die Seite genutzt wird, damit wir sie besser machen können: welche Märkte angeschaut werden, welche Seiten helfen, wo Leute aufgeben. Nichts davon ist mit Ihnen als Person verknüpft, und nichts davon wird je verkauft.',
      'Diese Seite sagt, was wir erheben, wofür, und wer uns beim Betrieb hilft.',
    ],
    blocks: [
      { h: '1. Wer verantwortlich ist', p: ['fynda.market wird betrieben von:', 'Delfim Almeida\nZürich, Schweiz\ncontact@fynda.market'] },
      { h: '2. Wann das gilt', p: ['Diese Erklärung gilt, wenn Sie fynda.market besuchen, den Newsletter abonnieren, uns schreiben, eine Korrektur melden oder als Veranstalter mit uns zu tun haben.'] },
      {
        h: '3. Was wir bei einem Besuch erheben',
        p: [
          'Um zu verstehen, wie fynda.market genutzt wird, zeichnen wir auf, was auf der Seite passiert: welche Seiten Sie öffnen, welche Märkte und Termine Sie anschauen, welche Filter Sie setzen, welchen Links Sie folgen, woher Sie gekommen sind und ob etwas schiefging. Dazu das, was jede Website erhält: Ihre IP-Adresse, Browser- und Gerätetyp, Ihr ungefähres Land.',
          'Wenn Sie Cookies akzeptieren, wird eine kleine Kennung in Ihrem Browser gespeichert, damit wir ihn beim nächsten Besuch wiedererkennen — so unterscheiden wir neue Besucher von wiederkehrenden. Ohne sie wird jeder Tag für sich gezählt und nicht mit dem nächsten verbunden.',
          'Nichts davon enthält Ihren Namen oder Ihre E-Mail-Adresse. Wir wissen nicht, wer Sie sind, und wir verbinden das, was Sie auf fynda.market tun, nie mit Ihrer Identität.',
        ],
      },
      {
        h: '4. Cookies',
        p: [
          'fynda.market verwendet Cookies. Beim ersten Besuch entscheiden Sie, ob Sie diejenigen zulassen, die uns zeigen, wie die Seite genutzt wird; die Seite funktioniert so oder so gleich. Ihre Wahl können Sie jederzeit über den Link in der Fusszeile ändern.',
          'Einige Cookies und Browser-Einstellungen braucht die Seite selbst — Ihre Cookie-Wahl, die gemerkten Märkte, den gewählten Ort. Die verlassen Ihren Browser nie.',
        ],
      },
      {
        h: '5. Wofür wir es verwenden',
        p: ['Wir verwenden diese Angaben, um:'],
        ul: [
          'fynda.market besser zu machen — zu sehen, welche Seiten helfen und welche nicht;',
          'zu verstehen, welche Märkte, Orte und Termine die Leute interessieren;',
          'die Seite schnell, sicher und frei von Missbrauch zu halten;',
          'zu entscheiden, wo wir als Nächstes wachsen.',
        ],
      },
      {
        p: ['Daraus leiten wir auch grössere Muster ab — Interesse nach Ort oder Region, die Beliebtheit von Märkten und Saisons, Lücken in der Abdeckung. Diese Muster beschreiben Mengen, keine Personen; wir dürfen sie veröffentlichen, mit Veranstaltern teilen oder kommerziell nutzen. Auf einzelne Besucher lassen sie sich nicht zurückführen.'],
      },
      {
        h: '6. Gemerkte Märkte und Ihr Ort',
        p: ['Die Märkte, die Sie sich merken, und der Ort, den Sie auf der Startseite wählen, bleiben in Ihrem eigenen Browser. Sie werden nicht an uns gesendet. Sie verschwinden, wenn Sie Ihre Browserdaten löschen oder ein anderes Gerät benutzen.'],
      },
      {
        h: '7. Der Newsletter',
        p: [
          'Bei der Anmeldung behalten wir Ihre E-Mail-Adresse, den gewählten Ort oder Kanton und die Sprache der Seite, und wir verwenden sie, um Ihnen den bestellten Newsletter zu schicken. Das Abo beginnt sofort — es gibt keine Bestätigungsmail. Wir halten auch fest, wann und wo Sie sich angemeldet haben und welchem Text Sie zugestimmt haben, damit Ihre Einwilligung belegt und nicht nur behauptet werden kann.',
          'Unsere Mails werden von Resend (Resend Inc., USA) zugestellt; Resend erhält Ihre Adresse und den Inhalt jeder Mail ausschliesslich zur Zustellung. Resend sagt uns, ob eine Mail angekommen ist, unzustellbar war, geöffnet wurde oder welcher Link angeklickt wurde, und wir nutzen das, um die Liste gesund zu halten: Eine Adresse, die dauerhaft unzustellbar ist oder uns als Spam meldet, kommt sofort von der Liste, und eine Adresse, die lange nichts öffnet, kann entfernt werden, damit wir nicht ins Leere schreiben.',
          'Ihre E-Mail-Adresse dient dem Newsletter und unseren Antworten — sie wird nicht mit dem verbunden, was Sie auf der Seite tun.',
          'Abmelden können Sie sich über den Link in jeder Mail oder per Mail an contact@fynda.market. Danach behalten wir nur Ihre Adresse und die Daten von An- und Abmeldung, damit wir Sie nie versehentlich wieder anschreiben.',
        ],
      },
      {
        h: '8. Wenn Sie uns schreiben, und Veranstalter',
        p: [
          'Wenn Sie eine Korrektur melden, einen Markt vorschlagen oder uns als Veranstalter kontaktieren, behalten wir, was Sie senden — in der Regel Name, E-Mail-Adresse, Markt und Nachricht — zusammen mit der Sprache und der Seite, von der das Formular kam. Wir verwenden es, um zu antworten, die Meldung zu prüfen und die Marktangaben richtig zu halten. Wer eine E-Mail-Adresse angibt, erhält eine kurze Bestätigung; bei einer Meldung ist sie freiwillig.',
          'Veranstalter, die ihre Marktseite übernehmen, erhalten per Mail einen persönlichen Link und vor jedem Termin eine kurze Mail mit der Frage, ob er stattfindet. Ihre Antworten erscheinen auf der Marktseite als „vom Veranstalter bestätigt“ mit Datum. Meldungen und Veranstalter-Korrespondenz sind der Nachweis, wann eine Angabe zuletzt geprüft wurde, und werden deshalb aufbewahrt; eine Löschung können Sie jederzeit verlangen.',
        ],
      },
      {
        h: '9. Öffentliche Marktangaben',
        p: ['fynda.market recherchiert und veröffentlicht Angaben zu Flohmärkten und Secondhand-Anlässen — von Veranstaltern, offiziellen Marktwebsites, Gemeinden, Vereinen, öffentlichen Veranstaltungskalendern und anderen öffentlichen Quellen. Wir nutzen sie, um Einträge zu erstellen, zu prüfen und zu aktualisieren.'],
      },
      {
        h: '10. Wer uns beim Betrieb hilft',
        p: ['Eine kleine Zahl von Dienstleistern arbeitet nach unseren Anweisungen für uns:'],
        ul: [
          'Cloudflare (USA) hostet und liefert die Seite aus und schützt sie vor Missbrauch; Cloudflare sieht IP-Adressen, aufgerufene Seiten und technische Details, von Servern weltweit.',
          'Supabase (EU-Region) hält unsere Datenbank: Marktangaben, Nutzungsdaten, Newsletter-Abos, Nachrichten und Veranstalterdaten.',
          'Resend (USA) stellt unsere E-Mails zu — siehe Abschnitt 7.',
          'Google Search Console zeigt uns, welche Suchanfragen Leute zu fynda.market führen; sie liest Googles eigenen Index und bindet nichts in diese Seite ein.',
        ],
      },
      {
        p: [
          'Um zu verstehen, wie die Seite genutzt wird, arbeiten wir unter Umständen auch mit Analysewerkzeugen wie Google Analytics oder Microsoft Clarity. Ein solches Werkzeug fällt unter Ihre Cookie-Wahl, erhält weder Namen noch E-Mail-Adresse und wird hier aufgeführt, sobald wir es einsetzen.',
          'Wir dürfen Personendaten offenlegen, wo das Gesetz es verlangt, um fynda.market oder eine andere Person zu schützen, oder um einen Rechtsanspruch geltend zu machen oder abzuwehren.',
        ],
      },
      {
        h: '11. Ausserhalb der Schweiz',
        p: ['Einige Dienstleister sitzen in den USA oder anderen Ländern oder nutzen dortige Server. Wo das zutrifft, stützt sich die Übermittlung auf anerkannte Garantien: das Swiss-U.S. und das EU-U.S. Data Privacy Framework sowie Standardvertragsklauseln mit den Schweizer Ergänzungen. Unsere Datenbank bleibt in einer EU-Region.'],
      },
      {
        h: '12. Wie lange wir es aufbewahren',
        ul: [
          'Newsletter-Daten: solange Sie abonniert sind, danach nur den oben beschriebenen Sperrvermerk;',
          'Nachrichten, Meldungen und Veranstalter-Korrespondenz: solange sie relevant sind, als Nachweis, wann ein Eintrag zuletzt geprüft wurde;',
          'Nutzungsdaten: werden behalten, damit sich Trends über Jahre verfolgen lassen — sie enthalten weder Namen noch E-Mail-Adresse noch eine lesbare IP-Adresse;',
          'kurzlebige Sicherheitsdaten: werden gelöscht, sobald sie nicht mehr gebraucht werden.',
        ],
      },
      {
        h: '13. Wie wir es schützen',
        p: ['Die veröffentlichte Seite besteht aus statischen Seiten ohne Zugriff auf unsere Datenbank. Der Datenbankzugriff ist über Berechtigungen und Row-Level-Security beschränkt. Jede Verbindung läuft über HTTPS. IP-Adressen, die zum Zählen und zur Missbrauchsabwehr dienen, werden gehasht gespeichert, nicht lesbar. Der Zugriff auf Personendaten ist auf die Werkzeuge beschränkt, die für den Betrieb nötig sind.'],
      },
      {
        h: '14. Ihre Rechte',
        p: ['Sie können jederzeit von uns verlangen, dass wir Ihnen sagen, welche Personendaten wir über Sie haben, sie berichtigen oder löschen, Ihnen eine Kopie geben, eine Einwilligung zurücknehmen oder eine bestimmte Verwendung beenden. Schreiben Sie an contact@fynda.market; wir bitten Sie unter Umständen zuerst, Ihre Identität zu bestätigen. Sie können sich auch beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten beschweren.'],
      },
      {
        h: '15. Recht, Änderungen, Kontakt',
        p: [
          'Für Besucher in der Schweiz gilt das Schweizer Datenschutzgesetz; wo fynda.market in der Europäischen Union aktiv ist, gilt zusätzlich die DSGVO.',
          'Ändern sich unsere Praktiken, ändert sich diese Seite mit, und das Datum oben zeigt, seit wann die aktuelle Fassung gilt.',
          'Für jede Frage zum Datenschutz: contact@fynda.market.',
        ],
      },
    ],
  },

  fr: {
    title: 'Confidentialité — fynda.market',
    description: "Votre visite est anonyme et vos données le restent. Ce que fynda.market collecte, pourquoi, et qui nous aide à faire tourner le site.",
    heading: 'Confidentialité',
    effective: 'En vigueur dès le 17 septembre 2026',
    lede: [
      'Votre visite est anonyme. Vos données le restent.',
      "fynda.market ne demande jamais qui vous êtes — aucun compte n'est nécessaire. Nous suivons en revanche la façon dont le site est utilisé, pour l'améliorer : quels marchés sont consultés, quelles pages aident, où les gens abandonnent. Rien de tout cela n'est lié à vous en tant que personne, et rien n'est jamais vendu.",
      "Cette page dit ce que nous collectons, à quoi cela sert, et qui nous aide à faire tourner le site.",
    ],
    blocks: [
      { h: '1. Qui est responsable', p: ['fynda.market est exploité par :', 'Delfim Almeida\nZurich, Suisse\ncontact@fynda.market'] },
      { h: "2. Quand cela s'applique", p: ["Cette politique s'applique lorsque vous consultez fynda.market, vous abonnez à la newsletter, nous écrivez, signalez une correction ou traitez avec nous en tant qu'organisateur."] },
      {
        h: '3. Ce que nous collectons lors d\'une visite',
        p: [
          "Pour comprendre comment fynda.market est utilisé, nous enregistrons ce qui s'y passe : les pages que vous ouvrez, les marchés et dates que vous regardez, les filtres que vous choisissez, les liens que vous suivez, d'où vous venez, et si quelque chose n'a pas fonctionné. S'y ajoute ce que tout site web reçoit : votre adresse IP, votre navigateur et type d'appareil, votre pays approximatif.",
          "Si vous acceptez les cookies, un petit identifiant est stocké dans votre navigateur pour que nous le reconnaissions lors d'une prochaine visite — c'est ainsi que nous distinguons un nouveau visiteur de quelqu'un qui revient. Sans lui, chaque journée est comptée séparément, sans lien avec la suivante.",
          "Rien de tout cela ne contient votre nom ni votre adresse e-mail. Nous ne savons pas qui vous êtes, et nous ne relions jamais ce que vous faites sur fynda.market à votre identité.",
        ],
      },
      {
        h: '4. Cookies',
        p: [
          "fynda.market utilise des cookies. Lors de votre première visite, vous choisissez d'autoriser ou non ceux qui nous aident à comprendre l'usage du site ; le site fonctionne de la même façon dans les deux cas. Vous pouvez changer d'avis à tout moment via le lien en bas de page.",
          "Quelques cookies et réglages du navigateur sont nécessaires au site lui-même — votre choix concernant les cookies, les marchés enregistrés, la commune choisie. Ils ne quittent jamais votre navigateur.",
        ],
      },
      {
        h: '5. À quoi cela sert',
        p: ['Nous utilisons ces informations pour :'],
        ul: [
          'améliorer fynda.market — voir quelles pages aident et lesquelles non ;',
          'comprendre quels marchés, communes et dates intéressent les gens ;',
          "garder le site rapide, sûr et à l'abri des abus ;",
          'décider où nous développer ensuite.',
        ],
      },
      {
        p: ["Nous en tirons aussi des tendances plus larges — l'intérêt par commune ou région, la popularité des marchés et des saisons, les zones mal couvertes. Ces tendances décrivent des foules, pas des personnes ; nous pouvons les publier, les partager avec des organisateurs ou les exploiter commercialement. Elles ne permettent de remonter à aucun visiteur."],
      },
      {
        h: '6. Marchés enregistrés et votre commune',
        p: ["Les marchés que vous enregistrez et la commune que vous choisissez sur la page d'accueil restent dans votre propre navigateur. Ils ne nous sont pas envoyés. Ils disparaissent si vous effacez les données de votre navigateur ou changez d'appareil."],
      },
      {
        h: '7. La newsletter',
        p: [
          "À l'inscription, nous conservons votre adresse e-mail, la commune ou le canton choisi et la langue de la page, et nous les utilisons pour vous envoyer la newsletter demandée. L'abonnement démarre immédiatement — il n'y a pas d'e-mail de confirmation. Nous notons aussi quand et d'où vous vous êtes inscrit et le texte que vous avez accepté, afin que votre consentement puisse être démontré plutôt qu'affirmé.",
          "Nos e-mails sont distribués par Resend (Resend Inc., USA), qui reçoit votre adresse et le contenu de chaque message uniquement pour la distribution. Resend nous dit si un e-mail est arrivé, a été rejeté, ouvert, ou quel lien a été cliqué, et nous nous en servons pour garder la liste saine : une adresse définitivement injoignable ou qui nous signale comme spam est retirée aussitôt, et une adresse qui n'ouvre rien depuis longtemps peut être retirée pour que nous n'écrivions pas dans le vide.",
          "Votre adresse e-mail sert à la newsletter et à vous répondre — elle n'est pas reliée à ce que vous faites sur le site.",
          "Vous pouvez vous désabonner via le lien de chaque e-mail ou en écrivant à contact@fynda.market. Nous ne gardons ensuite que votre adresse et les dates d'inscription et de désinscription, pour ne jamais vous recontacter par erreur.",
        ],
      },
      {
        h: '8. Quand vous nous écrivez, et les organisateurs',
        p: [
          "Quand vous signalez une correction, proposez un marché ou nous contactez en tant qu'organisateur, nous conservons ce que vous envoyez — en général nom, adresse e-mail, marché et message — avec la langue et la page d'où venait le formulaire. Nous nous en servons pour répondre, vérifier le signalement et garder les informations exactes. Si vous indiquez une adresse e-mail, vous recevez un bref accusé de réception ; pour un signalement, elle est facultative.",
          "Les organisateurs qui prennent en main la page de leur marché reçoivent un lien personnel par e-mail et, avant chaque date, un court message demandant si elle a bien lieu. Leurs réponses apparaissent sur la page du marché comme « confirmé par l'organisateur » avec la date. Les signalements et la correspondance avec les organisateurs constituent la trace de la dernière vérification d'une information ; ils sont donc conservés, et vous pouvez en demander la suppression à tout moment.",
        ],
      },
      {
        h: '9. Informations publiques sur les marchés',
        p: ["fynda.market recherche et publie des informations sur les brocantes, vide-greniers et événements de seconde main — auprès des organisateurs, des sites officiels, des communes, des associations, des agendas publics et d'autres sources publiques. Nous les utilisons pour créer, vérifier et mettre à jour les fiches."],
      },
      {
        h: '10. Qui nous aide à faire tourner fynda.market',
        p: ['Un petit nombre de prestataires travaillent pour nous, selon nos instructions :'],
        ul: [
          "Cloudflare (USA) héberge et diffuse le site et le protège contre les abus ; il voit les adresses IP, les pages demandées et des détails techniques, depuis des serveurs dans le monde entier.",
          'Supabase (région UE) héberge notre base de données : informations sur les marchés, données d\'usage, abonnements, messages et données des organisateurs.',
          'Resend (USA) distribue nos e-mails — voir la section 7.',
          "Google Search Console nous montre quelles recherches amènent les gens sur fynda.market ; elle lit l'index de Google et ne place rien sur ce site.",
        ],
      },
      {
        p: [
          "Pour comprendre l'usage du site, nous pouvons aussi recourir à des outils d'analyse tels que Google Analytics ou Microsoft Clarity. Un tel outil relève de votre choix concernant les cookies, ne reçoit ni nom ni adresse e-mail, et est mentionné ici dès que nous l'utilisons.",
          "Nous pouvons divulguer des données personnelles lorsque la loi l'exige, pour protéger fynda.market ou une autre personne, ou pour faire valoir ou défendre un droit.",
        ],
      },
      {
        h: '11. Hors de Suisse',
        p: ["Certains prestataires sont établis aux États-Unis ou dans d'autres pays, ou y utilisent des serveurs. Le cas échéant, le transfert repose sur des garanties reconnues : les Data Privacy Frameworks Suisse-USA et UE-USA et les clauses contractuelles types avec leurs compléments suisses. Notre base de données reste dans une région de l'UE."],
      },
      {
        h: '12. Combien de temps nous conservons',
        ul: [
          "données de newsletter : tant que vous êtes abonné, puis seulement la trace de désinscription décrite ci-dessus ;",
          "messages, signalements et correspondance avec les organisateurs : tant qu'ils restent pertinents, comme trace de la dernière vérification d'une fiche ;",
          "données d'usage : conservées, pour suivre les tendances sur plusieurs années — elles ne contiennent ni nom, ni adresse e-mail, ni adresse IP lisible ;",
          "données de sécurité de courte durée : supprimées dès qu'elles ne sont plus nécessaires.",
        ],
      },
      {
        h: '13. Comment nous les protégeons',
        p: ["Le site publié est un ensemble de pages statiques sans accès à notre base de données. L'accès à la base est restreint par des permissions et une sécurité au niveau des lignes. Chaque connexion utilise HTTPS. Les adresses IP servant au comptage et à la prévention des abus sont stockées hachées, non lisibles. L'accès aux données personnelles est limité aux outils nécessaires au fonctionnement du site."],
      },
      {
        h: '14. Vos droits',
        p: ["Vous pouvez à tout moment nous demander quelles données personnelles nous détenons sur vous, les corriger ou les supprimer, en obtenir une copie, retirer un consentement ou faire cesser un usage particulier. Écrivez à contact@fynda.market ; nous pourrons d'abord vous demander de confirmer votre identité. Vous pouvez aussi vous adresser au Préposé fédéral à la protection des données et à la transparence."],
      },
      {
        h: '15. Droit applicable, modifications, contact',
        p: [
          "Pour les visiteurs en Suisse, la loi fédérale suisse sur la protection des données s'applique ; là où fynda.market est actif dans l'Union européenne, le RGPD s'applique en plus.",
          "Quand nos pratiques changent, cette page change avec elles, et la date en haut indique depuis quand la version actuelle s'applique.",
          'Pour toute question de confidentialité : contact@fynda.market.',
        ],
      },
    ],
  },

  it: {
    title: 'Privacy — fynda.market',
    description: 'La tua visita è anonima e i tuoi dati restano tali. Cosa raccoglie fynda.market, a che scopo, e chi ci aiuta a far funzionare il sito.',
    heading: 'Privacy',
    effective: 'In vigore dal 17 settembre 2026',
    lede: [
      'La tua visita è anonima. I tuoi dati restano tali.',
      "fynda.market non chiede mai chi sei — non serve alcun account. Teniamo però traccia di come viene usato il sito, per migliorarlo: quali mercatini vengono guardati, quali pagine aiutano, dove le persone rinunciano. Niente di tutto questo è collegato a te come persona, e niente viene mai venduto.",
      'Questa pagina dice cosa raccogliamo, a che scopo, e chi ci aiuta a far funzionare il sito.',
    ],
    blocks: [
      { h: '1. Chi è responsabile', p: ['fynda.market è gestito da:', 'Delfim Almeida\nZurigo, Svizzera\ncontact@fynda.market'] },
      { h: '2. Quando si applica', p: ["Questa informativa si applica quando visiti fynda.market, ti iscrivi alla newsletter, ci scrivi, segnali una correzione o hai a che fare con noi come organizzatore."] },
      {
        h: '3. Cosa raccogliamo durante una visita',
        p: [
          "Per capire come viene usato fynda.market, registriamo cosa succede sul sito: le pagine che apri, i mercatini e le date che guardi, i filtri che imposti, i link che segui, da dove arrivi e se qualcosa è andato storto. Insieme, ciò che ogni sito web riceve: il tuo indirizzo IP, il tipo di browser e dispositivo, il tuo paese approssimativo.",
          "Se accetti i cookie, un piccolo identificativo viene salvato nel tuo browser perché lo riconosciamo alla visita successiva — è così che distinguiamo un nuovo visitatore da chi torna. Senza di esso, ogni giorno viene contato a sé e non collegato al successivo.",
          "Niente di tutto questo contiene il tuo nome o il tuo indirizzo e-mail. Non sappiamo chi sei, e non colleghiamo mai ciò che fai su fynda.market alla tua identità.",
        ],
      },
      {
        h: '4. Cookie',
        p: [
          "fynda.market usa i cookie. Alla prima visita scegli se consentire quelli che ci aiutano a capire come viene usato il sito; il sito funziona allo stesso modo in entrambi i casi. Puoi cambiare la tua scelta in qualsiasi momento dal link a piè di pagina.",
          "Alcuni cookie e impostazioni del browser servono al sito stesso — la tua scelta sui cookie, i mercatini salvati, la località scelta. Non lasciano mai il tuo browser.",
        ],
      },
      {
        h: '5. A cosa serve',
        p: ['Usiamo queste informazioni per:'],
        ul: [
          'migliorare fynda.market — vedere quali pagine aiutano e quali no;',
          'capire quali mercatini, località e date interessano alle persone;',
          'mantenere il sito veloce, sicuro e libero da abusi;',
          'decidere dove crescere in seguito.',
        ],
      },
      {
        p: ["Ne ricaviamo anche tendenze più ampie — l'interesse per località o regione, la popolarità di mercatini e stagioni, le zone poco coperte. Queste tendenze descrivono folle, non persone; possiamo pubblicarle, condividerle con gli organizzatori o usarle commercialmente. Non permettono di risalire a nessun visitatore."],
      },
      {
        h: '6. Mercatini salvati e la tua località',
        p: ["I mercatini che salvi e la località che scegli nella pagina iniziale restano nel tuo browser. Non ci vengono inviati. Scompaiono se cancelli i dati del browser o usi un altro dispositivo."],
      },
      {
        h: '7. La newsletter',
        p: [
          "All'iscrizione conserviamo il tuo indirizzo e-mail, la località o il cantone scelto e la lingua della pagina, e li usiamo per inviarti la newsletter richiesta. L'iscrizione parte subito — non c'è nessuna e-mail di conferma. Annotiamo anche quando e da dove ti sei iscritto e il testo che hai accettato, così che il tuo consenso possa essere dimostrato e non solo affermato.",
          "Le nostre e-mail sono recapitate da Resend (Resend Inc., USA), che riceve il tuo indirizzo e il contenuto di ogni messaggio solo per la consegna. Resend ci dice se un'e-mail è arrivata, è stata respinta, aperta, o quale link è stato cliccato, e lo usiamo per tenere sana la lista: un indirizzo definitivamente irraggiungibile o che ci segnala come spam viene tolto subito, e un indirizzo che non apre nulla da molto tempo può essere rimosso perché non scriviamo nel vuoto.",
          "Il tuo indirizzo e-mail serve per la newsletter e per risponderti — non viene collegato a ciò che fai sul sito.",
          "Puoi disiscriverti dal link in ogni e-mail o scrivendo a contact@fynda.market. Dopo conserviamo solo il tuo indirizzo e le date di iscrizione e disiscrizione, per non ricontattarti mai per errore.",
        ],
      },
      {
        h: '8. Quando ci scrivi, e gli organizzatori',
        p: [
          "Quando segnali una correzione, proponi un mercatino o ci contatti come organizzatore, conserviamo ciò che invii — di solito nome, indirizzo e-mail, mercatino e messaggio — insieme alla lingua e alla pagina da cui è partito il modulo. Lo usiamo per rispondere, verificare la segnalazione e tenere corrette le informazioni. Se indichi un indirizzo e-mail ricevi una breve conferma; per una segnalazione è facoltativo.",
          "Gli organizzatori che prendono in mano la pagina del loro mercatino ricevono un link personale via e-mail e, prima di ogni data, un breve messaggio che chiede se si fa. Le loro risposte compaiono sulla pagina come «confermato dall'organizzatore» con la data. Segnalazioni e corrispondenza con gli organizzatori sono la traccia dell'ultima verifica di un'informazione, quindi vengono conservate; puoi chiederne la cancellazione in qualsiasi momento.",
        ],
      },
      {
        h: '9. Informazioni pubbliche sui mercatini',
        p: ["fynda.market ricerca e pubblica informazioni su mercatini delle pulci ed eventi dell'usato — da organizzatori, siti ufficiali, comuni, associazioni, calendari pubblici e altre fonti pubbliche. Le usiamo per creare, verificare e aggiornare le schede."],
      },
      {
        h: '10. Chi ci aiuta a far funzionare fynda.market',
        p: ['Un piccolo numero di fornitori lavora per noi secondo le nostre istruzioni:'],
        ul: [
          "Cloudflare (USA) ospita e distribuisce il sito e lo protegge dagli abusi; vede indirizzi IP, pagine richieste e dettagli tecnici, da server in tutto il mondo.",
          "Supabase (regione UE) ospita il nostro database: informazioni sui mercatini, dati d'uso, iscrizioni alla newsletter, messaggi e dati degli organizzatori.",
          'Resend (USA) recapita le nostre e-mail — vedi la sezione 7.',
          "Google Search Console ci mostra quali ricerche portano le persone su fynda.market; legge l'indice di Google e non inserisce nulla in questo sito.",
        ],
      },
      {
        p: [
          "Per capire come viene usato il sito possiamo anche ricorrere a strumenti di analisi come Google Analytics o Microsoft Clarity. Uno strumento del genere rientra nella tua scelta sui cookie, non riceve né nome né indirizzo e-mail, ed è indicato qui non appena lo usiamo.",
          "Possiamo comunicare dati personali dove la legge lo richiede, per proteggere fynda.market o un'altra persona, o per far valere o difendere un diritto.",
        ],
      },
      {
        h: '11. Fuori dalla Svizzera',
        p: ["Alcuni fornitori hanno sede negli Stati Uniti o in altri paesi, o vi usano server. Dove ciò avviene, il trasferimento si basa su garanzie riconosciute: i Data Privacy Framework Svizzera-USA e UE-USA e le clausole contrattuali standard con le integrazioni svizzere. Il nostro database resta in una regione UE."],
      },
      {
        h: '12. Per quanto tempo li conserviamo',
        ul: [
          'dati della newsletter: finché sei iscritto, poi solo la traccia di disiscrizione descritta sopra;',
          "messaggi, segnalazioni e corrispondenza con gli organizzatori: finché restano rilevanti, come traccia dell'ultima verifica di una scheda;",
          "dati d'uso: conservati, per seguire le tendenze negli anni — non contengono né nome, né indirizzo e-mail, né indirizzo IP leggibile;",
          'dati di sicurezza di breve durata: cancellati appena non servono più.',
        ],
      },
      {
        h: '13. Come li proteggiamo',
        p: ["Il sito pubblicato è un insieme di pagine statiche senza accesso al nostro database. L'accesso al database è limitato da permessi e sicurezza a livello di riga. Ogni connessione usa HTTPS. Gli indirizzi IP usati per il conteggio e la prevenzione degli abusi sono conservati in forma hash, non leggibile. L'accesso ai dati personali è limitato agli strumenti necessari a far funzionare il sito."],
      },
      {
        h: '14. I tuoi diritti',
        p: ["Puoi chiederci in qualsiasi momento quali dati personali abbiamo su di te, di correggerli o cancellarli, di dartene una copia, di ritirare un consenso o di interrompere un uso specifico. Scrivi a contact@fynda.market; potremmo prima chiederti di confermare la tua identità. Puoi anche rivolgerti all'Incaricato federale della protezione dei dati e della trasparenza."],
      },
      {
        h: '15. Legge, modifiche, contatto',
        p: [
          "Per i visitatori in Svizzera si applica la legge federale svizzera sulla protezione dei dati; dove fynda.market è attivo nell'Unione europea, si applica in aggiunta il GDPR.",
          'Quando le nostre pratiche cambiano, questa pagina cambia con loro, e la data in alto indica da quando si applica la versione attuale.',
          'Per qualsiasi domanda sulla privacy: contact@fynda.market.',
        ],
      },
    ],
  },
};
