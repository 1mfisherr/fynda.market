-- Marché Calabash runs all year but had no date after 6 December. The organiser's rules
-- (associationcalabash.ch/reglement/): "le premier dimanche de chaque mois, durant toute
-- l'année". The next first Sunday inside the 120-day horizon is 3 January 2027; it goes in
-- as derived from the rule — unverified, "not yet confirmed" — until the organiser lists it.

begin;

do $$
declare m uuid; o uuid;
begin
  select id into m from public.markets where slug = 'marche-calabash-lausanne';
  if m is null then return; end if;
  insert into public.occurrences (market_id, date, start_time, end_time, status, origin)
  values (m, '2027-01-03', '09:00', '18:00', 'unverified', 'generated')
  on conflict (market_id, date) do nothing
  returning id into o;
  if o is not null then
    insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
    values ('occurrence', o, 'date', to_jsonb('2027-01-03'::text), 'website_crawl', 'https://www.associationcalabash.ch/reglement/', now(), 'inferred');
  end if;
end $$;

commit;
