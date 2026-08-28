# FleaFind — Design System

Last updated: 2026-08-05
Consolidates: design-system-v1. Correction from the original: styling is CSS Modules, not Tailwind — migration is fully complete (confirmed July 2026 audit).

**Core principle:** one system, one source of truth. No raw hex values, no hardcoded values outside what's defined here.

---

## Tokens

The live source of truth is `src/styles/tokens/primitive.css`, `semantic.css`, `typography.css`, and `motion.css`. The tables below record the custom properties exactly as defined there; semantic aliases intentionally point back to primitive tokens.

### Colour tokens

| Role | Token | Live value |
|---|---|---|
| White | `--ff-white` | `#ffffff` |
| Primary ink | `--ff-black` | `#111111` |
| Grey 50 | `--ff-gray-50` | `#f7f7f7` |
| Grey 200 | `--ff-gray-200` | `#e5e7eb` |
| Grey 300 | `--ff-gray-300` | `#d1d5db` |
| Grey 500 | `--ff-gray-500` | `#6b7280` |
| Grey 600 | `--ff-gray-600` | `#4b5563` |
| Coral 500 | `--ff-coral-500` | `#c83d49` |
| Coral 600 | `--ff-coral-600` | `#b93845` |
| Coral soft | `--ff-coral-soft` | `rgba(200, 61, 73, 0.08)` |
| Green 100 | `--ff-green-100` | `#dcfce7` |
| Green 600 | `--ff-green-600` | `#166534` |
| Green 900 | `--ff-green-900` | `#166534` |
| Amber 600 | `--ff-amber-600` | `#8a5a08` |
| Amber soft | `--ff-amber-soft` | `rgba(201, 139, 29, 0.1)` |
| Red 100 | `--ff-red-100` | `#fdecea` |
| Red 600 | `--ff-red-600` | `#c0392b` |

| Semantic role | Token | Resolves to |
|---|---|---|
| Page background | `--ff-bg-page` | `--ff-white` (`#ffffff`) |
| Surface background | `--ff-bg-surface` | `--ff-gray-50` (`#f7f7f7`) |
| Primary text | `--ff-text-primary` | `--ff-black` (`#111111`) |
| Secondary text | `--ff-text-secondary` | `--ff-gray-600` (`#4b5563`) |
| Muted text | `--ff-text-muted` | `--ff-gray-500` (`#6b7280`) |
| Muted text on inverse surfaces | `--ff-text-inverse-muted` | `color-mix(in srgb, var(--ff-white) 46%, var(--ff-text-primary))` |
| Faint text | `--ff-text-faint` | `--ff-gray-600` (`#4b5563`) |
| Subtle border | `--ff-border-subtle` | `--ff-gray-200` (`#e5e7eb`) |
| Strong border | `--ff-border-strong` | `--ff-gray-300` (`#d1d5db`) |
| Accent | `--ff-accent` | `--ff-coral-500` (`#c83d49`) |
| Accent hover | `--ff-accent-hover` | `--ff-coral-600` (`#b93845`) |
| Accent soft | `--ff-accent-soft` | `--ff-coral-soft` (`rgba(200, 61, 73, 0.08)`) |
| Confirmed | `--ff-status-confirmed` | `--ff-green-600` (`#166534`) |
| Confirmed background | `--ff-status-confirmed-bg` | `--ff-green-100` (`#dcfce7`) |
| Confirmed text | `--ff-status-confirmed-text` | `--ff-green-900` (`#166534`) |
| Tentative | `--ff-status-tentative` | `--ff-amber-600` (`#8a5a08`) |
| Tentative background | `--ff-status-tentative-bg` | `--ff-amber-soft` (`rgba(201, 139, 29, 0.1)`) |
| Cancelled | `--ff-status-cancelled` | `--ff-red-600` (`#c0392b`) |
| Cancelled background | `--ff-status-cancelled-bg` | `--ff-red-100` (`#fdecea`) |

### Spacing, radii, shadows, and layout tokens

