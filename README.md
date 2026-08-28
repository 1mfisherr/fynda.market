# fynda.market

Flohmärkte in der Schweiz — mit Daten, die stimmen.

A European flea-market platform. Pilot in Switzerland, then Germany.
Rebuild of fleafind.ch after a Google spam update removed ~97% of its traffic.

---

## Start here

**[`docs/PLAN.md`](docs/PLAN.md)** — where the project is and what happens next. Read it first, every time.

Then [`docs/README.md`](docs/README.md) for the map of everything else.

---

## Commands

```bash
npm install        # once
npm run dev        # local dev server
npm run verify     # build + guardrails — run this before pushing
```

| Command | What it does |
|---|---|
| `npm run dev` | Astro dev server |
| `npm run build` | Static build into `dist/` |
| `npm run check` | Typecheck |
| `npm run guardrails` | Enforce the architecture rules against `dist/` |
| `npm run verify` | `build` + `guardrails` — what CI runs |

---

## The guardrails

`scripts/guardrails.mjs` enforces one rule:

> **A page exists because there is content for it — never because a URL pattern permits it.**

fleafind.ch generated ~8,500 URLs for 157 markets. One weekly market produced 208 URLs. About 91% of the site earned nothing, and Google classified the pattern as spam.

Six checks run on every build and block deploy on failure:

1. **Route allowlist** — any URL matching no known pattern fails. The two shapes that killed v1 (`/de/schweiz/winterthur/samstag`, `/de/markt/x/2026-07-05`) are named and rejected explicitly.
2. **URL-to-entity ratio** — hard ceiling of 2.0. Target is ~1.2.
3. **Content floor** — a page below its minimum for its type should not exist.
4. **120-day occurrence horizon** — no date rows beyond it.
5. **Explicit image dimensions** — v1 had a real layout-shift bug.
6. **Structured data** — present where required, parses, expected types.

Config lives in `guardrails.config.json`. **Changing it is an architecture decision, not a config tweak** — update `docs/ARCHITECTURE.md` in the same commit.

---

## Stack

Astro 5 (static output) · Cloudflare Workers · Supabase / PostGIS · Resend · Plausible

Reasoning and costs in [`docs/STACK.md`](docs/STACK.md). Notably **not** Vercel — it reintroduces the caching and rendering layers that caused v1's stale-page and layout-shift bugs.

---

## Layout

```
docs/          the thinking — plan, product, architecture, brand, design, stack
design/        design canvas and mockups (open design/fynda-startseite.html)
src/           the site
  styles/tokens.css    single source of truth for colour, type, space, motion
scripts/       guardrails
data/          generated — entity counts and occurrence rows the guardrails read
```
