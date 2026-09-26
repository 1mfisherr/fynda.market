# Ideas — parked, not committed

Nothing here is scoped or promised. An idea leaves this file only when someone writes down what evidence justified promoting it.

---

## Product review, 2026-09-24 — for Delfim to pick from

Walked on a phone. Size S = a day, M = days, L = weeks.

- **Home: your own country first in *This weekend*** — a Zurich visitor sees Hamburg on top. Order only, no redirect. S
- **Market page: *Also that day, nearby*** (see routing below) — the page is a dead end today. S
- **Closing-time line** — *Until 13:00, stalls pack up after*; on the day *Open now, closes in 2 h*. S
- **Town page: nearby towns** — Zurich's page ignores Kloten, Dübendorf, Dietikon. M
- **WhatsApp share + preview image** on market pages. S
- **Town search on the 404 page.** S
- **Organiser monthly "your page" mail** — views, calendar adds; the first thing chargeable. Waits on the four-week answer rate. M
- **Annual dates mail** — must exist by December. M
- **QR poster for organisers.** S
- **Dates in any form** — PDF, flyer photo, link; we read it. Waits on the answer rate. M
- **Germany deep in four cities** (Berlin 5 listed of ~11 a weekend) before thin breadth. L
- **Stall booking on the market page** — the `stall_booking` column exists; the vendor path. M
- **One data story a season** for press links. S

Recommended first: the first three.

## Vendor tooling — the strongest parked idea

**The gap:** every flea-market booking system in German-speaking Europe is single-market. Organiser software, Shopify stores selling "Standmeter", municipal forms, phone. No aggregation layer exists. Nobody answers *"where can I sell next Saturday within 50 km, what does it cost, is there space?"*

**Why the segment is attractive:** vendors go weekly or monthly (visitors go twice a year), already pay €20–50 per weekend, and are served by nobody. Vendor demand is also exactly what organisers want — sending an organiser vendors turns "claim your listing" from a cold ask into a trade.

**Demand is visible** in autocomplete: `flohmarkt stand mieten` is the #1 expansion of `flohmarkt stand`. **The gap is measured** `[VERIFIED 2026-08-29]` — flohmarktkompass publishes full fee tables, marktcom has a stall-booking request form on the market page (the most commercially interesting feature found anywhere in the category), brocabrac marks markets `complet pour les exposants`. Not one has made any of it searchable.

**Willingness to pay is not confirmed.** Five vendor conversations settle it: *How do you pick which market to do next weekend? How many did you consider? Last time you got it wrong, what happened? Would you pay to avoid that?*

**Risks:** far smaller search volume than the visitor side, so this can never be the traffic engine. Two-sided cold start. And it is a second product surface — founder burnout is the named top risk. If built, it sits **on top of** the visitor directory and the same database, never instead of it.

## Multi-market routing — parked with evidence

**The behaviour is real. The feature is not worth building, and the obvious version is our exact trap.**

People do chain markets: Luzern's own tourism blog runs a "Tour-de-Flohmarkt" piece recommending two in one afternoon, and Spreewald's Christmas-market page tells readers to plan a tour and then provides no route. **Nobody in Europe helps them** — verified across brocabrac, MFT, flohmarktheld, FlohScout, flohmarktkompass and the rest. FlohScout's advertised "Echtzeit-Routenplaner" is navigation to a single market.

Why it stays parked:

- **Zero search demand.** Not one query in v1's 1,000-query, 90-day export contains route, tour, circuit, Rundgang or mehrere. Confirmed by hand. It cannot serve an SEO acquisition thesis.
- **Routing is not what wins.** In the US, LuckySale is the only app that reasons about closing times — the hard part — and it has 23 ratings. The category leader has no routing and 12,000 ratings at 4.9 stars. Its users complain about stale data, which is the moat we already have.
- **Routes cannot be pages.** Six Zürich markets on one Saturday is 50 route URLs per city-day, ~26,000 across ten cities — three times what killed v1. Our guardrails already reject `/de/route/zuerich/2026-09-12/` as geo × time.
- **The distances are trivial.** Bürkliplatz → Helvetiaplatz 1.5 km. Basel Petersplatz → Vogesenplatz 950 m. That needs a sentence, not a planner.
- **Optimising by distance is wrong anyway.** The category rule is "go early, the good stock is gone by ten", so the right first stop is the *best* market, not the nearest.

**Worth building instead, on the market page under the directions button:** "Am selben Tag in der Nähe" — two or three markets, with distance and the times that constrain the order (Wollishofen opens at 11:00, so it cannot be first; Luzern Vögeligärtli closes at 14:00). One `ST_DWithin` query, no new URL. If nobody clicks the second market, a route planner would have failed too.

