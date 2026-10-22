#!/usr/bin/env node
/**
 * PreToolUse hook: the rules in CLAUDE.md that cost most when broken, as
 * checks instead of sentences (Delfim, 2026-10-22). A sentence asks for care;
 * this runs on every Bash, PowerShell, WebFetch and WebSearch call, subagents
 * included.
 *
 *   deny  git add -A / --all / .         (swept scratch files into a commit twice)
 *   deny  git commit with fixture data/  (a fixtures verify overwrites data/*.json)
 *   deny  git push when code changed and docs/PLAN.md did not
 *   ask   git push, deploy, migrate, --send, an e-mail address to an outside site
 *
 * Test: echo '{"tool_name":"Bash","tool_input":{"command":"git add -A"}}' | node .claude/hooks/guard.mjs
 *
 * Fails open: any error in here allows the call. A broken hook must never
 * stop work; the rules are still in CLAUDE.md.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function decide(decision, reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: decision, permissionDecisionReason: reason },
  }));
  process.exit(0);
}

function git(cwd, args) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

// One shell command line can hold several commands; each is judged on its own.
const segments = (cmd) => cmd.split(/&&|\|\||;|\r?\n|\|/).map((s) => s.trim()).filter(Boolean);
// Addresses that are ours, or only examples.
const EMAIL = /[A-Za-z0-9._%+-]+@(?!fynda\.market\b|example\.(?:com|org)\b|anthropic\.com\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

function checkShell(cmd, cwd) {
  for (const seg of segments(cmd)) {
    const add = seg.match(/\bgit\s+(?:-C\s+\S+\s+)?add\b(.*)$/);
    if (add) {
      const args = add[1].trim().split(/\s+/);
      if (args.some((a) => a === '.' || a === ':/' || a === '*' || a === '--all' || /^-[a-zA-Z]*A[a-zA-Z]*$/.test(a))) {
        decide('deny', 'git add -A / git add . sweeps scratch files into a commit (it has twice). Name the paths, or use git add -u plus the new files you meant.');
      }
    }

    if (/\bgit\s+(?:-C\s+\S+\s+)?commit\b/.test(seg)) {
      const all = /\s(?:-[a-zA-Z]*a[a-zA-Z]*|--all)(?:\s|$)/.test(seg);
      const staged = git(cwd, ['show', ':data/entities.json']);
      let working = '';
      try { working = readFileSync(join(cwd, 'data/entities.json'), 'utf8'); } catch {}
      const fixtures = (t) => /"source"\s*:\s*"fixtures"/.test(t);
      if (fixtures(staged) || (all && fixtures(working))) {
        decide('deny', 'data/ holds the six fixture markets from a test build. Run git checkout -- data/ and unstage it, then commit.');
      }
    }

    if (/\bgit\s+(?:-C\s+\S+\s+)?push\b/.test(seg) && !/--dry-run|\s-n(?:\s|$)/.test(seg)) {
      const changed = git(cwd, ['diff', '--name-only', 'origin/main...HEAD']).split('\n').filter(Boolean);
      const code = changed.some((f) => /^(src|functions|supabase|scripts)\//.test(f));
      if (code && !changed.includes('docs/PLAN.md')) {
        decide('deny', 'Code changed but docs/PLAN.md did not. Rewrite it as state (what is true now, Left off) and commit it, then push.');
      }
      decide('ask', 'Push once, at the end of the session, or when Delfim said "push now". Every push runs GitHub Actions (he has used 90% of his allowance).');
    }

    if ((/\bnpm\s+run\s+deploy\b|scripts[\\/]deploy\.mjs/.test(seg) && !/--build-only/.test(seg)) || /\bwrangler\s+pages\s+deploy\b/.test(seg)) {
      decide('ask', 'Deploy once, at the end of the session: this changes the live site at once and pings IndexNow. Any layout change in it must have been seen and approved by Delfim on a preview.');
    }
    if (/scripts[\\/]migrate\.mjs/.test(seg)) {
      decide('ask', 'This changes the live database at once. Afterwards hit the live endpoint and read the row back; CI cannot tell you it ran.');
    }
    if (/scripts[\\/]send-[\w-]+\.mjs/.test(seg) && /--send\b/.test(seg)) {
      decide('ask', 'This sends real e-mail to real people.');
    }
    if (/\b(curl|wget|iwr|irm|Invoke-WebRequest|Invoke-RestMethod)\b/i.test(seg) && EMAIL.test(seg)) {
      decide('ask', 'This would send an e-mail address to an outside service. Delfim says yes first, every time (his rule, 2026-10-11).');
    }
  }
}

try {
  const input = JSON.parse(readFileSync(0, 'utf8'));
  const tool = input.tool_name ?? '';
  const ti = input.tool_input ?? {};
  const cwd = input.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd();

  if (tool === 'Bash' || tool === 'PowerShell') checkShell(String(ti.command ?? ''), cwd);
  if (tool === 'WebFetch' || tool === 'WebSearch') {
    // The prompt stays with Claude; the URL and the query leave the machine.
    const text = [ti.url, ti.query].filter(Boolean).join(' ');
    if (EMAIL.test(text)) {
      decide('ask', 'This would send an e-mail address to an outside service. Delfim says yes first, every time (his rule, 2026-10-11).');
    }
  }
} catch {
  // Fail open.
}
process.exit(0);
