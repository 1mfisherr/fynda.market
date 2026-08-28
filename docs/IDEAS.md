# Ideas — parked, not committed

Nothing here is scoped or promised. An idea leaves this file only when someone writes down what evidence justified promoting it.

---

## Vendor tooling — the strongest parked idea

**The gap:** every flea-market booking system in German-speaking Europe is single-market. Organiser software, Shopify stores selling "Standmeter", municipal forms, phone. **No aggregation layer exists.** Nobody answers *"where can I sell next Saturday within 50 km, what does it cost, is there space?"*

**Why the segment is attractive:** vendors go weekly or monthly (visitors go twice a year), already pay €20–50 per weekend, and are served by nobody. And vendor demand is exactly what organisers want — sending an organiser vendors turns "claim your listing" from a cold ask into a trade. Fleamapket structurally cannot follow; their subscription model points at destination tourists.

**Demand is confirmed**, in Google autocomplete: `flohmarkt stand mieten` is the #1 expansion of `flohmarkt stand`; `flohmarkt anmelden` returns ten cities.

**Willingness to pay is not confirmed.** Five vendor conversations settle it: *How do you pick which market to do next weekend? How many did you consider? Last time you got it wrong, what happened? Would you pay to avoid that?*

**Risks:** search volume is far smaller than the visitor side, so this can never be the traffic engine. Two-sided cold start. And it is a second product surface — founder burnout is the named top risk.

If built, it sits **on top of** the visitor directory and the same database, never instead of it.

---

## Cancellation and change alerts

Real shared pain — cancellations are announced on a city website, a school page, a local forum, or a town app, scattered across a dozen channel types and decided late.

**But meine-flohmarkt-termine.de already ships a cancellation tracker and a postcode newsletter.** Not open ground. Probably a feature of the freshness system rather than a position of its own.

---

## Retention without an app

- ICS calendar export — a bookmark in the user's own calendar that no algorithm can remove
- Saved markets in local storage (no accounts needed)
- Weekly newsletter, city-segmented from subscriber #1
- Dynamic preview images per market — the WhatsApp preview does the selling
- QR posters at market entrances: maximum intent, costs cents, unblockable

## Link-earning

- Data stories from our own catalogue ("Münster has more flea markets per capita than Berlin")
- Local press and tourism boards link to genuinely useful resources
- Real photography from visits

## Deferred monetization

Settled: **free for users, no paywalls.** Revenue is supply-side. Candidates: organiser featured listings, local business advertising, vendor tooling. Display ads are pocket money at realistic traffic and contaminate the trust surface — not a plan.

Build the hooks early (claim-listing flow, featured slots, view counters), defer the machinery.

## Longer shots

- **Agent-readable tools.** WebMCP is a web standard (Chrome origin trial, announced Google I/O 2026) letting a site expose structured tools to AI agents. "Is Mauerpark on this Sunday?" is a function call pretending to be a web page, and bots are now the majority of web traffic. Building the data layer API-shaped costs nothing now and makes this cheap later.
- **Licensing the dataset.** A verified, structured, genuinely fresh European flea-market dataset is something AI companies cannot get elsewhere. Cloudflare's pay-per-crawl makes this technically possible today. Very early, but it rewards the expensive thing (real verification) rather than volume.

---

owner: Delfim
last_reviewed: 2026-08-27
