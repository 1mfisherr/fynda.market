#!/usr/bin/env node
/**
 * Builds design/alive-v5.html — the weekend, grouped by city, with the life back.
 *
 *   node design/build-alive-v5.mjs
 *
 * v4 fixed the structure and killed the personality: it shrank the photograph
 * to a 56px thumbnail, deleted the illustration a market without one is
 * supposed to get, and left forty rows of identical grey. BRAND.md is explicit
 * about both — every market gets a picture, and "an empty grey box is what
 * makes a directory look dead".
 *
 * So this keeps v4's structure and changes what carries it:
 *
 *   - **Scale contrast.** Each city leads with one market at full size, then
 *     its others compact. A page with only one size on it has no rhythm, and
 *     rhythm is most of what "alive" means.
 *   - **The picture does the emotional work.** A flea market is stuff you can
 *     see. At 56px it was mush; at full width it is the reason to go.
 *   - **The accent is back on the date**, which is the one thing BRAND.md
 *     allows it on, and the one loud colour on the page.
 *
 * Live data. Responsive — drag the window narrow to check the phone.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { query } from '../scripts/db.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const TODAY = new Date().toISOString().slice(0, 10);

const rows = await query(`
  select coalesce(nm.value,p.slug) as name, p.kind, tc.value as city, sc.slug as city_slug,
         v.name as venue, m.image_url, coalesce(sm.slug,p.slug) as slug,
         o.date::text as date, o.start_time::text as start_time, o.end_time::text as end_time,
         o.status, o.confirmed_at::text as confirmed_at
    from publishable_markets p
    join markets m on m.id=p.id
    join venues v on v.id=p.venue_id
    join texts tc on tc.entity_type='city' and tc.entity_id=p.city_id and tc.locale='de' and tc.field='name'
    join slugs sc on sc.entity_type='city' and sc.entity_id=p.city_id and sc.locale='de' and sc.is_current
    left join slugs sm on sm.entity_type='market' and sm.entity_id=p.id and sm.locale='de' and sm.is_current
    left join texts nm on nm.entity_type='market' and nm.entity_id=p.id and nm.locale='de' and nm.field='name'
    join occurrences o on o.market_id=p.id
   where o.date >= $1
   order by o.date, o.start_time nulls last`, [TODAY]);

const dayOf = (iso) => new Date(iso + 'T00:00:00').getDay();
const dates = [...new Set(rows.map((r) => r.date))].sort();
const weekend = dates.filter((d) => [0, 6].includes(dayOf(d))).slice(0, 2);
const list = rows.filter((r) => weekend.includes(r.date));

const KIND = { hallenflohmarkt: ['Halle', '--l-halle'], nachtflohmarkt: ['Nacht', '--l-nacht'],
  kinderflohmarkt: ['Kinder', '--l-kinder'], troedelmarkt: ['Trödel', '--l-troedel'] };
const DOW = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MON = ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez'];
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const hhmm = (t) => (t ? t.slice(0, 5) : '');
const short = (iso) => `${Number(iso.slice(8, 10))}. ${MON[Number(iso.slice(5, 7)) - 1]}`;

const STALE = 90;
const flagOf = (m) => {
  if (m.status === 'cancelled') return ['fällt aus', 'bad'];
  if (!m.confirmed_at) return ['nicht bestätigt', 'warn'];
  const age = (Date.parse(TODAY) - Date.parse(m.confirmed_at.slice(0, 10))) / 86400000;
  return age > STALE ? [`zuletzt geprüft ${short(m.confirmed_at.slice(0, 10))}`, 'warn'] : null;
};

/* The illustration, simplified from components/PlaceholderArt.astro. It is
   permanent furniture, not a stopgap — a market with no photograph still gets
   a picture, and the ground is deterministic per slug so it never flickers. */
const ART = [
  ['#F0E6DC', '#C9A886', '#A8845E'], ['#E4E9EE', '#A6B4C2', '#8496A8'],
  ['#EDE7F5', '#B9AAD4', '#9787BC'], ['#E6EDE7', '#A9C0AE', '#87A38E'],
];
const art = (seed) => {
  let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [ground, ink, deep] = ART[h % ART.length];
  return `<svg class="art" viewBox="0 0 224 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="224" height="140" fill="${ground}"/>
      <g fill="${ink}"><path d="M40 96h80v7H40z"/><path d="M46 80h68v14H46z"/><path d="M54 66h52v12H54z"/></g>
      <g fill="${deep}"><circle cx="163" cy="60" r="13"/><path d="M160 70h6v33h-6z"/><path d="M150 101h26v5h-26z"/>
        <circle cx="66" cy="58" r="7"/><path d="M84 52h16v12H84z"/></g>
    </svg>`;
};
const picture = (m, cls) => m.image_url
  ? `<img class="${cls}" src="https://fynda.market${esc(m.image_url)}" alt="" loading="lazy">`
  : art(m.slug);

