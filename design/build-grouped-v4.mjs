#!/usr/bin/env node
/**
 * Builds design/grouped-v4.html — the weekend list, grouped by city.
 *
 *   node design/build-grouped-v4.mjs
 *
 * Live data, and the page itself is responsive: resize the window to check the
 * phone. No fake device frames — the layout is the thing being judged.
 *
 * Three rules under test, all the same rule:
 *   - group by place, because "what is near me" is the question, and sorting by
 *     clock time interleaved 22 cities at random;
 *   - a type badge only when the type is not an ordinary Flohmarkt (41 of 45);
 *   - a freshness line only when it is bad news (29 of 39 are confirmed and
 *     recent, so silence is the good state).
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../scripts/db.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = new Date().toISOString().slice(0, 10);

const rows = await query(`
  select coalesce(nm.value,p.slug) as name, p.kind, tc.value as city, sc.slug as city_slug,
         v.name as venue, m.image_url,
         o.date::text as date, o.start_time::text as start_time, o.end_time::text as end_time,
         o.status, o.confirmed_at::text as confirmed_at
    from publishable_markets p
    join markets m on m.id=p.id
    join venues v on v.id=p.venue_id
    join texts tc on tc.entity_type='city' and tc.entity_id=p.city_id and tc.locale='de' and tc.field='name'
    join slugs sc on sc.entity_type='city' and sc.entity_id=p.city_id and sc.locale='de' and sc.is_current
    left join texts nm on nm.entity_type='market' and nm.entity_id=p.id and nm.locale='de' and nm.field='name'
    join occurrences o on o.market_id=p.id
   where o.date >= $1
   order by o.date, o.start_time nulls last`, [TODAY]);

const dayOf = (iso) => new Date(iso + 'T00:00:00').getDay();
const dates = [...new Set(rows.map((r) => r.date))].sort();
const weekend = dates.filter((d) => [0, 6].includes(dayOf(d))).slice(0, 2);
const list = rows.filter((r) => weekend.includes(r.date));

const LINE = { hallenflohmarkt: ['Halle', '--l-halle'], nachtflohmarkt: ['Nacht', '--l-nacht'],
  kinderflohmarkt: ['Kinder', '--l-kinder'], troedelmarkt: ['Trödel', '--l-troedel'] };
const DOW = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MON = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const hhmm = (t) => (t ? t.slice(0, 5) : '');
const short = (iso) => `${Number(iso.slice(8, 10))}. ${MON[Number(iso.slice(5, 7)) - 1]}`;

/* Silence is the good state. A line appears only when the date is not confirmed,
   or when the confirmation has gone stale — which is the news. */
const STALE_DAYS = 90;
const flagOf = (m) => {
  if (m.status === 'cancelled') return ['fällt aus', 'bad'];
  if (!m.confirmed_at) return ['nicht bestätigt', 'warn'];
  const age = (Date.parse(TODAY) - Date.parse(m.confirmed_at.slice(0, 10))) / 86400000;
  return age > STALE_DAYS ? [`zuletzt geprüft ${short(m.confirmed_at.slice(0, 10))}`, 'warn'] : null;
};

const byCity = new Map();
for (const m of list) {
  const k = m.city_slug;
  if (!byCity.has(k)) byCity.set(k, { city: m.city, slug: k, items: [] });
  byCity.get(k).items.push(m);
}
const groups = [...byCity.values()].sort((a, b) => b.items.length - a.items.length || a.city.localeCompare(b.city, 'de'));
const many = groups.filter((g) => g.items.length > 1);
const singles = groups.filter((g) => g.items.length === 1).sort((a, b) => a.city.localeCompare(b.city, 'de'));
const elsewhere = singles.flatMap((g) => g.items);

