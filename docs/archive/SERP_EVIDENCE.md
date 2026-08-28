# German SERP Evidence — Observed, Not Inferred

Real German SERPs captured by Delfim, 2026-08-27 (Thursday), using geo-forced `uule` links.
**This supersedes the inference in `SEARCH_BEHAVIOUR.md` §17, which was wrong in its specifics.**

---

## 1. What was actually observed

### `flohmarkt heute in der nähe`
- **No map pack.** (My §17 prediction of a Local Pack absorbing the clicks: **wrong**.)
- **AI Overview present**, and it refuses to answer without a postcode — then recommends **meine-flohmarkt-termine.de** and **melan.de** by name and link.
- Knowledge panel on the right: "Flohmarkt, 3,897 Rezensionen, Flohmarkt in Braunschweig" — geographically irrelevant to the forced location.
- Organic 1–3: **meine-flohmarkt-termine.de** · **melan.de** · **os-kalender.de**

### `flohmarkt in der nähe jetzt geöffnet`
- **Map pack present, with three actual flea markets** — all carrying Google Business Profiles with real review counts:
  - Flohmarkt in Celle, Wietzenbruch — 4.0 (115) — "Rund um die Uhr geöffnet"
  - Nachtflohmarkt Rindermarkthalle St. Pauli, Hamburg — 4.7 (58) — 18:00–22:00
  - Kontaktloser Selbstbedienungs Flohmarkt in Bieringen, Schöntal — 4.6 (32) — 07:00–21:00
- **No AI Overview.**
- Organic: meine-flohmarkt-termine.de, melan.de, os-kalender.de

### `flohmarkt nrw heute`
- **No map.**
- **AI Overview answers the question completely** — names the market (Trödelmarkt an der Galopprennbahn Dortmund-Wambel), gives the full address (Rennweg 70, 44143 Dortmund) and times (07:00–13:00, setup from 06:00). Cites **marktcom.de** and **meine-kunsthandwerker-termine.de**.
- Organic 1–3: **marktcom.de** · **melan.de** · **meine-flohmarkt-termine.de/bundesland/nrw**

### `flohmarkt berlin sonntag`
- **Completely different SERP shape.** Editorial and travel content, not directories.
- Organic 1–3: **berlin.de** (official city portal) · **Mit Vergnügen Berlin** (city magazine) · **cp-berlin.com** (a hotel)
- "Websites zu Orten" module: visitBerlin, Ameropa, 1000things, markt.de, 22places, Top10Berlin, Tripadvisor, Momondo
- Places module with GBP listings: Mauerpark **4.5 (24,923 reviews)**, Berliner Trödelmarkt 4.1 (1,505), Flohmarkt Marheinekeplatz 4.1 (752)

---

## 2. Corrections to prior claims

| Prior claim | Verdict | What is actually true |
|---|---|---|
| §17: Local Pack absorbs the "nearby/today" clicks | **Wrong** | No map on `heute in der nähe` or `nrw heute`. A map appears only on `jetzt geöffnet` |
| §17: flea markets are events without GBP, so the pack shows shops | **Wrong** | Every map result was a genuine flea market with a GBP and real reviews. Fable's correction was right |
| §17 conclusion: this demand is structurally unwinnable | **Right outcome, wrong mechanism** | The clicks are absorbed — by **AI Overviews**, not by a map pack |

**The zero-click problem is real but arrives through a different door.** On `flohmarkt nrw heute` the AI Overview gives market name, address and opening times. There is no reason left to click. That is the most valuable query class in the category being answered in place.

---

## 3. The most important finding: Google is visibly failing at "jetzt geöffnet"

The three map results for *"flea market near me open now"* were in **Celle, Hamburg, and Schöntal** — hundreds of kilometres apart, and none near the forced search location.

Google is not answering "near me" at all. It is surfacing whichever flea-market GBPs happen to have opening hours configured.

This is the clearest evidence yet that:
1. **The demand is real** — Google built a surface for it.
2. **Nobody is serving it well, including Google.**
3. **The barrier to entry is a GBP with correct hours, not a website.** Three markets with 58–115 reviews are outranking every directory in the country on this query, purely by having a claimed profile with hours.

That last point converts an SEO problem into an **operations problem** — which is exactly the kind of moat `STRATEGY_DEEP_DIVE.md` argues for. Helping organisers claim and maintain Maps listings puts *them* in the pack, and makes us the reason they are there.

---

## 4. The competitor picture is worse than we thought

**meine-flohmarkt-termine.de ranks #1 or top-3 on nearly every query tested, and is the AI Overview's most-cited source.** It is also the site running ~60 event types × 10 PLZ zones × 16 states × 20+ cities — thousands of thin facet combinations.

**This is a direct challenge to the thin-content thesis in `SEARCH_BEHAVIOUR.md` §14.**

Two readings, and we cannot yet tell them apart:

- **(a) The thesis is wrong.** Thin facet matrices are survivable; fleafind.ch collapsed for some other reason.
- **(b) MFT is pre-collapse fleafind.ch.** fleafind also ranked #1 in Switzerland *while* carrying 7,750 dead URLs — right up until it didn't. Ranking today is not evidence of safety.

**Resolving this is now the single highest-value unknown in the project.** A Sistrix or SEMrush German visibility check on `meine-flohmarkt-termine.de` across the 18–22 August window would likely settle it in under an hour. If MFT dropped when fleafind.ch dropped, reading (b) is confirmed and the whole architecture thesis holds. If MFT is flat or rising, reading (a) gains serious weight and a lot of this folder needs rethinking.

### Competitors not previously on our list

- **melan.de** — consistently #2 across every query. Appears to be a market *operator* (runs markets at Kaufland/METRO/GLOBUS car parks) that also publishes dates. **An operator outranking pure directories is a strong signal for the supply-side thesis.**
- **os-kalender.de** — a regional Osnabrück calendar ranking on national queries.
- **meine-kunsthandwerker-termine.de** — sister site to MFT, cited in the NRW AI Overview.

---

## 5. City queries are a different competition entirely

`flohmarkt berlin sonntag` is won by **berlin.de, a city magazine, and a hotel** — not by any flea-market directory. Plus a places module full of high-review GBP listings.

Implications:
- For big-city queries the competitor set is **editorial and tourism content**, not directories. A listings page will struggle against berlin.de.
- **GBP review counts are enormous at the head** (Mauerpark 24,923). Those listings are not beatable by a directory page — but they *are* claimable by organisers.
- The `2026` and date-specific query shapes from the Swiss data may be where a directory can actually win, since editorial content does not do specific dates well.

---

## 6. What this changes

1. **§17 is corrected** — the mechanism is AI Overviews, not the Local Pack. Outcome for click volume is similar; strategy implications are different.
2. **AI Overview citation is the real battleground** for `heute` / `nearby` / `region + time` queries. Being cited matters more than ranking. This raises the priority of everything in `ARCHITECTURE_IDEAS.md` Part 3–4 (freshness, structured data, agent surfaces).
3. **GBP/Maps is a genuine, under-exploited surface** for recurring markets, and it is won operationally rather than technically.
4. **The MFT visibility check is now the top-priority open question**, ahead of anything architectural.
5. **The `jetzt geöffnet` failure is the clearest product gap observed so far** — Google built the surface, has the wrong answer in it, and the fix runs through organisers.

---

owner: Delfim
last_reviewed: 2026-08-27
status: observed evidence — supersedes SEARCH_BEHAVIOUR.md §17
