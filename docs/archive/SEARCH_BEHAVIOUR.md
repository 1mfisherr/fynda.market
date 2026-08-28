# How People Actually Search for Flea Markets

Analysis of fleafind.ch's own Google Search Console data, 2026-08-27.
**Source:** `docs/GSCdata/05.08.26 - 90 days/` — roughly 7 May – 5 August 2026. This is **pre-collapse** data (the collapse was 22 August), so it reflects a healthy, ranking site.

Sample: 1,000 query rows (1,564 clicks / 54,137 impressions) and 1,000 page rows (4,032 clicks / 126,215 impressions). GSC truncates the long tail, so these are the head, not the whole.

This is the best evidence available on real search behaviour in this category — better than any third-party keyword tool, because it's our own ranking data in the actual market.

---

## 1. The headline: search in this category is overwhelmingly temporal

| Segment | Queries | Clicks | % of clicks | CTR | Avg position |
|---|---|---|---|---|---|
| **Any temporal signal** | 452 | 1,013 | **64.8%** | **3.72%** | 8.05 |
| No temporal signal | 548 | 551 | 35.2% | 2.05% | 11.62 |

**Two-thirds of clicks come from queries containing a time reference**, and those queries convert at nearly double the rate.

Breakdown by signal type:

| Signal | Queries | Clicks | % clicks | CTR | Position |
|---|---|---|---|---|---|
| **Year in query** (`2026`, `26`) | 266 | 733 | **46.9%** | 3.68% | 7.03 |
| **Explicit date** (`2.8.26`, `19.07.26`) | 69 | 143 | 9.1% | **17.46%** | 5.43 |
| **Month name** (`14 mai`, `2 august`) | 80 | 136 | 8.7% | **17.80%** | 6.26 |
| Weekday / weekend | 49 | 84 | 5.4% | 2.77% | 11.42 |
| heute / morgen | 57 | 79 | 5.1% | 3.12% | 11.57 |
| termine / kalender | 43 | 64 | 4.1% | 2.02% | 8.94 |

### Three things that stand out

**a) "Flohmarkt [city] 2026" is the single biggest query shape.** 266 queries, 47% of all clicks. People append the year constantly. This is a *durable* query — asked all year, and the answer (this year's calendar) stays valid.

**b) Bare date queries convert extraordinarily well.** `flohmarkt 2.8.26` — no city at all — 29.5% CTR. Across all date/month queries without a city: **149 queries, 279 clicks, 17.6% CTR, average position 5.8.** That's 17.8% of all site clicks from queries with no location in them whatsoever.

Individual examples: `flohmarkt 14 mai 2026` 100% CTR · `flohmarkt 11 juli` 50% · `flohmarkt 5.7.2026` 50% · `flohmarkt 18 juli` 31%.

**c) "heute" and weekday queries are the weak temporal form.** Despite feeling like the obvious use case, `heute`/`sonntag`/`samstag` queries convert at 2.8–3.1% and rank poorly (position ~11.5). The intent is real but the competition is heavy and the match is fuzzy.

---

## 2. The page-level data — and a correction to the brief

`new-project-brief.md` §4 judged page types by **impressions per page** and concluded that date/period discovery pages were "inefficient page-count bloat."

**Impressions per page is the wrong metric.** It measures how often a page is *shown*, not whether it *works*. Re-running the same data by clicks per page and CTR gives a materially different answer:

| Page type | Pages | Clicks | Clicks/page | CTR |
|---|---|---|---|---|
| **A** Place hub `/schweiz/city` | 49 | 1,248 | **25.47** | 3.49% |
| **G** Month page `/maerkte/juni-2026` | 2 | 23 | **11.50** | 4.66% |
| **B** Place + temporal `/schweiz/city/TIME` | 133 | 807 | 6.07 | 3.54% |
| **E** Date page `/maerkte/2026-05-14` | 25 | 124 | **4.96** | **14.81%** |
| **C** Market hub `/markt/slug` | 174 | 845 | 4.86 | 2.67% |
| **H** Weekday page `/maerkte/sonntag` | 10 | 48 | 4.80 | 7.21% |
| **F** Date + city `/maerkte/DATE/city` | 14 | 26 | 1.86 | 5.56% |
| **D** Market occurrence `/markt/slug/DATE` | **531** | 795 | **1.50** | 2.78% |
| **I** Weekday + city `/maerkte/sonntag/aarau` | 37 | 37 | **1.00** | 2.36% |

