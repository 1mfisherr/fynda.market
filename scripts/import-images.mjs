#!/usr/bin/env node
/**
 * Move the v1 photographs in, and point the markets at them.
 *
 * v1 stored a filename in `markets.image_url` and the file itself in its own
 * repo. The import (scripts/import-v1.mjs) wrote each filename to `facts` as a
 * note and left `markets.image_url` null, because a URL to a file that is not
 * here is a broken image. This script is the other half: it brings the files
 * across, then reads the facts back onto the column.
 *
 *   node scripts/import-images.mjs [source-dir] [--dry]
 *
 * Two things it refuses to carry over:
 *
 *   Stock photographs. Eleven facts point at pexels.com. docs/BRAND.md is
 *   explicit — real photos from real visits, no stock, no AI — and the
 *   illustration fallback is permanent furniture, not a gap. Those markets keep
 *   their illustration.
 *
 *   Spaces and capitals in filenames. Twelve files are named "Flohmarkt
 *   Petersplatz.webp", which v1 then had to percent-encode into its own URLs.
 *   The file is renamed on the way in with the same slugify() that mints every
 *   other URL here, so the path in the database is the path on disk.
 *
 * Photographs are re-encoded on the way in, not copied, and each one is written
 * twice. v1's files are near-lossless — the worst is 903 KB for a 1000px image
 * — and the market page hero loads eagerly, so this is Core Web Vitals, which is
 * the search traffic the whole plan rests on.
 *
 *   name.webp        the hero. MAX_WIDTH is twice the 720px it renders at:
 *                    a retina screen today, and a desktop layout not yet drawn.
 *   name-thumb.webp  the 74px square in a MarketRow, at twice that.
 *
 * The thumbnail is the one that actually mattered. A city page renders twenty
 * MarketRows, and each was fetching the full hero — around 2 MB of image for
 * squares 74 pixels wide. src/components/PhotoOrArt.astro picks between them.
 *
 * Re-running is safe and idempotent: it re-encodes from the source every time
 * and rewrites the column from the facts, which are the source of truth for
 * which photo belongs to which market.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

import sharp from 'sharp';

import { withClient, DB_URL } from './db.mjs';
import { slugify } from './slugify.mjs';
import { thumbUrl } from '../src/lib/images.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const source = args.find((a) => !a.startsWith('--')) ??
  join(homedir(), 'Documents', 'fleafind', 'public', 'images');
const target = join(root, 'public', 'images');

/** Twice the 720px the market-page hero renders at. Never enlarged. */
const MAX_WIDTH = 1440;
const QUALITY = 72;

/** Twice the 74px square a MarketRow renders. Centre-cropped, like the CSS. */
const THUMB = 148;

if (!existsSync(source)) {
  throw new Error(`Source directory not found: ${source}\nPass it as the first argument.`);
}

/** "/images/Flohmarkt%20Petersplatz.webp" -> "Flohmarkt Petersplatz.webp" */
const basename = (value) => decodeURIComponent(value).split('/').pop();

/** "Flohmarkt Petersplatz.webp" -> "flohmarkt-petersplatz.webp" */
const rename = (file) => {
  const dot = file.lastIndexOf('.');
  return `${slugify(file.slice(0, dot))}${file.slice(dot).toLowerCase()}`;
};

const onDisk = new Set(readdirSync(source));

await withClient(DB_URL, async (client) => {
  const { rows: facts } = await client.query(
    `select entity_id, value from public.facts
      where entity_type = 'market' and field = 'image_url'`
  );

  const stock = [];
  const absent = [];
  const copied = new Set();
  const updates = [];
  let before = 0;
  let after = 0;

  for (const fact of facts) {
    if (!fact.value.startsWith('/images/')) { stock.push(fact.value); continue; }

    const file = basename(fact.value);
    if (!onDisk.has(file)) { absent.push(file); continue; }

    const named = rename(file);
    if (!dry && !copied.has(named)) {
      mkdirSync(target, { recursive: true });
      const from = join(source, file);
      before += statSync(from).size;
      await sharp(from)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(join(target, named));
      await sharp(from)
        .resize({ width: THUMB, height: THUMB, fit: 'cover' })
        .webp({ quality: QUALITY })
        .toFile(join(target, thumbUrl(named)));
      after += statSync(join(target, named)).size + statSync(join(target, thumbUrl(named))).size;
    }
    copied.add(named);
    updates.push([fact.entity_id, `/images/${named}`]);
  }

  if (!dry) {
    // Every market's photo comes from the facts, so a fact that was deleted or
    // corrected takes the column with it rather than leaving a stale path.
    await client.query(`update public.markets set image_url = null where image_url is not null`);
    for (const [id, url] of updates) {
      await client.query(`update public.markets set image_url = $2 where id = $1`, [id, url]);
    }
  }

  const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  console.log(
    `  [images] ${copied.size} file(s) ${dry ? 'would be' : ''} written to public/images/, ` +
      `${updates.length} market(s) pointed at one`
  );
  if (after) console.log(`  [images] ${mb(before)} -> ${mb(after)} at width <= ${MAX_WIDTH}, q${QUALITY}`);
  if (stock.length) console.log(`  [images] ${stock.length} stock URL(s) skipped — docs/BRAND.md`);
  if (absent.length) console.log(`  [images] ${absent.length} fact(s) name a file that is not in ${source}:\n    ${absent.join('\n    ')}`);
});
