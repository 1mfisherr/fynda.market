# What flea-market directories offer organisers — audit, 2026-09-16

Method: fetched public pages (organiser pages, help centres, FAQs, app-store listings, Trustpilot) and web search. No logins were created, so anything behind a login wall is inferred from help text. Builds on `docs/reference/competitors.md` (2026-08-29); this file covers only the organiser side.

## Site-by-site

**Germany**

- **meine-flohmarkt-termine.de (MFT)** — the organiser system is the parent platform **krencky24.de** (Kampagne Spezial GmbH): one login feeds five portals. Free "Veranstalterkonto". The FAQ confirms: series dates with start, end and repeat rate; up to **3 photos**; the organiser can **mark a date as cancelled**, which puts it on `/ausfall-abgesagt` with "Achtung: Dieser Termin fällt aus" — no reason, no timestamp, no source. Changing an address means creating a new venue. Paid: "highlight banners" per postcode area. Every organiser gets a **Veranstalternummer** for support. No "confirmed on" anywhere. https://meine-flohmarkt-termine.de/faq
- **flohmarktkompass.de** — intake at `/betreiber-eintragen.php`: **no account, free, 2 required fields** (name, email). Paste your website, an iCal link or a PDF and "we take over the data, automated or with AI support". Reviewed before publishing. **Trödelgold**: golden map pin, top of list and a "Verifiziertes Siegel" — earned by collecting genuine reviews via a downloadable rating flyer; also sold as a paid 30-day highlight. Nothing documented on editing, cancellation or photos.
- **marktcom.de** — `/veranstalter/anmelden`, free after registration: "personal menu and your events", in-account chat with users, a stall-fee field and "Kontakt & Buchungsanfrage" (stall booking request) to the organiser. Advertising by sales call only ("for every budget"). Its terms say content "is not regularly checked". Claims ~25,000 events and 1 M monthly visitors.
- **flohmarkt-termine.net** — alive since 1996, email+password registration so you can "manage and change your events at any time". Footer today: **"2 Flohmärkte in 1.136 Städten online"** — a shell. https://www.flohmarkt-termine.net/register.php
- **flohmarktradar.de** — free organiser login, "Verwalten Sie Ihre Markttermine". Nothing else documented.
- **flohmarktseite.de, flohandfun.com, flohmarktkalender.com, flohmarkt-info.de, wochenmarkt-flohmarkt.de, flohmarkt-termine.org** — free form submission, mostly without login; corrections via a "Fehlerhaften Eintrag melden" button. **wasgehtapp.de** is the one interesting outlier: logging in removes the CAPTCHA and unlocks **Excel/batch upload**.
- **das-inserat.de** (Rhine-Main) — form; **EUR 5 per commercial event**, free for private sellers and registered clubs; asks for 2 weeks' notice.
- **flohmap.de** — a different animal: a free, volunteer-run tool for **village/street flea markets** (Dorfflohmarkt). The organiser gets an admin dashboard; households self-register through a link without accounts; stalls sit on a map; fees are tracked (paid/open/waived); **broadcast to all vendors by email and push**; AI-generated posters, QR codes, auto-post to Facebook. The closest thing to "the tool organisers actually use". https://flohmap.de/hilfe
- **Dead or hollow**: **floh-markt.de** (expired TLS certificate), **troedelmarkt-termine.de** (certificate belongs to another host — parked), **openeventnetwork.de** ("one entry, many calendars" — now redirects to an agency site). flohmarkt.de and troedelmarkt.de were already dead in August. The "syndicate once" idea has been tried in Germany and abandoned.

**France**

- **brocabrac.fr** — the most complete organiser help centre in the set. Free, account required, published "within minutes" once you click the confirmation email. Recurring: pick several dates once, with automatic suggestions. In "Mes annonces": modify, delete, **mark "annulé"** (red banner beside the title), **mark "complet"** (no more exhibitors), and **per-listing stats** (views, email clicks, phone clicks). **A claim flow exists**: a "je suis l'organisateur" button on any event Brocabrac added itself. Non-organisers may post but must give the organiser's exact contact. Trustpilot 1.5/5 — visitors complain about ads and cancelled events not flagged; one organiser: refused listing "sous des prétextes fallacieux". https://brocabrac.fr/aide/gestion-annonce/
- **vide-greniers.org** (Réseau des agendas / agenda.org) — SSO login wall before the form. Featured listings ("mises en avant"): **EUR 25 per event**, sliding scale from 5 dates, annual "Agenda+" packs for 10+ events, bought from the organiser dashboard, shown top of list across the whole network. Trustpilot 1.6/5, all visitor complaints (ads, paywall, lost map). Their own FAQ concedes the organiser "does not always think to signal a cancellation".
- **lesbrocantes.com** — Belgian, part of **OrgaBroc**, whose real product is stall-reservation software (QR tickets, instant payment, vendor placement). The directory is a by-product of the tool. Same pattern as flohmap.