*Confidence note: G (month pages) is only 2 pages — suggestive, not solid. E (25 pages), D (531) and A (49) are reasonably sized.*

### What this actually says

**Date pages were not bloat. They outperformed market hubs.** A standalone date page pulled 4.96 clicks/page at **14.81% CTR** — the highest-intent page type on the entire site, and better clicks/page than the market hub (4.86).

**The real bloat was occurrence pages.** 531 pages — over half of everything in the export — at **1.50 clicks/page**, second-worst of any type. This is where the URL count went.

---

## 3. The pattern that emerges

Sort the table by whether the page combines **one** dimension or **two**:

| Shape | Types | Clicks/page |
|---|---|---|
| **Single dimension** (place alone, date alone, month alone, weekday alone) | A, G, E, H | 25.47 / 11.50 / 4.96 / 4.80 |
| **Two dimensions multiplied** (date×city, weekday×city, market×date) | F, I, D | 1.86 / 1.00 / 1.50 |

*(B, place+temporal at 6.07, sits between — it's a matrix but a small, high-value one: 133 pages across major cities only.)*

**Every single-dimension page type outperforms every multiplied page type.**

That is a sharper and better-evidenced lesson than "time never gets a URL":

> **The problem was never time. It was multiplication.**
> Pages that answer one question do well. Pages generated by crossing two lists do badly — and there are always far more of them.

This also maps cleanly onto Google's doorway wording — *"multiple pages for specific regions funneling to one page"* describes a city×date matrix precisely, and describes a standalone date page not at all.

**Note the honest counter-consideration:** occurrence pages still produced 795 clicks in total. Removing a page type removes its clicks unless the intent genuinely re-lands somewhere else. That remains a bet, not a certainty.

---

## 4. What this suggests for v2 (suggests — nothing decided)

- **Time deserves URLs where the question is single-dimension and durable.** `/maerkte/2026-05-14` earned its place. `/maerkte/2026-07-25/bern` did not.
- **The year matters more than we thought.** 47% of clicks. Whatever the structure, "which markets in 2026" needs a clear answer somewhere.
- **Month pages are worth a proper test.** Best clicks/page after place hubs, on a 2-page sample. Cheap to test, potentially significant.
- **Occurrence pages are the expensive habit to break** — 531 pages for 795 clicks.
- **Dates must be concrete and filterable on the site regardless of storage.** People search `2.8.26`. They will filter by date. Any data design has to serve that; how recurrence is stored underneath is a separate, later question.
- **"heute"/weekday intent is real but hard.** Poor positions suggest we never won it. Worth understanding *why* before either investing or abandoning.

---

## 5. What this data cannot tell us

Being honest about the limits:

- **Switzerland only.** German search behaviour may differ in shape and volume. Unverified.
- **GSC truncates.** 1,000 rows is the head; the long tail is invisible.
- **It reflects what fleafind.ch had pages for.** We can't see demand for page types that never existed — the classic survivorship problem. Zero evidence here about facet queries (`nachtflohmarkt`, `kinderflohmarkt`, `hallenflohmarkt`) because there were no such pages.
- **No vendor-side queries visible** — again, no pages existed.
- **Pre-collapse only.** Says nothing about what changed on 22 August.

### Worth doing next

1. Real German keyword volumes (Keyword Planner) — never verified, flagged as open question in the brief.
2. Test whether facet demand exists (`kinderflohmarkt berlin`, `hallenflohmarkt nrw`) — relevant to the winter/indoor idea and the facet axis in `ARCHITECTURE_IDEAS.md`.
3. Understand why `heute`/weekday queries ranked so poorly.

---

# Part 2 — German Market Evidence (added 2026-08-27)

**Method:** Google autocomplete via `www.google.de` (`hl=de-DE&gl=de`). Suggestions are ordered by real query popularity, so **rank is a relative-volume proxy** — not absolute numbers. Free, live, and directly reflects German behaviour. Keyword Planner volumes still worth getting; this is not a substitute for them.

**Headline: Germany does not search like Switzerland.** Several of the Swiss conclusions do not transfer.

---

## 6. Proximity beats geography — "in der Nähe" dominates

`in der Nähe` ("nearby") is the **#1 or #2 suggestion for almost every seed term**:

| Seed | Rank of "in der Nähe" |
|---|---|
| `kinderflohmarkt` | **#1** |
| `hallenflohmarkt` | **#1** |
| `flohmarkt` | #2 (plus "heute in der Nähe" at #4) |
| `antikmarkt` | #2 |
| `trödelmarkt` | #3 |

Expansions of `flohmarkt in der nähe`: *heute · sonntag · morgen · am wochenende · **jetzt geöffnet** · 2026 · samstag · dieses wochenende · termine*.

**This is direct evidence for the radius thesis in `ARCHITECTURE_IDEAS.md` Part 2.** Users do not think in city boundaries — they think in distance from where they are. Every competitor organises by city or postal code. Nobody organises by proximity.

## 7. "Jetzt geöffnet" — the query nobody serves

`flohmarkt jetzt geöffnet` is the **#1 expansion of "flohmarkt jetzt"**, and appears again inside the proximity cluster (`flohmarkt in der nähe jetzt geöffnet`, `flohmarkt heute jetzt geöffnet`). There's even `flohmarkt jetzt geöffnet top bewertung`.

This is a **real-time** question: *is a market happening right now, near me?* It is:
- high intent (the user is ready to leave the house)
- completely unserved by static listing sites
- exactly what a live, verified-freshness dataset can answer and a stale one cannot
- the strongest link yet between the freshness loop and actual user demand

## 8. Bundesland is a major page type — Switzerland never showed this

Region-level queries are large and consistent across states:

`flohmarkt nrw` · `bayern` · `niedersachsen` · `hessen` · `saarland` · `schleswig-holstein` · `mv`

Each expands the same way: *heute · sonntag · morgen · **2026** · termine · dieses wochenende · samstag · wochenende*. Bayern even surfaces `flohmarkt bayern 25.05` and `17.05` — **specific dates at state level**.

Swiss cantons are small enough that this layer barely existed. German Bundesländer are the size of small countries, and the demand is real. **A geographic level we had no evidence for now looks significant.**

Also spotted: `flohmarkt niedersachsen pfingsten` — **public holidays as a temporal facet**. Pfingsten, Ostern, Himmelfahrt are natural flea-market peaks and are recurring, durable, searchable questions.

## 9. Facets are real — and each behaves differently

Not one generic category axis. Each facet has its own geography and its own shape:

| Facet | Pattern |
|---|---|
| **kinderflohmarkt** | Proximity #1, then big cities + NRW. Broad national demand |
| **hallenflohmarkt** | Proximity #1, then **individual venues** (Hauset, Delitzsch, Aschaffenburg, "an der Arena"). Venue-led |
| **nachtflohmarkt** | **City-led**, no proximity until #15. Hamburg, Erfurt, München, Magdeburg + venue (Rindermarkthalle) + `2026` |
| **trödelmarkt** | **Overwhelmingly NRW** — köln, dortmund, düsseldorf, krefeld, duisburg, mönchengladbach, neuss, hamm |
| **antikmarkt** | Leipzig-led, `termine` at #5, crosses borders (Tongeren, BE) |

**`Trödelmarkt` is a regional dialect term, not a synonym.** It is NRW's word for the same thing. Treating flohmarkt/trödelmarkt/antikmarkt as interchangeable labels would be a linguistic and SEO mistake — they carry different regions, different intents, different venue-vs-city behaviour.

**Note:** the winter/indoor idea gets partial support — `hallenflohmarkt` has real standalone demand with proximity as its top expansion. Whether it *peaks in winter* is still unverified; that needs Trends data, not autocomplete.

## 10. Vendor demand is visible in autocomplete

Direct evidence for `IDEAS.md` §1, which was previously research-backed but demand-unverified:

- `flohmarkt stand` → **#1 `stand mieten`**, then `stand mieten berlin`, `standgebühr`, `stand gestalten`, `stand mieten hamburg`, `stand aufbauen`, `stand mieten köln`, `stand buchen`, `stand in der nähe`
- `flohmarkt standplatz` → `mieten`, `buchen`, `preis`
- `flohmarkt anmelden` → berlin, hamburg, köln, leipzig, münchen, bielefeld, saarland, kiel, karlsruhe, braunschweig
- `flohmarkt verkaufen` → `anmelden`, `in der nähe`, hamburg, köln, `tipps`, münchen, `kleidung`, stuttgart, berlin
- `trödelmarkt stand mieten` → köln, düsseldorf, duisburg, mönchengladbach, krefeld, nrw, dortmund, neuss (**all NRW**), plus `ikea trödelmarkt stand mieten`, `p1 trödelmarkt stand mieten`

The queries exist, they are **city-scoped** (so they are servable with pages), and they are commercial. This moves the vendor thesis from "interesting hypothesis" to "measurable demand." It does **not** yet tell us whether these people would pay for a tool — the five-vendor conversation in `IDEAS.md` §1 is still the right next step.

---

## 11. Important refinement to the "multiplication" lesson

Part 1 §3 concluded: *single-dimension pages good, multiplied pages bad.* The German data forces a refinement.

German autocomplete shows **enormous demand for region × time**: `flohmarkt nrw heute`, `flohmarkt bayern 2026`, `flohmarkt niedersachsen dieses wochenende`. Those are multiplied pages, and they are clearly wanted.

Yet in the Swiss data, city × weekday was the worst-performing page type on the site (1.00 clicks/page).

**The difference is not multiplication. It is whether the resulting cell has enough content behind it.**

- `flohmarkt nrw heute` → potentially dozens of markets. Rich, useful, genuinely answers the question.
- `flohmarkt aarau sonntag` → often zero or one market. Thin by construction.

So the better formulation:

> **A page earns its URL when the cell behind it is reliably full — not because of how many dimensions it combines.**
> Multiplication is dangerous because it *usually* produces empty cells, not because combining dimensions is wrong.

This is also enforceable in a way the old rule was not: a minimum-content threshold can be computed and checked automatically, per page, at build time. Big geography × time is fine. Small geography × time is not. The machine can tell the difference; a blanket rule cannot.

---

## 12. Revised list of what still needs verifying

1. **Absolute volumes** — Keyword Planner. Autocomplete gives rank, not size.
2. **Seasonality of `hallenflohmarkt`** — Google Trends. The winter thesis is untested.
3. **Where the content threshold actually sits** — how full is "full enough"? Needs real German market density data per region.
4. **Whether vendors would pay** — autocomplete proves interest, not willingness. Five conversations.
5. **Why `heute` ranked badly for fleafind.ch** despite being Germany's #1 suggestion — was that a fleafind weakness or a hard SERP? This matters a lot, because `heute` + `in der Nähe` + `jetzt geöffnet` together look like the centre of German demand.


---

# Part 3 — Was it page count or thin pages? (2026-08-27)

The load-bearing question, because every finding in Parts 1–2 points toward *more* page types (radius, facets, Bundesland, holidays, dates, months) and that is exactly the direction that may have killed fleafind.ch.

## 13. The concentration data

From the same 90-day pre-collapse export (top 1,000 pages by clicks, out of ~8,500 indexed URLs):

| Top N pages | Cumulative clicks | % of export |
|---|---|---|
| 10 | 1,669 | **41.4%** |
| 25 | 2,412 | 59.8% |
| 50 | 2,876 | **71.3%** |
| 100 | 3,254 | **80.7%** |
| 200 | 3,577 | 88.7% |
| 300 | 3,754 | **93.1%** |
| 500 | 3,954 | 98.1% |
| 750 | 4,032 | **100.0%** |

Beyond rank ~750, **zero clicks**. Ranks 900–1000 averaged 0.00 clicks and ~11 impressions per page over 90 days.

Within the top 1,000 pages:
- **422 pages got zero clicks**
- **723 pages (72%) got ≤1 click**

And the ~7,500 URLs that didn't make the top 1,000 all sat below that — **0 clicks, under 10 impressions in 90 days.**

### The summary number

> **~8,500 URLs. Roughly 250 of them produced 92% of all clicks.**
> **About 7,750 URLs — 91% of the site — produced essentially nothing.**

## 14. So: count, or thinness?

**Neither, and this is the important part — they were the same failure wearing two faces.**

The dead pages were not thin because someone wrote them badly. They were thin **by construction**: a page like `/maerkte/sonntag/aarau` existed because "sonntag" × "aarau" is a *valid combination*, not because there was anything to put on it. The generator created cells before knowing whether they contained anything.

- "Too many pages" is a symptom.
- "Thin pages" is a symptom.
- **The disease is that pages were created by combination rather than by content.**

That distinction matters enormously for v2, because it means the fix is not a page-count budget — a budget would have blocked date pages (14.8% CTR, the best-converting type on the site) just as readily as it blocked the dead matrix.

### The inversion

> **A page should exist because there is content for it — not because a URL pattern permits it.**

Same page *type*, different instances:
- `flohmarkt nrw heute` — dozens of markets behind it. Real page, gets built.
- `flohmarkt aarau sonntag` — nothing behind it. Never gets generated at all.

The page type is not the problem. **Blind generation is.** This is checkable by a machine at build time in a way that "don't have too many pages" never was.

## 15. Does adding content fix a thin page?

Delfim's question, and the answer is: **only sometimes, and the distinction is sharp.**

- If the page is thin because **nobody asks the question** → adding content is exactly what Google's scaled-content policy describes. Padding a page nobody searches for makes it worse, not better. Delete it.
- If the page is thin because **the question is asked and our answer is poor** → adding real content is correct and valuable. That's a genuine investment.

The 7,750 dead URLs were overwhelmingly the first kind. `/maerkte/sonntag/aarau` didn't fail from insufficient prose; it failed because approximately nobody searches for markets in Aarau on Sundays, and there weren't any.

## 16. What this means for the findings in Parts 1–2

Delfim's worry — "this seems like creating a lot of pages" — is right to raise and resolves cleanly:

| Finding | More pages? | Verdict |
|---|---|---|
| Radius / "in der Nähe" | **No** — served by geolocation + query params, zero new URLs | Safe, and the biggest opportunity |
| "Jetzt geöffnet" | **No** — a live state on existing pages | Safe |
| Facets (kinderflohmarkt etc.) | Some — but each is a real standing query with real inventory | Safe *if* density-gated |
| Bundesland | ~16 per country. Trivial count, large demand | Safe |
| Holidays | A handful per year, recurring | Safe |
| Date pages | Real count, but best CTR on the site | Safe *if* density-gated |
| Bundesland × time | The multiplication risk — but big cells | **Density-gate strictly** |
| City × weekday, market × date | This is what died | Don't rebuild |

**Most of what the German research surfaced is not page-count growth at all.** The two strongest opportunities — proximity and open-now — need *zero* new URLs. They are UX and data-freshness problems, not page problems.

## 17. The SERP reality check on "heute" / "in der Nähe" — SUPERSEDED 2026-08-27

> **This section was wrong in its mechanism and is superseded by `SERP_EVIDENCE.md`, which is based on observed German SERPs rather than inference.**
> There is no Local Pack on `flohmarkt heute in der nähe` or `flohmarkt nrw heute`. The clicks are absorbed by **AI Overviews** instead — on `nrw heute` the Overview gives market name, address and opening times outright. And flea markets **do** hold Google Business Profiles with real review counts, contrary to the reasoning below.
> Kept for the record of how the reasoning went wrong.

Bad news, and it needs saying plainly.

- **Local searches ("near me", hours, address) are ~72% zero-click**, absorbed by the Local Pack and knowledge panels.
- Local pack ranking is proximity + relevance + prominence — built for **businesses with Google Business Profiles**.
- Recurring flea markets are **events**, not businesses. Most have no GBP. So the local pack for `flohmarkt in der nähe` tends to surface permanent second-hand shops and Trödelhallen — *not* the Sunday market the user actually wants.

This explains fleafind.ch's position ~11.5 on `heute` queries: it was ranking below a local pack that had already consumed most of the clicks.

**The uncomfortable conclusion:** the largest pool of German demand (`heute` + `in der Nähe` + `jetzt geöffnet`) is *structurally hard to win through organic web results*, no matter how good our pages are.

**The interesting counter-conclusion:** it is simultaneously the demand pool where the Local Pack gives users a *wrong answer* — shops instead of markets. That gap is real. But capturing it probably runs through owned and agent channels (newsletter, saved markets, calendar export, WebMCP tools, app-like return visits) rather than through ranking a web page. Which is also, conveniently, the "never be 100% Google-dependent again" requirement from the brief.

**This needs verifying with real SERP screenshots before being treated as fact** — it is inference from local-pack mechanics plus fleafind.ch's observed positions, not a direct observation of German results.

---

# Part 4 — SERP verification attempt & new competitors (2026-08-27)

## 18. Could not verify the Local Pack claim — status: still inference

Attempted to observe real German SERPs directly. **Failed, and the §17 conclusion remains unverified inference.**

- `google.de` served a bot-detection interstitial. Not bypassed — solving it is off-limits and it would have produced unreliable results anyway.
- Bing returned results but **geolocated to Amsterdam** (the machine's IP is Dutch), so "nearby" results were Dutch/Amsterdam-skewed and say nothing about German local intent.

**§17 (Local Pack absorbs ~72% of "near me" clicks; flea markets are events without Google Business Profiles, so the pack returns shops rather than markets) is still reasoning from published local-pack mechanics plus fleafind.ch's observed position ~11.5 — not a direct observation.**

### How to actually settle it — 2 minutes, needs Delfim

Search these on a German connection (or phone on German mobile data) and screenshot the whole first screen:

1. `flohmarkt heute in der nähe`
2. `flohmarkt in der nähe jetzt geöffnet`
3. `flohmarkt nrw heute`
4. `flohmarkt berlin sonntag`

What to look for:
- **Is there a Local Pack / map at the top?** If yes, how far down does the first organic result sit?
- **What's IN the pack — permanent shops/Trödelhallen, or actual recurring markets?** This is the crux. If it's shops, Google is returning the wrong answer and there's a real gap. If it's markets, the pack is winnable and our approach needs rethinking.
- Is there an AI Overview, and who does it cite?
- Which sites hold the top 3 organic spots?

This single check decides whether the largest pool of German demand is reachable or not. It is the highest-value 2 minutes available right now, and it needs a human on a German IP.

## 19. Two competitors found that weren't on the list

### heuteflohmarkt.de
Domain literally means "today flea market", with `/flohmarkt-in-der-naehe` as a page. **Someone has built a site around precisely the query cluster identified in Part 2** (`heute` + `in der Nähe`). Returned 403 to automated fetch — needs a manual look. Its existence means this intent is already contested, not open ground.

### meine-flohmarkt-termine.de — and it matters
Runs a large facet × geography matrix:
- ~**60 event types** (Kinderflohmarkt, Antikmarkt, Weihnachtsmarkt, Basar, Kunsthandwerkermarkt…)
- × **10 PLZ zones**, **16 Bundesländer**, **20+ cities**
- URLs like `/veranstaltungsarten/kinderflohmarkt/plz-gebiet/0`, `/de/bundesland/bayern`, `/ort/hamburg`

That is **thousands of combinations, many of them necessarily sparse** — structurally the same pattern that fleafind.ch died from, at larger scale.

**This is a genuinely important test of our thesis, in both directions:**
- If they are ranking well and holding traffic, then "blind combination generation kills you" is **weaker than Part 3 claims** — and the fleafind.ch collapse needs a different explanation.
- If they are struggling or have been hit, it is strong independent confirmation.

**Neither is known.** Their visibility trend is worth checking (Sistrix/SEMrush German visibility index would settle it quickly). Until then, Part 3 §14 should be treated as a well-evidenced hypothesis about *our own* data rather than a general law.

## 20. Honest status of every major claim so far

| Claim | Evidence | Status |
|---|---|---|
| 65% of clicks carry a temporal signal (CH) | Own GSC | **Measured** |
| Date pages had best CTR; occurrence pages were the bloat (CH) | Own GSC | **Measured** |
| ~250 pages produced 92% of clicks; ~7,750 URLs produced nothing | Own GSC | **Measured** |
| "in der Nähe" dominates German autocomplete | Google suggest, live | **Measured** (rank, not volume) |
| "jetzt geöffnet" is a top German expansion | Google suggest, live | **Measured** (rank, not volume) |
| Vendor queries exist and are city-scoped | Google suggest, live | **Measured** (demand, not willingness to pay) |
| Bundesland is a major query layer | Google suggest, live | **Measured** |
| ~~Local Pack absorbs the "nearby/today" clicks~~ | Observed German SERPs | **DISPROVEN** — AI Overviews absorb them instead; see `SERP_EVIDENCE.md` |
| ~~Local Pack returns shops rather than markets~~ | Observed German SERPs | **DISPROVEN** — map results were real markets with GBPs and reviews |
| Blind combination generation is what killed fleafind.ch | Own GSC + Google policy wording | **WEAKENED** — meine-flohmarkt-termine.de ranks #1 across the board with thousands of thin facets. Sistrix check now top priority. See `SERP_EVIDENCE.md` §4 |
| Absolute German search volumes | — | **Unknown** |
| Whether `hallenflohmarkt` peaks in winter | — | **Unknown** |

---

owner: Delfim
last_reviewed: 2026-08-27
status: analysis, nothing decided
