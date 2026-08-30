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

function walk(dir, acc = [], match = (entry) => entry === 'index.html') {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc, match);
    else if (match(entry)) acc.push(full);
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

/**
 * A redirect stub is a near-empty file whose only job is to send the browser
 * somewhere else — Astro emits one for every entry in `redirects`. It is not a
 * page: it carries no content, is not indexable, and does not compete for a
 * query. So it is exempt from the content floor and is not counted in the
 * URL-to-entity ratio. It IS still checked against the route allowlist, because
 * a redirect pointing at a forbidden URL is still a forbidden URL.
 */
function isRedirectStub(html) {
  return /<meta[^>]+http-equiv=["']refresh["']/i.test(html);
}

const allPages = pageFiles.map((file) => {
  const html = readFileSync(file, 'utf8');
  return { file, url: urlFor(file), html, redirect: isRedirectStub(html) };
});

/** Real pages: everything the index can actually land on. */
const pages = allPages.filter((p) => !p.redirect);

/** Absolute URLs, because that is what hreflang must carry. */
const SITE = config.site ?? 'https://fynda.market';
const redirectCount = allPages.length - pages.length;

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

  for (const page of allPages) {
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
    return fail(`${badUrls.size} of ${allPages.length} URLs are not permitted`, problems);
  }
  const note = redirectCount ? ` (+${redirectCount} redirect stub${redirectCount > 1 ? 's' : ''})` : '';
  return pass(`${pages.length} URLs, all match an allowed pattern${note}`);
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

  const entityCount = (entities.markets ?? 0) + (entities.cities ?? 0) + (entities.regions ?? 0);
  // Per locale, when the config says so: the same market in Italian is a full
  // page with the same dates and address, so it belongs in the denominator.
  const locales = config.urlToEntityRatio.perLocale ? (entities.locales ?? 1) : 1;
  const total = entityCount * locales;
  if (total === 0) return skip('entity count is zero — nothing to measure');

  // Utility and radius pages carry no entity and compete for no query — they are
  // noindex forms, legal text and a filter view. Counting them would make the
  // ratio measure something other than what it exists to measure: how many
  // indexable URLs we mint per real thing in the world.
  const counted = pages.filter((p) => {
    const t = routeTypeOf(p.url);
    return t !== 'utility' && t !== 'radius';
  });

  const ratio = counted.length / total;
  const max = config.urlToEntityRatio.max;
  const shown = locales > 1
    ? `${counted.length} URLs / ${entityCount} entities x ${locales} locales = ${ratio.toFixed(2)}`
    : `${counted.length} URLs / ${total} entities = ${ratio.toFixed(2)}`;

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
  // "Today" is the venue's day, not UTC's. The build clamps dates in
  // Europe/Zurich, so between midnight and 02:00 Swiss time a UTC-based limit
  // here is a day short and fails a page that is correctly inside the horizon.
  // One definition of today, or the check disagrees with the thing it checks.
  const todayLocal = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.timeZone ?? 'Europe/Zurich',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const limit = new Date(`${todayLocal}T00:00:00Z`);
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
/* 7. style cohesion                                                          */
/*                                                                            */
/* The one check that reads source rather than output, because the failure it  */
/* catches is invisible in dist/: three pages that each look fine and slowly   */
/* stop looking like each other. Measured 2026-08-30, before styles/base.css   */
/* existed: 10 selectors defined in more than one page, 7 already diverged.    */
/* -------------------------------------------------------------------------- */

check('Style cohesion', () => {
  const rules = config.styles;
  if (!rules) return skip('no styles section in guardrails.config.json');

  const srcDir = join(root, 'src');
  const astro = walk(srcDir, [], (entry) => entry.endsWith('.astro'));
  const pageFilesSrc = astro.filter((f) => f.includes(`${sep}pages${sep}`));
  const problems = [];

  const styleOf = (file) => {
    const html = readFileSync(file, 'utf8');
    return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  };
  const rel = (file) => file.slice(root.length + 1).split(sep).join('/');

  // --- a. no selector defined by two pages ---------------------------------
  const owners = new Map();
  for (const file of pageFilesSrc) {
    const css = styleOf(file);
    for (const [, raw] of css.matchAll(/([^{}@]+)\{[^{}]*\}/g)) {
      const selector = raw.trim().replace(/\s+/g, ' ');
      if (!selector || selector.startsWith('/*')) continue;
      if (!owners.has(selector)) owners.set(selector, new Set());
      owners.get(selector).add(rel(file));
    }
  }
  for (const [selector, files] of owners) {
    if (files.size > 1) {
      problems.push(
        `"${selector}" is styled by ${files.size} pages (${[...files].join(', ')}). ` +
        `Shared things belong in src/styles/base.css or a component, never in two <style> blocks.`
      );
    }
  }

  // --- a2. no class NAME owned by two pages --------------------------------
  // Comparing whole selectors misses the case that actually bites: one page
  // styles `.intro` and another `.intro p`. The strings differ, so the check
  // above passes, while two pages have quietly grown their own version of the
  // same block under the same name. Found five of these the day it was added.
  //
  // Names defined in base.css are the shared vocabulary and are meant to be
  // reused — using `.button` on two pages is the system working.
  const shared = new Set(
    [...readFileSync(join(root, 'src/styles/base.css'), 'utf8').matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1])
  );
  const nameOwners = new Map();
  for (const [selector, files] of owners) {
    for (const [, name] of selector.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
      if (shared.has(name)) continue;
      if (!nameOwners.has(name)) nameOwners.set(name, new Set());
      for (const file of files) nameOwners.get(name).add(file);
    }
  }
  for (const [name, files] of nameOwners) {
    if (files.size > 1) {
      problems.push(
        `class ".${name}" is used by ${files.size} pages (${[...files].join(', ')}). ` +
        `Either it is one thing — move it to src/styles/base.css — or it is two, and one needs a different name.`
      );
    }
  }

  // --- b. no raw colours or sizes outside the token file -------------------
  // A media query cannot read a custom property, so px inside @media is the one
  // place a literal is correct. Everything else names a token or it drifts.
  for (const file of astro) {
    const css = styleOf(file).replace(/@media[^{]*\{/g, '');
    for (const [, literal] of css.matchAll(/(#[0-9a-fA-F]{3,8}\b|(?<![\w.-])\d+(?:\.\d+)?px)/g)) {
      problems.push(`${rel(file)} — hardcoded "${literal}". Use a token from src/styles/tokens.css.`);
    }
  }

  // --- c. a component must not set its own outer margin --------------------
  // A component that ships a margin forces every parent to cancel it. That is
  // how `:global(.code){margin-top:0}` came to exist in two places.
  for (const file of astro.filter((f) => f.includes(`${sep}components${sep}`))) {
    const css = styleOf(file);
    for (const [, prop] of css.matchAll(/(?<![\w-])(margin(?:-block-start|-top|-block|-inline|-inline-start|-inline-end|-bottom|-block-end|-left|-right)?)\s*:(?![^;}]*\b0\b)/g)) {
      // Only the outermost element is the parent's business; a margin between a
      // component's own children is entirely its own affair. Flag the rules that
      // could reach outside: the ones on the component root.
      const rootRule = new RegExp(`(^|\})\s*\.[\w-]+\s*\{[^{}]*${prop}\s*:`, 'm');
      if (rootRule.test(css) && rules.componentOuterMargin === 'forbid') {
        problems.push(`${rel(file)} — "${prop}" on a component root. Spacing between things is the parent's job (.stack).`);
        break;
      }
    }
  }

  if (problems.length) return fail(`${problems.length} cohesion problem(s)`, problems);
  return pass(
    `${pageFilesSrc.length} pages share one style layer; no duplicated selectors, no hardcoded colours or sizes`
  );
});

/* -------------------------------------------------------------------------- */
/* 8. hreflang clusters                                                       */
/*                                                                            */
/* One error anywhere in a cluster makes Google discard the whole cluster, and */
/* roughly three quarters of implementations in the wild contain one. The two  */
/* that actually happen are a missing self-reference and a missing return      */
/* link, so both are checked here rather than trusted.                         */
/* -------------------------------------------------------------------------- */

check('hreflang clusters', () => {
  const locales = config._locales ?? [];
  if (locales.length < 2) return skip('only one locale');

  const alternates = new Map();
  for (const page of pages) {
    const found = [...page.html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
      .filter(([, lang]) => lang !== 'x-default');
    if (found.length > 0) {
      alternates.set(new URL(page.url, SITE).href, new Map(found.map(([, lang, href]) => [lang, href])));
    }
  }

  if (alternates.size === 0) return skip('no page declares an alternate yet');

  const problems = [];
  for (const [url, cluster] of alternates) {
    const hrefs = [...cluster.values()];
    if (!hrefs.includes(url)) {
      problems.push(`${url} — does not list itself. Every member must include a self-reference.`);
    }
    for (const href of hrefs) {
      const other = alternates.get(href);
      if (!other) {
        problems.push(`${url} — points at ${href}, which declares no alternates (or does not exist).`);
      } else if (![...other.values()].includes(url)) {
        problems.push(`${href} — does not link back to ${url}. A one-way link voids the cluster.`);
      }
    }
  }

  if (problems.length) return fail(`${problems.length} hreflang problem(s)`, problems);
  return pass(
    `${alternates.size} pages in complete ${locales.length}-language clusters, every return link present`
  );
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
