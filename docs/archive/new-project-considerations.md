# Everything to Think About — Building This From the Ground Up

Research compiled 2026-08-27. Companion to `new-project-brief.md` (which holds decisions; this holds the thinking that should precede them).

**How to use this:** don't answer all of it. Sections 1–3 must be answered before building. The rest are decisions you'll hit in order — read them now so you recognise them when they arrive, and so nothing load-bearing gets discovered late.

Each section: what to decide, why it matters, what's specific to 2026, and the questions worth writing an answer to.

---

## 1. The question underneath everything

Before brand, architecture, or code: **what is true about your product that isn't true about Fleamapket, FlipTip, marktcom, or FlohScout?**

This is unanswered right now and everything else is downstream of it. Fleamapket already occupies "curated global flea market directory with editorial reviews by people who went there" — 1,200 markets, 50 countries, iOS + Android. Any positioning built on "nobody is doing this properly across Europe" is factually wrong.

Candidate angles worth testing (none validated yet):
- **Recurring local markets vs. destination markets.** Fleamapket curates the ~1,200 markets worth travelling for. The weekly Sunday market in a mid-size town is a different product with different (larger, more repeat) demand. FleaFind's query data was overwhelmingly this: local, date-specific, "is it on this weekend."
- **Reliability as the product.** Nobody in the category answers "is it actually happening today?" Cancellations, weather, changed dates.
- **The vendor (Standler) side.** People who sell at markets are higher-frequency, already spend money on stalls, and are served by nobody as a first-class audience.
- **Organiser tooling.** The relationship layer none of the aggregators own.

**Questions to answer in writing:**
- Who is the user, specifically enough that you could name three real people who match?
- What do they do today instead, and why is that bad?
- What's the one sentence that makes a competitor's user switch?
- What can you do that a well-funded competitor couldn't copy in 6 months?

---

## 2. Scope and sequencing — the density argument

The marketplace evidence is consistent and it argues against spreading wide early:

