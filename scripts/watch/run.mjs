#!/usr/bin/env node
/**
 * The Market Watch's daily run (docs/WATCH-SPEC.md).
 *
 *   node scripts/watch/run.mjs              every source, everything written, Telegram told
 *   node scripts/watch/run.mjs --if-due     the same, unless a run finished in the last six days — what
 *                                           Windows starts at every login, so it runs once a week
 *   node scripts/watch/run.mjs --dry        fetch, read and decide, print it; write nothing, ask no AI
 *   --source <text>                         only sources whose URL contains it
 *   --no-ai                                 questions wait for the next run
 *   --limit <n>                             the first n sources (smoke tests)
 *
 * Windows starts it at login with --if-due (`scripts/watch/schedule.ps1`): once a week, whenever the PC
 * is on — Delfim is not at the PC at a fixed hour (2026-10-09).
 * What it writes: the "confirmed on" stamp for dates a page shows exactly as we
 * have them (confirm.mjs's write: confirmed_at plus a facts row naming the page),
 * findings for everything else, and one Telegram message when something waits
 * for Delfim. It never changes a date itself.
 */

import { createHmac } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { query, withClient, DB_URL, secret } from '../db.mjs';
import { todayIso } from '../../src/lib/format.ts';
import { extractDates, CANCEL_RE, normalise } from './dates.mjs';
import { cleanHtml, cleanText, withoutNoise, hashLines, lineId } from './clean.mjs';
import { fetchSource, politely, closeBrowser } from './fetch.mjs';
import { decide, marketTokens, snippetFor } from './decide.mjs';
import { askAll } from './ask.mjs';

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const DRY = flag('--dry');
const NO_AI = flag('--no-ai') || DRY;
const IF_DUE = flag('--if-due');
const ONLY = opt('--source');
const LIMIT = opt('--limit') ? Number(opt('--limit')) : null;
const SITE = 'https://fynda.market';
const SNAPSHOTS = new URL('../../watch-data/snapshots/', import.meta.url);
const SEEN_CAP = 3000;

const today = todayIso();
const say = (...p) => console.log(...p);
const short = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/* ---------------------------------------------------------------------------
 * due? — at login, only when the last real run is six days old or more
 * ------------------------------------------------------------------------- */

if (IF_DUE && !DRY) {
  const [last] = await query(`select max(finished_at) as at from public.watch_runs where finished_at is not null`);
  if (last?.at && Date.now() - new Date(last.at).getTime() < 6 * 24 * 3600 * 1000) {
    say(`Market Watch: last run ${new Date(last.at).toISOString().slice(0, 10)}, not due yet.`);
    process.exit(0);
  }
}

/* ---------------------------------------------------------------------------
 * what to read today
 * ------------------------------------------------------------------------- */

let sources = await query(`
  select s.id, s.url, s.kind, s.access, s.ignore_lines,
         p.etag, p.last_modified, p.text_hash, p.dates as prev_dates, p.seen, p.fail_streak, p.fetched_at
    from public.watch_sources s
    left join public.watch_pages p on p.source_id = s.id
   where s.active and s.access in ('fetch', 'browser')`);
if (ONLY) sources = sources.filter((s) => s.url.includes(ONLY));
if (LIMIT) sources = sources.slice(0, LIMIT);

const links = await query(`select source_id, market_id from public.watch_source_markets where source_id = any($1)`, [sources.map((s) => s.id)]);
const marketIds = [...new Set(links.map((l) => l.market_id))];
const covered = new Map(); // source → market ids
for (const l of links) covered.set(l.source_id, [...(covered.get(l.source_id) ?? []), l.market_id]);

const markets = new Map((await query(`
  select m.id, m.slug,
         coalesce(n.value, ne.value, m.slug) as name,
         coalesce(vn.value, v.name, '') as venue,
         coalesce(cn.value, '') as town
    from public.markets m
    join public.venues v on v.id = m.venue_id
    left join public.texts n  on n.entity_type = 'market' and n.entity_id = m.id and n.field = 'name' and n.locale = 'de'
    left join public.texts ne on ne.entity_type = 'market' and ne.entity_id = m.id and ne.field = 'name' and ne.locale = 'en'
    left join public.texts vn on vn.entity_type = 'venue' and vn.entity_id = v.id and vn.field = 'name' and vn.locale = 'de'
    left join public.texts cn on cn.entity_type = 'city' and cn.entity_id = v.city_id and cn.field = 'name' and cn.locale = 'de'
   where m.id = any($1) and m.status = 'active'`, [marketIds])).map((m) => [m.id, { ...m, tokens: marketTokens(m), dates: [] }]));

