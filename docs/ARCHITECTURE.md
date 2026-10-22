# Architecture

URLs, locales, the data model, the import, structured data, the guardrails. Every rule here was written against a specific v1 failure. A rule that now blocks something good is a bug in this file: change rule and guardrail in the same commit, saying what it protected against. Never loosen a threshold to turn a build green.

> **A page exists because there is content for it — never because a URL pattern permits it.**

---

## Pages

| Type | One per | URL |
|---|---|---|
| Locale home | locale | `/de/` |
| Country | country — *arrives with Germany* | `/de/schweiz/` |
| Region | canton / Bundesland with two or more markets | `/de/schweiz/kanton/zurich/` |
| City | town with two or more markets | `/de/schweiz/zurich/` |
| Market | market | `/de/markt/[slug]/` |
| Utility, Near me | locale, `noindex` | `/de/melden/`, `/de/umkreis/` |

- One indexable URL per entity per locale (v1: ~60 per market). Everything else — date, type, tag, radius — is a filter, never a URL.
- A town or region with a single market has no page: its market's page stands for it and the old address 301s there (`scripts/redirects.mjs`, guardrail 11). Two pages for one market traded the same query and are the doorway shape Google's rules name. The page returns at a second market.
- `/` is a 301 to `/en/` (English is where one language must serve all).
- `src/pages/404.astro` must exist: without it Cloudflare answers every unknown path with HTTP 200.

**A filter becomes a page type only through the gate:**
1. At least 5 markets on the average instance, and 80% of instances clear it.
2. The query is measurably searched.
3. Ten hand-checked instances for four weeks.
4. Then scaled only to instances that pass the floor individually.

