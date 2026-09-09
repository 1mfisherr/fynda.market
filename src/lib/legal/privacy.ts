/**
 * Privacy policy — `/en/privacy/`, `/de/datenschutz/`, `/fr/confidentialite/`,
 * `/it/privacy/`.
 *
 * Delfim's structure and voice from fleafind.ch. The facts are Fynda's, and
 * they are different in ways that matter: fleafind ran on Vercel with Google
 * Analytics 4, Microsoft Clarity, Resend and a cookie-consent dialog. Fynda has
 * none of those. It is hosted on Cloudflare Pages, its analytics are self-hosted
 * on our own Postgres and read with our own Metabase, it sets no cookies at all,
 * and every form on the site is still a `mailto:` (docs/PLAN.md, "Make the forms
 * real"). This page describes that, not a template.
 *
 * When the forms stop being mailto: and the newsletter runs on its own system,
 * sections 5 and 6 change here in the same commit.
 */
import type { Locale } from '../i18n';
import type { LegalDoc } from './doc';

export const PRIVACY: Record<Locale, LegalDoc> = {
  en: {
    title: 'Privacy Policy — Fynda',
    description: 'What Fynda collects, what it does not, and where the data lives.',
    heading: 'Privacy Policy',
    effective: 'Effective from 6 September 2026',
    lede: [
      'Fynda helps people discover flea markets, brocantes and secondhand events across Switzerland.',
      'We believe secondhand culture matters. It keeps good things in circulation, reduces waste and brings people together around real places and communities. Fynda exists to make that world easier to find.',
      'Your trust matters just as much as the information we publish.',
      'We do not sell personal data.',
    ],
    blocks: [
      {
        h: '1. Who is responsible for your data?',
        p: [
          'Fynda is operated by:',
          'Delfim Almeida\nZurich, Switzerland\ncontact@fynda.market',
        ],
      },
      {
        h: '2. When this policy applies',
        p: ['This policy applies when you:'],
        ul: [
          'browse fynda.market;',
          'subscribe to a Fynda newsletter;',
          'contact us;',
          'report a correction;',
          'suggest a market;',
          'communicate with us as a market organiser.',
        ],
      },
      {
        h: '3. Visiting Fynda',
        p: [
          'You can browse Fynda without creating an account or telling us who you are. There is no login on Fynda, and no accounts at all.',
          'When you visit, our hosting and analytics receive information such as:',
        ],
        ul: [
          'the pages you view;',
          'how you reached Fynda;',
          'the links and features you use;',
          'which markets you open and which filters you set;',
          'your browser and device type;',
          'your approximate country;',
          'your IP address;',
          'technical errors and performance information.',
        ],
      },
      {
        h: 'Our own analytics, on our own database',
        p: [
          'Fynda does not use Google Analytics, Microsoft Clarity, or any other third-party analytics or advertising product. Our analytics are self-hosted: events are written to our own Postgres database and read with our own copy of Metabase. The data never leaves our infrastructure, and it is never sold.',
          'Fynda sets no cookies, and there is no cookie banner, because there is nothing to consent to.',
          'In place of a cookie, each visit is counted using a value calculated from the IP address and browser identification and then hashed. The secret used for that hash changes every day, so the same visit produces a different value tomorrow — the identifier cannot be traced back to you and cannot be followed across days. We never store the IP address in readable form.',
        ],
      },
      {
        h: 'Google Search Console',
        p: [
          "We read which search queries bring people to Fynda from Google. This reads data out of Google's own search index and puts no tracking script on this website.",
        ],
      },
      {
        h: '4. Saved markets and your chosen town',
        p: [
          "The markets you save, and the town you pick on the home page, are stored only in your own browser's local storage. They are never sent to us and we cannot see them. They disappear if you clear your browser data, or if you use a different browser or device.",
        ],
      },
      {
        h: '5. Joining the newsletter',
        p: [
          'When you sign up, we save your email address, the town you chose and the language of the page in our own database, and we use them to send the newsletter you asked for. The subscription is active immediately — there is no confirmation email to click.',
          'Alongside it we record when you signed up, which page you signed up from, the consent wording you were shown, and a one-way hashed version of your IP address, so that the consent can be shown rather than asserted. The IP address itself is never stored.',
          'The legal basis for this processing is your consent. You can withdraw it at any time by writing to contact@fynda.market, or through the unsubscribe link in any newsletter.',
          'When you unsubscribe, we delete the information that could identify you from the active newsletter list and keep only a minimal suppression record — your email address and the dates you signed up and unsubscribed — so that we do not accidentally contact you again and can show a reliable record of your consent and its withdrawal.',
          'We do not use an external marketing platform. If we later add an email delivery service to send the newsletter, this page will name it before it is used.',
        ],
      },
      {
        h: '6. Contacting Fynda',
        p: [
          'When you send us a message, report incorrect information, suggest a market or contact us as an organiser, we use the information you provide. This may include your:',
        ],
        ul: [
          'name;',
          'email address;',
          'organisation or market name;',
          'message;',
          'links and supporting information.',
        ],
      },
      {
        p: [
          'These forms also open your own mail program today, so your message arrives in our mailbox and nowhere else. We use it to respond, investigate the request, correct listings and keep Fynda’s market information accurate.',
        ],
      },
      {
        h: '7. Public market information',
        p: [
          'Fynda researches and publishes information about flea markets and secondhand events. This information may come from:',
        ],
        ul: [
          'organisers;',
          'official market websites;',
          'municipalities and venues;',
          'associations;',
          'public event calendars;',
          'publicly available social media pages;',
          'other public sources.',
        ],
      },
      {
        p: ['We use this information to create, verify and update listings.'],
      },
      {
        h: '8. We do not sell personal data',
        p: [
          'We do not sell personal data.',
          'We do not provide organisers, advertisers or commercial partners with identifiable lists of Fynda visitors.',
          'We do not sell email addresses, browsing histories, cookie identifiers or personal profiles.',
          'Fynda may use fully aggregated and anonymised information to understand broader patterns, such as:',
        ],
        ul: [
          'search interest by city or region;',
          'the popularity of markets and dates;',
          'seasonal demand;',
          'traffic and referral patterns;',
          'gaps in local flea-market coverage;',
          'trends across the Swiss secondhand-event sector.',
        ],
      },
      {
        p: [
          'We may use, publish, share or commercialise these non-identifying insights for our own business, research, reports, organiser tools or partnerships.',
          'These insights do not identify individual visitors and are kept separate from personal data.',
        ],
      },
      {
        h: '9. The services that help Fynda work',
        p: [
          'Fynda uses a small number of trusted providers.',
          'Cloudflare hosts and delivers the Fynda website and protects it against abuse. Cloudflare may process IP addresses, access logs, browser information, requested pages, timestamps, errors and security information. Cloudflare is based in the United States and delivers the site from servers around the world.',
          'Supabase provides Fynda’s database. Market information, analytics events, newsletter subscriptions, messages, corrections and organiser records are stored there. Fynda uses an EU-based Supabase region.',
          'Google provides Search Console, which reports how Fynda appears in Google Search. It reads Google’s own index and embeds nothing in this website.',
          'Each provider processes information according to its role, its agreement with Fynda and its own legal obligations.',
          'We may also disclose personal data where required by law, needed to protect Fynda or another person, or necessary to establish or defend a legal claim.',
        ],
      },
      {
        h: '10. Processing outside Switzerland',
        p: [
          'Some of Fynda’s providers are based in, or use infrastructure located in, the United States and other countries outside Switzerland.',
          'Where relevant, these transfers rely on recognised safeguards such as:',
        ],
        ul: [
          'the Swiss-U.S. Data Privacy Framework;',
          'the EU-U.S. Data Privacy Framework;',
          'Standard Contractual Clauses;',
          'Swiss data-protection additions to those clauses.',
        ],
      },
      {
        p: [
          'Fynda uses an EU database region for Supabase, while hosting and delivery may process information in the United States and elsewhere.',
        ],
      },
      {
        h: '11. How long we keep information',
        p: ['We keep personal data only while it remains useful for the reason it was collected. In practice:'],
        ul: [
          'newsletter data is kept while you remain subscribed;',
          'after unsubscribing, only the minimal suppression record described above is kept;',
          'contact messages and correction reports are kept while they remain relevant;',
          'organiser correspondence may be kept as part of a listing’s verification history;',
          'analytics events are kept indefinitely, so that trends can be followed over years — they contain no name, no email address and no readable IP address;',
          'short-lived security and rate-limiting records are deleted when they are no longer needed.',
        ],
      },
      {
        p: [
          'Information that has been fully anonymised may be kept for longer because it no longer identifies anyone.',
        ],
      },
      {
        h: '12. How we protect your information',
        p: [
          'Fynda keeps public website data separate from private contact and organiser information. Public pages cannot read Fynda’s private organiser records.',
          'Database access is restricted through Supabase permissions and row-level security. The published website is a set of static pages and carries no administrative credentials.',
          'Connections to Fynda use HTTPS.',
          'IP addresses used for analytics and abuse prevention are hashed rather than stored in their original form.',
          'Access to personal data is limited to the services and administrative tools needed to operate Fynda.',
        ],
      },
      {
        h: '13. Your rights',
        p: ['You can contact us at any time to:'],
        ul: [
          'ask what personal data we hold about you;',
          'receive a copy of it;',
          'correct inaccurate information;',
          'request deletion;',
          'request a portable copy where applicable;',
          'withdraw your consent;',
          'object to or restrict certain processing.',
        ],
      },
      {
        p: [
          'Withdrawing consent does not affect processing that took place before it was withdrawn.',
          'To make a request, email contact@fynda.market. We may ask you to confirm your identity before acting on a request.',
          'The daily-rotating analytics hashes cannot be linked to a person, so they cannot be looked up or deleted individually.',
          'You also have the right to complain to the Swiss Federal Data Protection and Information Commissioner.',
        ],
      },
      {
        h: '14. Which law applies',
        p: [
          'For visitors in Switzerland, the Swiss Federal Act on Data Protection (nFADP) applies. Once Fynda is active in the European Union, the GDPR applies in addition.',
        ],
      },
      {
        h: '15. Changes to this policy',
        p: [
          'Fynda may introduce new features, providers or services over time. We will update this policy when our data practices change. The effective date at the top will always show when the latest version began to apply.',
        ],
      },
      {
        h: '16. Contact',
        p: [
          'For any privacy question or request, contact:',
          'Delfim Almeida\nZurich, Switzerland\ncontact@fynda.market',
        ],
      },
    ],
  },

  de: {
    title: 'Datenschutz — Fynda',
    description: 'Was Fynda erhebt, was nicht, und wo diese Daten liegen.',
    heading: 'Datenschutzerklärung',
    effective: 'Gültig ab 6. September 2026',
    lede: [
      'Fynda hilft Menschen, Flohmärkte, Brockenstuben und Secondhand-Anlässe in der ganzen Schweiz zu finden.',
      'Wir glauben, dass Secondhand zählt. Es hält gute Dinge im Umlauf, vermeidet Abfall und bringt Menschen an echten Orten zusammen. Fynda gibt es, damit diese Welt leichter zu finden ist.',
      'Ihr Vertrauen zählt für uns genauso wie die Angaben, die wir veröffentlichen.',
      'Wir verkaufen keine Personendaten.',
    ],
    blocks: [
      {
        h: '1. Wer ist für Ihre Daten verantwortlich?',
        p: [
          'Fynda wird betrieben von:',
          'Delfim Almeida\nZürich, Schweiz\ncontact@fynda.market',
        ],
      },
      {
        h: '2. Wann diese Erklärung gilt',
        p: ['Diese Erklärung gilt, wenn Sie:'],
        ul: [
          'fynda.market besuchen;',
          'einen Fynda-Newsletter abonnieren;',
          'uns kontaktieren;',
          'eine Korrektur melden;',
          'einen Markt vorschlagen;',
          'als Veranstalterin oder Veranstalter mit uns in Kontakt treten.',
        ],
      },
      {
        h: '3. Ein Besuch auf Fynda',
        p: [
          'Sie können Fynda nutzen, ohne ein Konto anzulegen und ohne uns zu sagen, wer Sie sind. Es gibt auf Fynda keinen Login und überhaupt keine Konten.',
          'Bei einem Besuch erhalten unser Hosting und unsere Analyse unter anderem folgende Angaben:',
        ],
        ul: [
          'welche Seiten Sie ansehen;',
          'wie Sie zu Fynda gekommen sind;',
          'welche Links und Funktionen Sie nutzen;',
          'welche Märkte Sie öffnen und welche Filter Sie setzen;',
          'Browser- und Gerätetyp;',
          'Ihr ungefähres Land;',
          'Ihre IP-Adresse;',
          'technische Fehler und Angaben zur Performance.',
        ],
      },
      {
        h: 'Unsere eigene Analyse, auf unserer eigenen Datenbank',
        p: [
          'Fynda verwendet kein Google Analytics, kein Microsoft Clarity und kein anderes Analyse- oder Werbeprodukt von Dritten. Unsere Analyse ist selbst gehostet: Ereignisse werden in unsere eigene Postgres-Datenbank geschrieben und mit unserem eigenen Metabase ausgewertet. Die Daten verlassen unsere Infrastruktur nie und werden nie verkauft.',
          'Fynda setzt keine Cookies, und es gibt kein Cookie-Banner, weil es nichts gibt, dem zugestimmt werden müsste.',
          'Anstelle eines Cookies wird jeder Besuch über einen Wert gezählt, der aus IP-Adresse und Browserkennung berechnet und anschliessend gehasht wird. Das dafür verwendete Geheimnis wechselt jeden Tag, sodass derselbe Besuch am nächsten Tag einen anderen Wert ergibt — die Kennung lässt sich nicht auf Sie zurückführen und nicht über mehrere Tage verfolgen. Die IP-Adresse selbst speichern wir nie im Klartext.',
        ],
      },
      {
        h: 'Google Search Console',
        p: [
          'Wir lesen aus, mit welchen Suchanfragen Menschen über Google zu Fynda finden. Das liest nur Daten aus Googles eigenem Suchindex und bindet kein Tracking-Skript in diese Website ein.',
        ],
      },
      {
        h: '4. Gemerkte Märkte und Ihr gewählter Ort',
        p: [
          'Die Märkte, die Sie merken, und der Ort, den Sie auf der Startseite wählen, liegen ausschliesslich im lokalen Speicher Ihres eigenen Browsers. Sie werden nie an uns übertragen und wir können sie nicht sehen. Sie verschwinden, wenn Sie die Browserdaten löschen oder einen anderen Browser oder ein anderes Gerät verwenden.',
        ],
      },
      {
        h: '5. Newsletter-Anmeldung',
        p: [
          'Wenn Sie sich anmelden, speichern wir Ihre E-Mail-Adresse, die gewählte Stadt und die Sprache der Seite in unserer eigenen Datenbank und nutzen sie, um Ihnen den gewünschten Newsletter zu schicken. Die Anmeldung ist sofort aktiv — es gibt keine Bestätigungsmail zum Anklicken.',
          'Dazu halten wir fest, wann und von welcher Seite aus die Anmeldung kam, welchen Zustimmungstext Sie dabei gesehen haben, und eine gehashte, nicht rückrechenbare Fassung Ihrer IP-Adresse, damit sich die Einwilligung belegen lässt. Die IP-Adresse selbst speichern wir nie.',
          'Rechtsgrundlage dafür ist Ihre Einwilligung. Sie können sie jederzeit widerrufen, indem Sie an contact@fynda.market schreiben oder den Abmeldelink in einem Newsletter nutzen.',
          'Bei einer Abmeldung löschen wir die Angaben, die Sie identifizieren könnten, aus der aktiven Newsletter-Liste und behalten nur einen minimalen Sperreintrag — Ihre E-Mail-Adresse sowie das Datum der Anmeldung und der Abmeldung — damit wir Sie nicht versehentlich erneut anschreiben und Einwilligung wie Widerruf belegen können.',
          'Wir nutzen keine externe Marketing-Plattform. Sollten wir später einen Versanddienst für den Newsletter einsetzen, wird er auf dieser Seite genannt, bevor er zum Einsatz kommt.',
        ],
      },
      {
        h: '6. Kontakt zu Fynda',
        p: [
          'Wenn Sie uns eine Nachricht schicken, eine falsche Angabe melden, einen Markt vorschlagen oder uns als Veranstalter kontaktieren, verwenden wir das, was Sie uns mitteilen. Das können sein:',
        ],
        ul: [
          'Ihr Name;',
          'Ihre E-Mail-Adresse;',
          'Ihre Organisation oder der Name des Markts;',
          'Ihre Nachricht;',
          'Links und ergänzende Angaben.',
        ],
      },
      {
        p: [
          'Auch diese Formulare öffnen heute Ihr eigenes E-Mail-Programm, Ihre Nachricht landet also in unserem Postfach und sonst nirgends. Wir nutzen sie, um zu antworten, dem Hinweis nachzugehen, Einträge zu korrigieren und die Marktangaben auf Fynda richtig zu halten.',
        ],
      },
      {
        h: '7. Öffentliche Marktangaben',
        p: [
          'Fynda recherchiert und veröffentlicht Angaben zu Flohmärkten und Secondhand-Anlässen. Diese Angaben können stammen von:',
        ],
        ul: [
          'Veranstaltern;',
          'offiziellen Markt-Websites;',
          'Gemeinden und Veranstaltungsorten;',
          'Vereinen und Verbänden;',
          'öffentlichen Veranstaltungskalendern;',
          'öffentlich zugänglichen Social-Media-Seiten;',
          'anderen öffentlichen Quellen.',
        ],
      },
      {
        p: ['Wir nutzen diese Angaben, um Einträge zu erstellen, zu prüfen und zu aktualisieren.'],
      },
      {
        h: '8. Wir verkaufen keine Personendaten',
        p: [
          'Wir verkaufen keine Personendaten.',
          'Wir geben Veranstaltern, Werbetreibenden oder Geschäftspartnern keine Listen mit identifizierbaren Fynda-Besucherinnen und -Besuchern.',
          'Wir verkaufen keine E-Mail-Adressen, keine Browserverläufe, keine Cookie-Kennungen und keine Personenprofile.',
          'Fynda kann vollständig aggregierte und anonymisierte Angaben nutzen, um grössere Muster zu verstehen, etwa:',
        ],
        ul: [
          'Suchinteresse nach Stadt oder Region;',
          'die Beliebtheit von Märkten und Terminen;',
          'saisonale Nachfrage;',
          'Zugriffs- und Verweisquellen;',
          'Lücken in der lokalen Flohmarkt-Abdeckung;',
          'Entwicklungen im Schweizer Secondhand-Bereich.',
        ],
      },
      {
        p: [
          'Diese nicht identifizierenden Erkenntnisse dürfen wir für unser eigenes Geschäft, für Forschung, Berichte, Veranstalter-Werkzeuge oder Partnerschaften nutzen, veröffentlichen, teilen oder wirtschaftlich verwerten.',
          'Sie identifizieren keine einzelne Besucherin und keinen einzelnen Besucher und werden getrennt von Personendaten gehalten.',
        ],
      },
      {
        h: '9. Die Dienste, mit denen Fynda läuft',
        p: [
          'Fynda arbeitet mit wenigen, ausgewählten Anbietern.',
          'Cloudflare hostet und liefert die Website von Fynda aus und schützt sie vor Missbrauch. Cloudflare kann IP-Adressen, Zugriffsprotokolle, Browserangaben, abgerufene Seiten, Zeitstempel, Fehler und Sicherheitsinformationen verarbeiten. Cloudflare hat seinen Sitz in den USA und liefert die Seite von Servern weltweit aus.',
          'Supabase stellt die Datenbank von Fynda bereit. Marktangaben, Analyse-Ereignisse, Newsletter-Anmeldungen, Nachrichten, Korrekturen und Veranstalter-Einträge werden dort gespeichert. Fynda nutzt eine Supabase-Region in der EU.',
          'Google stellt die Search Console bereit, die zeigt, wie Fynda in der Google-Suche erscheint. Sie liest Googles eigenen Index und bindet nichts in diese Website ein.',
          'Jeder Anbieter verarbeitet Angaben entsprechend seiner Rolle, seiner Vereinbarung mit Fynda und seinen eigenen rechtlichen Pflichten.',
          'Wir können Personendaten ausserdem offenlegen, wenn das Gesetz es verlangt, wenn es zum Schutz von Fynda oder einer anderen Person nötig ist oder um einen Rechtsanspruch geltend zu machen oder abzuwehren.',
        ],
      },
      {
        h: '10. Bearbeitung ausserhalb der Schweiz',
        p: [
          'Einige Anbieter von Fynda haben ihren Sitz in den USA oder anderen Ländern ausserhalb der Schweiz oder nutzen dort Infrastruktur.',
          'Soweit relevant stützen sich diese Übermittlungen auf anerkannte Garantien wie:',
        ],
        ul: [
          'das Swiss-U.S. Data Privacy Framework;',
          'das EU-U.S. Data Privacy Framework;',
          'Standardvertragsklauseln;',
          'die Schweizer Ergänzungen zu diesen Klauseln.',
        ],
      },
      {
        p: [
          'Für Supabase nutzt Fynda eine Datenbank-Region in der EU, während Hosting und Auslieferung Angaben in den USA und anderswo verarbeiten können.',
        ],
      },
      {
        h: '11. Wie lange wir Angaben aufbewahren',
        p: [
          'Wir bewahren Personendaten nur so lange auf, wie sie für den Zweck der Erhebung nützlich sind. Konkret:',
        ],
        ul: [
          'Newsletter-Daten bleiben, solange Sie abonniert sind;',
          'nach einer Abmeldung bleibt nur der oben beschriebene minimale Sperreintrag;',
          'Nachrichten und Korrekturhinweise bleiben, solange sie relevant sind;',
          'Veranstalter-Korrespondenz kann als Teil der Prüfhistorie eines Eintrags aufbewahrt werden;',
          'Analyse-Ereignisse werden unbegrenzt aufbewahrt, damit sich Trends über Jahre verfolgen lassen — sie enthalten keinen Namen, keine E-Mail-Adresse und keine Klartext-IP;',
          'kurzlebige Sicherheits- und Ratenbegrenzungs-Einträge werden gelöscht, sobald sie nicht mehr gebraucht werden.',
        ],
      },
      {
        p: [
          'Vollständig anonymisierte Angaben können länger aufbewahrt werden, weil sie niemanden mehr identifizieren.',
        ],
      },
      {
        h: '12. Wie wir Ihre Angaben schützen',
        p: [
          'Fynda hält öffentliche Website-Daten getrennt von privaten Kontakt- und Veranstalterangaben. Öffentliche Seiten können die privaten Veranstalter-Einträge nicht lesen.',
          'Der Zugriff auf die Datenbank ist über Supabase-Berechtigungen und Row-Level-Security eingeschränkt. Die veröffentlichte Website besteht aus statischen Seiten und trägt keine administrativen Zugangsdaten.',
          'Verbindungen zu Fynda laufen über HTTPS.',
          'IP-Adressen für Analyse und Missbrauchsabwehr werden gehasht statt im Original gespeichert.',
          'Der Zugang zu Personendaten ist auf die Dienste und Werkzeuge beschränkt, die für den Betrieb von Fynda nötig sind.',
        ],
      },
      {
        h: '13. Ihre Rechte',
        p: ['Sie können uns jederzeit kontaktieren, um:'],
        ul: [
          'zu erfahren, welche Personendaten wir über Sie halten;',
          'eine Kopie davon zu erhalten;',
          'falsche Angaben berichtigen zu lassen;',
          'die Löschung zu verlangen;',
          'wo anwendbar eine übertragbare Kopie zu verlangen;',
          'Ihre Einwilligung zu widerrufen;',
          'einer bestimmten Bearbeitung zu widersprechen oder sie einschränken zu lassen.',
        ],
      },
      {
        p: [
          'Ein Widerruf berührt nicht die Bearbeitung, die vor dem Widerruf stattgefunden hat.',
          'Für eine Anfrage schreiben Sie an contact@fynda.market. Wir können Sie bitten, Ihre Identität zu bestätigen, bevor wir handeln.',
          'Die täglich wechselnden Analyse-Hashes lassen sich keiner Person zuordnen und deshalb weder gezielt abfragen noch einzeln löschen.',
          'Sie haben ausserdem das Recht, sich beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) zu beschweren.',
        ],
      },
      {
        h: '14. Welches Recht gilt',
        p: [
          'Für Besucherinnen und Besucher in der Schweiz gilt das Schweizer Datenschutzgesetz (revDSG). Sobald Fynda in der Europäischen Union aktiv ist, gilt zusätzlich die DSGVO.',
        ],
      },
      {
        h: '15. Änderungen dieser Erklärung',
        p: [
          'Fynda kann mit der Zeit neue Funktionen, Anbieter oder Dienste einführen. Wir aktualisieren diese Erklärung, wenn sich unser Umgang mit Daten ändert. Das Datum oben zeigt immer, ab wann die aktuelle Fassung gilt.',
        ],
      },
      {
        h: '16. Kontakt',
        p: [
          'Für Fragen und Anliegen zum Datenschutz:',
          'Delfim Almeida\nZürich, Schweiz\ncontact@fynda.market',
        ],
      },
    ],
  },

  fr: {
    title: 'Politique de confidentialité — Fynda',
    description: 'Ce que Fynda collecte, ce qu’il ne collecte pas, et où ces données se trouvent.',
    heading: 'Politique de confidentialité',
    effective: 'En vigueur depuis le 6 septembre 2026',
    lede: [
      "Fynda aide à découvrir les brocantes, vide-greniers et événements d'occasion dans toute la Suisse.",
      "Nous pensons que la seconde main compte. Elle garde les bonnes choses en circulation, réduit les déchets et rassemble les gens autour de lieux réels. Fynda existe pour rendre ce monde plus facile à trouver.",
      'Votre confiance compte autant que les informations que nous publions.',
      'Nous ne vendons pas de données personnelles.',
    ],
    blocks: [
      {
        h: '1. Qui est responsable de vos données ?',
        p: [
          'Fynda est exploité par :',
          'Delfim Almeida\nZurich, Suisse\ncontact@fynda.market',
        ],
      },
      {
        h: "2. Quand cette politique s'applique",
        p: ["Cette politique s'applique lorsque vous :"],
        ul: [
          'consultez fynda.market ;',
          'vous abonnez à une newsletter Fynda ;',
          'nous contactez ;',
          'signalez une correction ;',
          'proposez un marché ;',
          'échangez avec nous en tant qu’organisateur.',
        ],
      },
      {
        h: '3. Votre visite sur Fynda',
        p: [
          "Vous pouvez consulter Fynda sans créer de compte et sans nous dire qui vous êtes. Il n'y a aucune connexion sur Fynda, et aucun compte.",
          'Lors de votre visite, notre hébergement et notre outil de mesure reçoivent des informations telles que :',
        ],
        ul: [
          'les pages que vous consultez ;',
          'la manière dont vous êtes arrivé sur Fynda ;',
          'les liens et fonctions que vous utilisez ;',
          'les marchés que vous ouvrez et les filtres que vous réglez ;',
          'votre navigateur et votre type d’appareil ;',
          'votre pays approximatif ;',
          'votre adresse IP ;',
          'les erreurs techniques et les informations de performance.',
        ],
      },
      {
        h: 'Notre propre mesure, sur notre propre base de données',
        p: [
          "Fynda n'utilise ni Google Analytics, ni Microsoft Clarity, ni aucun autre produit tiers de mesure ou de publicité. Notre mesure d'audience est auto-hébergée : les événements sont écrits dans notre propre base Postgres et lus avec notre propre installation de Metabase. Ces données ne quittent jamais notre infrastructure et ne sont jamais vendues.",
          "Fynda ne dépose aucun cookie, et il n'y a pas de bandeau cookies, parce qu'il n'y a rien à accepter.",
          "À la place d'un cookie, chaque visite est comptée au moyen d'une valeur calculée à partir de l'adresse IP et de l'identification du navigateur, puis hachée. Le secret utilisé pour ce hachage change chaque jour : la même visite produit donc une autre valeur le lendemain — l'identifiant ne peut pas remonter jusqu'à vous ni être suivi d'un jour à l'autre. L'adresse IP elle-même n'est jamais conservée en clair.",
        ],
      },
      {
        h: 'Google Search Console',
        p: [
          "Nous consultons les requêtes qui amènent les gens sur Fynda depuis Google. Cela lit les données de l'index de Google et n'ajoute aucun script de suivi sur ce site.",
        ],
      },
      {
        h: '4. Marchés enregistrés et ville choisie',
        p: [
          "Les marchés que vous enregistrez et la ville que vous choisissez sur la page d'accueil sont conservés uniquement dans le stockage local de votre propre navigateur. Ils ne nous sont jamais transmis et nous ne pouvons pas les voir. Ils disparaissent si vous effacez les données de votre navigateur, ou si vous changez de navigateur ou d'appareil.",
        ],
      },
      {
        h: '5. Inscription à la newsletter',
        p: [
          "Lorsque vous vous inscrivez, nous enregistrons votre adresse e-mail, la commune que vous avez choisie et la langue de la page dans notre propre base de données, afin de vous envoyer la newsletter demandée. L'inscription est active immédiatement — il n'y a pas d'e-mail de confirmation à cliquer.",
          "Nous enregistrons également la date de votre inscription, la page depuis laquelle elle a été faite, le texte de consentement qui vous a été montré et une empreinte irréversible de votre adresse IP, afin de pouvoir démontrer ce consentement. L'adresse IP elle-même n'est jamais conservée.",
          "La base légale de ce traitement est votre consentement. Vous pouvez le retirer à tout moment en écrivant à contact@fynda.market ou via le lien de désinscription présent dans chaque newsletter.",
          "Lors d'une désinscription, nous supprimons de la liste active les informations qui pourraient vous identifier et ne conservons qu'un enregistrement minimal de suppression — votre adresse e-mail et les dates d'inscription et de désinscription — afin de ne pas vous recontacter par erreur et de pouvoir démontrer votre consentement et son retrait.",
          "Nous n'utilisons aucune plateforme marketing externe. Si nous ajoutons plus tard un service d'envoi pour la newsletter, il sera nommé sur cette page avant d'être utilisé.",
        ],
      },
      {
        h: '6. Nous contacter',
        p: [
          "Lorsque vous nous envoyez un message, signalez une information erronée, proposez un marché ou nous contactez en tant qu'organisateur, nous utilisons ce que vous nous transmettez. Cela peut inclure :",
        ],
        ul: [
          'votre nom ;',
          'votre adresse e-mail ;',
          'votre organisation ou le nom du marché ;',
          'votre message ;',
          'des liens et informations complémentaires.',
        ],
      },
      {
        p: [
          "Ces formulaires ouvrent eux aussi votre propre logiciel de messagerie aujourd'hui : votre message arrive dans notre boîte aux lettres et nulle part ailleurs. Nous l'utilisons pour répondre, examiner la demande, corriger les annonces et garder les informations de Fynda exactes.",
        ],
      },
      {
        h: '7. Informations publiques sur les marchés',
        p: [
          "Fynda recherche et publie des informations sur les brocantes et les événements d'occasion. Ces informations peuvent provenir :",
        ],
        ul: [
          'des organisateurs ;',
          'des sites officiels des marchés ;',
          'des communes et des lieux ;',
          'des associations ;',
          'des agendas publics ;',
          'de pages de réseaux sociaux accessibles au public ;',
          "d'autres sources publiques.",
        ],
      },
      {
        p: ['Nous utilisons ces informations pour créer, vérifier et mettre à jour les annonces.'],
      },
      {
        h: '8. Nous ne vendons pas de données personnelles',
        p: [
          'Nous ne vendons pas de données personnelles.',
          "Nous ne fournissons à aucun organisateur, annonceur ou partenaire commercial de listes identifiables de visiteurs de Fynda.",
          "Nous ne vendons ni adresses e-mail, ni historiques de navigation, ni identifiants de cookies, ni profils personnels.",
          'Fynda peut utiliser des informations entièrement agrégées et anonymisées pour comprendre des tendances générales, par exemple :',
        ],
        ul: [
          "l'intérêt de recherche par ville ou par région ;",
          'la popularité des marchés et des dates ;',
          'la demande saisonnière ;',
          'les sources de trafic et de renvoi ;',
          "les lacunes de la couverture locale des brocantes ;",
          "les évolutions du secteur suisse de l'occasion.",
        ],
      },
      {
        p: [
          "Nous pouvons utiliser, publier, partager ou valoriser ces enseignements non identifiants pour notre activité, nos recherches, nos rapports, nos outils destinés aux organisateurs ou nos partenariats.",
          "Ces enseignements n'identifient aucun visiteur et sont conservés séparément des données personnelles.",
        ],
      },
      {
        h: '9. Les services qui font fonctionner Fynda',
        p: [
          "Fynda s'appuie sur un petit nombre de prestataires de confiance.",
          "Cloudflare héberge et diffuse le site de Fynda et le protège contre les abus. Cloudflare peut traiter des adresses IP, des journaux d'accès, des informations sur le navigateur, les pages demandées, des horodatages, des erreurs et des informations de sécurité. Cloudflare est établi aux États-Unis et diffuse le site depuis des serveurs répartis dans le monde.",
          "Supabase fournit la base de données de Fynda. Les informations sur les marchés, les événements de mesure, les inscriptions à la newsletter, les messages, les corrections et les données d'organisateurs y sont stockés. Fynda utilise une région Supabase située dans l'UE.",
          "Google fournit la Search Console, qui indique comment Fynda apparaît dans la recherche Google. Elle lit l'index de Google et n'intègre rien dans ce site.",
          "Chaque prestataire traite les informations selon son rôle, son contrat avec Fynda et ses propres obligations légales.",
          "Nous pouvons également divulguer des données personnelles lorsque la loi l'exige, lorsque c'est nécessaire pour protéger Fynda ou une autre personne, ou pour faire valoir ou défendre un droit en justice.",
        ],
      },
      {
        h: '10. Traitement hors de Suisse',
        p: [
          "Certains prestataires de Fynda sont établis aux États-Unis ou dans d'autres pays hors de Suisse, ou y utilisent des infrastructures.",
          "Le cas échéant, ces transferts reposent sur des garanties reconnues telles que :",
        ],
        ul: [
          'le Swiss-U.S. Data Privacy Framework ;',
          'le EU-U.S. Data Privacy Framework ;',
          'les clauses contractuelles types ;',
          'les compléments suisses à ces clauses.',
        ],
      },
      {
        p: [
          "Fynda utilise une région de base de données dans l'UE pour Supabase, tandis que l'hébergement et la diffusion peuvent traiter des informations aux États-Unis et ailleurs.",
        ],
      },
      {
        h: '11. Combien de temps nous conservons les informations',
        p: [
          "Nous ne conservons les données personnelles que tant qu'elles restent utiles à la raison pour laquelle elles ont été collectées. En pratique :",
        ],
        ul: [
          'les données de newsletter sont conservées tant que vous restez abonné ;',
          "après une désinscription, seul l'enregistrement minimal décrit ci-dessus est conservé ;",
          'les messages et signalements sont conservés tant qu’ils restent pertinents ;',
          "la correspondance avec les organisateurs peut être conservée dans l'historique de vérification d'une annonce ;",
          "les événements de mesure sont conservés sans limite de durée, afin de suivre les tendances sur plusieurs années — ils ne contiennent ni nom, ni adresse e-mail, ni adresse IP en clair ;",
          "les enregistrements de sécurité et de limitation de débit, de courte durée, sont supprimés dès qu'ils ne sont plus nécessaires.",
        ],
      },
      {
        p: [
          "Les informations entièrement anonymisées peuvent être conservées plus longtemps car elles n'identifient plus personne.",
        ],
      },
      {
        h: '12. Comment nous protégeons vos informations',
        p: [
          "Fynda sépare les données publiques du site des informations privées de contact et d'organisateurs. Les pages publiques ne peuvent pas lire les données privées d'organisateurs.",
          "L'accès à la base de données est restreint par les permissions Supabase et la sécurité au niveau des lignes. Le site publié est un ensemble de pages statiques et ne contient aucun identifiant d'administration.",
          'Les connexions à Fynda utilisent HTTPS.',
          "Les adresses IP utilisées pour la mesure et la prévention des abus sont hachées plutôt que conservées telles quelles.",
          "L'accès aux données personnelles est limité aux services et outils nécessaires au fonctionnement de Fynda.",
        ],
      },
      {
        h: '13. Vos droits',
        p: ['Vous pouvez nous contacter à tout moment pour :'],
        ul: [
          'demander quelles données personnelles nous détenons sur vous ;',
          'en recevoir une copie ;',
          'faire corriger des informations inexactes ;',
          'demander leur suppression ;',
          'demander une copie portable le cas échéant ;',
          'retirer votre consentement ;',
          "vous opposer à certains traitements ou en demander la limitation.",
        ],
      },
      {
        p: [
          "Le retrait du consentement n'affecte pas les traitements effectués avant ce retrait.",
          "Pour une demande, écrivez à contact@fynda.market. Nous pouvons vous demander de confirmer votre identité avant d'y donner suite.",
          "Les empreintes de mesure, qui changent chaque jour, ne peuvent être rattachées à personne : elles ne peuvent donc être ni consultées ni supprimées individuellement.",
          "Vous avez également le droit de déposer une réclamation auprès du Préposé fédéral à la protection des données et à la transparence.",
        ],
      },
      {
        h: '14. Droit applicable',
        p: [
          "Pour les visiteurs en Suisse, la loi fédérale sur la protection des données (nLPD) s'applique. Dès que Fynda sera actif dans l'Union européenne, le RGPD s'appliquera en plus.",
        ],
      },
      {
        h: '15. Modifications de cette politique',
        p: [
          "Fynda peut introduire de nouvelles fonctions, de nouveaux prestataires ou de nouveaux services au fil du temps. Nous mettrons à jour cette politique lorsque nos pratiques changeront. La date en haut de page indique toujours à partir de quand la version actuelle s'applique.",
        ],
      },
      {
        h: '16. Contact',
        p: [
          'Pour toute question ou demande relative à la confidentialité :',
          'Delfim Almeida\nZurich, Suisse\ncontact@fynda.market',
        ],
      },
    ],
  },

  it: {
    title: 'Informativa sulla privacy — Fynda',
    description: 'Che cosa raccoglie Fynda, che cosa non raccoglie e dove si trovano questi dati.',
    heading: 'Informativa sulla privacy',
    effective: 'In vigore dal 6 settembre 2026',
    lede: [
      "Fynda aiuta a scoprire mercatini delle pulci, mercatini dell'usato ed eventi di seconda mano in tutta la Svizzera.",
      'Crediamo che la seconda mano conti. Tiene in circolo le cose buone, riduce i rifiuti e riunisce le persone attorno a luoghi reali. Fynda esiste per rendere quel mondo più facile da trovare.',
      'La Sua fiducia conta quanto le informazioni che pubblichiamo.',
      'Non vendiamo dati personali.',
    ],
    blocks: [
      {
        h: '1. Chi è responsabile dei Suoi dati?',
        p: [
          'Fynda è gestito da:',
          'Delfim Almeida\nZurigo, Svizzera\ncontact@fynda.market',
        ],
      },
      {
        h: '2. Quando si applica questa informativa',
        p: ['Questa informativa si applica quando Lei:'],
        ul: [
          'consulta fynda.market;',
          'si iscrive a una newsletter di Fynda;',
          'ci contatta;',
          'segnala una correzione;',
          'propone un mercatino;',
          'comunica con noi come organizzatore.',
        ],
      },
      {
        h: '3. La Sua visita su Fynda',
        p: [
          'Può consultare Fynda senza creare un account e senza dirci chi è. Su Fynda non esiste alcun accesso e non esistono account.',
          'Durante la visita il nostro hosting e la nostra analisi ricevono informazioni come:',
        ],
        ul: [
          'le pagine che consulta;',
          'come è arrivato su Fynda;',
          'i link e le funzioni che usa;',
          'quali mercatini apre e quali filtri imposta;',
          'il tipo di browser e di dispositivo;',
          'il Suo Paese approssimativo;',
          'il Suo indirizzo IP;',
          'errori tecnici e informazioni sulle prestazioni.',
        ],
      },
      {
        h: 'La nostra analisi, sulla nostra banca dati',
        p: [
          'Fynda non usa Google Analytics, né Microsoft Clarity, né alcun altro prodotto di analisi o pubblicità di terzi. La nostra analisi è ospitata da noi: gli eventi vengono scritti nella nostra banca dati Postgres e letti con la nostra installazione di Metabase. Questi dati non lasciano mai la nostra infrastruttura e non vengono mai venduti.',
          'Fynda non usa cookie e non c’è alcun banner sui cookie, perché non c’è nulla da accettare.',
          'Al posto di un cookie, ogni visita viene contata tramite un valore calcolato a partire dall’indirizzo IP e dall’identificazione del browser e poi sottoposto ad hash. Il segreto usato per quell’hash cambia ogni giorno, quindi domani la stessa visita produce un valore diverso — l’identificatore non è riconducibile a Lei e non può essere seguito da un giorno all’altro. L’indirizzo IP non viene mai conservato in chiaro.',
        ],
      },
      {
        h: 'Google Search Console',
        p: [
          'Leggiamo con quali ricerche le persone arrivano su Fynda da Google. Questo legge i dati dall’indice di Google e non inserisce alcuno script di tracciamento in questo sito.',
        ],
      },
      {
        h: '4. Mercatini salvati e città scelta',
        p: [
          'I mercatini che salva e la città che sceglie nella pagina iniziale restano soltanto nella memoria locale del Suo browser. Non ci vengono mai trasmessi e non possiamo vederli. Spariscono se cancella i dati del browser o se usa un altro browser o un altro dispositivo.',
        ],
      },
      {
        h: '5. Iscrizione alla newsletter',
        p: [
          'Quando si iscrive, salviamo il Suo indirizzo e-mail, la città che ha scelto e la lingua della pagina nella nostra banca dati, e li usiamo per inviarLe la newsletter richiesta. L’iscrizione è attiva subito — non c’è alcuna e-mail di conferma da cliccare.',
          'Registriamo inoltre quando si è iscritto, da quale pagina, il testo di consenso che Le è stato mostrato e una versione irreversibile del Suo indirizzo IP, così da poter documentare il consenso. L’indirizzo IP in sé non viene mai conservato.',
          'La base giuridica di questo trattamento è il Suo consenso. Può revocarlo in qualsiasi momento scrivendo a contact@fynda.market o tramite il link di disiscrizione presente in ogni newsletter.',
          'In caso di disiscrizione cancelliamo dalla lista attiva le informazioni che potrebbero identificarLa e conserviamo soltanto una registrazione minima di soppressione — il Suo indirizzo e-mail e le date di iscrizione e disiscrizione — per non contattarLa di nuovo per errore e per poter documentare consenso e revoca.',
          'Non usiamo alcuna piattaforma di marketing esterna. Se in futuro aggiungeremo un servizio di invio per la newsletter, sarà indicato su questa pagina prima di essere utilizzato.',
        ],
      },
      {
        h: '6. Contattare Fynda',
        p: [
          'Quando ci invia un messaggio, segnala un’informazione errata, propone un mercatino o ci contatta come organizzatore, usiamo ciò che ci comunica. Può comprendere:',
        ],
        ul: [
          'il Suo nome;',
          'il Suo indirizzo e-mail;',
          'la Sua organizzazione o il nome del mercatino;',
          'il Suo messaggio;',
          'link e informazioni di supporto.',
        ],
      },
      {
        p: [
          'Anche questi moduli aprono oggi il Suo programma di posta: il messaggio arriva nella nostra casella e in nessun altro posto. Lo usiamo per risponderLe, verificare la segnalazione, correggere le schede e mantenere esatte le informazioni di Fynda.',
        ],
      },
      {
        h: '7. Informazioni pubbliche sui mercatini',
        p: [
          'Fynda raccoglie e pubblica informazioni su mercatini delle pulci ed eventi di seconda mano. Queste informazioni possono provenire da:',
        ],
        ul: [
          'organizzatori;',
          'siti ufficiali dei mercatini;',
          'comuni e luoghi di svolgimento;',
          'associazioni;',
          'calendari pubblici di eventi;',
          'pagine di social media accessibili al pubblico;',
          'altre fonti pubbliche.',
        ],
      },
      {
        p: ['Usiamo queste informazioni per creare, verificare e aggiornare le schede.'],
      },
      {
        h: '8. Non vendiamo dati personali',
        p: [
          'Non vendiamo dati personali.',
          'Non forniamo a organizzatori, inserzionisti o partner commerciali elenchi identificabili di visitatori di Fynda.',
          'Non vendiamo indirizzi e-mail, cronologie di navigazione, identificatori di cookie o profili personali.',
          'Fynda può usare informazioni del tutto aggregate e anonimizzate per capire tendenze più ampie, ad esempio:',
        ],
        ul: [
          'l’interesse di ricerca per città o regione;',
          'la popolarità di mercatini e date;',
          'la domanda stagionale;',
          'le fonti di traffico e di rimando;',
          'le lacune nella copertura locale dei mercatini;',
          'le tendenze del settore svizzero della seconda mano.',
        ],
      },
      {
        p: [
          'Possiamo usare, pubblicare, condividere o valorizzare economicamente queste analisi non identificative per la nostra attività, per ricerche, rapporti, strumenti per gli organizzatori o partnership.',
          'Queste analisi non identificano singoli visitatori e sono tenute separate dai dati personali.',
        ],
      },
      {
        h: '9. I servizi che fanno funzionare Fynda',
        p: [
          'Fynda si appoggia a un piccolo numero di fornitori di fiducia.',
          'Cloudflare ospita e distribuisce il sito di Fynda e lo protegge dagli abusi. Cloudflare può trattare indirizzi IP, registri di accesso, informazioni sul browser, pagine richieste, marche temporali, errori e informazioni di sicurezza. Cloudflare ha sede negli Stati Uniti e distribuisce il sito da server in tutto il mondo.',
          'Supabase fornisce la banca dati di Fynda. Vi sono conservati informazioni sui mercatini, eventi di analisi, iscrizioni alla newsletter, messaggi, correzioni e dati degli organizzatori. Fynda usa una regione Supabase situata nell’UE.',
          'Google fornisce Search Console, che mostra come Fynda compare nella ricerca Google. Legge l’indice di Google e non inserisce nulla in questo sito.',
          'Ogni fornitore tratta le informazioni secondo il proprio ruolo, il proprio accordo con Fynda e i propri obblighi di legge.',
          'Possiamo inoltre comunicare dati personali quando la legge lo richiede, quando è necessario per proteggere Fynda o un’altra persona, o per far valere o difendere un diritto in giudizio.',
        ],
      },
      {
        h: '10. Trattamento al di fuori della Svizzera',
        p: [
          'Alcuni fornitori di Fynda hanno sede negli Stati Uniti o in altri Paesi fuori dalla Svizzera, o vi utilizzano infrastrutture.',
          'Ove pertinente, questi trasferimenti si basano su garanzie riconosciute quali:',
        ],
        ul: [
          'lo Swiss-U.S. Data Privacy Framework;',
          'l’EU-U.S. Data Privacy Framework;',
          'le clausole contrattuali tipo;',
          'le integrazioni svizzere a tali clausole.',
        ],
      },
      {
        p: [
          'Per Supabase Fynda usa una regione di banca dati nell’UE, mentre l’hosting e la distribuzione possono trattare informazioni negli Stati Uniti e altrove.',
        ],
      },
      {
        h: '11. Per quanto tempo conserviamo le informazioni',
        p: [
          'Conserviamo i dati personali solo finché restano utili allo scopo per cui sono stati raccolti. In pratica:',
        ],
        ul: [
          'i dati della newsletter restano finché rimane iscritto;',
          'dopo la disiscrizione resta soltanto la registrazione minima descritta sopra;',
          'messaggi e segnalazioni restano finché sono rilevanti;',
          'la corrispondenza con gli organizzatori può essere conservata come parte della cronologia di verifica di una scheda;',
          'gli eventi di analisi sono conservati senza limiti di tempo, così da poter seguire le tendenze negli anni — non contengono nomi, indirizzi e-mail né indirizzi IP in chiaro;',
          'le registrazioni di sicurezza e di limitazione delle richieste, di breve durata, sono cancellate quando non servono più.',
        ],
      },
      {
        p: [
          'Le informazioni completamente anonimizzate possono essere conservate più a lungo perché non identificano più nessuno.',
        ],
      },
      {
        h: '12. Come proteggiamo le Sue informazioni',
        p: [
          'Fynda tiene i dati pubblici del sito separati dalle informazioni private di contatto e degli organizzatori. Le pagine pubbliche non possono leggere i dati privati degli organizzatori.',
          'L’accesso alla banca dati è limitato dai permessi di Supabase e dalla sicurezza a livello di riga. Il sito pubblicato è un insieme di pagine statiche e non contiene credenziali amministrative.',
          'Le connessioni a Fynda usano HTTPS.',
          'Gli indirizzi IP usati per l’analisi e la prevenzione degli abusi sono sottoposti ad hash anziché conservati in forma originale.',
          'L’accesso ai dati personali è limitato ai servizi e agli strumenti necessari per far funzionare Fynda.',
        ],
      },
      {
        h: '13. I Suoi diritti',
        p: ['Può contattarci in qualsiasi momento per:'],
        ul: [
          'chiedere quali dati personali conserviamo su di Lei;',
          'riceverne una copia;',
          'far correggere informazioni inesatte;',
          'chiederne la cancellazione;',
          'chiedere una copia portabile, ove applicabile;',
          'revocare il Suo consenso;',
          'opporsi a determinati trattamenti o chiederne la limitazione.',
        ],
      },
      {
        p: [
          'La revoca del consenso non pregiudica i trattamenti avvenuti prima della revoca.',
          'Per una richiesta scriva a contact@fynda.market. Possiamo chiederLe di confermare la Sua identità prima di darvi seguito.',
          'Gli hash di analisi, che cambiano ogni giorno, non sono riconducibili a una persona e non possono quindi essere consultati o cancellati singolarmente.',
          'Ha inoltre il diritto di rivolgersi all’Incaricato federale della protezione dei dati e della trasparenza.',
        ],
      },
      {
        h: '14. Diritto applicabile',
        p: [
          'Per i visitatori in Svizzera si applica la legge federale sulla protezione dei dati (nLPD). Non appena Fynda sarà attivo nell’Unione europea si applicherà in aggiunta il GDPR.',
        ],
      },
      {
        h: '15. Modifiche a questa informativa',
        p: [
          'Fynda può introdurre nel tempo nuove funzioni, nuovi fornitori o nuovi servizi. Aggiorneremo questa informativa quando cambieranno le nostre pratiche sui dati. La data in alto indica sempre da quando vale la versione attuale.',
        ],
      },
      {
        h: '16. Contatto',
        p: [
          'Per qualsiasi domanda o richiesta sulla privacy:',
          'Delfim Almeida\nZurigo, Svizzera\ncontact@fynda.market',
        ],
      },
    ],
  },
};
