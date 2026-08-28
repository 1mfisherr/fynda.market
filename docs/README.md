# Docs map

Read only what the task needs. Every file loaded is context spent.

| File | What it is | Read it when |
|---|---|---|
| `../CLAUDE.md` | How to work here, what's settled, the one rule that matters | Loaded automatically every session |
| `PLAN.md` | Where we are, what happens next, what is still open | **First, every session.** Before doing anything else |
| `PRODUCT.md` | What Fynda is, who it serves, what we know about demand, competitors, where a moat could come from | Product or direction questions; anything about users or positioning |
| `ARCHITECTURE.md` | Page types, URL shape, the graduation gate, data model, CI rules | Anything touching pages, URLs, data, or SEO |
| `STACK.md` | Astro + Cloudflare + Supabase, with costs and reasoning | Setting up, or questioning a technical choice |
| `BRAND.md` | The feeling, colour, type, wordmark, voice, imagery | Brand, copy, or visual work |
| `DESIGN.md` | Design system, tokens, motion, accessibility, performance | Any UI work |
| `NAMING.md` | The name, and the domain-checking method | Rarely. Domain or brand work |
| `IDEAS.md` | Parked, not committed | Checking whether an idea was already considered |

Outside `docs/`:

| Path | What it is |
|---|---|
| `../README.md` | Repo readme — commands, the guardrails, layout |
| `../guardrails.config.json` | The architecture rules, as machine-checked config |
| `../scripts/guardrails.mjs` | The six checks that block deploy |
| `../src/styles/tokens.css` | Single source of truth for colour, type, space, motion |
| `../design/` | Design canvas and mockups — open `fynda-startseite.html` |
| `../data/` | Generated files the guardrails read. See its own readme |

`archive/` holds prior research — long, partly superseded. **Don't read it unless asked for something specific.**

## Keeping these current

Update at the end of a session where something was decided or learned.

**Write the conclusion, not the journey.** "The name is Fynda" — not three pages on how we got there. If a decision is reversed, rewrite the line; don't append a correction. Superseded content goes to `archive/` or gets deleted.

Nothing in these files is permanent law. If something looks stale, say so and propose the change.
