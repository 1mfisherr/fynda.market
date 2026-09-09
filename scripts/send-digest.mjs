#!/usr/bin/env node
/**
 * The Friday digest.
 *
 * One issue per subscriber: the coming weekend, their own town first, the rest
 * of the country under it. Built from the same query layer and the same
 * weekend arithmetic as the pages (src/lib/digest.ts), so the e-mail and the
 * site cannot start disagreeing about what is on.
 *
 *   node scripts/send-digest.mjs                  # dry run, mails nobody
 *   node scripts/send-digest.mjs --only=me@x.ch   # dry run for one address
 *   node scripts/send-digest.mjs --send           # actually sends
 *
 * **It sends nothing unless --send is passed.** A run with no flag prints what
 * it would do and renders one issue to the terminal. This is not politeness:
 * an e-mail cannot be recalled, and the difference between testing the job and
 * mailing the list has to be a thing you type, not a thing you remember.
 *
 * Three guards, in the order they matter:
 *
 *  1. **It refuses to run on fixtures.** getMarkets falls back to six sample
 *     markets without FYNDA_DATA_SOURCE=supabase. Publishing those to a
 *     website is a bad afternoon; mailing them to real people is not
 *     recoverable.
 *  2. **One row per subscriber per issue, written before the send.** The
 *     primary key on newsletter_sends is what makes a re-run safe — see the
 *     migration for why that ordering is the pessimistic one on purpose.
 *  3. **An empty issue is not sent.** A weekend with nothing in it is not
 *     news, and a mail that says nothing is what teaches people to ignore the
 *     next one.
 */

import { query, withClient, DB_URL, secret } from './db.mjs';
import { getMarkets } from '../src/lib/markets.ts';
import { buildDigest, isEmpty } from '../src/lib/digest.ts';
import { digestMail, sendBatch } from '../functions/_mail.ts';

/* Resend's own ceiling. Also the unit of rollback: a batch either goes or it
   does not, and the rows for it are taken back together. */
const BATCH = 100;

const args = process.argv.slice(2);
const has = (name) => args.includes(`--${name}`);
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

const send = has('send');
const only = value('only')?.trim().toLowerCase();
const limit = Number(value('limit')) || null;

/** The Friday this issue belongs to. Overridable so a late run is still one issue. */
const now = value('date') ? new Date(`${value('date')}T12:00:00`) : new Date();
const issueDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const say = (...parts) => console.log(...parts);

/* -------------------------------------------------------------------------- */

if (send && (process.env.FYNDA_DATA_SOURCE ?? 'fixtures') !== 'supabase') {
  console.error(
    '\n  Refusing to send: FYNDA_DATA_SOURCE is not "supabase", so the markets\n' +
      '  would be the six samples from src/lib/fixtures.ts. Set it and try again.\n'
  );
  process.exit(1);
}