| Group | Tokens and live values |
|---|---|
| Spacing scale | `--ff-space-1: 4px`; `--ff-space-2: 8px`; `--ff-space-3: 12px`; `--ff-space-4: 16px`; `--ff-space-5: 20px`; `--ff-space-6: 24px`; `--ff-space-8: 32px`; `--ff-space-10: 40px`; `--ff-space-14: 56px` |
| Semantic spacing | `--ff-space-section: var(--ff-space-14)`; `--ff-space-date-group: var(--ff-space-8)`; `--ff-space-card: var(--ff-space-4)`; `--ff-space-card-gap: var(--ff-space-4)` |
| Radii | `--ff-radius-sm: 6px`; `--ff-radius-md: 10px`; `--ff-radius-lg: 16px`; `--ff-radius-xl: 24px`; `--ff-radius-pill: 999px` |
| Shadows | `--ff-shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`; `--ff-shadow-overlay: 0 8px 24px rgba(0,0,0,0.08)` |
| Core layout | `--ff-container-max: 1120px`; `--ff-nav-height: 72px`; `--ff-tap-target: 44px`; `--ff-thumbnail: 52px` |
| Hero layout | `--ff-hero-height-sm: 260px`; `--ff-hero-height-md: 340px`; `--ff-hero-height-lg: 460px`; `--ff-hero-title-max: 820px` |
| Content layout | `--ff-content-max: 600px`; `--ff-occurrence-content-max: 720px`; `--ff-sidebar-width: 340px`; `--ff-date-rail-width: 7rem`; `--ff-thumbnail-hub: 64px` |
| Sticky offset | `--ff-sticky-offset: var(--ff-space-14)` below 768px; `var(--ff-nav-height)` from 768px |
| Tracking | `--ff-tracking-loose: 0.08em` |

### Typography and motion tokens

| Group | Tokens and live values |
|---|---|
| Font stacks | `--ff-font-display: 'Fraunces', Georgia, serif`; `--ff-font-ui: 'DM Sans', system-ui, sans-serif` |
| Type scale | `--ff-text-xs: 0.75rem`; `--ff-text-caption: 0.8125rem`; `--ff-text-sm: 0.875rem`; `--ff-text-base: 1rem`; `--ff-text-lg: 1.125rem`; `--ff-text-xl: 1.25rem`; `--ff-text-2xl: 1.5rem` |
| Semantic type sizes | `--ff-text-section-title: var(--ff-text-2xl)`; `--ff-text-date-label: var(--ff-text-sm)`; `--ff-text-date-emphasis: var(--ff-text-xl)`; `--ff-text-market-name: var(--ff-text-base)`; `--ff-text-market-schedule: var(--ff-text-sm)`; `--ff-text-market-meta: var(--ff-text-caption)` |
| Responsive headings | `--ff-text-hero: clamp(2rem, 5vw, 3.5rem)`; `--ff-text-h1: clamp(1.75rem, 3.5vw, 2.25rem)` |
| Leading | `--ff-leading-tight: 1.25`; `--ff-leading-normal: 1.5` |
| Weights | `--ff-weight-regular: 400`; `--ff-weight-medium: 500`; `--ff-weight-semibold: 600`; `--ff-weight-bold: 700` |
| Motion | `--ff-duration-fast: 120ms`; `--ff-duration-base: 150ms`; `--ff-easing: ease-out` |

### Scoped custom properties outside the global token files

These are real live custom properties, but they are component- or admin-scoped rather than global design tokens.

| Scope | Properties |
|---|---|
| Admin shell | `--ff-admin-bg: #f3f4f6`; `--ff-admin-surface: var(--ff-white)`; `--ff-admin-surface-muted: #f9fafb`; `--ff-admin-ink: #172033`; `--ff-admin-ink-muted: #657084`; `--ff-admin-border: #dce1e8`; `--ff-admin-border-strong: #c4ccd7`; `--ff-admin-accent: #334155`; `--ff-admin-accent-hover: #1e293b`; `--ff-admin-accent-soft: #e8edf3`; `--ff-admin-focus: rgb(51 65 85 / 22%)`; `--ff-admin-success: var(--ff-green-900)`; `--ff-admin-success-bg: var(--ff-green-100)`; `--ff-admin-danger: var(--ff-red-600)`; `--ff-admin-danger-bg: var(--ff-red-100)`; `--ff-admin-warning: #8a5a08`; `--ff-admin-warning-bg: #fff7df`; `--ff-admin-warning-border: #ead59b` |
| Search overlay | `--ff-keyboard-inset: 0px` (runtime-overridden component inset) |
| Select | `--ff-select-content-max-block-size: var(--radix-select-content-available-height)`; `--ff-select-trigger-min-inline-size: var(--radix-select-trigger-width)` |
| Runtime font | `--ff-font-brand` is injected by `next/font/local` in the root layout rather than declared in a token stylesheet |

The July audit's three token-definition findings are resolved: active components use `--ff-tracking-loose`, and the unused `--ff-gray-400` and `--ff-occurrence-hero-block-size` definitions were removed. The tables above reflect the live token files as of 2026-08-05.