Queue, best first: national date page (v1's best CTR, 14.8%) · region × time · month. City × date is what killed v1 — never.

## URLs

`/{locale}/{country}/{city}/`. **Words** in the path are translated (`schweiz` / `suisse` / `svizzera`, `markt` / `marche` / `mercato`, `kanton` / `canton` / `cantone`); **names** are not — one slug per place in every locale (`zurich`, `geneve`). Built only by `src/lib/i18n.ts`; a path assembled by hand is how `/it/frankreich/paris/` happens.

- **Slugs are transliterated in the place's own language:** `buelach`, `duebendorf`, `geneve`, `fribourg`. Biel/Bienne: the majority language. `zurich` is the one exception (world-famous form) and the list stays one long. `scripts/localise-places.mjs`, `SLUG_FROM`.
- **A published address never dies.** A replaced slug is marked `is_current = false`, stays reserved, and the build emits a 301 for it in `_redirects`. Guardrail 9.
- **Market URLs sit outside the geography tree** so a market never moves when its town or canton is corrected.
- **The canton segment carries a type word** because five Swiss names are both a city and a canton, and Berlin, Hamburg and Bremen are city-states. A type segment partitions (one URL per canton); a facet multiplies (place × weekday). That is what the forbid rules encode.
- Utility pages and Near me are `noindex`, out of the sitemap and out of the ratio; they have their own content floor (150).
- A form opened from a market page carries the market in its address (`?markt=`). `robots.txt` disallows `/*?markt=` and the links are `nofollow`: those addresses would otherwise outnumber the real pages.
- `/ics/*.ics`, `/_hashes.json` and the IndexNow key are files, not pages.

## Locales

Switzerland: de, fr, it, en. Germany: de, en. Any other country: its own language plus English. `x-default` → English.

**A country, not a locale, decides three things** (`src/lib/i18n.ts` §COUNTRY):
- Which locales it is published in.
- The region word in the path (`kanton` / `bundesland`, `canton` / `state`).
- The hreflang tag: `de-CH` for Zürich, `de-DE` for München, because `/de/` serves both and nothing else tells Google which German reader a page is for. English stays plain `en` in every country: the English Zürich page and the English München page are about different places, never alternates of each other. A page about no country at all (a form, the legal text, About) carries the plain language tag.

**Also the country's:**
- The currency an entry fee is printed and marked up in (CHF / EUR).
- Its **city-states** (Berlin, Hamburg, Bremen): the region page would be the town page's twin, so it is not built, links go to the town, and its address 301s (`scripts/redirects.mjs`).

Nothing enforces the locale list: the build joins each place's name and slug in the page's own locale, so a country simply has no pages in a locale nobody wrote. `getMarkets('fr')` returns no German market. Alternates are read back off what was built rather than assumed, because an hreflang pointing at a page that does not exist voids the whole cluster.

**Sitemap `<lastmod>` is the day a page last changed** (`scripts/postbuild.mjs`). The hash is of a page's title, description and text, not its HTML, so a stylesheet deploy or the date calendar greying out yesterday does not re-date every page; Google stops trusting a sitemap whose dates all move at once. Compared with the live `_hashes.json` and `_modified.json`. No live files, no `<lastmod>` — never the build date.

**The region word is in the copy too, not only the path.** "im Kanton Zürich" is how a Swiss person says it; in Germany the Land carries no noun ("Flohmärkte in Bayern"), which is also the query people type. `src/lib/strings.ts` holds one phrase builder per language, and the country picks the phrase.

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
```

The other tables (organisers, newsletter, analytics, watch) are in the migrations; the non-obvious ones are below.

- **Nothing about a market is overwritten without a trace.** A trigger writes every insert, update and delete on `markets`, `occurrences`, `venues`, `texts` and `market_tags` to `history` — an update as `{column: [old, new]}`, with `who` (`site` for the Functions, else the script's file name, which `scripts/db.mjs` sets). Append-only: the database refuses UPDATE, DELETE and TRUNCATE on it. No organiser e-mails in it, so it can be shared.
- **`market_stats_monthly`** is the monthly photo per country and region (markets, dates, cancellations, organiser confirmations, indoor/outdoor, kinds), recomputed nightly for the current month by `scripts/snapshot-stats.mjs` and closed on the 1st.
- **Robots keep 30 days.** `crawler_hits` older than that fold into `crawler_daily` (one row per day, robot and page type) every night after the publish (`scripts/prune-logs.mjs`); unfolded they fill the free database. `analytics_events` is kept raw.
- **Static files never reach the Functions.** `public/_routes.json` excludes images, fonts, `/_astro/`, calendars and the root files, because the root `_middleware.ts` otherwise runs on every request and each one counts against the Functions quota. Add a new static folder there.
- **One region level:** the country's official first-level unit (canton, Bundesland). A city has exactly one, plain foreign key. "Zürich should include Dietikon" is what the radius filter answers.
- **The country is a row in the tree** with its own slug rows, not a route constant.
- **Venues are separate from markets:** two markets on one square share an address and a timezone; the timezone is what makes a correct `startDate` offset possible. `venues.point` is PostGIS `geography`, GIST-indexed — radius search is the product.
- **A market knows its months.** `markets.season_from` / `season_to` (1–12, may wrap the new year; equal for an annual market) are read from its own rhythm line. `src/lib/season.ts` is the one reading: outside the season, or once its last month has had its edition, the market is *Back in April*; an annual one is *Usually in September*; otherwise a page says when it last ran. A new market gets its months by hand in an intake file or a migration, never a guess. `seller_mix` (private / mixed / trader) sits with stalls, setting and rain as a fact the decision strip shows when set.
- **`date_alerts`** is "tell me when it's back": one address and one market (or one town with nothing dated), written by `functions/b.ts`. `scripts/send-date-alerts.mjs` runs in the nightly publish after the upload and sends each alert its one mail once its market — or any market in its town — has a date, clearing the address as it goes; unanswered after 400 days the address is cleared without a mail. `date_alerts_waiting` counts who waits for what, with no address in it.
- **`date_answers`** is "Were you there?": a date, *on* or *off*, the page and a hashed connection (`functions/v.ts`), anonymous. `occurrence_seen` turns it into one flag per date — seen when someone said yes and nobody said no — which the build reads into `Market.earlier`.
- **`saved_markets`** is a subscriber's saved list (`functions/k.ts`): the browser list, copied to the server once the visitor leaves an address. A new address gets its unsubscribe token back and that browser keeps the list in step; an existing address can only be added to and gets no token (anyone can type anyone's address). `newsletter_subscribers.area_digest` false is someone who asked only for saved markets: the Friday sender (`scripts/send-digest.mjs`) mails them only when one is on that weekend. A saved market with no date gets a `date_alerts` row.
- **`fact_answers`** is the question after a yes (`functions/f.ts`): a market, a field (`size_band`, `seller_mix`, `setting`), a value, anonymous. `fact_answer_settle()` publishes a value once three different connections agree and outnumber any other answer; Delfim's Approve (`admin_actions` kind `fact`) calls `fact_answer_apply()`. Both write only an empty field, with a `facts` row of source `visitor`.
- **`market_private`** holds organiser e-mail, source URL and raw import, so personal data is never in a readable table.
- **`publishable_markets`** (view) is the one definition of "this market has a page": active, with a venue in a city in a region. A closed market (`permanently_closed`) has no page; every address it ever had redirects to its town page, or the home page if the town has none left (`scripts/redirects.mjs`).
- **`reports.market_id` is nullable:** a footer report names a market in words; a null id means a person matches it (`reports_unmatched_idx`). Guessing would attach a cancellation to a market that is running.
- **A claim is not a report** (`organiser_claims`): a report says a fact is wrong; a claim says a person will answer for the market from now on.
- Extensions (`postgis`, `pg_trgm`, `unaccent`) live in `extensions`, never `public` — not relocatable once created.

### Dates

**Concrete occurrence rows, always; pages render rows, never rules.** Recurrence is stored too — an RFC 5545 `RRULE` plus the human sentence (`recurrence_text`) — and a generator expands it into rows `origin = generated`. **The 120-day horizon binds generated rows in the database (trigger) and every rendered row in CI (guardrail 4).** A hand-entered confirmed date beyond 120 days is stored and simply not rendered yet: storage is not the risk, publication is.

Status: `confirmed | tentative | cancelled`, with `cancellation_note`; maps 1:1 onto Schema.org `eventStatus`.

### Provenance

`facts` is an append-only ledger: nothing is overwritten, only superseded. It is what makes "Bestätigt am 12.08." honest, and the freshness queue (staleness × traffic × volatility) is a view over it. A market kind inferred from its name is written as `inferred` so a real source overrules it.

### Organisers

**No login, ever.** `organiser_links` holds one live row per organiser; the URL token is `HMAC(ADMIN_SIGNING_SECRET, link id)`, the table stores only its SHA-256, so a copy of the database yields no working link. Minting a new link revokes the old.

- Every button press is an `organiser_answers` row (`on | cancelled | changed`, scope `date | market`); every mail an `organiser_mail_sends` row written before the send.
- `organiser_funnel` is the answer rate — the number that decides whether more is built for organisers.
- "On" sets `occurrences.origin = organiser` and `confirmed_at`; the three organiser facts (`stall_count`, `setting`, `rain_policy`) render only when set.
- Delfim's Telegram decisions are `admin_actions`: single use, fourteen days, signed with the same secret. `publish_requests` logs each rebuild a button asked GitHub for.

## Import

**The live v1 Supabase project is the only source** (`V1_DATABASE_URL`). Local backups are stale — read for shape, never import. Delfim keeps adding markets there; they come across in batches.

- `import-v1.mjs` ran once. It deletes what it owns and reloads, which the live database no longer survives (organiser links, hand edits, the mail log). Never again.
- `import-v1-additions.mjs` is the batch tool. A market is new when its slug is not here; cantons, towns, venues and organisers are matched and reused, nothing existing is updated. An organiser arriving with an e-mail gets a link at once. Cantons are matched among Swiss regions only (BE, SH and NW are also Bundesland codes).
- `--hidden` brings markets in unverified, for a batch whose texts are rewritten before it ships — v1's words never go live; `intake/descriptions-v1-winter/check.mjs` checks the rewrites. Add the rhythm lines the import lists.
- It prints the German-only rhythm lines it added; their en/fr/it go into `texts` by hand before the deploy (the site falls back to German otherwise).
- Then `import-images.mjs` (a photo already in `public/images` satisfies its fact and is left alone) and `FYNDA_DATA_SOURCE=supabase npm run verify`.
- Importers read v1 through `scripts/lib/v1.mjs`; place names and slugs come from `scripts/lib/places.mjs`, which `localise-places.mjs` also uses, so a new canton needs its fr/it/en names there first.

Decided at import: **a town is the postal town on the venue** (Emmenbrücke, not Emmen; Seewen SZ, not Schwyz — what the address says and what people search; one hand exception, Interlaken for a hall in Wilderswil), never a free-text column. Cantons normalised; market kind inferred from the name, recorded as `inferred`; stock photos dropped.

**Swiss dates come from v1, weekly.** v1's watch checks Switzerland; fynda.market copies. The Market Watch's weekly run starts `sync-v1.mjs --apply` and puts its result — and any change it held back — in the Telegram report.

- `sync-v1.mjs` compares every upcoming Swiss date (adds, cancellations, hours, status, removals) and, with `--apply`, writes them with v1's check date as the "confirmed on" stamp and a `facts` row naming v1's source page.
- v1's *tentative* is our `unverified`: kept, never published.
- A change that would undo one of our own edits since `--since` is held back unless `--accept-flagged`.
- `intake/sync-v1/keep-ours.json` lists the differences settled in our favour after reading the organiser's page. They are skipped every week and should be corrected in v1.
- It never copies text and never touches a date an organiser gave us.

## Watch

Every other country's dates are kept true by the Market Watch, on Delfim's PC (`scripts/watch/`, spec `WATCH-SPEC.md`).

**How it runs**
- Windows starts `run.mjs --if-due` five minutes after each login (`schedule.ps1`, `weekly.cmd`). It runs only when the last run is six days old, so every page is read once a week whenever the PC is on. Each run first adds the pages of markets added since.
- `sources.mjs` builds the list: a market's website, `market_private.source_url`, every `website_crawl` fact.
- A page is fetched politely: our own User-Agent, robots.txt, one request per host every 3–5 s, ETag.
- `dates.mjs` reads dates with our own four-language reader, strict on purpose: a miss costs a question, a wrong read would cost a wrong stamp.
- `decide.mjs` stamps our dates the page shows plainly (the `confirm.mjs` write; `unverified` becomes `confirmed`) and turns differences into questions.
- Only questions go to AI: Haiku through `claude -p` on Delfim's subscription (`CLAUDE_CODE_OAUTH_TOKEN` in `.env.local`), no tools, every quote checked on the page and its date re-read by our extractor.
- Findings reach Telegram through `/adm/notify` with signed Approve / Dismiss links; `watch_decide()` applies one in a transaction.

**Rules, each with its case in `decide.test.mjs`**
- An unchanged page raises no new questions; a question once asked is never asked again.
- A page that stops naming its market is "source broken", never "cancelled".
- **Listing sites, guides, tourism boards and Wikipedia are never a source** (`LISTING` in `sources.mjs`).
- **A new date must be written as this market's** — on its own line, in the caption under it, or under the nearest heading that names a market — because organisers list their other markets on the same page. A line with "nur …" that does not name us is another market's day.
- **An earlier start with the same end is the sellers' gate**, not new hours.
- A page that states "every Saturday" never makes a date "missing".

**The Finder.** `scripts/finder/` finds markets we lack: `leads-mft.mjs` reads meine-flohmarkt-termine.de's recurring flea markets (name, town, postcode, organiser link — nothing else is kept from a directory), `check.mjs` drops ours and keeps those whose organiser page shows an upcoming date beside their town. Candidates become intake files by hand (`intake/README.md`); the finder never writes to the database.

## Structured data

Google supports the event experience only on pages about a single event. So a market page emits **exactly one `Event`** — the next occurrence — plus `Place` and `BreadcrumbList`; later dates are visible content. City and region pages emit no `Event`. `name`, `startDate` (with timezone offset) and `location` (name and full address) are all required. `eventStatus` carries cancellations; **keep `startDate` when cancelled.** Guardrail 6.

## Generated prose

Google's scaled-content policy covers AI text "no matter how it's created". The line: **generated prose may present facts we hold; it may not substitute for facts we do not hold.**

## Styles

Four layers, tokens → base → components → pages; guardrail 7 compares class names across `src/`, the one check that reads source. The rules are in `.claude/rules/styles.md`.

## The eleven guardrails

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
| 11 | One-market towns and cantons have no page of their own | A town or canton page built for a single market; the address 301s to the market |

A fixtures build says `SKIP` where a check needs real data; that is waiting, not passing.
