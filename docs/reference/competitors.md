# Competitor teardown — flea-market directories, FR / DE / CH

Verified 2026-08-29. Salvaged from a sub-agent of the product research run (parent died on spend limit).
Method caveat: findings from server-rendered HTML. Information architecture, labels, field order and content
depth are reliable. Visual design, spacing, responsiveness and JS behaviour were NOT directly observed.

---

## The headline finding

**There is no credible bilingual, nationwide, flea-market-specific Swiss directory.**

| Site | State |
|---|---|
| flohmarktkalender.ch | Functional, but **run from Austria** (footer phone +43). German only. WordPress/stock-photo feel. Has the correct Swiss geography model: 26 cantons **plus 8 Großregionen** (Espace Mittelland, Genferseeregion, Nordwestschweiz, Ostschweiz, Tessin, Zentralschweiz, Zürich, Liechtenstein). Three submission routes incl. **email** — a real accessibility win for older organisers. |
| wann-ist-flohmarkt.ch | **DOWN.** Fatal PHP error: `Call to undefined function mysql_connect()`. Claimed 412 markets. Abandoned incumbent. |
| flohmarkttermine.ch | **No search of any kind.** Month links in the header. Jimdo-class. Rich per listing (3–6 photos each), structurally useless. |
| hubis-flohmarkt.ch | Quarter-based nav, accordions. No location search. Email submissions to a bluewin.ch address. **Charges organisers CHF 3–15 per listing.** |
| marktplatz-flohmarkt.ch | DNS does not resolve. |
| ronorp.net/zuerich/flohmarkt | 404. |
| trovas.ch | General classifieds. Markets appear as *ads*, sorted by price. Wrong data model, right multilingual instinct (DE/FR/IT/EN). |
| eventfrog.ch | General Swiss events. **Best card design of anything studied.** But ticketing-shaped; free markets sit awkwardly, coverage incidental. |
| tempslibre.ch | Romandie general agenda, **French only**. Strong image-led cards with canton badge. |
| brocabrac.fr/suisse/ | ~35 events, cantons BE/FR/GE/NE/VD/VS — **Romandie only.** German-speaking Switzerland absent. |
| meine-flohmarkt-termine.de/ch/ | Switzerland as an afterthought PLZ region of a German site. |

**Also: `flohmarkt.de` does not exist as a directory.** Apex and www both 404. There is no dominant single-word
German incumbent. The German market is genuinely fragmented. `troedelmarkt.de` is a parked domain, for sale.

---

## Patterns that recur everywhere (don't fight these)

1. **Date-grouped chronological lists are universal.** Every functioning site groups results under a day
   heading (`Samedi 29 Août 2026`, `Märkte am Samstag den 29.08.2026`). **Nobody sorts by relevance or distance.**
2. **Chips, not calendars.** `Heute / Morgen / Dieses Wochenende / Nächstes Wochenende` ≡ `Aujourd'hui / Demain /
   Ce week-end / Cette semaine / Le week-end prochain`. Calendar pickers exist only as a fallback. **Four to five
   chips is the settled vocabulary of this category.**
3. **Nobody uses images.** brocabrac, vide-greniers, MFT, marktcom, flohmarktkompass — all text-only cards.
   Only *general* event platforms (eventfrog, tempslibre) and flohmarktkalender.ch use thumbnails.
   Reason: organiser-submitted markets rarely arrive with a usable photo.
   **The no-image state is the DEFAULT, not the exception. Design text-first cards properly.**
4. **Two schools of location filtering:** administrative hierarchy (department / Bundesland / PLZ / canton) vs
   radius-from-me. marktcom went radius-first and collapses when geolocation is denied. brocabrac does both.
   **Distance-on-card is the most useful single field anyone shows, and nobody shows it well.**
5. **Freshness is the industry-wide failure.** Only vide-greniers.org dates a record (`Publié le 17 Juillet 2026`).
   **Nobody anywhere shows "last confirmed with the organiser."** brocabrac's own help page tells users to
   phone the organiser before travelling — an admission published on their own site.
6. **Cancellations are near-invisible.** MFT has a dedicated `/ausfall-abgesagt` page and an inline
   `Achtung: Dieser Termin fällt aus`; vide-greniers has an `Annulé` badge. Both plain text, no reason,
   no timestamp. Everyone else has nothing.
7. **Seller-side data is the real differentiator, and only two sites do it.** flohmarktkompass (fee tables,
   Aufbau times, rules, parking, transit) and marktcom (`Standgebühr` + `Kontakt & Buchungsanfrage`).
   **Visitor data is commoditised. Vendor data is not.**
8. **Organiser onboarding ranges from frictionless to hostile.** Best: flohmarktkompass. Worst: vide-greniers
   (SSO login wall *before* you can see the submit form) and hubis (email only, CHF 3–15 per listing).