- **Uber** sent teams into single cities weeks before launch, targeted the downtown/nightlife core specifically, and used *sub-15-minute ETA* as the proxy for critical mass. Density in one geography, then repeat. ([Breadcrumb VC](https://breadcrumb.vc/marketplaces-scalability-lessons-from-uber-and-airbnb-d461aded18a2))
- **Airbnb** targeted ~20% listing penetration per local market, and when going international in 2011 deliberately did *not* try to be everywhere — critical mass in a few markets first.
- The distinction that matters for you: Uber's network effects are **hyperlocal** (a market in Berlin does nothing for a user in Lyon); Airbnb's are **cross-border** (existing demand travels). A flea-market calendar is much closer to Uber's model — a user in Hamburg does not care about Barcelona. **That argues strongly for saturating a geography before spreading.**

Thin coverage across 20 countries produces a site where every city page is half-empty — which is simultaneously a bad user experience, a weak trust signal, and precisely the "many pages, little value each" shape that gets classified as scaled content.

**Questions:**
- What's the smallest geography where you could be unambiguously the best resource?
- What's your equivalent of "sub-15-minute ETA" — the measurable proxy for "this city is done"? (e.g. *≥80% of markets in this city, every date verified within 30 days*)
- What has to be true before geography #2 starts?
- Which region can you physically reach? Verification visits, organiser handshakes and photography all price by travel time.

---

## 3. Data strategy — the actual moat

Covered in `new-project-brief.md` §3 (two-layer model: aggregators for discovery, organisers/official sources for the record). Additional considerations:

- **Freshness as a measured metric**, not a vibe. `% of listings verified in the last 30 days` on a dashboard from day one. This is the number that decays silently and kills trust.
- **Honest verification tiers** shown per listing — confirmed by organiser / verified by us + date / official source / unconfirmed. At scale you cannot verify everything; transparency beats pretending.
- **The organiser flywheel is the only thing that scales.** Manual verification is O(markets); organisers updating their own listings is O(1) per organiser. Target a measurable share of freshness events coming from organisers.
- **Structured from the start**: separate venue from market from occurrence. FleaFind got this right and it's why the data was portable. Formatting belongs in the application layer, not the database.
- **Legal:** EU database right protects compilations. Facts are free; someone's assembled calendar is not.

---

## 4. Brand and identity

**What 2026 changed:** brand is no longer soft. Branded search volume, unlinked brand mentions, and entity recognition function as ranking inputs — and brand search volume correlates with AI citation probability. Brands recognised as trusted entities see meaningfully more organic traffic than those that aren't ([The Frank Agency](https://thefrankagency.com/blog/entity-seo-guide/), [Zumeirah](https://zumeirah.com/brand-entity-seo-2026/)). A competitor can copy your features; they cannot quickly manufacture people typing your name into Google.

**To decide:**
- **Name** — portable across European languages (settled: not German-locked). Check DNS *and* registrar *and* DPMA/EUIPO before any design work.
- **Positioning statement** — for whom, against what alternative, and the sharp claim.
- **Tone of voice** — defined with on-brand and off-brand examples, not adjectives. German consumer surfaces use `du`; the category is du-culture and every legacy portal writes in stiff officialese, so warmth is free differentiation.
- **Visual identity** — colour, type, imagery, each with a reason. Reserve a semantic colour exclusively for cancellation/alert states.
- **Photography policy** — real photos from visits, no stock, no AI images. Competitors' listings have no photos because nobody went. That's a trust signal that can't be faked cheaply.
- **Entity consistency** — same name, description, and category across the site, LinkedIn, directories, press. This is what builds a Knowledge Panel over time, and Knowledge Panels are what make AI systems confident enough to cite you.

---

## 5. Product and UX

**Apple's HIG principles** are the clearest available framework and they apply directly to a listing product ([Apple HIG](https://developer.apple.com/design/human-interface-guidelines/)):
- **Clarity** — legible at any size, precise icons, minimal adornment.
- **Deference** — *the UI serves the content and never competes with it.* For a directory this is the whole game: the market listing is the product, not your chrome.
- **Depth** — layering and motion convey hierarchy.
- **Consistency** as the connective tissue.

**To decide:**
- The core loop. What brings someone back next week, not just this once? (A calendar's natural pulse is weekly — fighting that with daily-engagement mechanics is fighting reality.)
- Mobile-first, concretely: FleaFind ran ~82% mobile (1,400 vs 310 clicks). Thumb-zone CTAs, bottom-sheet filters, tap-to-route.
- Retention that doesn't need an app: ICS calendar export (a bookmark in the user's own calendar that no algorithm can remove), email alerts, saved markets in local storage.
- Accounts: probably not v1. Email + double opt-in covers alerts without password infrastructure.
- Empty states that still help ("nothing in Aachen this week — here are three within 30 km"). Trust is built in the failure cases.
- What you're deliberately *not* building. Reviews, forums, gamification, native app — each needs a loop it strengthens.

---

## 6. Technical architecture

Rules are in `new-project-brief.md` §4 and they're non-negotiable. Beyond those:

- **Entities and places get URLs; time never does.** Every trusted platform converges here — Booking, Eventbrite, Songkick all treat dates as parameters or content, never as indexable paths.
- **Note the honest counter-example:** Airbnb and Booking *do* run enormous programmatic location-page systems (Airbnb reportedly ~1.1M pages). The difference is that each page is backed by genuinely distinct inventory and real user-generated content, plus decades of domain authority. Programmatic SEO isn't dead — *thin* programmatic SEO is. If a page type can't carry unique data, it shouldn't exist.
- **Multi-country from day one in the data model**, even if only one country ships. Country/region/city/venue/market/occurrence as distinct entities. Retrofitting geography is painful; FleaFind's locale matrix is the cautionary tale.
- **i18n discipline:** a locale exists only when its content exists. Complete hreflang sets or none.
- **Plan the domain structure now** — if `.com` becomes canonical at country #2, decide the folder structure (`/de/`, `/at/`) at the start and write it down, so the migration is an operation rather than an archaeology project.
- **CI guardrails:** compute the URL-to-entity ratio in CI and fail the build if it exceeds the threshold. Rules that aren't enforced by machines drift.

---

## 7. Discoverability — now two parallel games

**This is the biggest 2026 shift and the one most likely to be missed.**

Only ~17% of AI Overview citations come from pages that also rank in Google's organic top 10 ([Leapd](https://www.leapd.ai/blog/ai-visibility/how-chatgpt-google-ai-overviews-and-perplexity-source-information-in-2026)). Ranking on Google and being cited by AI are now **different games with different winners**. Pages cited in AI Overviews earn meaningfully more clicks than uncited competitors on the same page.

**What that means practically:**
- **Reddit is the most-cited domain across ChatGPT, Gemini, Perplexity and AI Overviews**; YouTube leads AI Overview citations (~21%), then Reddit (~18.5%), Facebook, Instagram, Quora. Genuine presence in community platforms is now a *discoverability* channel, not just a marketing one. (Genuine participation — the spam version fails on both fronts.)
- **~44% of LLM citations come from the first 30% of a page.** Front-load the answer. A market page should state what/where/when in the first screen, not after a scroll of chrome.
- Cited-source factors: domain authority, organic performance, **content freshness**, and entity richness. Freshness is structurally your advantage — a verified-dates product is inherently fresher than static competitors.
- Structured data does double duty: rich results *and* machine-readable clarity for AI systems.

**Traditional SEO still matters:**
- Event schema (JSON-LD) for the events surface; `eventStatus` makes cancellations machine-readable.
- Consistency between schema, site content, and any Google Business Profile.
- Hyper-local content — neighbourhood references, transit, city specifics — is what gains local visibility.
- Backlinks: earn them with data stories and genuinely linkable editorial ("Münster has more flea markets per capita than Berlin"). Local press and tourism boards link to useful resources.

**Questions:** How does someone discover you if Google sends nothing? What would make a Redditor recommend you unprompted? What content would an AI cite as the authoritative answer to "flea markets in Berlin this weekend"?

---

## 8. Performance

Core Web Vitals, 2026 thresholds — Google weighs LCP, INP and CLS roughly equally, and you need "good" on each ([NitroPack](https://nitropack.io/blog/most-important-core-web-vitals-metrics/), [Koanthic](https://koanthic.com/en/core-web-vitals-2026-complete-inp-guide-assessment/)):

- **INP < 200ms** (replaced FID). Sites in the "needs improvement" band saw measurable average position drops.
- **Mobile is what counts.** Mobile LCP typically runs 40–60% slower than desktop; good desktop scores don't rescue bad mobile ones.
- **CLS:** set explicit width/height or aspect-ratio on every image, video and iframe. (FleaFind had a real footer-CLS bug from an unguarded Suspense boundary — the lesson is already paid for.)
- Budget it from day one: LCP < 2s on 4G is a design constraint, not a later optimisation pass.

---

## 9. Legal and compliance (EU) — do not skip this

**European Accessibility Act.** Enforcement began 28 June 2025 across all 27 member states. It covers consumer-facing digital services including websites and apps, **and applies to non-EU businesses serving EU users**. The standard is **WCAG 2.1 Level AA**: contrast ratios, keyboard operability, descriptive headings and links, form validation support. Fines range from ~€60,000 (Ireland) to ~€900,000 (Sweden); authorities can also mandate audits and name non-compliant organisations publicly. First lawsuits were filed in France in November 2025. ([Level Access](https://www.levelaccess.com/compliance-overview/european-accessibility-act-eaa/), [Accessibility Checker](https://www.accessibilitychecker.org/guides/eaa-compliance/))

Micro-enterprises (<10 staff, <€2M turnover) have some exemptions for *services* — **verify whether that applies to you before relying on it.** Regardless: building to WCAG 2.1 AA from the start costs almost nothing; retrofitting is expensive, and accessible markup overlaps heavily with good SEO and AI-parseability.

**Also:**
- **GDPR** — lawful basis, double opt-in for newsletter, privacy policy, data deletion path.
- **Impressum** — legally required in Germany and Austria. Non-negotiable, and its absence is noticed.
- **Cookie consent** — or sidestep it entirely with privacy-preserving analytics that don't set cookies. Fewer banners, faster pages, less legal surface.
- **EU database right** — see §3.
- **Trademark** — DPMA (Germany) and EUIPO searches before committing to a name.

---

## 10. Distribution

The strategic requirement: **never ~100% dependent on one channel again.** Set an explicit cap (e.g. "Google ≤70% of sessions by month 3") and measure it.

- **Newsletter as a real product**, not a footer box. FleaFind's 10 subscribers in 6 months was a value-proposition failure. A weekly "what's verified this weekend near you", city-segmented from subscriber #1, sent on the weekend-planning day.
- **Owned channels beat borrowed ones** — email and messaging channels can't be algorithm-nuked.
- **Physical distribution** is underrated here: a QR poster at a market entrance reaches people at maximum intent, costs cents, and is unblockable. Organisers will hang it because it answers their most-asked question.
- **Community platforms** — see §7; these are now discoverability infrastructure, not just marketing.
- **Shareability by design:** dynamic OG images per market (the WhatsApp preview does the selling), share buttons matched to the local social graph, ICS export.
- **Press:** data-driven local stories are the cheapest backlink source that also reaches real users.

---

## 11. Monetization

- **Test it before you have traffic, not after.** FleaFind reached 5k users/month and never once tested whether anyone would pay. That's the single biggest unforced error to avoid repeating.
- **Display ads are pocket money** at any traffic you'll reach in year one (~€15–30/month at FleaFind's peak). Not a plan, and they contaminate the trust surface at exactly the stage trust is the differentiator.
- Plausible year-one revenue: organiser featured listings, local business advertising, vendor-side tooling. Direct sales, low ticket, relationship-driven — which suits a commercial partner making calls far better than an ad tag.
- **Build the hooks early, defer the machinery:** claim-your-listing flow, featured-slot rendering, view counters, and a monthly "your listing got 1,240 views" report to organisers (that report *is* the sales asset). Defer payment processing — invoicing is normal at this ticket size.
- Decide what you'll never do. Selling user data, deceptive advertorials, pay-to-be-verified — each destroys the trust the whole thing rests on.

---

## 12. Analytics and instrumentation

FleaFind couldn't answer basic questions during the crisis. Fix that structurally:

- Analytics from the first commit. Privacy-preserving (no cookie banner, faster pages, honest numbers) is enough for everything here.
- **UTM discipline on every owned link** — this is the only way to know your Google dependency ratio.
- Product events: saves, calendar exports, organiser-contact clicks, share clicks, alert signups.
- **SEO tripwires reviewed weekly**: impressions per indexed URL, % of sitemap indexed, "crawled – not indexed" growth on content URLs, brand-query share, any page type losing >30% week-over-week.
- Freeze deploys around announced Google update windows and annotate the dates. When something moves, you want to know whether you did it.
- A weekly export you actually read. Ten minutes beats a dashboard nobody opens.

---

## 13. Working sustainably

- **YC's growth benchmark is 5–7% week-over-week** — weekly compounding, not hockey-stick projections. A small number growing weekly beats a bigger number that's been flat for six months ([YC Library](https://www.ycombinator.com/library/4D-yc-s-essential-startup-advice)).
- **Something rough and real beats something polished and hypothetical.** Ship, then improve.
- **Bad timing accounts for ~29% of startup failures** — worth noting that the consumer season here runs March–October, and SEO needs months of lead time. Build in the trough, launch into the season.
- **Pre-commit decision gates** with continue/pivot/stop thresholds, written down while nobody is tired or attached. Changing a gate later requires writing down what new evidence justified it.
- **Partner terms in writing before real work** — time commitment, split, what happens at a pivot.
- **Founder burnout is the named top risk.** A plan requiring a team of eight is a failed plan. Cap the build, gate the decisions, protect the weekends.

---

## 14. The order to actually do this in

1. **Answer §1.** What's yours that isn't Fleamapket's. Nothing else matters until this has an answer you believe.
2. Partner terms in writing.
3. Name + trademark + domains locked.
4. Pick the pilot geography by travel time, not strategy.
5. Validate demand with real search-volume data.
6. *Then* architecture, brand, build.

The cheapest next step is always the one that tells you whether to keep going.
