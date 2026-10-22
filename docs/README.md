# Docs map

Read only what the task needs. Every line loaded is context spent.

| File | Read it when |
|---|---|
| `../CLAUDE.md` | Always — loaded automatically. How to work here, what is settled, the gotchas |
| `PLAN.md` | **First, every session.** What runs, what is next, what is open, where the last session left off |
| `ARCHITECTURE.md` | URLs, locales, the data model, organisers, structured data, the guardrails |
| `PAGES.md` | Home, town, region, Near me and the form pages: what is on each and why; what was deliberately not built |
| `MARKET-PAGE.md` | The market page, the organiser's edit page, and the facts a market carries |
| `WATCH.md` | How dates stay true: the v1 copy, the Market Watch, the Finder, and what is left to build |
| `STACK.md` | What runs where, scheduled work, secrets, verified constraints, analytics |
| `PRODUCT.md` | Demand, competitors, the three loops, organisers, the moat |
| `BRAND.md` | Identity, voice, the design system, e-mail |
| `IDEAS.md` | Parked, not committed |

**Claude Code's own files** (`../.claude/`):
- `rules/` — `functions.md`, `migrations.md`, `styles.md` load when a matching file is touched; `copy.md` is always loaded.
- `skills/` — procedures, loaded when the task needs them: `end-session`, `photo-batch`, `add-markets`, `keep-dates-true`.
- `agents/` — `fynda-researcher`, the Sonnet agent for research and bulk lookups.
- `hooks/` — `guard.mjs` refuses `git add -A` and a commit of fixture data, and asks before push, deploy, migrate, a real send, or an e-mail address leaving the machine; `start.mjs` opens each session with git state, what is due in `PLAN.md`, and the docs check.

**Reference, only for a specific fact:** `reference/competitors.md` · `reference/database-options.md` · `reference/organiser-research/` · `reference/analytics-research/` · `reference/seo-research/` · `../metabase/README.md`.

**Outside `docs/`:** `../guardrails.config.json` (architecture as config) · `../scripts/guardrails.mjs` (the checks) · `../src/lib/i18n.ts` (every URL) · `../src/lib/strings.ts` (interface copy) · `../src/lib/utility-copy.ts` (the form pages) · `../src/lib/legal/` (about, imprint, privacy, terms) · `../src/lib/vocabulary.ts` (domain words) · `../design/` (mockups).

**Logs beside their work:** `../intake/photos/README.md` (photo batches) · `../intake/README.md` (market research) · `../watch-data/last-run.log` (the last Market Watch). Superseded plans and research are in git history only (removed 2026-10-22, last in commit `a4b2f69`).

## Keeping these current

From Anthropic's and OpenAI's guidance, read 2026-10-22.

- **Status, not history.** Every doc says what is true now and why. Superseded text is rewritten in place; how a thing got here lives in git. A date in a doc marks a decision, not an event.
- **One home per fact.** A decision lives in `CLAUDE.md` (settled) or the doc that owns the topic — not both. A contradiction makes the model pick one at random. Point at a file, state the fact; don't copy it.
- **Every line: would removing it cause a mistake?** If not, cut it. Nothing the code, `package.json` or a script's top comment already says. Short rows, not paragraphs.
- **A check beats a sentence.** `scripts/docs-check.mjs` (in `verify`, `deploy` and every session start) holds each doc to a byte budget and a line length, and warns on dead paths, dead `§` pointers, a stale `PLAN.md` and a passage repeated in two docs. Budgets only go down. A rule broken twice becomes a hook, a guardrail or a test where it can — a sentence in `CLAUDE.md` §Gotchas or `.claude/rules/` where it can't.
- **Only `PLAN.md` holds to-dos, and each says what evidence put it there.** A guess goes to `IDEAS.md`. A dated reminder starts with its `YYYY-MM-DD`, so the session-start hook can say when it is due.
- **Everything lives in the repo.** Claude's memory on Delfim's PC is a cache: agents, other machines and cloud sessions never see it. A rule that matters goes here.
- **Big work gets a spec, then a fresh session.** The spec is deleted when its durable parts have moved into the doc that owns them.
