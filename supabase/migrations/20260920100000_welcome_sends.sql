-- A welcome mail is a send like any other and belongs in organiser_mail_sends,
-- so a re-run of the welcome script skips whoever already got one. It asks
-- about no dates, and the table required at least one; the check now makes
-- that exception for kind = 'welcome' only. Nothing else changes.
begin;

alter table public.organiser_mail_sends
  drop constraint organiser_mail_sends_occurrence_ids_check;

alter table public.organiser_mail_sends
  add constraint organiser_mail_sends_occurrence_ids_check
  check (kind = 'welcome' or cardinality(occurrence_ids) > 0);

comment on column public.organiser_mail_sends.occurrence_ids is
  'Which dates this mail asked about. Empty only for the welcome, which asks about none.';

commit;
