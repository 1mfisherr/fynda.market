-- Organisers: the tables behind docs/specs/organisers.md.
--
-- An organiser is identified by a personal link, never by a login. Before each
-- of their dates they get a mail with three buttons; the answers land here, and
-- the answer rate (mails sent vs. answered) is what decides whether anything
-- more is built for organisers. Delfim approves claims and edits through
-- single-use signed links in Telegram — those are `admin_actions`.
--
-- Nothing in here is reachable from the public internet: RLS on, no policies,
-- explicit grants to the service role for exactly what each Function does.
-- Column-level grants on markets and organisers, because the service role has
-- no business rewriting a slug or a name from a web request.

begin;

/* ---------------------------------------------------------------------------
 * The two facts nobody has, and the rain question that replaces a morning mail
 * ------------------------------------------------------------------------- */

alter table public.markets
  add column stall_count integer check (stall_count is null or stall_count > 0),
  add column setting     text check (setting is null or setting in ('indoor', 'outdoor', 'both')),
  add column rain_policy text check (rain_policy is null or rain_policy in ('runs', 'cancelled', 'decided_on_the_day'));

comment on column public.markets.stall_count is 'Roughly how many stalls. From the organiser; rendered only when set.';
comment on column public.markets.setting is 'indoor | outdoor | both. From the organiser; rendered only when set.';
comment on column public.markets.rain_policy is 'runs | cancelled | decided_on_the_day. What happens when it rains — the answer to the question visitors phone about.';

/* ---------------------------------------------------------------------------
 * Where the mail goes, and in which language
 * ------------------------------------------------------------------------- */

alter table public.organisers
  add column email  text check (email is null or email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]{2,}$'),
  add column locale text check (locale is null or locale in ('de', 'fr', 'it', 'en'));

comment on column public.organisers.email is 'Where the confirmation mail goes. Lower-cased. channel_type/channel_value stay as the public contact.';
comment on column public.organisers.locale is 'Language of every mail and page we show this organiser. Set at claim time; imported organisers get the canton''s language.';

create unique index organisers_email_idx on public.organisers (lower(email)) where email is not null;

/* ---------------------------------------------------------------------------
 * The personal link
 * ------------------------------------------------------------------------- */

create table public.organiser_links (
  id            uuid primary key default gen_random_uuid(),
  organiser_id  uuid not null references public.organisers (id) on delete cascade,
  -- sha256 hex of the token in the URL. The token itself is never stored.
  token_hash    text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at    timestamptz not null default now(),
  last_used_at  timestamptz,
  revoked_at    timestamptz
);

comment on table public.organiser_links is
  'The link in the mail is the organiser''s identity. One active link per organiser; minting a new one revokes the old.';

-- One live link per organiser. The partial unique index is the rule.
create unique index organiser_links_active_idx
  on public.organiser_links (organiser_id) where revoked_at is null;

/* ---------------------------------------------------------------------------
 * The mail, and the answers
 * ------------------------------------------------------------------------- */

create table public.organiser_mail_sends (
  id             uuid primary key default gen_random_uuid(),
  organiser_id   uuid not null references public.organisers (id) on delete cascade,
  -- Which dates this mail asked about. One mail per organiser per run.
  occurrence_ids uuid[] not null check (cardinality(occurrence_ids) > 0),
  kind           text not null default 'seven_days' check (kind in ('seven_days', 'season', 'welcome')),
  sent_at        timestamptz not null default now(),
  resend_id      text
);

comment on table public.organiser_mail_sends is
  'Written before the send, like newsletter_sends. The denominator of the answer rate.';

create index organiser_mail_sends_organiser_idx on public.organiser_mail_sends (organiser_id, sent_at desc);

create table public.organiser_answers (
  id             uuid primary key default gen_random_uuid(),
  organiser_id   uuid not null references public.organisers (id) on delete cascade,
  market_id      uuid not null references public.markets (id) on delete cascade,
  occurrence_id  uuid references public.occurrences (id) on delete set null,
  answer         text not null check (answer in ('on', 'cancelled', 'changed')),
  -- A cancellation is one date unless the organiser says the market has
  -- stopped; "market" goes to Delfim, "date" acts at once.
  scope          text not null default 'date' check (scope in ('date', 'market')),
  created_at     timestamptz not null default now(),
  ip_hash        text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$')
);

comment on table public.organiser_answers is
  'Every button press. The numerator of the answer rate, and the evidence behind every organiser stamp.';

create index organiser_answers_organiser_idx on public.organiser_answers (organiser_id, created_at desc);
create index organiser_answers_market_idx on public.organiser_answers (market_id, created_at desc);

