# Architecture

The page structure, the URL shape, and the rule that keeps it safe.

---

## The governing idea

> **Launch with the fewest page types that could not possibly be mistaken for spam. Everything else is a filter. Filters become pages only when they earn it.**

Users lose nothing — date, radius and category filtering all work from day one. Those filters simply aren't indexable URLs yet. Google meets a small, dense, obviously useful site and watches it grow.

This makes growth **additive**. Promoting a filter to a real page later is a contained change, not a rebuild.

---

## Launch: four indexable page types

| Page type | One per | Count at launch (CH) |
|---|---|---|
| **Home** | site | 1 |
| **Market page** | real market | ~150 |
| **City page** | city *that has markets* | ~50 |
| **Region page** | canton / Bundesland | ~26 |

**~230 pages.** Roughly 1.2 URLs per market. v1 was ~60.

Every one is content-backed by definition — a city page exists *because* markets exist there.

**Why these four:** city pages were by far the best performers on v1 (25.5 clicks/page vs 4.9 for market pages). Market pages are the atom everything else is a view over. Region pages are cheap and German demand for them is large. Home carries "today / this weekend" without needing a URL for it.

---

## Everything else is a query parameter

Not indexed. Canonical points to the clean parent. Out of the sitemap. No crawlable links pointing at them.

```
/de/deutschland/koeln?datum=2026-09-14
/de/deutschland/koeln?typ=kinderflohmarkt
/de/deutschland/nordrhein-westfalen?wochenende=1
/umkreis?lat=50.93&lng=6.96&km=30      <- the "in der Nähe" answer
```

---

## URL shape

```
/de/                                    language
/de/deutschland/                        country
/de/deutschland/nordrhein-westfalen/    region
/de/deutschland/koeln/                  city
/de/markt/[slug]/                       market
```

Language first, then country, then place. Unambiguous across Europe, no city-name collisions.

**Open: what lives at `/`?** The table above starts at `/de/`, which leaves the root undecided. Two options: `/` 301s to `/de/`, or `/` is the home page and the `/de/` prefix only appears once a second locale exists. **Recommendation: `/` redirects to `/de/`** — URL shape is expensive to change later, and the prefix is already in every other route. The current holding page sits at `/` because it is not a locale page; the guardrails permit both until this is settled.

**Market pages sit outside the geography tree on purpose** — a market never needs a new URL if its city or region classification changes.

---

## How a page type graduates

A filter becomes an indexable page type only after passing all four:

1. **Density** — would the average instance have real content? Floor: **≥5 markets**, and **≥80% of instances** clear it. If most instances would be near-empty, it is never built.
2. **Demand** — is the query actually asked? Evidence from Search Console, autocomplete, or keyword data.
3. **Probation** — build **≤10 hand-checked instances**, wait **4 weeks** of real data, keep or kill on evidence.
4. **Scale** — only after probation, and only to instances that individually pass the density floor.

### Graduation queue, best first

| Candidate | Density risk |
|---|---|
| `/de/deutschland/nordrhein-westfalen/heute` (region × time) | **Low — best first candidate.** Big German demand, regions stay full |
| `/de/termine/2026-09-14` (national date) | Low. Best CTR on v1 (14.8%), nationally scoped so always full |
| `/de/termine/september-2026` (month) | Low |
| `/de/deutschland/koeln/kinderflohmarkt` (city × category) | Medium — gate per city |
| `/de/deutschland/koeln/2026-09-14` (city × date) | **High. This is what died. Probably never** |

The pattern the gate produces on its own: **big geography × time is safe, small geography × time is not.** No rule needed — density measures it.

---

## Not at launch, deliberately

These are choices, not oversights:

- **No date pages** — despite being the best-converting type on v1. Month-2 graduation candidate, not a launch type.
- **No category pages** — same reasoning.
- **No per-date market pages** — the known failure.
- **No `/heute/` URLs** — served as content on home and city pages.
- **One language** until a second has real content behind it.

---

## Data model

Geography tree → `country → region → city → venue`, then `market`, then concrete `occurrence` rows.

**Two things that are load-bearing:**

**1. Per-fact provenance.** Every fact carries its own source and timestamp, in an append-only ledger:

```
market exists            → organiser,      2026-03-01
runs Sundays 10–18       → organiser,      2026-03-01
14 Sept confirmed        → city website,   2026-08-20
has food stalls          → our visit,      2025-09-08
```

Not one timestamp per market. A market's *existence* stays true for years; *this Sunday's date* is worth a week. Per-fact provenance is what makes honest freshness possible, and freshness is both the trust signal and the AI-citation signal.

**2. Multi-country from commit one.** Even though one country ships first. Retrofitting geography is the expensive mistake.

### Dates

**Concrete occurrence rows, always.** People search and filter by specific dates — `flohmarkt 2.8.26` is a real query shape with 29% click-through. Dates must be queryable and displayable regardless of what sits underneath.

Recurrence rules are stored *as well*, as RRULE strings feeding a generator **hard-capped at 120 days**. Pages render rows, never rules.

---

## CI must enforce this

The gate above is worth nothing if a human has to remember it.

**Implemented** in `scripts/guardrails.mjs`, configured by `guardrails.config.json`, run by `npm run verify` and by `.github/workflows/ci.yml` on every push. Deploy runs after the checks, so red blocks it.

| # | Check | Notes |
|---|---|---|
| 1 | **Route allowlist** | A URL matching no allowed pattern fails. The two shapes that killed v1 are named and rejected explicitly: a fourth geography segment (`/de/schweiz/winterthur/samstag`) and market × date (`/de/markt/x/2026-07-05`). Non-ASCII slugs also fail — slugs are transliterated, `zuerich` not `zürich`. |
| 2 | **URL-to-entity ratio** | Ceiling 2.0, target ~1.2. Reads `data/entities.json`. **Fails, not skips**, if content pages exist without that file — unverifiable is not the same as fine. |
| 3 | **Content floor** | Minimum visible characters in `<main>`, per page type, asserted against built HTML. |
| 4 | **120-day horizon** | No occurrence row beyond it. Reads `data/occurrences.json`. |
| 5 | **Explicit image dimensions** | Every `<img>` needs width and height. v1 had a real layout-shift bug. |
| 6 | **Structured data** | Present where required, parses, and only expected `@type` values. |

Verified on setup: both v1 killer URL shapes were rebuilt deliberately, both were rejected, exit code 1.

**Known limitation.** Region and city URLs are structurally identical — `/de/deutschland/nordrhein-westfalen/` and `/de/deutschland/koeln/` have the same shape — so check 1 cannot tell them apart by pattern alone and treats both as "region or city". Once the geography data exists, the check should validate against the real slug lists instead of a regex. That is stronger anyway: it enforces *a page exists because there is content for it* directly.

---

owner: Delfim
last_reviewed: 2026-08-27
