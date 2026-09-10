-- A subscription belongs to a canton, not to a typed-in town.
--
-- `town` was free text, so the first real signup arrived with the town "Ua".
-- Nothing was wrong with the validation; the field should never have been a
-- question. On 848 of the site's 944 pages we already know where the visitor
-- is standing — the market page, the city page and the canton page all carry
-- it in the URL — so the form stops asking and carries it instead.
--
-- Canton rather than city, decided 2026-09-10. Fifty-five cities is fifty-five
-- segments, most of them holding nobody for a long time and none of them big
-- enough to learn anything from; fourteen cantons is a list that can actually
-- be reasoned about. It is also roughly how far a person drives on a Saturday,
-- so somebody in Uster gets Winterthur and Zürich rather than only Uster.
--
-- A foreign key rather than a name. "Ua" is now impossible because there is
-- nowhere to put it, which is a better guarantee than any check constraint,
-- and the digest becomes a join instead of a fuzzy string comparison.

begin;

alter table public.newsletter_subscribers
  add column if not exists region_id uuid
    references public.regions (id) on delete set null;

comment on column public.newsletter_subscribers.region_id is
  'The canton this address subscribed to. Null means the whole country, which is what the form offers when the page cannot know.';

-- "Who is on this canton's list" is the only question the digest asks of it.
create index if not exists newsletter_subscribers_region_idx
  on public.newsletter_subscribers (region_id)
  where unsubscribed_at is null;

/* ---------------------------------------------------------------------------
 * The old column
 *
 * Dropped rather than kept. All three rows hold null — the one value that was
 * ever written was cleared by hand — so there is nothing to migrate and a
 * column nobody writes is a column somebody will write again by accident.
 * ------------------------------------------------------------------------- */

alter table public.newsletter_subscribers drop column if exists town;

commit;
