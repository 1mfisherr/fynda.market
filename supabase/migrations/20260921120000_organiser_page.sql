/* ---------------------------------------------------------------------------
 * The organiser page, rebuilt (docs/PAGES.md §Organiser page, 2026-09-21).
 *
 * Four things the page asks for that the schema did not hold: where people
 * book a stall, how to get there, the organiser's own words, and which tags
 * apply. Plus the number the page opens with — how many people looked at the
 * market last month — as a view the Function may read.
 * ------------------------------------------------------------------------- */

alter table public.markets
  add column stall_booking         text check (stall_booking is null or length(stall_booking) <= 300),
  add column getting_there         text check (getting_there is null or length(getting_there) <= 300),
  add column organiser_note        text check (organiser_note is null or length(organiser_note) <= 800),
  add column organiser_note_locale text check (organiser_note_locale is null or organiser_note_locale in ('de', 'fr', 'it', 'en'));

comment on column public.markets.stall_booking is 'A URL, an e-mail or a sentence: where a vendor books a stall. From the organiser; rendered only when set.';
comment on column public.markets.getting_there is 'One line from the organiser: the bus stop, the parking. Rendered under Getting there when set.';
comment on column public.markets.organiser_note is 'The organiser''s own words, in their own language, shown as theirs and never rewritten.';
comment on column public.markets.organiser_note_locale is 'The language the note was written in — it is shown as written on every locale.';

/* The tag set an organiser can pick from. Small on purpose (docs/CLAUDE.md
   §Settled: tags). Labels live in the organiser copy and in strings.ts for
   now; a texts row per locale comes when tags render for visitors. */
insert into public.tags (key) values
  ('antiques'), ('furniture'), ('clothes'), ('records_books'), ('kids'), ('food')
on conflict (key) do nothing;

/* People, not crawlers, who opened the market's page in the last 30 days.
   The view runs with its owner's rights, so the service role reads this
   one number and nothing else from analytics. */
create view public.market_people_30d as
  select
    market_id,
    count(distinct visitor_day_hash) as people
  from public.analytics_events_classified
  where event_name = 'page_view'
    and market_id is not null
    and not bot_likely
    and occurred_at > now() - interval '30 days'
  group by market_id;

revoke all on public.market_people_30d from anon, authenticated;
grant select on public.market_people_30d to service_role;

/* What the page writes. */
grant update (stall_booking, getting_there, organiser_note, organiser_note_locale, entry_fee, currency, website_url)
  on public.markets to service_role;
grant select on public.tags to service_role;
grant select, insert, delete on public.market_tags to service_role;
