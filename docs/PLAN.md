# Plan

Where the project stands and what happens next. **Read this first in any new session.**

---

## Now

Updated 2026-08-30, end of session.

**The v1 data is imported and the site builds on it.** `FYNDA_DATA_SOURCE=supabase npm run verify` produces **213 URLs for 212 entities** — a ratio of 1.00, against v1's 8,500 URLs for 157 markets — and all six guardrails pass. In the database: 161 markets, 2,357 occurrences, 55 cities, 14 cantons, 107 organisers, 1,782 facts. `scripts/import-v1.mjs` is the importer; `src/lib/supabase.ts` is the read.

**Fixtures still work and are still the default.** `getMarkets()` reads Supabase only when `FYNDA_DATA_SOURCE=supabase` is set; without it the build warns and uses `src/lib/fixtures.ts`. Both paths are green.

**Database is live.** Supabase, `eu-west-1`, Postgres 17.6. Both migrations applied, PostGIS in `extensions`, RLS on every table, 17 tables and 5 views. Credentials in `.env.local`; `scripts/db.mjs` is how scripts connect.

**Design is approved and built.** `design/fynda-v5.html` is the reference — the Linientafel: a departure board, the date leading, market type as a line colour, cancelled markets kept on the board. Home, market and city pages are all rebuilt to it.

**The photographs exist after all.** 151 webp files sit in `~/Documents/fleafind/public/images/`, and 150 markets point at them. They are not in this repo, so `markets.image_url` is null and listings use the illustration set. Each filename is recorded as an `image_url` fact, so moving the files across is a second pass, not a re-import. Delfim is bringing them.

### Next, in order

1. **Region pages** (`/de/schweiz/kanton/[kanton]/`) — the URL shape is settled (below); 8 cantons clear the density gate, 6 do not.
2. **Photographs.** Move the 151 files in, then read the `image_url` facts back onto `markets.image_url`.
3. **Desktop needs its own design.** Today it is the mobile column centred in a void.
4. **Make the forms real.** Every form is `mailto:` today. A Cloudflare Worker writing to `reports` and a newsletter table replaces that without changing any page's shape.
5. **3.5 — decide German text search** before any search box exists.

### The launch surface — built 2026-08-30

The site used to link to seven pages that did not exist: every market page offered three report buttons that 404'd, the home page's search submitted into nothing, and the footer's legal links went nowhere. All now exist, and a link check over `dist/` confirms **every one of 337 internal link targets resolves.**

`/de/melden/` · `/de/newsletter/` · `/de/veranstalter/` · `/de/gemerkt/` · `/de/impressum/` · `/de/datenschutz/` · `/umkreis/`

Plus `sitemap-index.xml` (213 indexable URLs, no utility pages), `robots.txt`, `/llms.txt`, and `/ics/[slug].ics` for all 157 markets.

**Forms do not post anywhere yet, and they say so.** Each opens the visitor's mail client with the values filled in. A form that silently discards what someone typed would be worse than no form; this is honest and costs no infrastructure. It is replaced by a Worker without the pages changing.

### The three loops

The product is one dataset and the loops that keep it alive. Every page is a rendering of the facts ledger; the work is the loops.

- **Truth loop** — report buttons carry the market with them (`/de/melden/?markt=…&grund=…`) → we verify → "Bestätigt am" gets fresher. This is the differentiated dataset the spam update rewards and the quotable claim an AI answer needs.
- **Weekend loop** — save a market or city → Friday digest → go → report → better digest. Saving is `localStorage`, no account. ICS is the same loop through the visitor's own calendar.
- **Supply loop** — `/de/veranstalter/` is **"Das ist Ihre Marktseite"**, not "list your market". Single-player mode: useful to a church-bazaar organiser even if nobody else used Fynda. The data arrives as a by-product.

### What we will not build

On the record so it stops being re-proposed: **no region × category URLs, no PLZ zones, no `/heute/` URLs, no category pages, no per-date market pages, no city × date.** Eventbrite's own `/d/germany--berlin/flea-market/` page serves an AI webinar, a power-trading conference and a knitting course — the programmatic matrix generates the page, the inventory cannot fill it, so the definition loosens until it is garbage. Their model requires full pages; ours permits a page not to exist.

### Canton URLs — decided 2026-08-30

```
/de/schweiz/zuerich/            city Zürich
/de/schweiz/kanton/zuerich/     canton Zürich
/de/deutschland/bundesland/bayern/
```

Five names collide (Zürich, Bern, Luzern, St. Gallen, Schaffhausen), and it is structural, not Swiss — Berlin, Hamburg and Bremen are city-states. **Booking.com (`/city/`, `/region/`), Eventbrite (`/d/`, `/e/`) and meine-flohmarkt-termine (`/ort/`, `/de/bundesland/`) all put the entity type in the path.** The type segment keeps the place name clean, which matters in Germany where the query is "flohmarkt bayern", never "flohmarkt bundesland bayern".

