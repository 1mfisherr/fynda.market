# Architecture

Page types, URL shape, the data model, and the rule that keeps them safe.

---

## How to read this document

**These are defaults, not laws.** Every rule here was written to stop a specific thing that went wrong on v1. A rule that is no longer stopping that thing, or that is now stopping something good, is a bug in this document — not a constraint on the project.

Changing one is a normal move, not a transgression. The only requirement:

> **Say what the rule was protecting against, say why that no longer applies or is outweighed, change the rule and the guardrail in the same commit.**

What is *not* acceptable is silently routing around a rule, or loosening a threshold to make a build go green. That is how v1 died — not because a rule was broken, but because nobody noticed it had been.

The one thing below that is close to a law is the governing idea, because it is the direct cause of the traffic loss. Even that is a statement about *empty* pages, and it should be read that way rather than as a ban on page types.

## The governing idea

> **A page exists because there is content for it — never because a URL pattern permits it.**

Launch with the fewest page types that could not be mistaken for spam. Everything else is a filter. Filters become pages only by passing the gate below. Users lose nothing — date, radius and category filtering all work from day one; they just aren't indexable URLs yet.

---

## Indexable page types

| Page type | One per | Count (CH, per locale) |
|---|---|---|
| **Locale home** | locale | 1 |
| **Country** | country | 1 *(not built yet)* |
| **Region** | canton *that has markets* | 14 |
| **City** | city *that has markets* | 55 |
| **Market** | real market | 157 |

**908 indexable URLs today across four locales — 1.00 per entity per locale.** v1 was ~60 per market.

City pages were by far v1's best performers (25.5 clicks/page vs 4.9 for market pages). Market pages are the atom everything else is a view over. Region pages are cheap and German demand for them is large. Home carries "today / this weekend" without needing a URL for it.

**A country page does not exist yet.** Breadcrumbs no longer point at one — they run home → canton → city → market, every step a page that exists. The country step goes in when the page does.

## Everything else is a query parameter

Not indexed, canonical points to the clean parent, out of the sitemap, no crawlable links pointing at them.

```
/de/deutschland/koeln?datum=2026-09-14
/de/deutschland/koeln?typ=kinderflohmarkt
/de/deutschland/koeln?tag=indoor
/umkreis?lat=50.93&lng=6.96&km=30      <- the "in der Nähe" answer
```

