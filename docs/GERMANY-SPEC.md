# Germany — spec

Decided with Delfim 2026-09-22. Build from this in fresh sessions, one step per session; when a step is live, move what is durable into `PAGES.md` / `ARCHITECTURE.md` / `PLAN.md` and delete the part here. Mockup: `design/front-door.html` (`design/build-front-door.mjs`), phones **1A, 2, 3**. Phone 1B and the map were rejected — the map as gimmicky.

## The product shape

**Nobody is a "German visitor". They are a person in a town.** The site remembers one thing about a visitor — their place — and that setting is the country switch. Type "München" and you are in Germany; the word is never asked.

1. **The place pill.** In the header of every page, right of the wordmark: `Zürich ▾`, or `Your town ▾` before a place is known — a setting, not a question ("Where are you?" was too pushy, Delfim 2026-09-22). Tap → a sheet: the current place with its country, a town search over every town we cover (any country, suggestions show region · country · count), *Use my location*. Stored as a first-party preference cookie (a setting, not tracking — no consent; named in the privacy page in one line). Home, Near me and the newsletter form read it. Changing it re-renders the page's "near …" blocks client-side where they exist; otherwise it just navigates home.
2. **The front door — phone 1A.** `/{locale}/` when no place is remembered: *The next flea market near you.* · town/postcode search · *Use my location* · then one block per country: heading **Switzerland** with `222 markets · 14 this weekend`, a two-column list of the eight biggest towns with counts, *All 105 towns and 23 cantons →*; then **Germany** the same (before launch: *from November*, towns greyed). A small flat flag beside each country heading — the one place a flag appears; 20px, SVG in `public/brand/flags/`, the only colours outside the brand palette on the page, like category colours (Delfim asked for "some interesting visual", 2026-09-22). No dropdown, no country in the pill.
3. **Home once a place is known — phone 2.** *This weekend near Zürich* · rows with distance · *All 31 within 25 km →*. No country anywhere. *Later this autumn · Worth the drive* (big markets further away, worth a trip) is cut for now: nothing in the data says which markets are worth 200 km until organisers fill stall counts — parked in `IDEAS.md`.
4. **The country page** = the current home per country: `/en/switzerland/`, `/de/deutschland/`. This weekend, the regions, the biggest towns, the newsletter. Same template, filtered. Nothing new to design.
5. **The root.** `/` → the visitor's country page by Cloudflare's `cf-ipcountry` and `Accept-Language` when it is a country we cover; otherwise `/en/`. A tiny edge function replaces the static `/ → /de/` 301. The one new moving part.
6. **Near me ignores borders.** Basel sees Lörrach and Weil am Rhein. Distance is the only rule.
7. **Language ≠ country.** `/de/` serves Zürich and München. Every shared string that says "in der Schweiz" / "in Switzerland" moves to the country page or goes. Germany: de + en only (settled). `x-default` en.

Region, town and market pages are unchanged: the country is in the URL, breadcrumb and address, never a headline.

## Data intake — the first 50–60

Delfim, 2026-09-22: start slowly but surely; agents research the main German directories and bring in 50–60 major markets. My one condition, accepted as the way to do it: **directories are the lead list, the organiser's own site is the source.** Every market we publish has `source_page` = the organiser's page, dates and times read from there, and nothing copied from a directory — their prose is theirs, their data is what Google already has and is often wrong.

- **Which markets:** the large recurring ones people travel for, spread across ≥8 Bundesländer, weighted to demand (`PRODUCT.md`: NRW, Bayern, Berlin, Hamburg). Berlin (Mauerpark, Boxhagener Platz, Arkonaplatz, Straße des 17. Juni), München (Riem, Olympiapark, Theresienwiese Frühjahr), Hamburg (Flohschanze), Köln, Düsseldorf, Frankfurt, Stuttgart, Leipzig, Dresden, Hannover, Nürnberg, Freiburg, Konstanz — the agents confirm, not assume.
- **Per market, required:** name · venue with address and postcode · coordinates · Bundesland · rhythm line (de, en) · the next dates within 120 days · opening hours · fee · organiser name, website, e-mail if published · `source_page` · the illustration from the permanent set for now — **Delfim brings the photos later** (2026-09-22); the intake does not wait for them. Description: two or three plain sentences in the settled voice, de and en, written from facts on the source page, never lifted.
- **How:** a research agent per city works from a directory list to the organiser sites, writes one JSON file per market into `intake/de/` (shape: `intake/README.md`), with the source URL for every fact. Delfim spot-checks ten. An import script (`scripts/import-intake.mjs`, new; same matching rules as `import-v1-additions.mjs`) loads them, creates Germany → Bundesländer → towns → venues → organisers as needed, and never touches what exists. Organisers with an e-mail get a link and the *listed* welcome — after Delfim has seen the German letter's "in der Schweiz" line become the country's.
- **Floor:** no Bundesland page ships with fewer than three markets; a Bundesland with one or two stays in the tree without a page until it has more (content floor, guardrail 3).

## Build order

Each step live and proven before the next; `PLAN.md` step 6 mirrors this list.

1. ~~Intake agents + `import-intake.mjs`~~ — done 2026-09-22 with 21 markets as `unverified` (the status the build does not publish; there is no `draft`). Delfim spot-checks; more markets arrive the same way, `intake/README.md`. Open for step 2: German descriptions use ß (Munich readers), Swiss ones ss — one `/de/` locale, two spellings; decide before the shared strings are touched.
2. Germany in the tree: country row, 16 Bundesländer with de/en slugs, `/de/deutschland/…`, `/en/germany/…`. Shared strings lose the country word.
3. Region template on the real counts (a list works at 29, not at 300 — towns first, then dated markets, a cap).
4. Country page; front door 1A; the place pill; the root redirect.
5. Flip the 50–60 to `active`; hreflang for a two-locale country; sitemap; guardrails on live data; deploy. Search Console and Bing for the new paths.
6. Infrastructure before the traffic: Queues, Supabase Pro, R2 (`analytics-research/build-plan.md` phase 4).
7. German organisers: the welcome letter's country line; `ORGANISER_SENDING` already covers them.

## Open

Nothing. The three questions of 2026-09-22 are answered above.
