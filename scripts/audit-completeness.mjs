/** One-off: what is missing, per market. Not part of the build. */
import { query } from './db.mjs';

const rows = await query(`
  select m.slug, m.status, m.kind,
         t.value as name_de,
         d.value as desc_de,
         m.recurrence_text, m.recurrence_rrule, m.website_url, m.image_url,
         m.entry_fee, m.organiser_id,
         v.name as venue_name, v.address_line, v.postal_code, v.timezone,
         v.google_place_id,
         (v.point is null) as no_point,
         c.id as city_id,
         (select count(*) from public.occurrences o where o.market_id = m.id) as occ_total,
         (select count(*) from public.occurrences o
            where o.market_id = m.id and o.date >= current_date) as occ_future,
         (select count(*) from public.occurrences o
            where o.market_id = m.id and o.date >= current_date and o.start_time is null) as occ_future_no_start,
         (select count(*) from public.occurrences o
            where o.market_id = m.id and o.date >= current_date and o.end_time is null) as occ_future_no_end,
         (select count(*) from public.occurrences o
            where o.market_id = m.id and o.date >= current_date and o.status = 'unverified') as occ_future_unverified,
         (select count(*) from public.occurrences o
            where o.market_id = m.id and o.confirmed_at is not null) as occ_confirmed_at,
         (select string_agg(distinct s.locale, ',' order by s.locale)
            from public.slugs s where s.entity_type='market' and s.entity_id=m.id) as slug_locales,
         (select string_agg(distinct x.locale, ',' order by x.locale)
            from public.texts x where x.entity_type='market' and x.entity_id=m.id and x.field='name') as name_locales,
         (select string_agg(distinct x.locale, ',' order by x.locale)
            from public.texts x where x.entity_type='market' and x.entity_id=m.id and x.field='description') as desc_locales,
         (select count(*) from public.market_tags mt where mt.market_id=m.id) as tags,
         (select o2.channel_value from public.organisers o2 where o2.id=m.organiser_id) as organiser_channel,
         (select mp.source_url from public.market_private mp where mp.market_id=m.id) as source_url
    from public.markets m
    join public.venues v on v.id = m.venue_id
    join public.cities c on c.id = v.city_id
    left join public.texts t on t.entity_type='market' and t.entity_id=m.id and t.locale='de' and t.field='name'
    left join public.texts d on d.entity_type='market' and d.entity_id=m.id and d.locale='de' and d.field='description'
   order by m.slug
`);
console.log(JSON.stringify(rows, null, 1));
