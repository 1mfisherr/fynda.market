#!/usr/bin/env node
/**
 * Builds design/cities-v8.html — four ways to draw the Städte block.
 *
 *   node design/build-cities-v8.mjs
 *
 * Live counts. The block is currently 55 alphabetical rows of equal weight,
 * which is the wrong shape for this data:
 *
 *   32 of 55 towns have exactly 1 market
 *   13 have 2
 *   only 5 have more than 4 — Basel 28, Zürich 17, Lausanne 15, Bern 14, Luzern 7
 *
 * So "1 Markt" is printed 32 times, Basel sits sixth because B comes after A,
 * and a village with one market looks exactly as important as the biggest
 * flea-market city in the country.
 *
 * Every option below keeps all 55 links — the block is real navigation into the
 * best-earning page type, and PAGES.md keeps it deliberately. What changes is
 * the order and the weight.
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
const byCount = [...cities].sort((a, b) => b.n - a.n || a.city.localeCompare(b.city, 'de'));
const alpha = [...cities].sort((a, b) => a.city.localeCompare(b.city, 'de'));
const big = byCount.filter((c) => c.n >= 4);
const small = byCount.filter((c) => c.n < 4).sort((a, b) => a.city.localeCompare(b.city, 'de'));

const byRegion = new Map();
for (const c of cities) {
  if (!byRegion.has(c.region)) byRegion.set(c.region, []);
  byRegion.get(c.region).push(c);
}
const regions = [...byRegion.entries()]
  .map(([region, list]) => ({ region, list: list.sort((a, b) => b.n - a.n || a.city.localeCompare(b.city, 'de')),
    total: list.reduce((s, c) => s + c.n, 0) }))
  .sort((a, b) => b.total - a.total || a.region.localeCompare(b.region, 'de'));

/* The count is shown only where it says something. 32 towns have one market;
   printing "1 Markt" 32 times is the same noise as "frei" on 151 rows. */
const count = (c) => (c.n > 1 ? `<i>${c.n}</i>` : '');

const max = byCount[0].n;
const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fynda — Städte, four ways</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --accent:#FF4A2B; --ink:#111110; --grey:#6E6C68; --quiet:#9A968F;
  --line:#E8E6E2; --paper:#F5F4F2; --stage:#2A2926;
  --t-h2:clamp(21px,calc(18.8px + .59vw),27px);
  --t-name:clamp(16px,calc(14.3px + .45vw),20px);
  --t-body:clamp(13px,calc(11.6px + .37vw),16px);
  --t-small:clamp(12.5px,calc(11.2px + .35vw),15.5px);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--stage);color:#fff;padding:26px 16px 80px;overflow-wrap:break-word;
  font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
