/**
 * After `astro build`: the per-locale 404 pages go where Cloudflare looks.
 *
 * Astro writes `src/pages/[locale]/404.astro` as `dist/{locale}/404/index.html`.
 * Cloudflare Pages serves the nearest `404.html` up the folder tree, so the
 * file has to be `dist/{locale}/404.html`. Moved, not copied: a `/de/404/`
 * address must not exist, and the route guardrail would rightly refuse it.
 *
 * Then a manifest of every indexable page and a hash of what a reader of it
 * sees — `readable()` below — served as `/_hashes.json`. The next publish
 * reads the live copy, compares it with its own, and tells IndexNow only about the pages that actually changed
 * (scripts/indexnow.mjs). The pages are the sitemap's: that is the list of
 * what we ask engines to index, so it is the list of what we tell them about.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
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

/**
 * What a page says, not how it is drawn: its title, its description and its
 * text — no markup, no styles, no scripts, no attributes. Hashed raw, every
 * deploy that touched a stylesheet "changed" all 1,948 pages, and every night
 * the date calendar greying out yesterday changed 936 more; the sitemap told
 * Google that everything changed every day, and Google stopped reading it
 * (last read 28 Sep, Search Console 2026-10-10). The calendar's day cells go
 * too (components/DateFilters.astro): yesterday's number leaving the grid is
 * not news. A market's new date, a new text, a cancellation still are.
 * So go the "checked on" stamps (`data-stamp`): a weekly re-check moved 952
 * pages at once on 2026-10-23, the IndexNow batch Bing warns about. A date
 * the organiser confirmed still counts: its row says so outside the stamp.
 */
function readable(html) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const body = (html.split(/<body[^>]*>/)[1] ?? html)
    .replace(/<(script|style|template)\b[\s\S]*?<\/\1>/g, ' ')
    .replace(/<(span|button) class="cell[^"]*"[^>]*>[^<]*<\/\1>/g, ' ')
    .replace(/<(p|span)\b[^>]*\bdata-stamp\b[^>]*>[^<]*<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return [title, description, body].join('\n');
}

const sitemap = join(dist, 'sitemap-0.xml');
const hashes = {};
if (existsSync(sitemap)) {
  for (const [, loc] of readFileSync(sitemap, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(loc).pathname;
    const file = join(dist, path, 'index.html');
    if (!existsSync(file)) continue;
    hashes[path] = createHash('sha1').update(readable(readFileSync(file, 'utf8'))).digest('hex').slice(0, 16);
  }
}
/* Which readable() made these hashes. Bump it whenever readable() changes:
   the first publish after compares a new recipe with the old, so every page
   looks changed. With a different recipe live, that publish keeps every
   page's <lastmod> and IndexNow sends only added and removed pages. */
const RECIPE = '2';
writeFileSync(join(dist, '_hashes.json'), JSON.stringify({ __recipe: RECIPE, ...hashes }));
console.log(`postbuild: ${Object.keys(hashes).length} page hashes in _hashes.json`);

/*
 * The picture a shared link shows in a chat: `/share/{name}.jpg` for every
 * market photo, which the market page names as its og:image.
 *
 * JPEG, because not every chat app shows a WebP preview, and 900 x 472 — the
 * 1.91 : 1 frame the apps crop to, from the largest copy we hold. Made here
 * rather than committed, so a photo added through import-photos.mjs gets its
 * preview on the next build with nothing else to remember.
 */
{
  const sharp = (await import('sharp')).default;
  const images = join(dist, 'images');
  const out = join(dist, 'share');
  if (existsSync(images)) {
    mkdirSync(out, { recursive: true });
    const names = readdirSync(images).filter((f) => f.endsWith('.webp') && !/-(720|thumb)\.webp$/.test(f));
    const width = async (file) => (existsSync(file) ? (await sharp(file).metadata()).width ?? 0 : 0);
    await Promise.all(names.map(async (name) => {
      const base = name.replace(/\.webp$/, '');
      const candidates = [join(images, name), join(images, `${base}-720.webp`)];
      const widths = await Promise.all(candidates.map(width));
      const from = candidates[widths.indexOf(Math.max(...widths))];
      await sharp(from).resize({ width: 900, height: 472, fit: 'cover' }).jpeg({ quality: 78, mozjpeg: true }).toFile(join(out, `${base}.jpg`));
    }));
    console.log(`postbuild: ${names.length} share previews in /share/`);
  }
}

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
    const sameRecipe = wasHash.__recipe === RECIPE;
    if (!sameRecipe) console.log(`postbuild: hash recipe ${wasHash.__recipe ?? '1'} → ${RECIPE}, every page keeps its <lastmod>`);
    for (const [path, hash] of Object.entries(hashes)) {
      const unchanged = sameRecipe ? wasHash[path] === hash : wasHash[path] !== undefined;
      modified[path] = unchanged && wasDay?.[path] ? wasDay[path] : today;
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