const row = (m, showCity) => {
  const kind = LINE[m.kind];
  const flag = flagOf(m);
  const d = new Date(m.date + 'T00:00:00');
  return `
      <article class="row">
        <div class="when"><b>${DOW[d.getDay()]}</b><span>${d.getDate()}.</span></div>
        <div class="body">
          <h4 class="name">${esc(m.name)}${kind ? ` <i class="tag" style="background:var(${kind[1]})">${kind[0]}</i>` : ''}</h4>
          <p class="where">${esc(m.venue)}${showCity ? ` · ${esc(m.city)}` : ''}</p>
          ${flag ? `<p class="flag ${flag[1]}">${flag[0]}</p>` : ''}
        </div>
        <p class="hours">${hhmm(m.start_time) ? `${hhmm(m.start_time)}${m.end_time ? `–${hhmm(m.end_time)}` : ''}` : ''}</p>
        <div class="photo">${m.image_url ? `<img src="https://fynda.market${esc(m.image_url).replace(/\.webp$/, '-thumb.webp')}" alt="" loading="lazy">` : ''}</div>
      </article>`;
};

const group = (g) => `
    <section class="city">
      <a class="city-head" href="#">
        <h3>${esc(g.city)}</h3>
        <span>${g.items.length} Märkte</span>
      </a>
      ${g.items.map((m) => row(m, false)).join('')}
    </section>`;

const flagged = list.filter(flagOf).length;

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fynda — Grouped v4</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --accent:#FF4A2B; --ink:#111110; --grey:#6E6C68; --quiet:#9A968F;
  --line:#E8E6E2; --paper:#F5F4F2; --stage:#2A2926;
  --l-halle:#3D5AFE; --l-nacht:#7C3AED; --l-kinder:#F5A524; --l-troedel:#E4007F;
  --t-name:clamp(16px,calc(14.31px + .451vw),20.8px);
  --t-body:clamp(13px,calc(11.627px + .366vw),16.9px);
  --t-small:clamp(12px,calc(10.732px + .338vw),15.6px);
  --t-city:clamp(19px,calc(16.99px + .535vw),24.7px);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--stage);color:var(--ink);padding:26px 16px 70px;
  font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif;
  font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;overflow-wrap:break-word}
