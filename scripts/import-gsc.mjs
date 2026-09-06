#!/usr/bin/env node
/**
 * Load a Search Console export into search_console_daily.
 *
 *   node scripts/import-gsc.mjs <folder> [--end=YYYY-MM-DD]
 *
 * The API route was the original plan and it wants a Google Cloud project,
 * which wants a credit card. This does the same job from the CSV export the
 * Search Console UI gives away for nothing: open the Performance report, pick
 * a date range, press Export, unzip, point this at the folder.
 *
 * What the export can and cannot give
 * -----------------------------------
 * The UI exports one file per dimension — Pages.csv is per page, Queries.csv is
 * per query, Dates.csv is per day — and never crosses two of them. So there is
 * no day-by-page grid to be had, and pretending otherwise would invent numbers.
 *
 * Every row from one export is therefore stamped with a single day: the last
 * day of the range it covers. A week's export is a week's totals, filed on the
 * day the week ended. That is honest, it re-imports cleanly, and it is exactly
 * the shape the decay question needs — impressions per page type, this period
 * against the last.
 *
 * Query rows carry no page, so they get page_type null and are excluded from
 * the decay view. They are kept because v1's most valuable finding lived in
 * them: explicit-date searches converted at seven times the site average.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { withClient, DB_URL } from './db.mjs';
import { pageTypeOf } from '../functions/_collect.ts';

const args = process.argv.slice(2);
const folder = args.find((a) => !a.startsWith('--'));
const endArg = args.find((a) => a.startsWith('--end='))?.slice(6);

if (!folder || !existsSync(folder)) {
  console.error(`Usage: node scripts/import-gsc.mjs <folder> [--end=YYYY-MM-DD]

Point it at the unzipped Search Console export — the folder holding
Pages.csv and Queries.csv.`);
  process.exit(1);
}

/**
 * A CSV reader that is small on purpose. Search Console quotes any field
 * containing a comma and escapes a quote by doubling it; that is the whole
 * dialect, and a dependency for it would be a dependency to keep updated.
 */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  // A BOM at the start would otherwise become part of the first header.
  for (let i = text.charCodeAt(0) === 0xfeff ? 1 : 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

/** "1.234" and "1,234" are the same number in different locales. */
const num = (v) => {
  const n = Number(String(v ?? '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

/** Search Console names its files in the account's language. Match on shape. */
function findFile(dir, kind) {
  const names = readdirSync(dir);
  const wanted = kind === 'pages'
    ? /^(pages|seiten|pagine|top ?pages)\.csv$/i
    : /^(queries|suchanfragen|requêtes|requetes|query|zapytania)\.csv$/i;
  return names.find((n) => wanted.test(n));
}

const day = endArg ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
  console.error(`--end must look like 2026-09-06, got "${day}"`);
  process.exit(1);
}

const rows = [];

const pagesFile = findFile(folder, 'pages');
if (pagesFile) {
  const csv = parseCsv(readFileSync(join(folder, pagesFile), 'utf8'));
  for (const r of csv.slice(1)) {
    const [url, clicks, impressions, , position] = r;
    if (!/^https?:/i.test(url ?? '')) continue;
    let path;
    try { path = new URL(url).pathname; } catch { continue; }
    rows.push({
      day, page: path, query: '', page_type: pageTypeOf(path),
      clicks: num(clicks), impressions: num(impressions), position: num(position) || null,
    });
  }
  console.log(`  ${pagesFile}: ${rows.length} pages`);
} else {
  console.log('  no Pages.csv found — nothing to file by page type');
}

const queriesFile = findFile(folder, 'queries');
if (queriesFile) {
  const csv = parseCsv(readFileSync(join(folder, queriesFile), 'utf8'));
  let n = 0;
  for (const r of csv.slice(1)) {
    const [term, clicks, impressions, , position] = r;
    if (!term?.trim()) continue;
    rows.push({
      // No page in a query export, and page is part of the key. The empty
      // string is the table's own default and says "this row is about a query,
      // not a page" without inventing a URL that was never in the data.
      day, page: '', query: term.trim().slice(0, 400), page_type: null,
      clicks: num(clicks), impressions: num(impressions), position: num(position) || null,
    });
    n++;
  }
  console.log(`  ${queriesFile}: ${n} queries`);
}

if (!rows.length) {
  console.error('Nothing to import. Is that the unzipped export folder?');
  process.exit(1);
}

await withClient(DB_URL, async (c) => {
  await c.query('begin');
  for (const r of rows) {
    await c.query(
      `insert into public.search_console_daily
         (day, page, query, page_type, clicks, impressions, position, imported_at)
       values ($1, $2, $3, $4, $5, $6, $7, now())
       on conflict (day, page, query) do update
         set clicks = excluded.clicks,
             impressions = excluded.impressions,
             position = excluded.position,
             page_type = excluded.page_type,
             imported_at = now()`,
      [r.day, r.page, r.query, r.page_type, r.clicks, r.impressions, r.position]
    );
  }
  await c.query('commit');
});

console.log(`\nImported ${rows.length} rows, filed under ${day}.`);
