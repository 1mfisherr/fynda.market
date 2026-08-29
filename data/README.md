# data/

Generated files the guardrails read. **Nothing here is hand-written** — the data build emits it, and it is regenerated on every build.

Committed so CI can verify without a database connection.

| File | Shape | Read by |
|---|---|---|
| `entities.json` | `{ "markets": 0, "cities": 0, "regions": 0 }` | URL-to-entity ratio check |
| `occurrences.json` | `[{ "marketSlug": "...", "date": "2026-09-14" }, ...]` | 120-day horizon check |

Both are written by `scripts/emit-data.mjs`, which runs as `prebuild` — so `npm run build` and `npm run verify` cannot forget it. It imports the same query layer the pages use, rather than keeping a second copy of the logic that could drift.

If market or place pages ever exist without `entities.json`, the ratio check **fails** rather than skipping — a missing entity count means the ratio cannot be verified, and unverifiable is not the same as fine.

`occurrences.json` contains only dates inside the 120-day horizon, clamped by the same function the templates use. The file cannot claim a build is clean while a template renders something further out.
