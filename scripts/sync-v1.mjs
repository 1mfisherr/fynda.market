#!/usr/bin/env node
/**
 * Bring v1's Swiss dates across: what it added, cancelled, moved or dropped.
 *
 *   node scripts/sync-v1.mjs                 report every difference, write nothing
 *   node scripts/sync-v1.mjs --apply         write them, in one transaction
 *   node scripts/sync-v1.mjs --stamp today   stamp "confirmed on" today, not v1's check date
 *
 * v1 keeps the Swiss markets checked — its weekly watch reads every organiser's
 * page and Delfim reviews what it finds (Delfim, 2026-10-09: v1 does
 * Switzerland, fynda.market copies). This script is the copy. New markets are
 * not its business: `import-v1-additions.mjs` brings those, and this script
 * names them so they are not forgotten.
 *
 * Per Swiss market both sites have, for dates from today on:
 *   add      a date v1 lists and we do not
 *   cancel   v1 says a date we list is cancelled
 *   hours    same date, other opening hours
 *   status   v1 has it confirmed (or tentative), we have something else
 *   remove   a date we list that v1 does not have at all
 *   stamp    every date v1 has gets "confirmed on" = the day v1 checked the
 *            market (markets.last_verified_at), when that is newer than ours
 *
 * What it never does: touch a date an organiser gave us (origin = 'organiser')
 * beyond the stamp; change a market's own row (status, website, address,
 * rhythm) — those differences are printed for a person to judge; copy text.
 *
 * Every change is flagged ⚠ when our own work changed that date since
 * --since (default 2026-10-08, the day both sites were checked separately),
 * and a flagged change is not written unless --accept-flagged says so: a fix
 * of ours is never undone without someone deciding it.
 *
 * `intake/sync-v1/keep-ours.json` lists the differences already decided in
 * our favour — {slug, kind, dates?, reason, decided} — after the organiser's
 * page was read. Those are skipped every week and printed as "fix in v1",
 * because v1 will keep saying the old thing until it is corrected there.
 *
 * Each written date gets a `facts` row: source_type 'import', the page v1
 * checked it on as source_ref, observed at v1's check — the stamp stays
 * traceable, as confirm.mjs's are.
 */

import fs from 'node:fs';
import { query, withClient, DB_URL, V1_URL } from './db.mjs';
import { todayIso } from '../src/lib/format.ts';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const ACCEPT_FLAGGED = args.includes('--accept-flagged');
const KEEP_FILE = new URL('../intake/sync-v1/keep-ours.json', import.meta.url);
const KEEP = fs.existsSync(KEEP_FILE) ? JSON.parse(fs.readFileSync(KEEP_FILE, 'utf8')) : [];
const STAMP_TODAY = args.includes('--stamp') && args[args.indexOf('--stamp') + 1] === 'today';
const SINCE = args.includes('--since') ? args[args.indexOf('--since') + 1] : '2026-10-08';
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

if (!V1_URL) throw new Error('V1_DATABASE_URL is not set (.env.local).');

const today = todayIso();
const say = (...p) => console.log(...p);
const day = (iso) => new Date(`${String(iso).slice(0, 10)}T12:00:00Z`)
  .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const hours = (a, b) => (a || b ? `${a ?? '?'}–${b ?? '?'}` : 'no hours');
const site = (u) => (u ?? '').trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, '');

/* ---------------------------------------------------------------------------
 * read both sides
 * ------------------------------------------------------------------------- */

const v1Markets = await query(`
  select m.slug, m.name, m.status, m.last_verified_at, m.website_url,
         mp.source_url, v.address_line, v.postal_code, v.city
    from markets m
    left join market_private mp on mp.market_id = m.id
    left join venues v on v.id = m.venue_id`, [], V1_URL);

const v1Dates = await query(`
  select m.slug, d.date::text as date, to_char(d.start_time, 'HH24:MI') as st, to_char(d.end_time, 'HH24:MI') as et,
         d.status, d.cancellation_note
    from market_dates d join markets m on m.id = d.market_id
   where d.date >= $1::date`, [today], V1_URL);

const ourMarkets = await query(`
  select m.id, m.slug, m.status, m.website_url, v.address_line, v.postal_code
    from public.markets m
    join public.venues v on v.id = m.venue_id
    join public.cities c on c.id = v.city_id
    join public.regions r on r.id = c.region_id
    join public.countries k on k.id = r.country_id
   where k.iso2 = 'CH'`);

