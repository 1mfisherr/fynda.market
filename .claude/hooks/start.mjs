#!/usr/bin/env node
/**
 * SessionStart hook: the facts a session should begin with, computed rather
 * than remembered. Its output is added to Claude's context. After a
 * compaction it also re-adds the working tree, which the summary loses.
 *
 * Test: echo '{"source":"compact"}' | node .claude/hooks/start.mjs
 *
 * Fails open: an error prints nothing.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const git = (cwd, args) => {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

try {
  let input = {};
  try { input = JSON.parse(readFileSync(0, 'utf8')); } catch {}
  const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const out = [];

  // The site's clock, not the machine's (CLAUDE.md §Gotchas).
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zurich' }).format(new Date());
  const lines = (s) => s.split('\n').filter(Boolean);
  const dirty = lines(git(cwd, ['status', '--porcelain']));
  const unpushed = lines(git(cwd, ['log', '--oneline', 'origin/main..HEAD']));
  out.push(`Today ${today} (Zurich). Branch ${git(cwd, ['branch', '--show-current']) || '?'}. ${dirty.length} uncommitted or untracked files, ${unpushed.length} commits not pushed.`);

  // Delfim drops photos and files into public/; they ship as they are.
  const dropped = dirty.filter((l) => l.startsWith('??') && l.slice(3).startsWith('public/')).map((l) => l.slice(3));
  if (dropped.length) out.push(`Untracked in public/ (they ship as they are): ${dropped.slice(0, 10).join(', ')}${dropped.length > 10 ? ', …' : ''}`);

  const plan = readFileSync(join(cwd, 'docs/PLAN.md'), 'utf8').replace(/\r\n/g, '\n');
  const updated = plan.match(/^Updated (\d{4}-\d{2}-\d{2})/m)?.[1];
  if (updated) {
    const age = Math.round((Date.parse(today) - Date.parse(updated)) / 86_400_000);
    out.push(`docs/PLAN.md updated ${updated} (${age} days ago). Read it first.`);
  }
  const due = plan.split('\n').filter((l) => {
    const d = l.match(/^- (\d{4}-\d{2}-\d{2})\b/)?.[1];
    return d && d <= today;
  });
  if (due.length) out.push(`Due in PLAN.md (tell Delfim):\n${due.map((l) => '  ' + l.slice(0, 160)).join('\n')}`);

  try {
    const check = execFileSync(process.execPath, [join(cwd, 'scripts/docs-check.mjs'), '--quiet'], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (check) out.push(`Docs check:\n${check}`);
  } catch (e) {
    if (e.stdout?.trim()) out.push(`Docs check:\n${e.stdout.trim()}`);
  }

  if (input.source === 'compact') {
    out.push(`After compaction, from git:\n${dirty.slice(0, 30).join('\n') || '(clean)'}\nLast commits:\n${git(cwd, ['log', '--oneline', '-5'])}`);
  }

  process.stdout.write(out.join('\n').slice(0, 4000) + '\n');
} catch {
  // Fail open.
}
process.exit(0);
