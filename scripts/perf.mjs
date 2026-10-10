#!/usr/bin/env node
/**
 * How fast the site is — for real visitors, and in the lab.
 *
 *   node scripts/perf.mjs                         the live site
 *   node scripts/perf.mjs http://localhost:4322   a local build (npm run preview), before a deploy
 *   node scripts/perf.mjs --field                 real visitors only, no browser
 *
 * Two halves, the way large sites watch speed (2026-10-10):
 *
 *  Field  what our own visitors measured, from analytics_events (web_vitals):
 *         the 75th percentile on phones over the last seven days, against
 *         Google's "good" lines — content shown by 2.5 s, a tap answered within
 *         200 ms, layout shift under 0.1 — and against the seven days before.
 *  Lab    Lighthouse (pinned) loading six pages as a mid-range phone on a slow
 *         network: its score, when the main content shows, layout shift, weight.
 *         Compared with the last run, kept in watch-data/perf-last.json.
 *
 * No budgets and nothing fails (Delfim, 2026-10-10: report, don't block). A
 * line starts with ⚠ when a number crossed Google's line or got clearly worse;
 * the weekly Market Watch run puts these lines in its Telegram report.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from './db.mjs';

const LIGHTHOUSE = 'lighthouse@13.5.0';
const PAGES = [
  ['home', 'en/'],
  ['market', 'en/market/flohmarkt-buerkliplatz-zuerich/'],
  ['market, no date', 'en/market/flohmarkt-am-see-wollishofen-zuerich/'],
  ['town', 'en/switzerland/zurich/'],
  ['canton', 'en/switzerland/canton/zurich/'],
  ['near me', 'en/nearby/'],
];
const GOOD = { lcp: 2500, inp: 200, cls: 0.1 };
const root = fileURLToPath(new URL('..', import.meta.url));
const LAST = join(root, 'watch-data', 'perf-last.json');

const seconds = (ms) => `${(ms / 1000).toFixed(1)} s`;

/** Real visitors on phones: this week against last week. */
export async function field() {
  const p75 = (col) => `percentile_cont(0.75) within group (order by (props->>'${col}')::numeric)`;
  const week = (from, to) => query(
    `select count(*)::int n, ${p75('lcp')} lcp, ${p75('inp')} inp, ${p75('cls')} cls
       from analytics_events_classified
      where event_name = 'web_vitals' and not bot_likely and device_class = 'mobile'
        and occurred_at >= now() - interval '${from} days' and occurred_at < now() - interval '${to} days'`
  ).then((rows) => rows[0]);
  const [now, before] = await Promise.all([week(7, 0), week(14, 7)]);
  if (!now || now.n < 20) return [`Speed · real visitors: too few phone visits this week to judge (${now?.n ?? 0}).`];
  const lcp = Number(now.lcp), inp = Number(now.inp), cls = Number(now.cls);
  const bad = [lcp > GOOD.lcp && 'content shows late', inp > GOOD.inp && 'taps answer slowly', cls > GOOD.cls && 'pages jump'].filter(Boolean);
  const worse = before?.n >= 20 && lcp > Number(before.lcp) * 1.25 ? ` — slower than last week (${seconds(Number(before.lcp))})` : '';
  return [`${bad.length || worse ? '⚠ ' : ''}Speed · real visitors on phones (${now.n}): content in ${seconds(lcp)}, taps answered in ${Math.round(inp)} ms, layout shift ${cls.toFixed(2)}${bad.length ? ` — ${bad.join(', ')}` : ''}${worse}.`];
}

/** One page through Lighthouse; null when the browser could not run. */
function lighthouse(url) {
  const out = join(tmpdir(), `fynda-lh-${Date.now()}.json`);
  const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const res = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', [
    '-y', LIGHTHOUSE, url, '--quiet', '--chrome-flags=--headless=new',
    '--only-categories=performance', '--output=json', `--output-path=${out}`,
  ], { stdio: 'ignore', shell: process.platform === 'win32', timeout: 180_000, env: { ...process.env, ...(existsSync(chrome) ? { CHROME_PATH: chrome } : {}) } });
  if (res.status !== 0 || !existsSync(out)) return null;
  const r = JSON.parse(readFileSync(out, 'utf8'));
  const a = r.audits;
  return {
    score: Math.round(r.categories.performance.score * 100),
    lcp: a['largest-contentful-paint'].numericValue,
    cls: a['cumulative-layout-shift'].numericValue,
    kb: Math.round(a['total-byte-weight'].numericValue / 1024),
  };
}

/** Six pages as a slow phone, against the last run. */
export function lab(base = 'https://fynda.market') {
  const last = existsSync(LAST) ? JSON.parse(readFileSync(LAST, 'utf8')) : {};
  const results = {};
  const lines = [];
  for (const [name, path] of PAGES) {
    const m = lighthouse(`${base.replace(/\/$/, '')}/${path}?intern=1`);
    if (!m) { lines.push(`⚠ Lab · ${name}: Lighthouse did not run.`); continue; }
    results[name] = m;
    const was = last[name];
    const flag = m.score < 90 || m.cls > GOOD.cls || (was && m.score <= was.score - 5);
    lines.push(`${flag ? '⚠ ' : ''}Lab · ${name}: ${m.score}${was && was.score !== m.score ? ` (was ${was.score})` : ''} · content in ${seconds(m.lcp)} · shift ${m.cls.toFixed(2)} · ${m.kb} KB`);
  }
  if (base.startsWith('https://fynda.market')) {
    mkdirSync(join(root, 'watch-data'), { recursive: true });
    writeFileSync(LAST, JSON.stringify(results, null, 1));
  }
  return lines;
}

/** The weekly report's lines: one for real visitors, then the lab only where it has news. */
export async function weekly() {
  const lines = await field().catch((e) => [`⚠ Speed · real visitors: could not read (${e.message}).`]);
  const labLines = lab();
  const flagged = labLines.filter((l) => l.startsWith('⚠'));
  lines.push(flagged.length ? flagged.join('\n') : `Speed · lab: all ${labLines.length} pages fine.`);
  return lines;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const base = process.argv.slice(2).find((a) => /^https?:\/\//.test(a));
  for (const l of await field()) console.log(l);
  if (!process.argv.includes('--field')) for (const l of lab(base)) console.log(l);
  process.exit(0);
}
