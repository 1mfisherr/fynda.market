# Pages

Which pages exist, what is on each and in what order, and what was deliberately not built. The reasons are the old site's own numbers — 90 days of Search Console (its best 1,000 URLs of ~8,500), 12,379 first-party events, 6,329 outbound clicks.

---

## What v1 taught

1. **Home is not the front door** — 4% of views. People land from Google on a city or market page.
2. **Nobody searched** — 64 on-site searches in 26 days, most a single letter; filters used 281 times. No search box as hero.
3. **The job is "get me there."** Detail pages produced more than one outbound click per view: maps 55%, organiser website 45%. Lists route inward only.
4. **City pages earn most** — 25.5 clicks/page against 4.9 for markets and 1.5 for the per-date pages that killed the site.
5. **Intent is place and time, not category.** City + year 38% of clicks; explicit date 8% at 17.5% CTR; category 1.8%; "nearby" 0.4%.
6. **Mobile is 81% of clicks** and converts twice as well.
7. **The data was good** — descriptions, times, website, organiser, fee all above 94%. Photos were the one gap.

**One row per market, or one row per date — never one row per date across the horizon.** Dates get rows where the date is the question (a weekend, a chosen day); markets get rows where the market is (a town, a canton, Near me, saved), carrying `recurrence_text`. `src/lib/lists.ts`; `MarketRow` renders both shapes.

**A block renders only when it has real content.** No cancellations this week means no cancellations block. A missing fact costs one line; never a dash, never "unbekannt", never a guess — no estimated distance, no assumed open-air.

**Say the exception, never the rule.** A fact true of 96% of rows is furniture: no entry fee on rows, no type badge on an ordinary Flohmarkt, no freshness line unless it is bad news (`src/lib/freshness.ts`). Three status words — Bestätigt · Nicht bestätigt · Abgesagt — and no others.

---

## Home — `/{locale}/`

Brand and direct traffic. Job: what is on soon, near the big towns, and be credible. **It earns almost nothing from search** (1 click of 95 for the site, 7 days to 2026-09-20), which frees it to be the front door rather than a Swiss landing page.

