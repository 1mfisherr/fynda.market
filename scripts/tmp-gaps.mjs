import { query } from './db.mjs';
const rows = await query(`
  select m.slug, t.value as name, v.name as venue, v.address_line, v.postal_code,
         ct.value as city, m.website_url, m.entry_fee, m.recurrence_text,
         mp.source_url, o.name as org, o.channel_type, o.channel_value
    from public.markets m
    join public.venues v on v.id=m.venue_id
    join public.cities c on c.id=v.city_id
    left join public.texts ct on ct.entity_type='city' and ct.entity_id=c.id and ct.locale='de' and ct.field='name'
    left join public.texts t on t.entity_type='market' and t.entity_id=m.id and t.locale='de' and t.field='name'
    left join public.market_private mp on mp.market_id=m.id
    left join public.organisers o on o.id=m.organiser_id
   where m.status='active'
     and (v.postal_code is null or m.website_url is null or m.entry_fee is null
          or m.recurrence_text is null or m.recurrence_text=''
          or m.organiser_id is null or o.channel_value is null)
   order by m.slug`);
console.log(JSON.stringify(rows,null,1));
