# Plan

Where the project stands and what happens next. **Read this first in any new session.**

---

## Now

Updated 2026-09-04.

**The site is built, on real data, in four languages, with photographs.** `FYNDA_DATA_SOURCE=supabase npm run verify` → **927 pages, all 10 guardrails green.** Ratio 1.00 (908 URLs / 226 entities × 4 locales), against v1's 8,500 URLs for 157 markets.

- **Database:** Supabase `eu-west-1`, Postgres 17.6. 161 markets, 2,357 occurrences, 55 cities, 14 cantons, 107 organisers, 1,782 facts. Credentials in `.env.local`; scripts connect via `scripts/db.mjs`.
- **One slug per place.** A city, canton and market keep the same address in all four languages — `/de/schweiz/zurich/`, `/it/svizzera/zurich/`, with the page still reading "Zurigo". Changed 2026-09-03; 45 of 55 cities already had one name in all four, and the per-locale version meant fixing a translation rewrote live URLs. Only the country segment is still translated. `docs/ARCHITECTURE.md` §URL shape.
- **Nothing that has been published can 404.** Retired slugs are kept forever and emitted as 301s in `_redirects` (57 today, from the rename above). A retired slug also stays reserved so it can never point at the wrong place later. Guardrail 9.
- **Locales:** de, fr, it, en. 908 pages in complete 4-language hreflang clusters. **Market descriptions render in all four** — the fr/it/en prose was reviewed 2026-08-31 and released. Market-kind names are per locale too; they were German everywhere until the types became a block of tiles on the French home page.
- **Live page types:** home, market, city, **canton**, the four product utility pages in all four languages, two German-only legal pages, `/umkreis/`, plus `sitemap`, `robots.txt`, `/llms.txt`, and `/ics/[slug].ics` per market.
- **Photographs:** 135 photos on 146 of 157 market pages, each written at two sizes — a 1440px hero and a 148px square. A city page's images went from ~2.2 MB to 116 KB. 11 markets pointed at pexels stock URLs in v1 and keep the illustration instead — `docs/BRAND.md`. `scripts/import-images.mjs` re-encodes from the v1 repo and rewrites `markets.image_url` from the facts; `src/lib/images.ts` holds the naming rule both it and `PhotoOrArt` obey.
- **Every internal link resolves** (27,772 checked), and **every breadcrumb `item` URL is a page that exists**. No page promises something that 404s.
- **Filters actually filter.** `MarketRow` sets `display: grid`, which beats the browser's `[hidden] { display: none }` — so every list filter on the site was marking rows hidden and rendering them anyway. It looked like it worked because an empty day is hidden as a whole. `base.css` now makes `[hidden]` win, and the day band's count is rewritten from what matched (`src/lib/day-count.ts`) rather than from what the page was built with.
- **Desktop is drawn.** One breakpoint at 900px, where `.wrapper` widens from 720 to 1080 — the same wrapper, not a second one, so header, main and footer cannot drift apart. Four changes: the **day becomes a column beside its rows** and sticks while you scroll it (new `DayGroup` component, which also removes the day markup that was typed out on three pages); the **row gains a freshness column** instead of stretching; the **market page splits**, with Route and the organiser link in a rail that never leaves the screen — they used to sit 859px down, while directions are 55% of every outbound click; and prose caps itself at 66ch everywhere so nothing runs to 155 characters a line. Mobile is byte-for-byte unchanged, checked at 375px on every page type. Measured at 375 / 768 / 1024 / 1440 across 17 URLs: nothing overflows.
- **One loud thing per row, and nothing that repeats.** The name is the only bold ink on a row; the rhythm drops to grey, the venue quieter still — three weights, no ties, in the order of the decision. Deleted: the city on a city page, the word "frei" (151 of 157 markets are free), and "durch den Veranstalter" (true of every confirmed row). The rule is **say the exception, never the rule** — `docs/BRAND.md`. On a phone this took the first market from **509px down the page to 328px**, four visible on the first screen instead of one, with the filter chips back on a single line. Measured 320px → 1920px across nine pages and four locales: nothing overflows, nothing clips.
- **`npm run deploy` cannot publish a fixtures build.** It wipes `dist/` first and then refuses to upload unless the build recorded `source: supabase`. A stale `dist/` mixing a fixtures build with a database one produced 956 pages against the database's 927 and the guardrails read the leftovers as real — caught locally, but uploaded it would have put six invented markets on the live site.
- **The type scale is fluid, not stepped.** Every size grows smoothly from its phone value at 375px to **1.3× at 1440px**, and stops at both ends — a headline set for a 375px screen was reading as a subhead on a desktop. The columns that hold text (`--row-time`, `--row-fresh`, `--day-column`, the market page's rail) scale on the same two anchors, or the text would outgrow its cell. `--content-max-wide` went 1080 → 1200 to pay for it. Mobile is byte-identical: every clamp's minimum is the value it had. `docs/BRAND.md` §Type.
- **A list shows one row per market, or one row per date — never every date of every market.** The home page was 451 rows for 108 markets and thirty screens; it is now "Dieses Wochenende" (38 markets, two day bands) plus a short midweek block: **46 rows, seven screens.** Zürich went from 61 rows for 14 markets to **14**, each carrying how often it runs — "Jeden Samstag, ganzjährig", which 106 of 114 markets already have. The radius and saved views follow the same rule. A city heading now counts the rows on the page, not the markets in the city, so "17 Flohmärkte" over fourteen rows cannot happen. `src/lib/lists.ts`, `docs/PAGES.md` §One row per market.
- **A row has no facts column.** One was built and removed the same day: we hold stall counts and seller mix for none of the 161 markets, so it reserved 150px of white space on all 451 rows. Those facts render under the venue instead, and the column comes back when the data does.
- **Nothing scrolls sideways.** All 17 page types measured at phone width. `.bleed` used to pull rows 16px outside `main`, which has no gutter to escape — the page scrolled horizontally and every row's rail and time were clipped off the left edge. The class is gone.
- **The site is live at `fynda.market`**, published 2026-09-04. Two defects were found by verifying the live site and are fixed: every unknown URL returned HTTP 200 with the `/` redirect stub (no 404 page existed), and nine noindex utility pages were in the sitemap because the exclusion list named only the German slugs. Guardrail 10 now checks the sitemap is exactly the indexable pages. `npm run deploy` builds against the live database, runs all nine guardrails, and uploads `dist/` to Cloudflare Pages — nothing reaches the web that a guardrail failed. The custom domain is not attached yet.
- **The build does NOT run on Cloudflare, deliberately.** Building there took five hours across six failed deploys, none of them about the site: the database password had to be copied into a second place and arrived first with a stray space and then as an API key, "Retry deployment" silently replays the old commit, the Git link dropped, and Supabase's direct host is IPv6-only. Building locally removes all of it — no password in Cloudflare, no dependency install on their builder, no Git integration in the path. The cost is that a push does not publish by itself. `scripts/deploy.mjs`.
- **Use Supabase's session pooler, not the direct host.** `db.<ref>.supabase.co` resolves to IPv6 only, which is a coin flip on a home connection; `aws-1-eu-west-1.pooler.supabase.com:5432` is IPv4 and is what `.env.local` holds.
- **Fixtures are still the default.** Without `FYNDA_DATA_SOURCE=supabase` the build warns and uses `src/lib/fixtures.ts`. Both paths green — CI has no database.

### Next, in order

0. **Launched 2026-09-04.** Live at `fynda.market`, sitemap submitted. Nothing to do but wait for Google: first pages indexed in roughly 3-14 days, meaningful query data in weeks. Do not resubmit the sitemap or change URLs while that settles.
1. **The last two German-only surfaces.** `UTILITY_LOCALES` in `src/lib/i18n.ts` is now per page, not per locale. Still German: `/umkreis/` (one page, no locale prefix — its copy has to move out of the template first) and the two legal pages, which are legal documents and need a person, not a translation. Everything else follows the visitor's language.
2. **Make the forms real.** All `mailto:` today. A Cloudflare Worker writing to `reports` plus a newsletter table replaces them without changing any page.
3. **The country page** `/{locale}/{country}/`. The route is allowed and nothing is built. Breadcrumbs stopped pretending it exists; they should include it once it does.
4. **German text search** — settle before any search box exists (`STACK.md`).

### The three loops

The product is one dataset plus the loops that keep it alive. Every page is a rendering of the facts ledger.

- **Truth loop** — report buttons carry the market with them (`?markt=…&grund=…`) → we verify → "Bestätigt am" gets fresher. The differentiated dataset the spam update rewards, and the quotable claim an AI answer needs.
- **Weekend loop** — save a market → Friday digest → go → report → better digest. Saving is `localStorage`, no account. ICS is the same loop through the visitor's own calendar.
- **Supply loop** — the organiser page is **"Das ist Ihre Marktseite"**, not "list your market". Single-player mode: useful to a church-bazaar organiser even if nobody else used Fynda. The data arrives as a by-product.

### The honest gap

The design shows stall counts, seller mix, packing-up times, dogs, toilets, travel advice. **We hold none of them, and v1 never did** — `raw_import_data` is empty in all 161 rows, and `market_type` means recurring/one-off, not indoor/outdoor. Blocks render only when their data exists; no placeholders, no invented figures.

**Market size and indoor/outdoor are tier 1** — they decide whether someone travels — and cannot come from data. They have to be asked for.

---

## Decisions

| Question | Answer |
|---|---|
| What is Fynda? | **A visitor tool.** SEO is the acquisition base |
| Migrate from fleafind.ch? | **No.** No content, and no redirects from the old domain. Old site untouched |
| Locales | **CH: de, fr, it, en. Every other country: its language + English** |
| URL shape | `/{locale}/{country}/{city}/` · `/{locale}/{market-word}/{slug}/` · canton via a type segment. The **words** in the path are translated; the **names** are not |
| Place slugs | **One slug in every language**, for cities, cantons and markets — a place name is a proper noun. Only the country segment is still translated. Transliterated in the language the place speaks — `buelach`, `duebendorf`, but `geneve`, `fribourg`. Zürich is `zurich`, the one place famous enough to have an international spelling |
| Renames | **A published address never dies.** Old slugs are kept and served as 301s; guardrail 9 enforces it |
| Photos | 135 moved across from v1, on 146 of 157 markets. Stock never ships — the 11 pexels URLs v1 held were dropped, not imported |
| Analytics | Own events in Postgres + self-hosted Metabase. No GA4, no Plausible. Daily hash for everyone, persistent id only on consent. Nothing deleted |
| Launch scope | **All of Switzerland**, verification and photos concentrated in one region |
| Monetisation | Deferred. Organisers and local business, never users |
| Hosting | Cloudflare, not Vercel |
| Newsletter | From day one, city-segmented |
| Reviews, accounts, mascot | No / no / on hold |
| Saved markets, ICS | Yes — no accounts |
| Map | A view, not the front door |
| Region level | **One: canton / Bundesland.** Metro groupings are what the radius filter is for |
| Date horizon | **120 days** on generated dates and on anything rendered. Confirmed hand-entered dates are not capped |
| `/` | Redirects to `/de/` |
| Tags | Day one in the data model, **filters not URLs**, small set |

### What we will not build

**No region × category URLs, no PLZ zones, no `/heute/` URLs, no category pages, no per-date market pages, no city × date.** Eventbrite's own `/d/germany--berlin/flea-market/` serves an AI webinar, a power-trading conference and a knitting course — the matrix generates the page, the inventory cannot fill it, so the definition loosens until it is garbage. Their model needs full pages; ours permits a page not to exist.

### Canton URLs

```
/de/schweiz/zurich/             city Zürich
/de/schweiz/kanton/zurich/      canton Zürich
/de/deutschland/bundesland/bayern/
```

Five names collide (Zürich, Bern, Luzern, St. Gallen, Schaffhausen) and it is structural, not Swiss — Berlin, Hamburg and Bremen are city-states. Booking.com (`/city/`, `/region/`), Eventbrite (`/d/`, `/e/`) and meine-flohmarkt-termine (`/ort/`, `/de/bundesland/`) all put the entity type in the path. It keeps the place name clean, which matters where the query is "flohmarkt bayern", never "flohmarkt bundesland bayern".

**All 14 cantons have a page.** The density gate an earlier draft proposed (≥5 markets) was a second guess at a question the content floor already answers on the rendered page — and the smallest canton, Schaffhausen with one market, clears that floor at 822 characters against 300. The canton page leads with its city list rather than its dates, which is both the better answer to "flohmarkt kanton x" and what keeps a one-market canton from duplicating its one city page.

---

## Accounts still needed

| # | Task | Notes |
|---|---|---|
| ~~1.2~~ | ~~Register `fynda.market`~~ | Done, at Cloudflare. Not yet attached to the Pages project |
| ~~1.3~~ | ~~Cloudflare~~ | Done. Pages project `fynda-market`, deployed by `npm run deploy` |
| 1.5 | Resend | Newsletter sending |
| 1.6 | Metabase host | ~$5–15/mo |
| ~~1.7~~ | ~~Search Console~~ | Done 2026-09-04. Domain property, sitemap submitted. Expect no data for days — that is normal, not a fault |

Done: GitHub repo, Supabase project, Astro skeleton + guardrails.

---

## Where the data comes from

**The live v1 Supabase project is the only import source.** `V1_DATABASE_URL` in `.env.local`.

`~/Documents/fleafind-backups/2026-08-29/` and any local `supabase start` database are **stale snapshots** — read them for shape, never import from them. `~/Documents/fleafind/supabase/migrations/` holds v1's 24 migrations: read for decisions, not for schema.

**Scripts, in order:** `import-v1.mjs` → `localise-places.mjs` (per-locale names and slugs, idempotent). The importer is destructive on re-run by design — it deletes what it owns and reloads, so correcting it means editing it and running it again. That stops being the right tool the day anything is hand-entered.

### What the import decided

- **Free-text place names are gone.** `markets.city` disagreed with the venue in 39 of 161 rows; `canton` held both `AG` and `Aargau`. Cities come from `venues.city`, cantons normalised, two source errors fixed by postal code (Pratteln → BL, Subingen → SO).
- **Market kind is inferred from the name** where v1 knew only three types. 28 are written to `facts` as `inferred`, so the guess is visible and a real source overrules it.
- **Closed markets are imported, not published.** 4 closed markets carry 279 future dates, excluded by `publishable_markets`.

---

## Still open

- **Distance on cards.** `/umkreis/` computes it from a known origin; a card shows the city only. Never print a distance we guessed.
- **The tag taxonomy.** Keep it small — 60+ categories killed v1.
- **The beachhead region.** Zürich or Luzern.
- **The content floor counts characters, and should count verified facts.** Prose can satisfy a character count without adding anything real. Fix before any bulk description generation — it is also what would let a description-free Italian page pass on its facts alone.
- **Would vendors pay for anything?** Five conversations settle it. Parked in `IDEAS.md`.
- **Cross-border locales** (an Italian speaker searching for Paris). The structure allows it; let Search Console decide rather than guessing now.

---

## Conventions

- `npm run verify` before every push — **`astro check`, then the build, then the guardrails.** The type check used to run only in CI, so `astro.config.mjs` reached GitHub with three type errors that a local verify had reported as green. Guardrails reporting `SKIP` are waiting on data, not passing.
- **Rules here are defaults, not laws.** Changing one is normal: say what it protected against, why that is outweighed, change doc and config in the same commit. Never route around one silently. See `ARCHITECTURE.md` §How to read this document.
- **Four style layers: tokens → base → components → pages.** A page styles only what nothing else could want; a component never sets its own outer margin. Guardrail 7 enforces it.
- **One breakpoint, 900px, and one wrapper.** A media query cannot read a token, so `--breakpoint-wide` is duplicated in every query that uses it — the comment beside each says so. Anything that is read rather than scanned caps itself at `--measure`; a wider container is for lists and chrome only.
- **No German string that names a concept lives in a template.** Interface copy is `src/lib/strings.ts`, domain vocabulary `src/lib/vocabulary.ts`, URLs are built by `src/lib/i18n.ts` — never assembled by hand.
- **Translated prose ships when a human has read it**, never before. Interface strings are written per language; market descriptions wait.
- Colour, type, spacing and motion come from `src/styles/tokens.css`. Never hardcoded.

---

owner: Delfim
last_reviewed: 2026-09-05
