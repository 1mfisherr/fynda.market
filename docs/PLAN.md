# Plan

Where the project stands and what happens next. **Read this first in any new session.**

---

## Now

Repo and build pipeline work. `npm run verify` is green. Astro 7 skeleton, design tokens, six CI guardrails. No product pages yet.

**Fynda is a visitor tool.** SEO is how people find it. Organiser tooling comes later. **Switzerland is unclaimed** — no credible nationwide Swiss directory exists (`PRODUCT.md`). That is the opening.

**Approach:** build the site first, bring Swiss data in once it works. The domain is a few days away and blocks nothing.

**3.2 is done.** The schema is in `supabase/migrations/20260829120000_initial_schema.sql` and applies cleanly to Postgres 16 + PostGIS 3.4; `supabase/tests/schema_test.sql` holds 15 behavioural assertions and they all pass. The reasoning is in `ARCHITECTURE.md` §Data model.

**The home page is built** at `/de/`, from the design in `design/Main.dc.html`: hero, search, date chips, a weekend rail, an upcoming list, the category grid, the organiser CTA and the tab bar. Components live in `src/components/`, the query layer in `src/lib/`.

**It renders sample data.** `src/lib/fixtures.ts` holds six markets shaped exactly like what `publishable_markets` returns. The build prints a warning every time it uses them, and `getMarkets()` throws rather than falling back if `FYNDA_DATA_SOURCE=supabase`. **Nothing may be deployed until 1.4 and 3.4 are done.**

**Next: 3.3, the analytics event schema.** Events not collected cannot be recovered, so this lands before any page ships. Read v1's `analytics_events` and `outbound_click_events` first — 12,385 rows and the hashing was already right.

### Where the data comes from

**Supabase is the only source. Re-dump from the live v1 Supabase project before any import.**

The local copy in `~/Documents/fleafind-backups/2026-08-29/` (193 markets, 2,363 dates, 12,385 analytics events) is a **snapshot that ages**, and any local Docker/`supabase start` database is a stale dev copy that must never be treated as truth. Use them to read shapes and counts, never as the import source.

`~/Documents/fleafind/supabase/migrations/` holds v1's 24 migrations — read for decisions, not for schema to copy. The verdict on each is in `ARCHITECTURE.md`.

---

## Phase 1 — Accounts

| # | Task | Notes |
|---|---|---|
| ~~1.1~~ | ~~GitHub repo~~ | Done — `github.com/1mfisherr/fynda.market` |
| 1.2 | Register `fynda.market` | Only this one domain |
| 1.3 | Cloudflare account | Workers + R2 |
| 1.4 | Supabase project | **Region `eu-central-2` (Zurich)** |
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
| **3.3** | **Analytics event schema** | **Next.** Events not collected cannot be recovered |
| 3.4 | Import and clean v1 data, every fact with a source | Everything else is a view over this |
| 3.5 | Decide German text search (`STACK.md`) | Changing it later is a re-index |
| 3.6 | Market page — one `Event` only, `eventStatus` wired | The atom |
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
- **What each page contains.** Field order, above the fold, freshness signal, cancelled state.
- **The beachhead region.** Zürich or Luzern.
- **CH-wide or beachhead-only at launch?** Recommendation: publish CH-wide for SEO, concentrate verification and photography in one region.
- **German text search** — step 3.5, and it has to be settled before the search box exists.
- **One guardrail fix** left from `ARCHITECTURE.md`: the content floor counts characters, and should count verified facts. Generated prose can satisfy a character count without adding anything real. Fix before any bulk description generation. (The one-`Event`-per-page rule shipped 2026-08-29.)
- **Would vendors pay for anything?** Five conversations settle it. Parked in `IDEAS.md`.

## Conventions

- `npm run verify` before every push.
- Guardrails reporting `SKIP` are waiting on data, not passing.
- Colour, type, spacing and motion come from `src/styles/tokens.css`. Never hardcoded.
- German copy is not final until a native speaker reads it.
- `guardrails.config.json` encodes architecture. Changing a threshold means changing `ARCHITECTURE.md` in the same commit — or not doing it.

---

owner: Delfim
last_reviewed: 2026-08-29
