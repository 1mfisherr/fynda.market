# Market Watch and Market Finder — what is left

Built 2026-10-09; how it works is in `ARCHITECTURE.md` §Watch, the commands in `CLAUDE.md`. This file keeps the decisions and the remaining work, and is deleted when the list below is empty.

## Decided (Delfim, 2026-10-09)

- **Switzerland stays with v1.** v1's watch checks Swiss markets; `sync-v1.mjs` copies them. Our watcher covers every other country. After a month of it running well, decide whether Switzerland moves over too, so only one system runs.
- **No new costs.** Runs on Delfim's PC; AI on his Claude subscription through `claude -p`, smallest model. No API key, no paid service, no extra GitHub minutes.
- **The program reads, the AI only settles doubts**, and every change is approved in Telegram — except the "confirmed on" stamp for a date the page shows exactly as we have it.
- **The finder starts from the established directories**, names only; every market is checked on its organiser's page.

## First run (needs Delfim)

1. `claude setup-token` in a terminal, log in, put the token in `.env.local` as `CLAUDE_CODE_OAUTH_TOKEN=…`. Without it the run still fetches and stamps; questions wait and Telegram says so.
2. `powershell -ExecutionPolicy Bypass -File scripts\watch\schedule.ps1` registers the weekly run: five minutes after each login, only if the last run is six days old.
3. The first run is `node scripts/watch/run.mjs`: the 2026-10-09 dry run read 116 of 117 German pages, would stamp 180 dates and ask 48 questions.

## Left to build

- **Rule pages.** "Jeden ersten Samstag von April bis Oktober": the AI turns the rule into JSON once (`{weekday, nth, months, exceptions}`), keyed by a hash of the paragraph; code expands it and compares. Today such a page stamps nothing and asks nothing.
- **Hours on the page, not on the date line.** "Öffnungszeiten 8–16 Uhr" in a sidebar is ignored; only hours on a date's own line are compared.
- **Finder: the doubtful leads.** 191 of 223 new German leads were dropped on 2026-10-09 — 110 because no date sat beside their town and a flea-market word on the organiser page (the check is strict on purpose), 57 for no organiser page or only a directory or social one, 24 unreachable or closed to robots. Send the first group to the AI step; the second needs a person or the organiser.
- **Finder: more sources**, in this order: marktcom.de (categories 1, 42, 2; its imprint shares an address with Melan), then the big organisers' own schedules (Melan, Kreaktiva, Hochberg, Höfges, NMV, Gero's, Weiß), then berlin.de / hamburg.de / hannover.de. Skip meinestadt.de, flohmarkt-termine.net, flohmarktnavi.de, in-muenchen.de.
- **Candidates into intake.** `intake/finder/check-de-2026-10-09.json` holds 28; each needs its venue address, coordinates and a photo before `import-intake.mjs`.

## Judged after four weeks

Share of markets stamped without AI, questions per week, share of findings dismissed. Above ~30% dismissed means the date reader needs work before more sources.
