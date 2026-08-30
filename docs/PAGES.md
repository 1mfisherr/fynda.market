# Pages

Which pages exist, why, what is on each one, in what order, and why. Nothing ships without a reason on this page.

Decided 2026-08-29 from v1's own data, not from taste: 90 days of Search Console (1,000 queries, 1,000 pages, 4,032 clicks), 12,379 first-party events, 6,329 outbound clicks, and the 161-market catalogue. Method note: the GSC export caps at 1,000 rows, so page-type totals below cover v1's **best** 1,000 URLs out of ~8,500 — the tail is worse than it looks here, not better.

---

## The seven facts everything else follows from

**1. The home page is not the front door.** 387 of 9,237 page views — **4%**. People arrive from Google onto a city or market page. A home page designed as the entrance to the site is designed for 4% of visitors.

**2. Nobody searched.** 64 on-site searches in 26 days, most of them a single letter (`t`, `Z`, `F`). Filters were used 4× more (281). **A search box is not the hero here.** Booking's search-first home works because their visitors arrive by brand and must express intent on site; ours arrive from Google having already typed it.

**3. The job is "get me there".** Detail pages produced more than one outbound click per view (occurrence 145%, market 87%). The split: **maps 55%, organiser website 45%.** City, date and home pages produced *zero* — they only route inward. Getting someone from a list to a market page, then out to directions, is the entire funnel.

**4. City pages are the best-earning page type by a distance** — 25.5 clicks per page, against 4.9 for market pages and 1.5 for the per-date pages that killed the site.

**5. Search intent is place-and-time, not category.**

| Intent | Share of clicks | CTR |
|---|---|---|
| Place or market name | 40.4% | 2.50% |
| **City + year** (`flohmarkt luzern 2026`) | **37.7%** | 3.09% |
| **Explicit date** (`flohmarkt 2.8.26`) | 8.4% | **17.51%** |
| Time word (`heute`, `sonntag`) | 8.4% | 2.84% |
| Category (`kinderflohmarkt`) | 1.8% | 1.43% |
| Nearby (`in der Nähe`) | **0.4%** | 2.62% |

Two surprises worth acting on. **Explicit-date queries convert at seven times the site average.** And **"nearby" earned almost nothing** — it is the top autocomplete suggestion in Germany, but v1 never ranked for it. Radius search is an on-site convenience, not an acquisition channel, until evidence says otherwise.

**6. Mobile is 81% of clicks**, and converts twice as well as desktop (4.08% vs 2.04% CTR).

**7. The data is good enough to build real pages.** Of 161 markets: descriptions 100% (avg 384 chars), opening times on 98% of dates, website 95%, organiser 94%, entry fee 97%. **Photos are the one real gap** — every `image_url` is a shared generic file (`/images/alpin-flohmi.webp` covers 8 different markets) or a Pexels stock photo. There is no per-market photography.

---

## Home — `/de/`

**Who lands here:** brand and direct traffic, plus the head term `flohmarkt schweiz`. 4% of visitors. Do not optimise the site around it, and do not starve it either.

**The job:** answer "what is on soon, near the big cities" in the first screen, and be credible enough that someone trusts the rest.

| Block | Why it is there |
|---|---|
| Wordmark + saved markets | Minimum chrome. The accent dot is the only colour above the fold besides dates |
| **Headline + one line of promise** | This is the 4% who may not know what the site is. "Mit Daten, die stimmen" is the entire positioning |
| **Place + period + radius control** | Not a free-text search box (fact 2). A control that says where and when, because those are the two axes people actually filter on. Submits to a filter view, never a new indexable URL |
| **Date chips** — Alle / Heute / Wochenende / Nächste Woche | The settled vocabulary of the category, and the filter people actually used |
| **"Dieses Wochenende" rail** | Most flea markets are weekend events. This is the answer to the most common unstated question |
| **"Kommende Termine" list** | Chronological, day-grouped — universal in this category, and the shape people expect |
| Category tiles | **Weak evidence: 1.8% of clicks.** Kept because they teach a first-time visitor what the site covers, but they sit *below* the lists, not above them. First candidate to cut if they earn nothing |
| Organiser CTA | The supply side is the revenue thesis, and it must exist from day one |
| Bottom bar | Mobile is 81%. Thumb-reach navigation, and it keeps "Veranstalter" permanently visible |

