#!/usr/bin/env node
/**
 * Publish the site.
 *
 *   npm run deploy
 *
 * Builds against the live database, runs every guardrail, and only then uploads
 * `dist/` to Cloudflare Pages. Nothing reaches the web that a guardrail failed.
 *
 * Why the build happens here rather than on Cloudflare
 * ----------------------------------------------------
 * It used to happen there, and getting it live took five hours across six
 * failed builds — none of them about the site. Cloudflare's builder needed its
 * own copy of the database password, so the URL was pasted into a second place
 * and got a stray space, then an API key; "Retry deployment" silently replays
 * the old commit, so three fixes were never actually built; the Git link
 * dropped; and the direct database host is IPv6-only, which is a coin flip on a
 * home connection.
 *
 * Building here removes all of it. The database is read once, on a machine that
 * already has working credentials, and Cloudflare receives finished HTML. There
 * is no password in Cloudflare, no dependency install on their builder, and no
 * Git integration in the path.
 *
 * The cost is that a push no longer publishes by itself — someone runs this.
 * That is the right trade while one person deploys and the data changes rarely.
 * If that stops being true, the fix is a scheduled job that runs this file, not
 * a return to building on Cloudflare.
 *
 *   npm run deploy -- --build-only
 *
 * Everything up to the upload: the real build in dist/, checked, published
 * nowhere. Seeing a change against 157 real markets used to require being
 * willing to publish it; `npm run preview` on the result is how a change is
 * looked at before it goes live.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DB_URL } from './db.mjs';

const PROJECT = 'fynda-market';

/**
 * db.mjs reads .env.local and normalises the connection string, so this
 * inherits both — the build cannot end up pointed somewhere else, and the
 * caller never has to export anything by hand.
 */
const env = {
  ...process.env,
  SUPABASE_DB_URL: DB_URL,
  // Never publish a fixtures build. Six markets would look like a real site
  // with almost nothing in it, which is worse than a failed deploy.
  FYNDA_DATA_SOURCE: 'supabase',
};

/**
 * Every step runs as `node <file>`, never as `npm run …` or `npx …`.
 *
 * On Windows those two are batch files, and Node 24 refuses to spawn a .cmd
 * without a shell; going through a shell instead passes the arguments
 * unescaped, which Node also warns about. Resolving each tool's own JavaScript
 * entry point sidesteps both, and pins the versions in node_modules rather than
 * whatever happens to be on PATH.
 */
const require = createRequire(import.meta.url);
const binOf = (pkg, key = pkg) => {
  const manifest = require.resolve(`${pkg}/package.json`);
  const bin = require(manifest).bin;
  return join(dirname(manifest), typeof bin === 'string' ? bin : bin[key]);
};

function run(label, file, args) {
  console.log(`\n  ${label}\n`);
  // A null file runs node itself with the args — for `node --test`.
  const result = spawnSync(process.execPath, file ? [file, ...args] : args, { stdio: 'inherit', env });
  if (result.error) {
    console.error(`\n  ${label} could not start: ${result.error.message}\n`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`\n  ${label} failed. Nothing was published.\n`);
    process.exit(result.status ?? 1);
  }
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/*
  Start from nothing.

  A build that ran on fixtures leaves six invented markets in dist/, and a
  later Supabase build does not necessarily remove them — on 2026-09-05 a stale
  dist/ produced 956 pages where the database holds 927, and the guardrails
  read the leftovers as real. That was caught locally. Uploaded, it would have
  published fake markets to a live site.
*/
rmSync(join(root, 'dist'), { recursive: true, force: true });

/*
  Refuse to publish commits GitHub does not have.

  GitHub rebuilds the site every night from what is on origin/main. On
  2026-09-16 a local deploy carried a new Function, a GitHub run from the older
  commit landed two minutes later, and the Function was gone until someone
  noticed a 404. Anything published from here must be on GitHub first, or the
  next nightly publish quietly reverts it. Skipped in CI, where HEAD is origin,
  and for --build-only, which uploads nothing and exists to preview a change
  before it is committed.
*/
const buildOnly = process.argv.includes('--build-only');
if (!process.env.GITHUB_ACTIONS && !buildOnly && !process.argv.includes('--allow-unpushed')) {
  spawnSync('git', ['fetch', '--quiet', 'origin', 'main'], { cwd: root, stdio: 'inherit' });
  const ahead = spawnSync('git', ['rev-list', '--count', 'origin/main..HEAD'], { cwd: root, encoding: 'utf8' });
  const count = Number(ahead.stdout.trim());
  if (ahead.status === 0 && count > 0) {
    console.error(`\n  ${count} local commit${count === 1 ? '' : 's'} not on GitHub. Push first, or the nightly publish will undo this deploy.\n`);
    process.exit(1);
  }
  const dirty = spawnSync('git', ['status', '--porcelain', '--untracked-files=no', '--', ':!data/'], { cwd: root, encoding: 'utf8' });
  if (dirty.stdout.trim()) {
    console.error('\n  Uncommitted changes outside data/. Commit and push first — a deploy must match what GitHub will rebuild tonight.\n');
    process.exit(1);
  }
}

// `npm run verify` is build + guardrails, and prebuild is what emits data/.
// Spelled out here so each step's failure names itself.
/*
  The tests first. `verify` runs them and `deploy` did not, so on 2026-09-15
  a broken import in lists.ts reached the live site through `deploy` while
  `npm test` was red — and the nightly publish would have kept shipping it.
  They take a fifth of a second; the type checks stay in `verify` and CI,
  where a red one blocks the push rather than the publish.
*/
run('Running the tests', null, ['--test', join(root, 'src/lib/digest.test.ts')]);
run('Emitting data files', join(root, 'scripts/emit-data.mjs'), []);
run('Building the site', binOf('astro'), ['build']);
run('Placing the locale 404 pages', null, ['scripts/postbuild.mjs']);
run('Checking guardrails', join(root, 'scripts/guardrails.mjs'), []);

/*
  And refuse outright to publish a fixtures build.

  Cleaning dist/ removes the symptom; this removes the class. emit-data records
  which source the build ran on, so there is no guessing: six sample markets
  must never reach fynda.market, whatever else went wrong upstream.
*/
const built = JSON.parse(readFileSync(join(root, 'data/entities.json'), 'utf8'));
if (built.source !== 'supabase') {
  console.error(
    `
  This build ran on ${built.source}, not the database ` +
    `(${built.markets} markets). Those are sample listings and must not be ` +
    `published. Nothing was uploaded.
`
  );
  process.exit(1);
}

if (process.argv.includes('--build-only')) {
  console.log('\n  Built and checked against the database. Nothing uploaded (--build-only).\n');
  process.exit(0);
}

// The diff for IndexNow is taken against the manifest that is live now, before
// the upload replaces it; the submission waits until the pages are live.
run('Planning the IndexNow submission', join(root, 'scripts/indexnow.mjs'), ['--plan']);

run('Uploading to Cloudflare Pages', binOf('wrangler'), [
  'pages',
  'deploy',
  'dist',
  `--project-name=${PROJECT}`,
  '--branch=main',
  // The tree is often dirty with regenerated data files; that is expected, and
  // the guardrails above are what actually gates the upload.
  '--commit-dirty=true',
]);

console.log('\n  Published.\n');

run('Telling IndexNow what changed', join(root, 'scripts/indexnow.mjs'), ['--submit']);
