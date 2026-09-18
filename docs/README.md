# Docs map

Read only what the task needs. Every line loaded is context spent.

| File | Read it when |
|---|---|
| `../CLAUDE.md` | Always — loaded automatically. How to work here, commands, what is settled, the gotchas |
| `PLAN.md` | **First, every session.** What runs, what is next, what is open |
| `ARCHITECTURE.md` | URLs, locales, the data model, organisers, the import, structured data, the guardrails |
| `PAGES.md` | Which pages exist, what is on each and why, what was deliberately not built |
| `STACK.md` | What runs where, secrets, verified constraints, analytics and identity |
| `PRODUCT.md` | Demand, competitors, the three loops, organisers, the moat |
| `BRAND.md` | Identity, the design system, e-mail |
| `IDEAS.md` | Parked, not committed |

**Loaded on demand:** `../.claude/rules/` — `functions.md`, `migrations.md`, `styles.md` — appear by themselves when a file in that directory is touched.

**Reference, only for a specific fact:** `reference/competitors.md` · `reference/database-options.md` · `reference/organiser-research/` (three reports and a synthesis, 2026-09-16) · `reference/analytics-research/` (three reports and the build plan, 2026-09-17) · `reference/seo-research/` (what Google says, directory SEO, AI citations, the plan, 2026-09-18) · `../metabase/README.md`.

**Outside `docs/`:** `../guardrails.config.json` (architecture as config) · `../scripts/guardrails.mjs` (the ten checks) · `../src/lib/i18n.ts` (every URL) · `../src/lib/strings.ts` (interface copy) · `../src/lib/utility-copy.ts` (the form pages) · `../src/lib/legal/` (about, imprint, privacy, terms) · `../src/lib/vocabulary.ts` (domain words) · `../design/` (mockups; `design/archive/logo/` is the closed logo search).

`archive/` is prior research, the September plan log, and the guidance these rules come from. **Don't read it unless asked for something specific.**

## Keeping these current

These rules are Anthropic's and OpenAI's own for in-repo agent docs (`archive/docs-guidance-2026-09.md` has the sources); they are stated here once so they get followed, not re-derived.

- **Status, not history.** Every doc says what is true now and why. Superseded text is rewritten in place, never appended to; the story of how a thing got here lives in git and `archive/PLAN-log-2026-09.md`. A date in a doc marks a decision, not an event.
- **One home per fact.** A decision lives in `CLAUDE.md` (settled) or the doc that owns the topic — not both. Duplicates drift, and a contradiction makes the model pick one at random.
- **Every line: would removing it cause a mistake?** If not, cut it. Nothing the code, `package.json` or `ls` already says. Under ~200 lines per always-loaded file.
- **A repeated mistake is a doc edit, not a chat correction.** Same mistake twice → one line in `CLAUDE.md` §Gotchas or the matching `.claude/rules/` file, as a rule, not as the story of the bug. A check that can be run beats a sentence that asks for care.
- **Big work gets a spec, then a fresh session.** The spec is deleted when the durable parts have moved into the doc that owns them.
- **The name is `fynda.market`** in every doc, page and mail — never "Fynda".