Then, below the markets: **city list with counts, canton list, market types, "Woher unsere Daten kommen" (three steps), live numbers, newsletter, organiser CTA, FAQ, and a proper footer.**

**Corrected 2026-08-29.** An earlier version of this doc kept the home page to one screen and ruled out city link lists as a doorway pattern. Both were wrong. Eventbrite, Tutti, Vinted and meine-flohmarkt-termine all run long home pages ending in place and category link lists — MFT alone lists 10 postal areas, 20 cities, 16 Bundesländer and ~60 categories. A curated list of cities that have markets is navigation, and it points at our best-earning page type. The doorway problem was *generated combinations* — city × weekday × category — not links to pages that exist. What we still will not copy is MFT's 60 categories; ours is five.

**Deliberately not here:** a big search field, a map, and a newsletter box above the fold (1.1% conversion does not earn that space).

**Measured by:** click-through from home into a market page.

---

## Market page — `/de/markt/[slug]/`

**Who lands here:** name and venue queries (40% of clicks) — `flohmarkt mosergarten schaffhausen 2026`, `flohmarkt münsterplatz`. The highest-intent visitor on the site.

**The job:** confirm it is really happening, then get them there. Nothing else.

| Block | Why it is there |
|---|---|
| Photo or illustration | Never a stock photo (fact 7). The illustration is the honest default |
| Kind + city, then the name | Orientation before identity |
| **Next date, in the accent colour** | The one fact they came for |
| **Freshness line — "Bestätigt am 12.08."** | The single thing no competitor in three countries does. It is the trust signal and the sentence an AI answer can quote |
| **Cancellation notice, when it applies** | With the reason and the next real date. Only 12 of 2,357 v1 dates were cancelled — rare, and the highest-value thing we will ever tell someone |
| **Directions button — primary** | 55% of all outbound clicks. This is the conversion |
| **Organiser website — secondary** | 45% of outbound clicks. It earns a real button, not a footnote link |
| All upcoming dates, with status | Visible content, never markup (one `Event` only). Capped at 120 days |
| Address, times, entry fee | Held for 94–98% of markets |
| Report-a-correction | Feeds the freshness ledger, and it is cheap trust |

**Deliberately not here:** related-market lists (a doorway pattern), reviews, ratings, an embedded map (weight, for a link that 55% will click anyway).

**Measured by:** outbound clicks per view. v1 did 87–145%; that is the bar.

---

## City page — `/de/schweiz/[city]/`

**Who lands here:** the biggest and best-converting segment — `flohmarkt luzern 2026` was v1's single best query (148 clicks, 15.7% CTR). 38% of all clicks carry a city and a year.

**The job:** be the complete, current answer for "flea markets in this city", and route people to the right market fast.

| Block | Why it is there |
|---|---|
| **`Flohmärkte in Luzern 2026` as the H1 and title** | The year is in 38% of queries. Omitting it forfeits the match |
| One line: how many markets, how many upcoming dates | Immediate proof the page is not empty |
| Date chips | Same control as home. Filters, never URLs |
| **Chronological list, grouped under day headings** | Universal in the category. Nobody sorts by relevance |
| Each row: name, date + time in accent, venue, freshness, status | The card doing its one job |
| **A cancelled market stays in the list** | Struck through, with the reason. Removing it is what every competitor does and it is why they cannot be trusted |
| Short city context paragraph | Real facts only — which markets are weekly, which are seasonal. Never generated padding (`ARCHITECTURE.md` §Generated prose) |
| Newsletter signup, **after** the list | 1.1% conversion means it belongs where intent is highest, not at the top |

**Deliberately not here:** an `Event` block of any kind, a list of nearby cities (doorway risk), category sub-pages.

**Measured by:** clicks per page against v1's 25.5, and click-through into market pages.

---

## Region page — `/de/schweiz/[canton]/`

**Honest position: this is the weakest of the four, and it is built for Germany, not Switzerland.**

German demand for `flohmarkt nrw` and `flohmarkt bayern` is large and measured. Swiss canton demand never appeared in v1's data — though v1 had no canton pages, so this is absence of evidence, not evidence of absence.

**The job:** catch Bundesland-level queries at German launch, and cover the gap between "my city has nothing" and "the whole country".

Same blocks as the city page, plus a **list of cities in the canton that actually have markets** — the one place a place-link list is legitimate, because it is a genuine parent-child relationship rather than an invented facet.

