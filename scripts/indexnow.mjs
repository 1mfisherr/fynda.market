/**
 * IndexNow: tell Bing (and the engines that share its feed — Yandex, Naver,
 * Seznam) which pages changed, the moment they change.
 *
 * Bing is the index behind Copilot and one of the indexes ChatGPT reads, and
 * it does not crawl a small site nightly on its own. IndexNow is the push
 * channel Bing recommends for exactly this ("keep information fresh across
 * search and AI experiences"); Google does not take part. Documentation:
 * https://www.indexnow.org/documentation — docs/reference/seo-research/.
 *
 * Only what changed is submitted. IndexNow is "not designed for submitting
 * every URL on your site at once", and a nightly resubmission of 900 unchanged
 * pages would be noise that gets a host ignored. Change is found by comparing
 * this build's page hashes (`dist/_hashes.json`, written by postbuild) with
 * the ones the live site serves at the same address — the previous publish
 * left its own manifest there, so no state has to be kept anywhere else.
 *
 *   node scripts/indexnow.mjs --plan     before the upload: diff, write the plan
 *   node scripts/indexnow.mjs --submit   after the upload: send the plan
 *   node scripts/indexnow.mjs --dry      plan and print, send nothing
 *   node scripts/indexnow.mjs --all      every page in dist/_hashes.json, once
 *                                        (the first submission, or after the
 *                                        key changed; never routine)
 *
 * Two steps because the diff must be taken against the manifest that is live
 * *before* the upload replaces it, and the URLs must be submitted only once
 * they are live. A removed address is submitted too: it now redirects or
 * 404s, and IndexNow wants to hear about both.
 *
 * The key is not a secret. It proves the host by being served from it
 * (`public/<key>.txt`); anyone can read it there.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'fynda.market';
const SITE = `https://${HOST}`;
const KEY = '3b337db300fcd2fec7961e45732fe695';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const planFile = join(root, 'node_modules/.cache/indexnow-plan.json');

const mode = process.argv.includes('--submit') ? 'submit' : process.argv.includes('--dry') ? 'dry' : process.argv.includes('--all') ? 'all' : 'plan';

async function plan() {
  const builtFile = join(root, 'dist/_hashes.json');
  if (!existsSync(builtFile)) throw new Error('dist/_hashes.json is missing — run the build (postbuild writes it).');
  const built = JSON.parse(readFileSync(builtFile, 'utf8'));

  let live = {};
  let firstRun = false;
  try {
    const res = await fetch(`${SITE}/_hashes.json`, { headers: { 'user-agent': 'fynda-indexnow/1' } });
    if (res.ok) live = await res.json();
    else firstRun = true;
  } catch {
    firstRun = true;
  }

  const changed = Object.keys(built).filter((path) => live[path] !== undefined && live[path] !== built[path]);
  const added = Object.keys(built).filter((path) => live[path] === undefined);
  const removed = Object.keys(live).filter((path) => built[path] === undefined);
  const urls = [...changed, ...added, ...removed].map((path) => `${SITE}${path}`);

  return { firstRun, changed: changed.length, added: added.length, removed: removed.length, urls };
}

async function submit(urls) {
  // 10,000 per POST is the documented ceiling; the site is under a thousand.
  for (let i = 0; i < urls.length; i += 10000) {
    const body = { host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList: urls.slice(i, i + 10000) };
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    // 200 OK, 202 accepted. A 403 "SiteVerificationNotCompleted" is IndexNow
    // still checking the key file after the first ever submission (it took a
    // 916-URL first run as the trigger, 2026-09-18); the plan file is kept so
    // `--submit` can be run again once it has. Never a failed deploy — the
    // pages are live either way.
    const detail = res.ok ? '' : ` — ${(await res.text()).slice(0, 160)}`;
    console.log(`  IndexNow: ${res.status} ${res.statusText} for ${body.urlList.length} URLs${detail}`);
    if (!res.ok) return false;
  }
  return true;
}

async function submitPlan(urls) {
  const ok = await submit(urls);
  if (ok) rmSync(planFile, { force: true });
  else console.log('  IndexNow: the plan is kept — run `node scripts/indexnow.mjs --submit` again later.');
}

if (mode === 'all') {
  const built = JSON.parse(readFileSync(join(root, 'dist/_hashes.json'), 'utf8'));
  await submit(Object.keys(built).map((path) => `${SITE}${path}`));
} else if (mode === 'submit') {
  if (!existsSync(planFile)) {
    console.log('  IndexNow: no plan file — nothing submitted.');
    process.exit(0);
  }
  const { urls } = JSON.parse(readFileSync(planFile, 'utf8'));
  if (urls.length === 0) {
    console.log('  IndexNow: nothing changed since the last publish — nothing submitted.');
    rmSync(planFile, { force: true });
  } else {
    await submitPlan(urls);
  }
} else {
  const result = await plan();
  const note = result.firstRun ? ' (no live manifest yet: every page counts as new)' : '';
  console.log(`  IndexNow plan: ${result.changed} changed, ${result.added} added, ${result.removed} removed${note}`);
  if (mode === 'dry') {
    for (const url of result.urls.slice(0, 40)) console.log(`    ${url}`);
    if (result.urls.length > 40) console.log(`    … and ${result.urls.length - 40} more`);
  } else {
    mkdirSync(dirname(planFile), { recursive: true });
    writeFileSync(planFile, JSON.stringify(result));
  }
}
