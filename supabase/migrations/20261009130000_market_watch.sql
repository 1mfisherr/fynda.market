-- Market Watch (docs/WATCH-SPEC.md): the pages that say when markets run, what
-- they said last time, and the findings a person decides in Telegram.
--
-- The PC run (scripts/watch/run.mjs) writes everything here as the owner. The
-- one Function path is Delfim's Approve / Dismiss link: it calls
-- watch_decide(), which applies a finding in one transaction, and /adm/notify
-- reads a finished run's report to send it. Hence the narrow grants below.

begin;

create table public.watch_sources (
  id           uuid primary key default gen_random_uuid(),
  url          text not null unique,
  kind         text not null default 'page' check (kind in ('page', 'pdf', 'ics')),
  -- fetch: ordinary download · browser: needs Edge to render · blocked: refuses us
  -- (a challenge page, a 403) · social: Facebook/Instagram, never fetched
  access       text not null default 'fetch' check (access in ('fetch', 'browser', 'blocked', 'social')),
  active       boolean not null default true,
  -- Regexes for lines that change by themselves ("Stand: …", counters).
  ignore_lines text[] not null default '{}',
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.watch_source_markets (
  source_id  uuid not null references public.watch_sources(id) on delete cascade,
  market_id  uuid not null references public.markets(id) on delete cascade,
  via        text not null check (via in ('website', 'facts', 'private', 'finder', 'manual')),
  created_at timestamptz not null default now(),
  primary key (source_id, market_id)
);
create index watch_source_markets_market_idx on public.watch_source_markets (market_id);

-- One row per source: the last fetch, and what it found.
create table public.watch_pages (
  source_id     uuid primary key references public.watch_sources(id) on delete cascade,
  fetched_at    timestamptz not null,
  outcome       text not null check (outcome in (
                  'read', 'not_modified', 'unchanged', 'empty', 'blocked', 'not_found',
                  'unreachable', 'robots', 'parked', 'unsupported')),
  http_status   int,
  final_url     text,
  renderer      text,
  etag          text,
  last_modified text,
  text_hash     text,
  -- [{iso, line, assumed}] — every date from today to 15 months out.
  dates         jsonb not null default '[]',
  -- Short hashes of every date or cancellation line this page has ever shown,
  -- so "new" means new to this page, not new to us.
  seen          text[] not null default '{}',
  fail_streak   int not null default 0,
  changed_at    timestamptz
);

create table public.watch_runs (
  id              uuid primary key default gen_random_uuid(),
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  slice           int,
  sources_planned int not null default 0,
  fetched         int not null default 0,
  not_modified    int not null default 0,
  unchanged       int not null default 0,
  stamped         int not null default 0,
  questions       int not null default 0,
  findings        int not null default 0,
  ai              text check (ai in ('ok', 'not_needed', 'no_login', 'failed')),
  errors          jsonb not null default '[]',
  -- The Telegram message, written by the run; /adm/notify sends it once.
  report          text,
  notified_at     timestamptz
);

create table public.watch_findings (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid references public.watch_runs(id) on delete set null,
  market_id       uuid not null references public.markets(id) on delete cascade,
  source_id       uuid references public.watch_sources(id) on delete set null,
  kind            text not null check (kind in ('new_date', 'missing', 'cancelled', 'hours', 'source_broken')),
  dates           date[] not null default '{}',
  start_time      time,
  end_time        time,
  quote           text,
  summary         text not null,
  url             text not null,
  -- The quote is on the page and states every date claimed.
  verified        boolean not null default false,
  status          text not null default 'open' check (status in ('open', 'applied', 'dismissed', 'superseded')),
  admin_action_id uuid references public.admin_actions(id) on delete set null,
  outcome         text,
  created_at      timestamptz not null default now(),
  decided_at      timestamptz
);
-- The same question is never open twice.
create unique index watch_findings_open_once on public.watch_findings (market_id, kind, dates) where status = 'open';

alter table public.watch_sources        enable row level security;
alter table public.watch_source_markets enable row level security;
alter table public.watch_pages          enable row level security;
alter table public.watch_runs           enable row level security;
alter table public.watch_findings       enable row level security;

create trigger watch_sources_set_updated_at before update on public.watch_sources
  for each row execute function public.set_updated_at();

-- A watch finding is a decision like a claim; a watch-approved date is its own origin.
alter table public.admin_actions drop constraint admin_actions_kind_check;
alter table public.admin_actions add constraint admin_actions_kind_check
  check (kind in ('claim', 'market_stopped', 'edit', 'watch'));
alter table public.occurrences drop constraint occurrences_origin_check;
alter table public.occurrences add constraint occurrences_origin_check
  check (origin in ('manual', 'generated', 'organiser', 'import', 'watch'));

/**
 * Apply or dismiss one finding — the whole of what Delfim's link does.
 *
 * Security definer so the Function needs one EXECUTE, not write grants on
 * occurrences and facts. Every applied date gets a facts row naming the page
 * and the stamp moves, as confirm.mjs does. A date an organiser gave us is
 * never removed or moved by the watch.
 */
create function public.watch_decide(p_finding uuid, p_verb text)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  f public.watch_findings;
  d date;
  occ uuid;
  n int := 0;
begin
  select * into f from public.watch_findings where id = p_finding for update;
  if not found then return 'That finding no longer exists.'; end if;
  if f.status <> 'open' then return 'Already decided (' || f.status || '). Nothing happened this time.'; end if;

  if p_verb = 'reject' then
    update public.watch_findings set status = 'dismissed', decided_at = now(), outcome = 'dismissed' where id = f.id;
    return 'Dismissed. The page stays as it is; the same question will not come back for these dates.';
  end if;
  if p_verb <> 'approve' then return 'Unknown decision.'; end if;

  if f.kind = 'new_date' then
    foreach d in array f.dates loop
      insert into public.occurrences (market_id, date, start_time, end_time, status, origin, confirmed_at)
      values (f.market_id, d, f.start_time, f.end_time, 'confirmed', 'watch', now())
      on conflict (market_id, date) do update
        set status = 'confirmed', confirmed_at = now(),
            start_time = coalesce(excluded.start_time, public.occurrences.start_time),
            end_time = coalesce(excluded.end_time, public.occurrences.end_time)
      returning id into occ;
      insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
      values ('occurrence', occ, 'date', to_jsonb(d::text), 'website_crawl', f.url, f.created_at, 'confirmed');
      n := n + 1;
    end loop;
  elsif f.kind = 'cancelled' then
    for occ, d in
      update public.occurrences set status = 'cancelled', confirmed_at = now()
       where market_id = f.market_id and date = any(f.dates) and origin <> 'organiser'
      returning id, date
    loop
      insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
      values ('occurrence', occ, 'status', to_jsonb('cancelled'::text), 'website_crawl', f.url, f.created_at, 'confirmed');
      n := n + 1;
    end loop;
  elsif f.kind = 'hours' then
    for occ, d in
      update public.occurrences
         set start_time = coalesce(f.start_time, start_time), end_time = coalesce(f.end_time, end_time), confirmed_at = now()
       where market_id = f.market_id and date = any(f.dates) and origin <> 'organiser'
      returning id, date
    loop
      insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
      values ('occurrence', occ, 'hours', jsonb_build_object('start', f.start_time, 'end', f.end_time), 'website_crawl', f.url, f.created_at, 'confirmed');
      n := n + 1;
    end loop;
  elsif f.kind = 'missing' then
    delete from public.occurrences
     where market_id = f.market_id and date = any(f.dates) and origin <> 'organiser';
    get diagnostics n = row_count;
  else
    return 'Nothing to apply for a ' || f.kind || ' note.';
  end if;

  update public.watch_findings set status = 'applied', decided_at = now(), outcome = n || ' date(s) changed' where id = f.id;
  return 'Done: ' || n || ' date(s) changed. It shows on the site after tonight''s rebuild.';
end
$$;

revoke all on function public.watch_decide(uuid, text) from public, anon, authenticated;
grant execute on function public.watch_decide(uuid, text) to service_role;

-- /adm/notify reads a run's report and marks it sent; nothing else.
grant select (id, report, notified_at) on public.watch_runs to service_role;
grant update (notified_at) on public.watch_runs to service_role;

commit;