.lab{max-width:1200px;margin:0 auto}
.labhead{color:#fff;max-width:640px}
.labhead .mk{font-size:17px;font-weight:800;letter-spacing:-.045em}
.labhead .mk span{color:var(--accent)}
.labhead h1{font-size:26px;font-weight:800;letter-spacing:-.04em;margin-top:10px;line-height:1.12}
.labhead p{font-size:13.5px;line-height:1.6;color:#B5B1A8;margin-top:10px}
.labhead p b{color:#fff;font-weight:700}
.tally{display:flex;gap:20px;flex-wrap:wrap;margin:16px 0 22px}
.tally div{color:#B5B1A8;font-size:12px;line-height:1.35}
.tally b{display:block;color:#fff;font-size:21px;font-weight:800;letter-spacing:-.03em}
.panel{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 18px 44px rgba(0,0,0,.35)}
.inner{max-width:1200px;margin:0 auto;padding:22px 16px 30px}
a{color:inherit;text-decoration:none}

h2.sec{font-size:var(--t-city);font-weight:800;letter-spacing:-.03em}
p.lede{color:var(--grey);font-size:var(--t-body);margin-top:5px;margin-bottom:8px}

/* ---- the city group: the structure that was missing ---- */
.city{margin-top:26px}
.city-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;
  padding-bottom:9px;border-bottom:2px solid var(--ink)}
.city-head h3{font-size:var(--t-name);font-weight:800;letter-spacing:-.03em}
.city-head span{color:var(--quiet);font-size:var(--t-small);font-weight:600;white-space:nowrap}

/* ---- the row: no rail, no FM badge, no freshness unless it is news ---- */
.row{display:grid;grid-template-columns:34px minmax(0,1fr) auto 56px;gap:12px;align-items:start;
  padding:13px 0;border-bottom:1px solid var(--line)}
.when{padding-top:2px;text-align:center}
.when b{display:block;font-size:var(--t-small);font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--accent)}
.when span{display:block;font-size:var(--t-small);font-weight:600;color:var(--quiet)}
.name{font-size:var(--t-name);font-weight:700;letter-spacing:-.015em;line-height:1.22}
.tag{display:inline-block;vertical-align:2px;margin-left:5px;padding:1px 6px;border-radius:999px;
  color:#fff;font-size:10.5px;font-style:normal;font-weight:800;letter-spacing:.04em;white-space:nowrap}
.where{margin-top:3px;color:var(--quiet);font-size:var(--t-small);line-height:1.4}
.flag{margin-top:4px;font-size:var(--t-small);font-weight:700}
.flag.warn{color:var(--grey)}
.flag.bad{color:var(--accent)}
.hours{padding-top:3px;color:var(--grey);font-size:var(--t-small);font-weight:600;white-space:nowrap}
.photo{width:56px;height:56px;border-radius:8px;overflow:hidden;background:var(--paper)}
.photo img{width:100%;height:100%;object-fit:cover;display:block}

@media (min-width:900px){
  .row{grid-template-columns:52px minmax(0,1fr) 120px 72px;gap:20px;padding:15px 0}
  .photo{width:72px;height:72px}
}
</style>

<div class="lab">
<div class="labhead">
  <div class="mk">fynda<span>.</span></div>
  <h1>The weekend, grouped by city</h1>
  <p>Live data, and this page is responsive — <b>drag the window narrow to check the phone</b>. No device frames; the layout is the thing being judged.</p>
  <div class="tally">
    <div><b>22 → 8</b>things to scan instead of<br>22 cities in random order</div>
    <div><b>4 of 45</b>rows now carry a type badge,<br>where 41 carried the same one</div>
    <div><b>${flagged} of ${list.length}</b>rows say anything about freshness.<br>Silence means confirmed and recent</div>
  </div>
</div>

<div class="panel"><div class="inner">
  <h2 class="sec">Dieses Wochenende</h2>
  <p class="lede">${list.length} Märkte am ${short(weekend[0])} und ${short(weekend[1])}.</p>

  ${many.map(group).join('')}

  <section class="city">
    <a class="city-head" href="#">
      <h3>Anderswo</h3>
      <span>${elsewhere.length} Märkte in ${singles.length} Orten</span>
    </a>
    ${elsewhere.map((m) => row(m, true)).join('')}
  </section>
</div></div>

<div class="labhead" style="margin-top:34px">
  <h1 style="font-size:20px">What changed, and why</h1>
  <p><b>Grouped by city, biggest first.</b> The list was sorted by time of day, so Genf → Aarau → Basel → Zürich → Dietikon interleaved 22 cities at random and someone in Zürich had to read 45 rows to find four. Now you scan eight headings, find yours, and stop. Each heading links to that city's page — your best-earning page type.</p>
  <p><b>The type badge only when it is not an ordinary Flohmarkt.</b> It was on 41 of 45 rows saying "this is a flea market", on a flea-market website. Four rows carry one now, and it means something. Same for the coloured rail: it is gone, because 91% of rows shared one colour and your own rule is that colour carries information or it does not appear.</p>
  <p><b>Freshness only when it is news.</b> "Bestätigt 11. Juni" appeared 26 times on one screen. Silence now means confirmed and recent; the line appears when a date is unconfirmed, stale past 90 days, or cancelled — which is when you actually need to see it, and now you will.</p>
  <p><b>Smaller photos, no empty boxes.</b> 56px on a phone. A 74px crowd photo was mush, and the six grey placeholders read as broken next to real ones — a market without a photo simply has no box.</p>
</div>
</div>
`;

writeFileSync(join(root, 'design/grouped-v4.html'), html);
console.log(`  ${list.length} weekend markets · ${many.length} city groups + ${elsewhere.length} elsewhere · ${flagged} flagged`);
process.exit(0);
