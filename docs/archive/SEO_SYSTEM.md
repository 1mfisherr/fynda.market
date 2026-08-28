# FleaFind — SEO System

Last updated: 2026-08-05
Consolidates: seo-system-v1. The generic place resolver now handles every live registry city as a Regional or Municipality Hub; Zürich is still the only seeded region. See PROJECT_STATE.md for the current rollout decision.

**Core principle:** FleaFind's SEO moat is verified, date-specific, location-specific inventory — not editorial content.

---

## Page Types

| Page type | SEO job |
|---|---|
| Homepage | Brand anchor, national discovery entry point |
| Country overview (`/schweiz`) | National category hub, links to the public place hubs |
| Place hub (Region/Municipality) | Most important page type for ranking — captures place-level queries. The generic `/schweiz/[slug]` resolver serves Regional and Municipality Hubs, aliases, and redirects; it is not a canton-only or legacy-city route. |
| City day pages (`/samstag`, `/sonntag`) | Day-specific catalogue selection. Evergreen — show next upcoming date, not a fixed calendar date. Request-rendered with the Zurich clock; no timed database query or ISR. |
| City weekend page (`/dieses-wochenende`) | High-intent Friday–Sunday selection from the catalogue. Resolves current weekend, next weekend, then a truthful 14-day coming-up window. Request-rendered with the Zurich clock. |
| Market hub (`/markt/[slug]`) | Persistent entity page, anchors all occurrence pages, holds ranking authority over time |
| Occurrence page (`/markt/[slug]/[date]`) | Date-specific entity URL. Existing redirect contract is intentionally separate from national exact-date search: once a non-cancelled occurrence is more than 14 days old, redirect temporarily to the next individual date when one exists, otherwise permanently to its market hub. |
| Date discovery (`/maerkte/[period]`) | Time-window selection from the published catalogue (heute, Friday–Sunday wochenende, month, exact ISO date). Weekend intent may roll forward truthfully; an exact ISO date never does. Request-rendered with the Zurich clock. |

---

## Title/H1 Rules (all page types)
- Front-load the primary keyword; brand name at the end after a pipe
- Include the year on city/market pages
- Never repeat the same title across two pages
- 50–60 characters, never exceed 70
- Place hub: front-load "Flohmarkt {Place}" not "Flohmärkte in {Place}" — matches more searches

---

## Structured Data
- All JSON-LD server-rendered as plain `<script type="application/ld+json">`, via a shared `JsonLdScripts` component in `<head>` through per-page-family parallel routes. Serialization escapes `<` to `\u003c` to prevent script-injection via admin-authored content (fixed July 2026).
- Schema must match visible content exactly — no hidden/fabricated fields. A July 2026 place-FAQ mismatch was fixed; visible FAQ and FAQ JSON-LD must always use the same resolved question set.
- Occurrence pages: `Event` + `BreadcrumbList`, required fields include full `eventStatus`/`startDate`/`endDate`/`location`/`image`/`description`/`url`
- Market hub: `EventSeries` not `Event` — it's a recurring series, not one occurrence
- City/discovery pages: `ItemList` pointing to canonical market hub/occurrence URLs
- A discovery page's visible rows and ItemList come from the same resolved model and use the same URLs/order. Future alternatives on an exact historical search are not emitted as if they belonged to the requested date.
- Event status mapping (corrected July 2026): confirmed→EventScheduled, **tentative→EventScheduled** (was incorrectly EventPostponed — postponed means rescheduled, not merely unconfirmed), cancelled→EventCancelled. Cancelled pages stay live and indexed, never deleted.
- Schema `url` field must match the canonical URL of the current locale page — never the DE version on an FR page. Breadcrumb "Home" label is now properly localized via `tCommon('breadcrumbHome')` everywhere (was previously a hardcoded English string, fixed July 2026).
- The `WebSite` schema's `SearchAction` (sitelinks searchbox) has been **removed entirely** as of July 2026 — it targeted a place-resolver URL rather than a real search page, was hardcoded to the German locale regardless of page language, and the Google feature it supported is deprecated anyway.

