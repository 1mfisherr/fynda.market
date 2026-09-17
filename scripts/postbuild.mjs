/**
 * After `astro build`: the per-locale 404 pages go where Cloudflare looks.
 *
 * Astro writes `src/pages/[locale]/404.astro` as `dist/{locale}/404/index.html`.
 * Cloudflare Pages serves the nearest `404.html` up the folder tree, so the
 * file has to be `dist/{locale}/404.html`. Moved, not copied: a `/de/404/`
 * address must not exist, and the route guardrail would rightly refuse it.
 */
import { existsSync, readdirSync, renameSync, rmSync } from 'node:fs';
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
