# Docs map

Read only what the task needs. Every line loaded is context spent.

| File | Read it when |
|---|---|
| `../CLAUDE.md` | Always — loaded automatically. How to work here, commands, what is settled, the gotchas |
| `PLAN.md` | **First, every session.** Status, what is next, what is open |
| `ARCHITECTURE.md` | URLs, the data model, the import, structured data, the guardrails |
| `PAGES.md` | Which pages exist, what is on them, what was deliberately not built |
| `STACK.md` | What runs where, secrets, verified constraints, analytics |
| `PRODUCT.md` | Demand, competitors, the three loops, the moat |
| `BRAND.md` | Identity, the design system, e-mail |
| `IDEAS.md` | Parked, not committed |

**Loaded on demand:** `../.claude/rules/` — `functions.md`, `migrations.md`, `styles.md` — appear by themselves when a file in that directory is touched.

**Reference, only for a specific fact:** `reference/competitors.md`, `reference/database-options.md`, `../metabase/README.md`.

**Outside `docs/`:** `../guardrails.config.json` (architecture as config) · `../scripts/guardrails.mjs` (the ten checks) · `../src/lib/i18n.ts` (every URL) · `../src/lib/strings.ts` (interface copy) · `../src/lib/vocabulary.ts` (domain words) · `../design/` (mockups).

`archive/` is prior research and the pre-2026-09-15 changelog. **Don't read it unless asked for something specific.**

## Keeping these current

- **Status, not history.** `PLAN.md` says what is true now; git and `archive/PLAN-log-2026-09.md` say how it got there. Superseded text is rewritten in place, never appended to.
- **One home per fact.** A decision lives in `CLAUDE.md` (settled) or the doc that owns the topic — not both. Duplicates drift, and a contradiction makes the model pick one at random.
- **For every line: would removing it cause a mistake?** If not, cut it. Under ~200 lines per always-loaded file; past that, instructions get ignored.
- A lesson that will bite again goes in `CLAUDE.md` §Gotchas or the matching `.claude/rules/` file, as a rule — not as the story of the bug.
