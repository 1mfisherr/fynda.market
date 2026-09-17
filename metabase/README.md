# Metabase, locally

The dashboard runs on this machine only. Nothing is hosted, nothing is paid for,
and no data leaves Supabase except into this container while it is running.

## Start it

```
docker compose -f metabase/docker-compose.yml up -d
```

First start takes a couple of minutes — it is building its own notebook
database. Then open **http://localhost:3000**.

## The dashboards

Six, in the **fynda.market** collection: Visitors · Pages & markets · Bots & AI · Google · Organisers & newsletter · Engagement & health. Built by `python metabase/dashboards.py`, which is the only place they are edited — it deletes and rebuilds the collection, so a change is a change in that file. Every question is plain SQL with a one-line description under its title.

**Bots.** Dashboards 1 and 2 have a **Bots** filter at the top. It is `false` by default, which means *people only*. Set it to `true` for the bots alone, or clear it for everything. The verdict per visitor per day comes from the view `analytics_visitor_days` (rules in `supabase/migrations/20260917100000_analytics_bot_flag.sql`); 80–90% of raw page views so far were crawlers.

**The helper login.** `claude@fynda.local` is an admin user that exists only in this container, created 2026-09-17 so the dashboards could be built without Delfim at the keyboard. Its password and a session token are in `.env.local`. Delete it under Admin → People whenever you like; the script needs a fresh `METABASE_SESSION` after that (log in as anyone, copy the `metabase.SESSION` cookie).

## What happened to the mail

`newsletter_delivery` is a view: one row per Friday issue with sent, delivered, opened, clicked, bounced and complained counts. It fills in once Resend's webhook is switched on (`docs/PLAN.md`). Opens undercount — a mail client that blocks images never records one.

## Stop it

```
docker compose -f metabase/docker-compose.yml down
```

Your questions and dashboards survive; they live in a Docker volume, not in the
container.

## Connecting it to the database — once, on first run

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
`reports` (whatever a visitor typed into a form).

**It does see personal data, and that is deliberate in three places.**

- `newsletter_subscribers` — every address, with the page it was signed up
  from. There is no useful newsletter question that does not read this table.
- `organisers` — the organiser's e-mail address, since the organiser mail
  exists. `organiser_links`, `organiser_mail_sends` and `organiser_edits` are
  revoked; `organiser_funnel` is the view for the answer rate.
- `open_reports` and `open_organiser_claims` — the two queues below. The base
  `reports` table is still revoked; the view is the window, because a view runs
  with its owner's rights and grants nothing on what it reads. The reporter's
  address is in it because answering a report means writing back to them.

What that means in practice: this dashboard is on one laptop, behind a login,
and it is a place personal data reaches. It is not a screen to share.

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
not a list — it is seen or it is missed. These two are the list.

They are **views in the database**, not SQL to paste: `open_reports` and
`open_organiser_claims`. Both are defined in
`supabase/migrations/20260910190000_triage_views.sql`, which is where to change
them — a question saved only inside Metabase lives in a Docker volume on one
laptop and is reviewed by nobody.

**Build the dashboard once, then look at it weekly.** A report nobody reads is
worse than no report form, because the person who sent it believes somebody is
checking.

### Building it, once

1. **+ New** → **Question** → **Raw Data** → **Fynda** → `Open Reports`
2. **Save**, and when it offers, **Yes please** to add it to a new dashboard
   called **Queue**
3. Same again for `Open Organiser Claims`, saved onto the same dashboard
4. On the dashboard: **⋮ → Edit** → the bell icon → **Set up an alert** →
   *when this has results* → **daily**. That is the part that means you do not
   have to remember to look.

### Open reports

`market` is null when the report came from the footer form and named a market
in words. Those are the ones needing a human to match them; everything sent
from a market page arrives already attached, and `they_typed` is kept either
way — it is the evidence, the id is our reading of it.

Closing one, as the owner (Metabase cannot write):

```sql
update public.reports
   set resolved = true, resolved_at = now(), resolver_note = '…'
 where id = '…';
```

Nothing on the site changes because a report arrived. A person checks it, and
only then does the market page move. That is the whole difference between a
freshness stamp and a comment box.

### Organiser claims waiting for an answer

Sort this one by `waiting_days`, not by date. It decays: somebody has offered
to become the source of truth for a market and is waiting to hear back, and a
fortnight's silence is the answer they will remember.

```sql
update public.organiser_claims
   set handled = true, handled_at = now(), handler_note = '…'
 where id = '…';
```

### If both are empty, check they can fill

The endpoints behind them were dead from 2026-09-09 to 2026-09-10 — the
migration that creates the tables had never been applied, so every report and
every claim submitted in that window was refused and lost. An empty queue and a
broken queue look identical from here. Posting one row to the live site is the
only way to tell them apart:

```bash
curl -X POST https://fynda.market/r -H 'content-type: application/json' -H 'accept: application/json' -d '{"markt":"TEST - delete me","grund":"other","path":"/de/"}'
```

Then read `open_reports`, and delete the row.

