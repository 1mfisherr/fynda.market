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

/*
 * <lastmod> in the sitemap: the day each page last actually changed.
 *
 * Fresh dates are the site's whole argument, and lastmod is how a sitemap tells
 * a crawler which pages to come back to first. Google uses it only when it is
 * consistently true, so it is not the build date: a page keeps the day it last
 * changed until its HTML hash moves. The previous hashes and days are read off
 * the live site; a page whose hash matches keeps its day, any other gets today.
 *
 * Only for a build from the live database — a fixtures build is not what the
 * site serves. And if the live files cannot be read, no <lastmod> at all: a
 * guessed date is worse than none.
 */
if (process.env.FYNDA_DATA_SOURCE === 'supabase' && existsSync(sitemap)) {
  const { todayIso } = await import('../src/lib/format.ts');
  const today = todayIso();
  const live = async (file) => {
    try {
      const res = await fetch(`https://fynda.market/${file}`, { headers: { 'user-agent': 'fynda-postbuild/1' } });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  };
  const [wasHash, wasDay] = await Promise.all([live('_hashes.json'), live('_modified.json')]);
  if (wasHash) {
    const modified = {};
    for (const [path, hash] of Object.entries(hashes)) {
      modified[path] = wasHash[path] === hash && wasDay?.[path] ? wasDay[path] : today;
    }
    writeFileSync(join(dist, '_modified.json'), JSON.stringify(modified));
    const xml = readFileSync(sitemap, 'utf8').replace(/<url><loc>([^<]+)<\/loc>/g, (whole, loc) => {
      const day = modified[new URL(loc).pathname];
      return day ? `${whole}<lastmod>${day}</lastmod>` : whole;
    });
    writeFileSync(sitemap, xml);
    const fresh = Object.values(modified).filter((d) => d === today).length;
    console.log(`postbuild: <lastmod> on ${Object.keys(modified).length} pages, ${fresh} changed today`);
  } else {
    console.log('postbuild: live hashes unreadable — sitemap ships without <lastmod>');
  }
}
