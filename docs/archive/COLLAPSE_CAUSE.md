# What Actually Killed fleafind.ch — Evidence from the Repo

Investigated 2026-08-27 from the fleafind.ch git history, Google's spam-update announcement, and GSC data.
**This upgrades the collapse explanation from "leading theory" to "well-supported, with a named mechanism."**

---

## 1. The mechanism: 4 locales × unbounded future dates

Two facts from the repository, both verifiable:

**Fact 1 — four locales.** `src/i18n/routing.ts`: `locales: ['de', 'fr', 'it', 'en']`. Every page type multiplied by four.

**Fact 2 — occurrence pages had no future limit until 10 August 2026.**
`git log -S "OCCURRENCE_FUTURE_INDEX_DAYS"` returns exactly one commit: `98ed01e`, **10 August 2026**. Before it, the occurrence page carried only a *past* cutoff:

```
const noindexCutoffDate = addDaysToIsoDate(getTodayIsoInZurich(), -7)
const occurrenceIsOutsideGracePeriod = occurrence.date < noindexCutoffDate
```

Past-only. **Every future date a market had was an indexable page, with no cap.**

### The arithmetic

One weekly market with a year of published dates:
**52 occurrence pages × 4 locales = 208 URLs from one market.**

With 157 markets, most recurring, this alone accounts for the bulk of the ~8,500 indexed URLs. The 60:1 URL-to-market ratio was not a mystery or an accident — it was this specific mechanism, compounding every time a new date was added.

---

## 2. The timeline

| Date | Event |
|---|---|
| *months prior* | Occurrence pages generating with no future cap, × 4 locales |
| **15 Jul 2026** | `cbf5da1` — "Add hreflang alternates to **every** sitemap entry." All four locale variants of every URL declared explicitly to Google |
| **10 Aug 2026** | `98ed01e` — future window capped at 120 days. **The fix** |
| **18 Aug 2026** | Google launches the August 2026 spam update (12:30pm ET), rollout "a few days" |
| **22 Aug 2026** | fleafind.ch loses ~97% of impressions |

**The fix shipped 8 days before the update.** Google does not recrawl and re-evaluate a site of that size in 8 days. The right change was made; it simply had no time to take effect.

The July hreflang work is worth noting honestly: it was *correct* SEO practice, and it made Google maximally aware of the complete 4× URL set in the exact window before the update. Good work with bad timing.

---

## 3. Why the spam update's exclusion list points here

From Google's announcement ([Search Engine Roundtable](https://www.seroundtable.com/google-august-2026-spam-update-41895.html)):

> **Does Not Target:** This update does not target link spam, it does not target the site reputation abuse policy and some other policies.

Removing link spam and site reputation abuse leaves, from the [spam policies](https://developers.google.com/search/docs/essentials/spam-policies), essentially: cloaking, doorways, hidden text, keyword stuffing, scraped content, scaled content abuse, sneaky redirects, thin affiliate pages.

Only two plausibly apply:

- **Doorway abuse** — *"sites or pages created to rank for specific, similar search queries… multiple pages for specific regions funneling to one page."* fleafind's `/heute/`, `/wochenende/`, city×weekday and city×date pages, times four locales, match this almost word for word.
- **Scaled content abuse** — *"many pages generated for the primary purpose of manipulating search rankings and not helping users."* 7,750 URLs producing zero clicks is the empirical definition.

**Confidence: high.** The mechanism is verified in the repo, the timing matches the rollout, and the exclusion list narrows the policy surface onto exactly this pattern. It remains inference about Google's internal decision — Google never says why — but every independent line of evidence converges.

---

## 4. Why the June 2026 update missed it

There was a June 2026 spam update (24–26 June). fleafind.ch sailed through it and was growing healthily into early August.

Two possible explanations, not distinguished:
- **(a)** August's detection was improved over June's.
- **(b)** The unbounded occurrence set kept growing through the summer and crossed a threshold between the two updates.

(b) is plausible and slightly worrying: it implies the site was accumulating risk continuously with no signal until it broke.

---

## 5. Why meine-flohmarkt-termine.de survived the same window

MFT ranks #1 across the category as of 27 August — five days after fleafind.ch fell — while running thousands of facet × geography combinations. That looked like a contradiction. It isn't.

**The rule is pages relative to real inventory, not pages in absolute terms.**

| | Markets / events | Indexed URLs | Ratio |
|---|---|---|---|
| fleafind.ch | 157 markets | ~8,500 | **~60:1** |
| MFT | Germany: 40,000–50,000 events/yr, 6,000 organisers | thousands | comfortably low |

**Germany fills the matrix. Switzerland never could.** Same architecture, opposite outcome, one explanation.

This confirms the "density, not dimensionality" refinement in `SEARCH_BEHAVIOUR.md` §11 and §14, and it resolves the open contradiction flagged in `SERP_EVIDENCE.md` §4 without needing the Sistrix check to settle it. (The Sistrix check is still worth doing — it would confirm rather than decide.)

---

## 6. What carries forward

1. **The locale multiplier is half the danger.** Four locales turned every architectural mistake into four mistakes. A locale exists only when its content exists — and that is now a rule with a body count, not a preference.
2. **Unbounded generation is the specific failure mode.** Not "date pages" as a category — date pages were the best-converting type on the site. The failure was *no cap* on how many got created.
3. **Any generator needs a bound and a floor**, enforced by CI: a maximum horizon and a minimum content threshold. This is exactly the gate in `ARCHITECTURE_PROPOSAL_V1.md` §3.
4. **Risk accumulated silently.** Nothing warned that URL count was compounding. A URL-to-entity ratio check in CI would have caught this months earlier — cheap, and now non-optional.
5. **Density is a country-level constraint.** Switzerland's ~150 markets can support roughly 150 market pages + ~50 city pages + 26 cantons ≈ **230 URLs**. Not 8,500. Any Swiss rebuild has to respect that ceiling.

---

owner: Delfim
last_reviewed: 2026-08-27
status: well-supported explanation; mechanism verified in repo
