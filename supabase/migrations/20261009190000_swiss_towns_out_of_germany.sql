-- Five Swiss towns created by import-v1-additions.mjs on 2026-10-09 were filed under German
-- Bundesländer: the importer matched cantons by code alone, and BE (Bern / Berlin) and SH
-- (Schaffhausen / Schleswig-Holstein) collide. Their markets were still unverified, so nothing
-- was published. Moved to their cantons; the importer now looks at Swiss regions only.

begin;

update public.cities c
   set region_id = ch.id, updated_at = now()
  from public.regions de
  join public.countries kd on kd.id = de.country_id and kd.iso2 = 'DE',
       public.regions ch
  join public.countries kc on kc.id = ch.country_id and kc.iso2 = 'CH'
 where c.region_id = de.id and ch.code = de.code
   and c.id in ('33b3a6f3-2941-4818-ba85-30022b48c554',   -- Burgdorf
                'ce9aad5f-9fe2-46df-823f-c7f324d4037c',   -- Köniz
                'd8e154c9-0dc0-4123-8ad5-08302e007ad0',   -- Lyssach
                'c838f971-a01e-4fd7-b562-908a8cabc153',   -- Münsingen
                '0b0d3024-03f8-40f7-b93b-565ce28ea971');  -- Neuhausen

commit;
