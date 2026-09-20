# Pages

Which pages exist, what is on each and in what order, and what was deliberately not built. The reasons are v1's own numbers — 90 days of Search Console (its best 1,000 URLs of ~8,500), 12,379 first-party events, 6,329 outbound clicks.

---

## What v1 taught

1. **Home is not the front door** — 4% of views. People land from Google on a city or market page.
2. **Nobody searched** — 64 on-site searches in 26 days, most a single letter; filters used 281 times. No search box as hero.
3. **The job is "get me there."** Detail pages produced more than one outbound click per view: maps 55%, organiser website 45%. Lists route inward only.
4. **City pages earn most** — 25.5 clicks/page against 4.9 for markets and 1.5 for the per-date pages that killed the site.
5. **Intent is place and time, not category.** City + year 38% of clicks; explicit date 8% at 17.5% CTR (7× the average); category 1.8%; "nearby" 0.4%.
6. **Mobile is 81% of clicks** and converts twice as well.
7. **The data is good** — descriptions, times, website, organiser, fee all above 94%. Photos were the one gap.

**One row per market, or one row per date — never one row per date across the horizon.** Dates get rows where the date is the question (a weekend, a chosen day); markets get rows where the market is (a town, a canton, Near me, saved), carrying `recurrence_text`. `src/lib/lists.ts`; `MarketRow` renders both shapes.

**A block renders only when it has real content.** No cancellations this week means no cancellations block. A missing fact costs one line; never a dash, never "unbekannt", never a guess — no estimated distance, no assumed open-air.

**Say the exception, never the rule.** A fact true of 96% of rows is furniture: no entry fee on rows (151 of 157 free), no type badge on an ordinary Flohmarkt, no freshness line unless it is bad news (`src/lib/freshness.ts`). Three status words — Bestätigt · Nicht bestätigt · Abgesagt — and no others.

---

## Home — `/{locale}/`

Brand and direct traffic plus `flohmarkt schweiz`. Job: what is on soon, near the big towns, and be credible.

1. Wordmark, saved markets; above 900px also Cities · Cantons · Near me (anchors until a country page exists).
2. **The brand line**, beside the headline above 900px: "You never know what you'll find. / We find the flea markets. You do the hunting." Under it one quiet line for organisers with the site's pill ("Run a market? Claim your page"). No count, no proof paragraph — the page shows, it does not claim (2026-09-19).
3. "Your town" shortcut — the town last picked, from browser storage.
4. **Six markets this weekend** — two feature rows, four compact, one per town, biggest towns first, then a button to all of them. A nationwide list by clock time interleaved 22 towns at random.
5. **The search control** (`SearchControl.astro`, 2026-09-18) — Where: a sheet of the towns under canton headings, *Near me* first, and a round button that asks for location **on tap, never on load**. When: All · Today · Weekend · Date, the count under it always true. The Show button's label is the live count and it goes to the town page carrying the date. No free text (fact 2), no radius without a point. It is the site's only place-chooser.
6. Newsletter, then organiser CTA, sharing a row above 900px; only the newsletter button is filled — two loud asks are none.
7. Cancelled this week — only when something was.
8. **Towns, weighted by count** (`PlaceCloud`, shared with the canton page): all towns alphabetical, four weight steps, the count only above one. 32 of 55 towns have one market.
9. Cantons as pills · five market types (what teaches the row colours) · four questions in `<details>`, answers in the HTML, folded at every width. The "where our data comes from" block is gone (2026-09-19): every date carries its own stamp, which is the whole argument.
10. Footer: forms, legal, saved, languages. No town list — that is block 8 again, and a bare link list is the doorway shape.

Not here: a map, a big search field, a newsletter above the fold (1.1% conversion), date chips (six rows need none), "all N dates this month" (a month page does not exist). Measured by click-through into market pages.

## Market — `/{locale}/{market}/[slug]/`

Name and venue queries, 40% of clicks; the highest-intent visitor. Job: confirm it is happening, then get them there.

1. Photo or illustration, never stock, with **Save** on it — saving and going are different decisions.
2. Kind and town, then the name.
3. **The status line in words** — *Heute · läuft gerade · endet in 6 Std.* Today and tomorrow resolve in the build; "running now" and hours left in the browser. Without JavaScript it still says Heute and the times.
4. Cancellation notice with the reason, when it applies.
5. **The decision strip:** rhythm, upcoming-date count (cancelled dates not counted), distance once the town picker stores coordinates; each segment only when it exists. Under it **the check stamp, the one line that never disappears**, in one grammar: "Checked 19 Sep" · "Confirmed by the organiser, 19 Sep" (accent) · "Not confirmed yet".
6. **Directions, primary** (55% of outbound clicks) · **Organiser website, secondary** (45%).
7. All upcoming dates — visible content, one `Event` in markup. A row carries a word only when it is an exception: Today, Cancelled, Provisional, Not confirmed yet, Confirmed by the organiser; an ordinary checked date says nothing, the stamp above said it (2026-09-19). A date in another year shows the year.
8. Address, times.
9. **"Is this your market?"** — on every unclaimed market, after the dates: claim it to confirm dates, add a photo or cancel a day; free, no account needed (Delfim, 2026-09-16). A claimed market shows the organiser stamp and one owned line — organiser · ~80 stalls · outdoors · runs in rain — each part only when the fact exists.
10. **"Something not right?"** — the report card, same name as the report page and the footer link ("Report a problem").