**Tags ship day one in the data model and as filters, never as URLs.** Two rules keep them from becoming the v1 failure: the set stays small (a tag that can't be applied confidently from data we hold does not exist), and a tag becomes a page only through the gate. Tags are a monetisation hook later, so model them properly now — a real table with stable slugs and per-locale labels, not a text column.

## URL shape

```
/de/                                    locale home
/de/schweiz/                            country
/de/schweiz/kanton/zurich/              region (canton / Bundesland)
/de/schweiz/zurich/                     city
/de/markt/[slug]/                       market
/de/melden/                             utility (noindex)
/umkreis/                               radius view (noindex)
```

**Locale first, then country, then place.** Every **word** in the path is in the page's own language. Every **name** in it is the same in all four:

| | de | fr | it | en |
|---|---|---|---|---|
| country | `schweiz` | `suisse` | `svizzera` | `switzerland` |
| market | `markt` | `marche` | `mercato` | `market` |
| canton | `kanton` | `canton` | `cantone` | `canton` |
| Zürich | `zurich` | `zurich` | `zurich` | `zurich` |
| Genève | `geneve` | `geneve` | `geneve` | `geneve` |

Built only by `src/lib/i18n.ts`. A path assembled by hand is how `/it/frankreich/paris/` happens — right words, wrong language, invisible until a native speaker reads it.

### One slug per place

**A city, a canton and a market carry one slug across all four languages.** The page still reads "Zurigo" in Italian; only the address stops moving. Changed 2026-09-03, replacing per-locale slugs.

The rule it replaced looked right and was not. Of 55 Swiss cities, 45 already had one name in all four — the machinery existed for ten. What it cost was the opposite of small: the words in the path **were** the identity, so correcting a translation, merging a commune or adding a language rewrote live URLs, and every cross-language link had to be joined through a market slug because it could not be derived from the path.

Nobody large does this. Booking (46 languages), Tripadvisor and Airbnb never translate the name. GetYourGuide does, but carries a numeric id — `kanton-genf-l73` — so the words are decoration; request a nonsense slug with the right id and it redirects to the real one. Google reads language from `hreflang`, never from the path, so the translated name bought nothing in search and cost every link.

The country segment is the deliberate exception: `schweiz` / `suisse` / `svizzera` is a **word**, not a name. It belongs with `markt` / `marche` / `mercato` — a fixed hand-written set of about fifty that never grows with the data — and it is the segment `flohmarkt schweiz` is actually searched with.

**The slug is transliterated in the language the place speaks, not blindly stripped of accents.** Bülach and Dübendorf are German towns and write themselves `buelach.ch` and `duebendorf.ch`. Genève and Fribourg are French towns and take the French form, not the German exonyms the import wrote. Where a commune's own name is dual (Biel/Bienne), the majority language wins.

**Zürich is the one exception, and the list should stay one long:** `zurich`, because it is the single Swiss place with a settled accent-free form the whole world already uses — Booking, Airbnb, Tripadvisor and Google Maps all spell it that way — and the slug is now shared with the French, Italian and English pages. Fame, not a rule about umlauts. `scripts/localise-places.mjs`, `SLUG_FROM`.

### Retired addresses

**No address Fynda has published ever stops working.** A slug row is never deleted: when it is replaced it is marked `is_current = false` and stays forever, and the build turns those rows into 301s in `_redirects`, which Cloudflare Pages serves natively. A retired slug also stays reserved, so it can never be handed to a different entity and start pointing somewhere wrong.

This is the guarantee GetYourGuide and Tripadvisor buy with an id in the path, without the id — which is the generated-directory look the v1 post-mortem says to avoid. It is not an edge case: Swiss communes merge constantly, roughly 3,000 down to 2,100 in thirty years. Guardrail 9 enforces it.

**Market pages sit outside the geography tree on purpose:** a market never needs a new URL if its city or region classification changes.

**The canton level uses a type segment** because five Swiss names are both a city and a canton (Zürich, Bern, Luzern, St. Gallen, Schaffhausen), and it is structural rather than Swiss: Berlin, Hamburg and Bremen are city-states. Booking.com, Eventbrite and meine-flohmarkt-termine all solve it the same way. **A type segment partitions — one URL per canton; a facet multiplies — every place × seven weekdays.** That distinction is what the forbid rules encode.

**Utility pages** — the forms, legal text and saved markets — plus `/umkreis/` are **noindex, out of the sitemap, and out of the URL-to-entity ratio**: they carry no entity and compete for no query. They have their own content floor (150), because a contact form is not a thin country page.

`/llms.txt` and `/ics/[slug].ics` are files, not pages; they never enter the page count.

`/` redirects to `/de/`. Astro emits a redirect stub, which the guardrails treat as **not a page**: exempt from the content floor and the ratio, still checked against the route allowlist.

**A URL that does not exist returns 404.** `src/pages/404.astro` is not decoration: without it Cloudflare Pages answers every unmatched path with the `/` redirect stub and **HTTP 200**, so `/de/schweiz/anything-at-all/` looked like a real page. That is the v1 failure in another form — a crawler could invent URLs and be told each one was fine — and it made verification lie, because every check of a made-up URL passed. Found and fixed on launch day, 2026-09-04.

## Locales

**Switzerland publishes in de, fr, it and en. Every other country gets its own language plus English.** Decided 2026-08-31, and it was not a future concern — 31 of 157 markets (20%) are in French- or Italian-speaking Switzerland and were being served German pages.

**A language version is not a facet combination.** City × weekday produces mostly empty cells; the same market in Italian is a full page with the same dates, address and status. That distinction is why the URL-to-entity ratio now counts **per locale** — the old aggregate count read four languages as 4.02 against a ceiling of 2.0 and would have blocked translation outright.

The line that does matter is Google's: scaled content abuse covers pages generated *"through automated transformations like synonymizing, translating"* — **where little value is provided**. So:

> **Localise the facts and the interface. Never mass-translate prose.**

A market page's value is language-neutral data — date, time, address, coordinates, cancelled-or-not, confirmed-on. Interface strings (`src/lib/strings.ts`) are a few dozen phrases written once per language by a person. Longer prose — descriptions, recurrence sentences — is stored per locale in `texts` and **ships as soon as the row exists**; there is no human-read gate. A locale still renders nothing unless its row is there, so coverage stays a fact about the data rather than a promise.

Place **names** live in the database (`texts`) per locale, written by `scripts/localise-places.mjs`. Only genuine exonyms are translated — Bâle, Zurigo, Coire; Lausanne stays Lausanne in all four. Place **slugs** are in `slugs` and are not per locale — see "One slug per place" above.

**hreflang** is emitted on every indexable page: every cluster member lists every other including itself, plus `x-default` → German. Guardrail 8 checks it, because one error voids a whole cluster and roughly three quarters of implementations in the wild carry one.

## How a page type graduates

All four tests, in order:

1. **Density** — at least 5 markets on the average instance, and 80% of instances clear it.
2. **Demand** — the query is actually asked (Search Console, autocomplete, keyword data).
3. **Probation** — 10 hand-checked instances at most, 4 weeks of real data, keep or kill on evidence.
4. **Scale** — only after probation, only to instances that individually pass the density floor.

Queue, best first: region x time (`/de/deutschland/nordrhein-westfalen/heute`) · national date (`/de/termine/2026-09-14`, best CTR on v1 at 14.8%) · month · city x category. **City x date is what died. Probably never.**

The pattern this produces on its own: big geography x time is safe, small geography x time is not.

**Deliberately not at launch:** date pages, category pages, per-date market pages, `/heute/` URLs, a second language.

---

## Data model

`[DECIDED 2026-08-29, after reading all 24 v1 migrations]`

Shipped: `supabase/migrations/20260829120000_initial_schema.sql`, with behavioural tests in `supabase/tests/schema_test.sql` (15 assertions, all passing against Postgres 16 + PostGIS 3.4).

```
countries -> regions -> cities -> venues -> markets -> occurrences

slugs   (entity_type, entity_id, locale, slug)          -- a row exists = that locale exists
texts   (entity_type, entity_id, locale, field, value)  -- names, descriptions, recurrence text
facts   (entity_type, entity_id, field, value, source_type, source_ref,
         observed_at, recorded_at, confidence, superseded_by)

tags, market_tags, organisers, market_private, reports
```

### What v1 got right — carried over

- **Venues separate from markets.** Two markets on one Marktplatz share an address and a timezone. Timezone on the venue is what makes a correct `startDate` offset possible.
- **Concrete occurrence rows** with status confirmed / tentative / cancelled and a cancellation note. Maps 1:1 onto Schema.org `eventStatus`.
- **`market_private`** as its own table — organiser email, source URL, raw import. Personal data can't leak through a permissive read policy because it isn't in the readable table.
- **Indexability computed in SQL.** v1 derived "should this city page exist" from live content counts. Best idea in that schema; it puts the governing rule in the database, not only in CI.
- **Write-time consistency triggers.** Cheap, and they caught real corruption.

### What v1 got wrong — not carried over

| v1 | Why it goes |
|---|---|
| `slug_de`, `slug_fr`, `slug_it`, `slug_en` all `NOT NULL` on every place; `description_en/fr/it` on every market | The locale matrix baked into the schema. Four locales feel free when the columns already exist. Replaced by row-per-locale `slugs` and `texts` — adding a locale becomes work again, which is the point |
| `lat`/`lng` as plain numbers | PostGIS was installed and never used. Radius search *is* the product, so `venues.point geography(Point,4326)` with a GIST index |
| `markets.city` and `markets.canton` as text beside `municipality_id` | Two sources of truth; v1 needed a trigger to police the drift. Geography joins through the tree, always |
| No `countries` table (`'CH'` was a column default) | Multi-country from commit one |
| `pg_trgm` and `unaccent` in the `public` schema | Belong in `extensions`, with PostGIS. **Not relocatable once created** |
| One `last_verified_at` per market | Per-fact provenance is the moat. A market's *existence* stays true for years; *this Sunday's date* is worth a week |
| No tags table | Decided for day one |
| `market_group` as a text key matched by convention | A real self-referencing key, `markets.hub_market_id` |
| Nothing capped the date horizon in the database | See decision 3 below |

`municipalities` is renamed `cities` — a Swiss administrative word that doesn't travel to Germany.

### Provenance

Every fact carries its own source and timestamp in an append-only ledger. Nothing is overwritten, only superseded.

```
market exists            -> organiser,      2026-03-01
runs Sundays 10-18       -> organiser,      2026-03-01
14 Sept confirmed        -> city website,   2026-08-20
```

The freshness queue is a view over this table: staleness x traffic x volatility, all three computable from `facts` alone. It is also what makes "Bestätigt am 12.08." honest — the trust signal and the AI-citation signal are the same string.

### Three decisions that were open

**1. One region level, not three.** v1 had cantons, metro regions and tourism regions, joined through a table carrying roles and priorities. Fynda has **one kind: the country's official first-level unit** — canton in CH, Bundesland in DE. That is the level with measured search demand (`flohmarkt nrw`, `flohmarkt bayern`), and its boundaries are official rather than argued. A city has exactly one, so it is a plain foreign key and the join table disappears.

*"But Zürich should include Dietikon."* That is what the radius filter answers, and it answers it better — without a page.

**2. The country is a real level in the tree, with its own slug row.** `schweiz` / `suisse` / `svizzera` is translatable text, so it is data, not a string hardcoded into a route. Same `slugs` table as everything else. No special cases anywhere in the tree.

**3. The 120-day horizon binds generated dates, not stored ones.** A database rule that compares against "today" can't be a plain constraint, because today keeps changing — it has to be a trigger that runs on write. So:

- **Generated occurrences** (expanded from a recurrence rule) are refused beyond 120 days. This is where the 8,500-URL failure came from, and it is now unavailable.
- **Hand-entered confirmed dates are not capped.** If an organiser says the big annual market is next June, that is a real verified fact and the database stores it.
- **CI enforces the horizon at the output layer** — no *rendered* occurrence beyond 120 days, whatever its origin.

Storage is not the risk. Publication is.

### Dates

**Concrete occurrence rows, always** — `flohmarkt 2.8.26` is a real query shape with 29% click-through, so dates must be queryable and displayable regardless of what sits underneath.

Recurrence is stored too: an RFC 5545 `RRULE` plus the human phrase ("jeden 1. Sonntag, März–Oktober"). A generator expands it into rows marked `origin='generated', status='unverified'`, capped as above; the freshness loop flips them to confirmed before the date arrives. **Pages render rows, never rules.**

The gap between what the rule predicted and what was confirmed is the reliability score nobody else can compute.

---

## Structured data — one rule that shapes the market page

`[VERIFIED 2026-08-29 against` [Google's Event docs](https://developers.google.com/search/docs/appearance/structured-data/event)`]`

> **"The event experience on Google only supports pages that focus on a single event."**

A market page carries many occurrence rows by design. So it emits **exactly one `Event`** — the next occurrence — plus `Place` and `BreadcrumbList`. Later dates are visible content, not markup. City and region pages emit no `Event` at all. Violations here draw a manual action, not a silent demotion.

Required, all three or the markup is invalid: `name` (the event, never the venue), `startDate` (ISO-8601 **with timezone offset**), `location` (both a name and a full address).

**`eventStatus` is the cancellation feature, already standardised:** `EventScheduled` · `EventCancelled` · `EventPostponed` · `EventRescheduled`. **Keep `startDate` when cancelled** — removing it breaks the markup. Nobody in the category uses this, and it is free.

**Enforced 2026-08-29.** Guardrail check 6 now fails a build that emits more than one `Event` on any page, or any `Event` on a page type other than `market` (`maxEventsPerPage`, `eventAllowedOn` in `guardrails.config.json`). Both branches are covered by a deliberate-failure test.

## Generated prose

Google's scaled-content policy says "no matter how it's created", so AI-drafted descriptions published across thousands of pages sit squarely inside it. The working line:

> Generated prose may *present* facts we hold. It may not *substitute* for facts we do not hold.

A market with a verified address, dates, times and an organiser can carry generated connective prose. A market with a name and a postcode cannot be padded up to the content floor. **Open: the content floor should count verified facts, not characters** — today it counts characters, which generated text satisfies without adding anything real. Fix before any bulk generation runs.

## Style architecture — the layer between tokens and pages

**Added 2026-08-30**, after measuring the drift: at three pages, **10 selectors were defined by more than one page and 7 had already diverged.** `h1` meant three different things. The site is going to fourteen more pages.

Four layers, each allowed to know only about the one below it:

| Layer | File | Owns |
|---|---|---|
| **Tokens** | `src/styles/tokens.css` | What a colour, size, space and duration *are*. No selectors |
| **Base** | `src/styles/base.css` | What an element *is* — headings, `.button`, `.meta` — plus composition: `.stack`, `.gutter`, `.wrapper` |
| **Components** | `src/components/` | Only what is genuinely theirs. Scoped, per Astro's own recommendation |
| **Pages** | `src/pages/` | Order and data. A page's `<style>` is what nothing else can want |

Two rules, both enforced by guardrail 7:

1. **No selector is defined by two pages.** Shared things move down a layer.
2. **A component never sets its own outer margin.** Spacing between things belongs to the parent — that is what `.stack` is for. A component that ships a margin forces every parent to cancel it, which is how `:global(.code){margin-top:0}` came to exist in two places.

And one that follows from the token layer: **no raw hex or px outside `tokens.css`.** The single exception is inside `@media`, because a media query cannot read a custom property.

**Vocabulary is code, not copy.** `src/lib/vocabulary.ts` holds every German string that names a domain concept — market kinds, status labels, plurals. Before it existed the kinds lived in three places and the legend said "Halle" where the market page said "Hallenflohmarkt".

**Guardrail 7 is the only check that reads `src/` rather than `dist/`,** because the failure it catches is invisible in the output: three pages that each look fine and slowly stop looking like each other.

It compares **class names, not just whole selectors.** The first version compared selector strings, so `.intro` on one page and `.intro p` on another looked unrelated — five shared names were hiding behind that hole, found the day it was closed. Names defined in `base.css` are exempt: reusing `.button` on two pages is the system working.

**No CSS framework.** The token layer is better than what one would supply, and adopting one would mean discarding it.

## The ten guardrails

`scripts/guardrails.mjs`, run by `npm run verify` and by CI. Config in `guardrails.config.json`.

| # | Check | Blocks |
|---|---|---|
| 1 | Route allowlist | A URL shape nobody decided on |
| 2 | URL-to-entity ratio, **per locale** | Page count outrunning real things in the world |
| 3 | Content floor | Pages too thin to deserve a URL |
| 4 | Occurrence horizon (120 days) | The unbounded date expansion that killed v1 |
| 5 | Explicit image dimensions | Layout shift |
| 6 | Structured data, one `Event` per page | The markup Google gives a manual action for |
| 7 | Style cohesion | Pages drifting into separate designs |
| 8 | hreflang clusters | A one-way link voiding a whole language cluster |
| 9 | Retired addresses still land | A rename silently killing every shared link and ranking |
| 10 | Sitemap matches the indexable pages | Asking Google to index a page that tells it not to |

Checks 1–6 and 8 read `dist/`. Check 7 reads `src/`, because the failure it catches is invisible in the output.

---

owner: Delfim
last_reviewed: 2026-08-31
