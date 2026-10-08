-- The final four of the 92: short, from what can be shown, so no copied text is left.
--   Slow Fashion Market — the organiser's own text (colormygeneva.ch/events/the-slow-fashion-market-2/,
--     contact Lawen Lounge): a one-day market of designers, responsible fashion, curated vintage and
--     second-hand, jewellery, textile craft; DJ set and food and drinks; Casino de Montbenon.
--   Flohmi & Spass ar Heimstrass — Bümpliz.ch, 2026 article: "von und für Quartierbewohner";
--     "Bei Regenwetter kann der Flohmi leider nicht durchgeführt werden."
--   Les Puces de la Folie — folievoltaire.ch/evenements ("Marché aux Puces, Friperie et Artisanat sur
--     l'Esplanade des Marronniers à la Folie") and lausanne-tourisme.ch for the café.
--   Vide-Dressing des Bains Payes — only the venue can be shown (torpille.ch/listing/bains-payes/):
--     the text says where it is held and what is there, nothing about the market it cannot prove.

begin;

create temporary table new_description (slug text, locale text, value text) on commit drop;
insert into new_description values
  ('slow-fashion-market-lausanne', 'en', $t$A one-day market for slower fashion: independent designers, responsible labels, curated vintage and second-hand clothes, jewellery and textile craft, in the Casino de Montbenon. Lawen Lounge puts it on, with a DJ set and a corner for food and drinks.$t$),
  ('slow-fashion-market-lausanne', 'de', $t$Ein Markt für langsamere Mode, an einem einzigen Tag: unabhängige Designerinnen und Designer, verantwortungsvolle Labels, ausgewählte Vintage- und Secondhand-Kleider, Schmuck und Textilhandwerk, im Casino de Montbenon. Lawen Lounge organisiert ihn, mit DJ-Set und einer Ecke für Essen und Getränke.$t$),
  ('slow-fashion-market-lausanne', 'fr', $t$Un marché éphémère de la mode lente : créateurs indépendants, marques responsables, vintage et seconde main triés sur le volet, bijoux et artisanat textile, au Casino de Montbenon. Lawen Lounge l'organise, avec un DJ set et un espace pour manger et boire.$t$),
  ('slow-fashion-market-lausanne', 'it', $t$Un mercato di un giorno per una moda più lenta: designer indipendenti, marchi responsabili, vintage e usato selezionati, gioielli e artigianato tessile, al Casino de Montbenon. Lo organizza Lawen Lounge, con un DJ set e un angolo per cibo e bevande.$t$),

  ('flohmi-spass-heimstrasse-bern', 'en', $t$For a day, the Heimstrasse in Bümpliz becomes a flea market run by and for the people of the neighbourhood, with the stalls along the street. In rain, it doesn't go ahead.$t$),
  ('flohmi-spass-heimstrasse-bern', 'de', $t$Für einen Tag wird die Heimstrasse in Bümpliz zum Flohmarkt, von und für die Leute aus dem Quartier, mit den Ständen entlang der Strasse. Bei Regen fällt er aus.$t$),
  ('flohmi-spass-heimstrasse-bern', 'fr', $t$Le temps d'une journée, la Heimstrasse, à Bümpliz, devient un marché aux puces organisé par et pour les habitants du quartier, avec les stands le long de la rue. En cas de pluie, il n'a pas lieu.$t$),
  ('flohmi-spass-heimstrasse-bern', 'it', $t$Per un giorno la Heimstrasse, a Bümpliz, diventa un mercatino delle pulci fatto dagli abitanti del quartiere e per loro, con le bancarelle lungo la strada. Con la pioggia non si fa.$t$),

  ('folie-flea-market-lausanne', 'en', $t$The Folie Voltaire café holds this small market of flea-market finds, second-hand clothes and crafts on the esplanade under its chestnut trees. The café sits in a period kiosk in the middle of Parc Mon-Repos and serves coffee, tea and cold drinks; Lausanne's tourist office adds crêpes and home-made ice cream, and there's a playground next door. The park once had a theatre where Voltaire was a guest, which is where the café got its name.$t$),
  ('folie-flea-market-lausanne', 'de', $t$Das Café Folie Voltaire veranstaltet diesen kleinen Markt mit Flohmarktfunden, Secondhand-Kleidern und Handwerk auf der Esplanade unter seinen Kastanienbäumen. Das Café steht in einem historischen Kiosk mitten im Parc Mon-Repos und serviert Kaffee, Tee und kalte Getränke; laut Lausanne Tourisme gibt es auch Crêpes und hausgemachtes Glace, und gleich daneben liegt ein Spielplatz. Im Park stand einst ein Theater, in dem Voltaire zu Gast war – daher der Name des Cafés.$t$),
  ('folie-flea-market-lausanne', 'fr', $t$Le café de la Folie Voltaire organise ce petit marché aux puces, avec fripes et artisanat, sur l'esplanade des Marronniers. Le café occupe un kiosque d'époque au cœur du parc Mon-Repos et sert cafés, thés et boissons fraîches ; Lausanne Tourisme y signale aussi des crêpes et des glaces artisanales, et une place de jeux est juste à côté. Le parc abritait autrefois un théâtre qui accueillit Voltaire, d'où le nom du café.$t$),
  ('folie-flea-market-lausanne', 'it', $t$Il caffè Folie Voltaire organizza questo piccolo mercatino con oggetti d'occasione, abiti usati e artigianato sull'esplanade sotto i suoi castagni. Il caffè si trova in un chiosco d'epoca nel cuore del Parc Mon-Repos e serve caffè, tè e bibite fresche; secondo Lausanne Tourisme ci sono anche crêpes e gelati artigianali, e accanto c'è un parco giochi. Nel parco c'era un tempo un teatro che ospitò Voltaire: da lì il nome del caffè.$t$),

  ('vide-dressing-bains-payes-vevey', 'en', $t$The vide-dressing is held at Les Bains Payes, Vevey's lakeside bathing spot on the Quai Ernest-Ansermet, whose rooftop terrace hosts pop-up markets. The Bains' own bar does burgers, salads, bowls, local craft beer and homemade lemonade.$t$),
  ('vide-dressing-bains-payes-vevey', 'de', $t$Der Vide-Dressing findet in Les Bains Payes statt, dem Seebad von Vevey am Quai Ernest-Ansermet, dessen Dachterrasse Pop-up-Märkte beherbergt. Die Bar des Bads serviert Burger, Salate, Bowls, lokales Craft-Bier und hausgemachte Limonade.$t$),
  ('vide-dressing-bains-payes-vevey', 'fr', $t$Le vide-dressing se tient aux Bains Payes, les bains de Vevey au bord du lac, sur le quai Ernest-Ansermet, dont le toit-terrasse accueille des marchés éphémères. La buvette des Bains propose burgers, salades, bowls, bières artisanales locales et limonades maison.$t$),
  ('vide-dressing-bains-payes-vevey', 'it', $t$Il vide-dressing si tiene a Les Bains Payes, lo stabilimento balneare di Vevey sul Quai Ernest-Ansermet, la cui terrazza sul tetto ospita mercati pop-up. Il bar dei Bagni serve burger, insalate, bowl, birra artigianale locale e limonata fatta in casa.$t$);

do $$
declare n int;
begin
  update public.texts t set value = d.value, updated_at = now()
    from public.markets m, new_description d
   where t.entity_type = 'market' and t.entity_id = m.id and t.field = 'description'
     and m.slug = d.slug and t.locale = d.locale;
  get diagnostics n = row_count;
  if n <> 16 then raise exception 'expected 16, got %', n; end if;
end $$;

commit;
