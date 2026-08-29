# Brand and design

Identity and the system that carries it. Mockups live in `/design` — open `fynda-startseite.html`.

---

## The feeling

> **A good Sunday morning.**

Not a treasure hunt, not a sale, not urgency. Something is on nearby, it is easy to find, and going is a nice idea. Warm, unhurried, quietly cheerful.

That rules things out usefully: no countdowns, no "don't miss out", no dark mode, no aggressive colour, no exclamation marks.

## The one rule

> **White, near-black, and one colour. The colour marks only the date and whether it is happening.**

Nowhere else. Not on buttons for decoration, not on section headers, not on two things at once. The most important fact on the page becomes the only coloured thing on the page — hierarchy and identity in one decision.

| Token | Value | Use |
|---|---|---|
| `--color-accent` | **`#FF4A2B`** Zinnober | Dates, "findet statt", the logo dot, the primary action. Nothing else |
| `--color-ink` | `#111110` | All text, headings, primary buttons |
| `--color-grey` | `#6E6C68` | Secondary text |
| `--color-quiet` | `#9A968F` | Timestamps, provenance, disabled |
| `--color-line` | `#E8E6E2` | Hairlines, borders |
| `--color-paper` | `#F5F4F2` | Panels, chips, image placeholders |
| `--color-white` | `#FFFFFF` | Page ground |

**Category colours — icons only, never fill or text:** Flohmarkt `#FF4A2B` · Halle `#3D5AFE` · Nacht `#7C3AED` · Kinder `#F5A524` · Trödel `#E4007F`

**Status:** confirmed uses the accent; cancelled greys out with a strikethrough; unverified stays grey and says so. **Never colour alone — always a word beside it.**

## Type

**Schibsted Grotesk**, one family for everything. Nordic, very legible small, umlauts that hold up — and *fynda* is Swedish for bargain-hunting, so the choice has a reason beyond taste. Personality comes from colour, layout and motion, not a second typeface.

| Role | Size / weight |
|---|---|
| Display | 38–46 / 800, `-0.045em` |
| Section | 21 / 700, `-0.025em` |
| Title | 16–17 / 700, `-0.015em` |
| **Date** | 14–15 / **700, accent** |
| Body | 15–16 / 400 |
| Small | 12–13 / 500, quiet |

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
last_reviewed: 2026-08-29
