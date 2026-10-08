-- The first five of the 92 Swiss descriptions that were >=80% the old site's
-- text, rewritten from facts checked on the organisers' own pages
-- (intake/descriptions/research-*.json). Delfim approved the English on
-- 2026-10-08; de/fr/it are written from the same facts and wait for a native
-- speaker's pass like the rest.
--
-- Rules (PLAN.md, Next 0): facts only, nothing the page already shows, no
-- invented atmosphere, and nothing for sellers — no pitch prices or booking.
--
-- Corrections against the old text, each from the source:
--   Bulle — the station is ~10 min on foot, not 15 (brocantedelagruyere.ch/acces).
--   Kloten — about 80 stalls, not "over 80" (kloten.ch/maerkte/10849).
--   Dietikon — "every Saturday except major holidays, 08-16, Bahnhofplatz to
--     Kirchstrasse" is the city police's 2026 rule sheet
--     (dietikon.ch/_doc/6631739); the dates were stamped against it today.
--   Dübendorf — the organisers' stand sells soft drinks, not a Cüpli.

begin;

create temporary table new_description (slug text, locale text, value text) on commit drop;
insert into new_description values

  ('brocante-de-la-gruyere-bulle', 'en', 'Espace Gruyère, the exhibition centre in Bulle, runs this fair in its own halls; January 2027 is the 27th edition. The dealers bring furniture, lamps, collectables and antiques from several decades, and Watch&Write is there for old pens and watches. On Saturday and Sunday from 10:30 to 13:30, two appraisers value objects for free, so the thing from the attic can come along. Inside there''s a restaurant, a tea room, a bar and a pinte du terroir. Bus 202 stops at the entrance and the station is ten minutes on foot. Buy something big and the seller gives you a pass for the loading zone behind the hall. Dogs stay outside.'),
  ('brocante-de-la-gruyere-bulle', 'de', 'Espace Gruyère, das Ausstellungszentrum in Bulle, führt diese Messe in den eigenen Hallen durch; im Januar 2027 zum 27. Mal. Die Händlerinnen und Händler bringen Möbel, Lampen, Sammlerstücke und Antiquitäten aus mehreren Jahrzehnten mit, und Watch&Write ist für alte Füllfedern und Uhren da. Am Samstag und Sonntag von 10.30 bis 13.30 Uhr schätzen zwei Fachleute Gegenstände kostenlos – das Stück vom Estrich darf also mit. In der Halle gibt es ein Restaurant, einen Tea-Room, eine Bar und eine Pinte du terroir. Der Bus 202 hält vor dem Eingang, vom Bahnhof sind es zehn Minuten zu Fuss. Wer etwas Grosses kauft, bekommt vom Verkäufer einen Pass für die Ladezone hinter der Halle. Hunde bleiben draussen.'),
  ('brocante-de-la-gruyere-bulle', 'fr', 'Espace Gruyère, le centre d''exposition de Bulle, organise cette foire dans ses propres halles ; en janvier 2027, ce sera la 27e édition. Les marchands apportent meubles, luminaires, objets de collection et antiquités de plusieurs décennies, et Watch&Write est là pour les stylos et les montres anciens. Samedi et dimanche, de 10 h 30 à 13 h 30, deux experts estiment gratuitement vos objets : la trouvaille du grenier peut venir aussi. Sur place, un restaurant, un tea-room, un bar et une pinte du terroir. Le bus 202 s''arrête devant l''entrée, et la gare est à dix minutes à pied. Pour un gros achat, le vendeur vous remet un laissez-passer pour la zone de chargement derrière la halle. Les chiens restent dehors.'),
  ('brocante-de-la-gruyere-bulle', 'it', 'Espace Gruyère, il centro espositivo di Bulle, organizza questa fiera nei propri padiglioni; a gennaio 2027 si tiene la 27ª edizione. I commercianti portano mobili, lampade, oggetti da collezione e antiquariato di diversi decenni, e Watch&Write c''è per penne e orologi d''epoca. Sabato e domenica, dalle 10.30 alle 13.30, due esperti stimano gratuitamente gli oggetti: quello che tieni in soffitta può venire con te. All''interno ci sono un ristorante, una sala da tè, un bar e una pinte du terroir. Il bus 202 ferma all''ingresso e la stazione è a dieci minuti a piedi. Se compri qualcosa di grande, il venditore ti dà un pass per la zona di carico dietro il padiglione. I cani restano fuori.'),

  ('flohmarkt-kloten', 'en', 'The town of Kloten runs this market itself, once a year on the Stadtplatz. From 10 to 2 there''s a children''s flea market alongside, run by the Vereinigung Freizeit Kloten, where kids sell their own things. Cars can''t get onto the square; there are paid car parks nearby.'),
  ('flohmarkt-kloten', 'de', 'Die Stadt Kloten führt diesen Markt selbst durch, einmal im Jahr auf dem Stadtplatz. Von 10 bis 14 Uhr läuft daneben ein Kinderflohmarkt der Vereinigung Freizeit Kloten, an dem Kinder ihre eigenen Sachen verkaufen. Autos kommen nicht auf den Platz; in der Nähe gibt es kostenpflichtige Parkplätze.'),
  ('flohmarkt-kloten', 'fr', 'La ville de Kloten organise elle-même ce marché, une fois par an sur la Stadtplatz. De 10 h à 14 h, un marché aux puces pour enfants se tient à côté, organisé par la Vereinigung Freizeit Kloten : les enfants y vendent leurs propres affaires. Les voitures n''ont pas accès à la place ; des parkings payants se trouvent à proximité.'),
  ('flohmarkt-kloten', 'it', 'La città di Kloten organizza questo mercato in prima persona, una volta all''anno sulla Stadtplatz. Dalle 10 alle 14, accanto, c''è un mercatino per bambini della Vereinigung Freizeit Kloten, dove i bambini vendono le proprie cose. Le auto non possono accedere alla piazza; nelle vicinanze ci sono parcheggi a pagamento.'),

  ('flohmarkt-adliswil', 'en', 'Two markets share the Bahnhofplatz, both run by the town''s culture department. The Flohmärt is for used, older things. At the Bruggemärt, by the entrance to Haus Brugg, what''s on the tables is mostly made by the people selling it. Haggling is allowed; the town says so in writing. By the fountain, children sell from a corner of their own, and there''s coffee and homemade cake.'),
  ('flohmarkt-adliswil', 'de', 'Zwei Märkte teilen sich den Bahnhofplatz, beide von der Abteilung Kultur der Stadt organisiert. Der Flohmärt ist für Gebrauchtes und Älteres da. Am Bruggemärt beim Eingang zum Haus Brugg liegt auf den Tischen vor allem, was die Verkäuferinnen und Verkäufer selbst gemacht haben. Feilschen ist erlaubt – die Stadt schreibt es ausdrücklich. Beim Brunnen verkaufen Kinder in einer eigenen Ecke, und es gibt Kaffee und hausgemachten Kuchen.'),
  ('flohmarkt-adliswil', 'fr', 'Deux marchés se partagent la Bahnhofplatz, tous deux organisés par le service culturel de la ville. Le Flohmärt est réservé aux objets usagés et anciens. Au Bruggemärt, près de l''entrée de la Haus Brugg, ce qui se trouve sur les tables est surtout fabriqué par ceux qui le vendent. On a le droit de marchander : la ville l''écrit noir sur blanc. Près de la fontaine, les enfants vendent dans un coin rien qu''à eux, et il y a du café et des gâteaux maison.'),
  ('flohmarkt-adliswil', 'it', 'Due mercati si dividono la Bahnhofplatz, entrambi organizzati dall''ufficio cultura della città. Il Flohmärt è per oggetti usati e d''altri tempi. Al Bruggemärt, vicino all''ingresso della Haus Brugg, quello che c''è sui banchi è soprattutto fatto da chi lo vende. Contrattare è permesso: lo scrive la città stessa. Vicino alla fontana i bambini vendono in un angolo tutto loro, e ci sono caffè e torte fatte in casa.'),

  ('flohmarkt-chilbiplatz-duebendorf', 'en', 'The Ludothek Dübendorf, the town''s toy library, runs this market twice a year on the Chilbiplatz. On the tables: jewellery, clothes, toys, electronics and whatever else turns up. The square is closed to traffic and parking there is for stallholders only, so come by train or bike. The organisers'' own stand does coffee, homemade cakes, hot dogs, beer and soft drinks.'),
  ('flohmarkt-chilbiplatz-duebendorf', 'de', 'Die Ludothek Dübendorf, die Spielzeugausleihe der Stadt, führt diesen Markt zweimal im Jahr auf dem Chilbiplatz durch. Auf den Tischen: Schmuck, Kleider, Spielsachen, Elektronik und was sonst noch auftaucht. Der Platz ist für den Verkehr gesperrt, parkieren dürfen dort nur die Standbetreiber – komm also mit dem Zug oder dem Velo. Am Stand der Organisatoren gibt es Kaffee, hausgemachten Kuchen, Hot Dogs, Bier und Softdrinks.'),
  ('flohmarkt-chilbiplatz-duebendorf', 'fr', 'La Ludothek Dübendorf, la ludothèque de la ville, organise ce marché deux fois par an sur la Chilbiplatz. Sur les tables : bijoux, vêtements, jouets, électronique et tout ce qui se présente. La place est fermée à la circulation et le stationnement y est réservé aux exposants : venez en train ou à vélo. Le stand des organisateurs propose café, gâteaux maison, hot-dogs, bière et boissons fraîches.'),
  ('flohmarkt-chilbiplatz-duebendorf', 'it', 'La Ludothek Dübendorf, la ludoteca della città, organizza questo mercato due volte all''anno sulla Chilbiplatz. Sui banchi: gioielli, vestiti, giocattoli, elettronica e tutto quello che capita. La piazza è chiusa al traffico e il parcheggio è riservato agli espositori: vieni in treno o in bici. Lo stand degli organizzatori offre caffè, torte fatte in casa, hot dog, birra e bibite.'),

  ('flohmarkt-dietikon', 'en', 'Every Saturday the stalls stretch from the Bahnhofplatz to the Kirchstrasse, run by people who live in Dietikon or the towns and villages next to it. The city allows only used things here: no job lots, no new "antiques", no mass-made costume jewellery. Until noon the Wochenmarkt runs alongside on the Kirchplatz, with food from the region. Cars aren''t allowed on the square; use the public car parks.'),
  ('flohmarkt-dietikon', 'de', 'Jeden Samstag reihen sich die Stände vom Bahnhofplatz bis zur Kirchstrasse, betrieben von Leuten aus Dietikon und den Nachbargemeinden. Die Stadt erlaubt hier nur Gebrauchtes: keine Restposten, keine neuen «Antiquitäten», keinen Massenmodeschmuck. Bis Mittag läuft nebenan auf dem Kirchplatz der Wochenmarkt mit Lebensmitteln aus der Region. Autos sind auf dem Platz nicht erlaubt; nutze die öffentlichen Parkplätze.'),
  ('flohmarkt-dietikon', 'fr', 'Chaque samedi, les stands s''alignent de la Bahnhofplatz à la Kirchstrasse, tenus par des habitants de Dietikon et des communes voisines. La ville n''autorise ici que l''occasion : pas de lots de déstockage, pas d''« antiquités » neuves, pas de bijoux fantaisie de série. Jusqu''à midi, le marché hebdomadaire se tient à côté, sur la Kirchplatz, avec des produits de la région. Les voitures ne sont pas admises sur la place ; utilisez les parkings publics.'),
  ('flohmarkt-dietikon', 'it', 'Ogni sabato le bancarelle si allineano dalla Bahnhofplatz fino alla Kirchstrasse, gestite da chi abita a Dietikon o nei comuni vicini. La città qui ammette solo l''usato: niente stock di liquidazione, niente «antichità» nuove, niente bigiotteria di serie. Fino a mezzogiorno, accanto, sulla Kirchplatz c''è il mercato settimanale con prodotti della regione. Le auto non sono ammesse sulla piazza; usa i parcheggi pubblici.');

do $$
declare n int;
begin
  update public.texts t
     set value = d.value, updated_at = now()
    from public.markets m, new_description d
   where t.entity_type = 'market' and t.entity_id = m.id and t.field = 'description'
     and m.slug = d.slug and t.locale = d.locale;
  get diagnostics n = row_count;
  if n <> 20 then raise exception 'expected 20 descriptions updated, got %', n; end if;
end $$;

commit;