9. **Monetization is uniformly tiny.** brocabrac `Compte sans pub` 6 €/year. vide-greniers from 6 €/year.
   flohmarktkompass `Trödelgold` 5 €/month or 50 €/year. **Nobody in this category has found real revenue.**
   The supply-side thesis isn't contradicted — but nobody has proved it either.
10. **Facet-URL discipline varies wildly.** brocabrac generates real crawlable date + type URLs per city and
    caps month links at **three forward months** — the only horizon limit found in the wild, and it looks
    accidental. vide-greniers uses non-linkable form controls (safe, zero SEO surface) but **one URL per
    occurrence** (`/evenement/1011042/20260829`) — structurally the fleafind failure mode.
    **Nobody has an explicit documented cap. Fynda's 120-day CI-enforced cap would be genuinely unusual.**
11. **Recurring markets are handled badly everywhere.** Nobody has a clean "next N occurrences + view all"
    with a hard horizon. This is exactly where the 120-day rule earns its keep.
12. **Calendar output is almost absent.** Only marktcom offers `Kalendereintrag erstellen`. No `.ics` anywhere
    else. For an audience whose entire job is "remember this Sunday", that is a plain miss.
13. **Trust badges are sold, not earned.** flohmarktkompass's `Verifiziertes Siegel` costs 5 €/month.
14. **Multi-country is normal** (MFT carries 11 countries, vide-greniers 6) — but every one does it by spawning
    a near-empty shell per country. **Multi-country data model: yes. Multi-country page generation: the trap.**

---

## Gaps nobody fills — the opportunity list

1. **Confirmed freshness.** `Bestätigt am 12.08.2026`, sourced from the organiser. Zero sites do this, and every
   site's own help text concedes the need. **Highest-value unclaimed feature in the category.**
2. **Cancellation as a first-class object** — reason, timestamp, notification to everyone who saved it.
3. **A bilingual (DE/FR) nationwide Swiss directory.** Does not exist.
4. **Vendor-facing search.** "Where can I get a stall next Sunday within 30 km, under 10 €/m, outdoors, with
   space left?" brocabrac has `complet pour les exposants`, flohmarktkompass has fee tables, marktcom has
   booking requests — **nobody has made any of it searchable.** Strongest candidate if Fynda goes the
   "infrastructure organisers use" route rather than visitor directory.
5. **Structured recurrence with a visible horizon.**
6. **Calendar export and reminders.**
7. **Text-first cards that are actually well designed.** Everyone defaults to no-image and nobody has made it
   look good — all dense grey rows. **White / near-black / one accent for dates and status is a legitimately
   competitive position, because the bar is on the floor.**
8. **Honest distance and travel time**, including transit.
9. **Organiser self-service that costs nothing and needs no account.**

---

## Three things to copy directly

1. **brocabrac's size dots.** `Les points indiquent la taille de l'événement.` One dot = under 50 vendors,
   five dots = over 300. **Event scale communicated in five pixels, no image needed.** Best small idea found.
2. **MFT's resolved-date chip URLs.** The chip says "next weekend"; the URL says
   `/suche?query=05.09.2026%20-%2006.09.2026`. Symbolic chip stays stable, resolved URL is unambiguous
   and cacheable.
3. **flohmarktkompass's organiser intake** (`/betreiber-eintragen.php`) — free, **no account**, eight fields
   of which **two are required** (company name, email). The rest: website with your dates, **iCal/ICS link**,
   **PDF date list**, or hand-entry. *They* ingest and maintain the listing for you.
   **An organiser with a phone and a PDF is onboarded without learning anything.** Steal this outright.

## One thing to avoid absolutely

MFT's **60+ category taxonomy** and 11-country footer link farm. That is the fleafind pattern, still being
run, at scale, today.

---

## Detail-page field order worth stealing (flohmarktkompass, richest in the set)

H1 → breadcrumb → address → recurrence in prose (`ganzjährig jeden Sonntag von 10:00 bis 18:00 Uhr`) with
named exceptions → `Aufbau ab 08:00` / `Einlass ab 10:00` / `Ende ca. 18:00` → organiser (name, phone, email,
website) → description with stall count and rules → venue facts (parking, covered, entry, toilets) →
**fee table** (reserved / unreserved / open ground, per stand and per running metre) → **public transport
paragraph** (named stations, walking minutes) → reviews.

marktcom's unique fields: `Geländeart` (open / partly covered / covered — genuinely useful in a rainy climate)
and **`Kontakt & Buchungsanfrage`**, a stall booking request sent to the organiser from the detail page.
**The most commercially interesting feature in the entire set, and nobody else has it.**

---

## Sources

brocabrac.fr · vide-greniers.org · marktcom.de · meine-flohmarkt-termine.de · flohmarktkompass.de ·
flohmarkt-termine.net · troedelmarkt.de · flohmarktkalender.ch · wann-ist-flohmarkt.ch · flohmarkttermine.ch ·
hubis-flohmarkt.ch · trovas.ch · eventfrog.ch · tempslibre.ch · flohmarkt.fyi
