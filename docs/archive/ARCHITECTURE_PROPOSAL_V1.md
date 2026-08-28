# Starting Architecture — A Concrete Proposal

Written 2026-08-27, in response to: *"what's the most basic architecture we could have that's still very good and very scalable?"*

**This is a proposal to react to, not a decision.** But unlike the other docs in this folder, it commits to specifics — the point is to have something concrete to argue with.

**The governing idea:**

> **Launch with the fewest page types that could not possibly be mistaken for spam. Everything else is a filter. Filters graduate to URLs only when they prove they deserve one.**

No functionality is lost — users can filter by date, radius and type from day one. Those filters just aren't indexable URLs yet. Google meets a small, dense, obviously useful site and watches it grow steadily, which is the trust pattern we want.

---

## 1. The launch set — four indexable page types

| # | Page type | One per | Content behind it | Count (Germany) |
|---|---|---|---|---|
| 1 | **Home** | site | Today / this weekend, search, entry points | 1 |
| 2 | **Market page** | real market | The market itself: what, where, all its dates, photos, organiser | ~8–15k eventually, **~200 at launch** |
| 3 | **City page** | city *that has markets* | Every market in that city, with dates | ~2–4k eventually, **~20 at launch** |
| 4 | **Region page** (Bundesland) | state | Every market in that state, grouped by city | 16 |

**That is the whole indexable surface at launch.**

**URL-to-market ratio: ~1.2.** FleaFind's was ~60.

Every one of these is content-backed by definition — a city page exists *because* markets exist there. There is no generator producing empty cells.

### Why these four

- **City page** — the best-performing page type in fleafind.ch's data by a wide margin (25.47 clicks/page).
- **Market page** — the atom. Everything else is a view over these.
- **Region page** — German autocomplete shows large Bundesland-level demand (`flohmarkt nrw`, `flohmarkt bayern`) that Swiss data never revealed. 16 pages, trivial cost.
- **Home** — carries the "today / this weekend" answer without needing a URL for it.

---

## 2. Everything else is a query parameter

Not indexed. Canonical points to the clean parent. Not in the sitemap. No crawlable internal links pointing at parameterised versions.

```
/de/deutschland/koeln?datum=2026-09-14
/de/deutschland/koeln?von=2026-09-13&bis=2026-09-15
/de/deutschland/koeln?typ=kinderflohmarkt
/de/deutschland/nordrhein-westfalen?wochenende=1
/umkreis?lat=50.93&lng=6.96&km=30          <- the "in der Nähe" answer
```

**The user experience is complete on day one.** Date filtering, radius search, type filtering, "this weekend" — all work. They simply don't generate indexable pages yet.

This is the most important structural decision here, because it makes **growth additive**. Promoting a filter to a URL later is a small contained change, not a re-architecture.

---

## 3. How pages graduate — the growth mechanism

A filter becomes an indexable page type when it passes a gate. This is "start small, add gradually" made concrete.

**Gate 1 — Density.** Would the average instance have real content? Suggested floor: **≥5 markets** on the page, and **≥80% of instances** clear it. If most instances would be near-empty, it fails and is never built.

**Gate 2 — Demand.** Is the query actually asked? Evidence from GSC (impressions already landing on the parent), autocomplete, or keyword data.

**Gate 3 — Probation.** Build **≤10 hand-checked instances**. Wait **4 weeks** of GSC data. Keep, fix, or delete on evidence.

**Gate 4 — Scale.** Only after probation passes, and only to instances that individually clear Gate 1.

### The likely graduation queue, best candidates first

