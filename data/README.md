# data/

Generated files the guardrails read. **Nothing here is hand-written** — the data build emits it, and it is regenerated on every build.

Committed so CI can verify without a database connection.

| File | Shape | Read by |
|---|---|---|
| `entities.json` | `{ "source": "supabase", "markets": 0, "cities": 0, "regions": 0 }` | URL-to-entity ratio check |
| `occurrences.json` | `[{ "marketSlug": "...", "date": "2026-09-14" }, ...]` | 120-day horizon check |
| `redirects.json` | `[{ "from": "/fr/suisse/bale/", "to": "/fr/suisse/basel/" }, ...]` | Retired-address check |

All three are written by `scripts/emit-data.mjs`, which runs as `prebuild` — so `npm run build` and `npm run verify` cannot forget it. It imports the same query layer the pages use, rather than keeping a second copy of the logic that could drift.

If market or place pages ever exist without `entities.json`, the ratio check **fails** rather than skipping — a missing entity count means the ratio cannot be verified, and unverifiable is not the same as fine.

`occurrences.json` contains only dates inside the 120-day horizon, clamped by the same function the templates use. The file cannot claim a build is clean while a template renders something further out.

`redirects.json` is every address that has ever been published and has since moved — built from the retired rows in `public.slugs`. It is the **only** file here that a fixtures build does not rewrite: a build with six markets would erase the record of every URL the real site has moved. `public/_redirects`, which Astro copies into `dist/` for Cloudflare Pages, is generated from it on every build and is gitignored.

`entities.json` carries `source` so the retired-address check knows whether the build it is looking at contains the real data. On a fixtures build it verifies the redirects shipped intact; the targets are checked on a database build, which is the one that deploys.
