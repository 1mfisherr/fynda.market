# Replacing the old site's photos

55 of 258 Swiss markets still show the picture the old site used (2026-10-26). Google read our pages as copies partly because of them, so every one gets replaced: a real photo of the market first, free stock where nothing real exists (Delfim, 2026-10-24). Almost every one left has been searched with nothing real found, so the rest are stock unless an organiser sends one.

How a batch runs, and what Delfim has settled: the `photo-batch` skill (`.claude/skills/photo-batch/SKILL.md`). This file is the log.

## Wrong photos still live

Each one needs a photo from its organiser, which the welcome letters or calls can ask for, or a stock photo next batch:

- Echichens: a big street market, but it is a 10-stall children's sale in a hall
- Enter Retrotechnikmarkt: the photo is right, but it shows video games while our text says computers and radios. Check the text
- Flohmärt «Züg ond Sache» Beromünster: an illustrated poster (its picture is iStock)
- Horgen Dorfplatz: a poster
- Quartierflohmarkt Pratteln Gehrenacker: an aerial shot of a street procession, not a flea market

Also owed: **Stücki**, a new market (first date 20 Sep 2026) with no real photo anywhere. Delfim's AI image can go up if he sends it again, otherwise use the organiser's or one taken there (15 Nov, 13 Dec). **Weihnachtsdekomarkt Strengelbach** has no photo yet.

## Tried

Already searched. Don't search them again unless something new turns up, such as an organiser gallery or press coverage of a new edition.

**Replaced:**
- 2026-10-17: batch 1 (17 markets), Bürkliplatz, Hirzbrunnen
- 2026-10-18: Liesberger Flohmarkt, Marché Calabash, Alpin-Flohmi (all 9), Rumine (all 4), Presswerk Arbon (both), Lenzburg, Dübendorf, GZ Hirzenbach, Muttenz, Mädelsflohmarkt, Säuliämtler, Wädenswil, Beromünster, Worb, Flon, Wynecenter Buchs, Markthalle Basel (night), Dampfzentrale, the airport market, Baden Bazaar, Gallusplatz, Night-Flohmarkt Kloten, Lugano, Dietikon, Europaplatz Bern, Hölstein, Arbon (unsure it is the flea market)
- 2026-10-20: Rüticenter, Schmittiplatz Pratteln, Gellert, FLOSCH, Bullingerhof, Rafz, Wetzikon, Grosse Halle, Europaplatz Floh- und Raritätenmarkt, Strandgut Neubad, St. Mangen, Place de Milan, Theaterplatz Baden, Vinyl Market Basel, Rosental/Erlenmatt, Innerstadt, Wollishofen am See, Mellingen, Stadtbibliothek Aarau, Ladies and ARENA Root, Mall of Switzerland, Paulusheim, Fête Livres & Disques Ouchy, Svuotacantine Ascona, Lyssach, Bienzgut, Talkessel Seewen, Malters, Hallenflohmarkt Uster, Grabs, Neuhausen model railway fair, Puces du CPO, EcoBroc Saxon, Puppenbörse Zollikon, Vinylbörse Wald
- 2026-10-21: Sion L'Archipel, Coffre ouvert Monthey, Grosse Burgdorfer Brocante, Härkingen, Ace Cafe Luzern, Dreispitzpark Kreuzlingen, Mercalibro, Lusso e Vintage Lugano, Brocante de la Gruyère, Enter Flohmarkt, Enter Retrotechnikmarkt, Metalbörse, Modellbahnbörse Köniz, Buchs SG toy fair, Flumserei, ROMEO Münchwilen, Shoppi Flohmi
- 2026-10-23: Enter vinyl/film/book fair, Uster Stadthausplatz (cropped wide), Hyper Bazar, Brocante Locarno, Altdorf, Galgenen, Subingen, Breitsch-Märit, Richterswil, WBZ Reinach, Chambrelien, Misery, Quai de Nogent Yverdon, Le Landeron, Baar. Two researcher agents; Bing Images by script returned noise, the organisers' sites and press did the work
- 2026-10-24: Papieriplatz Cham, Liestal, Letziplunder, Kreuzlingen–Konstanz (Konstanz side, evening), Burstelpark Frauenfeld, Flommbo Altstätten, Heimstrasse Bern, Flugplatz Buttwil (was a poster), Mercantico Bellinzona (was a promo card). Four agents; organiser galleries (one found through a WordPress media list) and press did the work, Commons had nothing
- 2026-10-24 (second batch): Quartierflohmärkte Bottmingen (cropped from the town's 2025 annual report), Breite/St. Alban, Gotthelf/Iselin, Gundeli, Matthäus, Neubad, Riehen/Niederholz (600 px, but the live one was the Keltenweg market), St. Johann (the live one was Matthäus); Schlieren, Kofmehl Solothurn (was a poster), Kinderflohmarkt Winterthur, Chur (was a poster), GZ Hottingen. The organiser's galleries (quartierflohmibasel.ch/de/<slug>/impressionen/) stop at 818 px; bigger copies came from umweltbasel.ch, agendabasel.ch and press

- 2026-10-26: batches 11 and 12, 44 markets, eight Sonnet agents. Real: Prilly (the château square, from loisirs.ch), the Locarno children's market (the organiser's photo via laRegione), Markthalle Basel (the organiser's photo of its night market in the same hall), Olten's bridge itself (Commons, no stalls). Stock for the other 40, the source page in each fact's `source_ref`, Commons credits under the picture: Emmen, GZ Seebach, Oetwil, Thun, Glattbrugg, Musiker Zürich, Ecublens, Oron, Adliswil, Mädelsflohmarkt XXL Dietikon, Lido and Eiszentrum Luzern, Therwil, Lehenmatt (black and white), Spalen/Holbein, Kinderflohmarkt Uster, Villars-Tiercelin, Glovelier, Puces du Loup, Folie, Aadorf (these five from Pixabay, 1280 px), Enter Modellbau, the two Fribourg bourses, both record fairs, the STAGE, Cozy Sunday, Münsingen, GZ Heuried, industrie45, Amriswil, Wettingen, Bülach, Paradiso, Les Brenets, Brocante de Fribourg, the Geneva toy bourse, Swiss Vintage and Design, Brocantissima. Portraits cropped to 3:2. Lessons: Pixabay serves agents 1280 px at most; agents pick the same stock photo for different markets, so check look-alikes (`dupes.mjs` in the session scratchpad compared 16×16 hashes); a real photo of another market is still a wrong photo (Hinwil's find was Bürkliplatz)

