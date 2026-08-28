# FleaFind — Architecture

Last updated: 2026-08-05
Consolidates: architecture-v1, system-architecture (fable), geography-v1 (fable), intelligence-v1 (fable) — all four originals now retired.

---

## 1. Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js App Router |
| Database | Supabase (Postgres + PostGIS) |
| Hosting | Vercel |
| ORM | None — raw Supabase client |
| Geo | PostGIS + plain lat/lng doubles |
| i18n | next-intl (DE/FR/IT/EN) |
| CSS | CSS Modules (migrated off Tailwind, fully complete) |
| UI runtime | React 19 (upgraded July 2026, matching Next 16's App Router runtime — was previously on React 18 types against a React 19 runtime, a latent mismatch closed this session) |

---

## 2. Database Architecture

**Core principle:** Supabase is the canonical write database, but public renders do not query it. Every deployment first exports a versioned public catalogue from `public_markets`, approved occurrence/locale data, and the existing public geography interfaces. Public pages read that immutable catalogue only through `queries.ts` and `geography.ts`. The export boundary is still `public_markets`: direct `SELECT` on `markets` remains revoked from `anon`/`authenticated`.

**Published catalogue:** `scripts/generate-public-catalogue.mjs` creates `src/generated/public-catalogue.json` during `predev` and `prebuild`. It queries fresh public data, paginates every source, asserts exact market counts, IDs, slugs, relationships, and geography membership, then writes the file only after all checks pass. The catalogue carries a content-derived version. A failed export or parity check exits non-zero, so Vercel keeps the previous successful deployment live and exposes the failure in the deployment log. The checked-in file supports review and offline development; it is never generated from `scripts/data/markets`.

**Table responsibilities:**
- `markets` — public identity: name, slug, status, routing fields, `municipality_id`
- `venues` — physical location: name, address_line, postal_code, city, country_code, lat/lng, timezone, google_place_id
- `market_private` — admin-only: organiser_email, source_url, admin_notes, raw_import_data
- `market_dates` — occurrence schedule: date, times, status
- `market_locales` — translated names/descriptions/SEO metadata (synced from `markets.description_*` via trigger)
- `public_markets` — the public VIEW, additive-extended with `municipality_slug`
- `reports` — public correction submissions (rate-limited, IP-hashed, DB length-checked on all text fields as of July 2026)
- `organiser_requests` — public organiser-contact submissions (mandatory email, rate-limited, message length aligned with `reports` at 5,000 chars as of July 2026)
- `market_suggestions` — structured missing-market submissions from `/submit` (mandatory contact email, rate-limited, service-role writes)
- `newsletter_subscribers`, `newsletter_campaigns`, `newsletter_sends`, `newsletter_events` — private newsletter consent, frozen campaign, delivery-ledger, and anonymous provider-event records
- `analytics_events`, `analytics_identity_links` — private first-party product events and the explicit subscriber-identity link; direct identifiers never belong in `analytics_events`
- `analytics_*` views — aggregate, read-only reporting surfaces for the restricted `metabase_reader` role; Metabase is connected and operational

**Submission notifications:** `AFTER INSERT` triggers on `reports`, `organiser_requests`, and `market_suggestions` enqueue Vault-backed `pg_net` webhooks to the `submission-alert` Supabase Edge Function. The function validates the shared webhook secret and sends a Telegram alert linking to admin triage. Its Telegram credentials and webhook secret are deployment secrets, never repository values.

**Why venues are separate from markets:** a market is an event identity ("Flohmarkt Bürkliplatz"); a venue is a physical place. Multiple markets can share a venue (checked July 2026: 0 instances currently in production data, but the code path that would mishandle this — venue upsert overwriting a shared row — has not been hardened; treat as a known landmine, not a fixed issue).

The catalogue contains the complete approved public projection once. Query helpers select and shape card, detail, occurrence, recurring-day, continuation, sitemap, search, and JSON-LD models in memory; these consumers do not issue separate database reads.

**Sitemap reliability:** `src/app/sitemap.ts` builds from the same validated catalogue and a Zurich-aware request clock. Every eligible localized entry carries a complete hreflang alternate cluster; incomplete clusters are omitted. Source/export failures prevent deployment rather than replacing the live sitemap.

**Font loading:** root layout loads DM Sans and Fraunces through `next/font` and the wordmark through the local, subset `public/fonts/FiraSans-Black-FleaFind.woff2`; the full Fira Sans family is not shipped.

**International readiness:** `venues.country_code`, `venues.timezone`, `venues.postal_code` (nullable), and locale-aware routing provide useful primitives, but a second country would still require deliberate routing, geography, catalogue, content, and address-formatting decisions. The old automatic trigger of 3,000 monthly Swiss visitors has been retired: traffic has passed that level without proving that expansion should outrank Swiss depth, retention, and data trust. Austria remains a possible first target, not a committed build (see VISION.md).

---

## 3. The Pace-Layer Model

Different parts of FleaFind change at different speeds. Nothing fast may modify anything slow without passing through Delfim's approval. **Machines propose. Delfim commits. The database is canon.**

| # | Layer | Rate of change | Contents | Who changes it |
|---|---|---|---|---|
| 1 | Facts | Daily | venues, markets, occurrences, descriptions, verification fields, click events | Sprints/pipelines; verified by Delfim |
| 2 | Geography | Rarely | municipalities, regions, memberships, overrides, URL structure | Delfim only, deliberate commits |
| 3 | Surfaces | Per-type decision | The page lattice — every page type is a (place × time) or (place × theme) cell. Types are editorial; instances are programmatic | Types: Delfim. Instances: the system |
| 4 | Intelligence | Nightly/weekly | distance/travel-time matrices, chain detection, demand sensing, staleness prediction | Scheduled jobs. Sorts, recommends, proposes — never writes upward |
| 5 | Distribution & Revenue | Weekly | live email digests and click reports; future alerts, ICS exports, and sponsorships | Automation drafts; Delfim approves sends |

### Discovery decision domain (Layer 3A boundary)

Discovery is a request-time policy boundary inside Layer 3, not a sixth source-of-truth layer and not nightly Intelligence. It lives in `src/lib/discovery/`. Facts come from the published catalogue exported from `public_markets` plus approved occurrences/locales/geography; `queries.ts` and `geography.ts` remain the only data adapters. Discovery never writes to any layer.

Every migrated surface follows the same pipeline: resolve intent → resolve geography/timezone → load complete occurrence facts → classify eligibility → apply a named page-specific ranker → dedupe by `market_group ?? slug` → render a truthful fallback or hide. Weekend is Friday through Sunday. Fallback order is current weekend, next weekend, then an inclusive 14-day coming-up window. Exact national date searches never roll forward; individual occurrence URLs retain their separate legacy redirect contract.

Eligibility is centralized: cancelled rows never enter discovery; known closing times expire exactly when reached; unknown closing times remain listable until venue-local midnight, rank below complete hours, and never qualify for the homepage hero; tentative rows remain visible and labelled below every confirmed row. Homepage hero candidates also require an image and at least 60 minutes remaining. Ranking remains surface-specific—hero, chronological lists, same-place and elsewhere recommendations do not share a universal score.

Page loaders unwrap strict catalogue results. A genuine zero-row result may choose a durable fallback, an honest empty state, or no section. Source completeness is enforced during catalogue publication, before a deployment can go live.

**Standing guardrails:**
1. No scored canonical membership, ever — region membership is editorial rows, changed deliberately.
2. No machine-created page types — types by Delfim's approval only; instances programmatic.
3. No transport/routing API calls at page render — scheduled jobs + Postgres cache only.
4. No facet-combination URLs — one dimension per cell type beyond place.
5. Indexability is always damped (hysteresis), never instant.
6. No worldwide schema abstraction before a second country exists.
7. Layer 4 never writes upward — proposals only.

**Note:** Delfim has stated project docs are soft-overridable, not hard law — if a guardrail above seems wrong for a specific product decision, say so explicitly and get his call rather than treating it as an automatic veto.

---

## 4. Geography Model (Layer 2)

**Status: the Zürich pilot and its initial observation window are complete; Zürich remains the only committed region. The next rollout decision must use the dated GSC evidence recorded in PROJECT_STATE.md/ROADMAP.md. This section describes the model, not the live decision.**

> Municipality = factual place. Region = editorial browse/search intent. Market = exact listing. Occurrence = date.

- A market has exactly one municipality (factual).
- A region is an editorial browse destination composed of municipalities via a mapping table. Region membership is committed by Delfim — never computed, never automatic.
- The same market appears on its municipality hub AND its region's hub without duplicating data.

**Schema:** `municipalities` (place, slugs per locale, canton_code), `regions` (name, type, slugs, primary_municipality_id), `region_municipalities` (region_id, municipality_id, role: core/included/nearby, priority), `market_region_overrides` (market_id, region_id, action: include/exclude). `markets.municipality_id` FK added; `markets.city` stays as a denormalized read field until fully retired.

**Role semantics:** `core` = region's anchor city, listed first. `included` = metro-area municipality, part of the browse intent. `nearby` = edge of the browse intent, lowest priority. Peer cities (own search identity, e.g. Winterthur, Baden relative to Zürich) are NOT memberships — cross-linked only, never placed in another region's list.

**Committed region (Zürich):** core = Zürich. included = Dietikon, Schlieren, Dübendorf, Kloten, Adliswil. nearby = Uster, Rümlang, Oetwil am See, Rafz. Winterthur/Baden are peer hubs, not members.

**Proposed regions (need Delfim review before seeding):** Basel, Bern, Lausanne, Genève, Luzern — draft core/included/nearby splits exist, not yet committed.

**Page types this creates:**
- **Regional Hub** (`/schweiz/[region-slug]`) — same URL as before, template changes not address. Body: core markets → region markets (included+nearby) → nearby city pills → FAQ → day/weekend sub-pages. Title keeps clean keyword form + "& Umgebung" suffix.
- **Municipality Hub** (`/schweiz/[municipality-slug]`) — new page type. Strict municipality list + up to 5 soonest markets from parent region + upward link to region + nearby pills. Lighter content minimum than regional (no FAQ required at 1 market).
- One route (`/schweiz/[slug]`) resolves via `resolve_place()` RPC: region → Regional Hub, municipality → Municipality Hub, day-slug guard checked first, unknown → 404. As of July 2026, this includes properly flattening nested German day/weekend URLs to match the fr/it/en pattern (was a duplicate-content gap, fixed).

**Indexability (with hysteresis):** INDEX when ≥1 published market AND (≥1 future occurrence OR reliable recurrence). Grace window: 30 days after last future occurrence before NOINDEX — computed in Zurich local time, not UTC (fixed July 2026, was previously using `new Date().toISOString()`). 404 only if a municipality never had a published market. Regional hubs always indexed.

**Migration phases:** 0 consumer audit → 1 schema+backfill → 2 view+RPC extension (additive only) → 3 resolver+Municipality Hub → 4 Zürich pilot → 5 observation evidence (available) → 6 region rollout (not started; requires Delfim's explicit membership and rollout decision) → 7 country overview (shipped) → 8 scope inheritance + `CITY_REGISTRY` retirement (not started).

---

## 5. Intelligence Layer (Layer 4)

Quarantined: sorts, recommends, proposes — never creates URLs, never alters memberships, never writes to Layers 1–3.

**Why this layer exists:** flea markets chain instead of competing — a Saturday can hold 2–3 markets if they're close, measured in transit minutes not km.

**Modules, in build order:**
- **Live request-time precursor — related discovery:** market and occurrence pages now rank eligible same-place/elsewhere occurrences with straight-line distance when coordinates exist, and deterministic date/name fallback when they do not. This is Layer 3A presentation policy, not persisted Intelligence and not PostGIS output.
- **M1 — richer nearby intelligence:** reserved for a future persisted/derived model if simple request-time ordering proves insufficient.
- **M2 — Travel-time matrix**: opentransportdata.swiss (free, CHF 0), scheduled job only, never called at render, cached in Postgres. **Delfim rejected building "worth the trip" on real transit data as overcomplicated — simple distance/drive-time instead. This module as specced may not get built; revisit before starting.**
- **M3 — Chain detection**: two occurrences are "combinable" same-date, ≤25 transit min apart, compatible time windows.
- **M4 — "Kombinierbar heute" + Flohmi-Tour**: chain-based occurrence module + auto-drafted tour content for the Friday digest.
- **M5 — Demand sensing**: weekly GSC pull → detect (place × time/theme) cells with impressions but no page → file proposals into the approval queue.
- **M6 — Membership proposals**: draft region membership roles for Delfim to edit/commit, from transit minutes + market mass + demand signal.
- **M7 — "Lohnt die Anreise"**: recommend heavier markets within reach on smaller hubs. Simplified per Delfim's call — distance-based, not transit-time.
- **M8 — Staleness prediction**: learn which market types go stale fastest, prioritise verification queue.

**Guardrails:** never writes to municipalities/regions/overrides/markets/venues/market_dates. Never creates/deletes/renames URLs or page types. No external API calls at render. All derived tables rebuildable from scratch, never source of truth.

---

## 6. Caching & Revalidation

Admin saves update Supabase only. A public data change is published by the normal push/deploy flow: export catalogue → parity check → build/deploy → atomic live deployment switch. There is no render-time path invalidation and no timed database refresh. Admin success messages make this publication boundary explicit.

Time-sensitive pages (`homepage`, date discovery, place hubs/day/weekend pages, market/occurrence pages, and their structured-data slots) use `dynamic = 'force-dynamic'` with `revalidate = 0`. They calculate Zurich-local today/weekend/end-time state at request time over the in-process catalogue. This keeps clock-dependent copy and eligibility exact without Supabase egress or ISR writes. Non-temporal outputs such as the search index and OG images are static for the deployment (`revalidate = false`).

**The sitemap is the exception** (corrected July 26, 2026 — this section previously listed it among the `force-dynamic`/`revalidate = 0` routes, which was never true in the code). `src/app/sitemap.ts` exports `revalidate = 86400` and no `dynamic`: it is date-sensitive but does not need rebuilding for every crawler hit, and daily ISR keeps a last-good copy if a source read fails. Per AGENTS.md rule 17, read the route's actual exports rather than any table in a doc.

Recurring Saturday/Sunday place pages keep a 400-day planning horizon, but filter matching civil dates in memory from the one shared catalogue. PlaceContinuation, search, sitemap, and JSON-LD use that same copy rather than independent source queries.

---

## 7. Standing Rules (data layer)

See AGENTS.md for the full, currently-verified rule set. This section only holds architectural context not repeated there.
