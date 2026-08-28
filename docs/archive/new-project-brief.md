# New Project — Working Notes

Status: **thinking, not building.** Started 2026-08-27, the week fleafind.ch lost ~97% of impressions.
Owner: Delfim. This file captures decisions, open questions, and risks as they are made — not a plan of record yet.

Companion files: `new-project-considerations.md` (the thinking that precedes decisions) · `IDEAS.md` (parked, not committed).

---

## 1. Why a new project at all

- fleafind.ch collapsed ~97% (3,346 → 89 impressions) on 2026-08-22, the day after Google's Aug 18–21 spam update completed.
- No manual action. No technical fault. No deploy in the window. **Cause is now well-supported — see `COLLAPSE_CAUSE.md`.** Mechanism verified in the repo: occurrence pages had NO future-date cap until 10 Aug 2026, multiplied by 4 locales (de/fr/it/en). One weekly market = 52 dates x 4 locales = 208 URLs. That produced the ~8,500 URLs behind 157 markets (~60:1). The cap shipped 8 days before the spam update launched — too late to be recrawled. Google's announcement excluded link spam and site reputation abuse, narrowing the policy surface onto doorways and scaled content, which the city x time x locale matrix matches almost verbatim.
- `.ch` was always going to cap expansion. The rebuild was already planned for end of 2026; the collapse changed its timing, not its direction.
- fleafind.ch **stays online, unchanged**, as a control experiment. Read-out date: when the next spam update completes (est. Oct–Dec 2026).

---

## 2. Decisions that feel settled

| Decision | Reasoning |
|---|---|
| New domain, new brand | `.ch` caps expansion; brand was always temporary |
| Do NOT redirect fleafind.ch → new domain | Redirecting a suppressed site into a fresh domain risks importing the problem |
| Name must be portable, not German | The whole point is escaping a geographic ceiling. A German name repeats the mistake one level up. Local warmth comes from tone of voice and copy, not the name (Vinted/Etsy/Airbnb mean nothing anywhere) |
| Analytics from commit one | FleaFind couldn't answer basic questions during the crisis |
| Newsletter from day one, as a real product | 10 subscribers in 6 months was a failure of value proposition, not of channel |
| Organiser contact as a primary CTA | The one genuine moat: relationships produce unique data competitors can't copy |
| Never be ~100% Google-dependent again | One update erased the business overnight |
| **Architecture is deliberately NOT decided yet** | Decided 2026-08-27. The URL structure, page types and data model need real research and real thinking, not a fast copy of what incumbents do. §4 records what we learned from FleaFind as *evidence*, not as rules to obey. See `ARCHITECTURE_IDEAS.md` |
| Free for users, always — no subscriptions, no paywalls | Distribution lever against subscription competitors (Fleamapket): lower friction, bigger funnel. Not a defensibility claim on its own — monetization is supply-side (§7), not user pricing |
| **Europe-wide from day one** | Decided 2026-08-27. The whole point of leaving `.ch` is escaping a geographic ceiling; building single-country first would repeat the mistake structurally. Data model, URL structure, i18n and domain strategy are all designed for multi-country from commit one. See §4a for the constraint this places on *publishing* |
| **Organiser page from day one, as a core surface** | Decided 2026-08-27. Not a footer link, not phase 2. Even if v1 is only "contact us by email", the organiser relationship is the moat and the surface must exist from launch so the relationship can start accumulating immediately |
| **Monetization and commercial commitments deferred** | Decided 2026-08-27. Build the hooks (claim-listing flow, featured slots, view counters), defer the machinery. Nothing about the product is to be shaped around unproven revenue assumptions. Parked in `IDEAS.md` §3 |

---

## 3. Data strategy — the two-layer model (resolved 2026-08-27)

The distinction that matters is **not** automated vs. manual. It is what ends up published.

