/* ---------------------------------------------------------------------------
 * "Were you there?" (Delfim, 2026-10-10, design/next-v1.html).
 *
 * For two days after a date — and on the day once it has closed — a market
 * page asks one question: were you there? A visitor's tap is the only
 * evidence we can get that a market actually ran rather than was listed: the
 * record on the page says "Earlier this year", not "Held", until someone says
 * so. A yes marks the date *Seen on*; a no reaches Delfim in Telegram, the way
 * a report does.
 *
 * Anonymous: the date, the answer, the page, and the hashed connection that
 * caps how often one connection can answer. No address, no person.
 * ------------------------------------------------------------------------- */

create table public.date_answers (
  id             uuid primary key default gen_random_uuid(),
  occurrence_id  uuid not null references public.occurrences (id) on delete cascade,
  answer         text not null check (answer in ('on', 'off')),
  source_path    text check (source_path is null or source_path ~ '^/'),
  ip_hash        text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  created_at     timestamptz not null default now()
);

comment on table public.date_answers is
  '"Were you there?" — one tap after a date: on (it ran) or off (it did not). Anonymous; the hash only caps repeats.';

create index date_answers_occurrence_idx on public.date_answers (occurrence_id);

alter table public.date_answers enable row level security;
revoke all on public.date_answers from anon, authenticated;
grant select, insert on public.date_answers to service_role;

/* Per date: how many said it ran, how many said it did not. A date is *seen*
   when someone said yes and nobody said no — one "no" is a question for a
   person, not a vote to be outnumbered. */
create view public.occurrence_seen as
  select occurrence_id,
         count(*) filter (where answer = 'on')  as yes,
         count(*) filter (where answer = 'off') as no,
         count(*) filter (where answer = 'on') > 0 and count(*) filter (where answer = 'off') = 0 as seen
  from public.date_answers
  group by occurrence_id;

revoke all on public.occurrence_seen from anon, authenticated;
grant select on public.occurrence_seen to service_role, metabase_ro;