const dayTag = (m) => {
  const d = new Date(m.date + 'T00:00:00');
  return `<span class="day">${DOW[d.getDay()]} ${d.getDate()}.</span>`;
};
const kindTag = (m) => (KIND[m.kind]
  ? `<i class="tag" style="background:var(${KIND[m.kind][1]})">${KIND[m.kind][0]}</i>` : '');
const flagTag = (m) => { const f = flagOf(m); return f ? `<span class="flag ${f[1]}">${f[0]}</span>` : ''; };
const hours = (m) => (hhmm(m.start_time) ? `${hhmm(m.start_time)}${m.end_time ? `–${hhmm(m.end_time)}` : ''}` : '');

/* The lead: one market per city at full size. The picture is the argument. */
const lead = (m) => `
      <a class="lead" href="#">
        <div class="lead-pic">${picture(m, 'shot')}</div>
        <div class="lead-text">
          <p class="meta-line">${dayTag(m)}${hours(m) ? `<span class="hrs">${hours(m)}</span>` : ''}${flagTag(m)}</p>
          <h4 class="lead-name">${esc(m.name)}${kindTag(m)}</h4>
          <p class="where">${esc(m.venue)}</p>
        </div>
      </a>`;

/* And the rest of that city, compact — but still with a picture. */
const compact = (m, showCity) => `
      <a class="row" href="#">
        <div class="thumb">${picture(m, 'shot')}</div>
        <div class="row-text">
          <p class="meta-line">${dayTag(m)}${hours(m) ? `<span class="hrs">${hours(m)}</span>` : ''}${flagTag(m)}</p>
          <h4 class="row-name">${esc(m.name)}${kindTag(m)}</h4>
          <p class="where">${esc(m.venue)}${showCity ? ` · ${esc(m.city)}` : ''}</p>
        </div>
      </a>`;

const byCity = new Map();
for (const m of list) {
  if (!byCity.has(m.city_slug)) byCity.set(m.city_slug, { city: m.city, items: [] });
  byCity.get(m.city_slug).items.push(m);
}
const groups = [...byCity.values()].sort((a, b) => b.items.length - a.items.length || a.city.localeCompare(b.city, 'de'));
const many = groups.filter((g) => g.items.length > 1);
const singles = groups.filter((g) => g.items.length === 1)
  .sort((a, b) => a.city.localeCompare(b.city, 'de')).flatMap((g) => g.items);

const cityBlock = (g) => `
    <section class="city">
      <a class="city-head" href="#"><h3>${esc(g.city)}</h3><span>${g.items.length} Märkte</span></a>
      <div class="city-body">
        ${lead(g.items[0])}
        <div class="rest">${g.items.slice(1).map((m) => compact(m, false)).join('')}</div>
      </div>
    </section>`;

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Fynda — Alive v5</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&display=swap">
<style>
:root{
  --accent:#FF4A2B; --ink:#111110; --grey:#6E6C68; --quiet:#9A968F;
  --line:#E8E6E2; --paper:#F5F4F2; --stage:#2A2926;
  --l-halle:#3D5AFE; --l-nacht:#7C3AED; --l-kinder:#F5A524; --l-troedel:#E4007F;
  --t-lead:clamp(21px,calc(18.78px + .592vw),27.3px);
  --t-name:clamp(16px,calc(14.31px + .451vw),20.8px);
  --t-small:clamp(12.5px,calc(11.18px + .352vw),16.25px);
  --t-city:clamp(24px,calc(21.46px + .676vw),31.2px);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--stage);color:var(--ink);padding:26px 16px 70px;
  font-family:"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif;
  font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;overflow-wrap:break-word}
