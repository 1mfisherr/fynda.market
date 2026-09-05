-- Recurrence text becomes translatable.
--
-- `markets.recurrence_text` held one German sentence — "Jaehrlich, April" —
-- rendered verbatim on all four locales. It is visible prose in a list row, so
-- a French visitor read German there.
--
-- The German column stays as the source of record and the fallback; a locale
-- exists when its row exists, exactly like name and description. Nothing is
-- copied into `texts` for a locale we have not written.

begin;

alter table public.texts drop constraint texts_field_check;

alter table public.texts add constraint texts_field_check
  check (field in ('name', 'description', 'meta_title', 'meta_description',
                   'label', 'recurrence_text'));

comment on column public.markets.recurrence_text is
  'The German source sentence. Rendered only when texts(field=''recurrence_text'') has no row for the requested locale.';

commit;
