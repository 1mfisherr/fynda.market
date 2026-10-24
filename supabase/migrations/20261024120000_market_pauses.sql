-- Why a market pauses (Delfim, 2026-10-24, design/pause-v1.html, wording B): one grey line under
-- the hours on the market page, "Paused for the Herbstmesse, Basel's autumn fair.", shown only
-- while a break we know the reason for is on. MARKET-PAGE.md §Market.
--
-- A break is its own row — a market, a first and a last day without a market — because a market
-- can pause for different reasons in one year (Petersplatz: the Herbstmesse in autumn, public
-- holidays otherwise). The sentence lives in texts, written for each language, never generated:
-- a locale without one shows no line.
--
-- First row, Flohmarkt Petersplatz Basel. bs.ch, Flohmarkt Petersplatz (read 2026-10-24):
-- "Kein Markt während der Basler Herbstmesse." and, for 2026, no market from 10 October to 19 November.

begin;

create table public.market_pauses (
  id         uuid primary key default gen_random_uuid(),
  market_id  uuid not null references public.markets (id) on delete cascade,
  starts_on  date not null,
  ends_on    date not null,
  source_url text not null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create index market_pauses_market_idx on public.market_pauses (market_id, ends_on);

alter table public.market_pauses enable row level security;

comment on table public.market_pauses is
  'A break in a market''s rhythm whose reason we hold. The reason, per locale: texts (market_pause, label).';

alter table public.texts drop constraint texts_entity_type_check;
alter table public.texts add constraint texts_entity_type_check
  check (entity_type in ('country', 'region', 'city', 'venue', 'market', 'tag', 'market_pause'));

-- The texts trigger checks the row a text belongs to exists; it learns the new kind here.
create or replace function public.assert_entity_exists()
  returns trigger
  language plpgsql
  set search_path = public, pg_catalog
as $$
declare
  found_one boolean;
begin
  execute format(
    'select exists (select 1 from public.%I where id = $1)',
    case new.entity_type
      when 'country'      then 'countries'
      when 'region'       then 'regions'
      when 'city'         then 'cities'
      when 'venue'        then 'venues'
      when 'market'       then 'markets'
      when 'occurrence'   then 'occurrences'
      when 'tag'          then 'tags'
      when 'market_pause' then 'market_pauses'
    end
  ) into found_one using new.entity_id;

  if not found_one then
    raise exception '% % does not exist', new.entity_type, new.entity_id
      using errcode = 'foreign_key_violation';
  end if;

  return new;
end
$$;

-- A deleted pause takes its sentences with it.
create function public.market_pauses_drop_texts()
  returns trigger
  language plpgsql
  set search_path = public, pg_catalog
as $$
begin
  delete from public.texts where entity_type = 'market_pause' and entity_id = old.id;
  return old;
end
$$;

create trigger market_pauses_drop_texts after delete on public.market_pauses
  for each row execute function public.market_pauses_drop_texts();

do $$
declare p uuid;
begin
  if not exists (select 1 from public.markets) then return; end if;

  insert into public.market_pauses (market_id, starts_on, ends_on, source_url)
  values ('55f505e6-7c2c-4b4b-abc3-a7032f38b6ca', '2026-10-10', '2026-11-19',
          'https://www.bs.ch/verwaltung/praesidialdepartement/aemter-und-bereiche/aussenbeziehungen-und-standortmarketing/messen-und-maerkte/basler-maerkte/flohmarkt-petersplatz')
  returning id into p;

  insert into public.texts (entity_type, entity_id, locale, field, value) values
    ('market_pause', p, 'de', 'label', 'Pause während der Herbstmesse.'),
    ('market_pause', p, 'fr', 'label', 'En pause pendant la Herbstmesse, la foire d''automne de Bâle.'),
    ('market_pause', p, 'it', 'label', 'In pausa durante la Herbstmesse, la fiera d''autunno di Basilea.'),
    ('market_pause', p, 'en', 'label', 'Paused for the Herbstmesse, Basel''s autumn fair.');

  if (select count(*) from public.texts where entity_type = 'market_pause' and entity_id = p) <> 4 then
    raise exception 'Petersplatz pause: expected 4 texts';
  end if;
end $$;

commit;