| Candidate | Why it's promising | Density risk |
|---|---|---|
| `/de/deutschland/nordrhein-westfalen/heute` (region × time) | Big German demand; regions are large enough to stay full | **Low — best first candidate** |
| `/de/termine/2026-09-14` (national date) | Best CTR on fleafind.ch (14.8%); nationally scoped so always full | Low |
| `/de/termine/september-2026` (month) | Second-best clicks/page in Swiss data (small sample) | Low |
| `/de/deutschland/koeln/kinderflohmarkt` (city × facet) | Real standalone demand; facets are stable over time | Medium — gate per city |
| `/de/deutschland/koeln/2026-09-14` (city × date) | — | **High — this is what died. Probably never** |

Note the pattern: **big geography × time is safe; small geography × time is not.** The gate encodes that automatically instead of needing a rule.

---

## 4. URL shape — one decision that must be made early

Proposed:

```
/de/                                    language root (German)
/de/deutschland/                        country
/de/deutschland/nordrhein-westfalen/    region
/de/deutschland/koeln/                  city
/de/markt/mauerpark-berlin/             market
```

**The unresolved bit:** language and country are not the same thing — German is spoken in DE, AT and CH. Two options:

- **(a) Language-first** `/de/koeln/` — shorter and cleaner, but needs a plan for duplicate city names across countries.
- **(b) Language + country** `/de/deutschland/koeln/` — unambiguous, scales across Europe with no collisions, one segment deeper.

**DECIDED 2026-08-27: option (b)** — `/de/deutschland/koeln/`. Delfim's call. Language segment, then country, then place. Unambiguous across Europe, no city-name collisions, and it removes a whole class of future migration pain. Retrofitting country into URLs later would have been exactly the archaeology project the brief warns about.

Market pages sit at `/de/markt/[slug]/` — deliberately outside the geography tree, so a market never needs a new URL if its place classification changes.

---

## 5. Performance and scalability

- **Static generation for all four page types**, rebuilt on a schedule. These pages change slowly; no reason to render per request.
- **Filters run client-side or through a light API**, never by rendering new pages. Radius search especially — that is a query against coordinates, not a page.
- **Dates live in the database as concrete rows**, queryable and filterable. (Whether *recurrence rules* also get stored is a separate optimisation, deliberately deferred — `ARCHITECTURE_IDEAS.md` Part 6 §3.)
- **The data layer is API-shaped from day one.** Pages consume the same query interface an agent would. Costs nothing now; makes WebMCP or any agent surface cheap later (`ARCHITECTURE_IDEAS.md` Part 3).
- **Core Web Vitals as a build constraint**, not a later pass: explicit dimensions on every image, LCP under 2s on 4G mobile.
- **CI checks:** URL-to-entity ratio, and a minimum-content assertion per published page. The gate in §3 is worth nothing unless a machine enforces it.

---

## 6. What this deliberately does not do at launch

Recorded so these read as choices, not oversights:

- **No date pages** — despite being the best-CTR type in Swiss data. They are a Gate-3 candidate for month 2, not a launch type.
- **No facet pages** — same reasoning.
- **No occurrence pages** — the known failure mode.
- **No `/heute/` or `/dieses-wochenende/` URLs** — served as content on the home and city pages.
- **No locale matrix** — one language until a second has real content behind it.

---

## 7. Why this answers the anxiety

The worry was: *every finding points at more pages, and more pages is what killed us.*

This resolves it structurally rather than by nerve:

1. **Launch is roughly 240 pages, all content-dense.** There is no plausible reading of Google's scaled-content policy that this trips.
2. **The two biggest German opportunities need zero new URLs.** Proximity ("in der Nähe") and open-now ("jetzt geöffnet") are UX and data-freshness features, not page types.
3. **Growth is gated by evidence rather than by nerve.** Nobody has to guess whether a page type is safe — density and demand are measured before it gets built.
4. **Nothing is irreversible.** The filter already exists, so promoting it is small; demoting it back is equally small.

The site starts small and dense, grows only where evidence says to, and a machine enforces the floor. That is the opposite of what fleafind.ch did — and it removes the eggshells, because the gate does the worrying.

---

owner: Delfim
last_reviewed: 2026-08-27
status: proposal — react to it, nothing decided
