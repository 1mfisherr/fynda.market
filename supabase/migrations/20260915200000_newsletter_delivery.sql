-- What happened to each issue after it left.
--
-- Until now the send was the last thing we knew. Resend can tell us the rest
-- through a webhook (functions/w.ts): delivered, opened, clicked, bounced,
-- complained. Two reasons to want it, in order:
--
--   1. Deliverability. A hard bounce or a spam complaint is an address that
--      must never be written to again, and a list that keeps writing to them
--      is how a sender gets its whole domain filtered. Both now suppress the
--      subscriber the same way the unsubscribe link does.
--   2. A sunset policy. Addresses that never open anything drag the sender's
--      reputation down; knowing the last open is what lets one be retired
--      later. Not built yet — the data has to exist first.
--
-- The stamps on newsletter_sends answer the per-issue question in one row;
-- newsletter_events keeps every event as Resend sent it, keyed on Svix's
-- delivery id, which is also what makes a redelivered webhook harmless.
begin;

alter table public.newsletter_sends
  add column if not exists email_id     text,
  add column if not exists delivered_at timestamptz,
  add column if not exists opened_at    timestamptz,
  add column if not exists clicked_at   timestamptz,
  add column if not exists bounced_at   timestamptz,
  add column if not exists complained_at timestamptz;

comment on column public.newsletter_sends.email_id is
  'Resend''s id for the mail, from the batch response. The webhook joins on it.';
comment on column public.newsletter_sends.opened_at is
  'First open. Later opens are in newsletter_events. An open is a loaded image, so a client that blocks images never records one.';

create index if not exists newsletter_sends_email_id_idx
  on public.newsletter_sends (email_id);

create table public.newsletter_events (
  svix_id     text primary key,
  email_id    text not null,
  type        text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  link        text,
  payload     jsonb not null
);

comment on table public.newsletter_events is
  'Every Resend webhook event about a mail we sent, as received. The primary key is Svix''s delivery id: a webhook delivered twice inserts once.';

create index newsletter_events_email_id_idx on public.newsletter_events (email_id);

alter table public.newsletter_events enable row level security;
revoke all on public.newsletter_events from anon, authenticated;

-- The webhook writes as the service role: an event row, the stamps on the
-- send, and — on a hard bounce or a complaint — the suppression on the
-- subscriber, which the unsubscribe function already has the right to write.
grant select, insert on public.newsletter_events to service_role;
grant select, update on public.newsletter_sends to service_role;

-- The dashboard may read what happened to the mail. Neither table carries an
-- address: the send row is keyed on the subscriber id, and the event payload
-- carries the address only inside `to`, so the view below leaves payload out.
create or replace view public.newsletter_delivery as
  select s.issue_date,
         count(*)                                    as sent,
         count(s.delivered_at)                       as delivered,
         count(s.opened_at)                          as opened,
         count(s.clicked_at)                         as clicked,
         count(s.bounced_at)                         as bounced,
         count(s.complained_at)                      as complained
    from public.newsletter_sends s
   group by s.issue_date
   order by s.issue_date desc;

grant select on public.newsletter_delivery to metabase_ro;

commit;
