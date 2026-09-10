-- The two queues, as tables Metabase can actually open.
--
-- PLAN.md "Next, in order" 3: a report lands in a row and pings Telegram, and
-- a Telegram message is a doorbell, not a list. Something has to hold the list.
--
-- ---------------------------------------------------------------------------
-- Why a view and not a saved question
--
-- metabase/README.md already carried both queries as SQL to paste. That is a
-- question saved in a Docker volume on one laptop: it is not in this repo, it
-- is not reviewed, and it dies with the volume. A view is the query, versioned
-- here, and it turns the weekly look into clicking a table name rather than
-- finding a document and pasting from it. The friction is the whole problem —
-- a queue nobody opens is worse than no form at all, because the person who
-- sent it believes somebody is reading.
--
-- ---------------------------------------------------------------------------
-- Why metabase_ro may read these and still not read `reports`
--
-- 20260906093000 revoked SELECT on `reports` from the dashboard role, on the
-- grounds that it holds whatever a visitor typed into a form. That was written
-- when the only reports imagined were ours and nothing on the site could
-- create one. Since 20260909120000 the report form is the front end of the
-- freshness claim — the queue exists to be read, by a person, weekly — so the
-- rule as written now blocks the thing it was protecting.
--
-- The change is the narrowest one that unblocks it: the base table stays
-- revoked, and this view is the window. A view runs with its owner's
-- privileges, so granting SELECT here does not grant it there — an ad-hoc
-- browse of every report ever filed is still refused, and what the dashboard
-- can see is exactly the open queue and the fields needed to answer it.
--
-- The reporter's e-mail is one of those fields. There is no version of
-- answering a report that does not involve writing back to the person who
-- sent it, and it is optional on the form precisely because we ask for it only
-- to reply. `reporter_ip_hash` is not here: it is a spam control, not part of
-- the answer.
--
-- CLAUDE.md's rule for this: say what the rule protected against, why that is
-- outweighed, doc and config in the same commit. metabase/README.md changes
-- with this file.

begin;

/* ---------------------------------------------------------------------------
 * Open reports
 *
 * `market` is null when the report came from the footer form and named its
 * market in words. Those are the rows a human has to match; anything sent from
 * a market page arrives already attached. `they_typed` is kept either way —
 * it is the evidence, the id is our reading of it.
 * ------------------------------------------------------------------------- */

create or replace view public.open_reports as
  select
    r.id,
    r.submitted_at::date                          as sent,
    (current_date - r.submitted_at::date)         as waiting_days,
    r.report_type,
    m.slug                                        as market,
    r.market_text                                 as they_typed,
    r.note,
    r.email,
    r.locale,
    r.source_path,
    r.submitted_at
  from public.reports r
  left join public.markets m on m.id = r.market_id
  where not r.resolved
  order by r.submitted_at desc;

comment on view public.open_reports is
  'Reports nobody has answered. A null market is a row for a human to match. Close one with: update public.reports set resolved = true, resolved_at = now(), resolver_note = ''…'' where id = ''…'';';

/* ---------------------------------------------------------------------------
 * Open organiser claims
 *
 * This queue decays in a way the other one does not. Somebody has offered to
 * become the source of truth for a market and is waiting to hear back, and a
 * fortnight's silence is the answer they will remember — so `waiting_days` is
 * the column to sort on, not the date.
 * ------------------------------------------------------------------------- */

create or replace view public.open_organiser_claims as
  select
    c.id,
    c.created_at::date                            as sent,
    (current_date - c.created_at::date)           as waiting_days,
    c.organiser_name,
    c.email,
    m.slug                                        as market,
    c.market_text                                 as they_typed,
    c.town,
    c.message,
    c.locale,
    c.source_path,
    c.created_at
  from public.organiser_claims c
  left join public.markets m on m.id = c.market_id
  where not c.handled
  order by c.created_at desc;

comment on view public.open_organiser_claims is
  'Organisers waiting for an answer. Sort by waiting_days, not by date. Close one with: update public.organiser_claims set handled = true, handled_at = now(), handler_note = ''…'' where id = ''…'';';

/* ---------------------------------------------------------------------------
 * Access
 *
 * Explicit, not inherited. `alter default privileges` covers tables created
 * after 20260906093000 and it covered organiser_claims, which is how a table
 * carrying names and addresses reached the dashboard without anyone deciding
 * it should. Naming the grant here is the decision being written down.
 * ------------------------------------------------------------------------- */

grant select on public.open_reports to metabase_ro;
grant select on public.open_organiser_claims to metabase_ro;

commit;
