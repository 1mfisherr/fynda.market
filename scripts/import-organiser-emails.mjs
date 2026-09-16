#!/usr/bin/env node
/**
 * Load organiser e-mail addresses from a spreadsheet, and give each one a link.
 *
 *   node scripts/import-organiser-emails.mjs emails.csv          # dry run
 *   node scripts/import-organiser-emails.mjs emails.csv --apply  # write
 *
 * The file is CSV with a header row and at least two columns: `market` (the
 * market's slug, or its name in any language) and `email`. Optional: `locale`
 * (de/fr/it/en); without it the canton's language is used, English if the
 * canton has none. Anything Delfim can export from a spreadsheet works; the
 * columns may be in any order.
 *
 * For each row: find the market, find its organiser row, set the address and
 * the language, and mint a personal link if there is none. An address already
 * set is not overwritten (say so and move on). Nothing is mailed from here —
 * the seven-day mail finds them on its own, and the welcome mail is
 * `--welcome`, which sends it to every organiser this run gave a link to.
 */

import { readFileSync } from 'node:fs';
import { query, secret } from './db.mjs';
import { organiserWelcome, sendMail } from '../functions/_mail.ts';
import { editUrl, sha256Hex, tokenFor } from '../functions/_link.ts';

const [file, ...flags] = process.argv.slice(2);
if (!file) {
  console.error('\n  Usage: node scripts/import-organiser-emails.mjs <file.csv> [--apply] [--welcome]\n');
  process.exit(1);
}
const apply = flags.includes('--apply');
const welcome = flags.includes('--welcome');

const SIGNING = secret('ADMIN_SIGNING_SECRET');
if (!SIGNING) { console.error('\n  ADMIN_SIGNING_SECRET is not set.\n'); process.exit(1); }
const RESEND_API_KEY = secret('RESEND_API_KEY');
if (welcome && !RESEND_API_KEY) { console.error('\n  --welcome needs RESEND_API_KEY.\n'); process.exit(1); }

/* A small CSV reader: quoted fields, commas or semicolons, a header row. */
function parseCsv(text) {
  const sep = text.split('\n')[0].includes(';') ? ';' : ',';
  const rows = [];
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const cells = [];
    let cur = '', q = false;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (q) {
        if (ch === '"' && raw[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === sep) { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    rows.push(cells.map((c) => c.trim()));
  }
  const header = rows.shift().map((h) => h.toLowerCase());
  return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const LANG_OF_REGION = { ZH: 'de', BE: 'de', LU: 'de', UR: 'de', SZ: 'de', OW: 'de', NW: 'de', GL: 'de', ZG: 'de', FR: 'fr', SO: 'de', BS: 'de', BL: 'de', SH: 'de', AR: 'de', AI: 'de', SG: 'de', GR: 'de', AG: 'de', TG: 'de', TI: 'it', VD: 'fr', VS: 'fr', NE: 'fr', GE: 'fr', JU: 'fr' };

const rows = parseCsv(readFileSync(file, 'utf8'));
console.log(`\n  ${rows.length} row${rows.length === 1 ? '' : 's'} in ${file}. ${apply ? 'Applying.' : 'Dry run — pass --apply to write.'}\n`);

let set = 0, linked = 0, skipped = 0;
const welcomes = [];

for (const row of rows) {
  const key = (row.market ?? row.slug ?? row.name ?? '').trim();
  const email = (row.email ?? '').trim().toLowerCase();
  if (!key || !EMAIL.test(email)) { console.log(`  skip: ${JSON.stringify(row)}`); skipped++; continue; }

  const [market] = await query(
    `select m.id, m.slug, m.organiser_id, r.code as region_code,
            (select value from texts t where t.entity_type='market' and t.entity_id=m.id and t.field='name' and t.locale='en') as name
       from markets m
       join venues v on v.id = m.venue_id
       join cities c on c.id = v.city_id
       join regions r on r.id = c.region_id
      where m.slug = $1
         or exists (select 1 from texts t where t.entity_type='market' and t.entity_id=m.id and t.field='name' and lower(t.value) = lower($1))
      limit 1`,
    [key]
  );
  if (!market) { console.log(`  no market: "${key}"`); skipped++; continue; }
  if (!market.organiser_id) { console.log(`  ${market.slug}: no organiser row — add one first`); skipped++; continue; }

  const [org] = await query(`select id, name, email, locale from organisers where id = $1`, [market.organiser_id]);
  const locale = ['de', 'fr', 'it', 'en'].includes(row.locale) ? row.locale : (LANG_OF_REGION[market.region_code] ?? 'en');

  if (org.email && org.email !== email) {
    console.log(`  ${market.slug}: ${org.name} already has ${org.email}, not overwriting with ${email}`);
    skipped++;
    continue;
  }

  const [taken] = await query(`select id, name from organisers where lower(email) = $1 and id <> $2`, [email, org.id]);
  if (taken) {
    console.log(`  ${market.slug}: ${email} belongs to "${taken.name}" — pointing the market at them`);
    if (apply) await query(`update markets set organiser_id = $2, updated_at = now() where id = $1`, [market.id, taken.id]);
    set++;
    continue;
  }

  console.log(`  ${market.slug}: ${org.name} ← ${email} [${locale}]${org.email ? '' : ' (new)'}`);
  if (!apply) continue;

  await query(`update organisers set email = $2, locale = coalesce(locale, $3), updated_at = now() where id = $1`, [org.id, email, locale]);
  set++;

  const [live] = await query(`select id from organiser_links where organiser_id = $1 and revoked_at is null`, [org.id]);
  let linkId = live?.id;
  if (!linkId) {
    // The token is derived from the link's id, so the id comes first.
    const [fresh] = await query(`select gen_random_uuid() as id`);
    const token = await tokenFor(SIGNING, fresh.id);
    await query(`insert into organiser_links (id, organiser_id, token_hash) values ($1, $2, $3)`, [fresh.id, org.id, await sha256Hex(token)]);
    linkId = fresh.id;
    linked++;
    welcomes.push({ org, email, locale, market, linkId });
  }
}

if (welcome && apply) {
  let sent = 0;
  for (const w of welcomes) {
    const url = editUrl('https://fynda.market', await tokenFor(SIGNING, w.linkId));
    const ok = await sendMail({ RESEND_API_KEY }, { to: w.email, ...organiserWelcome(w.locale, w.org.name, w.market.name ?? w.market.slug, url) });
    if (ok) sent++; else console.error(`  welcome failed: ${w.email}`);
  }
  console.log(`\n  Welcome mails sent: ${sent} of ${welcomes.length}.`);
}

console.log(`\n  ${set} address${set === 1 ? '' : 'es'} set, ${linked} link${linked === 1 ? '' : 's'} minted, ${skipped} skipped.\n`);
process.exit(0);
