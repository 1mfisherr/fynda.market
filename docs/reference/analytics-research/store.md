# Storage and retention — research report, 2026-09-17

Legend: **[V]** verified from a cited source · **[E]** estimate.

## 0. The one-paragraph answer

Postgres on Supabase is the right home for years. At today's ~100 rows/day the table is trivial; at 10,000/day (3.7M rows/yr, ~1.7 GB/yr [E]) a single table on Micro compute is still fine; at 1,000,000/day (365M rows/yr, ~170 GB/yr [E]) you need monthly partitions, BRIN, a queue in front, and Parquet on R2 as the long-term copy. Because the table has a few thousand rows now, converting it to a partitioned table today costs milliseconds and zero downtime — do it before Germany, not after. The real weak spot is not storage; it is that every event rides on `waitUntil()` and a single HTTP insert, which loses events silently whenever Supabase restarts or the Function times out.

## 1. Postgres for event data

**Row size [E].** ~320 bytes heap + ~130 bytes across the five btree indexes ≈ 450 bytes/row all-in. 100M rows ≈ 45 GB. Storing `visitor_day_hash` as `bytea` (32 B) instead of hex text (65 B) saves ~7%. On Pro, 45 GB is 37 GB over the included 8 GB × $0.125 ≈ $4.60/month [V] — disk is not the cost driver.

**When a single table stops being fine [E].** The ceiling is RAM, not rows: Micro has 1 GB, Nano (Free) 500 MB shared [V]. Once the btree indexes stop fitting in cache (~20–30M rows of this shape) every "per market last 30 days" query hits disk and VACUUM of one huge table takes hours. Partition by month before ~10M rows.

**Partitioning without downtime [V].** Postgres cannot convert a table in place, but the DEFAULT-partition trick does it in one sub-second transaction; for a table this small, `create table … partition by range (occurred_at)` + `insert … select` in one transaction takes seconds. The primary key must include the partition column: `primary key (occurred_at, id)`. **pg_partman** pre-creates monthly partitions and **pg_cron** runs `partman.run_maintenance_proc()` daily; both are on Supabase, pg_cron works on Free [V].

**TimescaleDB is gone [V].** Deprecated on Postgres 17 (fynda is on 17), removed from the PG17 bundle; Supabase's own path is native partitioning + pg_partman.

**Indexes [V].** For an append-only table where `occurred_at` correlates with physical order, BRIN on `occurred_at` is 500–1,000× smaller than btree and wins on range scans. Check `pg_stats.correlation` > 0.85 first; a queue that batches inserts keeps it high. Per partition: BRIN `(occurred_at)`; btree `(market_id, occurred_at) where market_id is not null`; btree `(page_type, occurred_at)`; btree `(event_name, occurred_at)`. Search terms: a rollup, not an index on jsonb.

**jsonb vs typed columns [V/E].** The current split (typed columns for everything queried, `props` ≤ 8 KB for event-specific keys) is right. Keep jsonb under ~2 KB per row to avoid TOAST, which makes reads 2–10× slower. Promote a key to a column when it appears in a Metabase filter.

**Ingest bottleneck [E].** The edge inserts over PostgREST, not the pooler. Postgres does thousands of single-row inserts/s on Micro; 50 req/s is nothing. What fails is availability: Supabase restarts, Free-plan pause after 7 idle days, PostgREST 5xx during upgrades.

Sources: Supabase pricing, compute-and-disk, pg_partman and timescaledb docs; Supabase discussions on PG17 and pg_cron on free; mydba.dev on partitioning without downtime; Crunchy Data on BRIN; FlowVerify on event-table indexes; evanjones.ca on large jsonb.

## 2. Ingestion path

`waitUntil()` has a hard 30-s cap and failures are invisible unless you read the Cloudflare log [V].

