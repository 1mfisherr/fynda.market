/* An organiser can move a date (2026-10-10, organiser review): until now a moved
   market was a cancellation plus a new date, and the cancellation mailed everyone
   who saved that Saturday "cancelled" — wrong for a move. The edit page
   (functions/a) updates the date itself; the unique (market_id, date) key still
   refuses a move onto a date the market already has. */
grant update (date) on public.occurrences to service_role;
