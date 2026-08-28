# Weekly Retention Email — Implementation Plan and Operating Record

Written 2026-07-25 as the implementation plan. Operational status verified 2026-08-05.

**Current status: all four phases are built and live.** Signup uses single opt-in as of
2026-08-23: a valid signup is subscribed immediately and sends no confirmation email. One-click
unsubscribe, localized digest building, review/admin controls, scheduled sending,
market/occurrence placements, Resend webhook ingestion and suppression code are deployed. The
legacy confirmation route remains for links sent before the change. The subscriber list is visible
in the newsletter admin view.

Current production evidence is deliberately modest:

- Seven subscriber rows existed at the audit snapshot: four confirmed, two pending and one
  unsubscribed.
- Immediately before the 2026-08-23 change there were 12 rows: five confirmed, six pending and one
  unsubscribed. The six pending rows were moved to confirmed without sending email.
- One campaign completed with three recipients. All 3/3 sends were accepted by Resend and stored as
  sent, with no application-level failures.
- `newsletter_events` contained zero provider events. Delivery, open/click tracking, bounce handling
  and complaint suppression are therefore implemented but not yet proven end to end in production.
  “Provider accepted” is not the same as “delivered to the inbox.”
- The subscriber admin list exists and is operational; the older statement that these states were
  unobservable is no longer true.
- The measured hard-process-kill gap described under Phase 3 remains unresolved: a batch marked
  `sent` immediately before the provider call can be lost if the process dies in between. The
  content-addressed idempotency key prevents a different duplicate class but does not close this
  mark-before-send crash window.

The detailed sections below retain the original design, decisions and planning-era catalogue
figures. Statements about what a phase “will” build or what the July catalogue contained are
historical unless the current-status notes above or a later dated note say otherwise.

**Phase 1 is built** (the header previously read "proposal, nothing implemented", which was
already out of date). Shipped, uncommitted at time of writing:
`supabase/migrations/20260725120000_newsletter_subscribers.sql` and its grants follow-up,
`src/lib/newsletter/` (tokens, subscribers, config, copy, render, resend, status),
`src/app/actions/subscribeNewsletter.ts`, `src/app/api/newsletter/{confirm,unsubscribe}`,
`src/emails/ConfirmSubscriptionEmail.tsx`, `src/components/newsletter/` (signup + city-hub
wrapper), `src/app/[locale]/newsletter/[status]`, and the privacy-policy update in
`src/content/legal/datenschutz.ts` across all four locales.

Two Phase 1 deviations from the plan below, both deliberate:

- **The confirmation token is not cleared on confirm.** §7 lists "confirmation token
  cleared" as an acceptance criterion. The implementation keeps it (and nulls the expiry)
  so a second click on the same link resolves to the row and gets a friendly "already
  confirmed" page instead of a dead link; once `status = 'confirmed'` the token grants
  nothing, and it is rotated away on any re-signup. Reasoning is in the code comment.
- **Unsubscribe now minimises the row** (audit R4, 26 July): `city_slug`, `signup_source`,
  `signup_path`, `signup_ip_hash`, `confirmation_sent_at` and the confirmation token are
  cleared, leaving email, consent-copy version, the three timestamps, locale and the
  unsubscribe token hash. The privacy policy §11/§16 were reconciled to state exactly that
  in all four locales — they previously contradicted each other *and* the code.

**Phase 2 is built** (2026-07-27): `supabase/migrations/20260727120000_newsletter_campaigns.sql`,
`src/lib/supabase/newsletterQueries.ts` (the live-read adapter, §0.1 option B),
`src/lib/newsletter/{selection,campaign,notes}.ts`, `src/emails/WeeklyDigestEmail.tsx`,
`renderWeeklyDigestEmail()` in `src/lib/newsletter/render.ts`, the
`newsletterEmail.digest` copy block in all four `src/messages/*.json`, and
`src/app/api/newsletter/preview/route.ts`. At that point there was no send path or cron; Phase 3
subsequently added both.

Four Phase 2 deviations from the plan below, all deliberate:

- **One market per city across featured + supporting.** §2 specifies
  `ranked.filter(…).slice(0, 3)` for the supporting list, which has no notion of
  geography — this weekend that produced featured Lausanne plus supporting Lausanne,
  Chur, Luzern, which reads as a Lausanne newsletter to a subscriber in Bern. The
  supporting pool now excludes the featured pick's city and runs through
  `selectDiverseHeroCandidates(pool, 3, 1)`, the same cap the homepage hero panel uses.
  Ranking is otherwise untouched. If the cap would empty the supporting list entirely —
  every remaining market in the featured pick's city — it falls back to the uncapped
  ranking and records `supportingFallbackReason: 'city_cap_exhausted'` in the payload,
  the same guard shape as the novelty fallback. Measured across all 78 weekends in the
  current data: 74 one-per-city, 1 fallback (2027-12-31, two eligible markets and both
  in Lausanne), 0 shortened without a recorded reason.
- **A third featured-fallback case, `no_featureable`.** §2.1 assumes the hero pool is
  never empty. If a weekend ever has eligible markets but none with both an image and a
  known closing time, the builder promotes the top of the general weekend ranking and
  records the reason, rather than skipping a weekend that genuinely has markets in it.
  The template renders without a hero image in that case. Not observed in current data.
- **Image URLs are absolutised at render time.** Roughly half the catalogue stores
  site-relative paths (`/images/….webp`), which no mail client can resolve. Not a
  plan item — a defect found while previewing.
- **The weekend date range is formatted per-end, not with `Intl.formatRange()`**, which
  zero-pads the second date in `it-CH` only ("31 luglio – 02 agosto").