const ourDates = await query(`
  select o.id, m.slug, o.date::text as date, to_char(o.start_time, 'HH24:MI') as st, to_char(o.end_time, 'HH24:MI') as et,
         o.status, o.origin, o.confirmed_at
    from public.occurrences o join public.markets m on m.id = o.market_id
   where o.date >= $1::date and m.id = any($2)`, [today, ourMarkets.map((m) => m.id)]);

// Our own changes since --since, by market and date, so a sync never quietly undoes one.
const ours = await query(`
  select h.op, h.changed_at::date::text as on, h.who, m.slug,
         coalesce(h.data->>'date', o.date::text) as date, h.data
    from public.history h
    join public.markets m on m.id = h.market_id
    left join public.occurrences o on o.id = (h.row_key->>'id')::uuid
   where h.table_name = 'occurrences' and h.changed_at >= $1::date
     and h.who not in ('sync-v1.mjs', 'import-v1.mjs', 'import-v1-additions.mjs')`, [SINCE]);

// market|date → which kinds of our own change touched that date, and when.
const touched = new Map();
for (const h of ours) {
  if (!h.date) continue;
  const tags = [];
  if (h.op === 'delete') tags.push('removed');
  else if (h.op === 'insert') tags.push('added');
  else {
    const fields = Object.keys(h.data ?? {});
    if (fields.includes('start_time') || fields.includes('end_time')) tags.push('hours');
    if (fields.includes('status')) tags.push(h.data.status?.[1] === 'unverified' ? 'unconfirmed' : 'status');
    if (fields.includes('date')) tags.push('moved');
  }
  if (!tags.length) continue; // a stamp alone is not a fix
  const key = `${h.slug}|${h.date}`;
  const seen = touched.get(key) ?? { tags: new Set(), on: h.on };
  for (const t of tags) seen.tags.add(t);
  touched.set(key, seen);
}

// Which of our own changes each kind of sync change would undo.
const UNDOES = {
  add: ['removed', 'moved'], remove: ['added', 'moved'], hours: ['hours'],
  status: ['unconfirmed', 'status'], cancel: ['added', 'hours', 'status', 'moved'],
};
const WORDS = {
  removed: 'we removed this date', added: 'we added this date', hours: 'we changed these hours',
  unconfirmed: 'we marked it "not yet confirmed"', status: 'we changed its status', moved: 'we moved this date',
};
function undoes(slug, date, kind) {
  const seen = touched.get(`${slug}|${date}`);
  const hit = seen && UNDOES[kind].find((t) => seen.tags.has(t));
  return hit ? `${WORDS[hit]} on ${day(seen.on)}` : null;
}

/* ---------------------------------------------------------------------------
 * compare
 * ------------------------------------------------------------------------- */

const v1BySlug = new Map(v1Markets.map((m) => [m.slug, m]));
const ourBySlug = new Map(ourMarkets.map((m) => [m.slug, m]));
const group = (rows) => rows.reduce((map, r) => map.set(r.slug, [...(map.get(r.slug) ?? []), r]), new Map());
const v1DatesBySlug = group(v1Dates);
const ourDatesBySlug = group(ourDates);

const changes = [];      // { slug, kind, date, what, flag, write }
const lookAt = [];       // market-level differences for a person
const stampWrites = [];

