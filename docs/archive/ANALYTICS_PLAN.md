# FleaFind First-Party Analytics — Implementation Plan

Status: **Phase 1 deployed; production validation in progress.** The collector, v1 event
instrumentation, identity-link table, analytics views, internal-traffic exclusion and Metabase
connection are live. This document started as the architecture/sequencing proposal; its detailed
design is retained below as an implementation record, not as a claim that every acceptance test has
passed.

Current operational evidence (2026-08-05):

- Production is recording the expected v1 event names and Metabase is connected and working.
- The sample is still only days old. It proves that the loop records data; it is not yet a reliable
  behavioral baseline. Parity checks against Vercel Analytics, GA4 and the legacy outbound-click
  ledger remain in progress.
- GA4 is opt-in only, so its roughly 500-user 28-day report materially undercounts the whole
  audience and must not be treated as the parity benchmark. Vercel's roughly 4.8K visitors over 30
  days and GSC's search traffic are better scale checks, while still measuring different things.
- Metabase working is an infrastructure result, not evidence that the current dashboards have been
  used long enough to make product decisions.
- **Unresolved implementation/privacy mismatch:** the deployed client creates a persistent
  13-month `ff_aid` for every tracked browser and the wire schema requires `anonymous_id`. That is
  the persistent-for-everyone alternative in §4, not the recommended two-tier model, and the current
  privacy/consent wording has not been reconciled to it. Phase 1 is technically shipped but cannot be
  called fully accepted until Delfim chooses whether code or disclosure changes.

Inputs: the ChatGPT "art of the possible" research report, the planning brief, and the actual
repository/DB state as of 2026-08-03. Figures and phrases such as "today", "current" and the
150–400K-events/month estimate in the retained design below refer to that planning baseline unless a
later date is stated explicitly.

---

## 1. Planning baseline on 2026-08-03 (verified in code, not from older docs)

This changes the picture the brief and the research painted:

- **Analytics is not greenfield.** The site already runs GA4 (gtag), Microsoft Clarity
  (session replay), Vercel Analytics, Speed Insights, and Sentry. GA4 + Clarity load only after
  opt-in via an existing cookie banner (`ConsentManager.tsx`, `ff_consent` cookie,
  `src/lib/consent.ts`). `src/lib/analytics.ts` already defines a `trackEvent`/`PageType`
  vocabulary that forwards to gtag.
- **A first-party event pattern already exists.** `outbound_click_events` +
  `/out/market/[marketId]/[type]` redirect route: server-side recording, UA-based bot/prefetch
  filtering, and a privacy-preserving `visitor_day_hash` (HMAC of IP+UA+UTC-day, secret-keyed).
  This is the house pattern the new system generalizes — not something to invent.
- **A documented anonymisation precedent.** `newsletter_events` MUST NOT carry any
  subscriber-identifying column (table comment, migration `20260730120000`, audit finding P1).
  The new system deliberately links site behavior to subscribers — that is an explicit,
  documented exception (§4), not a silent contradiction of P1. Provider-side newsletter events
  stay anonymous.
- **Clean identity hook points.** Newsletter signup is handled by the
  `subscribeNewsletter.ts` server action, which has request cookies and can write the first-party
  identity link. The legacy `/api/newsletter/confirm` route remains for links issued before the
  2026-08-23 switch from double to single opt-in.
- **Reusable plumbing.** Scoped IP-hash rate limiting (`check_public_submission_rate_limit`),
  Vercel Pro cron + `cronAuth.ts`, `pg_net` + Vault + `submission-alert` Edge Function →
  Telegram, `clientIp.ts`, manual validation conventions (no zod in deps).
- **Security posture rules that bind new tables.** Every new private analytics table needs explicit
  `REVOKE ... FROM PUBLIC, anon, authenticated` + `GRANT ... TO service_role`; every new
  function needs its own revoke. The events tables follow the `newsletter_subscribers` pattern
  exactly.
