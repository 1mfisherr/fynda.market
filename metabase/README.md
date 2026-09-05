# Metabase, locally

The dashboard runs on this machine only. Nothing is hosted, nothing is paid for,
and no data leaves Supabase except into this container while it is running.

## Start it

```
docker compose -f metabase/docker-compose.yml up -d
```

First start takes a couple of minutes — it is building its own notebook
database. Then open **http://localhost:3000**.

## Stop it

```
docker compose -f metabase/docker-compose.yml down
```

Your questions and dashboards survive; they live in a Docker volume, not in the
container.

## Connecting it to Fynda's data — once, on first run

Metabase asks for a database on the setup screen. Use **Add a database** →
PostgreSQL, and these values:

| Field | Value |
|---|---|
| Display name | Fynda |
| Host | `aws-1-eu-west-1.pooler.supabase.com` |
| Port | `5432` |
| Database name | `postgres` |
| Username | `metabase.jmaxajzmorxudbabneby` |
| Password | see `metabase-password.txt` in the repo root |
| Use a secure connection (SSL) | **on** |
| Schemas | `public` only |

Two of those matter more than they look:

**Port 5432, not 6543.** Supabase offers two poolers. The one on 6543 does not
support prepared statements, which Metabase's driver relies on — it fails in a
way that looks like a broken password. Session mode, 5432.

**Schemas: `public` only.** Supabase's `auth` schema holds login records and
password hashes. There is no reason for a dashboard to see it, so it is not
offered it.

## What this login can and cannot do

It is `metabase_ro`: read-only, forever. It cannot insert, update or delete
anything. It cannot read `market_private` (organiser emails, admin notes) or
`reports` (whatever a visitor typed into a form). Personal data does not reach
a dashboard.

## Files you must not commit

- `metabase-password.txt` — the database password
- `metabase/.env` — the key that encrypts it inside Metabase

Both are gitignored. If `metabase/.env` is lost, Metabase can no longer read
its own saved connection and it has to be entered again.

## Upgrading

Don't, casually. The image is pinned to the long-term release, supported until
February 2027. Major versions must be stepped through one at a time and they
rewrite the notebook schema. There is no reason to move until then.
