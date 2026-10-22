---
name: end-session
description: Close a fynda.market session — docs rewritten, verify, commit, one push, one deploy, checked live. Use when Delfim says push now, ship it, deploy, wrap up or we're done, or when the session's work is finished.
---

# Ending a session

Push and deploy happen **once**, here. Every push runs GitHub Actions (Delfim has used 90% of his allowance); every deploy pings IndexNow. The guard hook asks before each push and deploy, and refuses a push of code without `docs/PLAN.md`.

1. **Decisions into their docs.** Each decision made this session is a line changed in the doc that owns it (map: `docs/README.md`). Rewrite superseded text in place.
2. **Rewrite `docs/PLAN.md` as state**, not a log: change the lines this session made untrue, update `Updated YYYY-MM-DD`, rewrite **Left off** (what is half-done and where; uncommitted or unpushed work; what changed live — database, deploy). What you did goes in the commit message; a running log (photo batch, watch run) beside its work. `node scripts/docs-check.mjs` must not FAIL; the fix is cutting.
3. **Data.** If a fixtures `verify` ran, `git checkout -- data/` (it overwrote the committed build output with six markets).
4. **Verify** against the live database: `FYNDA_DATA_SOURCE=supabase npm run verify` (Git Bash syntax). A guardrail that says `SKIP` is waiting on data, not passing.
5. **Commit** with named paths — never `git add -A` or `git add .`. End the message with the co-author line.
6. **Push**: `git push`.
7. **Deploy** only if something a visitor sees changed (pages, Functions, data, styles). Docs, scripts and intake alone need no deploy. `npm run deploy` refuses uncommitted or unpushed work, because the nightly rebuild from `origin/main` would undo it. A layout change goes live only after Delfim saw it in the preview and said yes.
8. **Check it live.** Open one changed page on `fynda.market`; for a database change, hit the live endpoint and read the row back. Read the Cloudflare log before believing a `waitUntil()` worked.
9. **Tell Delfim in three lines:** what changed, whether he needs to do anything, any one decision.
