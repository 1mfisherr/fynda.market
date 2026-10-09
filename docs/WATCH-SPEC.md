# Market Watch and Market Finder — spec

Two programs that keep the markets true and find the ones we lack. Written 2026-10-09 from Delfim's decisions and two research reports (page watchers, German directories). Deleted when built; the durable parts move into `ARCHITECTURE.md` §Watch and the commands into `CLAUDE.md`.

## Decided (Delfim, 2026-10-09)

- **Switzerland stays with v1.** v1's watch checks Swiss markets; fynda.market copies them with `scripts/sync-v1.mjs`. Our watcher covers every other country, Germany first. After a month of it running well, decide whether Switzerland moves over too, so only one system runs.
- **No new costs.** It runs on Delfim's PC. AI reading uses his Claude subscription through `claude -p`, smallest model (Haiku). No API key, no paid service, no extra GitHub minutes.
- **The program reads, the AI only settles doubts.** Code pulls the dates off each page and compares them with ours. Same dates → stamped confirmed, no AI. A difference → only the few lines around it go to the AI. Spread over the week.
- **Every change a human approves** in Telegram, except the "confirmed on" stamp for dates the page shows exactly as we have them.
- **The finder starts from the established directories**, as a list of names only; every market is checked on the organiser's own page (`intake/README.md` rule).

## How the watcher works, in five steps

1. **Fetch.** Each source page is downloaded politely (rules below). Unchanged pages (server says "not modified", or identical text) are skipped.
2. **Clean.** Menus, cookie banners and scripts are removed; struck-through text is marked, because a struck date is a cancellation.
3. **Read dates.** Our own extractor finds every date from today to 15 months out — `24.10.2026`, `Sa 24.10.`, `24. Oktober`, `3./10./17. Mai`, `samedi 24 octobre`, `24 ottobre`, ranges and lists — and the cancellation words near them. Structured data (JSON-LD Event, `.ics` calendars) is read first where a page has it; it is exact.
4. **Decide, per market:**
   - our dates all on the page, nothing new, no cancellation word → **stamp confirmed** (same write as `confirm.mjs`: `confirmed_at`, a `facts` row with the URL and the exact dates seen);
   - a new date, a missing date, a cancellation word, other hours → **a question for the AI**, with 3 lines either side;
   - page broken (market name gone, or zero dates twice running, parked domain) → **"source broken"**, a note for a person, never "cancelled".
5. **Ask and approve.** All of a run's questions go to Haiku in one call. Each answer must quote the snippet, and our extractor must find the claimed date in that quote, or the finding is marked *unverified*. Findings arrive in Telegram with Approve / Dismiss; approve writes the change, its source and the stamp.

## Files

```
scripts/watch/
  run.mjs           the daily run: pick today's slice, fetch, decide, ask, report
  sources.mjs       build/refresh watch_sources from markets, facts and market_private
  fetch.mjs         polite fetching: robots, per-host queue, conditional requests, decoding, browser fallback
  clean.mjs         HTML → lines (cheerio + html-to-text), noise rules, strikethrough marker
  dates.mjs         the extractor: dates, ranges, lists, year inference, weekday check, cancellation words
  decide.mjs        page dates vs ours → stamp / question / broken
  ask.mjs           batch the questions, call `claude -p`, verify every answer
  dates.test.mjs, decide.test.mjs, ask.test.mjs
watch-data/          on the PC only, gitignored: last 10 cleaned texts per source, last 2 raw HTML
```

`dates.mjs`, `decide.mjs` and the answer check are pure functions with table tests; `npm test` runs them. The quote check ports v1's `pageCheckAnswer.ts` (`normaliseForQuote`, `quoteMentionsDate`), which has proven itself.

## Data (one migration)

| Table | Holds |
|---|---|
| `watch_sources` | one row per URL: `kind` (page, ics, pdf), `access` (fetch, browser, blocked, social), `active`, `ignore_lines` (regex for lines that change by themselves), notes |
| `watch_source_markets` | which markets a source covers, and where the link came from (website, facts, finder, manual) |
| `watch_pages` | per source: last outcome, HTTP status, ETag / Last-Modified exactly as sent, text hash, dates found, failure streak, changed_at |
| `watch_findings` | one question answered: market, source, kind (`new_date`, `missing`, `cancelled`, `hours`, `source_broken`), dates, times, quote, summary, verified, status (open, approved, dismissed), the admin action |
| `watch_runs` | per run: sources planned, fetched, unchanged, stamped, questions asked, findings, errors |

`admin_actions.kind` gains `watch`; `occurrences.origin` gains `watch`. RLS on, no policies; the Function that applies an approval gets `GRANT`s on `watch_findings`, `occurrences` and `facts` (CLAUDE.md gotcha: a missing grant is an empty result).

**Sources at the start:** every active non-Swiss market's `website_url`, `market_private.source_url`, and the URLs in its `facts` (`website_crawl`), normalised and deduplicated. A new source is fetched twice on its first day; lines that differ between the two become its `ignore_lines`.

## Fetching rules

- User-Agent `Mozilla/5.0 (compatible; fyndaBot/1.0; +https://fynda.market/en/about/)` — honest, with the about page as contact. A source that refuses it gets `access = browser` (Edge, below) or `blocked`; we never disguise ourselves further.
- `robots.txt` cached a day and obeyed (4xx = allowed, 5xx/timeout = skip the host today).
- One request at a time per host, 3–5 s apart; 4–6 hosts in parallel; 20 s timeout, 5 redirects, 5 MB cap.
- ETag / Last-Modified sent back; a 304 is "unchanged".
- Bytes decoded by the page's own charset (Node's `res.text()` turns windows-1252 *März* into *M�rz*).
- Browser fallback only under ~300 characters of text or an empty app shell: `playwright-core` driving the Edge already on Windows, `waitUntil: 'load'`. PDFs through `pdftotext -layout` (in Git for Windows).
- 429/503 honour Retry-After, else skip the host until next week. A Cloudflare challenge (`cf-mitigated: challenge`) is `blocked`, handled by hand or by asking the organiser. Facebook/Instagram-only markets are `social`: no fetching, the organiser mail covers them.
- Alert only after three failures in a row.

