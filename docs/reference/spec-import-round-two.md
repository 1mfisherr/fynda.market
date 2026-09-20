# Spec: import the 64 markets added on fleafind, 19–20 September 2026

Build from this in a fresh session. Delete the file when the durable parts are in `ARCHITECTURE.md` §Import.

## What is true (checked 2026-09-20)

- The fleafind database (`V1_DATABASE_URL`) holds 225 markets; we have 162. The 64 missing were created there on 2026-09-19/20 (`markets.created_at >= '2026-09-19'`). Slugs are the key: none of the 64 collides with ours.
- Every one of the 64 has: `display_name` in de/fr/it/en (`market_locales`), `description` + `description_en/fr/it`, a venue with lat/lng, postal code and city, at least one `market_dates` row, `market_private.source_url`, an `image_url`. 44 have `market_private.organiser_email`. No region overrides. Kinds: 56 `flea_market`, 8 `brocante`.
- Every one of the 64 has a photo file and a thumbnail in `C:\Users\delfi\Documents\fleafind\public\images\<slug>.webp` (ten were added from Delfim's Desktop on 2026-09-20 and `image_url` set in fleafind's database). Also new there: `markets.municipality_id → municipalities` (name, `canton_code`, four slugs).
- 14 of the 64 carry no upcoming date (annual, awaiting 2027) — same case as our 46; they go in as `active`.
- Six sit in a village inside a bigger commune: Chambrelien/Rochefort, Misery/Misery-Courtion, Oron-la-Ville/Oron, Emmenbrücke/Emmen, Glovelier/Haute-Sorne, Seewen/Schwyz. **Town = the municipality** (what the post office and Maps use); the village stays in the address line. Delfim was told, did not object.
- Five markets have dates without a start time — allowed, the page copes.

## Why not `import-v1.mjs`

It deletes every owned table and reloads. Since 2026-09-19 the live database holds things that would not survive: 22 organiser links and e-mails, Alpin-Flohmi Interlaken (hand-entered, photo from Delfim), 13 replaced organiser links, 16 opening times, one description fix, every date stamped verified, the `welcome`/`seven_days` mail log. `import-v1.mjs` stays as the record of the first import; it is not run again.

## Build: `scripts/import-v1-additions.mjs`

`node scripts/import-v1-additions.mjs --dry-run` → report; without the flag → one transaction.

1. **Read** fleafind with the same `readV1()` + `plan()` as `import-v1.mjs` (extract them into `scripts/lib/v1.mjs` or import from the file — do not copy the 300 lines). Keep `CANTON_FIXES`, the kind-from-name pass, the `inferred` facts.
2. **Filter** to markets whose slug is not in `public.markets`. Refuse to run if any of those slugs exists in `public.slugs` for another entity (a town called the same thing) — print and stop.
3. **Match, never re-create:** country by `iso2`; region by `code`; city by its slug (from `slugify(municipality name)`, with the `CANTON_FIXES`); venue by `(city_id, name, postal_code)`; organiser by `name` (case-insensitive, trimmed). Only what is missing is inserted. A new city gets `point` = centroid of its venues, `slug` and de `name` exactly as the first import wrote them; then `localise-places.mjs` (idempotent) fills fr/it/en names and the exonyms.
4. **Insert** markets, `market_private`, `slugs`, `texts` (name + description × 4 locales), `occurrences` (`origin = 'import'`, status mapped as before, `confirmed_at` from `verified_at`), and the facts: `listing` (source_url), `kind` when inferred, `image_url` (source_ref `fleafind v1 repository, public/images`). `admin_notes` goes into `market_private.admin_notes` as is — the research agent's opening times, fees, parking and phone numbers live there until a facts pass reads them.
5. **Photos:** `node scripts/import-images.mjs "C:\Users\delfi\Documents\fleafind\public\images"` — idempotent, re-encodes all, sets `markets.image_url` from the facts. Expect 64 more markets with a photo, zero stock.
6. **Organisers:** the 44 e-mails arrive through `market_private.organiser_email` like the first import. Then `scripts/import-organiser-emails.mjs` (or the same logic) creates the organiser rows' links so the welcome workflow sees them — check `send-organiser-welcome.mjs --dry-run` lists them afterwards. **Do not send**; Delfim runs the welcome from GitHub.
7. **Verify:** `FYNDA_DATA_SOURCE=supabase npm run verify` — guardrail 2 (URL-to-entity ratio) and 3 (content floor) are the ones a batch of new towns can trip; guardrail 4 caps dates at 120 days regardless of how many the source has. Expect ~226 markets, ~100 towns, all 26 cantons possibly not yet — count and report.
8. **Deploy** with `npm run deploy`, then drive the live site: one new market page per locale, one new town (a commune case, e.g. `/de/schweiz/emmen/`), one canton that was new (Glarus, Uri, Obwalden, Jura, Neuchâtel, Ticino were absent or thin), a canton list page, Near me around Lugano. Screenshots.
9. **Docs the same session:** `PLAN.md` §Now and §Data counts; `ARCHITECTURE.md` §Import gains one line: additions come through `import-v1-additions.mjs`, matching by slug, never the destructive one. Delete this spec.

## Not in scope

Market descriptions in the settled voice (parked until the content floor counts facts). Tags. The municipality slugs from fleafind — ours come from `localise-places.mjs`. Anything on fleafind.ch itself (its repo has ten uncommitted photos; that is its own AI's business).
