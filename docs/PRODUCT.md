# Product

What Fynda is, and what we actually know about demand.

---

## The job

People want to know **what flea market is on, near me, and whether it is actually happening.**

**Visitors** are the users — families, bargain hunters, spontaneous weekend trips. High volume, low frequency. **Organisers** (clubs, schools, churches, municipalities) are not users; they are the supply side and the likely revenue. **Vendors** are a parked opportunity — see `IDEAS.md`.

## What we know about demand

Measured from fleafind.ch's own search data and live Google autocomplete. Facts, not guesses.

- **Search here is overwhelmingly about time.** Two-thirds of clicks came from queries containing a date or time; `flohmarkt [city] 2026` alone was 47% of clicks. People append the year constantly.
- **Germany runs on proximity and immediacy.** `in der Nähe` is the #1 or #2 Google suggestion for almost every flea-market term. `flohmarkt jetzt geöffnet` is the #1 expansion of `flohmarkt jetzt`.
- **Google answers "open now" badly.** A live search returned markets in Celle, Hamburg and Schöntal — hundreds of kilometres apart, none near the searcher. Google surfaces whichever markets have opening hours on their Google Business Profile. Three small markets with 58–115 reviews outrank every directory in Germany on the highest-intent query in the category.
- **AI answers are the battleground.** On `flohmarkt nrw heute`, Google's AI Overview gives name, full address and opening times. There is nothing left to click. Being the cited source now matters more than ranking.
- Bundesland-level demand is large in Germany (`flohmarkt nrw`, `flohmarkt bayern`); Swiss cantons never showed this.
- Categories behave differently: `hallenflohmarkt` is venue-led, `nachtflohmarkt` is city-led, `trödelmarkt` is NRW dialect rather than a synonym.
- ~82% of v1 traffic was mobile.

## The competition

| | |
|---|---|
| **meine-flohmarkt-termine.de** | The one to beat. #1 for most queries, most-cited by AI Overviews. ~60 event types x 10 PLZ zones x 16 states x 20+ cities |
| **marktcom.de** | #1 for NRW, with a full-screen Temu ad above the fold |
| **melan.de** | Consistently #2. A market *operator* who also publishes dates |
| **flohmarktkompass.de**, **flohmarktradar.de**, **heuteflohmarkt.de**, **Fleamapket** | Various; all free except Fleamapket's subscription |

Two things this tells us:

1. **UX is not the ranking lever.** marktcom ranks #1 with an ad-choked, layout-shifting mobile page. Being nicer will not outrank them. But a clean, well-structured page *is* an advantage for AI citation — and ad-funded incumbents structurally cannot follow us there.
2. **They answer the wrong question.** MFT's "flea markets in NRW" page showed a funfair and two evening shopping markets — no flea markets. Build thousands of category x region pages and most cells are empty, so you loosen the definition until they fill. They cannot fix it without their page count collapsing. **Being correct is a defensible difference.**

**Switzerland is unclaimed** `[VERIFIED 2026-08-29]`. No credible bilingual, nationwide Swiss directory exists — the best is run from Austria and German-only, the next is down with a PHP error, two have no search, one charges organisers CHF 3–15 per listing. Germany is fragmented too: `flohmarkt.de` 404s, `troedelmarkt.de` is parked.

Site-by-site detail lives in `reference/competitors.md`.

## Category conventions — settled, don't re-litigate

`[VERIFIED 2026-08-29]`

- **Results group under day headings, sorted chronologically.** Every functioning site does this. Nobody sorts by relevance or distance.
- **Date filtering is chips, not calendars** — `Heute / Morgen / Dieses Wochenende / Nächstes Wochenende`. Four to five chips is the settled vocabulary; calendar pickers are a fallback.
- **Nobody uses photos.** Organiser-submitted markets rarely arrive with a usable image. **The no-photo state is the default, not the edge case** — design the card for it and treat an image as a bonus. Nobody has made a text card look good, which is exactly why a calm typographic card is an advantage.
- **Freshness is the industry's universal failure.** Only vide-greniers.org dates a record, and it says "published on", not "confirmed on". **Nobody anywhere shows when a date was last confirmed with the organiser.** Brocabrac's own help page tells users to phone ahead before travelling.
- **Cancellations are near-invisible**, and calendar export is almost absent — one site in the whole set offers `.ics`.
- **Nobody has an explicit page-count cap.** A documented, CI-enforced horizon would be genuinely unusual here.

## The quality bar we have to clear

Google asks aggregators directly whether they are *"mainly summarizing what others have to say without adding much value"*, and says **trust is the most important** of the four E-E-A-T aspects. Republishing organiser dates *is* summarising others. The added value has to be **verification, freshness, and the record of what actually happened** — for a listings site, trust means the date is right and we say when we checked it.

This is the same problem as AI citation. `[REPORTED]` Roughly two-thirds of sources cited by AI answers do not rank in Google's top 10, and original data is the highest-leverage content type for citation. So **"Bestätigt am 12.08. durch den Veranstalter" does two jobs at once**: the human trust signal, and the attributable dated claim an AI answer can quote. Add `llms.txt` — cheap, emerging standard.

## Where the moat comes from

Software is free and copyable. The defensible parts are not software:

- **Confirmed freshness.** No site in France, Germany or Switzerland does this, and every one concedes the need in its own help text. The highest-value unclaimed feature in the category.
- **The organiser relationship.** Whoever the organiser tells first when it rains owns the truth.
- **A record of what actually happened** — which markets ran, which cancelled, with provenance. Compounds with time; a 2028 entrant cannot back-fill it.
- **Delegated access** to organisers' Google listings — a switching cost nobody here has built.

The reference case: **Songkick** built the beloved consumer app and lost; **Bandsintown** became the free tool the supply side uses to publish dates, and platforms now pull from it. **OpenTable** is the same story with a clearer mechanism — it gave restaurants a booking system that solved their own admin pain, and the marketplace was the by-product.

Applied here: **give organisers something they need, and the data arrives as a by-product.** Best candidate is one-click cancellation broadcast — an organiser's worst moment and our best trust asset, and the one thing nobody else does well.

**The revenue warning** `[VERIFIED 2026-08-29]`: nobody in this category makes real money. Brocabrac's ad-free tier is 6 € a year; flohmarktkompass's organiser upsell is 5 €/month. That doesn't disprove the supply-side thesis, but nobody has proven it either. Defer the machinery.

## Settled

- Free for users, forever. No subscriptions, no paywalls, no AdSense.
- Revenue, when it comes, is organiser and local-business advertising.
- **Fynda is a visitor tool.** SEO is the acquisition base. The organiser relationship gets earned by a directory that already has traffic, not by building tooling into a cold start. At launch the organiser surface is an "own your market" call to action and a contact form.

---

owner: Delfim
last_reviewed: 2026-08-29