## Date extraction rules

- Month and weekday words in de/fr/it/en, abbreviations and unaccented spellings, *Sonnabend*.
- A date without a year needs its trailing dot (`24.10.`) and must not be followed by a digit, *Uhr* or *h*; phone and fax lines are skipped.
- Year, in order: written beside the date → nearest heading year (*Saison 2027*) → the year the stated weekday fits → next occurrence within 12 months, marked *assumed*. A weekday that fits no plausible year means a stale page: never stamped.
- **Missing** means one of our dates lies between today and the last date the page shows, and the page does not have it — a widget showing the next three dates does not make the rest "missing".
- **New** means a date this URL has never shown before, near the market's name, venue or town when the source covers several markets.
- Cancellation words — *abgesagt, fällt aus, entfällt, findet nicht statt, verschoben · annulé, n'aura pas lieu, reporté · annullato, rinviato, non si terrà, sospeso · cancelled, postponed* — count only on lines the page never showed before, so a standing "bei Regen abgesagt" does not fire weekly. Cancellations are never applied without approval.
- `chrono-node` runs beside our extractor as a second opinion: a date it finds and ours misses becomes a question, and a test case.

## The AI step

`claude -p --safe-mode --model haiku --tools "" --system-prompt-file <prompt> --output-format json --json-schema <schema> --no-session-persistence`, started from Node with an argument array in an empty folder, snippets on stdin, answer in `.structured_output`.

- Login: Delfim runs `claude setup-token` once; the token goes into `.env.local` as `CLAUDE_CODE_OAUTH_TOKEN`. The run checks `claude auth status` first; if the login is gone, everything except the questions still runs, the questions wait, and Telegram says so.
- One call per run (chunks of ~20 snippets). Each snippet is wrapped as untrusted data; with no tools, a page that tries to instruct the AI can at worst cause a wrong finding, which a human sees.
- Answer per snippet: `confirmed | changed | cancelled | unclear`, dates each with a quote. A quote shorter than 8 characters, not in the snippet, or without the claimed date when our extractor reads it → *unverified*. No retries.

## Approving

One Telegram message per run that has something to decide: a short summary, then each finding in one line — market, what changed, the quote, the page — with Approve and Dismiss links (the existing signed `admin_actions` links, `functions/adm/`). Approve applies: `new_date` inserts the date, `cancelled` cancels it with the page's words, `hours` changes them, `missing` removes the date; each writes a `facts` row and moves the stamp. Changes show after the nightly build — no rebuild per approval (Actions minutes).

## Scheduling and reports

Windows Task Scheduler, daily at 07:00, "run as soon as possible after a missed start": `node scripts/watch/run.mjs`. Each day takes the seventh of the sources whose id falls on that weekday, so every page is read once a week and no day hits the subscription's limit. A run writes `watch_runs`; Telegram hears only when there is something to decide, plus a Monday line: pages read, markets stamped, questions asked, sources broken.

## The finder

1. **Leads.** `scripts/finder/leads-mft.mjs`: meine-flohmarkt-termine.de's sitemap → its detail pages at one a second (robots allows them) → series with ≥3 dates, the categories for children's, yard and private-household markets dropped → name, town, postcode, organiser website. About 270 German recurring series, 90% with an organiser link (a sample of 369 is in hand). Then `leads-marktcom.mjs` (categories 1, 42, 2; its imprint shares an address with Melan), then the big organisers' own schedule pages (Melan, Kreaktiva, Hochberg, Höfges, NMV, Gero's, Weiß), then berlin.de / hamburg.de / hannover.de. Skipped: meinestadt.de, flohmarkt-termine.net, flohmarktnavi.de, in-muenchen.de.
2. **Not ours already.** Matched against our markets by organiser domain, postcode and name.
3. **Checked at the source.** Each survivor's organiser page goes through the watcher's fetch, clean and extractor: future dates found and the market named on the page → an `intake/de/<slug>.json` (dates `listed`, the organiser page as `source_page`); unclear → a question for the AI; no dates → dropped with the reason.
4. **Imported as now.** `import-intake.mjs` → `unverified` → a photo and a check → `active`. The finder never publishes anything.

From a directory we keep only name, town, postcode and the organiser link. No text, no photos, no dates.

## Build order

1. **`sync-v1.mjs`** — built 2026-10-09; first apply after Delfim decides the 171 conflicts.
2. **Watcher, part 1 (Germany):** migration, `sources`, `fetch`, `clean`, `dates` + tests, `decide` + stamping, `ask`, findings + Telegram approve, the run report, Task Scheduler. Proven on the 73 German markets before anything else.
3. **Watcher, part 2:** JSON-LD / `.ics` reading, rule pages ("every first Saturday": the AI turns the rule into JSON once, code expands it), hours.
4. **Finder:** meine-flohmarkt-termine leads → check → intake; then marktcom and the organisers.

**Judged after four weeks:** share of markets stamped without AI, questions per week, share of findings dismissed. Above ~30% dismissed means the extractor needs work before more sources.

New dev dependencies: `cheerio`, `html-to-text`, `robots-parser`, `playwright-core`, `chrono-node` (and `node-ical` in part 2). None reach the site.