---

## Accent Colour Rule
Brand coral appears ONLY on: logo "Find", active date chip, primary CTAs, text links, focus rings. It never appears on: market rows, city card overlays/names, pill links, badges (use status colours), section headers, nav links (unless active), borders. **If unsure whether accent belongs somewhere, the answer is no.**

---

## Key Components

**MarketRow** (the most important component — used everywhere markets list): day pill (always neutral grey, never brand colour even for "today"), market name, metadata line (date·time·city), arrow. Tentative occurrences include a visible localized status label; status is never colour-only. Four `data-variant`s, same component, no page-specific forks: `compact`/`quiet` (52×52 thumbnail, flat list row, no shadow) for dense/inline contexts; `hub-card` and `default` (64×64 thumbnail, bordered card, radius-lg, `shadow-card`, hover lifts to `shadow-overlay` + translateY) for teaser/preview/browse contexts (homepage, `/schweiz`, `/maerkte/[period]`, hub previews). Card treatment shipped 2026-08-25 — the "always a flat list, no shadow" rule below is retired for `default`/`hub-card`.

**TrustBadge** (`src/components/ui/TrustBadge`): one component, one green pill (`status.confirmed` bg/text), never brand colour. Three text tiers picked by available width, not by page: `compact` (icon only, 52px rows) → `short` (icon + "Verified", 148–232px photo cards) → default (icon + "Verified by FleaFind", hero and 350px+ rows). Never hand-roll a badge — extend TrustBadge's props instead.

**MarketPhotoCard / MarketCarouselRow** (`src/components/product/MarketPhotoCard`, `.../MarketCarouselRow`, shipped 2026-08-25): approved photo-card exception, used only for the "this weekend by city" teaser rows on the homepage and `/schweiz` (`GroupedMarketPreviewSection` `variant="weekend"`). Each city is a horizontally-scrolling row of photo cards (verified badge overlaid on the image, drop-shadow for legibility — same pattern as FeaturedMarketShowcase), with hover-reveal arrow buttons on desktop and native swipe on touch. A per-city "see all" link appears only once a city has more than 3 markets, routing to that city's real `/schweiz/{city}/dieses-wochenende` page — never a fake JS-only expand. The full-listing destination page (`/maerkte/wochenende`) stays the plain MarketRow list/grid; carousels are for teasers only, never the definitive listing.

**DateChip:** default white/border.subtle; active brand.primary bg + white text. Each links to a real indexable page, never a JS-only filter.

**CityCard:** two-part card, radius-xl — photo panel on top (no text overlay), plain white content section below with city name and a plain-text meta line (market count · next-occurrence day, when available). No dark overlay, no pill shape for the day label. The only exception to "never cards for market results."

**FeaturedMarketShowcase:** approved visual exception to the market-row rule, used only in the homepage hero. Its contents are automatic, not editorial: the shared discovery domain supplies up to four diverse photo-led markets from the same resolved window as the hero heading/chip. Unknown-end occurrences never feature; a same-day candidate needs at least 60 minutes remaining. The component pauses rotation during pointer/focus interaction, respects reduced-motion, and visibly labels tentative status. It reuses MarketHero, DayPill, TrustBadge, and Button; it is not a general market-results component.

**MarketTeaserCard:** approved visual exception to the market-row rule, used only for the country overview's "newest markets" section. It is a compact linked teaser (thumbnail, name, city), not a reusable market-results surface.

**PillLink:** white bg, border.subtle, neutral always — never brand colour.

**Button:** primary filled (brand.primary bg/white text) · primary outlined (brand.primary border/text) · secondary (border.subtle/text.primary). No shadow on any variant. 44px min touch target.

**Status Badge:** always includes a text label, never colour alone. Never brand colour.

**Empty State:** never a dead end — always ≥2 exit paths (e.g. "This weekend · Saturday · Sunday · All in city"). Tone: friendly, not apologetic. A list section with no rows is omitted entirely; durable fallback content may replace an actionable list only when its heading and links describe that fallback honestly.

**ListingContact** (market/occurrence page report and organiser-contact modals, shipped July 2026): grey text, Lucide icons, compact modals, loading/error/success states, reduced-motion support. Uses existing design tokens — no new component-level styling introduced. Message textarea caps at 5,000 characters (aligned with backend validation).

---

## Page Patterns

