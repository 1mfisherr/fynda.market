---
name: add-markets
description: Bring new markets into fynda.market — from the live v1 project, from researched intake files, from the Finder's leads — and add researched facts (indoor/outdoor, stalls, rain, tags). Use when adding, importing or researching markets or their facts.
---

# Adding markets and facts

Every write here changes the live database at once — say so to Delfim. A new market is built only once it is `active`; an `unverified` one waits.

## From v1

**The live v1 Supabase project is the only source** (`V1_DATABASE_URL`). Local backups are stale — read for shape, never import. Delfim keeps adding markets there; they come across in batches.

1. `node scripts/import-v1-additions.mjs --dry-run` — what v1 has that we don't. A market is new when its slug is not here; cantons, towns, venues and organisers are matched and reused, nothing existing is updated. An organiser arriving with an e-mail gets a link at once. Cantons are matched among Swiss regions only (BE, SH and NW are also Bundesland codes).
2. Without the flag it adds them. `--hidden` adds them unverified, for a batch whose texts are rewritten in our words first — v1's words never go live; `intake/descriptions-v1-winter/check.mjs` checks the rewrites.
3. It prints the German-only rhythm lines it added; their en/fr/it go into `texts` by hand before the deploy (the site falls back to German otherwise).
4. `node scripts/import-images.mjs` (a photo already in `public/images` satisfies its fact and is left alone), then `FYNDA_DATA_SOURCE=supabase npm run verify`.

- `import-v1.mjs` ran once. It deletes what it owns and reloads, which the live database no longer survives (organiser links, hand edits, the mail log). **Never again.**
- Importers read v1 through `scripts/lib/v1.mjs`; place names and slugs come from `scripts/lib/places.mjs`, which `localise-places.mjs` also uses, so a new canton needs its fr/it/en names there first.
- **A town is the postal town on the venue** (Emmenbrücke, not Emmen; Seewen SZ, not Schwyz — what the address says and what people search; one hand exception, Interlaken for a hall in Wilderswil), never a free-text column. Cantons normalised; market kind inferred from the name, recorded as `inferred`; v1's photos hotlinked from elsewhere (pexels.com) are not carried over.

## From research (every country but Switzerland)

1. **Finder:** `node scripts/finder/leads-mft.mjs`, then `node scripts/finder/check.mjs intake/finder/leads-mft-<date>.json` — markets we lack, kept if the organiser's page shows a date → `intake/finder/check-<country>-<date>.json`. How it decides: `docs/WATCH.md`.
2. **Intake files** by hand or by `fynda-researcher` agents, one per market: shape and rules in `intake/README.md`. A directory only tells you a market exists; every fact comes from the organiser's own page.
3. `node scripts/import-intake.mjs intake/<country> --dry-run`, then without the flag: creates them as `unverified`, never touches what exists. Flip to `active` once checked.
4. New markets' pages into the Market Watch: `node scripts/watch/sources.mjs --apply`. Every market needs a photo (`photo-batch`).

## Facts

`node scripts/set-market-facts.mjs intake/facts/<batch>.json` — indoor/outdoor, stall count, rain, who sells, tags into `markets` and the facts ledger, each with its URL and quote. Dry run without `--apply`; never overwrites a value already set. **Check every agent fact by hand first** — a range, an old figure, another edition's venue are the usual misses. A tag marks what is special about a market, never what every flea market has (`intake/tags/`).