for (const ourMarket of ourMarkets) {
  if (ONLY && ourMarket.slug !== ONLY) continue;
  const v1 = v1BySlug.get(ourMarket.slug);
  if (!v1) continue;

  if (v1.status !== ourMarket.status && (v1.status === 'permanently_closed' || ourMarket.status === 'permanently_closed')) {
    lookAt.push(`${ourMarket.slug}: v1 says ${v1.status}, we say ${ourMarket.status}`);
  }
  if (ourMarket.status !== 'active') continue;
  if (v1.website_url && site(v1.website_url) !== site(ourMarket.website_url)) {
    lookAt.push(`${ourMarket.slug}: website — v1 ${v1.website_url} · ours ${ourMarket.website_url ?? 'none'}`);
  }
  if (v1.address_line && ourMarket.address_line && v1.address_line.trim() !== ourMarket.address_line.trim()) {
    lookAt.push(`${ourMarket.slug}: address — v1 "${v1.address_line}, ${v1.postal_code ?? ''}" · ours "${ourMarket.address_line}, ${ourMarket.postal_code ?? ''}"`);
  }

  const theirs = new Map((v1DatesBySlug.get(ourMarket.slug) ?? []).map((d) => [d.date, d]));
  const mine = new Map((ourDatesBySlug.get(ourMarket.slug) ?? []).map((d) => [d.date, d]));
  const stampAt = STAMP_TODAY ? new Date().toISOString() : v1.last_verified_at?.toISOString?.() ?? null;
  const source = v1.source_url || v1.website_url || 'v1';
  const push = (kind, date, what, write) => changes.push({
    slug: ourMarket.slug, kind, date, what, write, flag: undoes(ourMarket.slug, date, kind),
  });

  for (const [date, t] of theirs) {
    const o = mine.get(date);
    const tStatus = t.status === 'cancelled' ? 'cancelled' : t.status === 'tentative' ? 'tentative' : 'confirmed';

    if (!o) {
      if (tStatus === 'cancelled') continue; // nothing to cancel here
      push('add', date, `add, ${hours(t.st, t.et)}`, { op: 'insert', market_id: ourMarket.id, date, st: t.st, et: t.et, status: tStatus, stampAt, source });
      continue;
    }
    if (o.origin === 'organiser') {
      if (tStatus === 'cancelled' && o.status !== 'cancelled') lookAt.push(`${ourMarket.slug} ${date}: v1 says cancelled, but the organiser gave us this date — not touched`);
      continue;
    }
    if (tStatus === 'cancelled') {
      if (o.status !== 'cancelled') push('cancel', date, `cancel${t.cancellation_note ? ` — "${t.cancellation_note}"` : ''}`, { op: 'cancel', id: o.id, date, note: t.cancellation_note, source, stampAt });
      continue;
    }
    if ((t.st && t.st !== o.st) || (t.et && t.et !== o.et)) {
      push('hours', date, `hours ${hours(o.st, o.et)} → ${hours(t.st, t.et)}`, { op: 'hours', id: o.id, date, st: t.st ?? o.st, et: t.et ?? o.et, source, stampAt });
    }
    if (o.status !== tStatus) {
      const label = (s) => (s === 'unverified' ? 'not yet confirmed' : s);
      push('status', date, `${label(o.status)} → ${label(tStatus)}`, { op: 'status', id: o.id, date, status: tStatus, source, stampAt });
    }
    if (stampAt && (!o.confirmed_at || new Date(o.confirmed_at) < new Date(stampAt))) {
      stampWrites.push({ id: o.id, date, stampAt, source, status: o.status });
    }
  }

  for (const [date, o] of mine) {
    if (theirs.has(date) || o.status === 'cancelled') continue;
    if (o.origin === 'organiser') { lookAt.push(`${ourMarket.slug} ${date}: v1 does not list it, but the organiser gave us this date — kept`); continue; }
    push('remove', date, 'remove (v1 does not list it)', { op: 'delete', id: o.id, date });
  }
}

const newInV1 = v1Markets.filter((m) => m.status === 'active' && !ourBySlug.has(m.slug));
const onlyOurs = ourMarkets.filter((m) => m.status === 'active' && !v1BySlug.has(m.slug));

/* ---------------------------------------------------------------------------
 * report
 * ------------------------------------------------------------------------- */

// What gets written: not what we decided to keep, and nothing flagged unless accepted.
for (const c of changes) {
  c.kept = KEEP.find((k) => k.slug === c.slug && k.kind === c.kind && (!k.dates || k.dates.includes(c.date))) ?? null;
  c.writes = !c.kept && (!c.flag || ACCEPT_FLAGGED);
}
const writes = changes.filter((c) => c.writes);
// A date stays "not yet confirmed" unless its status change is written, so it
// must not get a "confirmed on" stamp either — the page would say both.
const confirmedNow = new Set(writes.filter((c) => c.kind === 'status').map((c) => c.write.id));
const stampsToWrite = stampWrites.filter((s) => s.status === 'confirmed' || s.status === 'tentative' || confirmedNow.has(s.id));

const bySlug = group(changes);
const kinds = ['add', 'cancel', 'hours', 'status', 'remove'];
const count = (k) => writes.filter((c) => c.kind === k).length;
const flagged = changes.filter((c) => c.flag && !c.kept);
const kept = changes.filter((c) => c.kept);

say(`\nv1 → fynda.market, Swiss dates from ${day(today)}`);
say(`stamp: ${STAMP_TODAY ? 'today' : "the day v1 checked each market"} · own changes watched since ${day(SINCE)}\n`);

