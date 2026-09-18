# Near me and the search control — build spec

Approved 2026-09-18 (Delfim). Mockup: `https://claude.ai/artifact/RFmFHUEkeQcquLwsQKCEok` (the two bottom rows: "editorial" is the chosen look; glass was liked and declined). When it ships, the durable parts move into `PAGES.md` (home, near me), `BRAND.md` (controls) and `ARCHITECTURE.md` (events), and this file is deleted.

## What we are building, in one paragraph

One control, used on the home page and the Near me page: a **Where** field (a town, or "Near me"), a round **use my location** button beside it, and a four-part **When** switch — All · Today · Weekend · Date. Under it, a count line that is always true. Styled *editorial*: hairlines, a small uppercase label, the chosen option underlined in the accent, no boxes, no dropdowns. The Near me page becomes one honest flow with four visible states — before a location, locating, located, refused — and never shows a control that does nothing.

## Why (what the audit found, 2026-09-18)

Driven live on a phone: the km buttons were dead until a location existed and said nothing; "Use my location" gave no sign it was working; the count never changed; distances floated between rows; the "Within" box on home promised a radius around a point the site did not have; Near me and canton lists sat on the screen edge. Two weeks of analytics: 76 home views, 5 people used the form; on Near me, four filter taps per visit and one market click — tap, nothing, tap again, leave. Research on current patterns (chips and segmented controls over dropdowns; ask for location on a tap, never on load; results visible and updating) is in the session that produced the mockup; the conclusions are the rules below.

## Decisions made (Delfim, 2026-09-18)

- Layout D from the mockup: town pill + round location button, segmented When. Not the sheet-first (Airbnb) layout, not chips.
- Editorial look, everywhere. Glass considered for the home hero and declined: it does not connect with the rest of the site.
- The Near me page stays (not "nearest town's page"). The circle around the visitor is the one thing a town page cannot do.
- No radius control on home. Radius is a setting, not a question; it lives on Near me only, and only once a location is known.
- No text search, no map, no dropdown boxes.

## The pieces

### 1. `SearchControl.astro` — the one control

Replaces the home form (`src/pages/[locale]/index.astro` `.search`) and the top of `RadiusView.astro`. Props: `locale`, `mode: 'home' | 'nearby'`, `dates` (every upcoming date, for the calendar and the counts).

**Where.** A 56px field with a hairline under it, place icon, the town name (or "Pick a town"), a chevron. Tap → a bottom sheet (`<dialog>`, native; behaviour borrowed, appearance ours): **Near me** first with the location icon, then all 55 towns A–Z under canton headings, each a plain `<a>` to the town page. Without JavaScript the sheet is a `<details>` and every row is still a link. Picking a town writes `TOWN_KEY` in `localStorage` exactly as today (the return-visit shortcut keeps working) and navigates to the town page, carrying `?zeit=` when When is not "All". No Show button: choosing is the action.

**Round button.** 56×56, ink fill, location icon, `aria-label`. Tap → `getCurrentPosition` **on that tap, never on load**. Home: navigate to `/{locale}/{nearby}/?lat=…&lng=…&km=25`. Nearby: apply in place. While waiting the button is disabled and the Where field reads *Locating…*. Denied or timed out → state 4 below (on home: navigate to Near me in state 4).

**When.** One `role="group"` of four equal `<button aria-pressed>`: All · Today · Weekend · Date, 44px tall, hairline above and below, the pressed one with a 2.5px accent underline, the others quiet grey. "Date" opens the existing calendar (`DateFilters` already has one; keep its logic, restyle it). It writes the same values the site already understands (`all`, `today`, `weekend`, `YYYY-MM-DD`; `src/lib/date-window.ts`). Labels must fit four across at 390px in fr/it — check "Ce week-end"/"Fine settimana"; if one does not fit, use the short form ("Week-end") rather than a scrolling row.

**Count line.** Bold, 17px, the number in the accent: *"27 markets this weekend in Switzerland."* / *"12 markets within 25 km of you, nearest first."* It changes on every tap. On home the three named windows are counted at build time and "Date" is counted in the browser from `dates`; on Near me it is the visible-row count.