Only 8 of 14 cantons have ≥5 markets, and the graduation gate wants 80%. **Ship the 8 that pass.** The other six keep their city pages.

The guardrail change this needs is one literal allowlisted segment, nothing else: **a type segment partitions (one URL per canton), a facet multiplies (every place × seven weekdays).**

### What the import decided

Three v1 shapes did not survive the crossing, and each is written into `scripts/import-v1.mjs`:

- **Free-text place names are gone.** `markets.city` disagreed with the venue's real city in 39 of 161 rows and `canton` held both `AG` and `Aargau`. Cities are built from `venues.city`, cantons from `markets.canton` normalised, with two source errors corrected by postal code (Pratteln → BL, Subingen → SO).
- **Market kind is inferred from the name.** v1 knew three types; the Linientafel colours eight. 27 markets got a more specific line from their name, each written to `facts` as `inferred` so the guess is visible and a real source overrules it.
- **Closed markets are imported, not published.** 4 permanently closed markets carry 279 future dates. They are in the database and excluded by `publishable_markets`.

The importer is destructive on re-run by design: it deletes what it owns and reloads, so correcting it means editing it and running it again. That stops being the right tool the day anything is hand-entered.

### The honest gap

The design shows stall counts, seller mix, packing-up times, dogs, toilets and travel advice. **We hold none of them, and the import confirmed v1 never did either** — `market_private.raw_import_data` is empty in all 161 rows, and `market_type` is `permanent`/`temporary`, meaning recurring versus one-off, not indoor/outdoor. The types carry these as optional fields and a block renders only when its data exists — no placeholders, no invented figures. They now have to come from organisers and from the report buttons on the market page. See `PAGES.md` §The fields we do not have.

### Where the data comes from

**Supabase is the only source. Re-dump from the live v1 Supabase project before any import.**

**Done 2026-08-30 — credentials live in `.env.local`.** For reference, what it holds (copy `.env.example`, never commit it):
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for the new project, and `V1_DATABASE_URL` — the v1 project's connection string, from its Supabase dashboard under Project Settings → Database.

The local copy in `~/Documents/fleafind-backups/2026-08-29/` — **161 markets (157 active), 2,357 dates, 12,379 analytics events, 6,329 outbound clicks**, counted by loading it, not by trusting an earlier note — is a **snapshot that ages**, and any local Docker/`supabase start` database is a stale dev copy that must never be treated as truth. Use them to read shapes and counts, never as the import source.

`~/Documents/fleafind/supabase/migrations/` holds v1's 24 migrations — read for decisions, not for schema to copy. The verdict on each is in `ARCHITECTURE.md`.

---

## Phase 1 — Accounts

| # | Task | Notes |
|---|---|---|
| ~~1.1~~ | ~~GitHub repo~~ | Done — `github.com/1mfisherr/fynda.market` |
| 1.2 | Register `fynda.market` | Only this one domain |
| 1.3 | Cloudflare account | Workers + R2 |
| ~~1.4~~ | ~~Supabase project~~ | **Live 2026-08-30.** `eu-west-1` Ireland, Postgres 17.6. Both migrations pushed; PostGIS, pg_trgm, unaccent and pgcrypto all in `extensions`; 17 tables, 5 views, RLS on every table. Credentials in `.env.local` |
| 1.5 | Resend account | Newsletter sending |
| 1.6 | A host for Metabase | ~$5–15/mo |
| 1.7 | Google Search Console | Verify the day the domain exists |
| ~~1.8~~ | ~~Astro skeleton + guardrails~~ | Done |

## Phase 2 — Brand and copy

Runs in parallel. Detail in `BRAND.md`.

| # | Task | Owner |
|---|---|---|
| 2.1 | Lock the accent colour | Delfim |
| 2.2 | Wordmark and app mark | Claude → Delfim approves |
| 2.3 | Icon set — market types, states, actions | Claude |
| 2.4 | Tone of voice with examples | Claude → Delfim approves |
| 2.5 | Core German copy | Claude, **native speaker checks it** |
| 2.6 | Photograph the beachhead markets | Delfim |
| 2.7 | Instagram, narrowly | Delfim |

## Phase 3 — Build order

Each step is cheap here and expensive if done later.