/* ---------------------------------------------------------------------------
 * Edits that wait for Delfim
 * ------------------------------------------------------------------------- */

create table public.organiser_edits (
  id            uuid primary key default gen_random_uuid(),
  organiser_id  uuid not null references public.organisers (id) on delete cascade,
  market_id     uuid not null references public.markets (id) on delete cascade,
  -- Field name -> proposed value. Free text and photos only; dates and the
  -- three facts go live without passing through here.
  payload       jsonb not null check (jsonb_typeof(payload) = 'object'),
  status        text not null default 'pending' check (status in ('pending', 'applied', 'rejected')),
  created_at    timestamptz not null default now(),
  handled_at    timestamptz
);

create index organiser_edits_pending_idx on public.organiser_edits (created_at) where status = 'pending';

/* ---------------------------------------------------------------------------
 * Delfim's one tap
 * ------------------------------------------------------------------------- */

create table public.admin_actions (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('claim', 'market_stopped', 'edit')),
  -- What the action is about: {claim_id} | {answer_id} | {edit_id}.
  payload     jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_at  timestamptz not null default now(),
  used_at     timestamptz,
  outcome     text check (outcome is null or outcome in ('approved', 'rejected'))
);

comment on table public.admin_actions is
  'One row per decision offered to Delfim in Telegram. The URL carries the id and an HMAC; the row says whether it was used. Single use, 14 days.';

/* ---------------------------------------------------------------------------
 * Publishing on demand
 * ------------------------------------------------------------------------- */

create table public.publish_requests (
  id           uuid primary key default gen_random_uuid(),
  reason       text not null,
  requested_at timestamptz not null default now(),
  -- False when the request was folded into one made in the last ten minutes.
  dispatched   boolean not null default false
);

/* ---------------------------------------------------------------------------
 * Who may touch what
 * ------------------------------------------------------------------------- */

alter table public.organiser_links      enable row level security;
alter table public.organiser_mail_sends enable row level security;
alter table public.organiser_answers    enable row level security;
alter table public.organiser_edits      enable row level security;
alter table public.admin_actions        enable row level security;
alter table public.publish_requests     enable row level security;

revoke all on public.organiser_links, public.organiser_mail_sends, public.organiser_answers,
              public.organiser_edits, public.admin_actions, public.publish_requests
  from anon, authenticated;

-- The Functions.
grant select, insert, update on public.organiser_links      to service_role;
grant select, insert         on public.organiser_mail_sends to service_role;
grant select, insert         on public.organiser_answers    to service_role;
grant select, insert, update on public.organiser_edits      to service_role;
grant select, insert, update on public.admin_actions        to service_role;
grant select, insert, update on public.publish_requests     to service_role;

grant select, insert on public.organisers to service_role;
grant update (email, locale, updated_at) on public.organisers to service_role;

grant update (organiser_id, verified_by, verified_at, stall_count, setting, rain_policy, status, updated_at)
  on public.markets to service_role;

grant select on public.occurrences to service_role;
grant insert on public.occurrences to service_role;
grant update (status, origin, cancellation_note, confirmed_at, start_time, end_time, updated_at)
  on public.occurrences to service_role;

grant update (handled, handled_at, handler_note) on public.organiser_claims to service_role;

-- The dashboard sees counts, never an address.
create view public.organiser_funnel as
  select
    date_trunc('week', s.sent_at)::date                      as week,
    s.kind,
    count(*)                                                 as mails,
    count(*) filter (where a.organiser_id is not null)      as answered,
    count(*) filter (where a.answer = 'on')                  as said_on,
    count(*) filter (where a.answer = 'cancelled')           as said_cancelled,
    count(*) filter (where a.answer = 'changed')             as said_changed
  from public.organiser_mail_sends s
  left join lateral (
    select a.organiser_id, a.answer
    from public.organiser_answers a
    where a.organiser_id = s.organiser_id
      and a.occurrence_id = any (s.occurrence_ids)
      and a.created_at between s.sent_at and s.sent_at + interval '7 days'
    order by a.created_at
    limit 1
  ) a on true
  group by 1, 2
  order by 1 desc, 2;

comment on view public.organiser_funnel is
  'Answer rate by week: mails sent, how many got any button within 7 days, and which. The one number in specs/organisers.md.';

grant select on public.organiser_funnel to metabase_ro;
revoke select on public.organiser_links, public.organiser_mail_sends, public.organiser_edits,
                 public.admin_actions from metabase_ro;

commit;
