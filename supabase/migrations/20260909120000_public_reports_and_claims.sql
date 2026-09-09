-- The two forms that still opened a mail program now write rows.
--
-- PLAN.md "Make the remaining forms real". A cancellation nobody can report is
-- the truth loop stalled: the report button is the front end of the one thing
-- this site sells, and until now it handed the visitor to their mail client,
-- which is where a report goes to die.
--
-- ---------------------------------------------------------------------------
-- Why `reports.market_id` becomes nullable
--
-- The table was designed for a report that already knows its market, because
-- the only reports imagined were ours. A report from a visitor does not know
-- it. Two cases, and both have to be storable:
--
--   * From a market page, the market travels in the query and we resolve it.
--   * From the footer, someone types "the flea market by the lake in Zürich".
--
-- A NOT NULL market_id means the second one cannot be saved at all -- so the
-- endpoint would have to either drop it or invent a match. Dropping a report
-- because we could not parse it is the exact opposite of the point, and a
-- wrong match is worse than none: it would attach a cancellation to a market
-- that is running.
--
-- So market_id is nullable and `market_text` -- what the person actually typed
-- -- is always kept, even when the id resolved. It is the evidence; the id is
-- our reading of it. A row with a null id is a row for a human to match, which
-- is what `reports_unmatched_idx` is for.
--
-- One queue, not two. A separate "submissions" table promoted into `reports`
-- after triage would be the more orthodox shape and it is the wrong trade at
-- 157 markets: it doubles the places to look for an unanswered report, which
-- is the failure that actually matters here.

begin;

/* ---------------------------------------------------------------------------
 * reports -- now reachable from the website
 * ------------------------------------------------------------------------- */

alter table public.reports
  alter column market_id drop not null;

alter table public.reports
  -- What the reporter called the market. Always present, id or no id.
  add column market_text text,

  -- Optional, and the form says so. A report is worth having without a way to
  -- reply; demanding an address costs more reports than it gains answers.
  add column email text,

  -- Which language the form was in, so a reply can be written in it.
  add column locale text check (locale is null or locale in ('de', 'fr', 'it', 'en')),

  -- Which page it came from. Answers "do the market pages produce reports, or
  -- only the footer form" without a second analytics event.
  add column source_path text check (source_path is null or source_path ~ '^/'),

  -- Same hashing as the analytics collector and the signup: never an IP.
  add column reporter_ip_hash text
    check (reporter_ip_hash is null or reporter_ip_hash ~ '^[0-9a-f]{64}$');

-- Something has to identify the market, or the row says nothing at all.
alter table public.reports
  add constraint reports_identifies_a_market
  check (market_id is not null or nullif(btrim(market_text), '') is not null);

-- The triage queue: open reports we could not attach to a market.
create index reports_unmatched_idx
  on public.reports (submitted_at desc)
  where not resolved and market_id is null;

comment on column public.reports.market_text is
  'What the reporter typed. Kept even when market_id resolved -- it is the evidence, the id is our reading of it.';

/* ---------------------------------------------------------------------------
 * organiser_claims -- "this is my market"
 *
 * Its own table rather than a report, because it is not one. A report says a
 * fact is wrong; a claim says a person exists and will answer for a market
 * from now on. They are triaged by different people, they resolve differently,
 * and only one of them ends in a relationship -- which is the thing PRODUCT.md
 * calls the moat.
 * ------------------------------------------------------------------------- */

create table public.organiser_claims (
  id             uuid primary key default gen_random_uuid(),

  -- Resolved from the market page the claim came from. Null when the organiser
  -- arrived through the footer and typed the name themselves.
  market_id      uuid references public.markets (id) on delete set null,
  market_text    text not null,
  town           text,

  -- Who is claiming it. Both required by the form: a claim with no way to
  -- answer it is not a claim.
  organiser_name text not null,
  email          text not null,
  message        text,

  locale         text not null check (locale in ('de', 'fr', 'it', 'en')),
  source_path    text check (source_path is null or source_path ~ '^/'),
  claim_ip_hash  text check (claim_ip_hash is null or claim_ip_hash ~ '^[0-9a-f]{64}$'),

  created_at     timestamptz not null default now(),

  -- Deliberately not a status enum. A claim is answered or it is not, and the
  -- note is where "spoke to them, they also run the Winterthur one" goes.
  handled        boolean not null default false,
  handled_at     timestamptz,
  handler_note   text,

  constraint organiser_claim_email_shape
    check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint organiser_claim_email_lowercase
    check (email = lower(email))
);

-- The only question asked of this table: what have I not answered yet.
create index organiser_claims_open_idx
  on public.organiser_claims (created_at desc)
  where not handled;

-- The second question, once there are enough of them: who claimed this market.
create index organiser_claims_market_idx
  on public.organiser_claims (market_id)
  where market_id is not null;

comment on table public.organiser_claims is
  'Organisers asking for their own market page. Open = not handled. The start of the organiser relationship, so nothing here is ever deleted.';

/* ---------------------------------------------------------------------------
 * Access
 *
 * Same posture as newsletter_subscribers: row-level security on with no policy
 * granting anyone anything, so a row is unreachable from the public internet.
 * Only the Pages Functions write, using the service role key, which bypasses
 * RLS -- but still needs a plain table GRANT, which is the thing that made
 * every newsletter signup fail with "save failed" until it was found by
 * posting to the live endpoint. Same mistake, not made twice.
 *
 * SELECT alongside INSERT because PostgREST refuses a returning insert without
 * it, and the endpoints ask for the row back to put an id in the Telegram
 * message. No UPDATE and no DELETE: nothing the public sends is edited or
 * removed by a Function. Triage happens as the owner.
 * ------------------------------------------------------------------------- */

alter table public.organiser_claims enable row level security;

revoke all on public.organiser_claims from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert on public.reports to service_role;
grant select, insert on public.organiser_claims to service_role;

/*
 * And SELECT on markets, which is not incidental.
 *
 * /r and /o check the market id that arrives in the query string before
 * writing it, because a bad id would fail the insert on its foreign key and
 * take the whole report with it. That check reads public.markets as the
 * service role -- and grants in this schema are explicit per table, so without
 * this line the check would be refused, quietly answer "no such market", and
 * every report sent from a market page would land in the unmatched queue with
 * its market id thrown away.
 *
 * Nothing would have looked broken. The form would say thank you, the row
 * would be there, and the one thing that makes the report useful without a
 * human reading it would be missing. This is the same missing GRANT that made
 * every newsletter signup fail in September, found by reading rather than by
 * losing reports for a fortnight.
 *
 * SELECT only, and only this table. The site's own build reads the database as
 * the owner and is unaffected either way.
 */
grant select on public.markets to service_role;

commit;
