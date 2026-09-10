-- The signup endpoint's read of the slug table.
--
-- /n turns the canton or city slug a form posted into the id it stores, by
-- looking it up here. Without a SELECT grant that lookup returns nothing —
-- quietly, because "no such slug" and "not allowed to look" are the same empty
-- array over PostgREST. Every signup was being saved as countrywide.
--
-- This is the second time this exact shape has bitten: the newsletter table
-- needed the same grant in 20260906143000, and for the same reason. The
-- service role bypasses row-level security by design, which is easy to mistake
-- for bypassing table permissions. It does not.
--
-- Found by signing up on the live site and reading the row back, rather than
-- by querying the database as its owner — as the owner, the lookup works.
--
-- SELECT only, and only on slugs: the endpoint reads a public URL segment to
-- find an id. It has no business writing here.

begin;

grant usage on schema public to service_role;
grant select on public.slugs to service_role;

commit;
