# Keeping dates true

How every date on the site stays checked: Switzerland copied weekly from v1, every other country read by our own Market Watch, and the Finder for markets we lack. The commands are in the `keep-dates-true` and `add-markets` skills.

## Switzerland: copied from v1

v1's watch checks Switzerland; fynda.market copies. The Market Watch's weekly run starts `sync-v1.mjs --apply` and puts its result — and any change it held back — in the Telegram report.

- `sync-v1.mjs` compares every upcoming Swiss date (adds, cancellations, hours, status, removals) and, with `--apply`, writes them with v1's check date as the "confirmed on" stamp and a `facts` row naming v1's source page.
- v1's *tentative* is our `unverified`: kept, never published.
- A change that would undo one of our own edits since `--since` is held back unless `--accept-flagged`.
- `intake/sync-v1/keep-ours.json` lists the differences settled in our favour after reading the organiser's page. They are skipped every week and should be corrected in v1.
- It never copies text and never touches a date an organiser gave us.

## The Market Watch

Every other country's dates are kept true by the Market Watch, on Delfim's PC (`scripts/watch/`).

**How it runs**
- Windows starts `run.mjs --if-due` five minutes after each login (`schedule.ps1`, `weekly.cmd`). It runs only when the last run is six days old, so every page is read once a week whenever the PC is on. Each run first adds the pages of markets added since.
- `sources.mjs` builds the list: a market's website, `market_private.source_url`, every `website_crawl` fact.
- A page is fetched politely: our own User-Agent, robots.txt, one request per host every 3–5 s, ETag.
- `dates.mjs` reads dates with our own four-language reader, strict on purpose: a miss costs a question, a wrong read would cost a wrong stamp.
- `decide.mjs` stamps our dates the page shows plainly (the `confirm.mjs` write; `unverified` becomes `confirmed`) and turns differences into questions.
- Only questions go to AI: Haiku through `claude -p` on Delfim's subscription (`CLAUDE_CODE_OAUTH_TOKEN` in `.env.local`), no tools, every quote checked on the page and its date re-read by our extractor.
- Findings reach Telegram through `/adm/notify` with signed Approve / Dismiss links; `watch_decide()` applies one in a transaction.

**Rules, each with its case in `decide.test.mjs`**
- An unchanged page raises no new questions; a question once asked is never asked again.
- A page that stops naming its market is "source broken", never "cancelled".
- **Listing sites, guides, tourism boards and Wikipedia are never a source** (`LISTING` in `sources.mjs`).
- **A new date must be written as this market's** — on its own line, in the caption under it, or under the nearest heading that names a market — because organisers list their other markets on the same page. A line with "nur …" that does not name us is another market's day.
- **An earlier start with the same end is the sellers' gate**, not new hours.
- A page that states "every Saturday" never makes a date "missing".
- **A stated rule stamps the dates we hold that it produces** (`rules.mjs`, 2026-10-27): "jeden Sonntag", "jeden 3. Sonntag", "jedes Wochenende", "Immer Samstags". Code, no AI; it never adds a date. Not on a page that speaks of a season, a break or a last market; not on a line that negates; never a public holiday, 24 Dec – 1 Jan or the two quiet November Sundays; not inside a span of listed dates; not when the rule's hours differ from ours.
- **Every market read by hand is stamped the same day** (Delfim, 2026-10-27: "always mark the markets that were checked with today's date as checked"). Where a town's own event calendar is the only page, it counts (hannover.de, 27 Oct).

**The Finder.** `scripts/finder/` finds markets we lack: `leads-mft.mjs` reads meine-flohmarkt-termine.de's recurring flea markets (name, town, postcode, organiser link — nothing else is kept from a directory), `check.mjs` drops ours and keeps those whose organiser page shows an upcoming date beside their town. Candidates become intake files by hand (`intake/README.md`); the finder never writes to the database.

## Left to build

Open, Delfim's call once the Watch has run well for a month: whether Switzerland moves from v1's copy to our own watcher, so one system runs.

- **Rule pages with seasons.** "Jeden ersten Samstag von April bis Oktober" stamps nothing yet: the AI could turn the rule into JSON once (`{weekday, nth, months, exceptions}`), keyed by a hash of the paragraph, and code expand it. Plain weekly rules are read since 2026-10-27.
- **Exclusions scoped to their words.** A line like "außer 3. + 31.10 … Termine Sonntags: 29.11. + 20.12." marks every date on it excluded, so the Sundays become a cancellation question (the AI settles it; nothing changes alone). The exclusion should reach only the dates after its own word.
- **Hours on the page, not on the date line.** "Öffnungszeiten 8–16 Uhr" in a sidebar is ignored; only hours on a date's own line are compared.
- **Finder: the doubtful leads.** Of 223 new German leads on 2026-10-09, 191 were dropped: 110 because no date sat beside their town and a flea-market word on the organiser page (the check is strict on purpose), 57 for no organiser page or only a directory or social one, 24 unreachable or closed to robots. Send the first group to the AI step; the second needs a person or the organiser.
- **Finder: more sources**, in this order: marktcom.de (categories 1, 42, 2; its imprint shares an address with Melan), then the big organisers' own schedules (Melan, Kreaktiva, Hochberg, Höfges, NMV, Gero's, Weiß), then berlin.de / hamburg.de / hannover.de. Skip meinestadt.de, flohmarkt-termine.net, flohmarktnavi.de, in-muenchen.de.
- **Candidates into intake.** `intake/finder/check-de-2026-10-09.json` holds 28; each needs its venue address, coordinates and a photo before `import-intake.mjs`.
