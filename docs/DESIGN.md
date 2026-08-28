# Design

How Fynda looks and behaves, and how it stays changeable.

Identity — colour, type, wordmark, voice, imagery — is in `BRAND.md`. This file is the system that carries it.
Working mockups live in `/design` (open `fynda-startseite.html` in a browser).

---

## Non-negotiable: one change, everywhere

Every colour, spacing step, radius, shadow, font size and motion duration is a **token**. Nothing is hardcoded in a component.

```css
:root {
  /* colour — full set in BRAND.md */
  --color-accent: #FF4A2B;   /* dates and status ONLY */
  --color-ink:    #111110;
  --color-grey:   #6E6C68;
  --color-quiet:  #9A968F;
  --color-line:   #E8E6E2;
  --color-paper:  #F5F4F2;

  /* space — 4px base */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 32px;

  --radius-sm: 12px; --radius-md: 16px; --radius-lg: 20px; --radius-pill: 999px;
  --duration-base: 200ms;
  --ease-base: cubic-bezier(.16,.84,.44,1);
}
```

**"Change the button colour"** must mean editing one line and having the whole site follow — buttons, links, focus rings, active states, the lot. If a change has to be made in more than one place, the system is wrong and gets fixed rather than worked around.

This is also what makes the site changeable years from now without a rebuild. Treat it as architecture, not styling.

Tokens carry semantic names, not literal ones: `--color-accent`, not `--color-blue`. Literal names stop being true the moment the colour changes.

---

## Built, not templated

No off-the-shelf theme, no UI kit look. The design is ours and should be recognisably so.

That does not mean building primitives from scratch for their own sake — use a headless library for the fiddly, accessibility-heavy parts (dialogs, comboboxes, date pickers) where the library ships behaviour and no appearance. **Behaviour borrowed, appearance ours.**

---

## The UI serves the content

A directory's product is the listing, not the chrome. Every element earns its place or goes.

- **Answer first.** What, where, when, and *is it on* in the first screen — before any navigation, hero, or decoration. This is both a UX rule and a citation rule: roughly 44% of AI citations come from the first 30% of a page.
- **Mobile first, hard.** ~82% of v1 traffic was mobile. Thumb-zone actions, bottom-sheet filters, tap-to-route.
- **Empty states still help.** "Nothing in Aachen this week — here are three within 30 km." Trust is built in the failure cases.
- **Show freshness honestly.** "Verified 12 August by the organiser" beats silence, and beats pretending.

---

## Motion

Animation is for **orientation**, not decoration. It should explain where something came from and where it went.

- Fast: 150–250ms for most transitions. Anything slower feels broken on a phone.
- **Entrance matters.** A staggered rise on load is what makes a page feel alive rather than printed — the one place motion is worth spending on. It must never delay reading: content is present, it just arrives.
- Animate `transform` and `opacity` only. Anything else costs frames.
- Every motion respects `prefers-reduced-motion` — not optional, and it is an accessibility requirement in the EU.
- No animation may cause layout shift. v1 had a real layout-shift bug from an unguarded loading boundary; the static build makes that structurally hard, and the CI dimension check catches the rest.

Good uses: filter results reflowing, a sheet rising, a card expanding into a detail view, a freshness badge updating. Bad uses: anything that delays the user reading the answer.

---

## Photography

Real photos from real visits. **No stock, no AI images.**

Competitors' listings have no photos because nobody went. That is a trust signal that cannot be faked cheaply, and it is one of the few things a well-funded competitor cannot buy quickly.

Every image ships with explicit dimensions.

---

## Accessibility

**WCAG 2.2 AA**, built in from the start. (2.2, not 2.1 — it has been the W3C recommendation since 2023 and its additions are design-time decisions that cannot be retrofitted. Three that bite us: focus must never be hidden behind the sticky bottom bar, 24×24px target floor, and any drag control needs a tap alternative.)

The European Accessibility Act has been enforceable since June 2025 and covers consumer-facing sites serving EU users. But the practical argument is stronger than the legal one: accessible markup is clearer markup, and clearer markup is what both Google and AI systems parse best. Contrast, keyboard operability, real headings, labelled forms.

---

## Performance is a design constraint

Not a later optimisation pass.

- **LCP under 2s on 4G mobile.** This constrains what can be on the first screen — it is a design decision, not an engineering one.
- Explicit dimensions on every image, video and embed.
- The static build means there is no runtime rendering to be slow.

---

## Growing over time

The site should feel alive and improve, without needing redesigns:

- Seasonal shifts in what the site foregrounds — indoor markets in winter, big outdoor markets in summer — from the same data, with no new pages.
- Freshness surfaced as a live property, because it genuinely changes daily.
- New components composed from existing tokens, so additions look like they belong rather than like patches.

---

owner: Delfim
last_reviewed: 2026-08-28
