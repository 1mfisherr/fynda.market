# Brand and design

Identity and the system that carries it. The approved design is `design/fynda-v5.html`.

---

## The feeling

> **A good Sunday morning.**

Not a treasure hunt, not a sale, not urgency. Something is on nearby, it is easy to find, and going is a nice idea. Warm, unhurried, quietly cheerful.

That rules things out usefully: no countdowns, no "don't miss out", no dark mode, no aggressive colour, no exclamation marks.

## The one rule

> **Colour carries information or it does not appear.**

Two colour systems, each with exactly one job. **The accent marks the date and whether it is happening** — nowhere else, not on buttons for decoration, not on section headers. **The line colours mark the type of market** — nothing else. Everything else is near-black on white.

The most important fact on the page is the only accented thing on the page. Hierarchy and identity become one decision.

| Token | Value | Use |
|---|---|---|
| `--color-accent` | **`#FF4A2B`** Zinnober | Dates, "findet statt", the logo dot, the primary action. Nothing else |
| `--color-ink` | `#111110` | All text, headings, primary buttons |
| `--color-grey` | `#6E6C68` | Secondary text |
| `--color-quiet` | `#9A968F` | Timestamps, provenance, disabled |
| `--color-line` | `#E8E6E2` | Hairlines, borders |
| `--color-paper` | `#F5F4F2` | Panels, chips, image placeholders |
| `--color-white` | `#FFFFFF` | Page ground |

**Category colours are the line colours.** Amended 2026-08-30, when the Linientafel design was approved. They mark **one thing only: the type of market**, the way a transit map colours its lines — as a rail down the left edge of a list row and as a two-letter code. Never anywhere else, and never without a legend on the page.

Flohmarkt `FM` `#FF4A2B` · Halle `HA` `#3D5AFE` · Nacht `NA` `#7C3AED` · Kinder `KI` `#F5A524` · Trödel `TR` `#E4007F`

The earlier rule said "icons only, never as fill or text". That rule could not produce a system, only decoration. The test is unchanged in spirit: **colour must carry information.** The accent still marks dates and status and nothing else; the line colours mark type and nothing else. A cancelled market loses its line colour — the system says "not happening" without a badge.

**Status:** confirmed uses the accent; cancelled greys out with a strikethrough; unverified stays grey and says so. **Never colour alone — always a word beside it.**

## Type

**Schibsted Grotesk**, one family for everything. Nordic, very legible small, umlauts that hold up — and *fynda* is Swedish for bargain-hunting, so the choice has a reason beyond taste. Personality comes from colour, layout and motion, not a second typeface.

**Every size is fluid.** The scale below is the phone size at 375px; each one grows smoothly to **1.3×** at 1440px and stops there. No steps, no second size at a breakpoint — one step at 900px made every window between 900 and 1440 wrong in the same way, just less. `src/styles/tokens.css` holds the generated `clamp()` for each; changing the 1.3 means regenerating all of them from the same two anchors.

| Role | 375px → 1440px / weight |
|---|---|
| Display | 38 → 49 / 800, `-0.045em` |
| Section | 21 → 27 / 700, `-0.025em` |
| Title | 17 → 22 / 700, `-0.015em` |
| **Date** | 15 → 19.5 / **700, accent** |
| Body | 16 → 21 / 400 |
| Small | 13 → 17 / 500, quiet |

Column widths that hold text are fluid on the same two anchors, or a 30% larger digit in a fixed column is not a column but a wrap. `--measure` is in `ch`, so the reading column follows the type by itself.

## Wordmark

**`fynda.`** — Schibsted Grotesk 800, tight tracking, near-black, full stop in the accent. The dot is the mark; `fynda.market` reads as both a sentence and a logo. App mark: `f.` in white on a near-black rounded square.

## Voice

German first, Swiss market. `Sie` for organisers, `du` for visitors.

