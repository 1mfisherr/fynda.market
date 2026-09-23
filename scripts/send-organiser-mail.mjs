#!/usr/bin/env node
/**
 * The seven-day mail to organisers.
 *
 * For every market date exactly seven days from now whose organiser we can
 * reach — an e-mail and a live personal link — one mail per organiser with
 * three buttons per date: it's on, cancelled, something changed. The buttons
 * carry the organiser's own link (functions/_organiser.ts derives it from the
 * link id and ADMIN_SIGNING_SECRET, so it is never stored).
 *
 *   node scripts/send-organiser-mail.mjs                 # dry run, mails nobody
 *   node scripts/send-organiser-mail.mjs --only=me@x.ch  # one organiser, still dry
 *   node scripts/send-organiser-mail.mjs --send          # actually sends
 *   node scripts/send-organiser-mail.mjs --date=2026-09-23   # ask about that date
 *
 * Sends nothing without --send. One organiser_mail_sends row per organiser is
 * written BEFORE the send and names the dates it asked about; a date already
 * asked about is never asked again, so a re-run after a crash sends only what
 * is missing. That table is the denominator of the answer rate.
 */

import { query, secret } from './db.mjs';
import { organiserAsk, sendMail } from '../functions/_mail.ts';
import { answerUrl, tokenFor } from '../functions/_link.ts';

const SITE = 'https://fynda.market';

const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

const send = has('send');
const only = value('only')?.trim().toLowerCase();

/** Seven days from today, Swiss calendar. Overridable for a test or a late run. */
const target = value('date') ?? (() => {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Zurich' }));
  d.setDate(d.getDate() + 7);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

const say = (...parts) => console.log(...parts);
const localIso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/* -------------------------------------------------------------------------- */

const SIGNING = secret('ADMIN_SIGNING_SECRET');
if (!SIGNING) {
  console.error('\n  ADMIN_SIGNING_SECRET is not set; the buttons cannot be built.\n');
  process.exit(1);
}
const RESEND_API_KEY = secret('RESEND_API_KEY');
if (send && !RESEND_API_KEY) {
  console.error('\n  Refusing to send: RESEND_API_KEY is not set.\n');
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* Who is asked about what                                                    */
/* -------------------------------------------------------------------------- */

const rows = await query(
  `
  with named as (
    select
      o.id            as occurrence_id,
      o.date,
      o.start_time,
      o.end_time,
      m.id            as market_id,
      m.slug,
      org.id          as organiser_id,
      org.name        as organiser_name,
      lower(org.email) as email,
      coalesce(org.locale, 'en') as locale,
      l.id            as link_id,
      v.city_id
    from public.occurrences o
    join public.markets m         on m.id = o.market_id and m.status = 'active'
    join public.organisers org    on org.id = m.organiser_id and org.email is not null
    join public.organiser_links l on l.organiser_id = org.id and l.revoked_at is null
    join public.venues v          on v.id = m.venue_id
    where o.date = $1::date
      and o.status <> 'cancelled'
      and not exists (
        select 1 from public.organiser_mail_sends s
        where s.organiser_id = org.id and o.id = any (s.occurrence_ids)
      )
      -- Only organisers who have heard from us: the welcome letter went out,
      -- or they have opened their page. A first mail that is three buttons
      -- asking a stranger to confirm a date reads as spam (2026-09-23).
      and (
        exists (select 1 from public.organiser_mail_sends w where w.organiser_id = org.id and w.kind = 'welcome')
        or l.last_used_at is not null
      )
  )
  select n.*,
    coalesce(
      (select value from public.texts t where t.entity_type = 'market' and t.entity_id = n.market_id and t.field = 'name' and t.locale = n.locale),
      (select value from public.texts t where t.entity_type = 'market' and t.entity_id = n.market_id and t.field = 'name' and t.locale = 'en'),
      n.slug
    ) as market_name,
    coalesce(
      (select value from public.texts t where t.entity_type = 'city' and t.entity_id = n.city_id and t.field = 'name' and t.locale = n.locale),
      (select value from public.texts t where t.entity_type = 'city' and t.entity_id = n.city_id and t.field = 'name' and t.locale = 'en'),
      ''
    ) as town
  from named n
  order by n.organiser_name, n.slug
  `,
  [target]
);

const byOrganiser = new Map();
for (const row of rows) {
  if (only && row.email !== only) continue;
  if (!byOrganiser.has(row.organiser_id)) byOrganiser.set(row.organiser_id, { ...row, items: [] });
  byOrganiser.get(row.organiser_id).items.push(row);
}

say(`\n  Seven-day mail for ${target}: ${rows.length} date${rows.length === 1 ? '' : 's'}, ${byOrganiser.size} organiser${byOrganiser.size === 1 ? '' : 's'}${only ? ` (only ${only})` : ''}.`);
if (!send) say('  Dry run — nobody is mailed. Pass --send to send.\n');

/* -------------------------------------------------------------------------- */
/* Build and send                                                             */
/* -------------------------------------------------------------------------- */

let sent = 0;
let shown = false;

for (const organiser of byOrganiser.values()) {
  const token = await tokenFor(SIGNING, organiser.link_id);
  const items = organiser.items.map((row) => ({
    market: row.market_name,
    town: row.town,
    date: row.date instanceof Date ? localIso(row.date) : String(row.date),
    startTime: row.start_time,
    endTime: row.end_time,
    onUrl: answerUrl(SITE, token, row.occurrence_id, 'on'),
    cancelledUrl: answerUrl(SITE, token, row.occurrence_id, 'cancelled'),
    changedUrl: answerUrl(SITE, token, row.occurrence_id, 'changed'),
  }));

  const mail = organiserAsk(organiser.locale, organiser.organiser_name, items);
  say(`  ${organiser.organiser_name} <${organiser.email}> [${organiser.locale}] — ${items.map((i) => `${i.market} ${i.date}`).join('; ')}`);

  if (!shown) {
    say('\n' + mail.text.split('\n').map((l) => `    ${l}`).join('\n'));
    shown = true;
  }

  if (!send) continue;

  const [row] = await query(
    `insert into public.organiser_mail_sends (organiser_id, occurrence_ids, kind) values ($1, $2::uuid[], 'seven_days') returning id`,
    [organiser.organiser_id, organiser.items.map((i) => i.occurrence_id)]
  );

  const ok = await sendMail({ RESEND_API_KEY }, { to: organiser.email, ...mail });
  if (ok) {
    sent += 1;
  } else {
    // The row said "asked"; it was not. Take it back so the next run asks.
    await query(`delete from public.organiser_mail_sends where id = $1`, [row.id]);
    console.error(`  FAILED: ${organiser.email}`);
  }
}

say(send ? `\n  Sent ${sent} of ${byOrganiser.size}.\n` : '');
process.exit(0);
