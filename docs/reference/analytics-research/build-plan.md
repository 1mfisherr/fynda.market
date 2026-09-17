# Analytics v2 — build plan, 2026-09-17

Decided by Delfim the same day: collect everything we can, keep everything, behavioural data included; everything readable in Metabase — users, pages, bots, AI citations. First-party only. Built in a fresh session from this page, one phase per commit, each verified against the live table before the next.

## Phase 1 — the database (one migration, applied with `scripts/migrate.mjs`)

1. **Partition `analytics_events` by month.** New table `partition by range (occurred_at)`, `primary key (occurred_at, id)`, copy rows, swap names in one transaction (seconds at 4k rows). `pg_partman` creates partitions ahead, `pg_cron` runs its maintenance daily. Indexes per partition: BRIN `(occurred_at)`; btree `(market_id, occurred_at)`, `(page_type, occurred_at)`, `(event_name, occurred_at)`. Re-grant the collector and `metabase_ro`.
2. **New columns**, all nullable, all checked: `browser_lang char(2)` (first Accept-Language tag), `city text`, `region_code text`, `timezone text`, `asn int`, `rtt_bucket text` (`fast|ok|slow`), `viewport_bucket text` (`xs|s|m|l|xl`), `is_eu bool`, `days_until_date smallint` (market/date views), `suspect bool` (passed the bot filter but looks like a scraper — one-hit, no referrer, cloud-adjacent ASN). Never postcode, never coordinates.
3. **New events** in the registry, props shapes fixed by the check constraint: `page_leave{active_ms, max_scroll_pct, sections[]}`, `web_vitals{lcp, inp, cls, ttfb}`, `js_error{message, file, line}`, `not_found{referrer_host}`, `newsletter_form_start`, `rage_click{selector}`, `dead_click{selector}`. `outbound_click.click_type` gains `directions`, `phone`, `social` (`maps` stays for old rows). Widen `locale` to the four.
4. **`crawler_hits`** table: `occurred_at, bot_name, bot_role (training|search|user|other), user_agent, asn, as_org, country, path, page_type, market_id, status`. The edge writes a row here for every request the bot filter catches, instead of dropping it. `bot_role = user` (`ChatGPT-User`, `Claude-User`, `Perplexity-User`) is a human asking an AI about that page right now — the AI-citation signal. Keep forever; it contains no personal data.
5. **Forget the key.** A weekly `pg_cron` job re-hashes `visitor_day_hash` on rows older than 7 days with a random per-day salt generated inside the statement and thrown away. Same-day distinct counts survive; the link to an IP does not. Fix the `STACK.md` sentence that claims this already happens.
6. **Views for Metabase**, so every dashboard is a `select *`: `v_sessions` (cookieless: same hash, gap < 30 min), `v_daily_traffic` (views, visitors, sessions, engaged, suspect, by locale/page_type), `v_market_leads` (saves + calendar + directions + contact per market per week), `v_search_gaps` (`no_results` terms by locale), `v_traffic_class` (search / ai_assistant / social / direct / other from referrer + utm; the AI host list is a table), `v_ai_citations` (crawler_hits by bot, role, market, day), `v_health` (404s, JS errors, vitals p75, rage clicks).

## Phase 2 — the collector and the page

7. `functions/_middleware.ts` writes the edge fields from `request.cf` and `Accept-Language`; on a bot, classifies and writes `crawler_hits`; 404s become `not_found`. `days_until_date` comes from a data attribute the page already renders.
8. `functions/e.ts` accepts the new events.
9. `Analytics.astro`: one `page_leave` beacon on `pagehide` (`sendBeacon`) with active time (visibility-aware), max scroll, `IntersectionObserver` on `[data-section]`; `web-vitals` (attribution build, ~2 KB) → `web_vitals`; `window.onerror` → `js_error`; rage (3 clicks, 1 s, 30 px) and dead clicks (click on nothing interactive) → selector only; first focus on the newsletter form → `newsletter_form_start`. Nothing new stored on the device.
10. Tighten the bot filter: `request.cf.verifiedBotCategory` where present, ASN organisation, one-hit patterns → `suspect = true` rather than drop. Read the 14 Sept rows back and confirm they would now be flagged.

## Phase 3 — Metabase

11. Six dashboards, one per view: **Visitors** (real vs suspect, by locale, device, country, browser language vs page locale), **Pages** (by type, engagement, which date pages earn their place), **Markets & leads** (top 20, the zero list, lead-time curve), **Search & gaps**, **Bots & AI** (crawls by bot and role, `*-User` fetches per market, AI-assistant referrals), **Health**. Saved as Metabase questions in `metabase/` so they survive a container rebuild.
12. `scripts/import-gsc.mjs` takes the Search Console "Generative AI" export too.

## Phase 4 — before Germany (October)

13. Cloudflare Queues in front of the insert (no silent loss), Workers Paid $5/mo.
14. Supabase Pro ($25/mo) — 7-day backups on top of ours, 8 GB disk.
15. Enable R2 on the Cloudflare account; the backup job gets a second upload step for 12 monthly copies; a monthly Parquet export of `analytics_events` and `crawler_hits`.

## Not doing

Session replay, heatmaps with coordinates, GA4, Clarity, Analytics Engine as a store, any third-party script. Rollup tables only when a Metabase question is measurably slow.
