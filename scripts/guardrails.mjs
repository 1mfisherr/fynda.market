#!/usr/bin/env node
/**
 * Fynda build guardrails.
 *
 * Enforces docs/ARCHITECTURE.md against the built site in dist/.
 * Run after `astro build`. Exits 1 on any failure, which fails CI, which
 * blocks deploy.
 *
 * The rule these exist to defend:
 *   A page exists because there is content for it — never because a URL
 *   pattern permits it.
 *
 * fleafind.ch shipped ~8500 URLs for 157 markets. About 91% earned nothing and
 * Google classified the pattern as spam. Rules a machine does not check drift.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'guardrails.config.json'), 'utf8'));

const distDir = join(root, config.distDir);
const dataDir = join(root, config.dataDir);

/* -------------------------------------------------------------------------- */
/* reporting                                                                  */
/* -------------------------------------------------------------------------- */

const results = [];
const MAX_EXAMPLES = 8;

function check(name, fn) {
  try {
    const outcome = fn();
    results.push({ name, ...outcome });
  } catch (err) {
    results.push({ name, status: 'fail', summary: `check threw: ${err.message}`, examples: [] });
  }
}

const pass = (summary) => ({ status: 'pass', summary, examples: [] });
const skip = (summary) => ({ status: 'skip', summary, examples: [] });
const fail = (summary, examples = []) => ({ status: 'fail', summary, examples });

/* -------------------------------------------------------------------------- */
/* collect the built pages                                                    */
/* -------------------------------------------------------------------------- */

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (entry === 'index.html') acc.push(full);
  }
  return acc;
}

if (!existsSync(distDir)) {
  console.error(`\n  dist/ not found. Run \`npm run build\` first.\n`);
  process.exit(1);
}

const pageFiles = walk(distDir);

/** Built file path -> site URL path, always with a trailing slash. */
function urlFor(file) {
  const rel = relative(distDir, file).split(sep).slice(0, -1).join('/');
  return rel === '' ? '/' : `/${rel}/`;
}

const pages = pageFiles.map((file) => ({
  file,
  url: urlFor(file),
  html: readFileSync(file, 'utf8'),
}));

/** Which allowlist rule a URL matches, or null. */
function routeTypeOf(url) {
  for (const rule of config.routes.allow) {
    if (new RegExp(rule.pattern).test(url)) return rule.name;
  }
  return null;
}

/** Visible text inside <main>, tags and script/style stripped. */
function mainText(html) {
  const main = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i);
  const body = main ? main[1] : html;
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function readData(name) {
  const file = join(dataDir, name);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8'));
}

/* -------------------------------------------------------------------------- */
/* 1 — route allowlist                                                        */
/* -------------------------------------------------------------------------- */

check('Route allowlist', () => {
  const problems = [];
  const badUrls = new Set();

  for (const page of pages) {
    for (const rule of config.routes.forbid) {
      if (new RegExp(rule.pattern).test(page.url)) {
        badUrls.add(page.url);
        problems.push(`${page.url}  — forbidden: ${rule.name}. ${rule.why}`);
      }
    }
    if (!routeTypeOf(page.url)) {
      badUrls.add(page.url);
      problems.push(`${page.url}  — matches no allowed pattern. Add it to guardrails.config.json only if ARCHITECTURE.md says it should exist.`);
    }
  }

  if (badUrls.size) {
    return fail(`${badUrls.size} of ${pages.length} URLs are not permitted`, problems);
  }
  return pass(`${pages.length} URLs, all match an allowed pattern`);
});

/* -------------------------------------------------------------------------- */
/* 2 — URL to entity ratio                                                    */
/* -------------------------------------------------------------------------- */

check('URL-to-entity ratio', () => {
  const entities = readData('entities.json');
  const contentPages = pages.filter((p) => {
    const t = routeTypeOf(p.url);
    return t === 'market' || t === 'region or city';
  });

  if (!entities) {
    if (contentPages.length === 0) {
      return skip('no market or place pages yet, and no data/entities.json — nothing to measure');
    }
    return fail(
      `${contentPages.length} content pages exist but data/entities.json is missing, so the ratio cannot be verified`,
      ['Emit data/entities.json as { "markets": <n>, "cities": <n>, "regions": <n> } during the data build.']
    );
  }

  const total = (entities.markets ?? 0) + (entities.cities ?? 0) + (entities.regions ?? 0);
  if (total === 0) return skip('entity count is zero — nothing to measure');

  const ratio = pages.length / total;
  const max = config.urlToEntityRatio.max;
  const shown = `${pages.length} URLs / ${total} entities = ${ratio.toFixed(2)}`;

  if (ratio > max) {
    return fail(`${shown} — over the ceiling of ${max.toFixed(1)}`, [config.urlToEntityRatio.why]);
  }
  return pass(`${shown} (ceiling ${max.toFixed(1)})`);
});

/* -------------------------------------------------------------------------- */
/* 3 — minimum content per page type                                          */
/* -------------------------------------------------------------------------- */

check('Content floor', () => {
  const thin = [];

  for (const page of pages) {
    const type = routeTypeOf(page.url);
    const floor = config.contentFloor[type];
    if (typeof floor !== 'number') continue;

    const length = mainText(page.html).length;
    if (length < floor) {
      thin.push(`${page.url}  — ${length} chars in <main>, floor for "${type}" is ${floor}`);
    }
  }

  if (thin.length) {
    return fail(`${thin.length} page(s) below their content floor`, thin);
  }
  return pass(`all ${pages.length} pages clear their floor`);
});

