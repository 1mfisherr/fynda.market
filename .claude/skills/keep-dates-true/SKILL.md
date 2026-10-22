---
name: keep-dates-true
description: Check, confirm, cancel or sync market dates on fynda.market — confirm.mjs after reading an organiser's page, the weekly v1 sync, the Market Watch run and its Telegram findings. Use for any task about whether a market's dates are right.
---

# Keeping dates true

How it works and what is left to build: `docs/WATCH.md`. Switzerland is copied from v1 weekly; every other country is read by our own Market Watch (Delfim, 2026-10-09).

**After checking a market's dates on its organiser's site:**
`node scripts/confirm.mjs <slug> --source <url> <date…> --apply`
Moves the "confirmed on" stamp to today and writes the source to the ledger. Name the dates you saw; without them it stamps every future date. **The stamp means dates checked** — a facts check does not move it (Delfim, 2026-09-28).

**v1's Swiss dates against ours:** `node scripts/sync-v1.mjs` (dry run). `--apply` writes, stamped with v1's check date; the weekly watch run does this itself. It holds back anything that would undo our own edits — read the organiser's page, then `--accept-flagged` if v1 is right. `intake/sync-v1/keep-ours.json` is what we settled in our favour; those should be fixed in v1 too.

**The Market Watch:**
- `node scripts/watch/run.mjs --dry` — what it would stamp and ask, without writing or asking AI.
- Without flags it is the weekly run Windows starts at login (`--if-due`, `scripts/watch/schedule.ps1`). Last output: `watch-data/last-run.log`.
- New markets' pages into the watch list: `node scripts/watch/sources.mjs --apply`.

Every write here changes the live database at once — say so to Delfim. A cancelled date carries no reason text.