- **Say what is true, plainly.** "Noch nicht bestätigt" beats silence and beats pretending.
- **Short sentences.** A person is standing outside on a phone.
- **Never manufacture urgency.** Real deadlines exist; invented ones are a different business.
- **No marketing voice.** "Irgendwo ist immer Markt" is the tone. "Entdecke die besten Flohmärkte deiner Region!" is not.
- **Errors and empty states get the same care as headlines** — they are where trust is won.

All German copy needs a native speaker's pass before it ships.

## Imagery

Real photos from real market visits. **No stock, no AI images** — competitors have no photos because nobody went, and that is a trust signal that cannot be bought quickly.

Until the photos exist, listings use **flat object illustrations** — a chair, a lamp, a radio, a crate — on tinted grounds. Not a stopgap: most markets will never have a photo, and an empty grey box is what makes a directory look dead. The illustration set is permanent furniture.

---

# The system

## One change, everywhere

Every colour, space step, radius, font size and duration is a **token** in `src/styles/tokens.css`. Nothing is hardcoded in a component. "Change the button colour" must mean editing one line and having the whole site follow. If a change has to be made in two places, the system is wrong and gets fixed rather than worked around.

Tokens carry semantic names, not literal ones: `--color-accent`, not `--color-orange`. Literal names stop being true the moment the colour changes.

This is architecture, not styling — it is what makes the site changeable years from now without a rebuild.

## Built, not templated

No off-the-shelf theme, no UI-kit look. Use a headless library for the fiddly accessibility-heavy parts (dialogs, comboboxes, date pickers), where the library ships behaviour and no appearance. **Behaviour borrowed, appearance ours.**

## The UI serves the content

- **Answer first.** What, where, when, and *is it on* in the first screen — before navigation, hero or decoration. Also a citation rule: roughly 44% of AI citations come from the first 30% of a page.
- **Mobile first, hard.** ~82% of v1 traffic was mobile. Thumb-zone actions, bottom-sheet filters, tap-to-route.
- **Desktop is the same design, wider — never a second one.** One breakpoint at 900px for layout; type and the columns that hold it are fluid, with no breakpoint at all. The extra width buys information (a day column, a freshness column, a sticky action rail), never a bigger gap; reading text stays at 66ch whatever the container does. `design/desktop-v1.html` is the drawing, approved 2026-09-04.
- **Empty states still help.** "Nothing in Aachen this week — here are three within 30 km."
- **Show freshness honestly.** "Bestätigt am 12.08. durch den Veranstalter" beats silence, and beats pretending.

## Motion

For **orientation**, not decoration. 150–250ms; anything slower feels broken on a phone. Animate `transform` and `opacity` only. Every motion respects `prefers-reduced-motion` — an EU accessibility requirement, not a nicety. **No animation may cause layout shift.**

A staggered rise on load is the one place motion is worth spending on — it must never delay reading. Content is present, it just arrives.

## Accessibility and performance

**WCAG 2.2 AA**, built in from the start — 2.2 rather than 2.1 because its additions are design-time decisions that can't be retrofitted. Three that bite: focus must never hide behind the sticky bottom bar, a 24x24px target floor, and any drag control needs a tap alternative. The European Accessibility Act has been enforceable since June 2025, but the practical argument is stronger than the legal one: accessible markup is clearer markup, and clearer markup is what Google and AI systems parse best.

**LCP under 2s on 4G mobile** is a design constraint, not a later optimisation — it decides what can be on the first screen. Explicit dimensions on every image, video and embed.

## To do

- [ ] Confirm the accent (Zinnober vs Fuchsia vs Ultramarin)
- [ ] Wordmark clear-space rules and the app icon at real sizes
- [ ] Icon set: market types, status, actions
- [ ] Illustration set: 8–12 objects, one style
- [ ] Tone-of-voice examples, before and after
- [ ] Every German string checked by a native speaker

---

owner: Delfim
last_reviewed: 2026-09-05