1. Wordmark, saved markets; above 900px also Towns · Near me. A Cantons anchor exists only while there is one places block per country.
2. **The brand line** beside the headline above 900px (`BRAND.md` §Voice). Under it one quiet line for organisers with the site's pill ("Run a market? Claim your page"). No count, no proof paragraph — the page shows, it does not claim.
3. "Your town" shortcut — the town last picked, from browser storage. The same town rides in the **header of every other page** as a pill (`PlacePill.astro`): a shortcut, never a second place-chooser, hidden on the home page because this card already says it.
4. **Six markets this weekend** — two feature rows, four compact, one per town, biggest towns first, then a button to all of them (a nationwide list by clock time interleaved 22 towns at random).
   **Near a town** (`design/home-town-v1.html`): when the page knows a town it reads *This weekend near Zurich* — the six nearest of the weekend's markets within 30 km, nearest first, each with its distance, and a *Change* link to the town search. The town is the one the visitor picked, else the nearest of ours within 25 km of the connection's rough point (Cloudflare's, added to the HTML by `functions/_middleware.ts`, never stored; *Not near Zurich? Change*, because it is often a town off). No town or nothing within 30 km: the plain block. Chosen in the browser before the first paint; the button then reads *All 67 this weekend, everywhere*.
5. **The town search** (`TownSearch.astro`) — one box. Three letters find a town by the start of any word, with or without its umlaut, and by its own-language name ("Genève" finds Genf on /de/); each suggestion shows region · country · number of markets. **Near me is always the first suggestion** and asks for location on that tap, never on load. A town opens its page; the date is chosen there. Under the box, the five biggest towns. Towns only — no postcodes. It is the site's only place-chooser; it replaced four controls before a market (dropdown of every town, location button, date control, "Show 195").
6. Newsletter, then organiser CTA, sharing a row above 900px; only the newsletter button is filled — two loud asks are none.
7. Cancelled this week — only when something was.
8. **One block per country**: a flag, the country's name and counts, then that country's **towns weighted by count** (`PlaceCloud`, shared with the region page: all towns alphabetical, four weight steps, the count only above one) and its **regions as pills**. The country heading renders only when there is more than one country.
9. Five market types (what teaches the row colours) · four questions in `<details>`, answers in the HTML, folded at every width. No "where our data comes from" block: every date carries its own stamp, which is the whole argument.
10. Footer: forms, legal, saved, languages. No town list — that is block 8 again, and a bare link list is the doorway shape.

Not here: a country picker (six comparable sites — Booking, Airbnb, GetYourGuide, Eventbrite, Meetup, TheFork — were read live on 2026-09-22 and none has one; they all ask for a town, the country is a heading), **a geo redirect on the root** (two of those six guessed the wrong city from the same Zurich IP this site serves, and Google's guidance is against it; `/` keeps one unconditional redirect), a map ("gimmicky"), a big search field, a newsletter above the fold (1.1% conversion), date chips (six rows need none), "all N dates this month" (a month page does not exist). Measured by click-through into market pages.

## City — `/{locale}/{country}/[city]/`

The biggest, best-converting segment: `flohmarkt luzern 2026` was v1's best query. Job: the complete, current answer, routing fast.

**A town of one market has no page.** Its market's page is the town's page: every link to the town opens the market (`src/lib/towns.ts` `townHref`, the one place a town link is made), the town's address 301s there (`scripts/redirects.mjs`), and the page returns by itself when a second market goes live. Why: the two pages said the same sixty words about the same market and traded the query between them week by week, and Google's spam rules name "pages targeted at specific regions or cities that funnel users to one page" as doorway abuse. Booking.com keeps such pages, but its town page is a list and its hotel page a document; ours were the same thin page twice. A guardrail fails a town page that links to one market. The two blocks a thin town page carried moved onto the market page (§Market 11).

1. **H1 and title with the year of the next date** — it is in 38% of queries — plus the next date in the title. No date coming, no year.
2. One sentence naming the next market, date, hours, venue; then the count. This is also the search snippet. The page lists its own markets as an `ItemList` beside the breadcrumb.
3. The When control, only the parts with a date behind them — a chip that empties the list is a dead end — and none when the town has no date. The calendar and chips find a market on **any** of its dates, not only its next: each row carries its dates inside the horizon (`src/lib/date-rows.ts`), and a chosen day shows its markets with that day's hours.
**Under it, on a town of four or more markets, a What row**: one pill per fact the town's markets hold (*Every week 3 · For children 5 · Indoors 6 · In the evening · Antiques*), the number being how many hold it, so a pill never empties the list. One pressed at a time; it narrows the town's own rows, dated and undated, under any When, and other towns' rows step aside. Weekly is a date in each of the next three weeks; the rest from `kind`, `setting` and tags (`src/lib/town-facts.ts`). Only markets whose fact we hold are counted. A filter, not a URL; taps go to `filter_changed` as `tag`.
4. **The coming week day by day, then one row per market** — for seven days and the weekend that ends them, a market sits under every day it runs, so a weekend day's count is true; after that, one row per market at its next date (`townRows`, `src/lib/lists.ts`). Sticky day headers (weekday, date in the accent, count; a month label where the month turns). **A weekend day with nothing in town** gets up to three markets that day within 25 km, with distance, as an `<aside data-outside-floor>` (`weekendAround`); not on thin towns, which have *Within 25 km* already. One feature row, then compact rows (two features put the first name 1,300px down a phone). Each row carries what sets it apart on one quiet line — *Indoor · clothes* (indoor or both, never outdoor, and what's sold; `MarketRow showFacts`).
5. **A cancelled market stays in the list**, struck through, with the reason.
5b. **A market with no date yet stays too** — after the day groups, under *No date yet* with its rhythm line and, in the accent, when it is back or when it last ran; shown under All, hidden by any other When. The heading counts every market the town has (hiding them put "0 flea markets" over towns that have markets).
6. **Within 25 km**: on a town with fewer than three upcoming dates, up to five rows from towns within 25 km with their distance, under the same day headers, as `<aside data-outside-floor>` so they never clear this page's floor. Fewer than three within 25 km and it reaches 50 km and says so — German towns sit 30–80 km apart.
6b. **The signup card straight after the dated markets**, before *No date yet* — at the foot it sat 80% down behind every undated market and drew 0 taps. One form per page: a page with a card drops the footer's form (`Page footerSignup={false}`). **A town with nothing dated gets *Tell me when Rafz has a date*** after its own markets.
7. Type legend only when a badged kind is on the page. **A town paragraph only where one was written by hand** (`design/town-intro-v1.html`): towns of four or more markets get two short paragraphs about their own markets under the list and above *Towns nearby*, in every locale of the town (`texts` city `description`; no fallback language). Never a template — the same sentences on 174 towns is the templated text the spam update targets, and no two towns may share a sentence (`intake/town-intros/check.mjs`).
8. **Towns nearby**, before the canton link: up to six towns within 20 km (50 km where fewer than three are that close), closest first, each with distance and number of markets (`townsAround`, `src/lib/towns.ts`). A bare link list of everything stays ruled out as the doorway shape; these are a handful, each a town with a market and a page, at the foot where navigation belongs.

Not here: any `Event` markup, category sub-pages, a map. Measured against v1's 25.5 clicks/page.

## Region — `/{locale}/{country}/{canton}/[region]/`

**A canton or Bundesland needs two markets to have a page.** With one — Jura, Obwalden, Uri, Bremen — the address 301s to the market, links go through `src/lib/towns.ts` `regionHref`, and the market page shows the region as plain text; the reason is §City's. Glarus, Graubünden and Saarland list the same markets as their one town page and keep both: people search the canton and the town by different names.

Built for `flohmarkt nrw` / `flohmarkt bayern`; in Switzerland the best-earning type per page. **Towns first, with counts**, then the When control and every market in the region, one row each — dated ones first, then the signup card, then the rest under *No date yet*. No density gate: the content floor measures the rendered page. The template for every country is judged on real counts.

## Near me — `/{locale}/{nearby}/`

`RadiusView.astro`, `noindex` — a filter, not a place (`design/place-picker.html`, options 3 and 3b).
**The place in one pill at the top** — *In der Nähe von Zürich · 25 km* — **and the markets under it in distance bands** (*Bis 10 km · 10–25 km · 25–50 km · 50–100 km*), soonest first in each. Tapping the pill opens a sheet: *Use my location*, the town search, the five biggest towns, How far. Before any place is known the sheet opens by itself — an unplaced list is every market by date, 35 screens on a phone. The URL carries the answer (`?town=zurich&km=25&zeit=weekend`, or `?lat&lng`), so a list can be shared and Back works. Every market ships in the HTML; a script measures and groups.
**It starts from the URL (`?lat&lng`, `?town=`, `?denied=`); otherwise it asks the phone at once** — tapping Near me brings up the location request; if the phone says no (or has said no for good), the town this browser remembers, then the sheet. `geo_prompt` events give the allow rate. No control shows before it can do something:

| State | Says | Shows |
|---|---|---|
| Before | — | The place sheet, open; no list (only when the phone is blocked and no town is remembered) |
| Locating | "Asking your phone where you are…" | list dims |
| Located | "32 markets within 25 km, nearest first." | the pill, When, the bands, a distance on every row |
| Refused | "Your phone didn't share a location…" | the sheet again, with *Try again* |
| Blocked | "Your browser is blocking location for this site. Pick a town instead, or allow location in the browser's settings." | the sheet with the town search only — asking again fails at once, so the button goes |

## Utility — `/{locale}/{report|suggest|organiser|newsletter|…}/`

Copy in `src/lib/utility-copy.ts`, legal in `src/lib/legal/`. `noindex`, own content floor of 150.

**The signup where the page cannot know the place** (home, footer, the newsletter page): *Around which town?* — suggestions as you type, by the town search's own rule (`src/lib/town-match.ts`); only a picked or exactly typed town counts, anything else is refused in the browser and again by `/n` — never saved as "everywhere". **No distance asked:** every town subscription gets the town alone when it has five markets that weekend, else 25 km when that finds three, else 50 km (`src/lib/digest.ts`); at most eight markets, each with its photo, and *see all* for the rest. Left empty, it is every market. A canton page subscribes its canton.

**Saved** (`/{locale}/saved/`, `design/saved-mail-v1.html`): above the list, *Your markets, by e-mail* — an address, and before a weekend when one of the saved markets is on, one mail saying which, when and where; nothing when none is. Signed up, the card is one line with *Stop*. The same offer rises as a sheet on a market page after the first save in a browser — once, never on arrival (`components/SavedAsk.astro`). No footer signup on this page: one Friday offer per page. Opened from the mail's link (`?t=`), a phone takes the list kept with the address.

## Not built, and why

| | |
|---|---|
| **Per-date market pages** | 529 of v1's top 1,000 URLs at 1.5 clicks each. What killed the site. A date is a row on the market page |
| **National date pages** (`/de/termine/2026-09-14`) | **Not now.** The strongest candidate (17.5% CTR, always full), but the recovery plan adds no page types until the site is out of the spam demotion (`PLAN.md`). Through the gate, on evidence, later |
| **City × weekday** | 6.1 clicks/page on v1 — but small geography × time, the shape that bloated. Only after region × time succeeds |
| **Category pages** | 1.8% of clicks |
| **A map page** | A view, not a front door; no demand in the data |
| **Country page** | Parked; the front door carries the towns. If ever built it is a hub — the city list first, then real writing — never Eventbrite's or Meetup's, whose country pages are a heading and a feed with no city links |
