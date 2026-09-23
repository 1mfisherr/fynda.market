# Architecture

URLs, locales, the data model, the import, structured data, the guardrails. Every rule here was written against a specific v1 failure; a rule that now blocks something good is a bug in this file — change rule and guardrail in the same commit, saying what it protected against. Never loosen a threshold to turn a build green.

> **A page exists because there is content for it — never because a URL pattern permits it.**

---

## Pages

| Type | One per | URL |
|---|---|---|
| Locale home | locale | `/de/` |
| Country | country — *arrives with Germany* | `/de/schweiz/` |
| Region | canton / Bundesland with markets | `/de/schweiz/kanton/zurich/` |
| City | town with markets | `/de/schweiz/zurich/` |
| Market | market | `/de/markt/[slug]/` |
| Utility, Near me | locale, `noindex` | `/de/melden/`, `/de/umkreis/` |

One indexable URL per entity per locale (v1: ~60 per market). Everything else — date, type, tag, radius — is a filter, never a URL. `/` is a 301 to `/de/`. `src/pages/404.astro` must exist: without it Cloudflare answers every unknown path with HTTP 200.

**A filter becomes a page type only through the gate:** ≥5 markets on the average instance and 80% of instances clear it · the query is measurably searched · ten hand-checked instances for four weeks · then scaled only to instances that pass the floor individually. Queue, best first: national date page (v1's best CTR, 14.8%) · region × time · month. City × date is what killed v1 — never.

## URLs

`/{locale}/{country}/{city}/`. **Words** in the path are translated (`schweiz` / `suisse` / `svizzera`, `markt` / `marche` / `mercato`, `kanton` / `canton` / `cantone`); **names** are not — one slug per place in every locale (`zurich`, `geneve`). Built only by `src/lib/i18n.ts`; a path assembled by hand is how `/it/frankreich/paris/` happens.

- **Slugs are transliterated in the place's own language:** `buelach`, `duebendorf`, `geneve`, `fribourg`. Biel/Bienne: the majority language. `zurich` is the one exception (world-famous form) and the list stays one long. `scripts/localise-places.mjs`, `SLUG_FROM`.
- **A published address never dies.** A replaced slug is marked `is_current = false`, stays reserved, and the build emits a 301 for it in `_redirects`. Guardrail 9.
- **Market URLs sit outside the geography tree** so a market never moves when its town or canton is corrected.
- **The canton segment carries a type word** because five Swiss names are both a city and a canton, and Berlin, Hamburg and Bremen are city-states. A type segment partitions (one URL per canton); a facet multiplies (place × weekday). That is what the forbid rules encode.
- Utility pages and Near me are `noindex`, out of the sitemap and out of the ratio; they have their own content floor (150). `/ics/*.ics`, `/_hashes.json` and the IndexNow key are files, not pages.

## Locales

Switzerland: de, fr, it, en. Germany: de, en. Any other country: its own language plus English. `x-default` → English (Delfim, 2026-09-18).

**A country, not a locale, decides three things** (`src/lib/i18n.ts` §COUNTRY, built 2026-09-22): which locales it is published in, the region word in the path (`kanton` / `bundesland`, `canton` / `state`), and the hreflang tag — `de-CH` for Zürich, `de-DE` for München, because `/de/` serves both and nothing else tells Google which German reader a page is for. English stays plain `en` in every country: the English Zürich page and the English München page are about different places, never alternates of each other, and a page tagged `en-DE` matches no English speaker outside Germany. A page about no country at all — a form, the legal text, About — carries the plain language tag, not `de-CH`.

Nothing enforces the locale list: the build joins each place's name and slug in the page's own locale, so a country simply has no pages in a locale nobody wrote. `getMarkets('fr')` returns no German market. Alternates are read back off what was built rather than assumed, because an hreflang pointing at a page that does not exist voids the whole cluster.

**Also the country's:** the currency an entry fee is printed and marked up in (CHF / EUR — until 2026-09-23 every German fee read "4 CHF"), and its **city-states** — Berlin, Hamburg, Bremen — whose region page would be the town page's twin, so it is not built, links go to the town, and the one night it was published 301s (`scripts/redirects.mjs`).

**Sitemap `<lastmod>` is the day a page last changed** (`scripts/postbuild.mjs`): a page keeps its day until its HTML hash moves, compared with the live `_hashes.json` and `_modified.json`. No live files, no `<lastmod>` — never the build date.

**The region word is in the copy too, not only the path.** "im Kanton Zürich" is how a Swiss person says it; "im Bundesland Bayern" is how nobody says it — in Germany the Land carries no noun ("Flohmärkte in Bayern"), which is also the query people type. `src/lib/strings.ts` holds one phrase builder per language, and the country picks the phrase.

**Localise the facts and the interface; never mass-translate prose.** Interface strings in `src/lib/strings.ts`, written by a person per language. Names, descriptions and recurrence sentences are rows in `texts` per locale; a locale renders only what has a row. Only genuine exonyms are translated (Bâle, Zurigo, Coire); Lausanne is Lausanne everywhere. The URL-to-entity ratio counts **per locale** — a translation is a full page, not a facet.

hreflang on every indexable page, every cluster member listing every other plus itself. Guardrail 8, because one error voids the whole cluster.

## Data model

`supabase/migrations/`; tests in `supabase/tests/schema_test.sql`.

```
countries -> regions -> cities -> venues -> markets -> occurrences

slugs   (entity_type, entity_id, locale, slug, is_current)   -- a row exists = that locale exists
texts   (entity_type, entity_id, locale, field, value)       -- names, descriptions, recurrence text
facts   (entity_type, entity_id, field, value, source_type, source_ref,
         observed_at, recorded_at, confidence, superseded_by) -- append-only provenance

tags, market_tags, organisers, market_private, reports, organiser_claims
newsletter_subscribers, newsletter_sends, newsletter_events, newsletter_alerts
organiser_links, organiser_mail_sends, organiser_answers, organiser_edits
admin_actions, publish_requests, analytics_events, crawler_hits, crawler_daily
```

- **Robots keep 90 days.** `crawler_hits` older than that folds into `crawler_daily` (one row per day, robot and page type) every night after the publish (`scripts/prune-logs.mjs`); unfolded it filled the free 500 MB inside a year. `analytics_events` is kept raw.
- **Static files never reach the Functions.** `public/_routes.json` excludes images, fonts, `/_astro/`, calendars and the root files, because the root `_middleware.ts` otherwise runs on every request and each one counts against the Functions quota (100,000 a day free). Add a new static folder there.

- **One region level:** the country's official first-level unit (canton, Bundesland). A city has exactly one, plain foreign key. "Zürich should include Dietikon" is what the radius filter answers.
- **The country is a row in the tree** with its own slug rows, not a route constant.
- **Venues are separate from markets:** two markets on one square share an address and a timezone; the timezone is what makes a correct `startDate` offset possible. `venues.point` is PostGIS `geography`, GIST-indexed — radius search is the product.
- **`market_private`** holds organiser e-mail, source URL and raw import, so personal data is never in a readable table.
- **`publishable_markets`** (view) is the one definition of "this market has a page": active, with a venue in a city in a region. Closed markets are imported and never published.
- **Every table has RLS on and no policies.** The build connects as owner; a Function as service role, which still needs a `GRANT` per table. A missing grant is an empty result, not an error.
- **`reports.market_id` is nullable:** a footer report names a market in words; a null id means a person matches it (`reports_unmatched_idx`). Guessing would attach a cancellation to a market that is running.
- **A claim is not a report** (`organiser_claims`): a report says a fact is wrong; a claim says a person will answer for the market from now on.
- Extensions (`postgis`, `pg_trgm`, `unaccent`) live in `extensions`, never `public` — not relocatable once created.

### Dates

**Concrete occurrence rows, always; pages render rows, never rules.** Recurrence is stored too — an RFC 5545 `RRULE` plus the human sentence (`recurrence_text`) — and a generator expands it into rows `origin = generated`. **The 120-day horizon binds generated rows in the database (trigger) and every rendered row in CI (guardrail 4).** A hand-entered confirmed date beyond 120 days is stored and simply not rendered yet: storage is not the risk, publication is.

Status: `confirmed | tentative | cancelled`, with `cancellation_note`; maps 1:1 onto Schema.org `eventStatus`.

### Provenance

`facts` is an append-only ledger: nothing is overwritten, only superseded. It is what makes "Bestätigt am 12.08." honest, and the freshness queue (staleness × traffic × volatility) is a view over it. A market kind inferred from its name is written as `inferred` so a real source overrules it.

### Organisers

**No login, ever** (Delfim, 2026-09-16). `organiser_links` holds one live row per organiser; the URL token is `HMAC(ADMIN_SIGNING_SECRET, link id)`, the table stores only its SHA-256, so a copy of the database yields no working link. Minting a new link revokes the old. Every button press is an `organiser_answers` row (`on | cancelled | changed`, scope `date | market`); every mail an `organiser_mail_sends` row written before the send. `organiser_funnel` is the answer rate — the number that decides whether more is built for organisers. "On" sets `occurrences.origin = organiser` and `confirmed_at`; the three organiser facts (`stall_count`, `setting`, `rain_policy`) render only when set.

Delfim's Telegram decisions are `admin_actions`: single use, fourteen days, signed with the same secret. `publish_requests` logs each rebuild a button asked GitHub for.

## Import

**The live v1 Supabase project is the only source** (`V1_DATABASE_URL`). Local backups are stale — read for shape, never import. Delfim keeps adding markets there; they come across in batches.

- `import-v1.mjs` ran once (2026-08-29). It deletes what it owns and reloads, which the live database no longer survives (organiser links, hand edits, the mail log). Never again.
- `import-v1-additions.mjs` is the batch tool: a market is new when its slug is not here; cantons, towns, venues and organisers are matched and reused, nothing existing is updated. An organiser arriving with an e-mail gets a link at once. It prints the German-only rhythm lines it added — their en/fr/it go into `texts` by hand before the deploy (the site falls back to German otherwise). Then `import-images.mjs` (photos from the fleafind folder; a photo already in `public/images` satisfies its fact and is left alone) and `FYNDA_DATA_SOURCE=supabase npm run verify`. Both importers read fleafind through `scripts/lib/v1.mjs`; place names and slugs come from `scripts/lib/places.mjs`, which `localise-places.mjs` also uses, so a new canton needs its fr/it/en names there first.

Decided at import: **a town is the postal town on the venue** (Emmenbrücke, not Emmen; Seewen SZ, not Schwyz — what the address says and what people search; one hand exception, Interlaken for a hall in Wilderswil), never a free-text column (39 of 161 disagreed); cantons normalised; market kind inferred from the name, recorded as `inferred`; stock photos dropped — every market has a real file or an illustration.

## Structured data

Google supports the event experience only on pages about a single event. So a market page emits **exactly one `Event`** — the next occurrence — plus `Place` and `BreadcrumbList`; later dates are visible content. City and region pages emit no `Event`. `name`, `startDate` (with timezone offset) and `location` (name and full address) are all required. `eventStatus` carries cancellations; **keep `startDate` when cancelled.** Guardrail 6.

## Generated prose

Google's scaled-content policy covers AI text "no matter how it's created". The line: **generated prose may present facts we hold; it may not substitute for facts we do not hold.** Open: the content floor counts characters and should count verified facts — fix before any bulk generation.

## Styles

Four layers, each knowing only the one below: `tokens.css` (values, no selectors) → `base.css` (elements, `.button`, `.stack`, `.gutter`) → components (scoped, only what is theirs) → pages (order and data). No selector defined by two pages; no component sets its own outer margin; no raw hex or px outside `tokens.css` except inside `@media`. Domain words live in `src/lib/vocabulary.ts`. Guardrail 7 compares class names across `src/`, the one check that reads source. No CSS framework. Details: `.claude/rules/styles.md`.

## The ten guardrails

`scripts/guardrails.mjs`, config `guardrails.config.json`, run by `npm run verify`, `npm run deploy` and CI.

| # | Check | Blocks |
|---|---|---|
| 1 | Route allowlist | A URL shape nobody decided on |
| 2 | URL-to-entity ratio, per locale | Page count outrunning real things |
| 3 | Content floor | Thin pages. `<aside data-outside-floor>` is not counted — another page's content never clears this page's floor |
| 4 | Occurrence horizon, 120 days | The date expansion that killed v1 |
| 5 | Explicit image dimensions | Layout shift |
| 6 | One `Event`, market pages only | The markup Google gives a manual action for |
| 7 | Style cohesion | Pages drifting into separate designs |
| 8 | hreflang clusters | One bad link voiding a cluster |
| 9 | Retired addresses still land | A rename killing every shared link |
| 10 | Sitemap = indexable pages | Asking Google to index a `noindex` page |

A fixtures build says `SKIP` where a check needs real data; that is waiting, not passing.

---

owner: Delfim
last_reviewed: 2026-09-19