// One line per market and kind of change, with its dates: ten identical hour
// changes read as one decision, which is what they are.
const short = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', timeZone: 'UTC' });
for (const [slug, list] of [...bySlug].sort(([x], [y]) => x.localeCompare(y))) {
  say(`${v1BySlug.get(slug)?.name ?? slug}  (${slug})`);
  const lines = new Map();
  for (const c of list) {
    const key = `${kinds.indexOf(c.kind)}|${c.what}|${c.flag ?? ''}|${c.kept ? 'kept' : ''}`;
    lines.set(key, [...(lines.get(key) ?? []), c]);
  }
  for (const [, cs] of [...lines].sort(([x], [y]) => x.localeCompare(y))) {
    const { what, flag, kept: keep, writes: w } = cs[0];
    const dates = cs.map((c) => c.date).sort().map(short).join(', ');
    const mark = keep ? '=' : flag ? '⚠' : ' ';
    const why = keep ? `\n      = kept ours: ${keep.reason}` : flag ? `\n      ← ${flag}${w ? '' : ' — skipped unless --accept-flagged'}` : '';
    say(`  ${mark} ${what}: ${dates}${why}`);
  }
}

say(`\nTo write: ${count('add')} added, ${count('cancel')} cancelled, ${count('hours')} new hours, ${count('status')} status changes, ${count('remove')} removed; ${stampsToWrite.length} dates get a new "confirmed on" stamp.`);
if (flagged.length && !ACCEPT_FLAGGED) say(`⚠ ${flagged.length} change(s) would undo something we changed ourselves and are skipped. Check the organiser's page, then add the ones that are ours to keep to intake/sync-v1/keep-ours.json, or run with --accept-flagged.`);
if (kept.length) say(`= ${kept.length} difference(s) kept ours (keep-ours.json) — v1 still says otherwise; correct them in v1.`);
if (lookAt.length) { say(`\nFor a person to look at (not changed by this script):`); for (const l of lookAt) say(`  · ${l}`); }
if (newInV1.length) say(`\nNew in v1, not here yet — run import-v1-additions.mjs:\n${newInV1.map((m) => `  · ${m.name} (${m.slug})`).join('\n')}`);
if (onlyOurs.length) say(`\nOurs only (v1 does not have them; left alone): ${onlyOurs.map((m) => m.slug).join(', ')}`);

if (!APPLY) { say('\nDry run. Add --apply to write.'); process.exit(0); }

/* ---------------------------------------------------------------------------
 * write
 * ------------------------------------------------------------------------- */

const fact = (c, id, date, source, observedAt) => c.query(
  `insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
   values ('occurrence', $1, 'date', to_jsonb($2::text), 'import', $3, coalesce($4::timestamptz, now()), 'confirmed')`,
  [id, date, `v1 · ${source}`, observedAt]);

await withClient(DB_URL, async (c) => {
  await c.query('begin');
  for (const { write: w } of writes) {
    if (w.op === 'insert') {
      const { rows: [row] } = await c.query(
        `insert into public.occurrences (market_id, date, start_time, end_time, status, origin, confirmed_at)
         values ($1, $2, $3, $4, $5, 'import', $6) returning id`,
        [w.market_id, w.date, w.st, w.et, w.status, w.stampAt]);
      await fact(c, row.id, w.date, w.source, w.stampAt);
    } else if (w.op === 'cancel') {
      await c.query(`update public.occurrences set status = 'cancelled', cancellation_note = $2, updated_at = now() where id = $1`, [w.id, w.note]);
      await fact(c, w.id, w.date, w.source, w.stampAt);
    } else if (w.op === 'hours') {
      await c.query(`update public.occurrences set start_time = $2, end_time = $3, updated_at = now() where id = $1`, [w.id, w.st, w.et]);
    } else if (w.op === 'status') {
      await c.query(`update public.occurrences set status = $2, updated_at = now() where id = $1`, [w.id, w.status]);
    } else if (w.op === 'delete') {
      await c.query(`delete from public.occurrences where id = $1`, [w.id]);
    }
  }
  for (const s of stampsToWrite) {
    await c.query(`update public.occurrences set confirmed_at = $2, updated_at = now() where id = $1`, [s.id, s.stampAt]);
    await fact(c, s.id, s.date, s.source, s.stampAt);
  }
  await c.query('commit');
});
say('\nWritten. Read a market back before believing it; the site shows it after the next build.');
process.exit(0);
