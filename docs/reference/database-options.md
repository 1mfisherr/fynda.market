# Database + auth research — verified 2026-08-29

Salvaged from a sub-agent of the architecture research run (parent agent died on spend limit).
Vendor-page sourced unless flagged UNVERIFIED.

## Headline conclusions

1. **Supabase + PostGIS is confirmed sound.** No reason found to move off it.
2. **Cloudflare D1 is disqualified** — no geospatial support at all (no R*Tree, Geopoly, SpatiaLite). Radius search is a core feature, so D1 cannot be the primary store.
3. **Data volume is a non-issue.** 20k markets + 500k–1M occurrence rows/year is ~0.2–0.5 GB. Fits Supabase Pro's included 8 GB for years. The scaling worry is misplaced here.
4. **Supabase free tier pauses after 7 days of low activity** → must be Pro ($25/mo) once live.
5. **Workers → Supabase should go over HTTP (PostgREST/RPC), not TCP.** Radius query lives in a Postgres function, called via RPC. No pooling problem, no TCP limits.
6. **Zurich region (`eu-central-2`) exists on Supabase.** Neon has no Zurich (Frankfurt/London only).

## Supabase — https://supabase.com/pricing

Free: 500 MB db, 5 GB egress, 1 GB storage, 50k auth MAU, 2 projects, **pauses after 7 days idle** (restorable up to 1 year — https://supabase.com/docs/guides/platform/free-project-pausing).

Pro $25/mo: 8 GB db then $0.125/GB, 250 GB egress then $0.09/GB, 100 GB storage, 100k MAU then $0.00325/MAU. Includes $10 compute credit = one Micro instance.

Compute: Micro $10 (1 GB RAM, 60 direct / 200 pooler conns), Small $15 (2 GB), Medium $60 (4 GB), Large $110 (8 GB), XL $210 (16 GB).

Add-ons: custom domain $10/mo, PITR $100/mo per 7 days retention, image transforms $5/1000 beyond 100 origin images.

Disk: gp3, 8 GB included, $0.125/GB beyond, 3000 IOPS / 125 MB/s baseline.

EU regions — https://supabase.com/docs/guides/platform/regions:
eu-west-1 Ireland, eu-west-2 London, eu-west-3 Paris, eu-central-1 Frankfurt, **eu-central-2 Zurich**, eu-north-1 Stockholm.

PostGIS — https://supabase.com/docs/guides/database/extensions/postgis:

    create extension postgis with schema "extensions";

MUST be in the `extensions` schema. **Not relocatable after creation** (PostGIS ≥ 2.3) — get it right first time or drop and recreate. Docs example uses `geography(POINT)` + GiST index + KNN `<->` ordering. Write the `ST_DWithin` radius variant yourself.

UNVERIFIED: exact PostGIS version. Third-party says 3.3.7. Run `select postgis_version();`.

Auth — https://supabase.com/docs/guides/auth/architecture: a GoTrue fork, an **HTTP API server**, so it works from Cloudflare Workers with no TCP socket. Auth data lives in the `auth` schema in your own database. MAU = distinct users who log in OR refresh a token during the cycle.

Reliability: 12 Feb 2026 outage, us-east-2, **3h42m**, all services down. Cause: an internal deploy enabled AWS VPC Block Public Access region-wide. https://supabase.com/blog/supabase-incident-on-february-12-2026 — Late Aug 2026: elevated latency / 525s per status.supabase.com.

Connections — https://supabase.com/docs/guides/database/connecting-to-postgres:
5432 direct (persistent servers) · 5432 Supavisor session (IPv4-only networks) · **6543 Supavisor transaction (serverless/edge) — no prepared statements**. The IPv4 add-on is not dual-stack: it swaps the AAAA record for an A record.

## Neon — https://neon.com/pricing

Free 0.5 GB/project, 100 CU-hours. Launch/Scale pay-as-you-go, $0.106/$0.222 per CU-hour, storage $0.35/GB-month, no monthly minimum. Scale-to-zero after 5 min.

**Newer PostGIS than Supabase**: 3.5.0 (PG17) / 3.6.0 (PG18), plus native `h3`, `h3_postgis` and `pgrouting` — https://neon.com/docs/extensions/pg-extensions

**EU: Frankfurt + London only. No Zurich. Region is fixed per project and cannot be changed.**

Neon Auth = Managed Better Auth, **Beta**. Edge-runtime support UNVERIFIED.

Acquired by Databricks May 2025 (~$1B). Claimed post-acquisition price cuts are UNVERIFIED (third-party sources only); the current live prices above are verified.

## Cloudflare D1 — DISQUALIFIED

https://developers.cloudflare.com/d1/platform/limits/

Max db size **10 GB paid / 500 MB free**. 100 columns per table max. 1000 queries per Worker invocation. Free: 5M rows read/day, 100k written/day.

**No geospatial.** R*Tree, Geopoly, SpatiaLite all unsupported. Open issues: workers-sdk#2833, #9324. Only workaround is `reearth/kenro` (Rust/WASM), UNVERIFIED as production-viable.

## Cloudflare Hyperdrive — free, and makes TCP Postgres viable

https://developers.cloudflare.com/hyperdrive/ — **free on both Workers plans**, no egress charge. Connection pooling + query caching. 100k queries/day on Workers Free, unlimited on Paid. Names Neon and PlanetScale explicitly. **Supabase is not named** — should work as generic Postgres, UNVERIFIED.

Workers TCP `connect()` — https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/ — Cloudflare steers you to Hyperdrive instead. Sockets cannot be created in global scope or shared across requests, so every request pays setup cost without pooling.

Workers pricing: Free 100k req/day, 10 ms CPU. Paid min $5/mo, 10M req then $0.30/M, 30M CPU-ms then $0.02/M. **Static assets free and unlimited. No egress charges.**

## Also evaluated, not recommended

- **Turso / libSQL**: no geospatial found. Rust rewrite still 0.x beta (v0.7.0, Jul 2026), no GA. Jan 2025 removed edge replicas, multi-db schemas and ATTACH for new users.
- **PlanetScale**: **no free tier** (Hobby killed Mar 2024, never returned). Postgres GA Sep 2025. Non-HA PS-5 from ~$5/mo, HA 3-node from $15/mo. PostGIS availability UNVERIFIED.

## Auth options

- **Better Auth** — MIT, free, self-hosted against your own database, no per-MAU fee. Works on Workers with the `nodejs_compat` flag (uses AsyncLocalStorage). The `better-auth-cloudflare` community package covers Workers + D1 + Hyperdrive + KV + R2. **Auth.js merged into it Sep 2025; Neon built its managed auth on it.** Strongest strategic signal of the options.
- **Supabase Auth** — already in the stack, HTTP-based, Workers-compatible, 100k MAU on Pro.
- **Clerk** — free 50,000 **MRU** (monthly *retained* user: only counts once they return ≥24h after signup — materially cheaper than MAU models). Then $0.02/MRU. Pro $25/mo removes branding. Workers-supported via `@clerk/backend`, networkless JWT verification via `jwtKey`.
- **WorkOS AuthKit** — **first 1M MAU free**, the most generous tier. SSO $125/connection/mo. Workers compatibility UNVERIFIED.
- **Auth0** — free 25k MAU, then expensive ($3,500/mo at 50k). No reason to choose it here.
- **Lucia — DEPRECATED Mar 2025.** Now a learning resource, not a library. Do not adopt.

## Radius search options

- **PostGIS `ST_DWithin` + GiST** — the default. At 20k market rows this is a sub-millisecond index scan. All published benchmarks showing dramatic gains are at *millions* of rows; UNVERIFIED at 10k–100k specifically, because nobody bothers to benchmark it that small.
- **`cube` + `earthdistance`** — in-core Postgres, no extension install. `earth_box()` for the indexed narrowing pass, then an exact `earth_distance` check. Assumes a perfect sphere (0.3–0.5% error — irrelevant at 30 km). Postgres' own docs point at PostGIS if that is not good enough.
- **Bounding box + haversine** — works anywhere including SQLite. Watch longitude shrink with latitude: `delta_lon = radius_km / (111.32 * cos(lat))`.
- **H3** — native on Neon. ~78% faster than ST_DWithin in a 2022 benchmark, but gives approximate hex rings, not exact radii. Analytics-first.
- **Geohash** — treats Earth as flat, degrades at the poles, boundary problem. Loses to GiST.

**Verdict: geometry lives on the market (small, static). Occurrences are filtered by market_id + date range, never spatially. So the spatial table never grows. This is not a performance problem.**

## UNVERIFIED list

Supabase PostGIS version · Hyperdrive + Supabase · Neon's pre-acquisition price deltas · Turso GA status · Turso geospatial (absence not vendor-confirmed) · PostGIS on PlanetScale · WorkOS on Workers · Neon Managed Better Auth edge support · Clerk's Feb 2026 tier-change date · ST_DWithin benchmarks at 10k–100k rows · Kenro production viability
