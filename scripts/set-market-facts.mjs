#!/usr/bin/env node
/**
 * Researched market facts into the database, each with its source.
 *
 *   node scripts/set-market-facts.mjs intake/facts/<batch>.json            # dry run
 *   node scripts/set-market-facts.mjs intake/facts/<batch>.json --apply
 *
 * For the facts only an organiser or their website knows — indoor/outdoor,
 * roughly how many stalls, what rain does, who sells. A batch is a JSON array of
 *
 *   { "slug", "field": "setting" | "stall_count" | "rain_policy" | "seller_mix" | "tag", "value",
 *     "confidence": "stated" | "inferred", "source": "<url>", "quote": "…" }
 *
 * `stated` means the page says it; `inferred` means it follows from what the
 * page says (a market in a public park is outdoors). A guess is neither and
 * does not go in the file. The file is committed: the quote lives there.
 *
 * Per fact: sets the column on markets and writes one row to the facts ledger
 * (source_type website_crawl, the URL as source_ref). The history book records
 * the column change on its own. Refuses to overwrite: a market whose field
 * already holds a different value is reported and skipped — an organiser's
 * own answer outranks anything we read on the web.
 *
 * A "tag" is what a visitor finds there (tags.key: antiques, records_books…).
 * A market holds several, so a tag is added to market_tags rather than set on
 * a column, and is never removed here — only added.
 */

import { readFileSync } from 'node:fs';
import { query, withClient, DB_URL } from './db.mjs';

const file = process.argv[2];
const apply = process.argv.includes('--apply');
if (!file) { console.error('\n  Usage: node scripts/set-market-facts.mjs <batch.json> [--apply]\n'); process.exit(1); }

const ALLOWED = {
  setting: (v) => ['indoor', 'outdoor', 'both'].includes(v),
  stall_count: (v) => Number.isInteger(v) && v > 0,
  rain_policy: (v) => ['runs', 'cancelled', 'decided_on_the_day'].includes(v),
  // Private people only, a mix, or dealers — the buyer's question after size.
  seller_mix: (v) => ['private', 'mixed', 'trader'].includes(v),
  tag: (v) => ['antiques', 'furniture', 'clothes', 'records_books', 'kids', 'food'].includes(v),
};

const batch = JSON.parse(readFileSync(file, 'utf8'));
const todo = [];
let problems = 0;

for (const f of batch) {
  const where = `${f.slug} ${f.field}`;
  if (!ALLOWED[f.field]) { console.log(`  ✖ ${where}: unknown field`); problems++; continue; }
  if (!ALLOWED[f.field](f.value)) { console.log(`  ✖ ${where}: value ${JSON.stringify(f.value)} not allowed`); problems++; continue; }
  if (!['stated', 'inferred'].includes(f.confidence)) { console.log(`  ✖ ${where}: confidence must be stated or inferred`); problems++; continue; }
  if (!/^https?:\/\//.test(f.source ?? '')) { console.log(`  ✖ ${where}: no source URL`); problems++; continue; }

  const [m] = f.field === 'tag'
    ? await query(`select m.id, (select t.key from public.market_tags mt join public.tags t on t.id = mt.tag_id where mt.market_id = m.id and t.key = $2) as current from public.markets m where m.slug = $1`, [f.slug, f.value])
    : await query(`select id, ${f.field} as current from public.markets where slug = $1`, [f.slug]);
  if (!m) { console.log(`  ✖ ${where}: no such market`); problems++; continue; }
  if (m.current !== null && m.current !== f.value) {
    console.log(`  – ${where}: already ${JSON.stringify(m.current)}, not overwriting with ${JSON.stringify(f.value)}`);
    continue;
  }
  if (m.current === f.value) { console.log(`  = ${where}: already ${JSON.stringify(f.value)}`); continue; }
  console.log(`  + ${where} = ${JSON.stringify(f.value)} (${f.confidence})`);
  todo.push({ ...f, id: m.id });
}

console.log(`${todo.length} to write, ${problems} problem(s), ${batch.length} in the file.`);
if (problems) { console.log('Fix the file first; nothing written.'); process.exit(1); }
if (!apply) { console.log('Dry run. Add --apply to write.'); process.exit(0); }

await withClient(DB_URL, async (c) => {
  await c.query('begin');
  for (const f of todo) {
    if (f.field === 'tag') {
      await c.query(`insert into public.market_tags (market_id, tag_id) select $1, id from public.tags where key = $2 on conflict do nothing`, [f.id, f.value]);
    } else {
      await c.query(`update public.markets set ${f.field} = $2, updated_at = now() where id = $1`, [f.id, f.value]);
    }
    await c.query(
      `insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
       values ('market', $1, $2, to_jsonb($3::text), 'website_crawl', $4, now(), $5)`,
      [f.id, f.field, String(f.value), f.source, f.confidence === 'stated' ? 'confirmed' : 'inferred']);
  }
  await c.query('commit');
});
console.log('Written.');
process.exit(0);
