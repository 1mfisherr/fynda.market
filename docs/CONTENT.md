# Content

What information goes on a page, how much weight it gets, and how it is displayed. `PAGES.md` says which pages exist and which blocks are on them; this file decides what goes *inside* a block.

It exists to answer one question without argument each time: **is this worth showing?** Thin pages lose to competitors; padded pages lose to Google and to the reader. Both failures come from having no test.

---

## The four tests

A piece of information earns its place only if it passes all four. They are ordered so the cheapest test runs first.

**1. Decision.** Does it change what someone does next — go or not go, which market, when to leave, what to bring? If not, it is trivia. *Fails this and it does not ship anywhere.*

**2. Coverage.** Do we hold it for nearly every listing? Baymard's testing found **64% of sites fail to present list information consistently**, and that inconsistency caused site abandonment outright — users saw gaps and concluded the selection was poor, not that the data was. So a field held for 60% of markets cannot be a card field. *Fails this and it moves to the detail page.*

**3. Provenance.** Do we know it is true, and where it came from? Generated prose may present facts we hold; it may not substitute for facts we do not (`ARCHITECTURE.md`). *Fails this and it does not ship.*

**4. Cost.** What does it push down? Users spend **57% of viewing time above the fold** and 74% within the first two screenfuls, and "if you make the first screen too dense, then nobody will read anything." Every field added spends attention taken from a better one. *Fails this and it moves lower or into progressive disclosure.*

---

## Our "price"

NN/g's list-entry research reports that in 22 years of testing, **price is the one attribute every user has asked for.** Every listing product has an equivalent — the attribute that decides.

**Ours is the date and time, and whether it is actually happening.** Not the entry fee: flea markets are free or a couple of francs, so cost does not decide anything. This is why the accent colour is reserved for exactly those two things (`BRAND.md`) — the brand rule and the information hierarchy are the same decision, arrived at independently.

Baymard's model is *essential attributes plus one to three category-specific ones*. Ours:

| | Field | Why |
|---|---|---|
| **Essential** | Name, date + time, place, status | Identity, the deciding attribute, and whether to trust it |
| **Category-specific 1** | Distance | The most useful single field in this category, and nobody shows it well (`reference/competitors.md`) |
| **Category-specific 2** | Size — roughly how many stalls | Decides whether a 40-minute drive is worth it. Brocabrac's one-to-five dots is the best small idea in the category |
| **Category-specific 3** | Indoor / outdoor | Decides the trip in a rainy climate. marktcom has it; nobody else does |

**We hold none of the three today.** Distance is computable in the browser; size and indoor/outdoor have to be captured during the import and the verification pass. That is the highest-value data work available, and it is worth more than any layout change.

---

## Weight tiers

| Tier | What | Where | Treatment |
|---|---|---|---|
| **1 — Decides** | Date, time, status, name, place | First screenful, always | Accent colour, heaviest weight. Never more than one thing in accent |
| **2 — Trusts** | Freshness line, cancellation reason | Immediately under tier 1 | Quiet grey. Present even when the answer is "not confirmed" |
| **3 — Acts** | Directions, organiser website | First screenful on a market page | Real buttons, primary and secondary |
| **4 — Confirms** | Full date list, address, entry fee, organiser, recurrence | Below, in order | Plain, consistent, scannable |
| **5 — Defers** | Description, history, corrections | Last, or behind a control | Progressive disclosure |

---

## How it is displayed

**Every attribute is its own element.** Baymard found **40% of sites fail** to make list information visually distinct, forcing readers to parse a block of text themselves. Never `Flohmarkt Bürkliplatz · Sa 6–17 Uhr · Zürich` as one line. Name, date, place are three elements with three treatments.

**Never put facts in the title.** The name is the name. A date, a time or a venue inside the heading cannot be filtered, sorted, or styled — and it is the most common way listings become unscannable.

**Exactly three status indicators, and no fourth.** NN/g: "showing unique indicators for more than 2–3 situations can make the listing page cluttered." Ours are **Bestätigt · Nicht bestätigt · Abgesagt**. That budget is spent. No "Neu", no "Beliebt", no "Top", ever — they would cost the meaning of the three that matter.

**Same fields, same order, on every card of a type.** Consistency is what makes a list comparable. A field that is sometimes missing is worse than a field that is always absent.

**Visual priority is size, weight, colour and whitespace** — in that order of cheapness. We have exactly one colour to spend and it is already committed to tier 1.

**The first screenful carries: what, when, is it on, and the primary action.** Everything else can wait.

---

## The field ledger

Coverage measured from the v1 database on 2026-08-29, 161 markets and 2,357 dates.