**Switzerland**

- **flohmarktkalender.ch** — three free routes: self-service login (`/termine-bearbeiten/`), form (`/termin-melden/`), or plain email. "IMMER KOSTENLOS". Run from Austria.
- **hubis-flohmarkt.ch** — email to a bluewin.ch address; **CHF 3 per listing**, up to CHF 15 for a flyer package.
- **flohmarkt.ch** — a classifieds site; markets are posted as ads like any other item. **brocante.ch** — expired certificate. **eventfrog.ch** — free listing, commission-free ticketing, 5-step wizard, multilingual support; built for ticketed events, so a free Sunday market is a poor fit. No Swiss site has a claim flow, a cancellation flag or a freshness date.

**Generic references**

- **Google Business Profile** — claim by video (now the default: a 30-second live recording proving location and authority), postcard, phone or email; Google picks the method. Once verified: hours, posts, photos, Q&A, reviews. Google's Event schema supports `EventCancelled` / `EventPostponed` — the only mainstream place where cancellation is structured data.
- **Yelp / TripAdvisor** — free claim, **verified by an automated call to the phone number already on the listing** (instant), then edit details, photos, reply to reviews, see views and leads.
- **Eventbrite** — free for free events; recurring series; cancel = set status "Cancelled", email attendees, refund. That attendee email is what directories lack.
- **Nextdoor** — free business events shown to neighbours within 10 miles; no cancellation feature found.

## Comparison

| Site | Add / claim | Login | Edit | Cancel flag | Confirmed / freshness | Recurring | Photos | Organiser pays |
|---|---|---|---|---|---|---|---|---|
| MFT / krencky24 | Add via account | Yes | Yes | Yes, plain | No | Yes, series | 3 | Free; paid banners |
| flohmarktkompass | Form, no account; iCal/PDF/URL ingest | No | Via support | No | No (seal = reviews) | Ingested | ? | Free; Trödelgold highlight |
| marktcom | Add via account | Yes | Yes | No | No | ? | ? | Free; ads by sales call |
| flohmarkt-termine.net | Add via account | Yes | Yes | No | No | ? | ? | Free (2 markets live) |
| flohmap | Account + admin approval | Yes | Yes | Broadcast to vendors | No | No | ? | Free |
| brocabrac | Add, or **claim** button | Yes | Yes | Yes, red banner | "Publié le" only | Multi-date | No | Free; ads |
| vide-greniers.org | Add via SSO | Yes, before form | Yes | "Annulé" badge | Published date | Per-occurrence URLs | ? | Free; EUR 25 featured |
| flohmarktkalender.ch | Form, email or account | Optional | Yes | No | No | ? | Yes | Free |
| hubis | Email | No | Email | No | No | No | Yes | CHF 3–15 |
| Google / Yelp / TripAdvisor | Claim, phone/video verify | Yes | Yes | GBP: status field | Last-updated shown | GBP hours | Yes | Free |
| **Fynda today** | Claim form | No | No | No | **Yes, "confirmed on"** | Yes, 120-day cap | Yes | Free |

## (1) Table stakes — everything alive does this

1. **Free listing.** The only ones charging (hubis CHF 3, das-inserat EUR 5) are tiny. Revenue, where it exists, is a highlight slot (EUR 25 per event at vide-greniers, Trödelgold at flohmarktkompass, banners at MFT).
2. **Some way to edit later** — a login (MFT, marktcom, brocabrac, radar) or a "report a wrong entry" button (flohmarktseite, flohmarktkalender.ch).
3. **Series dates entered once.** MFT, brocabrac and Eventbrite all do it. Fynda gets this from import; organisers will expect to set it themselves.
4. **A confirmation email** that the listing is live (brocabrac, MFT).