- **Homepage hero:** a rotating automatic showcase of up to four eligible markets with photos. H1, subtitle, active date chip, featured items, weekend section heading/caption and CTA all describe one resolved Friday–Sunday/next-weekend/coming-up decision. Date chips remain direct links to indexable date pages. No geolocation or distance-based personalization.
- **Homepage one-off markets:** this is an honest rename of temporary markets, not editorial curation. It uses `market_type = temporary`, the same resolved window and canonical dedupe, and hides when empty.
- **Place hub:** H1 → intro → sticky date-chip filter row (only the chip row sticks) → actionable MarketRow list, a clearly labelled durable inventory fallback, or an honest two-exit empty state → FAQ → nearby places → day/weekend links. Never-published municipalities 404; indexability follows the Geography v1 rules, and empty list sections are omitted.
- **Occurrence page (mobile, above the fold, in order):** market name → date block → address → exit paths ("more this weekend" + "more in city"). Never a dead end.

---

## Mobile Rules (about 80% of organic clicks are mobile)

The 28-day and three-month GSC exports ending 2026-08-03 both put mobile at about four-fifths of organic clicks. Treat that as a dated search-traffic signal, not a permanent share of all visitors.

- Touch targets ≥44×44px, MarketRow's full row tappable
- Above the fold: homepage = chips + first 2–3 rows; place hub = H1 + chips + first row; occurrence = name + date + time + address + exit paths
- Never: hover-only interactions, JS-required primary content, font below 12px anywhere (16px minimum on search input to prevent iOS zoom)

---

## Accessibility (WCAG 2.2 AA target)
- Never convey info by colour alone — pair with text/icon always
- One H1 per page, never skip heading levels
- Focus states visible on all interactive elements (brand.soft focus ring)
- `lang` attribute correct per locale on every page — as of July 2026, the root `<html lang>` is correctly derived from the actual locale param (previously hardcoded to `"de"` for every locale, a real accessibility/SEO bug now fixed)

---

## Standing rules for any agent building UI
1. Read this document before building any UI — follow definitions exactly, don't invent variations
2. No raw hex values — use tokens
3. Check what exists before building new components — MarketRow/DateChip/TrustBadge/MarketPhotoCard/MarketCarouselRow are singular, no page-specific forks. Vary by prop (`data-variant`, `compact`, `short`), never by copy-pasting a component for one page.
4. Market results default to MarketRow's card treatment (see above) for teaser/preview/browse contexts, and its flat-list treatment for dense/inline contexts. Approved photo-card exceptions: CityCard for city browsing, FeaturedMarketShowcase for the homepage automatic hero, MarketTeaserCard for the country overview's newest-markets section, and MarketPhotoCard/MarketCarouselRow for the "this weekend by city" carousel rows.
5. Fraunces is H1 only, everywhere else DM Sans
6. Accent colour used sparingly — when in doubt, don't
7. Every page type ships in all four locales — never partial hreflang clusters
8. SEO-critical content never hidden behind JS — server-rendered and visible without interaction

---

## Status (August 2026)

Homepage discovery and the country overview are shipped, and Tailwind → CSS Modules migration remains complete. The existing ListingContact and `/submit` flows cover organiser contact; no additional organiser-facing UI is committed. See PROJECT_STATE.md and ROADMAP.md for current priorities.

2026-08-25: the "this weekend" section (homepage + `/schweiz`) was redesigned end-to-end — MarketRow gained a card treatment for teaser/preview contexts, and the per-city listings became horizontally-scrolling photo carousels (MarketPhotoCard/MarketCarouselRow). Reference the live components over this doc for exact values; update this section again if further visual work follows.

## Key Files

| Purpose | File |
|---|---|
| CSS variables | `src/styles/tokens/primitive.css` and `src/styles/tokens/semantic.css` |
| Homepage | `src/app/[locale]/page.tsx` |
| Generic place resolver | `src/app/[locale]/schweiz/[canton]/page.tsx` |
| Market hub | `src/app/[locale]/markt/[slug]/page.tsx` |
| Occurrence page | `src/app/[locale]/markt/[slug]/[date]/page.tsx` |
| Market row | `src/components/product/MarketRow/MarketRow.tsx` |
| Trust badge | `src/components/ui/TrustBadge/TrustBadge.tsx` |
| Weekend carousel | `src/components/product/MarketPhotoCard`, `src/components/product/MarketCarouselRow` |
| Report/organiser-contact modals | `src/components/market/ListingContact.tsx` |
| Published catalogue | `scripts/generate-public-catalogue.mjs`, `src/lib/catalogue/publicCatalogue.ts` |
| i18n messages | `src/messages/{de,fr,it,en}.json` |
