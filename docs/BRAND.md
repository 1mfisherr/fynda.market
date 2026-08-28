# Brand

Who Fynda sounds and looks like. The UI system that carries it is in `DESIGN.md`.

---

## The feeling

> **A good Sunday morning.**

Not a treasure hunt, not a sale, not urgency. Something is on nearby, it is easy to find, and going is a nice idea. Warm, unhurried, quietly cheerful. Confident enough not to shout.

That rules things out usefully: no countdowns, no "don't miss out", no dark mode, no aggressive colour, no exclamation marks. People are planning a family weekend or looking for a bargain — both are calm activities.

---

## The one rule

> **White, black, and one colour. The colour marks only the date and whether it is happening.**

Nowhere else. Not on buttons for decoration, not on section headers, not on two things at once.

This comes from DICE, where the event date is yellow on black and pulls the eye straight to the thing that matters most after the name. Yellow is unreadable on white, so the accent takes that job instead. Everything else is near-black on white — the Notion approach, where strong colour appears only in small icons and is therefore never noise.

The payoff: the most important fact on the page is also the only coloured thing on the page. Hierarchy and identity become the same decision.

---

## Colour

| Token | Value | Use |
|---|---|---|
| `--color-accent` | **`#FF4A2B`** Zinnober | Dates, "findet statt", the logo dot, the primary action. Nothing else. |
| `--color-ink` | `#111110` | All text, headings, primary buttons |
| `--color-grey` | `#6E6C68` | Secondary text |
| `--color-quiet` | `#9A968F` | Timestamps, provenance, disabled |
| `--color-line` | `#E8E6E2` | Hairlines, borders |
| `--color-paper` | `#F5F4F2` | Panels, chips, image placeholders |
| `--color-white` | `#FFFFFF` | Page ground |

**Category colours — icons only, never as fill or text:**
Flohmarkt `#FF4A2B` · Halle `#3D5AFE` · Nacht `#7C3AED` · Kinder `#F5A524` · Trödel `#E4007F`

**Status:** confirmed uses the accent; cancelled greys out with a strikethrough and a plain word; unverified stays grey and says so. Never colour alone — always a word beside it.

---

## Type

**Schibsted Grotesk**, one family for everything.

Nordic, very legible at small sizes, umlauts that hold up — and *fynda* is a Swedish word, so the choice has a reason beyond taste. One family keeps the system coherent the way Airbnb's Cereal and Notion's stack do; personality comes from colour, layout and motion, not from a second typeface.

| Role | Size / weight |
|---|---|
| Display | 38–46 / 800, `-0.045em` |
| Section | 21 / 700, `-0.025em` |
| Title | 16–17 / 700, `-0.015em` |
| **Date** | 14–15 / **700, accent** |
| Body | 15–16 / 400 |
| Small | 12–13 / 500, quiet |

---

## Wordmark

**`fynda.`** — set in Schibsted Grotesk 800, tight tracking, near-black, with the full stop in the accent colour.

The dot is the mark. `fynda.market` reads as both a sentence and a logo, which is the whole point of the name (`NAMING.md`). App mark: `f.` in white on a near-black rounded square.

Still to do: proper optical spacing, a lockup with clear-space rules, and the small sizes.

---

## Voice

German first — Swiss German market, `Sie` for organisers, `du` for visitors.

- **Say what is true, plainly.** "Noch nicht bestätigt" beats silence and beats pretending.
- **Short sentences.** A person is standing outside on a phone.
- **Never manufacture urgency.** Real deadlines exist; invented ones are a different business.
- **No marketing voice.** "Irgendwo ist immer Markt" is the tone. "Entdecke die besten Flohmärkte deiner Region!" is not.
- **Errors and empty states get the same care as headlines** — they are where trust is won.

All copy needs a native German speaker's pass before it ships.

---

## Imagery

Real photos from real market visits. **No stock, no AI images** — competitors have no photos because nobody went, and that is a trust signal that cannot be bought quickly.

Until the photos exist, listings use **flat object illustrations** — a chair, a lamp, a radio, a crate — on tinted grounds. These are not a stopgap to be embarrassed about: most of ~150 markets will never have a photo, and an empty grey box is what makes a directory look dead. The illustration set is permanent furniture.

---

## To do

- [ ] Confirm the accent (Zinnober vs Fuchsia vs Ultramarin)
- [ ] Wordmark refinement + clear-space rules + app icon at real sizes
- [ ] Icon set: market types, status, actions
- [ ] Illustration set: 8–12 objects, one consistent style
- [ ] Tone-of-voice page with real before/after examples
- [ ] Every German string, checked by a native speaker
- [ ] Mascot — parked, see `PLAN.md`

---

owner: Delfim
last_reviewed: 2026-08-28