| Option | Reliability | Cost | Verdict |
|---|---|---|---|
| Direct insert in `waitUntil` (today) | Lost on any DB hiccup, silently | $0 | Fine at 100/day, not at launch |
| **Cloudflare Queues** | At-least-once, retries, dead-letter queue; consumer batches 100 messages → one multi-row insert | Workers Paid $5/mo; 1M ops included, $0.40/M after; ~3 ops/message [V]. 10K events/day ≈ $5; 1M/day ≈ ~$40 [E]. Free plan's 10K ops/day and 24-h retention are too small [V] | **Recommended** |
| Cloudflare Pipelines → R2 Parquet/Iceberg | "Exactly-once delivery to R2", ingress free, Parquet sink $0.06/GB with 50 GB/mo included on Paid; still **open beta** [V] | ~$0 | The *archive* leg, not the Metabase source (Metabase cannot read R2) |
| Workers Analytics Engine | Data kept **three months**, sampled at volume; no bulk export [V] | Free tier 100K points/day | **Ownership trap** for "keep forever". Ops counters only |
| Durable Objects buffer | Works, but you own the flush/retry logic | ~$0 | Not worth the code |

Pattern: the Function `await`s `queue.send()` (milliseconds), returns; a consumer Worker inserts batches with `on conflict (occurred_at, id) do nothing` so retries are idempotent. Alert on the dead-letter queue.

Sources: Cloudflare ctx docs, workers-sdk discussion 14698, Workers platform pricing, Queues free-plan changelog 2026-02-04, Pipelines docs and billing changelog 2026-08-03, Analytics Engine limits.

## 3. Cold storage and backups

- **R2**: $0.015/GB-month, egress free, first 10 GB free [V]. Parquet with zstd compresses this row shape to ~40–60 bytes/row [E]; 100M rows ≈ 5 GB ≈ $0.08/month.
- **Monthly export**: a GitHub Actions job (session pooler, IPv4) runs `psql \copy … csv` → DuckDB `COPY TO 'events-2026-11.parquet' (FORMAT parquet, COMPRESSION zstd)` → `rclone copy` to R2. DuckDB reads it back with `CREATE SECRET (TYPE r2, …)` + `read_parquet('r2://bucket/*.parquet')` [V]. Pipelines can replace this job once it leaves beta.
- **Nightly `pg_dump`**: Free plan has **no backups at all**; Pro keeps 7 daily [V]. Supabase publishes a GitHub Actions backup workflow [V]. Use `--format=custom`, `set -o pipefail`, upload to a private R2 bucket, keep 30 dailies + 12 monthlies. Cost: pennies.
- **PITR**: $100/mo per 7 days and requires Small compute (+$15) [V]. Not justified for append-only events that can be rebuilt from Parquet.

Sources: R2 pricing, backupdrill on Supabase + GitHub Actions, DuckDB R2 guide, Supabase backups and CI backup docs.

## 4. Rollups

`analytics_daily` was rightly dropped on 2026-09-16 — nothing read it. Bring aggregates back **on evidence** (a Metabase question over 1–2 s), and when you do, prefer **incremental tables via pg_cron over materialized views**: `REFRESH MATERIALIZED VIEW` rescans everything; an incremental job inserts only closed days with `on conflict do update`, so a re-run is harmless. Four tables cover a directory: `daily_page`, `daily_market`, `daily_search`, `daily_referrer`. Single truth: rollups only for `day < current_date`, a watermark table records the last day rolled, and a weekly pg_cron job recomputes one random past day from raw and alerts on mismatch.

## 5. Legal retention shape

- **GDPR Art. 5(1)(e)** permits longer storage for statistical purposes with Art. 89 safeguards; pseudonymised data stays personal for whoever holds the key. **Swiss FADP** is the same. **CNIL's** consent-exempt analytics benchmark is the most concrete number anywhere: raw data ≤ 25 months, tracker ≤ 13 months [V].
- **EDPB Guidelines 02/2026 on anonymisation** (draft, consultation to 30 Oct 2026) adopt the CJEU *SRB* relative test: data is anonymous for a holder who cannot reasonably single out, link, or infer; the act of anonymising is itself processing needing an Art. 6 basis; aggregates are not automatically safe if outliers can be inferred [V]. Neither EDPB nor ICO blesses "delete the ID column and it's anonymous" by name; ICO's 2025 guidance says identifiability is a spectrum, assess and document [V].
- **Defensible pattern [E]:** make the daily hash key unrecoverable after 7 days; after 13 months null `visitor_id`, `session_id`, `page_view_id` and truncate `occurred_at` to the hour; keep everything else forever. Write a one-page re-identification assessment (path + country + device + hour cannot single out a person) and a line on the privacy page that anonymisation happens on legitimate interest. Residual risk: a rare path (one market, one hour, one country) is still a "record", not a person — acceptable and documented.
- **Buyer due diligence [E]:** a dedicated read-only Postgres role for Metabase (exists: `metabase_ro`); Metabase's own audit log is a paid feature, so enable **pgaudit** on Supabase for SELECT logging by that role; a data dictionary with the consent flag per row and the retention policy above. Under *SRB* the buyer of aggregates holds anonymous data, but the transparency duty to name recipient categories at collection time is yours.