---

## Indexability

| Page type | Index? | Notes |
|---|---|---|
| Homepage, country overview | Yes | — |
| Place hub | Depends | Use the Geography v1 inventory/recurrence hysteresis rule in ARCHITECTURE.md. Regional hubs remain indexed; a never-published municipality is 404. |
| Market hub | Yes | All active market hubs, including seasonal and no-date markets, are durable ranking assets. |
| Future/today's occurrence | Yes | — |
| Past occurrence | No (noindex) after 7 days | Existing behavior: after 14 days, 307 to the next individual occurrence when available; otherwise permanent redirect to the market hub. Cancelled occurrences are exempt. |
| Cancelled occurrence | Yes | Keep indexed, mark clearly |
| Date discovery — heute/wochenende/naechste-woche | Yes | Canonical, evergreen |
| Date discovery — ISO date (today or past) | No | Today canonicalises to `/heute`; past exact pages retain the requested historical facts and may offer separately labelled future alternatives. They never silently roll forward. |
| Empty place/date pages | Depends | A never-published migrated municipality is 404. Other place hubs use durable market inventory or an exit-rich empty state. Evergreen date-intent routes remain canonical; exact historical routes remain noindex. No empty result is caused by a swallowed source failure. |
| City-filtered discovery (`?city=`) | No | Noindex, canonical to unfiltered base |
| Admin routes | No | Never crawlable. As of July 2026: `robots.ts` explicitly disallows `/admin`, and the login page carries an explicit `robots: noindex` metadata export (previously relied on disallow alone) |
| OG image routes (`/opengraph-image`) | N/A (not a page) | As of July 2026: no longer blocked in `robots.ts` — the prior disallow rule was breaking social-share image previews on Twitter/X, LinkedIn, and messengers that respect robots.txt when fetching card images |
| `/submit` | Yes | Search-first organiser hub; missing markets are stored as structured `market_suggestions` for admin triage. It is intentionally absent from the sitemap. |

**Canonical rules:** every indexable page self-canonicalises in its own locale. No locale ever canonicals to another. x-default → DE version with www. All canonicals absolute, with www, https. As of July 2026, nested German day/weekend URLs (`/de/schweiz/:canton/:city/samstag`) now redirect to their flat canonical equivalent, matching how fr/it/en already worked — this closed a duplicate-content gap that was live in production.

**Hreflang:** all 4 locales + x-default, bidirectional, never partial clusters, must be 200 responses (never redirected/noindex targets).

---

## Internal Linking
- Click depth: place hubs ≤2 clicks from homepage, market hubs ≤3, occurrence pages ≤4
- Never generic anchor text ("hier klicken", "see all") — use descriptive patterns ("Flohmärkte in {City}", "{MarketName} am {Day}, {Date}")
- No facet-combination URLs ever (`/zuerich/samstag/indoor/vintage` forbidden) — one dimension per cell beyond place

---

## Content Standards
- Place hub: H1, factual market inventory, local intro, FAQ where available, and links to day/weekend pages and nearby places. Hubs with one or two public markets retain their own inventory; empty and never-published municipalities follow the Geography v1 indexability rules rather than a legacy city-template fallback. FAQ market-count figures must match the visible resolved list, not an unfiltered total.
- Market hub: name, ≥80 word visitor-facing description (no seller/vendor info), address/hours/fee, all upcoming dates, ≥1 image
- Occurrence page: date/time/address prominent, description, tags, then eligible same-place and elsewhere recommendations. Related rows use exact date → containing Friday–Sunday → 14-day coming-up fallback, link the individual occurrence shown, and disappear as a whole when genuinely empty.
- Descriptions never include seller/vendor info, generic filler, unverified claims, or FleaFind marketing language

---

## Standing Technical Rules
See AGENTS.md for currently-verified, load-bearing rules (canonical/metadata generation, revalidation, data access). This file holds SEO-specific content rules not repeated there.
