# Architecture Ideas — Thinking Out Loud

Started 2026-08-27. **Nothing here is decided.** This is a thinking document, deliberately unfinished.

Ground rules for this file:
- We are not copying incumbents. Several of them are visibly AI-built, which means their architecture *is* the consensus AI recommendation. Building that = building the thing everyone else is being told to build.
- We learn from Booking, Airbnb, TheFork, Songkick — principles, not layouts.
- Flea markets are a specific domain with specific physics. The architecture should come from *those physics*, not from a generic directory template.

---

## Part 1 — What is actually unique about flea markets?

Before any URL structure, the domain's real properties. Everything downstream should derive from these.

| Property | Consequence nobody has designed for |
|---|---|
| **Recurring but irregular** — "first Sunday", "last weekend of the month", weather-dependent | The entity is a *rule*, not a list of dates. Most competitors store dates as rows |
| **Radius beats boundaries** — nobody cares about city limits, they care about 30 minutes' drive | Every competitor organises by city or postal code. That's an administrative artefact, not user intent |
| **The core question is binary and decays** — "is it on this Saturday?" | The value of the answer collapses to zero after the date. Static listings can't serve this |
| **Data goes stale silently** | Freshness isn't a feature, it's the product's structural integrity |
| **Organisers are amateurs** — clubs, schools, churches, municipalities, not businesses | They will never log into a dashboard. Any organiser tooling that assumes SaaS behaviour fails |
| **Enormous long tail** — ~45,000 events/yr in Germany, most tiny | Coverage cannot be manual. But publishing cannot be automated. That tension is the whole design problem |
| **Strongly seasonal** — March–October | Traffic, freshness needs, and verification effort all pulse annually |
| **Zero transaction, pure information** | No booking funnel to hide behind. The information *is* the product |

---

## Part 2 — The reframe I'd argue for

### Everyone models markets. Nobody models the trip.

The user's atomic unit is not a market and not a date. It's a **plan**: *"Saturday morning, within 40 minutes of me, worth getting up for."*

Every competitor's architecture answers "tell me about this market." None answer "help me decide what to do on Saturday." That's a product gap and a data-model gap, not a page-layout gap.

### Which suggests a better test than "entities get URLs, time never does"

The old rule is a *reaction* to what killed fleafind.ch. It's defensively correct and creatively empty — and flohmarktkompass already ships it, so it differentiates nothing.

A sharper test:

> **A page deserves a URL if there is a question people ask repeatedly, whose answer is stable enough to still be true next time it's asked.**

Run the old cases through it and it gives the same protective answer, for a *better reason*:

| Candidate page | Repeatedly asked? | Answer durable? | Verdict |
|---|---|---|---|
| `/berlin/` (city hub) | Constantly | Yes — the set of Berlin markets changes slowly | **URL** |
| `/markt/mauerpark/` | Constantly | Yes | **URL** |
| `/berlin/14-09-2026/` | Once, by few | No — dead in a week | No URL |
| `/berlin/heute/` | Constantly | **Answer changes daily, question doesn't** | ⚠️ *Genuinely ambiguous — see below* |
| `/berlin/september/` | Seasonally, repeatedly | Reasonably | ⚠️ Worth testing |
| `/berlin/kinderflohmarkt/` | Yes | Yes | **Probably URL** — this is a *facet*, not a date |

The interesting result is that the test **doesn't** automatically kill `/heute/` — it exposes that we conflated two different things. A date-specific URL (`/14-09-2026/`) is disposable. A *standing question* URL (`/heute/`, `/dieses-wochenende/`) is one durable page whose content changes — which is architecturally identical to a homepage, and arguably the single freshest page type we could own.

FleaFind's version failed at **96 city×day/weekend combinations**. One `/berlin/dieses-wochenende/` per major city is a different animal from a 96-page matrix. That distinction was lost when it became a rule.

**Not proposing we build it. Proposing the rule was too blunt and we should think properly.**

### Facets are the unexplored axis

Everyone slices by geography and time. Nobody slices by **what kind of market it is** — Kinderflohmarkt, Antikmarkt, Nachtflohmarkt, Trödelmarkt, Bauernmarkt, Garagenflohmarkt. These are:
- genuinely distinct user intents with distinct search demand
- **stable** (a market's type doesn't change weekly)
- **not time-multiplying**
- a dimension where the long tail has real semantic content

`/berlin/nachtflohmarkt/` is durable, distinct, and searched. This is probably a better second axis than time ever was.

---

## Part 3 — The 2026 layer nobody in this category is touching

### Bots are now the majority of web traffic

Cloudflare Radar: **57.5% of HTML traffic is automated vs 42.5% human**. If a meaningful share of "who reads this site" is an agent, designing exclusively for human eyeballs is designing for the minority.

### WebMCP — the one genuinely new surface