- **Planning-era volume assumption.** ~5,000 monthly users. Instrumented richly, that is roughly 150–400K
  events/month, ~2–5 GB/year of raw rows worst case. This is 3–4 orders of magnitude below
  where any of the research's infrastructure questions (bus, ClickHouse, partitioning) begin.

One conflict worth stating plainly: **Clarity ships consented session replays of Swiss visitors to
Microsoft today.** That sits uneasily with the directional principle "personal/identified data
never leaves FleaFind." The original plan made removal of GA4 and Clarity a Phase 2 endpoint. That
is no longer an automatic implementation step: keep both during validation, then make an explicit
founder decision once first-party measurement is trusted and the value of Clarity's replay is
clear. Removing them is a privacy/product choice, not a parity fix.

## 2. Verdict on the research report

The "lean but serious" tier is directionally right and still oversized for this codebase.
Adopted, dropped, and deferred:

| Research component | Call | Why |
|---|---|---|
| Custom typed SDK → validating collector → Postgres | **Adopt** | Right shape; maps onto existing repo patterns almost 1:1. |
| dbt | **Drop** | 26-table schema, one "developer" (Codex), SQL transformations that fit in ~10 views. The repo's migration flow already gives version control, review, and history. dbt adds a Python toolchain, profiles, and CI for zero marginal benefit at this scale. Views/rollups live in normal migrations. |
| Kafka / Redpanda / NATS | **Drop** | One producer, one consumer, ~0.1 events/second average. Vercel function → batched insert is the whole pipeline. Revisit: never at plausible FleaFind scale. |
| ClickHouse / TimescaleDB | **Drop** | Plain Postgres handles this volume for years. Revisit trigger: Metabase queries measurably slow AND rollups can't fix it (realistically ≥50M rows). |
| Table partitioning | **Drop for now** | ~5M rows/year doesn't need it. Monthly retention DELETEs are fine with a btree on `occurred_at`. Revisit at ~20M rows. |
| Object-storage raw archive | **Drop** | Postgres *is* the raw store at this volume; Supabase backups cover durability. An immutable second copy of 400K rows/month is process theater. |
| Orchestrator (Prefect/Dagster/Airflow) | **Drop** | Phase 1 has zero scheduled jobs. Phase 3 has two SQL jobs → pg_cron, scheduled inside migrations so it stays in-repo. |
| rrweb / session replay | **Drop** (and lose Clarity's replay with it) | Self-hosting replay is the single most expensive item in the research (storage, privacy masking, player UI) for a site where Delfim can reproduce most UX issues by hand at 5K users. Real trade-off: removing Clarity in Phase 2 loses replay entirely. Accepted — say so in review if that hurts. |
| Identity alias graph, probabilistic stitching | **Simplify** | Deterministic-only, two write points, one link table that keeps `method` + timestamp so merges stay auditable and reversible (the useful 10% of the research's `identity_edge` design). No fingerprinting — decided, and also the right call. |
| Engagement scoring, prediction, experimentation | **Defer** (Phase 4+, mostly indefinitely) | The research itself names the constraint: labels, not events. ~5K users produce too few outcomes to train or even calibrate scores. Revisit when there are ≥1–2K confirmed subscribers or a real personalization decision to make. |
| Managed email delivery | **Adopt** (already true) | Resend stays. |
| Metabase self-hosted | **Adopt** (per brief) | Local Docker on Delfim's machine, details §6. |

## 3. Target architecture

```
Browser SDK (src/lib/tracking/, ~250 lines)
  │  batches ≤25 events, flush every ~10s + sendBeacon on pagehide
  ▼
POST /api/t  (Next.js route handler, nodejs runtime, fra1)
  │  allowlist validation · bot/prefetch filter · IP-hash rate limit
  │  enrich: country (x-vercel-ip-country), device_class (UA), visitor_day_hash
  │  IP itself is never stored
  ▼
public.analytics_events  (service-role-only, ON CONFLICT DO NOTHING on client event id)
public.analytics_identity_links  (written by signup action + confirm route, not by /api/t)
  ▼
SQL views (analytics_daily_traffic, analytics_market_daily, analytics_newsletter_funnel, …)
  ▼
Metabase (local Docker) via Supavisor session pooler, dedicated read-only role
```

No queue, no cron, no second datastore in Phase 1. Every box is either code in this repo or a
migration.

### 3.1 Schema (planning sketch — the migration and current schema are authoritative)

```sql
CREATE TABLE public.analytics_events (
  id               uuid PRIMARY KEY,                    -- client-generated, gives idempotency
  received_at      timestamptz NOT NULL DEFAULT now(),
  occurred_at      timestamptz NOT NULL,                -- client clock, sanity-clamped server-side
  event_name       text NOT NULL,                       -- CHECK against the v1 taxonomy (§5)
  schema_version   smallint NOT NULL DEFAULT 1,
  anonymous_id     uuid,                                -- NULL for non-consented visitors (§4)
  visitor_day_hash text,                                -- always set; existing HMAC pattern
  session_id       uuid NOT NULL,                       -- client-side, 30-min idle rotation
  page_view_id     uuid,
  locale           text,                                -- CHECK de/fr/it/en
  page_type        text,                                -- reuse getPageTypeFromPathname vocabulary
  path             text,                                -- normalized; query string dropped except allowlisted params
  market_id        uuid,                                -- no FK: events must survive market deletion
  city_slug        text,
  referrer_host    text,
  utm_source       text, utm_medium text, utm_campaign text,
  device_class     text,                                -- mobile/desktop/tablet/other
  country          text,                                -- ISO-3166 alpha-2 from Vercel header
  props            jsonb NOT NULL DEFAULT '{}'::jsonb   -- small, per-event-validated
);
-- Indexes: (occurred_at), (event_name, occurred_at), (session_id),
--          partial (market_id, occurred_at) WHERE market_id IS NOT NULL,
--          partial (anonymous_id) WHERE anonymous_id IS NOT NULL.
-- Private-table grants: revoke PUBLIC/anon/authenticated, grant service_role only.

CREATE TABLE public.analytics_identity_links (
  anonymous_id  uuid NOT NULL,
  subscriber_id uuid NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  method        text NOT NULL,                          -- CHECK: 'signup' | 'confirm'
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (anonymous_id, subscriber_id, method)
);
-- Table comment must state this is the documented exception to the newsletter_events P1
-- anonymisation rule, and that emails NEVER appear in analytics_events.
```

Design notes:
- **Promoted columns + tiny `props`**, not a fat JSONB blob: everything Metabase filters on is
  a real column; `props` carries only per-event extras (e.g. search term, filter values) and is
  validated per event name at the collector.
- **`ON DELETE CASCADE` on the link table** means deleting a subscriber row erases the
  behavior↔email association automatically. A deletion-request runbook (one SQL snippet in
  this doc, Phase 1) also deletes that person's `analytics_events` rows by their linked
  `anonymous_id`s first.
- **No FK from events to `markets`** — analytics must never block a market deletion, and
  events about deleted markets remain historically meaningful.

Implementation divergence requiring a decision: the planning sketch allowed `anonymous_id` to be
`NULL` for the consent-independent tier. The deployed TypeScript wire contract requires a UUID and
the client creates `ff_aid` before emitting an event. See §4; this is not a harmless documentation
difference because it changes the consent and retention posture.

### 3.2 Collector (`/api/t`)

- `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`, region fra1 (matches everything else).
- Accepts a batch (max ~25 events / 32 KB). Validates against a **shared TS event registry**
  (`src/lib/tracking/events.ts`) used by both SDK and collector — unknown event names or
  unexpected props are rejected, which is the schema-drift defense the research spends pages
  on, at solo scale.
- Bot filtering: reuse `BOT_USER_AGENT_PATTERN` + `Sec-Purpose`/`Purpose` prefetch check from
  `outboundClickTracking.ts` (extract to a shared module).
- Rate limit: the existing scoped IP-hash bucket pattern, generous ceiling (analytics, not
  auth).
- Internal-traffic exclusion: an `ff_no_track` cookie settable from a tiny admin-only toggle,
  so Delfim's own browsing stops polluting numbers (a real distortion at 5K users).
- Failure mode: fire-and-forget. Collector errors must never surface to visitors; losing a
  batch is acceptable by design. Sentry captures collector exceptions.

### 3.3 What happens to the existing trackers

- `src/lib/analytics.ts` keeps its public surface (`trackEvent`, `PageType`) but fans out to
  the new SDK; gtag forwarding stays until Phase 2 removes it. Instrumentation call sites are
  written once.
- `/out` route keeps writing `outbound_click_events` (ground truth, works without JS).
  Additionally the SDK emits a client-side `outbound_click` event via sendBeacon so the
  funnel has session context. The two are cross-checked in Phase 2; the legacy table is
  retired only after parity is confirmed (no code consumer of it exists in `src/` beyond the
  `/out` route itself — verified).
- Vercel Analytics + Speed Insights: **keep.** Cookieless, near-zero cost, and useful as an
  independent cross-check while our own numbers stabilize (PROJECT_STATE already notes
  GSC/GA4/Vercel disagree — a fourth opinion that we fully control is how that gets settled).
- GA4 + Clarity: removed in Phase 2 (see §7).

## 4. Consent and identity model — unresolved deployment mismatch

The planning brief said "broad first-party tracking, from every visitor," while the pre-analytics
GA4/Clarity implementation tracked only visitors who accepted the banner. The plan recommended the
two-tier model below. The deployed first-party client instead implements the alternative persistent
cookie for every tracked browser.

That choice has not been closed operationally: either change the client/wire contract to the
two-tier model, or explicitly approve persistent-for-everyone and update the privacy/consent wording
after an appropriate legal review. Until then, do not describe the first-party system as
consent-aligned merely because GA4 and Clarity remain consent-gated.

**Recommended: two tiers.**

- **Tier 1 — every visitor, no persistent identifier.** All events fire for everyone,
  consent-independent, keyed by `visitor_day_hash` (rotating daily, existing pattern) +
  short-lived `session_id` (localStorage, rotated after 30 min idle — not a tracking ID).
  First-party, no third parties, no cross-day identifier. This is the same posture that lets
  Plausible/Fathom run consent-banner-free across Europe, and under the Swiss TCA/nFADP
  (transparency + opt-out model, not opt-in) it is defensible with a clear privacy-policy
  section. Gives: all funnels, per-market analytics, daily uniques, conversion rates.
- **Tier 2 — persistent `anonymous_id` (`ff_aid` cookie, 13-month), only when** the visitor
  accepts analytics in the existing banner **or** signs up for the newsletter (the agreed
  privacy-copy sentence covers exactly this; `consent_copy_version` already records which
  wording they accepted). Gives: return-visitor behavior, retention curves, and the
  subscriber link.

What this costs: retention/returning-visitor analysis only covers consenting visitors and
subscribers — the population that matters most for it anyway. What it avoids: FleaFind
setting a year-long tracking cookie on EU visitors who explicitly clicked "reject."

**Alternative (Delfim's call):** persistent cookie for everyone, banner reduced to an info
notice, justified purely on the Swiss opt-out model. More data, simpler code (~30 lines
less), grayer for EU visitors. I'd take the two-tier version; the alternative is not
unreasonable.

Identity linking (both variants): on signup, the server action reads `ff_aid` (setting it
first if absent) and writes a link row (`method='signup'`); on confirm, the route does the
same (`method='confirm'` — catches the sign-up-on-phone/confirm-on-laptop case as a second
browser link). Nothing else links. Newsletter click-throughs are **not** decorated with
identifying tokens — that would undo the P1 anonymisation decision by the back door; if ever
wanted, it's a separate explicit decision.

Privacy policy: the agreed sentence ships in Phase 1 as decided, plus a short paragraph
describing Tier-1 anonymous measurement. Banner copy gains one line ("basic anonymous usage
measurement always on; accept to help us recognize you across visits"). Not legal advice —
Delfim should read the final wording before it ships.

## 5. Event taxonomy v1 (deliberately small)

Eight names. Every one either feeds a Phase-1 dashboard or the funnel. Nothing speculative —
scroll depth, hover, form-hesitation telemetry from the research are all cut until a concrete
question needs them (most never will at this scale).

| event_name | fired | key props |
|---|---|---|
| `page_view` | route change (App Router hook) | none beyond envelope (page_type/market_id/city_slug in columns) |
| `search` | search executed | `term` (truncated), `results_count` |
| `filter_applied` | date-discovery filter change | `filter`, `value` |
| `newsletter_form_view` | form scrolled into view (IntersectionObserver, once/page view) | `placement` |
| `newsletter_submit` | submit attempt result | `outcome`: ok / validation_error / server_error |
| `outbound_click` | maps / organiser site / calendar click (beacon) | `click_type`, `destination_host` |
| `occurrence_action` | ICS download, share, calendar-add | `action` |
| `report_open` | report/organiser-contact flow opened | `kind` |

Newsletter subscription is not a separate SDK event — it is already a DB fact
(`newsletter_subscribers.confirmed_at`, set during single-opt-in signup), joined by date in the
funnel view. Never re-record what the DB already knows.

## 6. Metabase setup — deployed and working

Metabase is connected successfully. The setup notes below are retained as the operational recipe;
the remaining work is to validate dashboard numbers and establish a repeatable review habit, not to
install Metabase.

- Docker Desktop on the Windows machine; Metabase official image; app-DB volume local.
  Bind to `localhost` only; set a real Metabase admin password.
- Connection: Supavisor **session pooler** (port 5432 — IPv4-reachable; the direct connection
  is IPv6-only without the paid add-on), username `metabase_reader.<project-ref>`.
- Migration creates the role: `metabase_reader`, `LOGIN`, `CONNECTION LIMIT 5`,
  statement timeout set, `SELECT` granted **only** on the `analytics_*` views and
  `public_markets` (for market names). Explicitly nothing else — no
  `newsletter_subscribers`, no `reports`, no raw `markets`. The funnel view exposes
  subscriber *counts by day*, never rows. This scoping is what makes "BI credentials on a
  laptop" an acceptable risk.
- Dashboards live only while the laptop runs Metabase — accepted in the brief.

Password for the role goes in Delfim's password manager, not in the repo, not in Vercel.

## 7. Phases

### Phase 1 — deployed; acceptance validation incomplete

1. Migration: `analytics_events`, `analytics_identity_links`, private-table grants,
   `metabase_reader` role, first views (`analytics_daily_traffic`,
   `analytics_market_daily`, `analytics_newsletter_funnel`).
2. Shared event registry + SDK (`src/lib/tracking/`) + `/api/t` collector + bot/rate-limit
   plumbing extracted from `outboundClickTracking.ts`.
3. Instrument the eight v1 events; wire `src/lib/analytics.ts` to fan out.
4. Identity-link writes in `subscribeNewsletter.ts` and the confirm route.
5. Consent changes per §4 (whichever variant Delfim picks) + privacy policy + banner copy.
6. Metabase up locally; one dashboard: daily traffic by page type, newsletter funnel
   (form_view → submit ok → confirmed), top markets by views with outbound CTR, top search
   terms.
7. Deletion-request runbook (SQL snippet) added to this doc.

**Shippable on its own:** yes — one real funnel and one real dashboard, from data no current
tool can produce (GA4 sees only consenting visitors and has no subscriber link).

**Acceptance:** events visible in Metabase from a production visit; funnel shows plausible
numbers for a full week; a test signup produces exactly one link row per method; zero
visitor-facing errors from `/api/t` in Sentry; Lighthouse/Speed Insights unchanged.

Current state: production events are visible and Metabase works. A full-week plausibility check,
cross-tool parity, explicit identity-link lifecycle test and the §4 cookie/disclosure decision are
still open. “Deployed” must not be read as “trusted baseline.”

### Phase 2 — not started; trust-building window in progress

- Cross-check daily uniques/pageviews vs Vercel Analytics and GA4; cross-check
  `outbound_click` events vs `outbound_click_events`. Investigate gaps >15% before trusting
  either number.
- After the trust-building comparison, make an explicit keep/remove decision for GA4 and Clarity.
  Do not remove either merely because its totals differ from Vercel or GSC: GA4 and Clarity are
  consent-gated and measure different units. If removed, the named benefit is a simpler privacy
  posture and the named loss is Clarity's session replay with no replacement.
- Retire legacy `outbound_click_events` writes if parity held (table stays for history).
- Add only instrumentation that Phase-1 questions demand (candidate: scroll-depth summary on
  market pages if description length is actually in question).

### Phase 3 — operate (only once raw queries feel slow or a year-end nears)

- pg_cron (scheduled inside a migration, stays in-repo): nightly daily-rollup table +
  13-month raw-event retention pruning (aligned with the cookie lifetime; rollups kept
  indefinitely, aggregate-only). Fallback if pg_cron misbehaves on Supabase: a Vercel cron
  route via the existing `cronAuth` pattern — both are house-compatible.
- Surface `cron.job_run_details` failures: simplest is a Metabase question; optionally a
  Telegram alert through the existing `pg_net` + Edge Function pattern.
- Optional: weekly Telegram digest (traffic, funnel, top markets) — cheap because the alert
  plumbing exists.

### Phase 4 — act on the data (gated on evidence, not calendar)

- Subscriber-affinity views feeding newsletter selection (e.g. observed-city interest vs
  declared `city_slug`) — only when the funnel shows subscribers actually browse before/after
  emails.
- Admin-panel surfacing only when a Metabase view has proven it's checked weekly. **That is
  the point to revisit admin-login hardening (second factor):** today the login already has
  HMAC sessions, timing-safe comparison, and IP-hash rate limiting (better than the brief
  assumed), and Phase 1–3 add nothing behind it — Metabase carries the new data. The risk
  profile changes only when behavioral data moves behind `/admin`.
- Engagement scores / prediction / experimentation stay out until the label-volume
  constraint (§2) lifts.

## 8. Costs

- New infrastructure: none. New vendors: none.
- Supabase storage: ~2–5 GB/year of events. **Action item: confirm the Supabase plan** — on
  Free (500 MB) this forces Pro (~$25/mo) within months; on Pro the 8 GB headroom covers
  years, especially after Phase-3 retention pruning.
- Metabase: $0, Delfim's hardware.
- Maintenance honestly stated: ~1–2 h/month (Metabase image updates, glancing at rollup-job
  health) plus instrumentation edits when pages change — the registry makes those
  compile-time-checked.

## 9. Decisions and remaining gates

1. **Still open and now urgent:** keep the deployed persistent-for-everyone `ff_aid` model and
   reconcile disclosure, or change the implementation to the recommended two-tier model?
2. Once first-party measurement is trusted, keep or remove GA4 and Clarity? They remain deployed
   and consent-gated; removal would deliberately lose session replay.
3. Confirm the Supabase plan tier (§8) before retained raw events approach the storage allowance.
4. **Resolved:** the deliberate identity-link exception is implemented as a schema-level table
   comment, and raw analytics events prohibit subscriber emails.

---
owner: Delfim
last_reviewed: 2026-08-05