**Ship them, keep them thin, and check after four weeks.** If Swiss canton pages earn nothing by then, they stay published for Germany and stop being a Swiss concern.

---

## Not built, and why

| | |
|---|---|
| **Per-date market pages** | 529 of v1's top 1,000 URLs at 1.5 clicks each. This is the thing that killed the site. The content — a specific date — lives on the market page as a row |
| **National date pages** (`/de/termine/2026-09-14`) | **The strongest future candidate.** Explicit-date queries convert at 17.5%, and a national page is always full so the density risk is near zero. Month 2, through the graduation gate |
| **City × weekday** (`/luzern/samstag`) | Genuinely earned on v1 — 6.1 clicks/page, better than market pages. But it is small-geography × time, the exact shape that produced the bloat. Region × time first; city × weekday only if that succeeds |
| **Category pages** | 1.8% of clicks. Not worth a URL |
| **A map page** | A view, not a front door. Nothing in the data suggests demand |
| **A second language** | v1's English pages earned 558 clicks — real, but a locale exists when its content exists, not when the template does |

---

---

## The approved design

**`design/fynda-v5.html`, approved 2026-08-30.** A departure board, not a card list.

- **The date leads.** The day number is set at display size and heads its own band; the time is a detail inside the row. 38% of clicks carry a date.
- **Colour means the type of market**, carried as a rail and a two-letter code, with a legend (`BRAND.md`).
- **A cancelled market keeps its slot**, struck through, greyscale, with the reason and the time it was reported. Real timetables show cancelled services; every competitor deletes them.
- **Photographs** in a row thumbnail, a market-page hero, and a strip showing the place at different hours.
- No thumbnail-chevron rows, no cards, no `card`/`pill`/`tile`/`chip` vocabulary.

### The fields we do not have

The mockup shows stall counts, seller mix, packing-up times, dogs, toilets and travel advice. **We hold none of them.** They came from research into what decides a trip, not from our data.

The rule for building it: **a block renders only when its data exists.** No placeholder, no "unbekannt" row, no invented figure. A market page with four facts and a confirmed date is honest and still better than every competitor. Where a gap is worth filling, the page offers the one-tap way to fill it — an organiser or a visitor answering is how the field gets populated, and that is the collection mechanism, not a decoration.

## What goes inside a block

Researched from NN/g and Baymard listing studies, 2026-08-29. Sources at the bottom.

**The deciding attribute is the date.** NN/g found price is the one thing every user asks for, across 22 years of testing. Every listing product has an equivalent. Ours is the date and whether it is happening — not the entry fee, which is free or trivial and decides nothing. That is why the accent colour is on dates and status and nothing else.

**Three attributes decide whether someone travels, and we hold none of them:** distance, size (roughly how many stalls), and indoor/outdoor. Distance is computable in the browser. Size and indoor/outdoor get captured during the import and the verification visits. Worth more than any layout change.

**Cards need the same fields in the same order, every time.** Baymard found 64% of sites are inconsistent here, and in testing people left — gaps read as a poor selection rather than missing data. Practical effect: the recurrence phrase (79% coverage) comes off cards and lives on the market page.

**Each attribute is its own element**, never one run-on line, and never inside the title — 40% of sites get this wrong. Name, date, place, status are four things with four treatments.

**Three status badges, no more:** Bestätigt · Nicht bestätigt · Abgesagt. NN/g put the clutter limit at 2–3. So no "Neu" or "Beliebt" badge — it would cost the meaning of the three that matter.

**Above the fold carries what, when, is it on, and the main action.** 57% of viewing time is spent there, and a first screen that is too dense gets read by nobody.

### What visitors actually care about

From 636 reviews of 90 markets across Zürich, Berlin, Hamburg, Munich, Cologne, Frankfurt, Düsseldorf and Stuttgart, 2026-08-29. Percentages are how often a concern appears.

| Concern | Reviews | Do we hold it? |
|---|---|---|
| **Size / stall count / how long it takes** | **51%** | No |
| Price level, and whether haggling is normal | 38% | No |
| **Private sellers vs professional traders vs Neuware** | **28%** | No |
| Timing — when to arrive | 22% | Only official hours |
| Food on site | 22% | No |
| Weather, covered vs open air | 21% | No |
| Crowding | 19% | No |
| Goods quality (Ramsch / Neuware) | 17% | No |
| Dates, frequency, season | 17% | **Yes** |
| Getting there, parking | 10% | Address only |
| Kids, strollers | 9% | No |
| Toilets | 2% | No |
| Dogs | 2% | No |
| Entry fee | 1.5% — but the angriest reviews on the internet | **Yes** |