At Google I/O 2026 Google announced [WebMCP](https://developer.chrome.com/blog/chrome-at-io26): a proposed open web standard letting a site **expose structured tools — JavaScript functions and HTML forms — directly to browser-based AI agents**. Origin trial in **Chrome 149**, with Gemini in Chrome support following. Expedia, Booking.com, Shopify, Credit Karma already experimenting.

Instead of an agent screen-scraping our HTML, we'd declare capabilities:

- `find_markets(near, radius, date_range, type)`
- `check_if_running(market, date)`
- `get_next_occurrence(market)`
- `subscribe_to_cancellations(market, email)`

**Why this fits flea markets unusually well:** our core query is a *structured lookup with a binary answer* — exactly the shape agents handle well and HTML handles badly. "Is Mauerpark on this Sunday" is a function call pretending to be a web page.

**Why it's strategically interesting:** it's early enough that being among the first movers in a category is realistic, and no flea-market site will touch this for years. It also sidesteps the AI-Overview zero-click problem — if agents call our tools, we're *infrastructure*, not a scraped source.

**Honest risk:** origin trial = experimental, may not ship, may change. This is a bet, not a plan. But the cost of designing our data layer so the tools are *trivial to expose later* is roughly zero. That's the real move: **build the API-shaped core now, expose it through whatever protocol wins.**

### llms.txt is theatre — worth knowing so we don't waste time

A 300,000-domain study found llms.txt has **no measurable citation effect**, and John Mueller confirmed no AI system currently fetches it. Adoption is real (~10%) but the consumers are IDE agents, not search AI. **Ship it as a cheap afterthought; never treat it as a strategy.** Worth recording precisely because it's what a shallow AI recommendation would tell us to prioritise.

### Cloudflare pay-per-crawl — our data has a second buyer

Cloudflare's [pay-per-crawl / pay-per-use](https://blog.cloudflare.com/content-independence-day-ai-options/) lets sites charge AI crawlers via HTTP 402, and from **15 September 2026** blocks Training and Agent crawlers by default on ad-bearing pages. Cloudflare reports >1 billion 402 responses daily.

Implication worth sitting with: **a verified, structured, genuinely-fresh European flea-market dataset is exactly what an AI company cannot get elsewhere.** That's a potential revenue line that doesn't depend on human traffic at all — and it rewards precisely the expensive thing (real verification) rather than the cheap thing (volume). Very early, probably not year one, but it changes what "the data is the asset" means.

---

## Part 4 — AI as part of the running system, not the build

This is the piece missing from all previous thinking. Not "use AI to build the site" — **the site itself is a continuously-operating AI system.**

Market Watch on FleaFind was version 0.1 of this: read curated sources, propose findings, human reviews. That pattern was right and far too narrow.

### Four loops worth designing

**1. Discovery loop** — agents continuously read aggregators, city calendars, organiser sites, local press, Facebook events. Not to republish (legal + spam risk, see brief §3) but to answer *what exists that we don't have* and *what changed*. Output: a queue of proposals, never a published page.

**2. Freshness loop** — the important one. Every fact carries a provenance and a timestamp. An agent continuously ranks the catalogue by **staleness × traffic × volatility** and works the top of that queue: re-check the organiser's page, diff it, flag changes. Freshness stops being a virtue and becomes a *measured, managed system property*. Given that content <3 months old is ~3× more likely to be AI-cited, this loop is simultaneously the trust engine and the ranking engine.

**3. Content loop** — the risky one. Agents can draft, but if drafted text ships unedited we have literally built the scaled-content violation. **Proposed hard line: AI writes nothing that publishes without a human deciding.** AI's job is to find, structure, verify and *propose*; a person's job is to decide. This is the one place where I'd argue *for* a constraint — not for compliance theatre, but because it's the only thing that keeps us on the right side of the line that killed v1.

**4. Performance loop** — agents monitor GSC/analytics per page type, spot the page type that's decaying, and surface it. Instead of "SEO tripwires reviewed weekly" as a human chore, the system watches itself and escalates. This is where fleafind.ch's failure was most expensive: the collapse took days to even notice.

### The compounding idea

Each loop makes the next cheaper. Discovery finds a market → freshness verifies it → performance measures whether its page earns its existence → the answer feeds back into what discovery should look for. **A site that gets more accurate the longer it runs is a genuinely different asset than one that decays** — and decay is the default state of every competitor in this category.

That, rather than any URL structure, might be the actual moat.

---

## Part 5 — What I'd steal from the big players (principles, not layouts)

- **Airbnb**: page count is fine at any scale *if each page is backed by distinct real inventory*. 1.1M pages, multiple schema types per page (LocalBusiness + Product + Review + FAQ), heavy internal linking. The lesson isn't "go programmatic", it's *distinct inventory per page is the whole permission structure*.
- **Booking.com**: relentless internal linking between geographic levels; every page answers the question it ranks for **above the fold**. Also now a WebMCP early adopter — worth watching what they expose.
- **Songkick / Eventbrite**: closest structural analogue (recurring events, venues, artists). Worth a proper teardown of how they handle the entity-vs-occurrence problem — *not yet done*.
- **TheFork**: local + facet navigation done well.

**Not yet researched, should be:** Songkick's occurrence model in detail; how Google Local/Events surfaces choose sources; what Booking actually exposes via WebMCP.

---

## Part 6 — Open questions I'd want answered before any architecture is chosen

Mine, not Delfim's — these are the ones I think are load-bearing and unasked:

1. **Is the primary consumer of this site in 2027 a human or an agent?** The answer changes everything. If it's substantially agents, HTML is a rendering target and the API is the product.
2. **What's the atomic entity — the market, or the market-in-a-radius-at-a-time?** If "the trip" is the real unit, our data model looks different from everyone's.
3. **How do we represent recurrence?** Open question, not resolved.

   An earlier draft of this file argued for storing recurrence as a *rule* ("every Sunday, March–October") instead of as rows of dates. **Delfim pushed back and was right to** — that framing confused storage with display, and skipped past what users actually need:
   - People search for and filter by **specific dates**. "Flohmarkt Köln 14. September" is a real query shape.
   - The site has to show concrete dates clearly. "Every Sunday, all year" is not an acceptable answer to someone planning a Saturday.
   - Filtering by date range requires dates to be queryable, whatever the underlying storage.

   So the real open question is narrower and less exciting: *what's the cheapest way to keep a large number of concrete dates accurate?* Rules may be part of that answer, or may not. **Not deciding this until we understand how people actually search** — see §Part 7.
4. **What's the smallest unit of verified truth?** A market's existence? A single date? An opening time? Provenance granularity determines whether the freshness loop is possible at all.
5. **Can the freshness loop be genuinely autonomous, or does every change need a human?** This is the throughput ceiling on Europe-wide coverage. Probably the single most important operational question.
6. **What do we do when a competitor scrapes us?** We'll be the freshest structured dataset in the category. That's a target.
7. **Seasonality:** March–October is the season, SEO needs months of lead. What does the site *do* in winter?

---

## Part 7 — What the German evidence changed (2026-08-27)

Autocomplete probing of the real German market (`SEARCH_BEHAVIOUR.md` Part 2) tested several ideas in this file. Results:

### Validated

- **Radius over administrative boundaries (Part 2).** `in der Nähe` is the **#1 or #2 suggestion for nearly every seed term** — #1 for both `kinderflohmarkt` and `hallenflohmarkt`. This was the weakest-supported idea in the file and is now the best-supported one.
- **Facets as an axis (Part 2).** Real, and richer than expected: each facet has a *different* shape. `hallenflohmarkt` is venue-led, `nachtflohmarkt` is city-led, `trödelmarkt` is an NRW dialect term rather than a synonym. A single generic "category" dimension would flatten something that isn't flat.
- **Freshness as the product (Part 4, loop 2).** `flohmarkt jetzt geöffnet` — *open now* — is the #1 expansion of "flohmarkt jetzt", and recurs throughout the proximity cluster. This is a real-time question no static competitor can answer. **The freshness loop now has a user-facing query to point at, not just an SEO rationale.**
- **Vendor thesis (`IDEAS.md` §1).** `flohmarkt stand mieten` is the #1 expansion of "flohmarkt stand"; `flohmarkt anmelden` returns ten cities. Demand is measurable. Willingness to pay is still not.

### Changed

- **The "durable question" test (Part 2) survives but needs a second condition.** German data shows large demand for region × time (`flohmarkt nrw heute`, `flohmarkt bayern 2026`) — multiplied pages that are clearly wanted. Swiss data showed city × weekday as the worst page type on the site. The reconciling factor is **content density, not dimensionality**: `nrw heute` has dozens of markets behind it, `aarau sonntag` has zero or one.

  Revised: *a page earns its URL when the question is durable **and** the cell behind it is reliably full.* Both conditions, and the second one is machine-checkable at build time — which the old blanket rule was not.

- **A geographic level we had no evidence for.** Bundesland (`nrw`, `bayern`, `niedersachsen`, `hessen`, `saarland`) is a major query layer in Germany. Swiss cantons never surfaced it. Any geography model needs this level as a first-class citizen, not an afterthought.

- **Holidays are a temporal facet.** `flohmarkt niedersachsen pfingsten`. Recurring, durable, searchable — and completely absent from every previous version of this thinking.

### Still unknown

- Absolute volumes (autocomplete gives rank, not size) — Keyword Planner.
- Whether `hallenflohmarkt` actually peaks in winter — Trends, not autocomplete. The indoor/winter idea remains untested.
- Where the content-density threshold sits.
- Why `heute` ranked so badly for fleafind.ch when it is Germany's #1 suggestion. **This is now the most important open SEO question** — `heute` + `in der Nähe` + `jetzt geöffnet` together look like the centre of German demand, and we have no evidence we can win any of them.

---

owner: Delfim
last_reviewed: 2026-08-27
status: thinking, nothing decided
