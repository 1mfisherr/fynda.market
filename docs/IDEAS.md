# Ideas — parked, not committed

Nothing here is scoped or promised. An idea leaves this file only when someone writes down what evidence justified promoting it. Built or rejected ideas are deleted, not struck through (`PLAN.md` holds the rejected list).

---

## Parked

- **Organiser monthly "your page" mail** — views, calendar adds; the first thing chargeable. Waits on the four-week organiser answer rate (`PLAN.md`). M
- **Stall booking on the market page** — the `stall_booking` column exists. Only once there are real relationships with organisers. M
- **One data story a season** for press links ("Münster has more flea markets per capita than Berlin"), local press and tourism boards. Maybe, later. S

## Vendor tooling — the strongest parked idea

**The gap:** every flea-market booking system in German-speaking Europe is single-market (organiser software, Shopify stores selling "Standmeter", municipal forms, phone). Nobody answers *"where can I sell next Saturday within 50 km, what does it cost, is there space?"* Measured 2026-08-29: flohmarktkompass publishes fee tables, marktcom has a stall-booking form per market, brocabrac marks markets full for exhibitors; none is searchable. `flohmarkt stand mieten` is the #1 autocomplete expansion of `flohmarkt stand`.

**Why attractive:** vendors go weekly or monthly (visitors go twice a year), already pay €20–50 per weekend, and are served by nobody. Sending an organiser vendors turns "claim your listing" from a cold ask into a trade.

**Willingness to pay is not confirmed.** Five vendor conversations settle it: *How do you pick which market to do next weekend? How many did you consider? Last time you got it wrong, what happened? Would you pay to avoid that?*

**Risks:** far smaller search volume than the visitor side, so never the traffic engine; two-sided cold start; a second product surface — founder burnout is the named top risk. If built, it sits **on top of** the visitor directory and the same database, never instead of it.

## Multi-market routing — parked

People chain markets, but they never search for a tool to plan it (zero route/tour queries in v1's 1,000 queries), routes cannot be pages (six Zürich markets on one Saturday is ~50 route URLs per city-day — geo × time, which guardrails reject), and the distances need a sentence, not a planner. Built instead: *Also today, nearby* (`PAGES.md` §Market). If ever built, curated by an editor (Lange Nacht der Museen Berlin's ~10 hand-written routes), never generated.

Two findings worth acting on outside routing:
- **Nobody at scale reasons about closing times.** Flea markets have brutal pack-up times and we hold times on 98% of dates; "Bis 13:00 — danach wird abgebaut" is a decision-changing sentence nobody in the category writes. It is a Germany feature more than a Swiss one (Berlin has ~11 Sunday markets at once).
- **Swiss flea markets are a Saturday thing, but people search Sunday** — `sonntag` outdraws `samstag` 57 clicks to 25. Answering a Sunday search well ("nothing today, here is Saturday") is the more interesting opportunity.

## Worth stealing

- **Resolved-date chip URLs.** The chip reads "next weekend"; the URL carries literal dates. Label stable, URL unambiguous and cacheable.

## SEO, untested

No evidence behind either yet, and the recovery plan (`PLAN.md`) adds no page types, so these wait for recovery.

- **Question heading on town pages** — "Wann ist der nächste Flohmarkt in Zürich?" as the H2 above the list. Cheap; try when a town page is next touched.
- **Image sitemap** — one entry per real market photo. Only once real photos are in place.

## Longer shots

- **Agent-readable tools.** WebMCP (Chrome origin trial) lets a site expose structured tools to AI agents; "Is Mauerpark on this Sunday?" becomes a function call. Building the data layer API-shaped costs nothing now.
- **Licensing the dataset** (`PLAN.md` §Data, "Data as a product"): a verified, fresh European flea-market dataset is something AI companies cannot get elsewhere; it rewards real verification over volume.

## Monetisation

Free for users, revenue is supply-side (`CLAUDE.md`). Candidates: organiser featured listings, local business advertising, vendor tooling. Display ads are pocket money at realistic traffic and contaminate the trust surface. **Build the hooks early (claim-listing flow, featured slots, view counters), defer the machinery.**

## Worth the drive

A second block on the home page under *This weekend near Zürich*: the big markets 75–250 km away in the coming weeks, the ones people plan a Saturday around (Carouge, the Basel night market) (`design/front-door.html`, phone 2). Nothing in the data yet says which markets are worth the drive; revisit when stall counts are filled and the confirmed stamp covers most big markets.

## AI proposal loops

Four AI loops (discovery, freshness, performance, content proposals) as plain GitHub Actions scripts calling the Claude API, writing to a `proposals` table (`kind, payload, evidence, status`), where nothing publishes until a row is `approved`. Not built; the Market Watch and Finder cover discovery and freshness without the table. Revisit only if a loop needs multi-step tool use.