.lab{max-width:1200px;margin:0 auto}
.labhead{color:#fff;max-width:660px}
.labhead .mk{font-size:17px;font-weight:800;letter-spacing:-.045em}
.labhead .mk span{color:var(--accent)}
.labhead h1{font-size:26px;font-weight:800;letter-spacing:-.04em;margin-top:10px;line-height:1.12}
.labhead p{font-size:13.5px;line-height:1.6;color:#B5B1A8;margin-top:10px}
.labhead p b{color:#fff;font-weight:700}
.panel{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 18px 44px rgba(0,0,0,.35);margin-top:22px}
.inner{padding:26px 16px 34px}
a{color:inherit;text-decoration:none;display:block}
img,svg{display:block;max-width:100%}

.sec{font-size:var(--t-city);font-weight:800;letter-spacing:-.035em;line-height:1.05}
.sec-lede{color:var(--grey);font-size:var(--t-small);margin-top:6px}

/* ---- the city spine ---- */
.city{margin-top:34px}
.city-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;
  padding-bottom:8px;border-bottom:2px solid var(--ink);margin-bottom:16px}
.city-head h3{font-size:var(--t-name);font-weight:800;letter-spacing:-.03em;text-transform:uppercase}
.city-head span{color:var(--quiet);font-size:var(--t-small);font-weight:600;white-space:nowrap}

/* ---- the shared line above a name: the date is the one loud colour ---- */
.meta-line{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.day{color:var(--accent);font-size:var(--t-small);font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.hrs{color:var(--grey);font-size:var(--t-small);font-weight:600}
.flag{font-size:var(--t-small);font-weight:700}
.flag.warn{color:var(--grey)}
.flag.bad{color:var(--accent)}
.where{margin-top:3px;color:var(--quiet);font-size:var(--t-small);line-height:1.4}
.tag{display:inline-block;vertical-align:2px;margin-left:6px;padding:2px 7px;border-radius:999px;
  color:#fff;font-size:11px;font-style:normal;font-weight:800;letter-spacing:.04em;white-space:nowrap}

/* ---- the lead: the picture is the argument ---- */
.lead-pic{aspect-ratio:16/10;overflow:hidden;border-radius:12px;background:var(--paper)}
.lead-pic .shot,.lead-pic .art{width:100%;height:100%;object-fit:cover}
.lead-text{padding-top:12px}
.lead-name{font-size:var(--t-lead);font-weight:800;letter-spacing:-.03em;line-height:1.12;margin-top:5px}

/* ---- the rest of that city ---- */
.rest{margin-top:6px}
.row{display:grid;grid-template-columns:76px minmax(0,1fr);gap:14px;align-items:center;
  padding:14px 0;border-bottom:1px solid var(--line)}
.rest .row:last-child{border-bottom:0}
.thumb{aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--paper)}
.thumb .shot,.thumb .art{width:100%;height:100%;object-fit:cover}
.row-name{font-size:var(--t-name);font-weight:700;letter-spacing:-.02em;line-height:1.2;margin-top:3px}

@media (min-width:820px){
  .inner{padding:34px 28px 44px}
  /* The lead sits beside its city's other markets rather than above them —
     the width buys a bigger picture and a shorter page at once. */
  .city-body{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:34px;align-items:start}
  .lead-pic{aspect-ratio:4/3}
  .rest{margin-top:0}
  .rest .row:first-child{padding-top:0}
  .row{grid-template-columns:92px minmax(0,1fr);gap:18px}
}
</style>

<div class="lab">
<div class="labhead">
  <div class="mk">fynda<span>.</span></div>
  <h1>Same structure. Not dead.</h1>
  <p>v4 was right about the grouping and wrong about everything else: it shrank the photograph to 56px, deleted the illustration a market without one is meant to get, and left forty rows of identical grey. Your own brand doc says every market gets a picture, and that <b>an empty grey box is what makes a directory look dead</b>.</p>
  <p><b>Three things changed, none of them structural.</b> Each city leads with one market at full size and the rest compact — a page with one size on it has no rhythm. The picture is big enough to be a reason to go rather than a smudge. And the accent is back where BRAND.md allows it: on the date, the one loud colour on the page.</p>
  <p>Live data. Responsive — <b>drag the window narrow to check the phone.</b></p>
</div>

<div class="panel"><div class="inner">
  <h2 class="sec">Dieses Wochenende</h2>
  <p class="sec-lede">${list.length} Märkte am ${short(weekend[0])} und ${short(weekend[1])}.</p>
  ${many.map(cityBlock).join('')}
  <section class="city">
    <a class="city-head" href="#"><h3>Anderswo</h3><span>${singles.length} Orte</span></a>
    <div class="city-body">
      ${lead(singles[0])}
      <div class="rest">${singles.slice(1).map((m) => compact(m, true)).join('')}</div>
    </div>
  </section>
</div></div>
</div>
`;

writeFileSync(join(root, 'design/alive-v5.html'), html);
console.log(`  ${list.length} markets · ${many.length} cities + ${singles.length} elsewhere`);
process.exit(0);
