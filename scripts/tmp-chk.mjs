import { query } from './db.mjs';
const rows = await query(`
  select m.slug, to_char(o.date,'YYYY-MM-DD') as d
    from public.markets m join public.occurrences o on o.market_id=m.id
   where m.slug in ('flohmarkt-rathausplatz-wettingen','flohmi-schmittiplatz-pratteln',
                    'saeuliaemtler-flohmarkt-affoltern','quartierflohmi-neu-allschwil',
                    'vrd-flohmarkt-riehen')
     and o.date >= current_date
   order by m.slug, o.date`);
const by={}; for(const r of rows)(by[r.slug]??=[]).push(r.d);
for (const s of ['flohmarkt-rathausplatz-wettingen','flohmi-schmittiplatz-pratteln','saeuliaemtler-flohmarkt-affoltern','quartierflohmi-neu-allschwil','vrd-flohmarkt-riehen'])
  console.log(`${s}: ${(by[s]||['NONE']).join(', ')}`);
