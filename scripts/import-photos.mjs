#!/usr/bin/env node
/**
 * Photographs supplied by hand, named after the market.
 *
 *   node scripts/import-photos.mjs "<folder>" [--dry]
 *
 * The sibling of import-images.mjs, for the other way a photo arrives: a folder
 * of files named "Flohmarkt am Mauerpark.jpg", matched to a market by its name
 * in any locale rather than by a fact the import wrote. Everything downstream
 * is the same — three sizes, slug filenames, `markets.image_url`, and a fact
 * that records where the picture came from.
 *
 *   name.webp        the hero, 1440px — twice the 720 it renders at
 *   name-720.webp    the phone hero
 *   name-thumb.webp  the 148px square a MarketRow shows at 74
 *
 * Re-running is safe: it re-encodes from the source and rewrites the column.
 * Matching is exact on the name, then on the slugified name; anything it cannot
 * place is listed and nothing is written until every file has a market.
 */

import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

import sharp from 'sharp';

import { withClient, query, DB_URL } from './db.mjs';
import { slugify } from './slugify.mjs';
import { MEDIUM_WIDTH, mediumUrl, thumbUrl } from '../src/lib/images.ts';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const source = args.find((a) => !a.startsWith('--'));
if (!source) throw new Error('usage: node scripts/import-photos.mjs "<folder>" [--dry]');
if (!existsSync(source)) throw new Error(`No such folder: ${source}`);

const target = join(process.cwd(), 'public', 'images');
const MAX_WIDTH = 1440;
const THUMB = 148;
const QUALITY = 72;
const KINDS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff']);

/* ---- what is here ------------------------------------------------------- */

const markets = await query(`
  select m.id, m.slug, m.image_url, t.value as name, t.locale
    from public.markets m
    join public.texts t on t.entity_type = 'market' and t.entity_id = m.id and t.field = 'name'`);

const byName = new Map();
for (const m of markets) {
  for (const key of [m.name.trim().toLowerCase(), slugify(m.name)]) {
    if (!byName.has(key)) byName.set(key, m);
  }
}

/* ---- match -------------------------------------------------------------- */

const files = readdirSync(source).filter((f) => KINDS.has(extname(f).toLowerCase()));
const matched = [];
const unmatched = [];
for (const file of files) {
  const stem = basename(file, extname(file)).trim();
  const market = byName.get(stem.toLowerCase()) ?? byName.get(slugify(stem)) ?? null;
  if (market) matched.push({ file, market });
  else unmatched.push(file);
}

console.log(`${files.length} image(s) in ${source}`);
for (const { file, market } of matched) console.log(`  ${file}  ->  ${market.slug}${market.image_url ? '  (replacing a photo)' : ''}`);
if (unmatched.length) {
  console.log(`\n${unmatched.length} file(s) match no market — nothing is written until they do:`);
  for (const f of unmatched) console.log(`  - ${f}`);
  process.exit(1);
}
if (dry) { console.log('\n--dry: nothing written.'); process.exit(0); }

/* ---- write -------------------------------------------------------------- */

mkdirSync(target, { recursive: true });
let before = 0, after = 0;
const written = [];

for (const { file, market } of matched) {
  const from = join(source, file);
  const name = `${market.slug}.webp`;
  before += statSync(from).size;
  await sharp(from).resize({ width: MAX_WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(join(target, name));
  await sharp(from).resize({ width: MEDIUM_WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toFile(join(target, mediumUrl(name)));
  await sharp(from).resize({ width: THUMB, height: THUMB, fit: 'cover' }).webp({ quality: QUALITY }).toFile(join(target, thumbUrl(name)));
  after += statSync(join(target, name)).size + statSync(join(target, mediumUrl(name))).size + statSync(join(target, thumbUrl(name))).size;
  written.push({ id: market.id, url: `/images/${name}`, slug: market.slug, file });
}

await withClient(DB_URL, async (client) => {
  await client.query('begin');
  try {
    for (const w of written) {
      await client.query(`update public.markets set image_url = $2, updated_at = now() where id = $1`, [w.id, w.url]);
      await client.query(
        `update public.facts set superseded_by = $1
          where entity_type = 'market' and entity_id = $1 and field = 'image_url' and superseded_by is null`,
        [w.id]
      );
      await client.query(
        `insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
         values ('market', $1, 'image_url', $2::jsonb, 'manual', $3, now(), 'confirmed')`,
        [w.id, JSON.stringify(w.url), `supplied by hand as "${w.file}"`]
      );
    }
    await client.query('commit');
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
});

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
console.log(`\n${written.length} photo(s) written in three sizes to public/images/ — ${mb(before)} in, ${mb(after)} out.`);
process.exit(0);
