-- The newsletter list, in our own database.
--
-- PLAN.md "Make the forms real". Until now the newsletter form opened the
-- visitor's own mail program, which means almost nobody finished: a signup is
-- worth a few seconds of attention and not a trip through a mail client.
--
-- The list lives here rather than at a marketing provider, for the reason
-- CLAUDE.md gives: we own the data. A sending service will eventually deliver
-- the mail, but the addresses are ours.
--
-- Consent posture, matching what the privacy policy already promises:
--   * The subscription is active immediately. No confirmation mail to click.
--   * What was agreed to is recorded — when, from which page, in which
--     language — so consent can be shown rather than asserted.
--   * The signup IP is stored hashed, never in readable form, exactly as the
--     analytics collector does it.
--
-- Unsubscribing does not delete the row. It sets unsubscribed_at and clears
-- the identifying extras, leaving the minimal suppression record the privacy
-- policy describes: an address we must not contact again.

begin;

create table public.newsletter_subscribers (
  id                uuid primary key default gen_random_uuid(),

  -- Lowercased before insert. The unique index is what makes a second signup
  -- from the same address an update rather than a duplicate.
  email             text not null,

  -- What they asked for. Null town means the whole country.
  town              text,
  locale            text not null check (locale in ('de', 'fr', 'it', 'en')),
  country           text not null default 'ch' check (country ~ '^[a-z]{2}$'),

  -- Where the signup happened, for knowing which page earns subscribers.
  source_path       text check (source_path is null or source_path ~ '^/'),
  referrer_host     text,

  -- Consent, as evidence rather than as a claim.
  consent_text      text,
  signup_ip_hash    text check (signup_ip_hash is null or signup_ip_hash ~ '^[0-9a-f]{64}$'),

  created_at        timestamptz not null default now(),
  confirmed_at      timestamptz not null default now(),
  unsubscribed_at   timestamptz,

  -- Opaque, unguessable, and stable for the life of the row: it is what an
  -- unsubscribe link carries, so old links keep working after a re-signup.
  unsubscribe_token uuid not null default gen_random_uuid(),

  -- How many newsletters this address has actually been sent.
  sent_count        integer not null default 0,

  constraint newsletter_email_shape check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  constraint newsletter_email_lowercase check (email = lower(email))
);

-- One row per address. A repeat signup updates the town and clears an earlier
-- unsubscribe rather than adding a second row.
create unique index newsletter_subscribers_email_key
  on public.newsletter_subscribers (email);

create unique index newsletter_subscribers_token_key
  on public.newsletter_subscribers (unsubscribe_token);

-- The two questions asked of this table: who is active, and who is in town X.
create index newsletter_subscribers_active_idx
  on public.newsletter_subscribers (created_at desc)
  where unsubscribed_at is null;

create index newsletter_subscribers_town_idx
  on public.newsletter_subscribers (lower(town))
  where unsubscribed_at is null and town is not null;

comment on table public.newsletter_subscribers is
  'Newsletter list. Active = unsubscribed_at is null. Unsubscribing keeps a minimal suppression record, it does not delete the row.';

/* ---------------------------------------------------------------------------
 * Access
 *
 * Row-level security on, and no policy granting anyone anything. The published
 * site is static files and never reads this table; only the Pages Function
 * writes to it, using the service role key, which bypasses RLS by design.
 * The effect is that an address here is unreachable from the public internet.
 * ------------------------------------------------------------------------- */

alter table public.newsletter_subscribers enable row level security;

revoke all on public.newsletter_subscribers from anon, authenticated;

commit;
