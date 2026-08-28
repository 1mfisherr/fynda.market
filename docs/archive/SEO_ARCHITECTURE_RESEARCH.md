# SEO & Architecture Research — Germany First, Europe-Ready

Research compiled 2026-08-27, against Google's own documentation where possible rather than SEO blogs.
Purpose: ground the v2 architecture in what Google actually says, size the German market, and find the angle that beats the incumbents.

Companion to `new-project-brief.md` §4 / §4a.

---

## 0. Correction: the brief misquotes Google (load-bearing)

`new-project-brief.md` §4 currently says:

> **No per-occurrence pages.** All dates render on the market page. *(Also Google's own recurring-event guidance.)*

**The parenthetical is wrong, and it matters.** Google's [Event structured data documentation](https://developers.google.com/search/docs/appearance/structured-data/event) says the opposite:

- *"Each event MUST have a unique URL (a leaf page) and markup on that URL."*
- *"The event experience on Google only supports pages that focus on a single event."*
- *"If there are several different performances across different days, each with individual tickets, add a separate `Event` element for each performance."*
- Google also recommends *"adding markup to your event posting pages instead of pages that list schedules or multiple events."*

### What this actually means

Removing occurrence pages is a decision **against Event rich-result eligibility**, not an alignment with Google's guidance. That is a real trade-off and must be made consciously rather than by accident.

The evidence for removing them is still strong — but it comes from FleaFind's own GSC data, not from Google:

| Page type | Pages | Impressions | Per page |
|---|---|---|---|
| City hub | 53 | 15,509 | **293** |
| Market hub | 216 | 16,850 | 78 |
| Occurrence (market+date) | 484 | 11,554 | **24** |

Occurrence pages were ~12× less efficient than city hubs. But they carried 11,554 impressions — deleting them is a bet that consolidated pages recapture that intent, **plus** now a known cost in rich-result eligibility.

### Three options — this needs a decision

1. **No occurrence pages, no Event rich results.** Cleanest URL economics. Gives up an eligibility competitors also mostly don't use.
2. **No occurrence pages, but mark up the market page with the next occurrence as a single `Event`.** Keeps one leaf-page-shaped Event per market, dates below as content. Untested against Google's "focus on a single event" wording — needs validation, but is the most promising middle path.
3. **Occurrence pages only for markets that earn them** (major markets, real distinct content per date). Probation rules from §4 already describe this mechanism.

**Recommendation: option 2, validated on ≤10 markets before scaling** — consistent with the existing probation rule. Do not carry the current wording forward into v2 unexamined.

---

## 1. What Google actually prohibits — verbatim

From the [Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies):

**Scaled content abuse:** *"when many pages are generated for the primary purpose of manipulating search rankings and not helping users."* Examples include *"scraping feeds, search results, or other content to generate many pages (including through automated transformations like synonymizing, translating, or other obfuscation techniques), where little value is provided to users."*

**Doorway abuse:** *"when sites or pages are created to rank for specific, similar search queries. They lead users to intermediate pages that are not as useful as the final destination."* Examples explicitly include *"multiple domains/pages for specific regions funneling to one page."*

**Thin affiliation** is defined by copied merchant content; *"good affiliate sites add value by offering meaningful content or features"* — price comparison, original reviews, testing.

### The operative distinction

Google's policy does **not** define a page-count threshold. The line is **purpose and value per page**: pages generated *"for the primary purpose of manipulating search rankings and not helping users."*

Two consequences for us:

1. **Volume is not the violation. Thinness is.** Airbnb runs ~1.1M programmatic location pages. The difference is distinct inventory behind each. Our defence is that every published page is backed by real, independently sourced market data — which is exactly the two-layer model in `new-project-brief.md` §3.
2. **The doorway definition is the one fleafind.ch most plausibly tripped.** "Pages for specific regions funneling to one page" describes a city×day/weekend matrix well. The §4 rule (time never gets a URL) targets exactly this. Keep it.

**Independent confirmation:** 2024's core and helpful-content updates were [widely reported to have hit aggregator and directory sites hardest](https://ustechautomations.com/resources/blog/seo-for-online-directories-2026) — specifically *the category whose page count scales with combinations rather than with genuinely new content*. That is the sentence to keep on the wall.

---

## 2. Market sizing — Germany

| Metric | Figure | Source |
|---|---|---|
| Flea/second-hand market **events** per year | **40,000–50,000** | Trade press ("Trödler"), aggregator statistics |
| Market **organisers** | **6,000+** | Same |
| Annual visitors | **~55 million** | Same |

### What this means for architecture

Roughly 45,000 events/year ÷ 6,000 organisers ≈ 7.5 events per organiser per year — i.e. most are recurring series, not one-offs.

Estimated entity counts for full German coverage:

| Entity | Rough count | Gets a URL? |
|---|---|---|
| Occurrences (dates) | ~45,000/year | **No** — content/filter state |
| Distinct recurring markets | ~8,000–15,000 | Yes |
| Venues | ~8,000–15,000 | Only where distinct from market |
| Cities/towns with markets | ~2,000–4,000 | Yes |
| Organisers | ~6,000 | Probably yes — see §4 |

**Entity-based architecture: ~12,000–20,000 URLs for all of Germany.** A real, healthy site.
**Occurrence-based architecture: +45,000 URLs per year, compounding.** That is the trap, and it is now quantified.

The §4 target ratio (≤1.5 URLs per market) holds up against these numbers.

---

## 3. What the German incumbents already do

Checked directly, 2026-08-27:

| Site | Architecture | Notes |
|---|---|---|
| **[flohmarktkompass.de](https://www.flohmarktkompass.de/markt/)** | `/markt/[PLZ-prefix]/[market-slug]`; dates as **query params** (`?datum=2026-08-27`), view modes as params | **Already doing the "right" thing.** Postal-code-prefix grouping instead of city names is a genuinely distinctive choice |
| **[flohmarktradar.de](https://flohmarktradar.de/)** | Thin static pages, markets load via JS; **separate organiser portal on a subdomain**; free for visitors *and* organisers | Direct model competitor to what we described. Weak web/SEO surface — JS-loaded content |
| **marktcom.de** | Legacy portal, organiser logins, stall booking | 1990s UX, strong incumbency |
| **flohmarkt-termine.net** | Since 1996 | Coverage, thin listings |
| **Fleamapket** | Curated global, iOS+Android, subscription | Destination markets, not local recurring |

### Uncomfortable conclusion

**"Dates as query parameters, entities get URLs" is not innovative — flohmarktkompass already ships it.** The §4 architecture rules are necessary hygiene, not differentiation. If the plan is "same as everyone, done correctly," that is not a moat.

The innovation has to come from somewhere else. See §4.

---

## 4. Where the actual SEO/AI advantage is

The 2026 shift is that **ranking and being cited are two different games**. Only ~17% of AI Overview citations come from pages also ranking in the organic top 10. The measured citation factors are things this category does *not* do:

| Factor | Measured effect | Who does it in this category |
|---|---|---|
| **Content freshness** | Content <3 months old **3× more likely cited**; pages updated within 2 months earn ~28% more citations | **Nobody.** Incumbents are static listings |
| **3+ schema types on a page** | ~13% higher citation likelihood; 61% of cited pages do it | **Nobody.** Competitors have minimal or no structured data |
| **Clean heading hierarchy** | **2.8×** more likely to be cited; 68.7% of cited pages | Rare |
| **Answer in first 30% of page** | **44.2%** of all LLM citations come from there | Rare |
| **Multimodal (text+image+video+schema)** | Up to 156–317% higher selection rates | **Nobody** — competitors have no photos |

*(Figures from third-party citation studies, not Google. Treat as directional, not gospel — but the direction is consistent across sources.)*

### The four candidate innovations

**A. Entity/knowledge-graph-first architecture.**
Model organiser as `Organization`, venue as `Place`, market as an event series, city as `Place`, with `sameAs` links to official sources. Competitors publish listings; we publish a **graph**. This is simultaneously rich-result leverage, AI-citation leverage, and the thing that is hardest to copy quickly because it requires the data to actually be structured.

**B. Freshness as a rendered, structural property.**
Every page carries a real, honest "verified on [date], by [organiser/us/official source]" — backed by actual verification, exposed in schema (`dateModified`) and visible on-page. Freshness is the single strongest AI-citation factor and the one where a verified-dates product is *structurally* advantaged over static competitors. This turns the verification work (which we're doing anyway for trust) into a ranking asset.

**C. Answer-first page layout.**
What/where/when/is-it-on in the first screen, before any chrome. Cheap to do, measurably effective, and nobody in the category does it.

**D. Radius over administrative boundaries.**
Every competitor organises by city or postal code. Real user intent for spontaneous trips is *"what's within 30 minutes of me this Saturday"* — which crosses city and even national borders. This can be served **without creating URLs** (geolocation + query params, canonical to the city hub). Genuinely differentiated UX, zero URL-economics cost, and directly serves the "spontaneous trip" user Delfim named.

**B + D together are the most defensible pair**: one is operationally expensive to copy (requires real verification operations), the other is a UX/product insight that competitors' city-list architecture doesn't naturally support.

---

## 5. Monetization reality check — AdSense early

Delfim raised needing revenue early. Honest position:

**Approval is achievable but not the problem.** No minimum traffic requirement; needs original content, About/Contact/Privacy/Impressum pages, good Core Web Vitals, 1–3 weeks review.

**The problem is that the number is too small to matter.** At FleaFind's peak (~5k users/month) AdSense was ~€15–30/month. Reaching €500/month needs roughly 20–50× that traffic. AdSense will not fund this at any traffic realistically reachable in year one.

**And there are two real costs:**
1. Ads on a young, still-thin directory contaminate the trust surface at exactly the stage trust is the differentiator — and directories are already the category under helpful-content scrutiny (§1).
2. It consumes the "advertise with us" inventory that organiser/local-business deals would occupy at far higher value.

**Recommendation:** build the ad *slots* into the design system from day one (so nothing needs rebuilding), leave them empty or filled with our own organiser CTA until either (a) traffic passes a threshold worth revisiting, or (b) a real local advertiser is sold. Do not put AdSense on market pages ever. If the goal is genuinely near-term revenue, the faster path is one paid organiser or local-business placement sold by hand — a €50/month local advertiser beats three months of AdSense.

---

## 6. Germany-first sequencing (decided 2026-08-27)

Germany first, Switzerland immediately after (data already exists from fleafind.ch), architecture Europe-ready from commit one.

Notes:
- Switzerland is a **cheap second country** — the data exists, and it re-uses the multi-country machinery immediately, proving the architecture before it is expensive to change. Good sequencing.
- **Do not import fleafind.ch's URL structure with the data.** The data is reusable; the architecture is exactly what we are moving away from.
- Germany's ~6,000 organisers vs Switzerland's much smaller pool means organiser outreach economics differ. Expect the German pilot to need a narrower geographic focus for verification visits even while the *site* is national.

---

## 7. Open architecture questions (not yet decided)

1. **Occurrence pages + Event schema** — §0. Load-bearing, needs a decision before build.
2. **Does a city with one market get a city page?** Delfim's open question. Suggested rule: a place page exists at a **minimum content bar** (e.g. ≥3 markets, or ≥1 market plus genuine local content), enforced in CI. Below the bar, the market page is the destination and the city is a filter value, not a URL.
3. **Do organisers get public entity pages?** ~6,000 in Germany. Attractive for the knowledge graph and for organiser relationships, but risks becoming a thin page type. Probation rules apply.
4. **Postal code vs city as the geographic primitive** — flohmarktkompass chose PLZ prefixes. Cities are more human and more searched; PLZ is more precise for radius. Probably cities for URLs, PLZ/coordinates for the radius engine.
5. **Domain structure** — `/de/`, `/at/`, `/ch/` decided now, written down, before country #2.

---

## Sources

- [Google Search spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Google Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)
- [Google: showcase your events on Search](https://developers.google.com/search/blog/2020/02/events-on-search)
- [Directory sites and 2026 rankings](https://ustechautomations.com/resources/blog/seo-for-online-directories-2026)
- [Content freshness and AI citations](https://writesonic.com/blog/how-content-freshness-affects-ai-citations)
- [flohmarktkompass.de](https://www.flohmarktkompass.de/markt/) · [flohmarktradar.de](https://flohmarktradar.de/) · [marktcom.de](https://www.marktcom.de/)
- German market sizing: [listflix statistics](https://listflix.de/statistik/flohmaerkte/), [Planet Wissen](https://www.planet-wissen.de/kultur/sammeln/flohmaerkte/index.html)

---
owner: Delfim
last_reviewed: 2026-08-27