## (2) Open space — nobody does this

1. **"Confirmed by the organiser on <date>."** Still zero sites. Trustpilot reviews of brocabrac and vide-greniers are full of "went and there was no market"; both sites' own FAQs admit organisers forget to cancel.
2. **A cancellation that reaches visitors.** MFT and brocabrac show a flag *if you come back to the site*. Nobody emails or pushes the people who saved the market; nobody records a reason or a time. Eventbrite does this for ticket-holders; no directory does.
3. **Claim by phone verification.** Yelp, TripAdvisor and Google verify by ringing the listed number — instant, no password. Only brocabrac has a claim button at all in this category, and it needs an account. **"We call the number already on the listing" would be unique here and needs no login system.**
4. **Ingest instead of data entry.** flohmarktkompass alone takes an iCal link or a PDF and does the work. Nobody reads the organiser's existing website or Facebook page for them.
5. **Cross-posting.** openeventnetwork died. Organisers still re-type each date into 5–10 portals (MFT, marktcom, kompass, radar, meinestadt, the local paper, Facebook). An export from one place (ICS, "copy for Facebook") is unclaimed.
6. **Stats that matter.** brocabrac shows views / emails / calls per listing — the only one. Nobody reports "how many people saved your market" or "how many opened the Friday mail".

## (3) What organisers complain about or work around

- **Nobody visits a portal to report a cancellation.** Organisers post it on their own site or Facebook "by 15:00 the day before"; portals find out never. vide-greniers FAQ: the organiser "does not always think to signal a cancellation". brocabrac reviewer, Nov 2025: two trips, "pas de brocantes". A one-tap cancel link in a text message is the fix nobody has shipped.
- **Re-entering the same dates everywhere.** Organiser guides (flohmarkt.info, meinverein.de) tell them to list on "various online calendars"; the one tool that promised single entry is dead.
- **Moderation black holes.** brocabrac organiser: listing refused "under false pretences"; both French networks have FAQ items for "my listing is not visible" and "I got no email".
- **Login walls.** vide-greniers puts SSO before the form; flohmarktkalender.ch offers plain **email** as a route explicitly for older organisers. hubis takes email only.
- **Their real admin pain is vendors, not visitors.** flohmap and OrgaBroc grew by handling stall registration, fees and vendor broadcasts. Fynda parks vendors in `IDEAS.md`; this is the evidence that tool-first works in this exact niche.
- **Ads have poisoned the incumbents.** Both French leaders sit at ~1.5/5 on Trustpilot for ads, not data. An ad-free directory is itself a pitch to organisers embarrassed to send visitors elsewhere.

## What this suggests for Fynda's claim form (0 claims so far)

Not a login. Three things, in order of cost:
1. **Verify a claim by calling or texting the number already on the listing** (Yelp model). Instant, no password, and the act itself produces a fresh "confirmed on".
2. **After a claim, one link per market**: "confirm next date" / "cancel next date (reason optional)". Cancel triggers the notification nobody else sends — the OpenTable move from `PRODUCT.md`.
3. **Accept an iCal link, website URL or PDF at claim time** (flohmarktkompass model) so we maintain the dates, not them.

Sources: meine-flohmarkt-termine.de/faq · krencky24.de/registrieren · flohmarktkompass.de/betreiber-eintragen.php · marktcom.de/veranstalter/anmelden · flohmarkt-termine.net/register.php · flohmarktradar.de/Veranstalter/ · flohmap.de/hilfe · das-inserat.de/flohmarkttermine · wasgehtapp.de/termin.php · brocabrac.fr/aide/ (annoncer-evenement, gestion-annonce, probleme-annonce) · info.agenda.org/faqs/agenda-mises-en-avant/ · vide-greniers.org · orgabroc.org · flohmarktkalender.ch · hubis-flohmarkt.ch · flohmarkt.ch · eventfrog.ch/de/veranstalter.html · fr.trustpilot.com/review/brocabrac.fr · fr.trustpilot.com/review/www.vide-greniers.org · biz.yelp.com/support-center · tripadvisor.com/Owners · eventbrite.com/help (cancel an event) · business.nextdoor.com