for (const o of await query(`
  select id, market_id, date::text as date, status, origin,
         to_char(start_time, 'HH24:MI') as start, to_char(end_time, 'HH24:MI') as "end"
    from public.occurrences where market_id = any($1) and date >= $2::date order by date`, [marketIds, today])) {
  markets.get(o.market_id)?.dates.push(o);
}

// Questions already asked and answered or waiting are not asked again.
const findingsSoFar = await query(`select market_id, kind, dates::text[] as dates from public.watch_findings where market_id = any($1)`, [marketIds]);
const asked = new Set(findingsSoFar.map((f) => `${f.market_id}|${f.kind}|${[...f.dates].sort().join(',')}`));
const askedDates = new Set(findingsSoFar.flatMap((f) => f.dates.map((d) => `${f.market_id}|${f.kind}|${d}`)));

say(`Market Watch ${today} — ${sources.length} page(s) for ${markets.size} market(s)${DRY ? ' (dry run)' : ''}`);

/* ---------------------------------------------------------------------------
 * reading one page
 * ------------------------------------------------------------------------- */

const snapshotFile = (id) => new URL(`${id}.txt`, SNAPSHOTS);
const readSnapshot = (id) => (existsSync(snapshotFile(id)) ? readFileSync(snapshotFile(id), 'utf8').split('\n') : null);