Not here: related markets (doorway), reviews, ratings, an embedded map, a fee line when it is free, the type legend. Measured by outbound clicks per view; v1 did 87–145%.

## City — `/{locale}/{country}/[city]/`

The biggest, best-converting segment: `flohmarkt luzern 2026` was v1's best query (148 clicks, 15.7% CTR). Job: the complete, current answer, routing fast.

1. **H1 and title with the year** — it is in 38% of queries — plus the next date in the title.
2. One sentence naming the next market, date, hours, venue; then the count. This is also the search snippet.
3. The When control, only the parts with a date behind them — a chip that empties the list is a dead end.
4. **One row per market, soonest first, grouped under sticky day headers** — weekday, date in the accent, count; a month label where the month turns. One feature row (the next market), then compact rows. Two features put the first name 1,300px down a phone.
5. **A cancelled market stays in the list**, struck through, with the reason.
5b. **A market with no date yet stays too** — after the day groups, under *No date yet* with its rhythm line, shown under All and hidden by any other When. The heading counts every market the town has. Hiding them put "Die 0 Flohmärkte" over towns and whole cantons that have markets (2026-09-20).
6. **Within 25 km** (Delfim): on a town with fewer than three upcoming dates, up to five rows from towns within 25 km with their distance, under the same day headers, as `<aside data-outside-floor>` so they never clear this page's floor. 28 of 57 towns carry it.
7. Short town paragraph, real facts only · type legend only when a badged kind is on the page · newsletter after the list.

Not here: any `Event` markup, a nearby-town link list, category sub-pages. Measured against v1's 25.5 clicks/page.

## Region — `/{locale}/{country}/{canton}/[region]/`

Built for `flohmarkt nrw` / `flohmarkt bayern` at German launch; in Switzerland the best-earning type per page (0.5 clicks/page, 7 days to 2026-09-18). **Towns first, with counts**, then the When control and every market in the canton, one row each — dated ones first, the rest under *No date yet* (as on the city page). No density gate — the content floor measures the rendered page; Schaffhausen with one market clears it. The region template for every country is decided with Germany on real counts (`PLAN.md` step 6).

## Near me — `/{locale}/{nearby}/`

`RadiusView.astro`, `noindex` — a filter, not a place. Every market ships in the HTML; a script narrows and re-sorts once it has a real point. Four states, decided above the fold, and no control shows before it can do something:

| State | Says | Shows |
|---|---|---|
| Before | "105 markets · 408 dates — by date, no distances yet" | Where, one filled *Use my location*, When, the full list by date |
| Locating | "Asking your phone where you are…" | Where reads *Locating…*, list dims |
| Located | "32 markets within 25 km of you, nearest first." | *Your location*; How far 10 · 25 · 50 · 100 (default 25); list nearest first, distance pill per row |
| Refused | "Your phone didn't share a location…" | *Try again* and the six biggest towns |

Arriving with `?lat&lng` starts located, `?denied=` refused. `geo_prompt` events give the allow rate; below ~30% the button is in the wrong place.

## Utility — `/{locale}/{report|suggest|organiser|newsletter|…}/`

Copy in `src/lib/utility-copy.ts`, legal in `src/lib/legal/`. `noindex`, own content floor of 150.

---

## Not built, and why

| | |
|---|---|
| **Per-date market pages** | 529 of v1's top 1,000 URLs at 1.5 clicks each. What killed the site. A date is a row on the market page |
| **National date pages** (`/de/termine/2026-09-14`) | The strongest candidate: 17.5% CTR and always full. Through the gate, on evidence |
| **City × weekday** | 6.1 clicks/page on v1 — but small geography × time, the shape that bloated. Only after region × time succeeds |
| **Category pages** | 1.8% of clicks |
| **A map page** | A view, not a front door; no demand in the data |
| **Country page** | Arrives with Germany, when it stops being a copy of home |

## What decides a trip, and what we hold

From 636 reviews of 90 markets (CH and DE): size and stall count 51% · price level 38% · private sellers vs traders 28% · when to arrive 22% · food 22% · covered or open air 21%. We hold dates and fees — the two things everyone publishes — and almost nothing people decide on. The question being asked is "lohnt sich das?", not "when is it on".

Fields worth collecting, in order: stall count · who may sell (private / mixed / traders) · real timing (when the good stock is gone, when packing starts) · getting there as advice · covered or open-air · dogs, toilets, strollers. Organisers supply size, setting and the rain answer today; the rest is the organiser page's next ask.

**Decided:** built — save, organiser facts (size, setting, rain). Next — distance on cards (blocked: the town picker stores a name, not coordinates). Later — reliability score ("ran 11 of its last 12 dates", only our ledger can compute it), "open now", calendar export as a quiet control. Maybe — weather, only once indoor/outdoor exists. No — reviews, ratings, related markets, embedded map, share buttons, fee on cards, badges beyond the three.

---

owner: Delfim
last_reviewed: 2026-09-19
