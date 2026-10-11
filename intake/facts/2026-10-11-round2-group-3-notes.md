# Facts round 2, group 3: notes

## Dead, moved or not about the market
- **flohmarkt-schlieren-herbstmarkt**: `m.schlieren.ch/kibou` shows "Upps. Diese Seite können wir nicht finden"; `www.schlieren.ch/kibou` says "Ungültige Adresse". Bing found no replacement. The website needs replacing.
- **flohmarkt-zofingen**: `die-farbig-fabrik.ch` is a co-working building's site (Roggenweg 2). It says nothing about a flea market on the home page or the firms page.
- **hyper-bazar-la-chaux-de-fonds**: the j3l.ch link is a tourism directory, not the organiser. It now loads a generic page with no Hyper Bazar text. Bing found nothing.
- **folie-flea-market-lausanne**: folievoltaire.ch is a café that is closed for the season. Its only flea market is an old event ("Samedi 7 juin … Marché aux Puces, Friperie et Artisanat"), with no current dates.
- **kofmehl-flohmi-solothurn**: the only flea market page on kofmehl.net (`/flohmi`) is the 2016 edition ("19. Ausgabe", 30.04.2016). The current programme has no Flohmi. It may have ended.
- **kinderflohmarkt-gz-heuried**: `gz-zh.ch/gz-heuried/angebote/flohmarkt-fuer-kindersachen/` returns "Not Found".
- **kinderflohmarkt-gz-hottingen**, **kinderflohmarkt-gz-schindlergut**: the links are the GZ home pages and say nothing about a children's flea market. I could not find the event pages: the site search finds nothing and URL guesses return 404.
- **haerkinger-flohmi**: the Google Sites page is still live and current ("Unser 15. Flohmi findet am 08.11.2026 statt"), although its news menu stops in 2019.

## Changes the pages report
- **hallenflohmarkt-uster**: the organiser changed. "Wir haben den Flohmarkt Uster ab März 2026 vom Flohmi-Team Uster übernommen" (Brian's Flohmi, Andi und Brigitte Haussmann, brian-flohmi-uster@bluewin.ch).
- **hallenflohmarkt-hoelstein**: now run by the Marktverein Hölstein. The flyer says "65 Hallentische - 12 Aussentische", so some stalls are outdoors. Our setting value may need to be `both`. I did not record 77 as the stall count, because it counts tables, not sellers.
- **flohmarkt-stuecki-basel**: the text says "finden sämtliche Stände im Innenbereich statt", but the booking API's price list for 18 Oct 2026 also offers an "AUSSENFLOHMIPLATZ". Check before trusting the indoor-only claim.
- **flohschanze-hamburg**: "Neben den offenen Ständen im Freien bietet die Flohschanze auch überdachte Stellflächen unter Pavillons oder in der Halle". Our venue says only "Alte Rinderschlachthalle", so the setting may need to be `both`.
- **grenzueberschreitender-flohmarkt-kreuzlingen-konstanz**: it returns in 2026 "an einem neuen Standort" (Seestrasse / Klein Venedig), on 13–14 June 2026. That matches our venue.

## JS-only or unreadable
- **flohmarkt-rueticenter-pratteln**, **flohmarkt-stuecki-basel** (flohmarktkoenig.ch): the pages are JavaScript-only. I read the text from the site's own API (`api.flohmarktkoenig.ch/v1/locations`, `/v1/events`). Nothing in it was usable for the missing fields. Rüti is a car-park roof on three floors ("Flohmi ufm Dach", "Auf drei Stockwerken"), so I left its setting empty.
- **flohmi-spass-heimstrasse-bern** (Facebook) and **hinterhof-flohmarkt-st-gallen** (Instagram) cannot be read without a login.

## Worth a second look
- **flohmarkt-riem-muenchen**, **frankfurter-flohmarkt-osthafen/schaumainkai**, **gross-flohmarkt-messplatz-karlsruhe**: `mixed` rests on rules clauses about commercial sellers ("Der Stand eines gewerblichen Anbieters ist … zu kennzeichnen"). They show traders are admitted next to the private sellers, but none of the pages says "Privat und Gewerbe" in one sentence.
- **flohmarkt-stadtbibliothek-aarau**: the library sells its own discarded books, CDs and DVDs. It is not a market with outside sellers, so I left seller_mix empty.
- **flohmarkt-rudolf-steiner-schule-basel**: "keine externen Stände", so the school runs all 26 stalls itself. I left seller_mix empty.
- **flohmi-muttenz**: a town-wide yard sale. Setting is `both` because people sell "vor dem eigenen Haus, im Garten, im Haus, in der Wohnung". The next date on the site is 12 Sept 2027.
