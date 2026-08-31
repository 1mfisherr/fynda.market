# Plan

Where the project stands and what happens next. **Read this first in any new session.**

---

## Now

Updated 2026-08-31.

**The site is built, on real data, in four languages.** `FYNDA_DATA_SOURCE=supabase npm run verify` → **859 pages, all 8 guardrails green.** Ratio 1.00 (852 URLs / 212 entities × 4 locales), against v1's 8,500 URLs for 157 markets.

- **Database:** Supabase `eu-west-1`, Postgres 17.6. 161 markets, 2,357 occurrences, 55 cities, 14 cantons, 107 organisers, 1,782 facts. Credentials in `.env.local`; scripts connect via `scripts/db.mjs`.
- **Locales:** de, fr, it, en. 852 pages in complete 4-language hreflang clusters.
- **Live page types:** home, market, city, 7 utility pages, `/umkreis/`, plus `sitemap`, `robots.txt`, `/llms.txt`, and `/ics/[slug].ics` per market.
- **Every internal link resolves** (1,016 checked). No page promises something that 404s.
- **Fixtures are still the default.** Without `FYNDA_DATA_SOURCE=supabase` the build warns and uses `src/lib/fixtures.ts`. Both paths green — CI has no database.

### Next, in order

1. **Canton pages** `/{locale}/{country}/kanton/[canton]/` — shape settled below, guardrail already allows it. 8 of 14 cantons clear the density gate; ship those 8.
2. **Utility page copy in fr/it/en.** Slugs are defined (`UTILITY` in `src/lib/i18n.ts`); only German exists, so `UTILITY_LOCALES = ['de']` and other locales link to the German page. Add a locale to that array once its copy exists.
3. **Native review of the fr/it/en market descriptions.** Already in the database from v1, AI-generated, therefore not rendered. This review is the gate.
4. **Photographs.** 151 webp files in `~/Documents/fleafind/public/images/`; each filename is already an `image_url` fact. Move them in, then read the facts back onto `markets.image_url`.
5. **Desktop design.** Today it is the mobile column centred in a void; nothing above 900px has been drawn.
6. **Make the forms real.** All `mailto:` today. A Cloudflare Worker writing to `reports` plus a newsletter table replaces them without changing any page.
7. **German text search** — settle before any search box exists (`STACK.md`).

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
| Migrate from fleafind.ch? | **No.** No content, no redirects. Old site untouched |
| Locales | **CH: de, fr, it, en. Every other country: its language + English** |
| URL shape | `/{locale}/{country}/{city}/` · `/{locale}/{market-word}/{slug}/` · canton via a type segment. Whole path in the page's language |
| Market slug | **One slug in every language.** A market name is a proper noun |
| Photos | Every market gets one. 151 exist in the v1 repo, to be moved across |
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
/de/schweiz/zuerich/            city Zürich
/de/schweiz/kanton/zuerich/     canton Zürich
/de/deutschland/bundesland/bayern/
```

Five names collide (Zürich, Bern, Luzern, St. Gallen, Schaffhausen) and it is structural, not Swiss — Berlin, Hamburg and Bremen are city-states. Booking.com (`/city/`, `/region/`), Eventbrite (`/d/`, `/e/`) and meine-flohmarkt-termine (`/ort/`, `/de/bundesland/`) all put the entity type in the path. It keeps the place name clean, which matters where the query is "flohmarkt bayern", never "flohmarkt bundesland bayern".

Only 8 of 14 cantons have ≥5 markets, against a gate wanting 80%. **Ship the 8.** The others keep their city pages.

---

## Accounts still needed

| # | Task | Notes |
|---|---|---|
| 1.2 | Register `fynda.market` | Only this one domain |
| 1.3 | Cloudflare | Workers + R2 |
| 1.5 | Resend | Newsletter sending |
| 1.6 | Metabase host | ~$5–15/mo |
| 1.7 | Search Console | Verify the day the domain exists |

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

- `npm run verify` before every push. Guardrails reporting `SKIP` are waiting on data, not passing.
- **Rules here are defaults, not laws.** Changing one is normal: say what it protected against, why that is outweighed, change doc and config in the same commit. Never route around one silently. See `ARCHITECTURE.md` §How to read this document.
- **Four style layers: tokens → base → components → pages.** A page styles only what nothing else could want; a component never sets its own outer margin. Guardrail 7 enforces it.
- **No German string that names a concept lives in a template.** Interface copy is `src/lib/strings.ts`, domain vocabulary `src/lib/vocabulary.ts`, URLs are built by `src/lib/i18n.ts` — never assembled by hand.
- **Translated prose ships when a human has read it**, never before. Interface strings are written per language; market descriptions wait.
- Colour, type, spacing and motion come from `src/styles/tokens.css`. Never hardcoded.

---

owner: Delfim
last_reviewed: 2026-08-31
