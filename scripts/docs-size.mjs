#!/usr/bin/env node
/**
 * Keeps the two files every session reads short enough to be followed.
 *
 *   node scripts/docs-size.mjs
 *
 * CLAUDE.md is loaded into every session and PLAN.md is read first. Past a
 * point the model follows them less well, and the rule saying so did not hold
 * on its own: PLAN.md went from 5 KB on 2026-09-17 to 38 KB on 2026-10-22,
 * one appended batch log at a time. So it is checked here, in `verify` and
 * `deploy`.
 *
 * Over the target: a warning. Over the ceiling: a failure. The fix is
 * always to cut — status, not history (docs/README.md) — never to raise a
 * number.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const budgets = [
  { file: 'CLAUDE.md', target: 12_000, ceiling: 14_000 },
  { file: 'docs/PLAN.md', target: 15_000, ceiling: 20_000 },
];
// A table cell that has turned into an essay passes any byte budget for a while.
const line = { target: 800, ceiling: 1_500 };

let failed = 0;
for (const { file, target, ceiling } of budgets) {
  // Git stores LF; a Windows checkout's CRs are not what the model reads.
  const text = readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n');
  const bytes = Buffer.byteLength(text);
  const longest = text.split('\n').reduce((max, l, i) => (l.length > max.length ? { length: l.length, n: i + 1 } : max), { length: 0, n: 0 });

  const problems = [];
  let status = 'PASS';
  if (bytes > ceiling || longest.length > line.ceiling) status = 'FAIL';
  else if (bytes > target || longest.length > line.target) status = 'WARN';
  if (bytes > target) problems.push(`${bytes.toLocaleString('en')} bytes (target ${target.toLocaleString('en')}, ceiling ${ceiling.toLocaleString('en')})`);
  if (longest.length > line.target) problems.push(`line ${longest.n} is ${longest.length} characters (target ${line.target}, ceiling ${line.ceiling})`);

  console.log(`${status}  ${file}  ${problems.length ? problems.join('; ') : `${bytes.toLocaleString('en')} bytes`}`);
  if (status === 'FAIL') failed++;
}

if (failed) {
  console.log('\nCut it back to what is true now: logs go beside their work or into the commit message (docs/README.md).');
  process.exit(1);
}
