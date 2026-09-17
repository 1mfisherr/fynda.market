# Analytics research, 2026-09-17

Three independent reports written the same day, before any change was decided. Read one only for a specific fact; the decisions, once made, live in `STACK.md` §Analytics and `PLAN.md`.

| File | Lens |
|---|---|
| `collect.md` | What to measure: what mature tools capture that we do not, AI-crawler and AI-referrer tracking, the domain signals a directory needs, the free Cloudflare edge fields, the ten weekly questions |
| `monetise.md` | The dataset as a product: who buys event data and at what price, which asset is worth more, what GDPR and the Swiss FADP require now so the door stays open, database rights, cautionary tales |
| `store.md` | Storage and retention: Postgres at 100 → 1M rows/day, partitioning, Queues in front of the insert, Parquet on R2, backups, rollups, a defensible keep-forever pattern, GA4/Clarity/PostHog verdicts |

Checked against the live table the same day: 3,713 rows, 1.6 MB; the bot filter passed distributed scraper farms (874 one-hit "visitors" on 14 Sept; ~430 views of the four report-form pages against 2 real opens); page views from the edge carry no session id; the daily hash key is `ANALYTICS_SALT + date` with a permanent salt, so rows are pseudonymous for as long as the salt exists; the privacy page already says patterns "describe crowds, not people" and may be used commercially.