| Field | Coverage | Tier | Where |
|---|---|---|---|
| Name | 100% | 1 | Card + page |
| Next date | 100% | 1 | Card + page |
| Start / end time | 98% of dates | 1 | Card + page |
| Status | 100% | 1 | Card + page |
| City | 100% | 1 | Card + page |
| Confirmed-on date | 62% of dates | 2 | Card badge + page line |
| Cancellation reason | 100% of cancelled | 2 | Card + page, verbatim |
| Address, venue | 100% | 3–4 | Page. Feeds the directions link |
| Organiser website | 95% | 3 | Page, secondary button |
| Entry fee | 97% | 4 | Page |
| Organiser name | 94% | 4 | Page |
| Recurrence phrase | 79% | 4 | Page — **fails coverage for cards** |
| Description | 100%, avg 384 chars | 5 | Page, below the dates |
| Photo | **0% real** | — | Illustration until real photography exists |
| Distance | not held | 1 | Needs browser geolocation |
| Size | not held | 1 | **Capture during import and verification** |
| Indoor / outdoor | not held | 1 | **Capture during import and verification** |

---

## The ideas ledger

Ideas are cheap; page space is not. Each of these was tested against the four tests, so the answer does not have to be argued again.

| Idea | Verdict | What would make it earn a place |
|---|---|---|
| **Market size** (stall count, as dots) | **Yes — build it** | Nothing. It passes every test except coverage. Capture it |
| **Indoor / outdoor** | **Yes — build it** | Same. One field, decides trips in bad weather |
| **Distance on card** | **Yes**, browser-side | Geolocation with a graceful fallback to city only. Never a fake number |
| **Weather for the next date** | **Strong maybe** | Genuinely decision-changing for an outdoor market, and honest to show. But it needs a live API on a static site, and a wrong forecast damages the trust we are selling. Revisit once indoor/outdoor exists — it is meaningless without it |
| **Reliability score** — "ran 11 of its last 12 dates" | **Yes, later** | Nobody in the category can compute this. Our provenance ledger can. Needs ~12 months of history first, so build the data now and the display later |
| **"Jetzt geöffnet"** | **Yes, later** | The #1 German expansion of `flohmarkt jetzt`, and Google answers it badly. Needs reliable times (we have 98%) and a client-side clock |
| **ICS / calendar export** | **Yes, small** | Almost absent in the category. But v1 saw 42 calendar actions in 26 days — real, tiny. Keep it as a quiet control, never a primary button |
| **Save / merken** | **Yes** | No account needed, and it is the only retention we own |
| **Parking, transit, accessibility** | **Detail page only, if held** | Fails coverage today. Useful when a market is verified in person |
| **Entry fee, promoted to the card** | **No** | Fails the decision test. It is free or trivial, so it does not choose between markets |
| **Reviews and ratings** | **No** | No data, no volume, and a two-review average is worse than silence. NN/g: people trust external reviews over site-hosted ones anyway |
| **Related or nearby markets** | **No** | Doorway pattern, and it competes with the directions click that is the actual conversion |
| **Embedded map** | **No** | Weight and layout shift, for a link that 55% of visitors click anyway |
| **Social share buttons** | **No** | Fails the decision test on every page |
| **"Neu" / "Beliebt" badges** | **No** | The three-indicator budget is spent on status |
| **Vendor stall booking** | **Not now** | The strongest parked idea, and a second product. `IDEAS.md` |

---

## What this changes now

Measured on the built market page at 375×812:

1. **The directions button sits at 859px — below the fold.** It is 55% of all outbound clicks, the single most-clicked thing on the site, and a reader has to scroll past the full date list to reach it. It moves up, directly under the freshness line.
2. **The organiser website button does not exist.** 45% of outbound clicks.
3. **The illustration occupies 220px — 27% of the first screen** — to deliver no information. On a market page it should shrink or sit beside the heading, and the space goes to tier 1 and tier 3. On cards in a list it stays: there it is doing recognition work, not decoration.
4. **The recurrence phrase must come off cards** — 79% coverage fails the consistency test.
5. **Size and indoor/outdoor get captured during the import**, because they are tier 1 fields we simply do not have.

---

## Sources

- [The Anatomy of a List Entry](https://www.nngroup.com/articles/list-entries/), NN/g — how much detail per entry, price as the universal attribute, the 2–3 indicator limit, visual priority.
- [Product Listing Information](https://baymard.com/blog/list-item-design-ecommerce), Baymard — information consistency (64% fail), visual distinction (40% fail), essential plus category-specific attributes.
- [Defer Secondary Content for Mobile](https://www.nngroup.com/articles/defer-secondary-content-for-mobile/) and [Scrolling and Attention](https://www.nngroup.com/articles/scrolling-and-attention/), NN/g — progressive disclosure, 57% of attention above the fold.
- [Trustworthiness in Web Design](https://www.nngroup.com/articles/trustworthy-design/), NN/g — four credibility factors; "comprehensive, correct and current" content, and linking out as a trust signal rather than a leak.

---

owner: Delfim
last_reviewed: 2026-08-29
