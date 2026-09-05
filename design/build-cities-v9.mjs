#!/usr/bin/env node
/**
 * Builds design/cities-v9.html — five ways to make the Städte block visual.
 *
 *   node design/build-cities-v9.mjs
 *
 * Follow-up to v8, where A (a few big, the rest quiet) and C (weighted by
 * count) were both liked. These push C's idea further, and every one is drawn
 * twice: in a real 390px phone column and at full width, because "will this be
 * weird on mobile" is the question and it deserves a measurement.
 *
 * The data is the reason any of this works: 32 of 55 towns have one market,
 * 45 have two or fewer, and Basel alone has 28. That is a shape, and a block
 * that ignores it is 55 identical rows.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../scripts/db.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const cities = await query(`
  select tc.value as city, sc.slug, tr.value as region, count(*)::int n
    from publishable_markets p
    join texts tc on tc.entity_type='city' and tc.entity_id=p.city_id and tc.locale='de' and tc.field='name'
    join slugs sc on sc.entity_type='city' and sc.entity_id=p.city_id and sc.locale='de' and sc.is_current
    join texts tr on tr.entity_type='region' and tr.entity_id=p.region_id and tr.locale='de' and tr.field='name'
   group by 1,2,3 order by 4 desc, 1`);

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const alpha = [...cities].sort((a, b) => a.city.localeCompare(b.city, 'de'));
const byCount = [...cities].sort((a, b) => b.n - a.n || a.city.localeCompare(b.city, 'de'));
const max = byCount[0].n;

/** Four steps, not fifty-five. A scale a reader can actually decode. */
const step = (n) => (n >= 10 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
const num = (c) => (c.n > 1 ? `<i>${c.n}</i>` : '');

/* ---------- C1 · the cloud, tightened ---------- */
const c1 = (list) => `<div class="cloud">${list.map((c) => `
  <a class="w s${step(c.n)}" href="#">${esc(c.city)}${num(c)}</a>`).join('')}</div>`;

/* ---------- C2 · weight and colour, one size ---------- */
const c2 = (list) => `<div class="cloud flat">${list.map((c) => `
  <a class="w f${step(c.n)}" href="#">${esc(c.city)}${num(c)}</a>`).join('')}</div>`;

/* ---------- C3 · a pill that fills up ---------- */
const c3 = (list) => `<div class="pills">${list.map((c) => `
  <a class="fill" href="#" style="--p:${Math.max(6, Math.round((c.n / max) * 100))}%">
    <span class="ink">${esc(c.city)}${num(c)}</span></a>`).join('')}</div>`;

/* ---------- C4 · a tinted tile grid ---------- */
const c4 = (list) => `<div class="grid">${list.map((c) => `
  <a class="cell t${step(c.n)}" href="#"><b>${esc(c.city)}</b>${c.n > 1 ? `<em>${c.n}</em>` : ''}</a>`).join('')}</div>`;

/* ---------- C5 · a dot carries the number ---------- */
const c5 = (list) => `<div class="pills">${list.map((c) => `
  <a class="dotted" href="#"><i class="dot" style="--d:${6 + Math.round((Math.sqrt(c.n) / Math.sqrt(max)) * 14)}px"></i>${esc(c.city)}${num(c)}</a>`).join('')}</div>`;

const block = (inner, lede) => `
  <div class="h">Städte</div>
  <p class="lede">${lede}</p>
  ${inner}`;

const OPTIONS = [
  ['C1', 'The cloud, tightened',
   'Four sizes instead of fifty-five, so the scale can actually be read, and the small end stops at 15px rather than shrinking away. <b>Same idea as C, disciplined.</b><br><b>On a phone:</b> fine — ragged, but ragged in a way that reads as designed rather than broken.',
   (l) => c1(l), '55 Orte. Je grösser, desto mehr Märkte.'],
  ['C2', 'Weight and colour, one size',
   'Every town the same size; <b>only weight and colour carry the number</b>. Black and bold is a big town, grey and light is a small one.<br><b>On a phone: the safest of all five.</b> One size means one clean line rhythm at any width — and it still ranks at a glance.',
   (l) => c2(l), '55 Orte. Je dunkler, desto mehr Märkte.'],
  ['C3', 'A pill that fills up',
   'Every town the same pill; the accent <b>fills it in proportion to its markets</b>. Basel is full, a one-market town is a sliver. A bar chart that does not look like a bar chart.<br><b>On a phone:</b> good — pills wrap naturally and the fill reads at any size.',
   (l) => c3(l), '55 Orte. Je voller, desto mehr Märkte.'],
  ['C4', 'A tinted grid',
   'Fifty-five tiles, tinted by count. <b>The most map-like without being a map</b>, and the most compact of the five.<br><b>On a phone:</b> two columns, and it is the densest option — the whole country in about a screen and a half.',
   (l) => c4(l), '55 Orte. Je kräftiger, desto mehr Märkte.'],
  ['C5', 'A dot carries the number',
   'Type stays one size and calm; <b>a dot in the accent does the counting</b>. The quietest way to be visual, and the closest to the existing brand — the accent already means date and status, and here it means quantity.<br><b>On a phone:</b> fine, same as any pill row.',
   (l) => c5(l), '55 Orte. Je grösser der Punkt, desto mehr Märkte.'],
];

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fynda — Städte, visual variants</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --accent:#FF4A2B; --ink:#111110; --grey:#6E6C68; --quiet:#9A968F;
  --line:#E8E6E2; --paper:#F5F4F2; --stage:#2A2926;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--stage);color:#fff;padding:26px 16px 90px;overflow-wrap:break-word;
  font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
.lab{max-width:1180px;margin:0 auto}
.lab>.mk{font-size:17px;font-weight:800;letter-spacing:-.045em}
.lab>.mk span{color:var(--accent)}
.lab>h1{font-size:25px;font-weight:800;letter-spacing:-.04em;margin-top:10px;line-height:1.12}
.note{color:#B5B1A8;font-size:13.5px;line-height:1.6;margin-top:10px;max-width:700px}
.note b{color:#fff;font-weight:700}
.opt{margin-top:52px;border-top:1px solid #46443F;padding-top:24px}
.opt h2{font-size:18px;font-weight:800;letter-spacing:-.03em}
.opt h2 em{font-style:normal;color:var(--accent)}
.say{color:#B5B1A8;font-size:13.5px;line-height:1.6;margin-top:8px;max-width:700px}
.say b{color:#fff;font-weight:700}
.pair{display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;margin-top:18px}
.cap{color:#8A867E;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:7px}
.panel{background:#fff;color:var(--ink);border-radius:12px;padding:20px 16px;box-shadow:0 16px 40px rgba(0,0,0,.32)}
.phone{width:390px;flex:none}
.wide{flex:1;min-width:420px}
a{color:inherit;text-decoration:none}
.h{font-size:21px;font-weight:800;letter-spacing:-.03em}
.lede{color:var(--grey);font-size:13px;margin:4px 0 16px}

/* ---- C1 · four sizes ---- */
.cloud{display:flex;flex-wrap:wrap;gap:9px 12px;align-items:baseline}
.w{letter-spacing:-.02em;line-height:1.3}
.w i{font-style:normal;color:var(--quiet);font-size:.68em;font-weight:600;margin-left:4px}
.s0{font-size:15px;font-weight:600;color:var(--grey)}
.s1{font-size:17px;font-weight:700;color:var(--ink)}
.s2{font-size:22px;font-weight:800;color:var(--ink)}
.s3{font-size:30px;font-weight:800;color:var(--ink)}

/* ---- C2 · one size, weight and colour ---- */
.flat .w{font-size:16px}
.f0{font-weight:400;color:var(--quiet)}
.f1{font-weight:600;color:var(--grey)}
.f2{font-weight:700;color:var(--ink)}
.f3{font-weight:800;color:var(--ink)}
.flat .f3 i{color:var(--accent)}

/* ---- shared pills ---- */
.pills{display:flex;flex-wrap:wrap;gap:8px}

/* ---- C3 · a pill that fills ---- */
.fill{position:relative;display:inline-flex;align-items:center;min-height:38px;padding:0 14px;
  border:1px solid var(--line);border-radius:99px;overflow:hidden;font-size:13.5px;font-weight:700}
.fill::before{content:'';position:absolute;inset:0 auto 0 0;width:var(--p);background:var(--accent);opacity:.16}
.fill .ink{position:relative}
.fill i{font-style:normal;color:var(--grey);font-weight:600;font-size:12px;margin-left:6px}

/* ---- C4 · tinted grid ---- */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:7px}
.cell{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:46px;padding:0 12px;
  border-radius:10px;font-size:13.5px;font-weight:700;background:var(--paper);color:var(--ink)}
.cell em{font-style:normal;font-weight:800;font-size:12px;opacity:.65}
.t0{background:#F6F5F3;color:var(--grey);font-weight:600}
.t1{background:#FBE3DC}
.t2{background:#FCC3B4}
.t3{background:var(--accent);color:#fff}
.t3 em{opacity:.85}

/* ---- C5 · a dot ---- */
.dotted{display:inline-flex;align-items:center;gap:8px;min-height:38px;padding:0 14px;
  border:1px solid var(--line);border-radius:99px;font-size:13.5px;font-weight:700}
.dot{width:var(--d);height:var(--d);border-radius:99px;background:var(--accent);flex:none}
.dotted i{font-style:normal;color:var(--quiet);font-weight:600;font-size:12px}
</style>

<div class="lab">
  <div class="mk">fynda<span>.</span></div>
  <h1>Städte — pushing C further</h1>
  <p class="note">You liked A for being clean and C for being interesting. These are five ways to keep C's idea — <b>the block itself shows the shape of the country</b> — without it becoming a tag cloud.</p>
  <p class="note"><b>On your mobile question: you were right to ask.</b> The original C ranged 14px to 30px across 55 items, and on a 390px column that is ragged. Every option here is drawn in a real 390px phone column beside the wide one, so you can see it rather than take my word. <b>C2 and C4 are the two that get better on a phone, not worse.</b></p>
  <p class="note">All five keep every one of the 55 links, and all five drop “1 Markt”, which the live page prints 32 times.</p>

${OPTIONS.map(([id, title, say, render, lede]) => `
<div class="opt">
  <h2><em>${id}.</em> ${title}</h2>
  <p class="say">${say}</p>
  <div class="pair">
    <div><div class="cap">Phone · 390px</div><div class="panel phone">${block(render(alpha), lede)}</div></div>
    <div class="wide"><div class="cap">Wide</div><div class="panel">${block(render(alpha), lede)}</div></div>
  </div>
</div>`).join('')}

<div class="opt">
  <h2>If you want my pick</h2>
  <p class="say"><b>C4, the tinted grid.</b> It is the only one where the phone version is the <i>better</i> one — two columns of tiles, the whole country in about a screen and a half, and the colour does the ranking without a single number needing to be read. It is also the closest thing to a map you can build without building a map.<br><br><b>C2 is the safe pick</b> and I would be happy shipping it: one size means one clean rhythm at any width, and weight alone ranks perfectly well.<br><br>C1 is the honest version of what you liked, and it is fine. C3 and C5 are clever and I would not ship either — a half-filled pill and a scaled dot both need a legend to decode, and a block of place names should not need a legend.<br><br><b>One caution on C4.</b> It puts a lot of accent on the page, and BRAND.md says the accent marks the date and whether a market is happening — nothing else. Tinting towns by count is a real extension of that rule, not a free choice. If you like C4, that line in the brand doc changes with it.</p>
</div>
</div>
`;

writeFileSync(join(root, 'design/cities-v9.html'), html);
console.log(`  ${cities.length} towns, five variants, phone + wide each`);
process.exit(0);
