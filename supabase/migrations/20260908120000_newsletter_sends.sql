-- One row per subscriber per issue. The thing that makes the digest safe to
-- re-run.
--
-- A weekly send is a job that reads a list, calls a mail provider a hundred
-- addresses at a time, and can die at any point in between — a timeout, a
-- rate limit, a machine going away. Whatever it does, running it again must
-- not mail anyone twice. Nothing else in this schema needs that property, and
-- no amount of care in the script provides it: only the database can, and only
-- by refusing the second write.
--
-- So the unique constraint below is the guarantee, and the script inserts
-- *before* it sends. That ordering is deliberate and it is the pessimistic
-- one: if a send fails after the row is written, that subscriber misses one
-- issue. The alternative — send first, record after — turns the same failure
-- into the same person receiving the same e-mail twice, which costs a spam
-- complaint, and spam complaints are the one number that decides whether any
-- of our mail arrives at all.
--
-- Missing an issue is recoverable. Being marked as spam is not.

begin;

create table public.newsletter_sends (
  subscriber_id uuid not null
    references public.newsletter_subscribers (id) on delete cascade,

  -- The Friday the issue belongs to, not the moment it went out. A job that
  -- runs late, or is re-run on the Saturday to catch the rest, is still the
  -- same issue and must not send again.
  issue_date    date not null,

  sent_at       timestamptz not null default now(),

  -- How many markets that subscriber's issue carried. Cheap to store and the
  -- only way to tell "nobody opened it" from "there was nothing in it", which
  -- are the same number and completely different problems.
  markets       integer not null default 0,

  primary key (subscriber_id, issue_date)
);

comment on table public.newsletter_sends is
  'One row per subscriber per issue, written before the send. The primary key is what makes the weekly job safe to re-run.';

-- "Who still needs this issue" is the query the job runs for every batch.
create index newsletter_sends_issue_idx
  on public.newsletter_sends (issue_date desc);

/* ---------------------------------------------------------------------------
 * When we last wrote to someone
 *
 * `sent_count` on the subscriber says how many issues an address has had;
 * this says when the last one was. Together they answer "is this list being
 * mailed" without a join.
 *
 * Deliberately NOT added here: last_opened_at and last_clicked_at. A sunset
 * policy — stop after 90 days of silence, remove after 180 — is what protects
 * a sender's reputation, and it needs to know whether anyone read anything.
 * We cannot know that yet: it arrives as a webhook from Resend, which is a
 * build of its own. Columns that nothing can write are the same mistake as a
 * table column reserved for facts we do not hold, so they wait for the
 * webhook and arrive with it.
 * ------------------------------------------------------------------------- */

alter table public.newsletter_subscribers
  add column if not exists last_sent_at timestamptz;

comment on column public.newsletter_subscribers.last_sent_at is
  'When the last issue went out to this address. Open and click history waits on the Resend webhook.';

/* ---------------------------------------------------------------------------
 * Access
 *
 * Same as the list itself: row-level security on, no policy, nobody granted
 * anything. The digest job connects as the database owner over the pooler,
 * not through PostgREST, so it needs no grant here — and the service role the
 * signup endpoint uses has no business reading who was mailed.
 * ------------------------------------------------------------------------- */

alter table public.newsletter_sends enable row level security;

revoke all on public.newsletter_sends from anon, authenticated;

commit;