### Discovery layer — automated, broad, fine
Automated reading of aggregators, official sources, and city calendars to answer two questions:
- **What exists that we don't have?** (a market in Kassel we've never heard of)
- **What changed?** (Mauerpark's date moved; this market was cancelled)

~20 aggregator pages monitored weekly is far cheaper than checking 300 individual sources — this is the efficiency argument, and it's sound. This is what Market Watch already did on FleaFind: read curated source URLs, propose findings, human reviews. That pattern ports directly.

### Record layer — sourced independently, always
The published page's data comes from the **organiser, the city, or an official source** — never from a competitor's listing. Descriptions are written by us. Verification status is our own.

### Why the line sits exactly there

| Concern | Discovery layer | Bulk republishing |
|---|---|---|
| Google spam policy ("Scraping": *republishing content from other sites without adding original content or value*) | Not triggered — nothing of theirs is published | **Named violation** |
| EU database right (sui generis protection over compiled databases) | Not triggered — facts researched, not compilation copied | **Legally actionable in the EU** |
| Organiser moat | Reinforced — we still need and want the relationship | **Destroyed** — we took their data, then ask for a relationship |
| Differentiation | Data becomes *better* than the aggregators' | **Identical to FlipTip AI, inferior to Fleamapket** |
| Accuracy | Organiser-sourced dates beat third-hand ones | Inherits everyone else's errors |

**Bottom line:** aggregators tell us *where to look*. Organisers and official sources tell us *what's true*. The published page is ours. This is faster than the Swiss approach and doesn't repeat the pattern that may have just killed fleafind.ch.

---

## 4. What we learned from FleaFind — evidence, not law

**Nothing here is a rule. Nothing here is decided.** These are observations from a site that collapsed, with the evidence attached, so that whatever we design next is designed *knowing* them. The architecture for v2 has not been chosen and will not be chosen quickly — see `SEO_ARCHITECTURE_RESEARCH.md` and `ARCHITECTURE_IDEAS.md`.

Each item below states what we saw, how confident we are, and what would change our mind. When the evidence changes, the item changes. That is the point.

| Observation | Evidence | Confidence | What would change it |
|---|---|---|---|
| FleaFind's URL-to-market ratio was extreme (~60:1 — ~8,500 URLs / 157 markets) | Direct count | **Fact** | Nothing; it's measured |
| ~~Time-based URLs were the least efficient page type~~ **Superseded — see below** | — | — | Already changed |
| **Multiplied page types (city×date, city×weekday, market×date) underperformed badly; single-dimension pages did fine** | GSC clicks/page: place hub 25.5, month 11.5, date 5.0, weekday 4.8 **vs** date×city 1.9, market×date 1.5, weekday×city 1.0. See `SEARCH_BEHAVIOUR.md` §3 | **High** | Larger samples for month/weekday page types |
| Standalone date pages had the **highest CTR on the site** (14.8%) and beat market hubs on clicks/page | GSC, `SEARCH_BEHAVIOUR.md` §2 | **Medium-high** (25-page sample) | German data showing different behaviour |
| Occurrence pages were the actual bloat — 531 pages at 1.50 clicks/page | GSC | **High** — but they carried 795 clicks | Whether consolidated pages recapture that intent. Untested |
| **~250 pages produced 92% of all clicks; ~7,750 of ~8,500 URLs produced essentially nothing** | GSC concentration analysis, `SEARCH_BEHAVIOUR.md` §13 | **Measured fact** | Nothing; it is counted |
| The dead pages were thin **by construction** — created by crossing lists, before knowing whether the cell had content | Inference from the above + which page types died | **Strong hypothesis** | A competitor thriving on the same pattern would weaken it — see `SEARCH_BEHAVIOUR.md` §19 |
| Search in this category is overwhelmingly temporal — 65% of clicks carry a time signal; "city + 2026" alone is 47% of clicks | GSC query analysis, `SEARCH_BEHAVIOUR.md` §1 | **High** for Switzerland | German market unverified |
| City hubs and market pages were the workhorses | GSC: 293 and 78 impressions/page | **High** | New page types could beat them; unknown until tried |
| Empty/thin pages at scale are the shape that gets classified as scaled content | [Google's definition](https://developers.google.com/search/docs/essentials/spam-policies); directory sites hit hardest in 2024 updates | **High** | Nothing likely; this is the core lesson |
| Locale matrices without content behind them were waste | FleaFind experience | **Medium** | — |

**Two corrections already needed** — both found within a day of writing this section, which is the argument for keeping it as evidence rather than law:

1. It claimed "no per-occurrence pages" was *"Google's own recurring-event guidance."* Wrong — Google's Event docs say each event **must** have a unique URL. See `SEO_ARCHITECTURE_RESEARCH.md` §0.
2. It judged page types by **impressions per page** and concluded date/period pages were bloat. Re-running the same data by **clicks per page** reverses that: standalone date pages outperformed market hubs and had the highest CTR on the site. The real bloat was occurrence pages and the city×time matrix. See `SEARCH_BEHAVIOUR.md`.

The corrected lesson is not *"time never gets a URL."* It's:

> **The problem was neither page count nor writing quality. It was that pages were created by combination rather than by content.**
>
> A page like `/maerkte/sonntag/aarau` existed because "sonntag" × "aarau" is a valid combination — not because there was anything to put on it.
>
> The inversion: **a page should exist because there is content for it, not because a URL pattern permits it.** Same page type, different instances — `flohmarkt nrw heute` has dozens of markets behind it and is a real page; `flohmarkt aarau sonntag` has nothing and should never be generated. This is checkable by a machine at build time, which a page-count budget never was.
>
> German evidence refines it further: demand for region × time is large, so multiplication itself is not the sin — empty cells are. See `SEARCH_BEHAVIOUR.md` §14, §16.

### The only thing that behaves like a commitment

Not a rule about URLs — a rule about **how we decide**:

> Any new indexable page type is tried small, measured against real data, and kept or killed on evidence. Nothing scales before it's proven, and nothing is permanent once it is.

That's revisable too. But it's the mechanism that lets everything else stay revisable safely.

## 4a. Europe-wide, without rebuilding the thing that got us killed

*Working position, not settled.* Europe-wide from day one (§2) and "never get classified as scaled content again" pull against each other. The current best resolution is a line between **built for** and **published**:

- **The system is Europe-wide from commit one.** Country/region/city/venue/market/occurrence as distinct entities. Domain and URL structure (`/de/`, `/at/`, `/fr/`) decided and written down now, not retrofitted. i18n architecture complete. No geography assumptions baked anywhere.
- **A page exists only when it has real content behind it.** No pre-generated country/city shells waiting to be filled. An empty city page is exactly the "many pages, little value each" shape that gets classified as scaled content — the failure mode we are explicitly building to avoid.
- **Coverage expands as fast as real data arrives**, and no faster. The ceiling is removed; the pages still have to be earned.
- **CI enforces it.** URL-to-entity ratio computed on every build, build fails past threshold. Also: fail the build on any published page below a minimum-content bar. Rules not enforced by machines drift.

This is the difference between *scaling* (organic, data-backed) and *scaled content* (generated, thin). Google's spam policy targets the second. Same ambition, without the pattern that may have killed fleafind.ch.

### Evidence from FleaFind's own GSC data (28 days pre-collapse)

| Page type | Pages | Impressions | Per page |
|---|---|---|---|
| City hub | 53 | 15,509 | **293** |
| City × day/weekend | 96 | 8,395 | 87 |
| Market hub | 216 | 16,850 | 78 |
| Occurrence (market+date) | 484 | 11,554 | 24 |
| Discovery (date/period) | 146 | 2,119 | **15** |

City hubs were ~4× more efficient than market pages and ~20× more efficient than date-discovery pages. **City hub + market page are the two workhorse types.** Everything else was inefficient page-count bloat.

Note the honest cost: the page types to be deleted carried ~37% of total impressions. The bet is that consolidated pages recapture that intent. Probably right, but it is a bet.

---

## 5. Competitive reality (checked 2026-08-27)

| Player | Scope | Position |
|---|---|---|
| **Fleamapket** | 1,200+ markets, 50 countries, iOS+Android | **Occupies the curated-global-editorial position already.** Claims hand-picked, locally reviewed, "written by someone who has actually been there" |
| **FlipTip AI** | 155+ countries, AI-generated, monthly refresh | The automated-breadth version. What Strategy A would compete with |
| marktcom.de | Germany, legacy portal | Organiser logins, stall booking, 1990s UX |
| flohmarkt-termine.net | Germany, since 1996 | Coverage, thin listings |
| FlohScout | Germany, app | Modern UX, crowdsourced, weak web/SEO surface |
| flohmarktkalender.ch | Switzerland | Thin listings — **still outranks fleafind.ch today** |

**"Nobody is doing this Europe-wide" is false.** Any positioning built on that premise needs rework.

---

## 6. Product ideas to keep

**Committed (decided 2026-08-27):** the organiser surface ships with v1. Minimum viable version is a real page — what we do, why an organiser should care, contact by email — plus organiser contact visible on market pages. Claim-your-listing and self-service tooling come later, but the page and the inbound path exist from launch. Everything below this line is still uncommitted.

- Organiser CTA as a primary conversion path — dedicated page, contact details visible, "claim your market" flow.
- "Advertise with us" surface for secondhand shops / local businesses — from the beginning, not bolted on later.
- Verification status displayed per listing (confirmed by organiser / verified by us + date / official source / unconfirmed). Honest at scale.
- Cancellation alerts — the category's shared pain, and a natural email capture with a real reason.
- Mobile-first, hard: FleaFind ran ~82% mobile (1,400 vs 310 clicks).
- Real photography from verification visits. No stock, no AI images.
- Ports well from FleaFind: photo cards, DateNav, detail layout, admin, catalogue pipeline, JSON-LD slot architecture.

## 7. Monetization notes

- **No end-user pricing, ever.** The product is free; revenue comes from the supply side (organisers, local businesses), not the demand side. Settled 2026-08-27 — see §2.
- **AdSense is pocket money at realistic traffic** (~€15–30/month at FleaFind's peak of 5k users). Not a plan. Revisit past ~100k pageviews/month, never on market pages.
- Organiser featured listings and local business advertising are the plausible year-one revenue.
- **Test monetization before/while building, not after traffic arrives.** FleaFind reached 5k users/month and never tested whether anyone would pay. Do not repeat.
- Commercial partner (10y HP) owns this. Roles, time commitment, and split need to be agreed **in writing** before real work starts.

---

## 8. Open questions

1. **Given Fleamapket exists** (1,200 markets, 50 countries, curated editorial, apps since ~2020) — what is the actual defensible position? Recurring local markets vs. their iconic-destination focus? Depth per market? Organiser tooling nobody offers? **This is the most important unanswered question; everything downstream depends on it.**
2. Partner terms: time commitment, equity/revenue split, what happens at a pivot. Agree in writing before real work starts.
3. Name: must be portable. Trovado-class direction; needs trademark check (DPMA/EUIPO) — flagged Trivago adjacency risk.
4. ~~Scope: Europe-wide from day one vs. one region saturated first.~~ **Resolved 2026-08-27: Europe-wide from day one.** The density argument in `new-project-considerations.md` §2 is noted and overridden deliberately — see §4a for how the architecture keeps this from becoming thin coverage. Still worth deciding: which geography gets the first real depth, since verification visits and organiser handshakes price by travel time.
5. Real German/EU search volumes — never verified with Keyword Planner.
6. fleafind.ch control read-out: what do we do when the next spam update completes?

---

## 9. Discipline reminders

- **Everything needs a reason.** No colour, word, page type, or feature ships because it seemed nice.
- **Pre-commit decision gates** with continue/pivot/stop thresholds, decided while nobody is tired or attached.
- Founder burnout is a live, named risk. A plan requiring a team of eight is a failed plan.
- Don't start everything on Monday. The cheapest next step is the one that tells you whether to keep going.