**Phase 3 is built** (2026-07-27): `supabase/migrations/20260727150000_newsletter_delivery.sql`,
`src/lib/newsletter/{send,schedule,cronAuth,suppression}.ts`, batch sending in
`resend.ts`, `src/app/api/cron/newsletter/{build,send}/route.ts`,
`src/app/api/webhooks/resend/route.ts`, the `newsletter` admin view, and the `crons`
block in `vercel.json`.

Phase 3 notes worth keeping:

- **Cron schedules are hourly windows, `0 16-20 * * 3` and `0 16-20 * * 4`** (Vercel Pro).
  Vercel Cron is UTC with no DST awareness, so the window fires five times and
  `src/lib/newsletter/schedule.ts` decides against the Zurich clock which invocations are
  real. Measured: in summer all five qualify (Zurich 18:00–22:00); in winter the first
  no-ops at Zurich 17:00 and the remaining four qualify. That is the free-retry mechanism —
  no invocation after the first does anything, because the build job no-ops on
  `status <> 'draft'` and the send job on the campaign lock. Verified by running all five
  invocations of both windows: one campaign, one review notification, one set of emails.
  If the plan is ever downgraded to Hobby, revert to a single daily `0 17 * * 3` / `* * 4`,
  which needs no code change.
- **The batch idempotency key is content-addressed**, `campaign-{id}-{sha256(sorted send
  ids)}`, not `campaign-{id}-batch-{n}` as §3 step 5 suggests. The counter version is
  wrong and was caught in testing: on a resumed run the counter restarts at 1 and reuses
  the key the *original* run's first batch already used, with different recipients.
  Resend honours a key for 24 hours by replaying the original response, so those
  recipients would be marked sent and never mailed.
- **`/api/newsletter/preview` has its own CSP** in `next.config.mjs`, listed after the
  catch-all. The site-wide `img-src 'self'` blocked the email's absolute
  `https://www.fleafind.ch/...` image URLs from a localhost origin, so the preview showed
  broken images for artwork that is fine. The override is stricter in every other respect.
- **A hard process kill mid-batch loses that batch.** Measured: killing the send at batch
  2 of 2 left 150 rows marked `sent` with only 100 delivered. That is the documented
  mark-then-send bias — never send twice, might miss one. Now that the idempotency key is
  content-addressed, an in-flight `sending` row state would make it never-miss *and*
  never-duplicate; that is a schema change and Delfim's call.

**Phase 4 is built and live.** Compact signup placements are present on market and occurrence pages;
the signed Resend webhook, anonymous `newsletter_events` storage, bounce/complaint suppression and
subscriber list in admin are implemented. Sending and confirmation email acceptance prove the
required Resend configuration exists in production. However, zero provider events had been stored at
the audit snapshot, so webhook delivery and suppression remain operationally unverified.

Planning-era catalogue version referenced below: `eee15cd66f336a0e1de6` (generated 2026-07-20).
The catalogue has since been regenerated from production; none of the July inventory counts below
should be treated as the current production count.

---

## 0. Planning decisions and scope conflicts — historical record

Five things in the original confirmed scope collided with how the codebase worked. Their analysis is
retained because it explains the implementation; these are not all open decisions now.

### 0.1 The catalogue is deploy-time. An email is permanent. (resolved: option B shipped)

`src/lib/supabase/queries.ts` does not read the database. Every helper reads
`src/generated/public-catalogue.json` — a 1.7 MB file bundled into the build by `prebuild`
(`npm run catalogue:generate`). It is regenerated **only on deploy**. There is no scheduled
rebuild in `.github/workflows/ci.yml`.

At planning time, the deployed catalogue had been generated 2026-07-20 and was five days old on
2026-07-25. This is historical context for the live-read decision, not the current catalogue age.

