# Docs map

Read only what the task needs. Every line loaded is context spent.

| File | Read it when |
|---|---|
| `../CLAUDE.md` | Always. How to work here, what's settled |
| `PLAN.md` | **First, every session.** Where we are, build order, what's open |
| `ARCHITECTURE.md` | URLs, the data model, structured data, the page-type gate |
| `PAGES.md` | Which pages exist, what is on them, and why |
| `STACK.md` | Technical choices and the constraints behind them |
| `PRODUCT.md` | Demand, competitors, the moat |
| `BRAND.md` | Identity and the design system |
| `IDEAS.md` | Parked, not committed |

**Reference — only when a specific fact is needed:** `reference/competitors.md` (site-by-site teardown), `reference/database-options.md` (verified pricing and limits).

**Outside `docs/`:** `../guardrails.config.json` (architecture as machine-checked config) · `../scripts/guardrails.mjs` (the eight checks that block deploy) · `../src/styles/tokens.css` and `../src/styles/base.css` (the style layers) · `../src/lib/i18n.ts` (locales, and every URL) · `../src/lib/strings.ts` (interface copy per language) · `../src/lib/vocabulary.ts` (domain words) · `../design/` (mockups).

`archive/` is prior research. **Don't read it unless asked for something specific.**

## Keeping these current

Update at the end of any session where something was decided or learned.

**Write the conclusion, not the journey.** Superseded content gets rewritten in place, never appended to. Long verification detail goes in `reference/`, not here.

**For every line, ask: would removing this cause a mistake?** If not, cut it. A bloated doc set means the important rules get ignored.
