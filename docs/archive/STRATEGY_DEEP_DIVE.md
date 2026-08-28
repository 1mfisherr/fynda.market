# Strategy Deep Dive — The Moat, the Business, and the Sequence

Written 2026-08-27, against the whole docs folder, the raw GSC data (re-analysed independently), Google's own documentation, and outside-category research. Companion to `new-project-brief.md` §8 Q1 — this document exists to answer it.

**Epistemic labels used throughout:** `[MEASURED]` = counted in our own data or observed directly on a live page · `[VERIFIED]` = confirmed against a primary source today, URL given · `[REPORTED]` = third-party claim, source given, not independently confirmed · `[INFERENCE]` = reasoning from verified facts · `[SPECULATION]` = flagged as such.

**Data re-verification:** before writing this, the 90-day GSC exports were re-analysed from the raw CSVs with node. Results: temporal-signal share of clicks **64.6%**, top-250 pages **91.2%** of export clicks, **422 zero-click pages** in the top 1,000. `SEARCH_BEHAVIOUR.md`'s numbers (64.8% / ~92% / 422) reproduce. The prior analysis is trustworthy. `[MEASURED]`

---

## 1. The diagnosis: "easily replicable" is exactly right — and it decides everything

Delfim's sentence — *"this is very easily replicable"* — is the most important sentence in the docs folder, and the rest of the folder does not yet take it seriously enough.

The evidence that replication cost has collapsed is sitting in the competitor table:

- flohmarktkompass.de already ships the "correct" architecture (entities get URLs, dates as params). `[MEASURED — SEO_ARCHITECTURE_RESEARCH.md §3]`
- flohmarktradar.de already ships "free for organisers, separate organiser portal." `[MEASURED — same]`
- meine-flohmarkt-termine.de already ships a cancellation tracker and a PLZ-segmented newsletter — observed directly today. It is run by Kampagne Spezial GmbH, copyright 2004–2026, with 30+ events listed for today alone and dates through September. `[MEASURED — fetched 2026-08-27]`
- heuteflohmarkt.de already occupies the highest-demand query cluster by name.
- FlipTip AI already ships the 155-country automated version.

Every strategic idea currently in the docs — clean entity architecture, freshness, organiser CTA, newsletter, cancellation alerts — **is already shipped by at least one competitor.** Several of those competitors appear AI-built, which means they were built from the same recommendation space any model draws on. This is the structural fact of 2026: when the marginal cost of building the artifact approaches zero, the artifact's value approaches zero, and every plan of the form "build a better artifact" is a plan to be commoditised.

The consequence, stated as a principle because everything below derives from it:

> **When software is free, the moat is the part of the business that is not software.**
> An AI-built competitor is, by definition, a competitor with zero non-software assets. The only durable advantages left are the ones AI does not make cheaper: relationships that must be earned one at a time, delegated access that must be granted, history that must be lived through, and liquidity that must be bootstrapped.

Corollary worth internalising: this also means the collapse of fleafind.ch, while painful, destroyed almost nothing of durable value — because the site was almost entirely software and content. The rebuild should be designed so that a second collapse *would* leave something standing.

---

## 2. Q1 — What is the actual moat?

Not one thing. Four assets that compound, stacked on one unglamorous capability. None of them is "the directory."

### Layer 1 — The organiser channel graph (the asset competitors cannot scrape)

Not "organiser relationships" as the brief has it — that phrasing is too soft and has let the idea stay vague. The asset, precisely: **a verified, answering, low-latency communication channel to each organiser** — the WhatsApp number or phone number that responds within hours, attached to each market, with a track record of responses.

Why this is the root asset:

- The category's core question ("is it on?") is decided by an amateur human — a club treasurer, a school secretary, a city clerk — often the evening before, sometimes the morning of, and announced *wherever that human happens to post* (`IDEAS.md` §2's examples: town website, school site, village app). `[MEASURED — examples cited in IDEAS.md]`
- **"Jetzt geöffnet" is not a data-freshness problem. It is a communications-routing problem.** The answer originates in one human's head; whoever owns the pipe from that head to the public record owns the category's ground truth. No crawler, however good, can beat being the first entity the organiser texts.
- AI has collapsed the cost of *processing* information. It has not collapsed the cost of *originating* it. The origination point here is 6,000 amateur humans, reachable only by labor.

