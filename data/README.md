# data/

Generated files the guardrails read. **Nothing here is hand-written** — the data build emits it, and it is regenerated on every build.

Committed so CI can verify without a database connection.

| File | Shape | Read by |
|---|---|---|
| `entities.json` | `{ "markets": 0, "cities": 0, "regions": 0 }` | URL-to-entity ratio check |
| `occurrences.json` | `[{ "marketSlug": "...", "date": "2026-09-14" }, ...]` | 120-day horizon check |

Neither exists yet — the data model is Phase 3 in [`../docs/PLAN.md`](../docs/PLAN.md).

Until they do, those two guardrails report `SKIP` rather than passing silently. The moment market or place pages exist without `entities.json`, the ratio check **fails** instead of skipping — a missing entity count means the ratio cannot be verified, and unverifiable is not the same as fine.