/* -------------------------------------------------------------------------- */
/* 4 — 120-day occurrence horizon                                             */
/* -------------------------------------------------------------------------- */

check('Occurrence horizon', () => {
  const occurrences = readData('occurrences.json');
  if (!occurrences) return skip('no data/occurrences.json yet');

  const rows = Array.isArray(occurrences) ? occurrences : occurrences.occurrences ?? [];
  if (rows.length === 0) return skip('no occurrence rows');

  const days = config.occurrenceHorizonDays;
  const limit = new Date();
  limit.setUTCDate(limit.getUTCDate() + days);

  const beyond = rows
    .filter((row) => {
      const d = new Date(row.date ?? row.start ?? row.startsAt);
      return !Number.isNaN(d.valueOf()) && d > limit;
    })
    .map((row) => `${row.marketSlug ?? row.market ?? '?'} on ${row.date ?? row.start ?? row.startsAt}`);

  if (beyond.length) {
    return fail(
      `${beyond.length} of ${rows.length} occurrences fall beyond the ${days}-day horizon`,
      beyond
    );
  }
  return pass(`${rows.length} occurrences, all within ${days} days`);
});

/* -------------------------------------------------------------------------- */
/* 5 — explicit image dimensions                                              */
/* -------------------------------------------------------------------------- */

check('Explicit image dimensions', () => {
  const missing = [];

  for (const page of pages) {
    const tags = page.html.match(/<img\b[^>]*>/gi) ?? [];
    for (const tag of tags) {
      const hasWidth = /\swidth\s*=/i.test(tag);
      const hasHeight = /\sheight\s*=/i.test(tag);
      if (!hasWidth || !hasHeight) {
        const src = (tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i) ?? [, '(no src)'])[1];
        missing.push(`${page.url}  — <img src="${src}"> is missing ${!hasWidth ? 'width' : ''}${!hasWidth && !hasHeight ? ' and ' : ''}${!hasHeight ? 'height' : ''}`);
      }
    }
  }

  if (missing.length) {
    return fail(`${missing.length} image(s) without explicit dimensions — this is the v1 layout-shift bug`, missing);
  }
  return pass('every image carries width and height');
});

/* -------------------------------------------------------------------------- */
/* 6 — structured data                                                        */
/* -------------------------------------------------------------------------- */

check('Structured data', () => {
  const problems = [];
  const requireOn = new Set(config.structuredData.requireOn);
  const allowed = new Set(config.structuredData.allowedTypes);
  const eventAllowedOn = new Set(config.structuredData.eventAllowedOn ?? []);

  for (const page of pages) {
    const type = routeTypeOf(page.url);
    const blocks = page.html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
    ) ?? [];

    if (requireOn.has(type) && blocks.length === 0) {
      problems.push(`${page.url}  — "${type}" pages must carry structured data, found none`);
      continue;
    }

    let eventCount = 0;

    for (const block of blocks) {
      const json = block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
      let parsed;
      try {
        parsed = JSON.parse(json);
      } catch (err) {
        problems.push(`${page.url}  — ld+json does not parse: ${err.message}`);
        continue;
      }
      for (const node of [].concat(parsed['@graph'] ?? parsed)) {
        const t = node['@type'];
        if (!t) problems.push(`${page.url}  — ld+json node has no @type`);
        else if (!allowed.has(t)) problems.push(`${page.url}  — unexpected @type "${t}"`);
        if (t === 'Event') eventCount++;
      }
    }

    // Google: "The event experience on Google only supports pages that focus on
    // a single event." A market page carries many occurrence rows by design, so
    // it emits exactly one Event — the next occurrence — and renders the rest as
    // visible content. Violations here draw a manual action, not a demotion.
    if (eventCount > 1) {
      problems.push(
        `${page.url}  — ${eventCount} Event blocks. A page may emit at most one; later dates are content, not markup.`
      );
    }
    if (eventCount > 0 && !eventAllowedOn.has(type)) {
      problems.push(
        `${page.url}  — "${type}" pages must not emit an Event. Only ${[...eventAllowedOn].join(', ')} pages may.`
      );
    }
  }

  if (problems.length) return fail(`${problems.length} structured-data problem(s)`, problems);
  return pass('structured data present and valid, at most one Event per page');
});

/* -------------------------------------------------------------------------- */
/* output                                                                     */
/* -------------------------------------------------------------------------- */

const icon = { pass: 'PASS', fail: 'FAIL', skip: 'SKIP' };
let failed = 0;

console.log('\n  Fynda guardrails — docs/ARCHITECTURE.md\n');

for (const r of results) {
  console.log(`  [${icon[r.status]}]  ${r.name}`);
  console.log(`          ${r.summary}`);
  if (r.status === 'fail') {
    failed++;
    for (const example of r.examples.slice(0, MAX_EXAMPLES)) {
      console.log(`            - ${example}`);
    }
    if (r.examples.length > MAX_EXAMPLES) {
      console.log(`            ... and ${r.examples.length - MAX_EXAMPLES} more`);
    }
  }
  console.log('');
}

if (failed > 0) {
  console.error(`  ${failed} guardrail(s) failed. Deploy is blocked.\n`);
  process.exit(1);
}

console.log('  All guardrails clear.\n');
