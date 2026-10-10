/* ---------------------------------------------------------------------------
 * Your saved markets, by e-mail (Delfim, 2026-10-10, design/saved-mail-v1.html).
 *
 * Saving a market used to live in the browser only, and nothing ever reminded
 * anyone. Now a visitor can leave an address: before a weekend when one of
 * their saved markets is on, one e-mail says which, when and where — nothing
 * when none is. It rides the Friday digest: one row per address in
 * newsletter_subscribers, whose saved list is here.
 *
 * `area_digest` false is someone who asked only for their saved markets — no
 * "weekend around Zurich" block, and no mail at all on a weekend when none of
 * their markets is on. A later newsletter signup on the same address turns it
 * back on (functions/_newsletter.ts).
 * ------------------------------------------------------------------------- */

alter table public.newsletter_subscribers
  add column area_digest boolean not null default true;

comment on column public.newsletter_subscribers.area_digest is
  'False: they asked only for their saved markets (saved_markets) — no area block, and no mail on a weekend when none of them is on.';

create table public.saved_markets (
  subscriber_id  uuid not null references public.newsletter_subscribers (id) on delete cascade,
  market_id      uuid not null references public.markets (id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (subscriber_id, market_id)
);

comment on table public.saved_markets is
  'The markets a subscriber saved on the site, kept so the Friday mail can say which of them are on (functions/k.ts writes it).';

alter table public.saved_markets enable row level security;
revoke all on public.saved_markets from anon, authenticated;
grant select, insert, delete on public.saved_markets to service_role;
grant select (area_digest), update (area_digest) on public.newsletter_subscribers to service_role;
