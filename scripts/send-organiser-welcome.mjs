#!/usr/bin/env node
/**
 * The welcome mail to organisers whose address we imported — people who never
 * asked. It says what fynda.market is, hands them their personal link, and
 * offers a way out (functions/_mail.ts, `organiserWelcome(..., 'listed')`).
 *
 *   node scripts/send-organiser-welcome.mjs                 # dry run, mails nobody
 *   node scripts/send-organiser-welcome.mjs --only=me@x.ch  # one organiser, still dry
 *   node scripts/send-organiser-welcome.mjs --send          # actually sends
 *   node scripts/send-organiser-welcome.mjs --test=me@x.ch  # the first mail, to that address, nothing logged
 *
 * Who: every organiser with an e-mail address and a live link who has no
 * `welcome` row in organiser_mail_sends yet. The claim path writes that row
 * too, so an organiser Delfim approved is never welcomed twice. The row is
 * written BEFORE the send and taken back if Resend refuses, so a re-run after
 * a crash sends only what is missing. Sends nothing without --send.
 */

import { query, secret } from './db.mjs';
import { organiserWelcome, sendMail } from '../functions/_mail.ts';
import { editUrl, tokenFor } from '../functions/_link.ts';

const SITE = 'https://fynda.market';

const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

const send = has('send');
const only = value('only')?.trim().toLowerCase();
const test = value('test')?.trim().toLowerCase();
/*
 * Resend's free plan takes 100 mails a day and 2 a second. 90 leaves room for
 * the day's other mail; whoever is left gets theirs on the next run, because
 * the query only picks organisers without a welcome row.
 */
const limit = Number(value('limit')) || 90;
const pause = () => new Promise((resolve) => setTimeout(resolve, 600));
const say = (...parts) => console.log(...parts);

const SIGNING = secret('ADMIN_SIGNING_SECRET');
if (!SIGNING) {
  console.error('\n  ADMIN_SIGNING_SECRET is not set; the link cannot be built.\n');
  process.exit(1);
}
const RESEND_API_KEY = secret('RESEND_API_KEY');
if ((send || test) && !RESEND_API_KEY) {
  console.error('\n  Refusing to send: RESEND_API_KEY is not set.\n');
  process.exit(1);
}

/* -------------------------------------------------------------------------- */

const rows = await query(
  `
  select
    org.id            as organiser_id,
    org.name          as organiser_name,
    lower(org.email)  as email,
    coalesce(org.locale, 'en') as locale,
    l.id              as link_id,
    m.slug,
    m.count           as market_count,
    coalesce(
      (select value from public.texts t where t.entity_type = 'market' and t.entity_id = m.id and t.field = 'name' and t.locale = coalesce(org.locale, 'en')),
      (select value from public.texts t where t.entity_type = 'market' and t.entity_id = m.id and t.field = 'name' and t.locale = 'en'),
      m.slug
    ) as market_name
  from public.organisers org
  join public.organiser_links l on l.organiser_id = org.id and l.revoked_at is null
  join lateral (
    select m.id, m.slug, count(*) over () as count from public.markets m
    where m.organiser_id = org.id and m.status = 'active'
    order by m.slug limit 1
  ) m on true
  where org.email is not null
    and not exists (
      select 1 from public.organiser_mail_sends s
      where s.organiser_id = org.id and s.kind = 'welcome'
    )
  order by org.name
  `
);

const list = rows.filter((row) => !only || row.email === only);

/** "Alpin-Flohmi Basel und 8 weitere Märkte" — the mail's %m for an organiser with several. */
const OTHERS = {
  de: (n) => (n === 1 ? 'und ein weiterer Markt' : `und ${n} weitere Märkte`),
  fr: (n) => `et ${n} ${n === 1 ? 'autre marché' : 'autres marchés'}`,
  it: (n) => `e ${n === 1 ? 'un altro mercatino' : `altri ${n} mercatini`}`,
  en: (n) => `and ${n} other ${n === 1 ? 'market' : 'markets'}`,
};
const marketPhrase = (row) => {
  const others = Number(row.market_count) - 1;
  return others > 0 ? `${row.market_name} ${(OTHERS[row.locale] ?? OTHERS.en)(others)}` : row.market_name;
};

say(`\n  Welcome mail: ${list.length} organiser${list.length === 1 ? '' : 's'} without one${only ? ` (only ${only})` : ''}; at most ${limit} this run.`);
if (!send) say('  Dry run — nobody is mailed. Pass --send to send.\n');

let sent = 0;
let shown = false;

for (const row of list) {
  const url = editUrl(SITE, await tokenFor(SIGNING, row.link_id));
  const mail = organiserWelcome(row.locale, row.organiser_name, marketPhrase(row), url, 'listed');
  say(`  ${row.organiser_name} <${row.email}> [${row.locale}] — ${marketPhrase(row)}`);

  if (!shown) {
    say('\n' + mail.text.split('\n').map((l) => `    ${l}`).join('\n'));
    shown = true;
    if (test) {
      // A preview in a real inbox: this organiser's mail, to the tester, no row written.
      const ok = await sendMail({ RESEND_API_KEY }, { to: test, ...mail });
      say(ok ? `\n  Test mail sent to ${test}.\n` : `\n  Test mail to ${test} FAILED.\n`);
      process.exit(ok ? 0 : 1);
    }
  }

  if (!send) continue;
  if (sent >= limit) break;
  await pause();

  const [log] = await query(
    `insert into public.organiser_mail_sends (organiser_id, occurrence_ids, kind) values ($1, '{}'::uuid[], 'welcome') returning id`,
    [row.organiser_id]
  );
  const ok = await sendMail({ RESEND_API_KEY }, { to: row.email, ...mail });
  if (ok) {
    sent += 1;
  } else {
    // The row said "welcomed"; they were not. Take it back so the next run tries again.
    await query(`delete from public.organiser_mail_sends where id = $1`, [log.id]);
    console.error(`  FAILED: ${row.email}`);
  }
}

say(send ? `\n  Sent ${sent} of ${list.length}.\n` : '');
process.exit(0);