For pages this is the designed behaviour (non-negotiable #4). For an email it's a different risk
class: a market cancelled on Wednesday, or added on Tuesday, would be wrong in Thursday's send,
and an email cannot be corrected by the next deploy. Three ways forward:

- **A — use the catalogue as-is.** Zero new data path, inherits catalogue parity checks.
  Cost: correctness depends on you remembering to deploy before Thursday. Fragile in exactly the
  way that produces an embarrassing send.
- **B — add a live-read adapter (recommended).** One new function, a sibling of
  `getMarketsWithOccurrencesInDateRangeChecked()`, that queries `public_markets` + `market_dates`
  live for the Fri–Sun window and returns the identical `MarketWithOccurrence[]` shape. Every
  downstream discovery function is reused untouched. ~30 lines, no schema change, one query per week.
- **C — schedule a catalogue rebuild** (GitHub Action → Vercel deploy hook, Thursday 17:00).
  Keeps one data path but ties email correctness to a scheduled production deploy — much bigger
  blast radius than a read.

**Recommendation: B.** It still reads `public_markets` (the privileged, active-only projection),
so the security boundary in non-negotiable #1 is intact, and an email is not a public page so #15
isn't breached. But it *is* a deliberate deviation from the catalogue-only spirit and I'm not doing
it without your sign-off. Pair it with: build the payload from the live read, freeze it into
`newsletter_campaigns.payload`, then send from the frozen payload. Freshness where it matters,
immutability where it matters.

### 0.2 The website's weekend fallback is wrong for an email (my recommendation, §2)

`resolveWeekendDiscovery()` rolls current weekend → next weekend → 14-day window. Correct for a
page, wrong for an email. Detail and the alternative rule in §2.4.

### 0.3 ROADMAP sequencing (flagging, not arguing)

`docs/current/ROADMAP.md` puts "Email capture per city" at **Phase B item 8**, behind GATE A
(geography pilot + 2 clean GSC weeks — the Phase 5 observation window you're in now). The
*immediate* retention priority at the top of that document is the WhatsApp channel, not email.
Building this now is a deliberate resequencing.

I won't argue against it — email is an owned asset that compounds, the WhatsApp channel has sat
unbuilt for months, and a list you own is worth more than a channel Meta controls. But per AGENTS.md
I'm naming the deviation rather than proceeding quietly. If you agree, ROADMAP.md should be updated
in the same session so the docs don't drift further.

### 0.4 "One-off market" had two conflicting definitions (resolved: union shipped)

- Homepage `getOneOffMarkets()` (`src/app/[locale]/page.tsx:104`) filters `market_type === 'temporary'`.
- `ranking.ts` `place-continuation` policy treats `marketType === 'temporary' || isRecurring === false`
  as "infrequent".

Catalogue: 85 `temporary`, 67 `is_recurring = false`, **87 in the union**. The definitions differ by
two markets. Small but real.

**Recommendation:** the email uses the union (`temporary || !is_recurring`) — it's the semantically
correct "won't be back next week" test. Log the homepage divergence as a separate small cleanup;
don't change the homepage inside this feature.

### 0.5 The "why go" line × 4 locales (resolved: German input + machine translation shipped)

You'll write one line. Subscribers have a `locale`. Options:

- **(a)** German only; fr/it/en recipients get no note. Cheap, slightly unfair.
- **(b)** You write German, machine-translate to fr/it/en at campaign-build time, translations shown
  in the admin preview so you can override. Reuses the existing translation path
  (`scripts/sync-markets.mjs --translate`).
- **(c)** Four fields in the admin form. Most weekly work for you.

**Recommendation: (b).** One field, auto-translated, overridable. If wiring the translate path in is
too much for v1, ship (a) and upgrade later.

Note the rest of the email is *not* expensive per-locale: subject, ~8 labels, footer, unsubscribe —
small enough to ship all four locales from day one via `src/messages/*.json`. Market descriptions
already exist per-locale via `markets.description_*` / `market_locales`. So all four locales in v1,
no fallback-French-speakers-to-German compromise needed.

### 0.6 Minor: city capture can't capture demand you don't already serve

`CITY_REGISTRY` has 17 entries and **all 17 have `hasData: true`**, so
`getCitySearchEntries()` === `getLiveCitySearchEntries()`. A dropdown from the registry can only tell
you which of the 17 cities you already cover someone cares about — it cannot surface a subscriber in
Chur or St. Gallen. Capturing *uncovered* demand is arguably the more valuable signal.

Cheap fix if you want it: add an "Anderswo" option plus a small free-text field, or source the
dropdown from `municipalities`. Not required for v1 — noting it because the field's stated purpose
("future near-you personalisation") is weaker than it looks with only covered cities on offer.

Also: `CITY_REGISTRY` is scheduled for retirement (ARCHITECTURE §4 migration phase 8). Store the
**slug**, not the display name or `databaseCity` — the slug is the stable URL identity and will map
onto municipality/region slugs later. Never guess DB city strings (non-negotiable #12).

---

## 1. Database schema

Three tables now, one optional in phase 4. All follow the existing private-table pattern from
`supabase/migrations/20260708190000_public_submission_rate_limit.sql`:
`ENABLE ROW LEVEL SECURITY` · `REVOKE ALL FROM PUBLIC, anon, authenticated` ·
`GRANT ALL TO service_role`. No policies — service_role bypasses RLS, and every write goes through a
server action using `createAdminClient()`, exactly like `submitCorrection()`.

### 1.1 `newsletter_subscribers`

| column | type | notes |
|---|---|---|
| `id` | `uuid pk default gen_random_uuid()` | |
| `email_normalized` | `text not null` | **UNIQUE.** Lowercased + trimmed, same as `normalizeEmail()` in `submitListingContact.ts` |
| `status` | `text not null default 'pending'` | check in `('pending','confirmed','unsubscribed','bounced','complained')` |
| `locale` | `text not null` | check in `('de','fr','it','en')`. Inferred from page locale at signup |
| `city_slug` | `text` | nullable. Registry slug, validated at write time. **No FK** — the registry is code, and geography tables are do-not-touch |
| `consent_copy_version` | `text not null` | e.g. `'newsletter-consent-v1'` |
| `signup_source` | `text` | `'city_hub' \| 'market' \| 'occurrence'` |
| `signup_path` | `text` | the page path, for conversion analysis |
| `signup_ip_hash` | `text` | via existing `hashClientIp()`. The proof-of-consent artifact. Never store raw IP |
| `confirmation_token_hash` | `text` | **sha256 hex of a 32-byte random token.** Raw token exists only in the outbound email |
| `confirmation_token_expires_at` | `timestamptz` | recommend 7 days |
| `confirmation_sent_at` | `timestamptz` | |
| `confirmed_at` | `timestamptz` | |
| `unsubscribe_token_hash` | `text not null` | separate token, no expiry, rotated on re-subscribe |
| `unsubscribed_at` | `timestamptz` | |
| `suppressed_at` | `timestamptz` | |
| `suppression_reason` | `text` | check in `('bounce_hard','bounce_repeated_soft','complaint','manual')` |
| `soft_bounce_count` | `integer not null default 0` | |
| `created_at` / `updated_at` | `timestamptz not null default now()` | |

Indexes: `unique (email_normalized)`, `unique (unsubscribe_token_hash)`,
`index (confirmation_token_hash)`, partial `index (status) where status = 'confirmed'`.

**One row per address, lifecycle in `status`.** Re-signup of an unsubscribed address updates the
same row back to `pending` with fresh tokens — no duplicate-key error, and no leak.

**The signup endpoint must never reveal whether an address is already subscribed.** Always return the
identical "check your inbox" response. If the address is already `confirmed`, send nothing. Otherwise
the form is an email-existence oracle.

Token lookup: hash the incoming raw token, look up by hash. These are 256-bit random values, so plain
equality on the hash is fine — no timing concern that matters. But confirm/unsubscribe must return
the **same friendly page** on a bad token as on a good one.

Rate limiting: reuse `check_public_submission_rate_limit` RPC unchanged (it's generic —
`ip_hash` + bucket + max). Suggest a lower cap than submissions: 3 per 15 min.

### 1.2 `newsletter_campaigns` — the once-per-week anchor

| column | type | notes |
|---|---|---|
| `id` | `uuid pk` | |
| `weekend_from` | `date not null` | **UNIQUE.** The Friday. One campaign per weekend — the natural idempotency key |
| `weekend_to` | `date not null` | |
| `status` | `text not null default 'draft'` | check in `('draft','scheduled','sending','sent','skipped','failed')` |
| `featured_market_id` | `uuid references markets(id) on delete set null` | |
| `featured_occurrence_id` | `uuid references market_dates(id) on delete set null` | |
| `featured_canonical_key` | `text` | `market_group ?? slug` — used by the novelty filter (§2.3) |
| `featured_note_de/_fr/_it/_en` | `text` | your "why go" line + translations |
| `payload` | `jsonb not null default '{}'` | **the frozen selection.** ids, slugs, names, cities, times, image urls |
| `skip_reason` | `text` | |
| `locked_at` / `sent_at` | `timestamptz` | |
| `recipient_count` / `sent_count` / `failed_count` | `integer` | |
| `created_at` / `updated_at` | `timestamptz not null default now()` | |

`payload` is what makes the send reproducible: content is decided once, frozen, then sent. Re-running
the job never re-decides content.

### 1.3 `newsletter_sends` — the per-recipient ledger

| column | type | notes |
|---|---|---|
| `id` | `uuid pk` | |
| `campaign_id` | `uuid not null references newsletter_campaigns(id) on delete cascade` | |
| `subscriber_id` | `uuid not null references newsletter_subscribers(id) on delete cascade` | |
| `status` | `text not null default 'queued'` | check in `('queued','sent','failed')` |
| `provider_message_id` | `text` | |
| `error` | `text` | |
| `attempts` | `integer not null default 0` | |
| `queued_at` / `sent_at` | `timestamptz` | |

**`UNIQUE (campaign_id, subscriber_id)`** — the constraint you asked for. This is the real duplicate
guard; everything else is convenience. Index `(campaign_id, status)` for the batch scan.

### 1.4 `newsletter_events` — built, anonymous by schema

Append-only aggregate log of signed Resend webhook events: `id`, nullable `campaign_id`,
`event_type`, opaque `provider_event_id`, `occurred_at` and `created_at`. The identifying columns from
the first implementation (`subscriber_id`, `send_id`, `provider_message_id`, raw provider payload)
were removed by migration `20260730120000_newsletter_events_anonymise.sql`. The table comment forbids
reintroducing them. The webhook may resolve a recipient in memory to apply bounce/complaint
suppression, then discards the address and records only anonymous campaign-level evidence.

Operational state on 2026-08-05: the table had zero rows. The code path exists, but provider webhook
delivery, aggregate engagement reporting and automatic suppression have not yet been demonstrated by
a real stored event.

---

## 2. How this reuses Discovery Layer 3A

The pipeline, concretely — everything except the bracketed line is existing code, unmodified:

```
clock       = { now, 'Europe/Zurich' }
plan        = planWeekendWindows(clock)          // windows.ts — Friday..Sunday
window      = plan.current                       // this weekend only, no roll-forward (§2.4)
rows        = [ live read of public_markets ⋈ market_dates in window ]   // the one new adapter
candidates  = toDiscoveryCandidates(rows)        // marketCandidates.ts
ranked      = rankDiscoveryCandidates({ candidates, clock, policy: 'weekend' })
featured    = selectDiverseHeroCandidates(
                rankDiscoveryCandidates({ candidates, clock, policy: 'homepage-hero' }),
                1, 1
              )[0]
supporting  = ranked.filter(k => k !== featured.canonicalKey).slice(0, 3)
oneOff      = ranked.filter(isOneOff).filter(notAlreadyShown).slice(0, 3)
```

This is almost exactly what `src/app/[locale]/page.tsx:220-300` already does for the homepage. The
homepage is the working reference implementation of this whole selection.

### 2.1 Featured pick

`policy: 'homepage-hero'` in `ranking.ts` already *is* "featured pick" semantics: it requires
`featureable` (not cancelled, not ended, known end time) **and** a non-null `imageUrl`, then orders
ongoing → complete hours → soonest → verified → stable tiebreak. `selectDiverseHeroCandidates(ranked, 1, 1)`
takes the top one.

Planning data check against the July catalogue, weekends Jul–Sep 2026: 17–36 featureable candidates across
9–16 cities each weekend, all 161 markets have images, 2226 of 2234 occurrences are `confirmed`, and
at most one occurrence per weekend lacks an `end_time`. The featured slot is never empty in practice.

Note the `featureable` mechanics at Thursday-evening send time: every weekend occurrence is
`afterToday`, so `remainingMinutes === null` and `featureable` reduces to *eligible + has an end time*.
The 60-minutes-remaining rule (`HOMEPAGE_HERO_MIN_REMAINING_MINUTES`) is inert here. Fine — but it
means a market with no `end_time` can never be the featured pick. That's correct behaviour, just worth
knowing why a specific market never gets featured.

### 2.2 Dedupe and `market_group` — handled for free, with one trap

`toDiscoveryCandidate()` sets `canonicalKey = market_group ?? slug`, and `rankDiscoveryCandidates()`
ends in `dedupeRankedCandidates()`. So sibling schedules at one venue collapse automatically
(non-negotiable #3). Currently only 4 distinct `market_group` values exist, so this rarely fires —
but it must stay correct.

**The trap:** links must use the **individual market slug + date** —
`/{locale}/markt/{market.slug}/{occurrence.date}` — not the canonical key. Use `item.market.slug`,
never `getMarketHubSlug()`. Only *dedupe and novelty keys* use `market_group ?? slug`. The homepage
gets this right via `buildOccurrenceMarketRow`; copy that, don't improvise.

### 2.3 The one thing Layer 3A cannot do: novelty

Bürkliplatz runs every Saturday. The hero ranker will pick the same recurring giant most weeks,
because no page has memory. For a weekly email that's the difference between a habit and an unsubscribe.

**This is the one place I'd add logic rather than reuse it.** After ranking, exclude canonical keys
that were `featured_canonical_key` in the last 6 campaigns — a single read of `newsletter_campaigns`
and a filter. Discovery stays stateless; the email owns its own novelty rule. Guard against
over-filtering in thin winter weeks: if the exclusion empties the featureable pool, fall back to the
unfiltered top pick rather than skipping the send.

### 2.4 Fallback — no, the website's chain is wrong here

`resolveWeekendDiscovery()` walks current weekend → next weekend → inclusive 14-day coming-up. That's
right for a *page*: the URL promises "weekend markets" generically, a visitor arriving on a dead
Tuesday should see something, and the page can relabel itself (the homepage does exactly this —
`weekendHeadingNext` / `weekendHeadingComingUp`).

It's wrong for an email:

1. The subject line commits to a specific weekend. Rolling forward silently mails a "this weekend"
   email full of *next* weekend's markets. A page can re-frame itself; a 4-second inbox skim cannot,
   and the mistake is unrecoverable once sent.
2. Sending a confusing or low-value email costs more than sending nothing — unsubscribes, spam
   complaints, and sender reputation on a brand-new `mail.fleafind.ch` domain with zero history.

**Recommended rule — `plan.current` only, with a different thin-week policy:**

| eligible occurrences this weekend | action |
|---|---|
| ≥ 4 | send normally (1 featured + 3 supporting) |
| 1–3 | send with a shortened supporting list. **Do not pad from other weekends** |
| 0 | **skip the week.** `status = 'skipped'`, `skip_reason = 'empty_weekend'`, notify you, send nothing |

The data says 0 essentially never happens. Occurrences per national weekend, from the current
catalogue: 17–36 in summer, 11–31 in Nov–Dec, and a floor of **8** in the deep-winter trough
(Jan–Feb 2027). So the skip branch is a safety net, not a routine path.

If you later want a graceful "nothing this weekend, here's what's coming" variant, that's a second
template with its own subject line — not a silent reuse of the page fallback.

### 2.5 One-off section

Filter the already-ranked list by `market_type === 'temporary' || is_recurring === false` (see §0.4),
exclude canonical keys already shown in featured + supporting, cap at 3, omit the whole section when
empty. Your "when non-empty" instinct is right: one-off occurrences per weekend run 0–9 in the current
data (the weekend of 2026-07-31 has zero).

### 2.6 Volume and the clock

8–36 occurrences per national weekend — nowhere near the `pageSize: 500` completeness guard. Read
Fri–Sun only; no need for the homepage's 30-day fetch.

`getDiscoveryClock()` deliberately ignores `FLEAFIND_DEV_CLOCK` outside development, so the
campaign-build step needs its own explicit `weekend_from` override parameter (admin-supplied) to test
against an arbitrary weekend. Small, but it's the difference between a testable phase 2 and a
guess-and-hope one.

---

## 3. Cron reliability

Vercel Cron: no automatic retry on failure, invocations can overlap, and **schedules are UTC only with
no DST awareness**. So "Thursday 18:00 Zurich" is `0 17 * * 4` in winter and `0 16 * * 4` in summer.

**Recommended shape — hourly window instead of a single fire:** schedule `0 16-20 * * 4`. The job
checks the Zurich local hour and no-ops unless it's ≥ 18; the first qualifying invocation does the
work and every later one no-ops on the campaign lock. This is DST-correct *and* gives up to four free
automatic retries, closing Vercel's no-retry gap with no extra machinery.

**Check your Vercel plan first.** Hobby limits you to 2 cron jobs at once-per-day granularity, in
which case use a single daily cron and let the job decide "is it Thursday, is Zurich hour ≥ 18". Same
idempotency logic, fewer free retries. Either way the job must be safe to call repeatedly — that's
the design constraint, not the schedule.

### The state machine

1. **Claim the week.**
   `INSERT INTO newsletter_campaigns (weekend_from, weekend_to, status) VALUES (…) ON CONFLICT (weekend_from) DO NOTHING RETURNING id`.
   No row returned → `SELECT` the existing one. Atomic in Postgres; no advisory lock needed.
2. **Take the send lock.**
   `UPDATE newsletter_campaigns SET status='sending', locked_at=now() WHERE id=$1 AND status IN ('draft','scheduled') RETURNING id`.
   Zero rows → another invocation owns it, or it's already `sent`/`skipped` → return 200 with a no-op
   reason. A conditional UPDATE is atomic, so overlap is impossible.
   **Add a staleness escape:** also allow re-claim when
   `status='sending' AND locked_at < now() - interval '30 minutes'`. A crashed run must not wedge the
   week forever.
3. **Freeze the payload** if not already frozen — discovery pipeline (§2) + your note → `payload` jsonb.
4. **Enqueue recipients in one atomic statement.**
   `INSERT INTO newsletter_sends (campaign_id, subscriber_id) SELECT $1, id FROM newsletter_subscribers WHERE status='confirmed' AND suppressed_at IS NULL ON CONFLICT (campaign_id, subscriber_id) DO NOTHING`.
   Runs once; on re-trigger it's a no-op for existing rows and correctly picks up anyone who confirmed
   in between. (If you'd rather freeze the recipient set, add `AND confirmed_at < campaign.created_at`.
   I'd let the late joiners in — they get a valid email.)
5. **Send in batches of ≤100** via Resend's batch endpoint (hard provider limit: 100 per call).
   Per batch: mark those rows `status='sent', attempts=attempts+1` → call Resend → on error flip them
   back to `queued` and record `error`.
   **This ordering is deliberate and it's a tradeoff:** marking before sending biases toward "never
   send twice, might occasionally miss one." The reverse ordering biases toward "never miss one, might
   send twice." For email, the first bias is correct.
   Add Resend's `Idempotency-Key` header per batch (`campaign-{id}-batch-{n}`) for provider-side
   duplicate protection on top of ours. Resend's default rate limit is 2 req/s — put a small delay
   between batches. At 100–1000 subscribers that's 1–10 calls, trivial.
6. **Finish.** No `queued` rows left → `status='sent', sent_at=now()`, write counts. Some left →
   leave `status='sending'`; the next invocation picks up exactly the leftovers.

Re-triggering the route by hand at any time is safe by construction: worst case it sends the
remaining queued rows.

---

## 4. Where the deployed code lives

```
src/emails/
  WeeklyDigestEmail.tsx
  ConfirmSubscriptionEmail.tsx
  EmailLayout.tsx
  theme.ts
src/lib/newsletter/
  alert.ts campaign.ts config.ts copy.ts cronAuth.ts notes.ts render.ts resend.ts
  schedule.ts selection.ts send.ts status.ts subscribers.ts suppression.ts tokens.ts
src/lib/supabase/newsletterQueries.ts
src/app/actions/subscribeNewsletter.ts
src/app/api/newsletter/{confirm,unsubscribe,preview}/route.ts
src/app/api/cron/newsletter/{build,send}/route.ts
src/app/api/webhooks/resend/route.ts
src/components/newsletter/{NewsletterSignup,CityHubNewsletterSignup}.tsx
src/app/(utility)/admin/page.tsx               ← campaign review + subscriber list
```

Installed dependencies: `resend`, `@react-email/components`, `@react-email/render`. The
`react-email` dev CLI remains deliberately absent; the protected preview route covers that need.

### Cron route authentication

- Vercel sends `Authorization: Bearer $CRON_SECRET` on cron invocations when `CRON_SECRET` is set.
  Verify it with a timing-safe compare — reuse `timingSafeStringEquals()` from
  `src/lib/admin/auth.ts` (currently module-private; export it, or add a `verifyCronSecret()` beside
  it). Do **not** hand-roll `===` — non-negotiable #20's reasoning applies here too.
- Also accept a valid admin session cookie (`verifyAdminSessionCookie`) so you can trigger the same
  route manually from the admin UI. Everything else → 401.
- Route config: `dynamic = 'force-dynamic'`, `runtime = 'nodejs'` (React Email render + service-role
  client), `maxDuration` at your plan's ceiling.
- **`middleware.ts` needs no change.** Its matcher is `['/', '/admin/:path*', {maerkte + ?city}]` —
  `/api/*` never enters middleware. Verified by reading it. Good, since that matcher is on the
  do-not-touch list (378K edge invocations last time).
- Register crons in `vercel.json`, which currently holds only `{"regions": ["fra1"]}`.

### Public routes

Confirm and unsubscribe are unauthenticated, authorised purely by token. Unsubscribe needs **both**
verbs: `POST` for RFC 8058 one-click (returns 200, no body), `GET` for the human link (returns a
confirmation page). Set `List-Unsubscribe` **and** `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
on every send — Gmail and Yahoo bulk-sender rules effectively require it, and it's the single
cheapest thing you can do for deliverability.

The signup form is a client component posting to a server action. City dropdown reuses
`getCitySearchEntries(locale)` from `citySearch.ts` and the existing `ui/Select` — same source as
`DateDiscoveryCityFilter`. Copy goes in `src/messages/*.json` for all four locales; the
`no-hardcoded-strings` ESLint rule will catch anything inline.

Placement is fine from a caching standpoint: city hub (`schweiz/[canton]/page.tsx`), market
(`markt/[slug]/page.tsx`), and occurrence (`markt/[slug]/[date]/page.tsx`) all set
`revalidate = 0`, so there's no ISR staleness question.

### Sending domain `mail.fleafind.ch`

SPF + Resend's DKIM CNAMEs + DMARC on the **subdomain** (`_dmarc.mail.fleafind.ch`) at `p=none`
first, so it can't affect `info@`/`hello@fleafind.ch` deliverability, then tighten. Keeping the
envelope/return-path on the subdomain is the entire point of the split — bounces never touch root
domain reputation. A brand-new domain has no reputation; with a list under 1000 you don't need a
formal warm-up ramp, but keep the first few weeks to a small confirmed list.

---

## 5. Manual control — my actual recommendation

**Two-stage: automatic draft, automatic send, real review window in between.**

- **Wednesday ~18:00 Zurich** — cron builds the campaign (claim, freeze payload, `status='scheduled'`).
  Sends nothing to subscribers. Pings *you* with a link to `/admin?view=newsletter`.
- **The admin view** shows the frozen selection and lets you: write the "why go" line, swap the
  featured pick from a ranked shortlist, **Skip this week**, or **Send now**.
- **Thursday 18:00** — cron sends whatever is in the payload, unless `status='skipped'`. If you never
  opened it, **it still goes out**, with the "why go" block simply omitted. No auto-generated filler
  prose, and no falling back to the market's own description (that's already displayed elsewhere in
  the email).
- Plus `NEWSLETTER_SEND_ENABLED`, default `false` until phase 3 is verified. That's the kill switch
  and the phase gate in one env var.

**Why this, and not fully automatic:** ARCHITECTURE.md §3 already sets the rule for Layer 5 —
*"Distribution & Revenue … Automation drafts; **Delfim approves sends**."* A weekly digest is squarely
Layer 5. I'm not inventing process; the documented pace-layer model already says drafts are automated
and sends are approved.

**Where I'd soften that rule, explicitly:** hard-blocking on your approval means a busy week silently
produces no email. For a retention product, *consistency* is the feature — a subscriber who gets
nothing twice forgets they ever subscribed, and you've then paid the acquisition cost for nothing. So:
draft automatically, notify, **send automatically**, with a genuine window and a one-click skip.

That is a soft deviation from a documented rule, so it's your call. If you'd rather apply Layer 5
literally, flip the default so Thursday's job requires `status='approved'` and does nothing otherwise —
it's a one-line change to the lock condition in step 2 of §3. Say which you want.

**Why not skip the draft stage entirely:** your "why go" line requires a moment where the selection
exists and you can look at it. Building 24 hours ahead is what creates that moment. It costs one extra
cron entry.

---

## 6. Privacy policy gap — closed in Phase 1

The planning audit below identified a real gap. It has been closed in all four locales: the current
privacy policy covers newsletter data, consent, retention and Resend, and has been effective since
2026-07-31. The detailed checklist is retained as the rationale and future regression checklist.

Verified planning-era state of `src/content/legal/datenschutz.ts` (623 lines, typed `PrivacyPageLocales`,
all four locales, each with `sections[]` + a processor `table`), rendered by
`src/app/[locale]/datenschutz/page.tsx` with `robots: index:false, follow:false`:

- §3 "Welche Daten wir verarbeiten" lists only technical access data, cookie preference, and
  *"Freiwillige Eingaben: Marktmeldungen über das Einreichungsformular"*. No subscriber list, no
  email address held for marketing, no retention period for one.
- The processor table covers Vercel (hosting), Vercel Analytics, Supabase, Google, Microsoft.
  **Resend is absent.**
- §10 international transfer names Vercel, Google, Microsoft. §11 retention names logs, GA, Clarity,
  cookie preference. Neither mentions a newsletter.
- `updatedAt: 'Letzte Aktualisierung: 9. Mai 2026'`.

### What was required and shipped in all four locales

1. **A new "Newsletter" section**: what's stored (email, chosen city, language, consent timestamp,
   hashed IP, consent copy version); legal basis = **consent** (nLPD/DSG *and* GDPR — you will have EU
   subscribers); the double-opt-in mechanism as the evidence of that consent; withdrawal at any time
   via the unsubscribe link in every email, no reason needed; retention (recommendation: keep the row
   while subscribed, and on unsubscribe keep a **minimal suppression record** — email hash +
   timestamp — indefinitely, so you can prove you honoured it and never re-add them, while deleting
   the rest); no sale or sharing beyond the named processor.
2. **A Resend row in the processor table**: `Resend (USA)` · "Newsletter-Versand" · "Versand und
   Zustellprotokollierung der Newsletter-E-Mails" · "USA/EU" · "Einwilligung". Add Resend to the §10
   international-transfer list alongside Vercel/Google/Microsoft. Sign Resend's DPA (they offer one)
   and rely on SCCs / the Swiss-U.S. DPF as the existing text already does for the others.
3. **Update §3's data list and §11's retention list**, and bump `updatedAt` in all four locales.
4. **Mechanical caution:** section numbers in that file are hand-written strings, and `table.title`
   carries the number ("9. Dienstleister-Übersicht") while `sections` jumps 8 → 10. Inserting a
   thematically-placed section means renumbering by hand across four locales — easy to botch.
   **Recommendation: append it as the next number after the last section** rather than inserting it
   mid-document. Less tidy, materially safer.
5. **Separate from the policy: the consent text at the form itself.** The versioned string you're
   storing has to actually exist somewhere resolvable — immutable, append-only constants in
   `src/lib/newsletter/copy.ts` (`NEWSLETTER_CONSENT_V1`, …), with the display strings in
   `src/messages/*.json` and a link to the privacy policy beside the submit button. **Never edit a
   shipped version in place** or your stored `consent_copy_version` becomes a lie.
6. Impressum needs nothing. `nutzungsbedingungen.ts` — optionally one line that the newsletter is a
   free service that may be discontinued. Low priority.

Swiss nLPD is lighter than GDPR here, but you'll have EU subscribers and GDPR is what a complaint
would be judged against. Double opt-in + versioned consent copy + hashed IP + timestamp is exactly
the evidence package that makes that a non-issue. You've already scoped all of it.

---

## 7. Phasing and current acceptance state

### Phase 0 — complete: decisions + DNS

Original completed tasks: sign off on §0.1 (live read vs catalogue), §0.4 (one-off definition), §0.5 (why-go translation),
§5 (send default). In parallel: create the Resend account, verify `mail.fleafind.ch`, sign the DPA.
**DNS is the long pole — start it first.**

*Verifiable:* Resend shows the domain verified. A test email from the subdomain to a Gmail **and** an
Outlook address lands in the inbox with `DKIM=pass`, `SPF=pass`, `DMARC=pass` (Gmail → "Show original").

### Phase 1 — built and live: storage + double opt-in

`newsletter_subscribers` migration (+ RLS/grants). Token helpers. `subscribeNewsletter` server action
(validation, honeypot, rate limit, always-identical response). Confirmation email template. Confirm
and unsubscribe routes. Signup component on **the city hub only**, four locales. The privacy-policy
update from §6.

*Verifiable, end to end:*
- Sign up → row is `pending`, `confirmation_token_hash` set, **no raw token anywhere in the DB**.
- Click confirm → `confirmed`, `confirmed_at` set, confirmation-token expiry cleared. The hash is
  deliberately retained so the same link can resolve to the friendly already-confirmed state; it is
  rotated on re-signup and grants nothing once confirmed.
- Click the same link again → friendly "already confirmed", not an error.
- Unsubscribe → `unsubscribed`; re-signup of that address → back to `pending`, new tokens,
  **still one row**.
- Sign up an already-`confirmed` address → byte-identical response, no second email sent.
- 4 rapid submissions → rate-limited.
- `curl` confirm and unsubscribe with a garbage token → same friendly page, no information leak.
- Privacy page renders the new section and the Resend row in all four locales.

### Phase 2 — built and live: content pipeline

The live-read adapter. `campaign.ts` (discovery pipeline + novelty filter + payload freeze).
`newsletter_campaigns` + `newsletter_sends` migration. `WeeklyDigestEmail` in four locales. The
dev/admin preview route. At this historical phase boundary there was no Resend send path; Phase 3
subsequently added it.

*Verifiable:*
- Preview renders this weekend's real selection in de/fr/it/en.
- Featured pick has an image and a known end time.
- No market appears twice across featured/supporting/one-off — check by hand against
  `market_group ?? slug`.
- **Every market link opens a live page** — click them all, they must be
  `/{locale}/markt/{slug}/{date}`, not the hub slug.
- Force an empty weekend via the explicit `weekend_from` override → `skipped` campaign, not a broken
  email.
- Run the builder twice → one campaign row, identical payload.

### Phase 3 — built and live: sending

Resend wrapper (batching, idempotency keys, List-Unsubscribe headers). The claim/lock/enqueue/send
state machine. Cron route + auth. `vercel.json` crons. `NEWSLETTER_SEND_ENABLED`. The admin newsletter
view (why-go field, featured swap, skip, send now). The Wednesday draft nudge.

*Verifiable:*
- Flag off → cron runs, no-ops, logs why.
- Flag on, list = your own 3–4 addresses → trigger → one email each, all `newsletter_sends` = `sent`.
- **Trigger again immediately → zero additional emails.** This is the acceptance test for the entire
  idempotency design. If this passes, §3 works.
- **Known failed acceptance case:** a hard process kill after rows are marked `sent` but before
  Resend accepts the batch can lose that batch. Re-trigger does not recover those rows. Preserve this
  as an explicit reliability gap until an in-flight state/provider-reconciliation design ships.
- Render check in Gmail, Apple Mail, Outlook web.
- Gmail's own one-click unsubscribe button works.
- Then let it run automatically for **2–3 weeks on your own addresses only** before opening signup
  more widely.

Observed production evidence: one campaign completed with 3/3 rows provider-accepted and no
application-level failures. This proves the configured send path at tiny scale; it does not yet prove
inbox placement or crash recovery.

### Phase 4 — built and live; provider-event validation pending

Signup on market and occurrence pages. Resend webhook → suppression + `newsletter_events`. Subscriber
count on the admin dashboard (ROADMAP already tracks "subscribers" as one of the four weekly numbers).

The market/occurrence placements, signed webhook, suppression handler, anonymous event table and
subscriber admin view are shipped. The original acceptance test remains outstanding: send to a
controlled invalid address, observe a signed bounce event, confirm the subscriber becomes suppressed,
and verify exclusion from the next campaign enqueue. Zero stored provider events means this must not
be marked proven yet.

---

## 8. One product note, unsolicited

The signup form on market and occurrence pages **competes with the outbound click**, which is those
pages' actual conversion goal (you already track it via `/out/market/[marketId]/[type]`). Occurrence
pages already carry a "Wrong date or cancelled?" link and market pages a "Help keep this listing
accurate" section. A newsletter form makes three secondary asks below the fold.

Recommendation: the **city hub gets the full form** — it's a browse page, the visitor is in discovery
mode and has no single obvious next action. Market and occurrence pages get a **single compact
one-line variant placed below the outbound CTA and venue details**, not a boxed form. And do it in
phase 4, after the city hub has given you a real conversion rate to compare against.

---
owner: Delfim
author: Claude
status: phases 1–4 built and live; provider-event validation and send crash-gap unresolved
last_reviewed: 2026-08-05
