# Product

What Fynda is, who it serves, and what we know about demand.

---

## The job

People want to know **what flea market is on, near me, and is it actually happening.**

Organisers — mostly amateurs: clubs, schools, churches, municipalities — want to be found, and have no good way to be.

## Who the user is

Two groups, not yet prioritised against each other:

- **Visitors** — families, bargain hunters, spontaneous weekend trips. High volume, low frequency.
- **Vendors (Standler/Händler)** — sell at markets weekly or monthly, already pay €20–50 per weekend for a stall. Low volume, high frequency, already spending money. **Served by nobody across markets** — every booking system is single-market.

Organisers are not users; they are the supply side and the likely revenue.

---

## What we know about demand

Measured from fleafind.ch's own search data and live Google autocomplete. These are facts, not guesses.

**Search here is overwhelmingly about time.** Two-thirds of clicks came from queries containing a date or time. `flohmarkt [city] 2026` alone was 47% of clicks — people append the year constantly.

**Germany is dominated by proximity and immediacy:**
- `in der Nähe` (nearby) is the **#1 or #2 Google suggestion for almost every flea-market term**
- `flohmarkt jetzt geöffnet` (open now) is the **#1 expansion of "flohmarkt jetzt"**

**Google answers "open now" badly.** A live search returned three markets in Celle, Hamburg and Schöntal — hundreds of kilometres apart, none near the searcher. Google surfaces whichever markets have opening hours set on their Google Business Profile. Three small markets with 58–115 reviews outrank every directory in Germany on the highest-intent query in the category.

**Which means the way in is operational, not technical:** helping organisers claim and maintain their Google listings puts them in that result, and makes us the reason they are there. That is work a competitor with AI cannot copy.

**AI answers are the battleground.** On `flohmarkt nrw heute`, Google's AI Overview gives the market name, full address and opening times. There is nothing left to click. Being the cited source now matters more than ranking.

**Other patterns worth knowing:**
- Bundesland-level demand is large in Germany (`flohmarkt nrw`, `flohmarkt bayern`) — Swiss cantons never showed this
- Categories behave differently: `hallenflohmarkt` is venue-led, `nachtflohmarkt` is city-led, `trödelmarkt` is an NRW dialect word, not a synonym
- Public holidays are a real search pattern (`flohmarkt pfingsten`)
- Vendor demand is visible: `flohmarkt stand mieten` is the #1 expansion of `flohmarkt stand`
- ~82% of v1 traffic was mobile

---

## Competitors

The category is contested. Every strategic idea we have had is already shipped by someone.

| | |
|---|---|
| **meine-flohmarkt-termine.de** | The one to beat. #1 for most queries, most-cited by AI Overviews. Runs ~60 event types × 10 PLZ zones × 16 states × 20+ cities |
| **marktcom.de** | Ranks #1 for NRW with a full-screen Temu ad above the fold |
| **melan.de** | Consistently #2. A market *operator* who also publishes dates |
| **Fleamapket** | Curated global destination markets, subscription, iOS+Android |
| **flohmarktkompass.de**, **flohmarktradar.de**, **heuteflohmarkt.de** | Various; all free |

**Two things this tells us:**

1. **UX is not the ranking lever.** marktcom ranks #1 with an ad-choked, layout-shifting mobile page. Being nicer will not outrank them. But a clean, well-structured page *is* an advantage for AI citation, which is where the clicks now go — and ad-funded incumbents structurally cannot follow us there.
2. **They answer the wrong question.** MFT's "flea markets in NRW" page showed a funfair and two evening shopping markets — no flea markets. When you build thousands of category × region pages, most cells are empty, so you loosen the definition until they fill. They cannot fix this without their page count collapsing. **Being correct is a real, defensible difference.**

---

## Where a moat could come from

Software is free and copyable. The defensible parts are the parts that are not software:

- **The organiser relationship.** Whoever the organiser tells first when it rains owns the truth.
- **Delegated access** — permission to manage their Google listing. A switching cost nobody in the category has built.
- **A record of what actually happened** — which markets ran, which cancelled, with provenance. Compounds with time; a 2028 entrant cannot back-fill it.
- **Vendors and organisers needing each other through us** — the only real network effect available.

The reference case: **Songkick** built the beloved consumer app and lost. **Bandsintown** became the free tool the supply side uses to publish dates, and platforms now pull data from it.

**OpenTable is the same story with a clearer mechanism.** It did not launch as a diner marketplace — it gave restaurants a booking system that solved their own admin pain, and only once restaurants were on it opened the platform to diners. The supply side adopted a *tool*; the marketplace was the by-product.

Applied here, that is the strongest available answer to the open question below: **give organisers something they actually need on day one, and the data arrives as a by-product.** Shortlist — a listing page they control, help fixing their Google Business Profile, one-click cancellation broadcast, a printable QR poster. The cancellation broadcast is the strongest candidate: it is an organiser's worst moment and our best trust asset, and it is the one thing nobody else does well.

---

## Settled

- Free for users, forever. No subscriptions, no paywalls, no AdSense.
- Revenue, when it comes, is organiser and local-business advertising.
- The organiser surface ships with v1 — a real page and a real inbound path, even if it is only email.

## Not settled

- **Visitor directory, or organiser infrastructure with a directory on the front?** Everything downstream depends on this, and it is genuinely open.
- Whether vendors would pay for anything.
- Which region gets depth first.

Sequenced in `PLAN.md` as Phase 0. The cheapest way to resolve the first two: contact five organisers and five vendors. Offer organisers three things — get you onto Google Maps properly, broadcast your cancellations, send you vendors — and see if anything lands. If nothing does, a pure visitor directory is probably not worth building.

---

owner: Delfim
last_reviewed: 2026-08-28