/** JSON-LD events and calendar entries become plain lines the extractor reads like any other. */
function icsLines(text) {
  const out = [];
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const get = (k) => new RegExp(`^${k}[^:]*:(.*)$`, 'm').exec(block)?.[1]?.trim() ?? '';
    const d = get('DTSTART').replace(/^(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3');
    out.push([get('SUMMARY'), d, get('STATUS') === 'CANCELLED' ? 'cancelled' : '', get('LOCATION')].filter(Boolean).join(' · '));
  }
  return out;
}

async function read(src) {
  const snapshot = readSnapshot(src.id);
  // Without our own copy of the page, a 304 would leave us with nothing to read.
  const previous = snapshot ? src : null;
  const got = await fetchSource(src, previous);
  const result = { src, got, lines: null, outcome: got.outcome };

  if (got.outcome === 'not_modified') {
    result.lines = snapshot;
    result.unchanged = true;
    return result;
  }
  if (got.outcome !== 'read') return result;

  let lines, title = '', parked = false, challenge = false;
  if (got.kind === 'pdf') lines = cleanText(got.body);
  else if (got.kind === 'ics') lines = icsLines(got.body);
  else {
    const c = cleanHtml(got.body, got.finalUrl ?? src.url);
    ({ title, parked, challenge } = c);
    lines = [...c.lines, ...c.events.map((e) => [e.name, e.start.slice(0, 10), e.status ?? '', e.place].filter(Boolean).join(' · '))];
  }
  lines = withoutNoise(lines, src.ignore_lines ?? [], today);
  if (challenge) return { ...result, outcome: 'blocked', got: { ...got, note: 'challenge page' } };
  if (parked) return { ...result, outcome: 'parked' };
  if (lines.join(' ').length < 100) return { ...result, outcome: 'empty' };

  result.lines = lines;
  result.title = title;
  result.hash = hashLines(lines);
  result.unchanged = result.hash === src.text_hash && !!snapshot;
  if (result.unchanged) result.outcome = 'unchanged';
  return result;
}

/* ---------------------------------------------------------------------------
 * run
 * ------------------------------------------------------------------------- */

const results = await politely(sources, async (src) => {
  try { return await read(src); } catch (error) { return { src, outcome: 'unreachable', got: { note: String(error.message ?? error).slice(0, 120) } }; }
});
await closeBrowser();

const stamps = new Map();   // occurrence id → {date, url, market}
const questions = [];
const notes = [];           // source_broken findings
const pages = [];           // watch_pages rows
let qn = 0;

for (const r of results) {
  const { src } = r;
  const prevDates = Array.isArray(src.prev_dates) ? src.prev_dates : [];
  const bad = ['unreachable', 'not_found', 'blocked', 'parked', 'empty', 'robots', 'unsupported'].includes(r.outcome);
  const row = {
    source_id: src.id, outcome: r.outcome, http_status: r.got?.status ?? null, final_url: r.got?.finalUrl ?? null,
    renderer: r.got?.renderer ?? null, etag: r.got?.etag ?? null, last_modified: r.got?.lastModified ?? null,
    text_hash: r.hash ?? src.text_hash ?? null, dates: prevDates, seen: src.seen ?? [], fail_streak: bad ? (src.fail_streak ?? 0) + 1 : 0,
    changed: false, note: r.got?.note ?? null,
  };
  pages.push(row);
  if (!r.lines) {
    if (bad && row.fail_streak >= 3) for (const id of covered.get(src.id) ?? []) notes.push({ market: id, src, why: `${r.outcome}${row.note ? ` (${row.note})` : ''}, ${row.fail_streak} runs in a row` });
    continue;
  }

  const extracted = extractDates(r.lines, { today });
  const seen = new Set(src.seen ?? []);
  const firstRead = !src.fetched_at;
  const ids = r.lines.map(lineId);
  const watched = new Set([...extracted.dates.map((d) => d.line), ...r.lines.map((l, i) => (CANCEL_RE.test(normalise(l)) ? i : -1)).filter((i) => i >= 0)]);
  const newLines = new Set([...watched].filter((i) => !seen.has(ids[i])));
  for (const i of watched) seen.add(ids[i]);
  row.seen = [...seen].slice(-SEEN_CAP);
  row.dates = extracted.dates.map((d) => ({ iso: d.iso, line: d.line, assumed: d.assumed, off: d.off }));
  row.changed = !r.unchanged;
  if (!DRY && !r.unchanged) {
    mkdirSync(SNAPSHOTS, { recursive: true });
    writeFileSync(snapshotFile(src.id), r.lines.join('\n'));
  }

  const marketsHere = (covered.get(src.id) ?? []).map((id) => markets.get(id)).filter(Boolean);
  for (const m of marketsHere) {
    const d = decide({ lines: r.lines, title: r.title ?? '', today, ...extracted, newLines, firstRead, marketsCovered: marketsHere.length }, m);
    for (const iso of d.stamp) {
      const occ = m.dates.find((o) => o.date === iso);
      if (occ && !stamps.has(occ.id)) stamps.set(occ.id, { date: iso, url: r.got?.finalUrl ?? src.url, market: m, status: occ.status });
    }
    // A page that stopped naming the market and its dates, two runs running, is broken — not "cancelled".
    if (!d.named && d.relevantDates === 0 && prevDates.length > 0) {
      row.fail_streak = (src.fail_streak ?? 0) + 1;
      if (row.fail_streak >= 2) notes.push({ market: m.id, src, why: 'the page no longer names the market or shows any date' });
    }
    if (r.unchanged) continue; // an unchanged page raises no new questions
    for (const q of d.questions) {
      if (q.kind === 'new_date' && firstRead && marketsHere.length > 1) continue;
      // Already asked (earlier run, or another page of the same organiser this run): only the dates not yet asked about.
      q.dates = q.dates.filter((d) => !askedDates.has(`${m.id}|${q.kind}|${d}`));
      if (!q.dates.length || asked.has(`${m.id}|${q.kind}|${[...q.dates].sort().join(',')}`)) continue;
      for (const d of q.dates) askedDates.add(`${m.id}|${q.kind}|${d}`);
      const snippet = snippetFor(r.lines, q.lines);
      const snippetLines = new Set(q.lines.flatMap((i) => [i - 3, i - 2, i - 1, i, i + 1, i + 2, i + 3]));
      questions.push({
        ...q, id: `Q${++qn}`, market: { id: m.id, name: m.name, venue: m.venue, town: m.town }, src, url: r.got?.finalUrl ?? src.url,
        ours: new Set(m.dates.filter((o) => o.status !== 'cancelled').map((o) => o.date)),
        snippet, snippetDates: new Set(extracted.dates.filter((x) => snippetLines.has(x.line)).map((x) => x.iso)),
      });
    }
  }
}

const counts = pages.reduce((c, p) => ({ ...c, [p.outcome]: (c[p.outcome] ?? 0) + 1 }), {});
say(`Pages: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')}`);
say(`Stamps: ${stamps.size} date(s) shown on their page exactly as we have them.`);
say(`Questions: ${questions.length}${NO_AI ? ' (not asked: ' + (DRY ? 'dry run' : '--no-ai') + ')' : ''}`);
for (const q of questions) say(`  ${q.id} ${q.market.name}: ${q.kind} ${q.dates.join(', ')} — ${q.hint}\n     ${q.url}`);
for (const n of notes) say(`  ! ${markets.get(n.market)?.name}: ${n.why} — ${n.src.url}`);

if (DRY) {
  for (const p of pages.filter((x) => x.note || ['blocked', 'unreachable', 'not_found', 'robots', 'parked', 'empty'].includes(x.outcome))) {
    say(`  · ${p.outcome}${p.http_status ? ` ${p.http_status}` : ''}: ${sources.find((s) => s.id === p.source_id)?.url}${p.note ? ` — ${p.note}` : ''}`);
  }
  process.exit(0);
}

/* ---------------------------------------------------------------------------
 * ask, then write
 * ------------------------------------------------------------------------- */

const env = { ...process.env, ...(secret('CLAUDE_CODE_OAUTH_TOKEN') ? { CLAUDE_CODE_OAUTH_TOKEN: secret('CLAUDE_CODE_OAUTH_TOKEN') } : {}) };
const answer = NO_AI ? { findings: [], ai: questions.length ? 'no_login' : 'not_needed', errors: [] } : await askAll(questions, { today, env });
say(`AI: ${answer.ai}; ${answer.findings.length} finding(s)${answer.errors.length ? `; errors: ${answer.errors.map((e) => e.why).join(' | ')}` : ''}`);

const signing = secret('ADMIN_SIGNING_SECRET')?.trim();
const sign = (id, verb) => createHmac('sha256', signing).update(`${id}|${verb}`).digest('hex');

const decisions = [];
const runId = await withClient(DB_URL, async (c) => {
  await c.query('begin');
  const { rows: [run] } = await c.query(
    `insert into public.watch_runs (slice, sources_planned, fetched, not_modified, unchanged, stamped, questions, findings, ai, errors)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id`,
    [null, sources.length, counts.read ?? 0, counts.not_modified ?? 0, counts.unchanged ?? 0,
      stamps.size, questions.length, answer.findings.length + notes.length, answer.ai, JSON.stringify(answer.errors)]);

  for (const p of pages) {
    await c.query(
      `insert into public.watch_pages (source_id, fetched_at, outcome, http_status, final_url, renderer, etag, last_modified, text_hash, dates, seen, fail_streak, changed_at)
       values ($1, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, case when $12 then now() end)
       on conflict (source_id) do update set fetched_at = now(), outcome = excluded.outcome, http_status = excluded.http_status,
         final_url = excluded.final_url, renderer = excluded.renderer,
         etag = coalesce(excluded.etag, case when excluded.outcome = 'not_modified' then watch_pages.etag end),
         last_modified = coalesce(excluded.last_modified, case when excluded.outcome = 'not_modified' then watch_pages.last_modified end),
         text_hash = excluded.text_hash, dates = excluded.dates, seen = excluded.seen, fail_streak = excluded.fail_streak,
         changed_at = coalesce(excluded.changed_at, watch_pages.changed_at)`,
      [p.source_id, p.outcome, p.http_status, p.final_url, p.renderer, p.etag, p.last_modified, p.text_hash,
        JSON.stringify(p.dates), p.seen, p.fail_streak, p.changed]);
  }

  // The stamp, exactly as confirm.mjs writes it — and a not-yet-confirmed date the organiser now lists is confirmed.
  for (const [id, s] of stamps) {
    await c.query(`update public.occurrences set confirmed_at = now(), status = case when status = 'unverified' then 'confirmed' else status end where id = $1`, [id]);
    await c.query(
      `insert into public.facts (entity_type, entity_id, field, value, source_type, source_ref, observed_at, confidence)
       values ('occurrence', $1, 'date', to_jsonb($2::text), 'website_crawl', $3, now(), 'confirmed')`, [id, s.date, s.url]);
  }

  const insertFinding = async (f) => {
    const { rows } = await c.query(
      `insert into public.watch_findings (run_id, market_id, source_id, kind, dates, start_time, end_time, quote, summary, url, verified)
       values ($1, $2, $3, $4, $5::date[], $6, $7, $8, $9, $10, $11)
       on conflict (market_id, kind, dates) where status = 'open' do nothing returning id`,
      [run.id, f.market, f.source, f.kind, f.dates, f.start ?? null, f.end ?? null, f.quote ?? null, f.summary, f.url, f.verified ?? false]);
    return rows[0]?.id ?? null;
  };
  for (const f of answer.findings) {
    const id = await insertFinding({ market: f.q.market.id, source: f.q.src.id, kind: f.kind, dates: f.dates, start: f.start, end: f.end, quote: f.quote, summary: f.summary, url: f.q.url, verified: f.verified });
    if (!id) continue;
    let approve = null, dismiss = null;
    if (signing) {
      const { rows: [a] } = await c.query(`insert into public.admin_actions (kind, payload) values ('watch', $1) returning id`, [{ finding_id: id }]);
      await c.query(`update public.watch_findings set admin_action_id = $1 where id = $2`, [a.id, id]);
      approve = `${SITE}/adm/${a.id}/approve?s=${sign(a.id, 'approve')}`;
      dismiss = `${SITE}/adm/${a.id}/reject?s=${sign(a.id, 'reject')}`;
    }
    decisions.push({ f, approve, dismiss });
  }
  for (const n of notes) {
    await insertFinding({ market: n.market, source: n.src.id, kind: 'source_broken', dates: [], summary: n.why, url: n.src.url, verified: true });
  }

  // The message Delfim gets — written here, sent by the site, which holds the Telegram key.
  const lines = [`Market Watch · ${short(today)}`,
    `${pages.length} page(s) read · ${stamps.size} date(s) re-confirmed · ${decisions.length} to decide${notes.length ? ` · ${notes.length} page(s) broken` : ''}`];
  if (answer.ai === 'no_login' && questions.length) lines.push(`⚠ ${questions.length} question(s) waiting: the AI login is missing or expired. On the PC, run: claude setup-token`);
  decisions.forEach(({ f, approve, dismiss }, i) => {
    const what = { new_date: 'new date', cancelled: 'cancelled', missing: 'date not on the page', hours: `hours ${f.start}–${f.end}` }[f.kind];
    lines.push([
      `${i + 1}. ${f.q.market.name} (${f.q.market.town}) — ${what}: ${f.dates.map(short).join(', ')}`,
      f.summary,
      f.quote ? `“${f.quote.slice(0, 220)}” ${f.verified ? '(quote checked)' : '(NOT verified — read the page)'}` : '(no quote)',
      f.q.url,
      approve ? `✅ Approve: ${approve}` : '(no signing secret — decide by hand)',
      dismiss ? `❌ Dismiss: ${dismiss}` : '',
    ].filter(Boolean).join('\n'));
  });
  for (const n of notes) lines.push(`! ${markets.get(n.market)?.name}: ${n.why}\n${n.src.url}`);
  const report = lines.join('\n\n');
  await c.query(`update public.watch_runs set report = $2, finished_at = now() where id = $1`, [run.id, report]);
  await c.query('commit');
  return run.id;
});

// One message per weekly run: the summary, and whatever waits for Delfim.
{
  if (!signing) say('No ADMIN_SIGNING_SECRET: report stored, not sent.');
  else {
    const res = await fetch(`${SITE}/adm/notify`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ run: runId, s: createHmac('sha256', signing).update(`notify|${runId}`).digest('hex') }),
    }).catch((e) => ({ ok: false, status: String(e) }));
    say(res.ok ? 'Telegram: sent.' : `Telegram: not sent (${res.status}) — the report is in watch_runs.`);
  }
}
say(`Run ${runId} written.`);
process.exit(0);
