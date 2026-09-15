---
paths:
  - "src/styles/**"
  - "src/components/**"
  - "src/layouts/**"
  - "src/pages/**"
---

# Styling and templates

- **Four layers: tokens → base → components → pages.** A page styles only what nothing else could want. A component never sets its own outer margin — the parent supplies `.gutter`. Guardrail 7 fails the build on drift.
- Colour, type, spacing and motion come from `src/styles/tokens.css`. Never hardcoded.
- **One breakpoint, 900px.** A media query cannot read a token, so `--breakpoint-wide` is repeated in each query with the comment that says so. Anything read rather than scanned caps at `--measure`.
- The type scale is fluid, 375px → 1440px at 1.3×. A clamp's minimum is the phone value, so mobile stays byte-identical when the desk changes.
- **The accent marks dates and status** — Heute, cancellations, form errors — and nothing else. Say the exception, never the rule: one loud thing per row. `docs/BRAND.md`.
- **No German string that names a concept in a template.** Interface copy: `src/lib/strings.ts`, per language. Domain words: `src/lib/vocabulary.ts`. URLs: `src/lib/i18n.ts`, never assembled by hand.
- `MarketRow` is the only thing that renders a market in a list (`feature` or `row`). Lists show one row per market or one per date, never every date of every market (`src/lib/lists.ts`).
- Verify at 375 and 1440. Nothing scrolls sideways; `[hidden]` must win over a component's `display`.