.lab{max-width:1100px;margin:0 auto}
.lab>.mk{font-size:17px;font-weight:800;letter-spacing:-.045em}
.lab>.mk span{color:var(--accent)}
.lab>h1{font-size:25px;font-weight:800;letter-spacing:-.04em;margin-top:10px;line-height:1.12}
.note{color:#B5B1A8;font-size:13.5px;line-height:1.6;margin-top:10px;max-width:680px}
.note b{color:#fff;font-weight:700}
.tally{display:flex;gap:24px;flex-wrap:wrap;margin:16px 0 6px}
.tally div{color:#B5B1A8;font-size:12px;line-height:1.35}
.tally b{display:block;color:#fff;font-size:22px;font-weight:800;letter-spacing:-.03em}
.opt{margin-top:48px;border-top:1px solid #46443F;padding-top:24px}
.opt h2{font-size:18px;font-weight:800;letter-spacing:-.03em}
.opt h2 em{font-style:normal;color:var(--accent)}
.say{color:#B5B1A8;font-size:13.5px;line-height:1.6;margin-top:8px;max-width:680px}
.say b{color:#fff;font-weight:700}
.panel{background:#fff;color:var(--ink);border-radius:12px;padding:22px 18px;margin-top:16px;
  box-shadow:0 16px 40px rgba(0,0,0,.32)}
a{color:inherit;text-decoration:none}
.h{font-size:var(--t-h2);font-weight:800;letter-spacing:-.03em}
.lede{color:var(--grey);font-size:var(--t-body);margin-top:4px;margin-bottom:16px}

/* ---- shared pieces ---- */
.pills{display:flex;flex-wrap:wrap;gap:8px}
.pill{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 15px;border-radius:99px;
  border:1px solid var(--line);font-size:var(--t-small);font-weight:700}
.pill i{font-style:normal;color:var(--quiet);font-weight:600;font-size:12px}

/* A — a few big, the rest quiet */
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:18px}
.tile{border:1px solid var(--line);border-radius:14px;padding:14px}
.tile b{display:block;font-size:var(--t-name);font-weight:800;letter-spacing:-.02em}
.tile span{display:block;margin-top:2px;color:var(--accent);font-size:var(--t-small);font-weight:800}
.rest-h{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--quiet);margin:0 0 10px}

/* B — by canton */
.grp{margin-bottom:18px}
.grp h4{font-size:var(--t-small);font-weight:800;letter-spacing:.06em;text-transform:uppercase;
  padding-bottom:6px;margin-bottom:9px;border-bottom:1px solid var(--ink)}
.grp h4 span{float:right;color:var(--quiet);font-weight:600;letter-spacing:0;text-transform:none}
@media(min-width:760px){.cols{columns:2;column-gap:32px}.grp{break-inside:avoid}}

/* C — weighted */
.cloud{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:baseline}
.w{font-weight:700;letter-spacing:-.02em;line-height:1.25}
.w i{font-style:normal;color:var(--quiet);font-size:.7em;font-weight:600;margin-left:4px}

/* D — ranked with a bar */
.rank{display:grid;gap:0}
@media(min-width:760px){.rank{grid-template-columns:1fr 1fr;column-gap:34px}}
.rrow{display:grid;grid-template-columns:minmax(0,1fr) 64px 34px;gap:10px;align-items:center;
  padding:9px 0;border-bottom:1px solid var(--line);font-size:var(--t-small)}
.rrow b{font-weight:700}
.bar{height:6px;border-radius:99px;background:var(--paper);overflow:hidden}
.bar span{display:block;height:100%;background:var(--accent);border-radius:99px}
.rrow em{font-style:normal;color:var(--quiet);font-weight:600;text-align:right}

/* now */
.old li{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);
  font-size:var(--t-small);font-weight:700;list-style:none}
.old li span{color:var(--grey)}
</style>

<div class="lab">
  <div class="mk">fynda<span>.</span></div>
  <h1>Städte — four ways</h1>
  <p class="note">Live counts. The block is 55 rows in alphabetical order, every one the same weight. That is the wrong shape for this data:</p>
  <div class="tally">
    <div><b>32 of 55</b>towns have exactly<br>one market</div>
    <div><b>45 of 55</b>have two or fewer</div>
    <div><b>5</b>towns hold<br>more than four</div>
    <div><b>Basel 28</b>sits sixth in the list,<br>because B comes after A</div>
  </div>
  <p class="note"><b>Every option keeps all 55 links</b> — the block is real navigation into the best-earning page type. What changes is the order and the weight. And all four drop “1 Markt”, which is printed 32 times today and is the same noise as “frei” on 151 rows.</p>

<div class="opt">
  <h2><em>Now.</em> Alphabetical, all equal</h2>
  <div class="panel">
    <div class="h">Städte</div>
    <p class="lede">Orte mit mindestens einem bekannten Markt.</p>
    <ul class="old">${alpha.slice(0, 10).map((c) => `<li>${esc(c.city)}<span>${c.n} ${c.n === 1 ? 'Markt' : 'Märkte'}</span></li>`).join('')}
      <li style="border:0;color:var(--quiet);font-weight:600">… und 45 weitere</li></ul>
  </div>
</div>

<div class="opt">
  <h2><em>A.</em> Five big, fifty quiet</h2>
  <p class="say">The towns with four or more get a tile and their count in the accent; the other ${small.length} become pills, alphabetical. <b>Matches the data — five towns really do hold most of the country.</b> Shortest of the four on a phone, and the biggest cities stop hiding behind the alphabet.<br><b>Weak spot:</b> a hard line at four is arbitrary, and a town just under it looks demoted.</p>
  <div class="panel">
    <div class="h">Städte</div>
    <p class="lede">${cities.length} Orte mit mindestens einem bekannten Markt.</p>
    <div class="tiles">${big.map((c) => `<a class="tile" href="#"><b>${esc(c.city)}</b><span>${c.n} Märkte</span></a>`).join('')}</div>
    <p class="rest-h">Auch mit Markt</p>
    <div class="pills">${small.map((c) => `<a class="pill" href="#">${esc(c.city)}${count(c)}</a>`).join('')}</div>
  </div>
</div>

<div class="opt">
  <h2><em>B.</em> By canton</h2>
  <p class="say">Fourteen groups, biggest first, towns inside each ordered by size. <b>The only option that adds information rather than rearranging it</b> — it tells a visitor where a town they do not know actually is, and it mirrors the canton pages directly below.<br><b>Weak spot:</b> fourteen headings for 55 towns is a lot of furniture, and six cantons hold only one or two towns.</p>
  <div class="panel">
    <div class="h">Städte</div>
    <p class="lede">${cities.length} Orte in ${regions.length} Kantonen.</p>
    <div class="cols">${regions.map((r) => `
      <div class="grp">
        <h4>${esc(r.region)}<span>${r.total} Märkte</span></h4>
        <div class="pills">${r.list.map((c) => `<a class="pill" href="#">${esc(c.city)}${count(c)}</a>`).join('')}</div>
      </div>`).join('')}</div>
  </div>
</div>

<div class="opt">
  <h2><em>C.</em> Weighted — size is the count</h2>
  <p class="say">All ${cities.length} in one block, alphabetical, with the type size carrying the number. <b>Densest and most alive</b>: Basel is visibly the biggest thing on the page without a single label, and the whole country fits in about one screen.<br><b>Weak spot:</b> it is a tag cloud, and tag clouds read as decorative. The smallest towns get quite small.</p>
  <div class="panel">
    <div class="h">Städte</div>
    <p class="lede">${cities.length} Orte. Je grösser, desto mehr Märkte.</p>
    <div class="cloud">${alpha.map((c) => {
      const size = 14 + Math.round((Math.sqrt(c.n) / Math.sqrt(max)) * 16);
      const weight = c.n >= 4 ? 800 : 600;
      const colour = c.n >= 4 ? 'var(--ink)' : 'var(--grey)';
      return `<a class="w" href="#" style="font-size:${size}px;font-weight:${weight};color:${colour}">${esc(c.city)}${c.n > 1 ? `<i>${c.n}</i>` : ''}</a>`;
    }).join('')}</div>
  </div>
</div>

<div class="opt">
  <h2><em>D.</em> Ranked, with a bar</h2>
  <p class="say">Sorted by size, two columns, a bar for the shape. <b>The most honest ranking</b> — you can see at a glance that this is a five-city country — and it stays a list, which is what the block is.<br><b>Weak spot:</b> the bar is nearly invisible for the 45 towns with one or two, so most of the block is empty bars. Alphabetical lookup is gone.</p>
  <div class="panel">
    <div class="h">Städte</div>
    <p class="lede">${cities.length} Orte, nach Anzahl Märkte.</p>
    <div class="rank">${byCount.slice(0, 24).map((c) => `
      <a class="rrow" href="#"><b>${esc(c.city)}</b><span class="bar"><span style="width:${Math.max(4, (c.n / max) * 100)}%"></span></span><em>${c.n}</em></a>`).join('')}
    </div>
    <p class="rest-h" style="margin-top:14px">Und ${cities.length - 24} weitere</p>
    <div class="pills">${byCount.slice(24).sort((a, b) => a.city.localeCompare(b.city, 'de')).map((c) => `<a class="pill" href="#">${esc(c.city)}</a>`).join('')}</div>
  </div>
</div>

<div class="opt">
  <h2>If you want my pick</h2>
  <p class="say"><b>A, and B if the canton pages matter to you.</b><br><br>A is the one that matches the data: five towns hold most of the country, and it says so in one glance without any new ideas on the page. It is also the shortest on a phone.<br><br>B is the only one that <i>adds</i> something — where a town is — and it feeds the canton block directly below it, which is otherwise a second list of Swiss place names with nothing to say which is which. If the German launch is going to lean on Bundesland pages, B is the pattern you want to have already built.<br><br>C is the prettiest and I would not ship it: a tag cloud says "we could not decide what matters". D is honest and boring, and forty-five empty bars is a bad look for a country with real coverage.</p>
</div>
</div>
`;

writeFileSync(join(root, 'design/cities-v8.html'), html);
console.log(`  ${cities.length} towns · ${big.length} with 4+ · ${regions.length} cantons`);
process.exit(0);
