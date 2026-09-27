-- The history book: every change to the market data, kept forever.
--
-- Until now a change overwrote the old value. A market that moved from 8:00
-- to 9:00, changed its fee, moved venue, went indoors or closed kept only
-- today's answer; "how did 2026 look" could be asked of dates (past
-- occurrences are kept) but of nothing else. History is the one part of the
-- dataset nobody can scrape or buy later, so from 2026-09-27 the database
-- writes it itself — a trigger, so no script, Function or agent can forget.
--
-- What is watched: markets, occurrences, venues, texts, market_tags. Not
-- organisers or market_private — those hold e-mail addresses, and this table
-- is meant to be shareable. An organiser change on a market is still here,
-- as the market's organiser_id.
--
-- One row per change: an insert or delete holds the whole row; an update
-- holds only the columns that changed, as [old, new]. An update that changes
-- nothing but updated_at is not a change. `who` is 'site' for the Functions
-- (organiser page, forms: they write as service_role), otherwise the
-- connection's application_name — scripts/db.mjs sets it to the script's
-- file name — and failing that the database user.
--
-- Append-only: another trigger refuses UPDATE, DELETE and TRUNCATE, so the
-- book cannot be rewritten, only added to. The first rows are a 'baseline' of
-- every watched row as it stood when the book opened.

begin;

create table public.history (
  id          bigint generated always as identity primary key,
  changed_at  timestamptz not null default now(),
  table_name  text        not null,
  op          text        not null check (op in ('baseline', 'insert', 'update', 'delete')),
  row_key     jsonb       not null,
  market_id   uuid,
  data        jsonb       not null,
  who         text        not null
);

create index history_market_idx on public.history (market_id, changed_at);
create index history_table_idx  on public.history (table_name, changed_at);

alter table public.history enable row level security;

comment on table public.history is
  'Every change to markets, occurrences, venues, texts and market_tags since 2026-09-27, written by trigger. Append-only. update rows hold {column: [old, new]}; insert, delete and baseline rows the whole row. No personal data.';

/* Which market a row belongs to, so "everything that ever happened to this
   market" is one indexed query. Venues belong to no single market. */
create or replace function public.history_market_id(tbl text, r jsonb)
returns uuid
language sql
immutable
as $$
  select case tbl
    when 'markets'     then (r->>'id')::uuid
    when 'occurrences' then (r->>'market_id')::uuid
    when 'market_tags' then (r->>'market_id')::uuid
    when 'texts'       then case when r->>'entity_type' = 'market' then (r->>'entity_id')::uuid end
  end
$$;

/* The row's identity, from the key columns named in the trigger's arguments. */
create or replace function public.history_key(r jsonb, cols text[])
returns jsonb
language sql
immutable
as $$
  select jsonb_object_agg(c, r->c) from unnest(cols) as c
$$;

create or replace function public.record_history()
returns trigger
language plpgsql
as $$
declare
  o    jsonb;
  n    jsonb;
  diff jsonb;
  r    jsonb;
  who  text := case
    when current_user = 'service_role' then 'site'
    else coalesce(nullif(current_setting('application_name', true), ''), current_user)
  end;
begin
  if tg_op = 'INSERT' then
    r := to_jsonb(new);
    insert into public.history (table_name, op, row_key, market_id, data, who)
    values (tg_table_name, 'insert', public.history_key(r, tg_argv), public.history_market_id(tg_table_name, r), r, who);
    return new;
  elsif tg_op = 'DELETE' then
    r := to_jsonb(old);
    insert into public.history (table_name, op, row_key, market_id, data, who)
    values (tg_table_name, 'delete', public.history_key(r, tg_argv), public.history_market_id(tg_table_name, r), r, who);
    return old;
  end if;

  o := to_jsonb(old) - 'updated_at';
  n := to_jsonb(new) - 'updated_at';
  if o = n then return new; end if;

  select jsonb_object_agg(key, jsonb_build_array(o->key, value))
    into diff
    from jsonb_each(n)
   where o->key is distinct from value;

  insert into public.history (table_name, op, row_key, market_id, data, who)
  values (tg_table_name, 'update', public.history_key(n, tg_argv), public.history_market_id(tg_table_name, n), diff, who);
  return new;
end;
$$;

create trigger markets_history     after insert or update or delete on public.markets
  for each row execute function public.record_history('id');
create trigger occurrences_history after insert or update or delete on public.occurrences
  for each row execute function public.record_history('id');
create trigger venues_history      after insert or update or delete on public.venues
  for each row execute function public.record_history('id');
create trigger texts_history       after insert or update or delete on public.texts
  for each row execute function public.record_history('entity_type', 'entity_id', 'locale', 'field');
create trigger market_tags_history after insert or update or delete on public.market_tags
  for each row execute function public.record_history('market_id', 'tag_id');

/* The book is only ever added to. */
create or replace function public.history_is_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'history is append-only: % refused', tg_op;
end;
$$;

create trigger history_no_rewrite before update or delete on public.history
  for each row execute function public.history_is_append_only();
create trigger history_no_truncate before truncate on public.history
  for each statement execute function public.history_is_append_only();

/* The Functions write markets and occurrences as service_role; their
   changes must land in the book, so the role may add to it and nothing else. */
grant insert on public.history to service_role;
grant select on public.history to metabase_ro;

/* Baseline: every watched row as it stands on the day the book opens. */
insert into public.history (table_name, op, row_key, market_id, data, who)
select 'markets', 'baseline', jsonb_build_object('id', m.id), m.id, to_jsonb(m), 'baseline'
  from public.markets m;
insert into public.history (table_name, op, row_key, market_id, data, who)
select 'occurrences', 'baseline', jsonb_build_object('id', o.id), o.market_id, to_jsonb(o), 'baseline'
  from public.occurrences o;
insert into public.history (table_name, op, row_key, market_id, data, who)
select 'venues', 'baseline', jsonb_build_object('id', v.id), null, to_jsonb(v), 'baseline'
  from public.venues v;
insert into public.history (table_name, op, row_key, market_id, data, who)
select 'texts', 'baseline',
       jsonb_build_object('entity_type', t.entity_type, 'entity_id', t.entity_id, 'locale', t.locale, 'field', t.field),
       case when t.entity_type = 'market' then t.entity_id end, to_jsonb(t), 'baseline'
  from public.texts t;
insert into public.history (table_name, op, row_key, market_id, data, who)
select 'market_tags', 'baseline', jsonb_build_object('market_id', mt.market_id, 'tag_id', mt.tag_id), mt.market_id, to_jsonb(mt), 'baseline'
  from public.market_tags mt;

commit;
