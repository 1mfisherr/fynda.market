# Plan

Where the project stands and what happens next. **Read this first in any new session.**

---

## Now

Updated 2026-08-30, end of session.

**Database is live.** Supabase, `eu-west-1`, Postgres 17.6. Both migrations applied, PostGIS in `extensions`, RLS on every table, 17 tables and 5 views. Credentials in `.env.local`; `scripts/db.mjs` is how scripts connect.

**Design is approved and built.** `design/fynda-v5.html` is the reference — the Linientafel: a departure board, the date leading, market type as a line colour, cancelled markets kept on the board. Home, market and city pages are all rebuilt to it. `npm run verify` green, `npm run check` clean, one `Event` per market page and none elsewhere.

**Everything on the site is still sample data** from `src/lib/fixtures.ts`. The build warns every time it uses it, and `getMarkets()` throws rather than falling back once `FYNDA_DATA_SOURCE=supabase`. Nothing can be deployed until the import runs.

**No photographs exist.** Listings use the illustration set, which is the designed default, not a stopgap.

### Next, in order

1. **3.4 — import the v1 data.** 161 markets, 2,357 dates from the live fleafind database, every fact with a source into the `facts` ledger. Swap `getMarkets()` from fixtures to Supabase. This unblocks everything.
2. **Region page** (`/de/schweiz/[kanton]/`) — thin, reviewed after four weeks. It is built for Germany more than Switzerland.
3. **3.5 — decide German text search** before any search box exists.
4. **3.9 filters, 3.10 organiser CTA, 3.11 newsletter and ICS.**

### The honest gap

The design shows stall counts, seller mix, packing-up times, dogs, toilets and travel advice. **We hold none of them.** The types carry them as optional fields and a block renders only when its data exists — no placeholders, no invented figures. They get captured during the import, from organisers, and from the report buttons on the market page. See `PAGES.md` §The fields we do not have.

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
| **3.4** | **Import and clean v1 data, every fact with a source** | **Next.** Blocked on `.env` credentials |
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
| Photos | Every market gets one. Source still open |
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
5. **Import captures two new fields** — market size and indoor/outdoor. Both are tier 1 (they decide whether someone travels) and we hold neither. Higher value than any layout change above.

## Conventions

- `npm run verify` before every push.
- Guardrails reporting `SKIP` are waiting on data, not passing.
- Colour, type, spacing and motion come from `src/styles/tokens.css`. Never hardcoded.
- German copy is not final until a native speaker reads it.
- `guardrails.config.json` encodes architecture. Changing a threshold means changing `ARCHITECTURE.md` in the same commit — or not doing it.

---

owner: Delfim
last_reviewed: 2026-08-30
