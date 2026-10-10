#!/usr/bin/env node
/**
 * "Tell me when it's back" — the one mail each alert sends.
 *
 * A visitor on a market page with no date, or a town page with nothing dated,
 * left an address (functions/b.ts, table date_alerts). This finds every alert
 * whose market — or, for a town, any market there — now has a date on the
 * live site, and sends it that date. Run nightly by .github/workflows/publish.yml
 * right after the rebuild, so the page the mail links to already shows the date.
 *
 *   node scripts/send-date-alerts.mjs           # dry run, mails nobody
 *   node scripts/send-date-alerts.mjs --send    # actually sends
 *
 * **It sends nothing unless --send is passed**, and refuses to send from the
 * six sample markets (FYNDA_DATA_SOURCE must be supabase) — the same two
 * guards as the Friday digest, for the same reason: a mail cannot be recalled.
 *
 * Each alert is claimed before its mail goes: the address is cleared and
 * notified_at stamped in one statement, and put back only if the send call
 * fails. A crash in between costs that person their mail; the other order
 * would cost them a second one. Alerts older than 400 days with no date are
 * expired the same way — the address cleared, the row kept as a count.
 */

import { query, secret, DB_URL } from './db.mjs';
import { getMarkets } from '../src/lib/markets.ts';
import { formatTimeRange } from '../src/lib/format.ts';
import { marketPath } from '../src/lib/i18n.ts';
import { backMail, sendBatch, SITE } from '../functions/_mail.ts';

const BATCH = 100;
const send = process.argv.includes('--send');
// The page query reads the address from the environment; on a laptop it lives in .env.local.
process.env.SUPABASE_DB_URL ??= DB_URL;
const say = (...parts) => console.log(...parts);

if (send && (process.env.FYNDA_DATA_SOURCE ?? 'fixtures') !== 'supabase') {
  console.error('\n  Refusing to send: FYNDA_DATA_SOURCE is not "supabase", so the markets would be the samples.\n');
  process.exit(1);
}
const RESEND_API_KEY = secret('RESEND_API_KEY');
if (send && !RESEND_API_KEY) {
  console.error('\n  Refusing to send: RESEND_API_KEY is not set.\n');
  process.exit(1);
}

/* -------------------------------------------------------------------------- */

if (send) {
  const expired = await query(
    `update date_alerts set email = null, expired_at = now()
      where email is not null and created_at < now() - interval '400 days'
      returning id`
  );
  if (expired.length) say(`  ${expired.length} alerts waited 400 days with no date; their addresses are cleared.`);
}

/* Waiting alerts, with a town alert's town as the slug the site uses in this
   alert's own language. */
const waiting = await query(
  `select a.id, a.email, a.locale, a.market_id, sc.slug as city_slug
     from date_alerts a
     left join slugs sc on sc.entity_type = 'city' and sc.entity_id = a.city_id
                       and sc.locale = a.locale and sc.is_current
    where a.email is not null
    order by a.created_at`
);

if (waiting.length === 0) {
  say('\n  No alerts waiting.\n');
  process.exit(0);
}

/* The live site's markets, once per language — the same query the pages are built from. */
const locales = [...new Set(waiting.map((a) => a.locale))];
const marketsBy = Object.fromEntries(await Promise.all(locales.map(async (l) => [l, await getMarkets(l)])));

/* What an alert would say, or nothing while there is still no date. A
   market's `next` is its first date that is not cancelled. */
const due = [];
for (const alert of waiting) {
  const markets = marketsBy[alert.locale];
  const market = alert.market_id
    ? markets.find((m) => m.id === alert.market_id && m.next)
    : markets.filter((m) => m.citySlug === alert.city_slug && m.next)
        .sort((a, b) => a.next.date.localeCompare(b.next.date))[0];
  if (!market) continue;

  const later = market.upcoming
    .filter((o) => o.status !== 'cancelled' && o.date > market.next.date)
    .slice(0, 2)
    .map((o) => o.date);

  due.push({
    alert,
    mail: {
      to: alert.email,
      ...backMail(alert.locale, {
        kind: alert.market_id ? 'market' : 'town',
        market: market.name,
        town: market.city,
        date: market.next.date,
        hours: formatTimeRange(market.next.startTime, market.next.endTime, alert.locale),
        later,
        url: `${SITE}${marketPath(alert.locale, market.slug)}`,
      }),
    },
  });
}

say(`\n  ${waiting.length} alerts waiting, ${due.length} with a date now.`);
if (due.length === 0) process.exit(0);

if (!send) {
  const sample = due[0].mail;
  say('\n  Dry run — nothing was sent. Pass --send to mail them.');
  say(`\n  ── The first, as ${sample.to} would get it ` + '─'.repeat(20));
  say(`  Subject: ${sample.subject}\n`);
  say(sample.text.split('\n').map((line) => `  ${line}`).join('\n'));
  say('  ' + '─'.repeat(60) + '\n');
  process.exit(0);
}

/* -------------------------------------------------------------------------- */

let sent = 0;
let failed = 0;
for (let start = 0; start < due.length; start += BATCH) {
  const batch = due.slice(start, start + BATCH);
  const ids = batch.map((d) => d.alert.id);

  // Claimed: the address leaves the table as the mail is about to leave us.
  await query(`update date_alerts set email = null, notified_at = now() where id = any($1::uuid[])`, [ids]);

  const result = await sendBatch({ RESEND_API_KEY }, batch.map((d) => d.mail));
  if (result.error) {
    // The call did not happen: give every address back for the next run.
    for (const d of batch) {
      await query(`update date_alerts set email = $2, notified_at = null where id = $1`, [d.alert.id, d.alert.email]);
    }
    failed += batch.length;
    console.error(`  batch ${start / BATCH + 1} failed and was put back: ${result.error}`);
    continue;
  }
  sent += result.sent;
}

say(`  ${sent} sent${failed ? `, ${failed} put back for a later run` : ''}.\n`);
process.exit(failed ? 1 : 0);
