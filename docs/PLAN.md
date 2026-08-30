# Plan

Where the project stands and what happens next. **Read this first in any new session.**

---

## Now

Repo and build pipeline work. `npm run verify` is green. Astro 7 skeleton, design tokens, six CI guardrails. No product pages yet.

**Fynda is a visitor tool.** SEO is how people find it. Organiser tooling comes later. **Switzerland is unclaimed** — no credible nationwide Swiss directory exists (`PRODUCT.md`). That is the opening.

**Approach:** build the site first, bring Swiss data in once it works. The domain is a few days away and blocks nothing.

**3.2 is done.** The schema is in `supabase/migrations/20260829120000_initial_schema.sql` and applies cleanly to Postgres 16 + PostGIS 3.4; `supabase/tests/schema_test.sql` holds 15 behavioural assertions and they all pass. The reasoning is in `ARCHITECTURE.md` §Data model.

**The page plan is written: `PAGES.md`.** Which pages exist, why, what is on each and in what order — decided from v1's own Search Console and event data rather than taste. It closes the "what each page contains" question and lists five changes to what is already built.

**The home page is built** at `/de/`, from the design in `design/Main.dc.html`: hero, search, date chips, a weekend rail, an upcoming list, the category grid, the organiser CTA and the tab bar. Components live in `src/components/`, the query layer in `src/lib/`.

**It renders sample data.** `src/lib/fixtures.ts` holds six markets shaped exactly like what `publishable_markets` returns. The build prints a warning every time it uses them, and `getMarkets()` throws rather than falling back if `FYNDA_DATA_SOURCE=supabase`. **Nothing may be deployed until 1.4 and 3.4 are done.**

**3.3 is done.** `supabase/migrations/20260829130000_analytics_events.sql`, with 17 tests. v1's best idea is carried over — the event registry enforced as a database constraint, so a broken collector cannot persist arbitrary or identifying keys. Three things changed: no persistent visitor identifier at all (a rotating daily hash only), `no_results` as its own event rather than a search with zero results, and retention that actually prunes. v1 monitored storage and never deleted anything.

**The market page is built** (`/de/markt/[slug]/`) — the atom. Exactly one schema.org `Event`, `eventStatus` wired, `startDate` carrying the venue's UTC offset, the cancellation stated with its reason and the next real date, and freshness said plainly: "Bestätigt am 28. Aug".

**All six guardrails now PASS with no SKIPs** for the first time. `npm run build` runs the data build first (`scripts/emit-data.mjs`), which writes `data/entities.json` and `data/occurrences.json` from the same query layer the pages use — so the ratio and horizon checks measure the real thing.

**Next: 3.4, the import** — blocked on credentials, see below.

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
| ~~3.7~~ | ~~Card component~~ | **Done 2026-08-29.** `MarketPoster` (rail) and `MarketRow` (list), plus the no-photo illustration set |
| 3.8 | City + region pages | Views over the atom. **Home shipped early** (2026-08-29) against fixtures |
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
last_reviewed: 2026-08-29