Sources: CookieYes on FDPIC 2025, CNIL sheet 16, Freshfields and Sidley on EDPB 02/2026, RPC on ICO 2025 anonymisation guidance, Metabase users-roles docs.

## 6. Third-party tools behind consent

| Tool | Adds | Ownership / leak | Verdict |
|---|---|---|---|
| **Microsoft Clarity** | Free replay + heatmaps | Microsoft is an **independent controller**, uses the data for advertising and product improvement, 30-day retention [V] | **No.** A leak by design |
| **GA4 + BigQuery export** | Raw events in your GCP project, unsampled; 1M events/day export cap [V] | Ownership real, but opt-in consent required in EU/DE; DPF stands but under appeal [V] | Skip; adds nothing the pipeline lacks except Ads linkage |
| **PostHog EU (Frankfurt)** | Replay, heatmaps, Web Vitals, funnels; 1M events + 5,000 replays/mo free [V] | Processor, EU-hosted, exportable; beyond free ≈ $1,500/mo at 1M events/day [E] | **Yes, for replay only** on the consented subset; never as the event store |
| **Umami v3 self-host** | Replay + Web Vitals, MIT, Postgres-only [V] | Full ownership; needs a VPS (~$5–10/mo) | Later, if PostHog's terms change |
| **Cloudflare Web Analytics** | Free cookieless Core Web Vitals; unsampled 7 days then ~10% [V] | No export | Free glance, not a record |

Web Vitals field data is cheapest first-party: one `web_vitals` event per page view from the `web-vitals` library — a registry change, ~$0.

Sources: Clarity FAQ and privacy-disclosure docs, GA4 BigQuery export help, trustyourwebsite on GA4 and GDPR, flexprice on PostHog pricing, Umami v3.1.0 release, Cloudflare Web Analytics FAQ.

## Ranked recommendations

1. **Partition `analytics_events` by month now** (`primary key (occurred_at, id)`, pg_partman + pg_cron, BRIN on `occurred_at`, composite btrees per market/page_type/event). $0.
2. **Nightly `pg_dump` to a private R2 bucket from GitHub Actions**, with `pipefail` and a size check. Free plan has no backups. ~$0.05/mo.
3. **Cloudflare Queues in front of the insert** before the Germany launch; consumer Worker batches, idempotent insert, dead-letter alert. $5/mo (Workers Paid), ~$40/mo at 1M events/day.
4. **Monthly Parquet export to R2** (psql → DuckDB → rclone), later replaced by a Pipelines sink. ≤ $1/mo through 100M rows.
5. **Retention migration**: key unrecoverable at 7 days, identifier nulling + hour truncation at 13 months, a written re-identification assessment, two privacy-page sentences. $0.
6. **Add `web_vitals` to the event registry.** $0.
7. **Metabase on a read-only role + pgaudit**; data dictionary for future buyers. $0.
8. **PostHog EU for session replay** behind the existing consent, capped at the free tier. $0 until >5,000 replays/mo.
9. **Move to Supabase Pro when rows exceed ~300 MB or Germany launches** (7-day backups, 8 GB disk). $25/mo; Small compute (+$15) around 50M rows [E]. Skip PITR.
10. Do **not** adopt Clarity, GA4 or Analytics Engine as a store; do **not** reintroduce rollups until a Metabase question is measurably slow.