const RESEND_API_KEY = secret('RESEND_API_KEY');
if (send && !RESEND_API_KEY) {
  console.error('\n  Refusing to send: RESEND_API_KEY is not set.\n');
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* Who still needs this issue                                                 */
/* -------------------------------------------------------------------------- */

/*
 * The left join is the once-per-issue rule as a query: anyone who already has
 * a row for this issue is not selected, so a re-run after a crash picks up
 * exactly where it stopped. Unsubscribed addresses keep their row and are
 * never selected — that is the suppression record the privacy policy promises.
 */
const subscribers = await query(
  `select s.id, s.email, s.town, s.locale, s.unsubscribe_token
     from newsletter_subscribers s
     left join newsletter_sends x
       on x.subscriber_id = s.id and x.issue_date = $1
    where s.unsubscribed_at is null
      and x.subscriber_id is null
      ${only ? 'and lower(s.email) = $2' : ''}
    order by s.created_at`,
  only ? [issueDate, only] : [issueDate]
);

const wanted = limit ? subscribers.slice(0, limit) : subscribers;

if (wanted.length === 0) {
  say(`\n  Nobody to write to for the issue of ${issueDate}.`);
  say('  Either the list is empty, or everyone on it already has this one.\n');
  process.exit(0);
}

/* -------------------------------------------------------------------------- */
/* Build every issue before sending any of them                               */
/* -------------------------------------------------------------------------- */

/* Markets are fetched once per language rather than once per subscriber: the
   names and descriptions differ by locale, nothing else does. */
const needed = [...new Set(wanted.map((s) => s.locale))];
const marketsByLocale = Object.fromEntries(
  await Promise.all(needed.map(async (locale) => [locale, await getMarkets(locale)]))
);

const issues = [];
let empty = 0;

for (const subscriber of wanted) {
  const digest = buildDigest(marketsByLocale[subscriber.locale], {
    town: subscriber.town,
    locale: subscriber.locale,
    now,
  });

  if (isEmpty(digest)) { empty += 1; continue; }

  issues.push({
    subscriber,
    markets: digest.own.length + digest.elsewhere.length,
    mail: { to: subscriber.email, ...digestMail(subscriber.locale, digest, subscriber.unsubscribe_token) },
  });
}

say(`\n  Issue of ${issueDate}`);
say(`  ${subscribers.length} on the list and owed this issue, ${issues.length} to write to` +
    (empty ? `, ${empty} skipped for having nothing in them` : ''));

if (issues.length === 0) { say('  Nothing to send.\n'); process.exit(0); }

/* -------------------------------------------------------------------------- */
/* Dry run                                                                    */
/* -------------------------------------------------------------------------- */

if (!send) {
  const sample = issues[0];
  say(`\n  Dry run — nothing was sent. Pass --send to actually mail people.`);
  say(`\n  ── First issue, as ${sample.subscriber.email} would get it ` + '─'.repeat(20));
  say(`  Subject: ${sample.mail.subject}\n`);
  say(sample.mail.text.split('\n').map((line) => `  ${line}`).join('\n'));
  say('  ' + '─'.repeat(60) + '\n');

  const byLocale = {};
  for (const issue of issues) byLocale[issue.subscriber.locale] = (byLocale[issue.subscriber.locale] ?? 0) + 1;
  say(`  Languages: ${Object.entries(byLocale).map(([l, n]) => `${l} ${n}`).join(', ')}`);
  say(`  Batches of ${BATCH}: ${Math.ceil(issues.length / BATCH)}\n`);
  process.exit(0);
}

/* -------------------------------------------------------------------------- */
/* Send                                                                       */
/* -------------------------------------------------------------------------- */

let sent = 0;
let failed = 0;

for (let start = 0; start < issues.length; start += BATCH) {
  const batch = issues.slice(start, start + BATCH);
  const ids = batch.map((issue) => issue.subscriber.id);

  /*
   * Claimed first. If the process dies between here and the call below, those
   * people miss one issue — which is the failure we chose, because the other
   * ordering turns the same crash into the same person being mailed twice, and
   * a spam complaint is the one thing that costs us every future delivery.
   */
  await withClient(DB_URL, async (client) => {
    await client.query('begin');
    await client.query(
      `insert into newsletter_sends (subscriber_id, issue_date, markets)
       select * from unnest($1::uuid[], $2::date[], $3::int[])
       on conflict do nothing`,
      [ids, ids.map(() => issueDate), batch.map((issue) => issue.markets)]
    );
    await client.query('commit');
  });

  const result = await sendBatch({ RESEND_API_KEY }, batch.map((issue) => issue.mail));

  if (result.error) {
    /* The call did not happen, so the claim was wrong. Give it back and the
       next run picks these people up again. */
    await query('delete from newsletter_sends where issue_date = $1 and subscriber_id = any($2::uuid[])',
      [issueDate, ids]);
    failed += batch.length;
    console.error(`  batch ${start / BATCH + 1} failed and was rolled back: ${result.error}`);
    continue;
  }

  await query(
    `update newsletter_subscribers
        set sent_count = sent_count + 1, last_sent_at = now()
      where id = any($1::uuid[])`,
    [ids]
  );

  sent += result.sent;
  say(`  batch ${start / BATCH + 1}: ${result.sent} sent`);
}

say(`\n  ${sent} sent${failed ? `, ${failed} rolled back for a later run` : ''}.\n`);
process.exit(failed ? 1 : 0);