Scaling economics `[VERIFIED]`: the supply side is not uniformly fragmented. Deutsche Marktgilde eG alone operates ~110–120 market locations with ~240–260 market days weekly, and runs Marktgilde Events UG specifically for flea markets ([marktgilde.de](https://www.marktgilde.de/), [Wikipedia](https://de.wikipedia.org/wiki/Deutsche_Marktgilde)). Municipalities are themselves multi-market organisers. A power-law of operators means **~50 relationships could plausibly cover 20–30% of a region's market-days** — the channel graph is more buildable than "6,000 organisers" suggests. (Exact concentration for *flea* markets specifically: unknown, worth measuring in the pilot. `[INFERENCE]`)

### Layer 2 — Delegated platform access (the switching cost nobody in the category has built)

A relationship in a CRM is not a moat; the organiser can talk to anyone. What is a moat is **being granted standing access to the market's presence on platforms the organiser cannot or will not operate themselves**:

- Manager access to the market's Google Business Profile / Maps listing (see §4 — this is far more available than the docs assumed).
- Being the market's de facto webmaster: the page that the organiser tells people is "our page," because they have no other.
- Administering the market's cancellation broadcast channel (WhatsApp channel/group per market or region).
- Later: holding the vendor waiting list (see Layer 4 — this is the OpenTable move).

Each grant is small. In aggregate they are the difference between "a site about markets" and "the infrastructure the markets run on." An AI-built competitor can clone the site in a weekend. **They cannot clone 300 GBP manager seats, 300 "this is our official page" endorsements, or 300 WhatsApp habits** — each one requires a human at the other end to say yes, one at a time. This is what switching cost looks like when the supply side is amateurs: not contract lock-in, but *"the alternative is doing it myself, which I never wanted to do."*

### Layer 3 — The occurrence ledger (the data asset that compounds and cannot be back-filled)

Anyone can scrape the current *state* of the category (which markets exist, next dates). Nobody can scrape its *history*, because nobody is recording it:

- Which occurrences actually happened, which were cancelled, when the cancellation was decided, and why (weather, permits, organiser illness).
- Per-fact provenance and confirmation latency ("organiser confirmed via WhatsApp, 2026-09-12 07:40").
- Real recurrence behaviour vs. stated recurrence ("first Sunday" markets that actually skip August).

This is a **time-based moat: a competitor starting in 2028 cannot possess 2026–27, at any price.** Its value shows up in three places: (a) prediction — cancellation-risk and reliability scores no one else can compute; (b) trust — "verified, and here is the track record" beats "verified" as a claim; (c) licensing — in the pay-per-crawl era (Cloudflare blocking AI crawlers by default, HTTP 402 monetisation — [Cloudflare](https://blog.cloudflare.com/content-independence-day-ai-options/) `[REPORTED]`), a provenance-clean, organiser-sourced, historically-deep dataset of European recurring markets is exactly what an AI company cannot get elsewhere. And because the record layer is organiser-sourced (brief §3), **the EU database right runs in our favour offensively, not just defensively** — competitors extracting the compilation are actionable; we are the rights-holder, not the infringer. `[INFERENCE from the two-layer model]`

The ledger costs almost nothing extra to build — it is a schema decision (every fact carries provenance + timestamp; nothing is ever overwritten, only superseded) made in week one. This is the single cheapest moat-relevant engineering decision available.

### Layer 4 — Vendor↔organiser liquidity (the only true network effect on offer)

The visitor directory has **no network effect at all**: visitor #10,000 makes the product no better for visitor #10,001. This is the structural reason directories are weak businesses. The vendor thesis (`IDEAS.md` §1) is the only place in this category where a real cross-side effect is available: more vendor demand → organisers engage (vendors are revenue to them) → better coverage and data → more vendor demand.

The docs already establish demand is visible (`flohmarkt stand mieten` #1 expansion `[MEASURED]`) and that every booking system is single-market `[MEASURED]`. What the docs have not said: **Deutsche Marktgilde's entire business is renting spaces from municipalities and subletting stalls to vendors** ([marktgilde.de/marktgilde-fuer-beschicker](https://www.marktgilde.de/marktgilde-fuer-beschicker/) `[VERIFIED]`). The vendor-side aggregation business exists offline, profitably, at scale, for Wochenmärkte. Nobody has built its digital, cross-organiser version for flea markets. That is as close to a validated model as this category offers. (Vocabulary note: the trade term is *Beschicker*; use it with organisers.)

The MVP costs nothing: a "Stand anfragen" form on each pilot market page, forwarded by hand to the organiser via the Layer-1 channel. Every forwarded vendor is a gift to the organiser that makes the next ask (GBP access, date confirmations) easier. **Vendor demand is the currency that buys organiser relationships.**

### Layer 0 — The ops playbook (boring, and the only truly AI-proof part)

Underneath all four: a repeatable, documented process for onboarding amateur organisers — the call script, the WhatsApp cadence, the QR poster, the in-person visit, the "your listing got 1,240 views" report. This is agency work. It is unglamorous, O(human-hours), and does not demo well. That is precisely why it is defensible: it is the part a generic model cannot execute and an AI-built competitor will not do. The plan must budget real hours for it (see §7) and cap them, because the same property makes it the burnout vector.

### What is explicitly NOT a moat (so nobody re-argues it later)

| Claimed moat | Why it isn't one |
|---|---|
| Clean SEO architecture | flohmarktkompass ships it; it is hygiene `[MEASURED]` |
| "Freshness" as a feature | A crawler-based competitor can approximate it; only Layer 1 makes it structural |
| Free for users / free for organisers | flohmarktradar is already both `[MEASURED]` |
| Cancellation alerts as a feature | meine-flohmarkt-termine already runs a cancellation tracker `[MEASURED — observed today]`; only the *broadcast channel + organiser pipe* version is defensible |
| Brand/entity authority | Real but 3+ years out; an outcome of the above, not an input |
| Content quality / photos | Raises replication cost by weeks, not years |

---

## 3. Q2 — What business is this actually?

### The reframe

The docs still frame the venture as *a directory with an organiser feature*. The evidence supports the inversion:

> **This is a distribution-and-truth infrastructure business for amateur recurring-event organisers. The directory is one renderer of the database, the demand-proof, and the front door — not the business.**

The argument, from the docs' own findings:

1. The largest demand pool (heute / in der Nähe / jetzt geöffnet) is probably structurally unwinnable via organic web pages (§17 inference, partially confirmed in §4 below). If the biggest prize can't be won by ranking pages, a page-ranking business is built on the smaller prize.
2. Demand-side revenue is measured at ~nothing (AdSense €15–30/month at peak `[MEASURED]`), and user subscriptions are ruled out by decision. All plausible revenue is supply-side. A business whose revenue, moat, and data source are all on the supply side *is* a supply-side business.
3. The one genuinely new 2026 surface (WebMCP, agents at 57.5% of traffic) rewards being an API/infrastructure, not a destination. `[REPORTED — ARCHITECTURE_IDEAS.md Part 3]`

### What the organiser actually buys (the product, concretely)

Not a dashboard — the docs are right that amateurs won't log in. The product is a service with a WhatsApp-grade interface: **"Tell us once — we handle your visibility everywhere."**

1. **Presence:** your market on Google Maps (created/claimed GBP where eligible, §4), on our site, with Event markup feeding Google's events surface, correct everywhere. Amateurs experience this as magic; agencies charge real money for it; nobody offers it for markets.
2. **Cancellation broadcast:** one WhatsApp message from the organiser to us → site updated, `eventStatus: EventCancelled` pushed, subscribers alerted via the market's channel. Solves their worst morning (angry visitors at a rained-off market) and our data problem in the same motion.
3. **Vendors:** we send them Beschicker (Layer 4). The only offer that *makes* them money.

Revenue: modest per-organiser fees (€10–30/month or per-season invoices — invoicing is normal at this ticket, per considerations §11), local business placements later, data licensing later still. Critically, **this revenue model works at zero Google traffic** — it is sales-driven, not CPM-driven, which is the real fulfilment of "never be ~100% Google-dependent again." The current docs treat that requirement as a distribution problem (get a newsletter); it is actually a business-model problem (don't sell eyeballs).

### Is "flea markets" even the right category?

Challenge accepted, answer: **yes as brand, no as architecture.** The infrastructure (recurring-event entities, provenance ledger, organiser channels, GBP management, cancellation broadcast) generalises to Wochenmärkte, Basare, Weihnachtsmärkte — meine-flohmarkt-termine already lists 70+ event types, which shows where generic-breadth leads: a database with no identity. The counter-move: keep the *brand* sharply "the flea market people" (identity, du-culture warmth, an audience that self-identifies), keep the *schema* event-type-agnostic, and let adjacent types in only when an organiser brings them ("can you also do our Weihnachtsmarkt?" — yes). Category focus is a brand strategy; category generality is a data-model strategy. They are compatible.

### The honest bad-idea case

If the answer to "what business is this" were "a consumer flea-market directory monetised by ads," the correct strategy would be **don't build it**: no network effect, dead CPM economics, zero-click SERPs, and AI-built competition at zero marginal cost. The venture is only rational as the infrastructure play — and that play rests on one unproven assumption: **that German amateur organisers will engage** (grant access, confirm dates, accept vendors). Everything else is verified or cheap. That assumption is testable in two weeks for approximately €0 (§7, Gate G1). If it fails, the finding is that this category cannot support a defensible business at solo scale, and the right move is to stop — before architecture, before brand, before code.

---

## 4. Q3 — What Google's own documentation actually allows (two findings that change the plan)

### Finding 1: Google's events surface is live in Germany — and per-event pages are the ticket in

From the [Event structured data documentation](https://developers.google.com/search/docs/appearance/structured-data/event) `[VERIFIED 2026-08-27]`:

- The event search experience is available in a listed set of regions **including Germany** (also AU, BR, CA, IN, ES, UK, LatAm).
- *"Each event MUST have a unique URL (a leaf page) and markup on that URL"* and the experience *"only supports pages that focus on a single event."*
- Integration paths: your own markup, **or third-party platforms already integrated with Google** (ticketing/social platforms), or CMS plugins.
- `eventStatus` supports `EventCancelled` / `EventPostponed` / `EventRescheduled` — cancellation state is a first-class, machine-readable field.

Implications:

- **`SEO_ARCHITECTURE_RESEARCH.md` §0 was right to flag this as load-bearing, and `ARCHITECTURE_PROPOSAL_V1.md` §6 currently trades it away silently.** "No occurrence pages" forfeits the one Google surface where a recurring market can appear *above* the classic organic results in exactly the temporal queries that carry 65% of clicks — in the country where we're launching. That trade must not be made by default.
- The reconciliation with the thing that killed fleafind.ch is narrower than it looks. fleafind's occurrence pages were a **permanent archive**: 531 URLs, past dates included, 1.50 clicks/page `[MEASURED]`. An events-surface implementation is a **rolling window**: leaf pages only for *organiser-confirmed* occurrences in the next ~60 days, each carrying full Event markup, expiring (410 or redirect to market page) after the date. For ~200 launch markets that is ~200–500 live URLs at any moment, every one backed by a verified real-world event. Different animal, same species name — which is why the blanket rule keeps misfiring.
- Sequence per the existing probation mechanism: first test option 2 (single next-occurrence Event on the market page) on ≤10 markets and watch GSC's event appearance report; if Google's "single event focus" wording bites, graduate to the rolling-window leaf pages on the same ≤10 markets. Decide on data, not doctrine.
- Note the third-party path: platforms already integrated with Google feed the events surface automatically. Cheap experiment: post 2–3 pilot markets through such a platform and observe whether they appear in Germany's event experience. `[INFERENCE — worth one afternoon]`

### Finding 2: recurring markets CAN be on Google Maps — the §17 inference is partially wrong

`SEARCH_BEHAVIOUR.md` §17/§18 inferred "markets are events, not businesses, mostly no GBP, so the Local Pack returns shops." Direct checks today:

- [Maps place eligibility policy](https://support.google.com/contributionpolicy/answer/12473822) `[VERIFIED]`: eligible — *"seasonal businesses that re-open in the same location"* and *"places of interest and tourist attractions."* Ineligible — *"temporary, one-time events"* and *"seasonal/recurring businesses without a permanent location."*
- [GBP eligibility](https://support.google.com/business/answer/3038177) `[VERIFIED]`: in-person contact during stated hours; signage/permanence emphasised.
- Precedent `[MEASURED via third-party mirrors]`: **Flohmarkt am Mauerpark has its own Google Maps listing — 4.2★, 300+ Google reviews** ([mirror](https://wanderlog.com/place/details/88961/mauerpark-flohmarkt)); "Farmers Market" exists as a selectable GBP category in the US ([findhomegrown.com](https://findhomegrown.com/blog/google-business-profile-food-business) `[REPORTED]`).

So the truth is split, and the split **is** the opportunity:

- A recurring market at a fixed venue (every-Sunday at the same square/hall) is plausibly eligible — "seasonal business re-opening in the same location" or a place of interest. The head of the market already *is* on Maps (Mauerpark).
- The long tail — school-gym Basare, monthly club markets, parking-lot Trödelmärkte — is mostly absent, and the organisers will never create listings themselves. The one-off school flea market is genuinely ineligible ("temporary, one-time events").
- **Therefore the Local Pack, which absorbs the biggest demand pool, is not a wall — it is unclaimed territory that can only be claimed one market at a time, with organiser consent, by someone willing to do agency-grade labor.** That is a policy-compliant wedge (authorized profile management is a normal agency service) that an AI-built competitor structurally will not replicate, and it converts the docs' most depressing finding (72% zero-click) into the strongest argument for the infrastructure play: if the clicks end at Google's surfaces, *be the one who controls what those surfaces say.*

Unknowns to resolve by pilot, not argument: how Google's verification treats a market with no staffed weekday presence; whether listings survive review; what share of pilot markets clear the permanence bar. Target: attempt 5 GBP creations/claims with cooperating organisers; ≥3 surviving 60 days = the leg works. `[PILOT REQUIRED]`

Still needed and still human-only: Delfim's four German SERP screenshots (`SEARCH_BEHAVIOUR.md` §18) — they now also answer *which markets are already in the pack*, i.e. how much territory is unclaimed.

### Spam-policy position (unchanged, endorsed)

The docs' reading of the [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) is correct: thinness-by-construction, not page count, is the violation; the V1 launch set (~240 dense pages) is unambiguously safe. Worth adding only this: both new legs — Maps presence and the events surface — are Google's *intended* integration paths for exactly this data. After being burned by an algorithmic classifier, the highest-safety strategy is to move value onto surfaces where Google explicitly asks for the data, with the organiser's authority behind each entry.

---

## 5. Q4 — What the outside companies actually teach

Filtered hard for transfer; each entry is one mechanism, not a history lesson.

**Songkick vs Bandsintown — the pair that maps 1:1 onto this situation.** Songkick had the beloved consumer product and died in 2017–18 fighting the gatekeeper (Ticketmaster/Live Nation) for the transaction, settling for $110M on the way out ([Billboard](https://www.billboard.com/pro/ticketmaster-songkick-settle-lawsuit-110-million/) `[REPORTED]`). Bandsintown survived and won by becoming the *supply side's free data-entry tool* whose listings the platforms ingest: Facebook scanned Bandsintown for events ([BrooklynVegan](https://www.brooklynvegan.com/songkick-shutting-down-facebook-now-scans-bandsintown-for-events/) `[REPORTED]`), and in 2024 Spotify dropped Songkick's remnant after 13 years and integrated Bandsintown across artist pages and feeds ([Music Business Worldwide](https://www.musicbusinessworldwide.com/spotify-integrates-bandsintown-listings-as-its-songkick-partnership-comes-to-an-end2/) `[REPORTED]`); its Pro tier advertises one-submission distribution to Spotify, Google, Apple Maps and Shazam `[REPORTED]`. Transfer: **do not fight Google's surfaces for the click; become the pipe through which the category's data reaches every surface, Google's included.** The gatekeeper relationship flips from adversarial (SEO) to symbiotic (feed). And the scraping threat inverts: once organisers publish *through* you, a competitor scraping your listings is distributing your organisers — annoying, and strategically almost harmless, because the organiser channel, not the listing, is the asset.

**OpenTable — how to lock in fragmented small-business supply.** It seeded supply first, city by city, by installing the Electronic Reservation Book — an operational tool the restaurant *ran its floor on* — creating real switching costs (retraining, data of record, workflow) on top of network effects ([HBS Digital](https://d3.harvard.edu/platform-digit/submission/opentable-restaurant-reservations-made-easy/) `[REPORTED]`). It took door-to-door sales and years; that labor was the moat. Transfer: the sticky thing is the tool the supply side *operates with*, not the profile page about them. For amateur organisers the "ERB" must be WhatsApp-grade: the cancellation broadcast and the vendor list are the two workflows they actually have. Whoever holds the vendor waiting list holds the market.

**Craigslist vs newspaper classifieds — what kills incumbents serving fragmented amateur supply.** Free and liquid beat paid and prestigious; the listings went to where posting cost nothing and readers already were. Transfer: free-for-organisers is table stakes (flohmarktradar proves it's already conceded) — **liquidity (vendors, subscribers) is the differentiator, not price.** Also the warning in the other direction: Meetup showed that *taxing* amateur organisers (fee hikes) makes them flee instantly — organiser-side pricing must stay trivial relative to the value of one booked stall. `[INFERENCE from well-known histories]`

**HappyCow / AllTrails / Komoot — time-moats in amateur-data categories.** Their defensibility is decades of accumulated contributions and brand trust, not features; every year of operation widens a gap money can't close quickly. Transfer: this validates the occurrence ledger (Layer 3) as a real moat class — but note these are demand-side UGC moats requiring massive repeat usage, which a flea-market visitor (a few visits/year) will never supply. **The compounding contributions here must come from organisers and the system itself, not from visitors.** Do not build review/UGC features expecting an AllTrails flywheel; Google Maps already owns market reviews (Mauerpark's 300+).

**Zillow — the data-asset lesson with a caveat.** The Zestimate created a proprietary reason to visit that listings alone didn't provide; the analogue is reliability/cancellation-risk scores computed from the ledger ("this market has run 47 of its last 48 scheduled Sundays"). Caveat: Zillow monetised an industry with huge transaction values; this category's equivalent monetisation is organiser services, not commissions. `[INFERENCE]`

**Deutsche Marktgilde — the offline incumbent nobody in the docs has noticed.** The most instructive company is not digital: a cooperative that became infrastructure for municipalities (renting squares, subletting stalls, handling the admin the town doesn't want) and has held it for 35+ years ([marktgilde.de](https://www.marktgilde.de/) `[VERIFIED]`). That is Layer 0 + Layer 4 as a business, pre-internet. Transfer: (a) the model works in Germany specifically; (b) multi-market operators like this are the highest-leverage first relationships — one yes covers a hundred market-days; (c) long-term, such operators are either the best customers or the natural acquirer. `[SPECULATION on the last point]`

**Pattern across the dead ones** (Songkick, local papers, Meetup-as-was): they monetised the demand side of a category whose demand side had no lock-in, and were disintermediated by whoever owned either the supply side's workflow or the dominant discovery surface. The demand side here is Google's; the supply side is unowned. Choose accordingly.

---

## 6. Where this document disagrees with the docs folder (explicit, as required)

1. **Architecture is over-weighted.** Three of the folder's most-worked documents are about URL structure. `ARCHITECTURE_PROPOSAL_V1.md` is good — adopt it essentially as-is (with the §4 occurrence-page amendment above), spend one week, and stop. The architecture question is hygiene; every additional week on it is a week spent perfecting the replicable part. The AI-built competitors are the proof: they all have plausible architectures and none has a moat.
2. **"Monetization deferred" contradicts "test monetization before building" — and worse, it defers the moat.** The organiser service *is* the monetisation *and* the moat; deferring commercial contact with organisers defers exactly the asset the brief calls the moat. Reconciliation: defer *payments machinery* (as decided), but put a price on the organiser service from the first conversation, even if the first cohort gets it free-for-feedback. An offer without a price tests nothing.
3. **"Organiser relationships are the moat" is right but under-specified into softness.** A contact who once answered an email is not an asset. Define it operationally: channel verified + median response latency + grants held (GBP seat, "official page" endorsement, broadcast admin). Track those three numbers from week one; they are the moat's KPI (see §7 gates).
4. **`IDEAS.md` §2 ("Nobody aggregates cancellations") is false as stated.** meine-flohmarkt-termine.de runs a cancellation tracker `[MEASURED — observed 2026-08-27]`. What nobody does is *organiser-originated* cancellation broadcast with subscriber push and machine-readable `eventStatus`. The defensible version is the pipe, not the list. Update the file.
5. **`SEARCH_BEHAVIOUR.md` §17's "markets have no GBP" needs splitting.** Head markets are on Maps (Mauerpark, 4.2★/300+ reviews `[MEASURED]`); the long tail isn't and mostly can't self-serve. The correction strengthens the strategy (§4 Finding 2) — but the file should stop treating the Local Pack as purely lost territory.
6. **"Europe-wide from day one" is the right data model and the wrong success metric.** §4a's built-for/published split is endorsed. But the moat layers are all O(human, local). The metric that matters for defensibility is *organiser-channel density in the pilot region*, not countries live. The Uber-style density argument (considerations §2) was overridden for *publishing*; it must not be overridden for *relationship-building*. One region deep beats three countries wide, and the plan below is scoped that way.
7. **`ARCHITECTURE_PROPOSAL_V1.md` §6 "no occurrence pages"** — see §4 Finding 1. Trades away Germany's events surface; replace the blanket exclusion with the two-step probation (single-Event markup → rolling-window leaf pages).
8. **The fleafind.ch collapse theory still lacks its cheapest available test, and the docs keep deferring it.** Sistrix visibility histories for meine-flohmarkt-termine.de, flohmarktkompass.de, flohmarkt-termine.net, marktcom.de, heuteflohmarkt.de and fleafind.ch around 18–22 August would, in one hour, show whether the spam update hit combination-heavy sites as a class (thesis confirmed), hit fleafind alone (something else happened — important!), or hit nobody's visibility but fleafind's (very important). A [Sistrix free trial](https://www.sistrix.de/) covers it. This single hour also settles §19's live-test question about meine-flohmarkt-termine. Do it before any architecture is finalised.

---

## 7. Q5 — The sequence, with gates

Design constraints honoured: solo founder, burnout as named top risk, needs visible progress, spending own money. Weekly budget assumption: ~15–20 focused hours. Every phase has a decision written before it starts.

### Phase 0 — Kill questions first (Week 1, ~€0, no code)

| # | Action | Hours | What it decides |
|---|---|---|---|
| 0.1 | The four German SERP screenshots (`SEARCH_BEHAVIOUR.md` §18) — on German IP/mobile | 0.5 | Is the Local Pack there, and is it markets or shops? How much territory is unclaimed? |
| 0.2 | Sistrix visibility check, six domains, around Aug 18–22 (see §6.8) | 1 | Collapse theory; thin-content thesis; whether meine-flohmarkt-termine thrives or bleeds |
| 0.3 | Keyword Planner: absolute German volumes for the ~20 head terms | 1 | Market size; whether vendor-side volume clears a floor |
| 0.4 | **Five organiser conversations** (phone/visit; any reachable market, DE or CH — the behaviour, not the geography, is being tested). Pitch all three offers — Maps presence, cancellation broadcast, vendors — and watch which one makes them lean in. Ask what they'd pay for the one they want. | 6–8 | **The load-bearing assumption of the entire strategy** |
| 0.5 | Five vendor conversations at the same markets (`IDEAS.md` §1 script) | 4 | Whether Layer 4 exists |
| 0.6 | One multi-market operator conversation (a Marktgilde-type or regional flea-market operator) | 2 | Whether the concentration shortcut works |

**Gate G1 (end week 2):**
- *Continue* if ≥3/5 organisers respond positively to at least one offer AND vendors describe real pain (multi-tab searching, uncertainty, phone-only booking).
- *Pivot* if organisers engage but only on one offer → build only that leg.
- *Stop* if organisers are indifferent to all three offers AND vendors say "I do my usual three markets, it's fine." That outcome means no supply-side business exists here; a pure consumer directory is not worth building (§3); write the post-mortem and keep the €10k.

### Phase 1 — Pilot region depth (Weeks 3–10, ~€500, first code)

Pick ONE region by travel time, not strategy (considerations §14). Targets: 20–30 markets, 10–15 organiser channels.

- **Build the V1 architecture as proposed** (~240 pages: home, market, city, 16 Bundesland) — 2–3 weeks with Claude Code, then stop building. Ledger schema (provenance + timestamp per fact) from commit one.
- **GBP pilot:** 5 markets, cooperating organisers, create/claim listings. Measure survival at 60 days.
- **Cancellation broadcast pilot:** one WhatsApp channel for the pilot region; organisers get one phone number to text; QR poster at cooperating markets ("Findet er statt? →").
- **Vendor MVP:** "Stand anfragen" form on pilot market pages; forward by hand; count requests.
- **Event-schema probation:** single-Event markup on 10 market pages; watch GSC event appearance.
- Newsletter/channel from subscriber #1, city-segmented (as already decided).

**Gate G2 (end month 3):**
- *Continue* if: ≥10 organiser channels with ≥50% response within 48h; ≥3/5 GBPs live; ≥20 vendor requests total; site indexed cleanly (no repeat of the classifier pattern in GSC).
- *Pivot* if GBP leg fails systematically (Google rejects markets) → drop it, double down on events surface + broadcast; if vendor requests ≈ 0 despite traffic → Layer 4 parked, service business only.
- *Stop* if organiser response rates collapse after the novelty (channels go quiet, <20% response) — that would falsify the channel-graph moat itself.

### Phase 2 — Prove revenue and the second region (Months 4–6, ~€1–2k)

- First invoices: 3–5 organisers on a paid tier (€10–30/month or seasonal). The "your listing: 1,240 views, 12 vendor requests" report is the sales document (considerations §11 — already designed).
- Switzerland import (cheap second country, existing data) — proves the multi-country machinery.
- Rolling-window occurrence pages if the schema probation earned them.
- WebMCP tools exposed from the API core when Chrome's origin trial makes it testable — cost ≈ 0 given the API-shaped core already decided in V1 §5. First-mover on the agent surface stays cheap insurance, not a bet.

**Gate G3 (end month 6):**
- *Continue* (this is a business) if: ≥5 paying organisers OR ≥100 vendor requests/month OR a signed multi-market operator; AND Google ≤70% of sessions; AND founder hours within budget.
- *Pivot* if traffic grows but organiser revenue is zero after real attempts → the uncomfortable option: sell the *service* to the incumbent aggregators/operators instead (they have listings, no infrastructure) `[SPECULATION — explore only at this gate]`.
- *Stop* if none of the three revenue signals exists by month 6 despite Gates 1–2 passing — the category engages but won't pay at solo-founder economics.

### What is deliberately NOT in the plan

Native apps · reviews/UGC · accounts · more than one pilot region before G3 · AdSense · any additional indexable page type before its probation · any activity whose owner is "the team." Each of these has a reason in the docs already; they stay out until a gate says otherwise.

---

## 8. Summary logic chain

1. The artifact is replicable at ~zero cost — proven by the competitor set itself. → The moat must be non-software.
2. Non-software assets available here: organiser channels, delegated platform access, the occurrence ledger, vendor liquidity, the ops playbook. All compound; none can be scraped or generated.
3. Therefore the business is organiser infrastructure, rendered as (among other things) a directory — not a directory with an organiser feature.
4. Google's own docs open two policy-sanctioned doors the category ignores (events surface live in Germany; Maps eligibility for fixed-venue recurring markets), both of which reward exactly the organiser-side position — and convert the zero-click problem from a wall into a wedge.
5. The whole strategy rests on one testable assumption — organiser engagement — which costs €0 and two weeks to test. Test it before building anything.

---

owner: Delfim
last_reviewed: 2026-08-27
status: strategy proposal — Gate G1 (organiser conversations) decides everything downstream