| # | Step | Why this position |
|---|---|---|
| ~~3.1~~ | ~~Upgrade to Astro 7~~ | **Done 2026-08-29.** 7.2.9; TypeScript pinned to `^6` (TS 7 conflicts with `@astrojs/check`) |
| ~~3.2~~ | ~~Schema + first migration; PostGIS into `extensions`~~ | **Done 2026-08-29.** 14 tables, 3 publishability views, radius search, RLS deny-by-default |
| ~~3.3~~ | ~~Analytics event schema~~ | **Done 2026-08-29.** Event registry enforced in the database, no persistent identifier, retention that prunes |
| ~~3.4~~ | ~~Import and clean v1 data, every fact with a source~~ | **Done 2026-08-30.** `scripts/import-v1.mjs`, `src/lib/supabase.ts`. 213 URLs for 212 entities |
| 3.5 | Decide German text search (`STACK.md`) | Changing it later is a re-index |
| ~~3.6~~ | ~~Market page — one `Event` only, `eventStatus` wired~~ | **Done 2026-08-29.** Horizon clamp applied at render, not just in the database |
| ~~3.7~~ | ~~Card component~~ | **Replaced 2026-08-30** by the Linientafel components: `DateBand`, `LineCode`, `MarketRow`, `PhotoOrArt`, `TypeLegend` |
| ~~3.8~~ | ~~City page~~ | **Done 2026-08-30.** `/de/schweiz/[stadt]/`, year in the title. Region page still to do |
| 3.9 | Filters as query parameters; date chips | Never indexable URLs |
| 3.10 | Organiser CTA + contact form | |
| 3.11 | Newsletter, ICS export, saved markets | None depend on Google |
| 3.12 | Hand-verify the beachhead region | Everything outside it is shown as unverified |

---

## Decisions

| Question | Answer |
|---|---|
| What is Fynda? | **A visitor tool.** SEO is the acquisition base |
| Migrate from fleafind.ch? | **No. Nothing.** No content, no redirects. Old site stays untouched |
| Organiser surface at launch | "Own your market" CTA + contact form |
| Tags | From day one. Small set. **Filters, not URLs** |
| Photos | Every market gets one. 151 exist in the v1 repo, to be moved across |
| Analytics | Own events in Postgres + self-hosted Metabase. No Plausible, no GA4 |
| Analytics posture | **Collect as much as we can, anonymise, keep it.** Two layers: a daily hash for everyone (no consent needed), a persistent id for those who consent. **Nothing is ever deleted** |
| Launch scope | **All of Switzerland**, with verification and photos concentrated in one region |
| Monetisation | Deferred. Second-hand shops and featured markets are the intended surfaces |
| Multi-country | Structure for it from day one; ship one country |
| Hosting | Cloudflare, not Vercel |
| Newsletter | From day one, city-segmented |
| Reviews, accounts, mascot | No / no / on hold |
| Saved markets, ICS export | Yes — no accounts needed |
| Map | A view, not the front door |
| Region level | **One: canton / Bundesland.** Metro groupings are what the radius filter is for |
| Date horizon | **120 days on generated dates and on anything rendered.** Confirmed hand-entered dates are not capped |
| `/` | Redirects to `/de/` |

## Still open

- **Distance on cards.** The design shows "Zürich · 1,2 km". A static build cannot know where the reader is, so the cards show the city only. Distance needs either geolocation in the browser or the radius API — decide which when `/umkreis/` is built, and do not fake it in the meantime.
- **Where the photos come from.** No competitor manages this, because organisers do not supply images. Likely shape: real photography in the beachhead, a designed no-photo state elsewhere. Decide before the card component.
- **The tag taxonomy.** Keep it small — 60+ categories is the pattern that killed v1.
- **The beachhead region.** Zürich or Luzern.
- **German text search** — step 3.5, and it has to be settled before the search box exists.
- **One guardrail fix** left from `ARCHITECTURE.md`: the content floor counts characters, and should count verified facts. Generated prose can satisfy a character count without adding anything real. Fix before any bulk description generation. (The one-`Event`-per-page rule shipped 2026-08-29.)
- **Would vendors pay for anything?** Five conversations settle it. Parked in `IDEAS.md`.

## Next build steps, in order (from `PAGES.md`)

1. **Market page:** directions becomes the primary button and moves above the fold — it is currently at 859px on a 375×812 screen, below the fold, while being 55% of all outbound clicks. Organiser website gets a real secondary button. Hero illustration shrinks.
2. **Home:** search control reads as place + period + radius; category tiles move below the lists.
3. **City page**, with the year in the title.
4. **Region page**, thin, reviewed after four weeks.
5. **Market size and indoor/outdoor.** Both are tier 1 — they decide whether someone travels — and the import proved v1 holds neither, so they cannot come from data. They have to be asked for. Higher value than any layout change above.

## Conventions

- `npm run verify` before every push.
- Guardrails reporting `SKIP` are waiting on data, not passing.
- Colour, type, spacing and motion come from `src/styles/tokens.css`. Never hardcoded.
- **Four style layers: tokens → base → components → pages.** A page styles only what nothing else can want; a component never sets its own outer margin; German that names a concept lives in `src/lib/vocabulary.ts`. Guardrail 7 enforces all three. See `ARCHITECTURE.md` §Style architecture.
- German copy is not final until a native speaker reads it.
- `guardrails.config.json` encodes architecture. Changing a threshold means changing `ARCHITECTURE.md` in the same commit — or not doing it.

---

owner: Delfim
last_reviewed: 2026-08-30
