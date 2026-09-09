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

---

## Search Console, by hand

The API route needs a Google Cloud project, which needs a credit card. The CSV
export gives the same numbers for free.

**Every Monday, or whenever you remember:**

1. Open <https://search.google.com/search-console> → `fynda.market` → **Performance**
2. Set the date range to **Last 7 days**
3. Top right: **Export** → **Download CSV** (a `.zip` lands in Downloads)
4. Unzip it — right-click → Extract All
5. Run this, pointing at the unzipped folder:

```bash
node scripts/import-gsc.mjs "C:/Users/delfi/Downloads/<folder>" --end=2026-09-06
```

`--end` is the **last day of the range you exported**. Leave it off and it uses
today, which is usually what you want.

Re-running the same export is safe — it overwrites rather than doubling.

### What to look at afterwards

In Metabase, ask for `search_console_last_two_imports`. One row per page type,
this import against the last:

```
city      1203 ->   410 impressions   -65.9%
market     388 ->   402 impressions    +3.6%
home       540 ->   551 impressions    +2.0%
```

**A page type falling while the others hold is the thing to act on.** That
pattern — one page type collapsing on its own — is what fleafind's traffic did
before anyone noticed, and nobody was watching for it.

Query rows come in from the same export and are kept, but they carry no page,
so they are deliberately left out of that comparison. They are worth reading on
their own: v1's most valuable finding was that explicit-date searches
(`flohmarkt 13.9.26`) converted at seven times the site average.

### The one limit

Google keeps **16 months** and will not backfill further. Whatever you have not
exported by then is gone for good, so the habit matters more than the schedule.

---

## The two queues a person has to answer

Since 2026-09-09 the site's forms write rows rather than opening a mail
program. A submission pings Telegram once, and a Telegram message is a doorbell,
not a list — it is seen or it is missed. These two questions are the list.

**Make them both, pin them to a dashboard, and look at it weekly.** A report
nobody reads is worse than no report form, because the person who sent it
believes somebody is checking.

### Open reports

```sql
select r.submitted_at::date as sent,
       r.report_type,
       coalesce(m.slug, '— unmatched —') as market,
       r.market_text as they_typed,
       r.note,
       r.email,
       r.locale
  from public.reports r
  left join public.markets m on m.id = r.market_id
 where not r.resolved
 order by r.submitted_at desc;
```

`market_id` is null when the report came from the footer form and named a
market in words. Those are the ones needing a human to match them; everything
from a market page arrives already attached. Closing one is
`update public.reports set resolved = true, resolved_at = now(), resolver_note = '…' where id = '…'`.

### Organiser claims waiting for an answer

```sql
select c.created_at::date as sent,
       c.organiser_name,
       c.email,
       coalesce(m.slug, '— unmatched —') as market,
       c.market_text as they_typed,
       c.town,
       c.message,
       c.locale
  from public.organiser_claims c
  left join public.markets m on m.id = c.market_id
 where not c.handled
 order by c.created_at desc;
```

This one decays. Somebody has offered to become the source of truth for a
market and is waiting to hear back, and a fortnight's silence is the answer
they will remember. `handled` is set by hand, with `handler_note` for what was
agreed.

