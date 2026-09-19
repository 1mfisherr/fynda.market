# SEO — the plan, 2026-09-18

Four research reports beside this file (`01`–`04`; `04` is partial — Google blocked the agent) and our own numbers. Status and decisions only; the reports hold the evidence.

## Where we stand (Search Console, 7 days to 2026-09-18)

83 clicks, 7,555 impressions, average position 9.8. Mobile 77% of clicks. 618 distinct queries; 135 carry "2026", 41 a time word (heute, samstag), 14 an explicit date, 86 are French/Italian.

**We rank on page 1 and are not clicked.** CTR at positions 4–6 is 0.6% and at 7–10 is 0.8%; the norm for those positions is 5–10%. "flohmarkt worb 2026": position 4.7, 96 impressions, 0 clicks. Canton pages 2.1% CTR, town pages 1.1%, market pages 0.8%.

Why, from the pages themselves:
- Titles average 62 characters, 122 of 213 over 60; the "| fynda.market" suffix costs 15 of them and Google shows the site name separately anyway. Google rewrites most.
- Market pages with no confirmed date say *"Zurzeit ist kein Termin bestätigt"* as their description (Flohmi Muttenz: 510 impressions, 0.4% CTR). A snippet that says the page has nothing gets no click.
- Queries name the venue ("vidmarhallen flohmarkt", 220 impressions) and the title never does.
- The four 404 pages sit in the sitemap while carrying `noindex`.
- The root `/` is a `noindex` meta-refresh page, so the `WebSite` site-name markup on `/de/` is not where Google's rule says it must be.

AI side: OAI-SearchBot fetched 51 pages in two weeks, ChatGPT-User 2, Applebot 85, bingbot 45; referrals from chatgpt.com: 1. `llms.txt` exists and no AI system reads it. Bing Webmaster Tools not registered, no IndexNow.

## Decisions

- Titles carry no brand suffix; the site name comes from `WebSite` markup. Town and canton titles are the H1 (they carry the count and the year the page shows dates for) plus the next date. Market titles: name, venue, town, then "Termine 2026". Under ~60 characters where the data allows; the fact comes before the boilerplate so truncation costs nothing that matters.
- Descriptions are built from data on every page type, and a market with no confirmed date says what we know (its rhythm, its venue) rather than what we lack.
- Canton pages must stop repeating the union of their town lists — they earn their URL with what a town page cannot show. Design task, not a one-liner; next visual session.
- Event markup stays one per market page (guardrail 6). The rich result does not exist in Switzerland; revisit with a German page.
- No `llms.txt`, no snippet-limiting tags, no FAQPage or ItemList markup.
- `lastmod` is not emitted (the nightly build would lie); IndexNow carries change instead.
- `x-default` → English: where one language must stand for all, it is English (Delfim, 2026-09-18).

## Actions

| # | What | Status |
|---|---|---|
| 1 | Titles without the brand suffix, with the next date; market titles with the venue | built 2026-09-18 |
| 2 | Data-built descriptions on market (no-date case) and canton pages | built 2026-09-18 |
| 3 | 404 pages out of the sitemap | built 2026-09-18 |
| 4 | Root `/` becomes a real 301 to `/de/`, not a `noindex` page | built 2026-09-18 |
| 5 | `llms.txt` removed | built 2026-09-18 |
| 6 | IndexNow: key file, changed-URL submission after every publish (diff against the previous build's manifest served at `/_hashes.json`) | built 2026-09-18; the first key's verification stuck, a fresh key verified within the hour and the one-time `--all` submission returned 200 for all 916 pages |
| 7 | Bing Webmaster Tools: registered 2026-09-18; read the AI Performance report monthly | done |
| 8 | Search Console → Performance → Generative AI report: open it; read after a month | **Delfim** |
| 9 | Canton pages redesigned to be different from their towns | next visual session |
| 10 | Image sitemap entries per market photo — worth it once real photos exist | with photos |
| 11 | `x-default` → English | decided and built 2026-09-18 |
| 12 | Question heading on town pages ("Wann ist der nächste Flohmarkt in Zürich?") — plausible, cheap; try on the H2 above the list | later |

**Read after four weeks** (2026-10-16): CTR at positions 4–10 (target: above 3%), clicks per page type, the Generative AI impressions line, Bing's AI Performance report.