Label above each group: 11px, 700, `letter-spacing: .12em`, uppercase, quiet — "Where", "How far", "When".

### 2. Home — `src/pages/[locale]/index.astro`

Order unchanged: claim → shortcut → **the control** → six markets. The `.search` form, the `ort`/`km` selects, the hidden `zeit` input, `syncRadius` and the submit handler go. The `nearbyPath` action is no longer needed from home; the round button navigates. `docs/PAGES.md` §Home is rewritten on ship.

### 3. Near me — `src/components/RadiusView.astro`

Four states, all decided above the fold, in this order under the H1:

| State | Where field | Button | How far | Count line | List |
|---|---|---|---|---|---|
| **1 Before** | "Pick a town" | primary pill *Use my location* (the one filled button on the page) + "or pick a town" | **absent** | "157 markets · 408 dates, by date, no distances yet" | all, chronological, When applies |
| **2 Locating** | *Locating…* | disabled, says *Locating…* | absent | "Asking your phone where you are…" | as 1, at 45% opacity |
| **3 Located** | *Your location · Change* | — | 10 · **25** · 50 · 100 as a segmented group, default 25 | "N markets within X km of you, nearest first." | radius applied, nearest first, **page scrolls to the list heading** |
| **4 Refused** | "Pick a town" | secondary *Try my location again* | absent | "Your phone didn't share a location, so there are no distances to give." | as 1, plus six town pills (largest towns) above the list |

Arriving with `?lat&lng` (from home) starts in state 3. `km` and `zeit` in the URL keep their meaning. Default radius changes from 50 to **25** to match the town pages. `indexable={false}` stays.

**Distance on the row.** `MarketRow` already takes `distance`; it moves from the where-line into the meta line as a small ink pill (*0.5 km*), right-aligned. The city page's "within 25 km" block gets the same by construction. `RadiusView` writes into that slot instead of its own `<p data-distance>`, which is removed. *Never a distance without an origin* stays the rule — the slot is empty until the script has a real point.

### 4. Gutters

`RadiusView` and `[segment]/[region].astro` wrap their `#list` in `.gutter` like the home and city pages. Ten minutes; ships first, on its own.

### 5. Events

One new `analytics_events` name, `geo_prompt`, with `props.outcome`: `requested` | `granted` | `denied` and, on denied, `props.reason`: `denied` | `timeout` | `unavailable`. Migration `20260918120000_geo_prompt_event.sql` (both constraints), `functions/_collect.ts` and `functions/e.ts` (the allowlist), `Analytics.astro` (listens for `fynda:geo`). Read after four weeks: the research figure for "ask on tap" is ~30% granted; below that, the button is in the wrong place.

### 6. Copy

All new strings in `src/lib/strings.ts`, four locales, English written first. German, French and Italian need the native-speaker pass like everything else. New keys, roughly: `whereLabel`, `whenLabel`, `howFarLabel`, `pickTown`, `nearMe`, `useMyLocation`, `locating`, `yourLocation`, `change`, `orPickTown`, `tryAgain`, `countHome(n, window)`, `countNear(n, km)`, `noLocationYet`, `askingPhone`, `locationRefused`.

## Not in this build

Glass hero (declined), a map, text search, radius on home, storing coordinates for the town shortcut (still the blocker for distance on cards — `PLAN.md` open decisions).

## Order, and the checks

1. Gutters + the distance pill on `MarketRow`. `npm run verify`. Deploy.
2. Near me: the four states on the existing markup, then the control. Drive it live on a phone: deny location, allow it (stub `getCurrentPosition` in the console), refuse, arrive with `?lat&lng`. Screenshot each state.
3. Home: swap the form for the control. Check the return-visit shortcut still appears after picking a town; check no-JS (disable JavaScript, pick a town, pick a date).
4. Events. Read one row back from `analytics_events` after a real tap.

Guardrail 7 (one selector per page): every new selector belongs to `SearchControl.astro`. No new URLs; nothing here touches guardrails 1–6 or 9.
