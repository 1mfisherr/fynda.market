-- "Less often" and "pause", instead of the door.
--
-- The unsubscribe page was a dead end: one click and the address was gone for
-- good, with nothing between "every Friday" and "never". Most people who reach
-- that page are not angry, they are tired — the mail is fine, it is just one
-- too many this month. Two ways to stay, each a preference on the row:
--
--   cadence       'weekly' (every Friday) or 'monthly' (the first Friday)
--   paused_until  no mail before this date; null means not paused
--
-- Both are read by scripts/send-digest.mjs and written by functions/u.ts,
-- which is the only place a person can reach without a login: the same
-- unsubscribe token authenticates the choice, because a token that can end a
-- subscription can certainly make it quieter.
--
-- The one-click unsubscribe that mail clients send (RFC 8058) still
-- unsubscribes outright. The alternatives are offered only on the page a
-- person actually looks at.
begin;

alter table public.newsletter_subscribers
  add column if not exists cadence text not null default 'weekly'
    constraint newsletter_subscribers_cadence_check check (cadence in ('weekly', 'monthly')),
  add column if not exists paused_until date;

comment on column public.newsletter_subscribers.cadence is
  'weekly: every Friday issue. monthly: only the first Friday of the month. Chosen on the unsubscribe page.';
comment on column public.newsletter_subscribers.paused_until is
  'No issue is sent before this date. Set by "pause" on the unsubscribe page; cleared by a later choice.';

commit;
