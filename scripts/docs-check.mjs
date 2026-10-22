#!/usr/bin/env node
/**
 * Keeps the docs short enough to be followed and true enough to be trusted.
 *
 *   node scripts/docs-check.mjs           every line
 *   node scripts/docs-check.mjs --quiet   only WARN and FAIL (the session-start hook)
 *
 * Runs first in `verify` and `deploy`, and at every session start
 * (.claude/hooks/start.mjs). Locally only: it costs no GitHub Actions.
 *
 * FAIL — a file past its ceiling, a line past 1,500 characters, a doc missing
 *        from the map in docs/README.md. The fix is always to cut, never to
 *        raise a number: budgets only go down.
 * WARN — over a target; a backticked path or a `§Section` pointer that leads
 *        nowhere; the guardrail count in the docs not matching the code;
 *        PLAN.md not rewritten for ten days; one sentence living in two docs.
 *
 * Why: PLAN.md went from 5 KB to 38 KB in five weeks, one appended log at a
 * time, while a rule said not to. Sentences ask for care; this checks.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const quiet = process.argv.includes('--quiet');

// Bytes: [target, ceiling], set just above each file's size after the 2026-10-22 cut.
// Lower them when a file shrinks; never raise them.
const budgets = {
  'CLAUDE.md': [10_000, 11_000],
  'README.md': [1_500, 2_500],
  'docs/README.md': [4_500, 5_000],
  'docs/PLAN.md': [15_000, 20_000],
  'docs/ARCHITECTURE.md': [16_000, 17_000],
  'docs/PAGES.md': [16_500, 18_000],
  'docs/MARKET-PAGE.md': [12_500, 14_000],
  'docs/WATCH.md': [6_000, 8_000],
  'docs/STACK.md': [12_500, 14_000],
  'docs/BRAND.md': [15_500, 16_000],
  'docs/PRODUCT.md': [10_500, 11_000],
  'docs/IDEAS.md': [6_000, 8_000],
};
const DEFAULT = [6_000, 8_000];
const line = { target: 800, ceiling: 1_500 };

const read = (f) => readFileSync(join(root, f), 'utf8').replace(/\r\n/g, '\n');
const results = [];
const report = (status, file, msg) => results.push({ status, text: `${status}  ${file}  ${msg}` });

const docs = [
  'CLAUDE.md', 'README.md',
  ...readdirSync(join(root, 'docs')).filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`),
  ...readdirSync(join(root, '.claude/rules')).filter((f) => f.endsWith('.md')).map((f) => `.claude/rules/${f}`),
];
const texts = Object.fromEntries(docs.map((f) => [f, read(f)]));

// 1. Size and line length.
for (const file of docs) {
  // Git stores LF; a Windows checkout's CRs are not what the model reads.
  const text = texts[file];
  const [target, ceiling] = budgets[file] ?? DEFAULT;
  const bytes = Buffer.byteLength(text);
  const longest = text.split('\n').reduce((max, l, i) => (l.length > max.length ? { length: l.length, n: i + 1 } : max), { length: 0, n: 0 });
  const problems = [];
  let status = 'PASS';
  if (bytes > ceiling || longest.length > line.ceiling) status = 'FAIL';
  else if (bytes > target || longest.length > line.target) status = 'WARN';
  if (bytes > target) problems.push(`${bytes.toLocaleString('en')} bytes (target ${target.toLocaleString('en')}, ceiling ${ceiling.toLocaleString('en')})`);
  if (longest.length > line.target) problems.push(`line ${longest.n} is ${longest.length} characters (target ${line.target}, ceiling ${line.ceiling})`);
  report(status, file, problems.length ? problems.join('; ') : `${bytes.toLocaleString('en')} bytes`);
}

// 2. The map lists every doc, and every doc it lists exists.
const map = texts['docs/README.md'];
for (const f of docs.filter((d) => d.startsWith('docs/') && d !== 'docs/README.md')) {
  if (!map.includes(`\`${basename(f)}\``)) report('FAIL', 'docs/README.md', `${basename(f)} is not in the map`);
}

// 3. Backticked paths lead somewhere. Gitignored files on this PC count.
let tracked = [];
try { tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n'); } catch {}
const byName = new Set(tracked.map((f) => basename(f)));
const ROOTS = /^(src|scripts|functions|supabase|docs|intake|design|data|public|metabase|\.claude|\.github)\//;
const EXT = /\.(md|mjs|ts|astro|sql|json|yml|css|ps1)$/;
for (const file of docs) {
  for (const [, p] of texts[file].matchAll(/`([^`\s]+)`/g)) {
    const path = p.replace(/^\.\.\//, '').replace(/:\d+$/, '').replace(/\/$/, '');
    // Templates, site addresses and build output (`_hashes.json`) are not repo paths.
    if (/[<>*{}$…]|:\/\/|YYYY/.test(path) || path.startsWith('/') || basename(path).startsWith('_')) continue;
    if (!ROOTS.test(path) && !EXT.test(path)) continue;
    const here = dirname(file);
    if ([path, join(here, path), join('docs', path), join('src', path)].some((c) => existsSync(join(root, c)))) continue;
    if (!path.includes('/') && byName.has(path)) continue;
    report('WARN', file, `\`${p}\` does not exist`);
  }
}

// 4. `§Section` pointers match a heading in the doc named before them on the line.
const headings = (f) => (texts[f] ?? '').split('\n').filter((l) => /^#{1,4} /.test(l)).map((l) => l.replace(/^#+ /, '').toLowerCase());
for (const file of docs) {
  for (const l of texts[file].split('\n')) {
    let target = null;
    for (const m of l.matchAll(/([A-Za-z-]+\.md)|§([A-Za-z][\w'-]*)/g)) {
      if (m[1]) {
        target = docs.find((d) => basename(d) === m[1]) ?? null;
        continue;
      }
      if (!target) continue;
      const word = m[2].toLowerCase();
      if (!headings(target).some((h) => h.startsWith(word))) report('WARN', file, `§${m[2]} is not a heading in ${target}`);
    }
  }
}

// 5. The number of guardrails the docs claim is the number the code runs.
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
const guardrails = (read('scripts/guardrails.mjs').match(/^\s*check\(/gm) ?? []).length;
for (const file of docs) {
  for (const [, n] of texts[file].matchAll(/\b(\w+) guardrails\b/gi)) {
    const claimed = /^\d+$/.test(n) ? Number(n) : words.indexOf(n.toLowerCase());
    if (claimed >= 0 && claimed !== guardrails) report('WARN', file, `says ${n} guardrails; scripts/guardrails.mjs runs ${guardrails}`);
  }
}

// 6. PLAN.md is rewritten at the end of each session.
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date());
const updated = texts['docs/PLAN.md'].match(/^Updated (\d{4}-\d{2}-\d{2})/m)?.[1];
if (!updated) report('WARN', 'docs/PLAN.md', 'no "Updated YYYY-MM-DD" line');
else if ((Date.parse(today) - Date.parse(updated)) / 86_400_000 > 10) report('WARN', 'docs/PLAN.md', `last updated ${updated}`);

// 7. One home per fact: the same twelve words in two files.
const SHINGLE = 12;
const seen = new Map();
const pairs = new Map();
for (const file of docs) {
  // The one sentence meant to be quoted everywhere is left out.
  const w = texts[file].toLowerCase().replace(/`[^`]*`/g, ' ').replace(/a page exists because[^.]*\./g, ' ').match(/[a-zäöüéèà']+/g) ?? [];
  for (let i = 0; i + SHINGLE <= w.length; i++) {
    const s = w.slice(i, i + SHINGLE).join(' ');
    const other = seen.get(s);
    if (!other) seen.set(s, file);
    // A repeated passage is many overlapping runs; one line per pair of files.
    else if (other !== file && !pairs.has(`${other}|${file}`)) pairs.set(`${other}|${file}`, s);
  }
}
for (const [pair, s] of pairs) {
  const [other, file] = pair.split('|');
  report('WARN', file, `repeats ${other}: "${s.split(' ').slice(0, 8).join(' ')} …"`);
}

for (const r of results.filter((r) => !quiet || r.status !== 'PASS')) console.log(r.text);

if (results.some((r) => r.status === 'FAIL')) {
  if (!quiet) console.log('\nCut it back to what is true now: logs go beside their work or into the commit message (docs/README.md).');
  process.exit(1);
}
