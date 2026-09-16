# Organisers — build spec

Approved for build 2026-09-16. Research in `../reference/organiser-research/`. When it ships, the durable parts move into `PAGES.md` (market page), `ARCHITECTURE.md` (data) and `STACK.md` (jobs), and this file is deleted.

## What we are building, in one paragraph

An organiser gets one e-mail seven days before each of their market dates with three buttons — *Yes, it's on · Cancelled · Something changed*. The first two change the live site within the hour and stamp the page "Confirmed by the organiser on …". The third opens their page — the link in the mail is their identity, there is no login — with five fields: dates, number of stalls, indoor/outdoor, runs in the rain, photo. Unclaimed market pages ask the organiser to take the page over; claimed ones look visibly owned. Delfim approves claims and text edits with one tap in Telegram.

## The one number

**Answer rate** — mails with any button pressed within 7 days ÷ mails sent. Read after four weeks (two rounds). Above 25%: extend to every organiser and plan the next step. 10–25%: keep as a data feed, build nothing more for organisers. Below 10%: stop building for organisers; the watch agent and visitor reports are the truth loop.

## Decisions already made (Delfim, 2026-09-16)

- No login, ever. A personal link is the identity.
- A cancellation alerts newsletter subscribers within 25 km / in the canton at once, plus the page banner.
- "Cancelled" asks one follow-up: *just this date, or has the market stopped?* Only the date changes automatically; "stopped" goes to Delfim.
- The 7-day mail only — no morning-of mail. Instead the edit page asks "does it run in the rain?" and the page shows the answer.
- No reach number ("412 people looked at this page") on the page.
- Dates and the three facts (stalls, setting, rain) go live at the next publish. Free text and photos wait for Delfim.
- Delfim supplies the missing organiser e-mails (23 of 114 have one today).

## The pieces

### 1. Market page — unclaimed

The block after the dates on every market without an organiser stamp (`verifiedBy !== 'organiser'`). Today: *"Nobody looks after this market yet."* Becomes, in all four languages:

> **Is this your market?**
> Take it over. Confirm dates, add a photo, cancel on a rainy morning — one click, no account.
> [ This is my market ]
> Free. Always.

Same target as today (`/{locale}/organisers/?markt=…&ort=…&mid=…`), filled-style button. `src/pages/[locale]/[type]/[slug].astro`, copy in `src/lib/strings.ts` (`claimTitle`, `claimBody`, new `claimButton`, `claimFree`).

### 2. Market page — claimed

When the market's organiser has answered at least once:

- Stamp in the accent: *Confirmed by the organiser on 19 Sept* (exists: `stampMain` when `next.origin === 'organiser'`).
- One line under it: *Run by {organiser} · about 120 stalls · outdoor, runs in the rain* — each part only when the fact exists (the "renders only when its data exists" rule).
- No claim block.
- Structured data: `eventStatus` already follows `occurrences.status`; nothing new.

### 3. The mail

Sent 06:00 UTC daily by a new workflow `organisers.yml` running `scripts/send-organiser-mail.mjs` (mirrors `digest.yml` / `send-digest.mjs`, same dry-run / `--send` / `--only` flags). For every occurrence whose date is today + 7 whose market has an organiser with an e-mail and an active link: **one mail per organiser**, listing all their dates that day (the operator with 19 markets gets one mail, one "all correct" button plus per-market buttons). An `organiser_mail_sends` row is written before the send, like the digest.

Language: the organiser's `locale` (set at claim time; for imported organisers, the canton's language; English if unknown). From `Fynda <contact@fynda.market>`. Subject: *{Market}, Sat 26 Sept — still on?*

Buttons are links carrying the personal token (§7).

### 4. The answer

`functions/a/[[path]].ts` — one Function, three paths:

- `/a/{token}/{occurrence}/on` → `occurrences.status = confirmed, origin = organiser, confirmed_at = now()`; `markets.verified_by = organiser, verified_at = now()`; row in `organiser_answers`; request a publish (§8). Lands on a plain page: *"Thanks — Bürkliplatz, Sat 26 Sept shows as confirmed within the hour."* with a link to the market page.
- `/a/{token}/{occurrence}/cancelled` → a page with one question: *Just this date, or has the market stopped?* Two buttons (POST). *Just this date* → `status = cancelled, cancellation_note = 'organiser'`, answer row, publish request, subscriber alert (§9). *Stopped* → answer row with `scope = market`, Telegram to Delfim with the market and organiser; nothing changes on the site until he acts.
- `/a/{token}/{occurrence}/changed` → the edit page (§5).

Mail scanners follow links. A `GET` on `/on` acts immediately only when the request carries `Sec-Fetch-User: ?1` (a person clicked); otherwise it shows a single *Confirm* button that POSTs. Every write also checks the token is active and belongs to the occurrence's market.

### 5. The edit page

`/a/{token}/edit` (also where *Something changed* lands). Server-rendered by the Function in the organiser's language, styled with the site's own stylesheet. Five fields:

| Field | Stored | Goes live |
|---|---|---|
| Next dates (list, add/remove, date + start/end time) | `occurrences` rows, `origin = organiser` | next publish |
| Number of stalls | `markets.stall_count` | next publish |
| Indoor or outdoor | `markets.setting` (`indoor` / `outdoor` / `both`) | next publish |
| Does it run in the rain? | `markets.rain_policy` (`runs` / `cancelled` / `decided_on_the_day`) | next publish |
| Photo | **v1: "Reply to our mail with a photo" — Delfim adds it through `import-images.mjs`.** Upload (storage, resizing, moderation) is a day on its own and comes after the answer rate is known | — |