**If it is ever built, build it curated, not generated.** Lange Nacht der Museen Berlin is the closest analogue that exists — ~10 editor-written routes at `/route/{slug}/`, each card reading `5 Stopps · 2 km · Zu Fuss`, plus accessibility as route types (DGS-Route, Rolli-Route). One static page an editor made, which passes the content floor honestly. Komoot's generated `smarttour` pages are the opposite — the "URL pattern permits it" machine that killed v1, survivable only on their domain authority.

**The durable finding, worth acting on outside routing entirely: nobody at scale reasons about closing times.** Google Maps warns that a place may be shut when you arrive but never reorders, and adding a second stop removes "arrive by" altogether. Roadtrippers users have been asking for arrival times since 2022 — "trip planning is worthless without this function". Flea markets have brutal pack-up times, and we hold times on 98% of dates. **"Bis 13:00 — danach wird abgebaut" is a decision-changing sentence nobody in the category writes.**

**And it is a Germany feature, not a Swiss one.** Berlin has ~11 Sunday markets running at once; Swiss Sundays are thin and scattered.

**People do plan multi-market trips.** German flea-market YouTube is full of it — *2 Flohmärkte auf einen Streich*, *3 Flohmärkte an nur einem Tag*, *24h jeden Flohmarkt in Hamburg besuchen*, blog posts split into Teil 1 and Teil 2 with the distance between them stated ("die 8 Kilometer rüber"). The behaviour is common and people make content about it. **What stays true is the thing that matters: they never search for a tool to plan it.** Zero route queries in 1,000. So the verdict is unchanged — it is real behaviour with no search demand, which makes it a feature, never a channel.

**Related finding worth acting on separately:** Swiss flea markets are a **Saturday** thing, but people search Sunday — `sonntag` outdraws `samstag` 57 clicks to 25. Answering a Sunday search well ("nothing today, here is Saturday") is the more interesting opportunity.

## Worth stealing

`[VERIFIED 2026-08-29 — see` `reference/competitors.md`]`

- **Size dots.** Brocabrac shows scale as one to five dots: one = under 50 vendors, five = over 300. Event size in five pixels, no image needed. Best small idea in the category, and it fits a text-first card exactly.
- **Organiser intake with no account.** flohmarktkompass asks two required fields, then takes your dates however you have them — website, iCal link, **a PDF**, or typed in. An organiser with a phone and a PDF is onboarded without learning anything.
- **Resolved-date chip URLs.** The chip reads "next weekend"; the URL carries literal dates. Label stable, URL unambiguous and cacheable.
- **`Geländeart`** — open-air / partly covered / covered. Genuinely useful in a rainy climate and nobody else has it.

## Retention without an app

ICS calendar export (a bookmark in the user's own calendar that no algorithm can remove) · saved markets in local storage, no accounts · weekly city-segmented newsletter · dynamic preview images per market, so the WhatsApp preview does the selling · QR posters at market entrances — maximum intent, costs cents, unblockable.

## Cancellation alerts

Real shared pain, but meine-flohmarkt-termine already ships a cancellation tracker and a postcode newsletter. Not open ground — probably a feature of the freshness system rather than a position of its own.

## SEO, untested

From the 2026-09-18 SEO research. Neither has evidence behind it yet; the four-week Search Console read on 2026-10-16 comes first.

- **Question heading on town pages** — "Wann ist der nächste Flohmarkt in Zürich?" as the H2 above the list. Cheap; try when a town page is next touched.
- **Image sitemap** — one entry per real market photo. Only once real photos exist.

## Longer shots

- **Agent-readable tools.** WebMCP (Chrome origin trial, Google I/O 2026) lets a site expose structured tools to AI agents. "Is Mauerpark on this Sunday?" is a function call pretending to be a web page, and bots are now the majority of web traffic. Building the data layer API-shaped costs nothing now.
- **Licensing the dataset.** A verified, genuinely fresh European flea-market dataset is something AI companies cannot get elsewhere. Very early, but it rewards the expensive thing — real verification — rather than volume.

## Link-earning

Data stories from our own catalogue ("Münster has more flea markets per capita than Berlin") · local press and tourism boards · real photography from visits.

## Monetisation

Settled: free for users, no paywalls, revenue is supply-side. Candidates: organiser featured listings, local business advertising, vendor tooling. Display ads are pocket money at realistic traffic and contaminate the trust surface — not a plan. **Build the hooks early (claim-listing flow, featured slots, view counters), defer the machinery.**

---

owner: Delfim
last_reviewed: 2026-09-16

## Worth the drive

A second block on the home page under *This weekend near Zürich*: the big markets 75–250 km away in the coming weeks, the ones people plan a Saturday around (Carouge, the Basel night market). Sketched 2026-09-22 (`design/front-door.html`, phone 2), cut from the Germany spec because nothing in the data yet says which markets are worth the drive. Revisit when organisers have filled stall counts and the confirmed stamp covers most big markets.
