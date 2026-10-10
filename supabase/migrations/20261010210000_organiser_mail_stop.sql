/* ---------------------------------------------------------------------------
 * An organiser can stop our e-mails (2026-10-10).
 *
 * The edit page promised "a link at the bottom of every one" and no organiser
 * mail carried one (product review, 2026-10-10). Now every organiser mail —
 * the welcome letter and the date mail — ends with a stop link, and mail
 * clients get the one-click header: /a/{token}/stop sets this column, and
 * both senders skip an organiser who has it. Their page and their link keep
 * working; only the mail stops.
 * ------------------------------------------------------------------------- */

alter table public.organisers add column mail_stopped_at timestamptz;

comment on column public.organisers.mail_stopped_at is
  'When the organiser stopped our e-mails (functions/a, /stop). Senders skip them; their page and link keep working.';

grant select (mail_stopped_at), update (mail_stopped_at) on public.organisers to service_role;
