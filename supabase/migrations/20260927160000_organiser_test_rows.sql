-- Test rows stay, and stop counting.
--
-- The organiser loop was proven end to end on 2026-09-16 against Bergflohmarkt
-- Chur: one seven-day mail row and six button presses in eight hours (on,
-- cancelled, changed, cancelled, changed, on). They sit in the same tables as
-- real answers, and organiser_funnel — the number the organiser plan is judged
-- on four weeks after the welcome letters — would read that week as 100%.
-- Marked, not deleted: organiser_answers is the evidence behind every stamp.

begin;

alter table public.organiser_answers    add column test boolean not null default false;
alter table public.organiser_mail_sends add column test boolean not null default false;

comment on column public.organiser_answers.test is 'A press made while testing the loop. Kept as evidence, left out of organiser_funnel.';
comment on column public.organiser_mail_sends.test is 'A mail sent while testing the loop. Kept, left out of organiser_funnel.';

update public.organiser_answers a
   set test = true
  from public.organisers o
 where o.id = a.organiser_id
   and o.name = 'Verein Bergflohmarkt Chur'
   and a.created_at < '2026-09-17';

update public.organiser_mail_sends s
   set test = true
  from public.organisers o
 where o.id = s.organiser_id
   and o.name = 'Verein Bergflohmarkt Chur'
   and s.sent_at < '2026-09-17';

create or replace view public.organiser_funnel as
  select
    date_trunc('week', s.sent_at)::date                      as week,
    s.kind,
    count(*)                                                 as mails,
    count(*) filter (where a.organiser_id is not null)      as answered,
    count(*) filter (where a.answer = 'on')                  as said_on,
    count(*) filter (where a.answer = 'cancelled')           as said_cancelled,
    count(*) filter (where a.answer = 'changed')             as said_changed
  from public.organiser_mail_sends s
  left join lateral (
    select a.organiser_id, a.answer
    from public.organiser_answers a
    where a.organiser_id = s.organiser_id
      and a.occurrence_id = any (s.occurrence_ids)
      and a.created_at between s.sent_at and s.sent_at + interval '7 days'
      and not a.test
    order by a.created_at
    limit 1
  ) a on true
  where not s.test
  group by 1, 2
  order by 1 desc, 2;

commit;
