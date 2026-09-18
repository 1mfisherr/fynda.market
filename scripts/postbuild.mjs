/**
 * After `astro build`: the per-locale 404 pages go where Cloudflare looks.
 *
 * Astro writes `src/pages/[locale]/404.astro` as `dist/{locale}/404/index.html`.
 * Cloudflare Pages serves the nearest `404.html` up the folder tree, so the
 * file has to be `dist/{locale}/404.html`. Moved, not copied: a `/de/404/`
 * address must not exist, and the route guardrail would rightly refuse it.
 *
 * Then a manifest of every indexable page and a hash of its HTML, served as
 * `/_hashes.json`. The next publish reads the live copy, compares it with its
 * own, and tells IndexNow only about the pages that actually changed
 * (scripts/indexnow.mjs). The pages are the sitemap's: that is the list of
 * what we ask engines to index, so it is the list of what we tell them about.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
let moved = 0;
for (const locale of readdirSync(dist, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const from = join(dist, locale, '404', 'index.html');
  if (!existsSync(from)) continue;
  renameSync(from, join(dist, locale, '404.html'));
  rmSync(join(dist, locale, '404'), { recursive: true, force: true });
  moved++;
}
console.log(`postbuild: ${moved} locale 404 pages in place`);

const sitemap = join(dist, 'sitemap-0.xml');
const hashes = {};
if (existsSync(sitemap)) {
  for (const [, loc] of readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(loc).pathname;
    const file = join(dist, path, 'index.html');
    if (!existsSync(file)) continue;
    hashes[path] = createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 16);
  }
}
writeFileSync(join(dist, '_hashes.json'), JSON.stringify(hashes));
console.log(`postbuild: ${Object.keys(hashes).length} page hashes in _hashes.json`);
