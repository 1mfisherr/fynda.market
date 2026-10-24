---
name: photo-batch
description: Find and import market photos for fynda.market — replacing the old site's pictures 20 at a time, or a photo for a new market, or a folder Delfim sends. Use for any task about a market's photo.
---

# A photo batch

Every market has a photo, a real one wherever it exists; stock is the last resort, for a market with nothing real anywhere (Delfim, 2026-10-24). The log — what is left, what was tried, which wrong photos are still live — is `intake/photos/README.md`. Read it first and update it at the end.

1. **Pick.** The next 20 markets whose `image_url` fact is still the v1 import, soonest next date first. Skip every market in its **Tried** list.
2. **Search.** Four `fynda-researcher` agents, five markets each: Bing Images (Google shows agents a bot check), the organiser's own site and gallery, local press, Wikimedia Commons. When several markets shared one old photo, one new photo serves all of them. Each find comes back with its page URL.
3. **Delfim picks.** Show each find beside the old photo, always — an organiser's "own" picture is sometimes the old site's. Keep the old photo when the find is weaker, shows another event, or centres one identifiable person.
4. **Import.** Files named after the markets in one folder: `node scripts/import-photos.mjs "<folder>" --dry`, then without `--dry`. It matches by name, writes hero, 720 and thumb into `public/images/`, sets `image_url` and a fact; it refuses to write until every file matches. The source page goes into the fact's `source_ref`; a Commons photo is credited under the picture.
5. **Log** the batch in `intake/photos/README.md` (Replaced / Kept / Nothing better found) and the count in `docs/PLAN.md`.

Settled by Delfim: Google Images finds are fine (2026-10-17, after one warning — raise rights once at most). An AI-made photo is acceptable if it shows the market (2026-10-18). Stock is allowed where nothing real exists (2026-10-24).

**Files Delfim drops into `public/` ship as they are.** Move them to the scratchpad before any build, then import that folder.