Anything else the form ever grows (description, address) writes to `organiser_edits` as `pending` and pings Delfim with approve / reject links (§6). The page says which is which: *"Dates go live within the hour; text and photos after a quick check."*

Removing a date the organiser did not create is allowed (it marks the occurrence cancelled, note `organiser`); the 120-day horizon still applies to what the build renders.

### 6. Delfim's one tap

Every Telegram message that needs a decision carries two signed links — *Approve* / *Reject* — to `functions/adm/[[path]].ts`, signed with `ADMIN_SIGNING_SECRET`, valid 14 days, single use. No Telegram bot webhook, no dashboard. Decisions:

- **A claim** (`organiser_claims` row): approve → create or match the `organisers` row, set its `email` and `locale`, link the market (`markets.organiser_id`), mint a link (§7), send the welcome mail (*"Your page on Fynda — here is your link"*), mark the claim handled.
- **A "market has stopped" answer**: approve → `markets.status = permanently_closed` (page stays, says so; guardrail 9 keeps the address).
- **A pending edit**: approve → apply the payload.

### 7. Identity

`organiser_links (id, organiser_id, token_hash, created_at, last_used_at, revoked_at)`. The token is 32 random bytes, base64url in the URL, stored as SHA-256. One active link per organiser; minting a new one revokes the old. A revoked or unknown token lands on a page that offers to re-send the link to the address on file — nothing else.

Answers are logged in `organiser_answers (id, organiser_id, market_id, occurrence_id, answer on|cancelled|changed, scope date|market, created_at, ip_hash)`. This table plus `organiser_mail_sends` is the answer rate.

### 8. Publishing within the hour

The site is static and rebuilds at 03:00. A confirmation or cancellation triggers `publish.yml` through GitHub's `workflow_dispatch` API with a fine-grained token (`GITHUB_DISPATCH_TOKEN`, Actions: write, this repo only) stored in Cloudflare. Debounced: a `publish_requests` row per trigger, and the Function skips the call if one was made in the last 10 minutes — `publish.yml`'s `concurrency` group queues the rest. A build takes about five minutes.

### 9. The cancellation alert

On *just this date*: the Function selects active subscribers whose subscription covers the market — the same match the digest uses (25 km by `st_dwithin` on `cities.point`, or the canton) — and sends one short mail each through Resend: *"Bürkliplatz flea market, Sat 26 Sept, is cancelled — the organiser told us at 09:14."* Unsubscribe link as in the digest. Logged in `newsletter_sends` with `kind = cancellation`.

## Data changes — one migration

- `organisers`: add `email text`, `locale text check in (de, fr, it, en)`. (Keep `channel_type` / `channel_value` for the website.)
- `markets`: add `stall_count integer check (> 0)`, `setting text check in (indoor, outdoor, both)`, `rain_policy text check in (runs, cancelled, decided_on_the_day)`.
- New: `organiser_links`, `organiser_answers`, `organiser_mail_sends`, `organiser_edits`, `publish_requests`. RLS on, no policies; the service role gets what its Function needs; `metabase_ro` gets a view `organiser_funnel` (sent, answered, by answer, by week) and nothing with an e-mail address in it.
- `newsletter_sends`: allow `kind = cancellation`.

## Build order — five days

| Day | Build | Proof |
|---|---|---|
| 1 | Migration. Claim approval links in Telegram (§6). Link minting (§7). Welcome mail | Delfim claims a test market from the live site, taps approve, receives the link |
| 2 | The 7-day mail script + workflow (§3). The answer Function: *on*, *cancelled* + follow-up (§4). Publish trigger (§8) | Dry run lists the right dates. Delfim presses *on* from a real mail; the live page shows the stamp within the hour |
| 3 | Market page: unclaimed block, claimed state, the three new facts (§1, §2). Edit page with the five fields (§5). Pending edits + approval (§6) | Screenshots of both page states in de and en; an edit made from the link appears after publish |
| 4 | Cancellation alert (§9). `organiser_funnel` view. Docs: `PAGES.md`, `ARCHITECTURE.md`, `STACK.md`; delete this file | A test cancellation reaches a test subscriber; the view returns the right counts |
| 5 | Buffer. Round one: Delfim picks two or three organisers he can contact; their mails go out; fix what they trip over. Then the 23 | First real answers in `organiser_answers` |

Each day ends with `npm run verify`, a deploy, and the proof driven on the live site — not read from the code.

## Not in this build

Photo upload (after the answer rate). The annual "what are this season's dates?" mail (same template, one more mode; before the Swiss spring 2027 season). A morning-of rain mail. Anything vendor-facing. Posting to Google or Facebook. A dashboard. Analytics events for the funnel — the tables are the funnel.

## What Delfim does

- Finds e-mail addresses for the 90 organisers who have only a website. Any format; a spreadsheet with `organiser name, email` is enough, and `scripts/` gets a five-line importer.
- Picks two or three organisers for round one.
- Taps approve in Telegram when a claim or an edit comes in.
- Creates one GitHub fine-grained token (Actions: write, this repository) and pastes it into Cloudflare — step-by-step instructions on the day.
