/* ---------------------------------------------------------------------------
 * "One more, if you know" (Delfim, 2026-10-10).
 *
 * Someone who just said yes to "Were you there?" is the best source we have
 * for what a market is like — and we hold stall counts for 18 of 343 markets,
 * who sells for none, indoors or out for half. So after a yes the card asks
 * one question about a fact the market is missing: how big, who sells,
 * indoors or out. One tap, anonymous.
 *
 * Who checks: nobody's answer is published on its own. Three different
 * connections giving the same answer publish it (fact_answer_settle); before
 * that, each answer reaches Delfim in Telegram with Approve / Reject
 * (admin_actions kind 'fact'). Either way the value lands only where the
 * market has none — a visitor never overwrites an organiser or our own
 * research — and the facts ledger names the visitors as its source.
 *
 * Size is a band, not a count: nobody counts stalls on a Sunday morning, and
 * "~60" from a guess would be a precision we do not have. A market with a
 * real stall count keeps showing it; one without shows the band.
 * ------------------------------------------------------------------------- */

alter table public.markets
  add column size_band text check (size_band is null or size_band in ('small', 'medium', 'large'));
comment on column public.markets.size_band is
  'Roughly how big: small (under 30 stalls), medium (30–100), large (over 100). From visitors; shown only where stall_count is unknown.';

alter table public.facts drop constraint facts_source_type_check;
alter table public.facts add constraint facts_source_type_check check (source_type = any (array[
  'organiser_email', 'organiser_phone', 'organiser_whatsapp', 'website_crawl', 'press',
  'municipality', 'our_visit', 'manual', 'import', 'visitor']));

alter table public.admin_actions drop constraint admin_actions_kind_check;
alter table public.admin_actions add constraint admin_actions_kind_check
  check (kind = any (array['claim', 'market_stopped', 'edit', 'watch', 'fact']));

create table public.fact_answers (
  id             uuid primary key default gen_random_uuid(),
  market_id      uuid not null references public.markets (id) on delete cascade,
  occurrence_id  uuid references public.occurrences (id) on delete set null,
  field          text not null check (field in ('size_band', 'seller_mix', 'setting')),
  value          text not null,
  source_path    text check (source_path is null or source_path ~ '^/'),
  ip_hash        text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  created_at     timestamptz not null default now(),
  check (
       (field = 'size_band'  and value in ('small', 'medium', 'large'))
    or (field = 'seller_mix' and value in ('private', 'mixed', 'trader'))
    or (field = 'setting'    and value in ('indoor', 'outdoor', 'both'))
  )
);

comment on table public.fact_answers is
  'One more, if you know: a visitor''s one-tap answer about a market fact after "Were you there?". Anonymous; the hash counts distinct people and caps repeats.';

create index fact_answers_market_idx on public.fact_answers (market_id, field);

alter table public.fact_answers enable row level security;
revoke all on public.fact_answers from anon, authenticated;
grant select, insert on public.fact_answers to service_role;

/* Publish one value: only where the market has none, with a ledger row. */
create or replace function public.fact_answer_apply(p_market uuid, p_field text, p_value text, p_how text)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_current text;
begin
  if p_field not in ('size_band', 'seller_mix', 'setting') then return 'bad field'; end if;
  execute format('select %I::text from public.markets where id = $1', p_field) into v_current using p_market;
  if v_current is not null then return 'already set'; end if;
  if p_field = 'size_band' and exists (select 1 from public.markets where id = p_market and stall_count is not null) then
    return 'already set';
  end if;

  execute format('update public.markets set %I = $1, updated_at = now() where id = $2', p_field) using p_value, p_market;
  insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
  values ('market', p_market, p_field, to_jsonb(p_value), 'visitor', p_how, now(), 'reported');
  return 'applied';
end;
$$;

/* After each answer: three different connections agreeing, and more of them
   than for any other value, publish it. Otherwise it waits for Delfim. */
create or replace function public.fact_answer_settle(p_market uuid, p_field text)
returns text
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  top_value text;
  top_count int;
  runner_up int;
begin
  select value, n into top_value, top_count
    from (select value, count(distinct ip_hash)::int n from public.fact_answers
           where market_id = p_market and field = p_field group by value) v
   order by n desc limit 1;
  select coalesce(max(n), 0) into runner_up
    from (select count(distinct ip_hash)::int n from public.fact_answers
           where market_id = p_market and field = p_field and value <> top_value group by value) v;

  if top_count is null or top_count < 3 or top_count <= runner_up then
    return 'waiting ' || coalesce(top_count, 0) || ' of 3';
  end if;
  return public.fact_answer_apply(p_market, p_field, top_value, 'three visitors agreed');
end;
$$;

revoke all on function public.fact_answer_apply(uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.fact_answer_settle(uuid, text) from public, anon, authenticated;
grant execute on function public.fact_answer_apply(uuid, text, text, text) to service_role;
grant execute on function public.fact_answer_settle(uuid, text) to service_role;