- 2026-10-27: seven new German markets (no old photo), two Sonnet agents, Delfim picked. Real, from the organisers' galleries: Frankfurt-Höchst (Weiß), Mainz Uni (MP Märkte). Real venue: Leipzig Westwerk (Commons, Derbrauni, CC BY 4.0, cropped 3:2), Stöcken (the city's photo of the Stadtteilzentrum). Stock (Pexels): Nürnberg Flughafen, Berlin Marienfelde, Berlin Spandau — nothing real exists; retrothek.de has Marienfelde at 800 px with a watermark

**Kept the old one** (the find was worse):
- Lutry, Galerie 17 Terra, Glarus, B102 Luzern, Carouge, Romanshorn (only 512 px exists), Comicbörse Zürich (only 300 px exists)
- Kriens: AI-made, and it stays
- Weinfelden, Arlesheim: the only photo online is the one already live
- Antik-Flohmarkt Fehraltorf: only a press photo with one woman in front
- Biel/Bienne: the city's old-town picture is lovely, but the market is on the Esplanade, which the live photo shows
- Neuchâtel Jardin anglais: the finds were a sister frame of the live one and black-and-white Flickr shots
- Quartierflohmarkt Bachletten: the organiser's gallery is 600 px, the live one 850
- Kinderflohmarkt Uster: the only find sits on the adult market's page, with a girl mid-frame

**Nothing better found**, so only the organiser has one:
- VRD Riehen, Kriens, Rümlang, GZ Heuried, Vevey Bains Payés, Steiner Schule Basel, Bruderholzallee, Sallaz, Slow Fashion, the STAGE
- Stellwerk, Wettingen, Markthalle Basel (day), GZ Seebach, Klybeck, Bülach
- Musiker Flohmarkt, Reinach Nord, Vide-Grenier Bern Altstadt, Biasca, NerdYartist, Musikflohmarkt, Paradiso, Bern CD-Börse, Sarnen-Center
- Disco Flohmi, Nachtflohmarkt Stellwerk, Münsingen, Arboldswil, Olten, Kinder-Flohmi Arbon, Hinterhof St. Gallen
- Les Brenets, Glattbrugg, Hinwil, Zug industrie45, Amriswil
- Riehen Grenzacherweg (organiser: "Fotos folgen"), Säli-Bruch-Obergütsch Luzern (first edition Sep 2026, flyer only)
- Kreisflohmi Zürich (the site has only illustrations), Roggenweg Zofingen (no trace after Sep 2023: may have stopped)
- Obere Mühle Dübendorf (only a drawing exists), FloDo Solothurn (press photos show the earlier market at the same square)
- the four Dakota fairs (Fribourg ×3, Genève; their media are flyers only), Zürcher Schallplattenbörse, Coupole Biel, Brocantissima Morges
- 2026-10-26, nothing but posters: Massagno, Muralto, Renens familles, Mathod, Onex, Paudex, Vide-Grenier de Lutry (kept: the quay photo may be the old site's)
- 2026-10-26, stock found but the same photo went to another market, so search again: Steiner Schule Basel, Pratteln Gehrenacker, Musikflohmarkt Basel, Echichens, Horgen, Coupole Biel, Beromünster, Hinwil
- plus every market in **Wrong photos still live** above

Delfim's own photos: he'd photograph markets near him ("would be nice", 2026-10-14). Waiting for his town, then a list of nearby markets still on old photos.
