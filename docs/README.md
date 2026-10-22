# Docs map

Read only what the task needs. Every line loaded is context spent.

| File | Read it when |
|---|---|
| `../CLAUDE.md` | Always — loaded automatically. How to work here, commands, what is settled, the gotchas |
| `PLAN.md` | **First, every session.** What runs, what is next, what is open |
| `ARCHITECTURE.md` | URLs, locales, the data model, organisers, the import, the Market Watch, structured data, the guardrails |
| `PAGES.md` | Which pages exist, what is on each and why, what was deliberately not built |
| `STACK.md` | What runs where, secrets, verified constraints, analytics and identity |
| `PRODUCT.md` | Demand, competitors, the three loops, organisers, the moat |
| `BRAND.md` | Identity, the design system, e-mail |
| `IDEAS.md` | Parked, not committed |
| `WATCH-SPEC.md` | What is left to build in the Market Watch and the Market Finder (both running; how they work is `ARCHITECTURE.md` §Watch); deleted when the list is empty |

**Loaded on demand:** `../.claude/rules/` — `functions.md`, `migrations.md`, `styles.md`, `copy.md` — appear by themselves when a matching file is read or edited.

**Reference, only for a specific fact:** `reference/competitors.md` · `reference/database-options.md` · `reference/organiser-research/` · `reference/analytics-research/` · `reference/seo-research/` · `../metabase/README.md`.

**Outside `docs/`:** `../guardrails.config.json` (architecture as config) · `../scripts/guardrails.mjs` (the checks) · `../src/lib/i18n.ts` (every URL) · `../src/lib/strings.ts` (interface copy) · `../src/lib/utility-copy.ts` (the form pages) · `../src/lib/legal/` (about, imprint, privacy, terms) · `../src/lib/vocabulary.ts` (domain words) · `../design/` (mockups; `design/archive/logo/` is the closed logo search).

**Logs beside their work:** `../intake/photos/README.md` (photo batches) · `../intake/README.md` (market research) · `../watch-data/last-run.log` (the last Market Watch).

`archive/` is prior research, the September and October plan logs, and the guidance these rules come from. **Don't read it unless asked for something specific.**

## Keeping these current

Sources: Anthropic's and OpenAI's own guidance (`archive/docs-guidance-2026-09.md`), rechecked 2026-10-22.

- **Status, not history.** Every doc says what is true now and why. Superseded text is rewritten in place, never appended to; the story of how a thing got here lives in git and the plan logs in `archive/`. A date in a doc marks a decision, not an event.
- **One home per fact.** A decision lives in `CLAUDE.md` (settled) or the doc that owns the topic — not both. Duplicates drift, and a contradiction makes the model pick one at random.
- **Every line: would removing it cause a mistake?** If not, cut it. Nothing the code, `package.json` or `ls` already says. Bullets and short rows, not paragraphs: a table cell that grows into an essay is where the last bloat hid.
- **A check, not a hope.** `scripts/docs-size.mjs` holds `CLAUDE.md` and `PLAN.md` to a byte budget and a line length, in `verify` and the session-end `deploy`. Over the line, cut — never raise the number.
- **Logs live beside their work, not in `PLAN.md`.** A batch log, a run report, a research narrative: next to the data it describes, or in the commit message. `PLAN.md` gets one line per result.
- **A repeated mistake is a doc edit, not a chat correction.** Same mistake twice → one line in `CLAUDE.md` §Gotchas or the matching `.claude/rules/` file, as a rule, not as the story of the bug. A check that can be run beats a sentence that asks for care.
- **Project rules live in the repo, not in Claude's memory.** Memory is per-machine and holds only how Delfim likes to work; a rule there that also sits here is a duplicate.
- **Only `PLAN.md` holds to-dos, and each says what evidence put it there.** A research report records what was found; a guess it produces goes to `IDEAS.md`, not to the plan. A theory written as a task reads as a decision the next day (the canton-page note, 2026-09-19).
- **Big work gets a spec, then a fresh session.** The spec is deleted when the durable parts have moved into the doc that owns them.
- **The name is `fynda.market`** in every doc, page and mail — never "Fynda".
