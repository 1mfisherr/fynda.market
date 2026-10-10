-- Letziplunder Basel: the English put the Papiermühle on the Birsig — it stands on the St. Alban
-- canal, as the German and French say — and added atmosphere the facts do not carry ("one of the
-- more atmospheric flea markets"). Rewritten to the other languages' facts; the Italian's "river"
-- becomes "the water". Found reading the seller-price sweep back, 2026-10-10.

begin;

do $$
declare n int;
begin
  if not exists (select 1 from public.markets) then return; end if;
  update public.texts t set value = v.value, updated_at = now()
    from public.markets m,
         (values
           ('en', $t$The Letziplunder Flohmarkt takes place twice a year at the Basler Papiermühle — the Swiss Museum for Paper, Writing and Print — by the water in Basel's St. Alban district. The historic waterside setting gives it the feel of a brocante rather than a standard flea market; the event calls itself the most beautiful flea market in Basel.$t$),
           ('it', $t$Il Letziplunder Flohmarkt si tiene due volte l'anno alla Papiermühle di Basilea, il Museo svizzero della carta, della scrittura e della stampa, in riva all'acqua nel quartiere di St. Alban. La posizione storica sull'acqua gli dà più l'aria di una brocante che di un classico mercatino; l'evento si presenta come il mercatino più bello di Basilea.$t$)
         ) as v(locale, value)
   where m.slug = 'letziplunder-flohmarkt-basel' and t.entity_type = 'market' and t.entity_id = m.id
     and t.field = 'description' and t.locale = v.locale;
  get diagnostics n = row_count;
  if n <> 2 then raise exception 'updated %, expected 2', n; end if;
end $$;

commit;