**We hold the two things everyone already publishes, and almost nothing people actually decide on.** These are the fields the import and the verification visits have to capture. In rough order of value:

1. **Stall count**, plus a bad-weather figure — "bei nicht optimalem Wetter ist nicht die gesamte Fläche mit Ständen gefüllt".
2. **Who is allowed to sell** — private only / mixed / trader-heavy / Neuware allowed. The strongest quality axis in the corpus and nobody publishes it. Visitors' own shorthand for a bad market is "Handyschalen".
3. **Price level**, partly derivable: visitors state the mechanism themselves — "horrende Standmieten treiben die Verkaufspreise in die Höhe". Publishing the stall fee is a buyer-side signal disguised as an organiser fact.
4. **Real timing, not opening hours** — when the good stuff is gone, when it is busiest, when sellers start packing up. Advertised hours are wrong in both directions and everyone knows it. This is the field that cannot be scraped, which is why it is defensible.
5. **Getting there as advice, not an address** — "keine Besucherparkplätze, unbedingt mit der S-Bahn".
6. **Covered / open-air, plus ground surface** — decides shoes and strollers, and whether rain matters.
7. Dogs, toilets, stroller aisles — 2% each, binary, unavailable anywhere, and each one ruins a trip if wrong.

**People judge markets relatively, not absolutely.** The corpus is full of "besser als Mauerpark", "hochwertiger als sein kleiner Bruder auf dem Kanzleiareal", "am Mauerpark ist doch mehr los". A same-day side-by-side of nearby markets on size, seller mix and price matches how the decision is actually made — and it is a page type, not a field.

**The question people are actually asking is "lohnt sich das?"** It is in eight German YouTube titles verbatim — *FLOHMARKT LOHNT SICH DAS NOCH?*, *Lohnt sich noch der Flohmarkt Besuch?*, *Krasses Regenwetter — Hat es sich gelohnt?* — and whole blog posts are framed around it. That is the decision being made before someone gets in the car, and it is the sentence our pages have to answer. Not "when is it on" — "is it worth the trip".

**And the incumbent has publicly given up on accuracy.** flohmarkttermine.ch's own home page: *"Bitte bei Fragen zu einzelnen Anlässen immer direkt die entsprechenden Veranstalter kontaktieren, n i ch t uns!!!"*

### What we hold, and how much of it

Measured from the v1 database: name, date, city, status 100% · times 98% · entry fee 97% · organiser website 95% · organiser name 94% · recurrence phrase 79% · confirmed-on date 62% · **real photos 0%** (every image is a shared generic file or stock).

### Ideas, decided

**Build:** size dots, indoor/outdoor, distance on card, save/merken.
**Later:** reliability score ("ran 11 of its last 12 dates" — nobody else can compute this, our ledger can), "jetzt geöffnet", calendar export as a quiet control.
**Maybe:** weather — real decision value outdoors, but a wrong forecast damages the trust we sell, and it means nothing until indoor/outdoor exists.
**No:** reviews, ratings, related markets, embedded map, share buttons, entry fee on cards, badges beyond the three.

### Sources

[The Anatomy of a List Entry](https://www.nngroup.com/articles/list-entries/), [Defer Secondary Content for Mobile](https://www.nngroup.com/articles/defer-secondary-content-for-mobile/), [Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/) and [Trustworthiness in Web Design](https://www.nngroup.com/articles/trustworthy-design/) — NN/g. [Product Listing Information](https://baymard.com/blog/list-item-design-ecommerce) — Baymard.

---

## What this changes in what is already built

1. **Directions becomes the primary button on the market page, above the fold.** Measured at 375×812 it sits at 859px — below the fold, behind the whole date list — while being 55% of all outbound clicks.
2. **The organiser website needs a real button.** 45% of outbound clicks, currently not on the page at all.
3. **The home search control reads as place + period + radius**, not a text search, and it shrinks so a market card is visible in the first screen.
4. **Category tiles move below the lists.**
5. **City page titles carry the year.**
6. **The recurrence phrase comes off cards** (79% coverage).

---

owner: Delfim
last_reviewed: 2026-08-29
