#!/usr/bin/env node
/**
 * Researched market facts into the database, each with its source.
 *
 *   node scripts/set-market-facts.mjs intake/facts/<batch>.json            # dry run
 *   node scripts/set-market-facts.mjs intake/facts/<batch>.json --apply
 *
 * For the facts only an organiser or their website knows — indoor/outdoor,
 * roughly how many stalls, what rain does. A batch is a JSON array of
 *
 *   { "slug", "field": "setting" | "stall_count" | "rain_policy", "value",
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

  const [m] = await query(`select id, ${f.field} as current from public.markets where slug = $1`, [f.slug]);
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
    await c.query(`update public.markets set ${f.field} = $2, updated_at = now() where id = $1`, [f.id, f.value]);
    await c.query(
      `insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
       values ('market', $1, $2, to_jsonb($3::text), 'website_crawl', $4, now(), $5)`,
      [f.id, f.field, String(f.value), f.source, f.confidence === 'stated' ? 'confirmed' : 'inferred']);
  }
  await c.query('commit');
});
console.log('Written.');
process.exit(0);
