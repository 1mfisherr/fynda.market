# Ideas — parked, not committed

Nothing here is scoped or promised. An idea leaves this file only when someone writes down what evidence justified promoting it.

---

## Vendor tooling — the strongest parked idea

**The gap:** every flea-market booking system in German-speaking Europe is single-market. Organiser software, Shopify stores selling "Standmeter", municipal forms, phone. No aggregation layer exists. Nobody answers *"where can I sell next Saturday within 50 km, what does it cost, is there space?"*

**Why the segment is attractive:** vendors go weekly or monthly (visitors go twice a year), already pay €20–50 per weekend, and are served by nobody. Vendor demand is also exactly what organisers want — sending an organiser vendors turns "claim your listing" from a cold ask into a trade.

**Demand is visible** in autocomplete: `flohmarkt stand mieten` is the #1 expansion of `flohmarkt stand`. **The gap is measured** `[VERIFIED 2026-08-29]` — flohmarktkompass publishes full fee tables, marktcom has a stall-booking request form on the market page (the most commercially interesting feature found anywhere in the category), brocabrac marks markets `complet pour les exposants`. Not one has made any of it searchable.

**Willingness to pay is not confirmed.** Five vendor conversations settle it: *How do you pick which market to do next weekend? How many did you consider? Last time you got it wrong, what happened? Would you pay to avoid that?*

**Risks:** far smaller search volume than the visitor side, so this can never be the traffic engine. Two-sided cold start. And it is a second product surface — founder burnout is the named top risk. If built, it sits **on top of** the visitor directory and the same database, never instead of it.

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

## Longer shots

- **Agent-readable tools.** WebMCP (Chrome origin trial, Google I/O 2026) lets a site expose structured tools to AI agents. "Is Mauerpark on this Sunday?" is a function call pretending to be a web page, and bots are now the majority of web traffic. Building the data layer API-shaped costs nothing now.
- **Licensing the dataset.** A verified, genuinely fresh European flea-market dataset is something AI companies cannot get elsewhere. Very early, but it rewards the expensive thing — real verification — rather than volume.

## Link-earning

Data stories from our own catalogue ("Münster has more flea markets per capita than Berlin") · local press and tourism boards · real photography from visits.

## Monetisation

Settled: free for users, no paywalls, revenue is supply-side. Candidates: organiser featured listings, local business advertising, vendor tooling. Display ads are pocket money at realistic traffic and contaminate the trust surface — not a plan. **Build the hooks early (claim-listing flow, featured slots, view counters), defer the machinery.**

---

owner: Delfim
last_reviewed: 2026-08-29
