#!/usr/bin/env node
/**
 * Say that a market's dates were checked against a source, today.
 *
 *   node scripts/confirm.mjs <market-slug> --source <url>            # every upcoming date
 *   node scripts/confirm.mjs <market-slug> --source <url> 2026-10-14  # only these dates
 *   add --apply to write; without it the script only says what it would do
 *
 * What it does, per date: sets `occurrences.confirmed_at` to now, which is
 * the "confirmed on <date>" a market page prints, and writes one row to the
 * `facts` ledger naming the source, so the stamp can always be traced back.
 * Cancelled dates are left alone — a cancellation is its own claim.
 *
 * Why it exists (2026-09-19): a whole afternoon of checking organisers' sites
 * left every stamp at its old date, because nothing but the import ever wrote
 * `confirmed_at`. A check that does not move the stamp did not happen as far
 * as the visitor can tell. So: checked a market against its website? Run
 * this. No exceptions, and no hand-written UPDATE instead.
 */

import { query, withClient, DB_URL } from './db.mjs';

const args = process.argv.slice(2);
const slug = args[0];
const source = args.includes('--source') ? args[args.indexOf('--source') + 1] : null;
const apply = args.includes('--apply');
const dates = args.filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));

if (!slug || !source || !/^https?:\/\//.test(source)) {
  console.error('\n  Usage: node scripts/confirm.mjs <market-slug> --source <url> [YYYY-MM-DD ...] [--apply]\n');
  process.exit(1);
}

const [market] = await query(`select id, slug from public.markets where slug = $1`, [slug]);
if (!market) { console.error(`No market with slug "${slug}".`); process.exit(1); }

const rows = await query(
  `select id, date::text, status, confirmed_at::date::text as confirmed_at
     from public.occurrences
    where market_id = $1 and date >= current_date and status <> 'cancelled'
      and ($2::text[] = '{}' or date::text = any($2))
    order by date`,
  [market.id, dates]);

if (rows.length === 0) { console.log('Nothing to confirm: no upcoming, non-cancelled dates match.'); process.exit(0); }

for (const r of rows) console.log(`  ${r.date}  ${r.status}  was ${r.confirmed_at ?? 'never'}`);
console.log(`${rows.length} date(s) of ${market.slug} → checked today against ${source}`);

if (!apply) { console.log('Dry run. Add --apply to write.'); process.exit(0); }

await withClient(DB_URL, async (c) => {
  await c.query('begin');
  await c.query(`update public.occurrences set confirmed_at = now(), updated_at = now() where id = any($1)`, [rows.map((r) => r.id)]);
  for (const r of rows) {
    await c.query(
      `insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
       values ('occurrence', $1, 'date', to_jsonb($2::text), 'website_crawl', $3, now(), 'confirmed')`,
      [r.id, r.date, source]);
  }
  await c.query('commit');
});
console.log('Written.');
process.exit(0);
