# Round 2, group 5: notes

- shoppi-flohmi-spreitenbach: flohmarktkoenig.ch only works with JavaScript (an app with no static text), so nothing could be quoted.
- slow-fashion-market-lausanne: the website is a Facebook event, so nothing could be read. It needs an organiser site.
- vide-dressing-bains-payes-vevey: the website is Instagram, so nothing could be read.
- vide-grenier-sallaz-lausanne: the website is vide-greniers.org, a French listing site that only works with JavaScript. It is not the organiser.
- quartierflohmarkt-pratteln-gehrenacker and vide-grenier-echichens: the town event calendars load by JavaScript. The HTML has no flea-market entry.
- talkessel-flohmarkt-seewen: the Preise page says "Wir sind neu in einer Halle" (we are now in a hall). If our setting says outdoor, it is out of date.
- troedelmarkt-100-5-arena-aachen: the organiser's own data says "Samstags Trödelmarkt vor der 100,5 Arena", so the market is outdoors in front of the arena, not inside the ice rink our venue name suggests. The rain fact relies on this. The text is in hoefges-troedelmarkt.com/wp-json/ts-events/v1/events, because the Termine page is drawn by JavaScript.
- xxl-flohmarkt-messe-kassel: the page says "Markt ist auf dem Freigelände und in der Halle", which means `both`. Check our setting.
- romeo-hallenflohmarkt-muenchwilen: recorded as `both` because the 2026 exhibitor rules price hall stalls and "Aussenstand" separately, even though the name says Hallenflohmarkt (indoor market).
- rosenhof-markt-zuerich: the 2026 exhibitor list is handmade jewellery, candles and food, with no second-hand goods. It is a craft market, not a flea market.
- svuotacantine-muralto: the organiser's 2026 programme lists only Ascona, S. Antonino and Giubiasco, plus a separate Biasca page. Muralto appears only in the galleries of past events.
- svuotacantine-biasca: rain_policy is recorded as `decided_on_the_day` because the page gives a backup date "in caso di meteo sfavorevole" (in bad weather: 18 Oct moves to 25 Oct 2026). Drop it if a backup date doesn't fit that value.
- vide-grenier-lutry: "pas de report en cas de mauvais temps" (no postponement in bad weather) could mean it runs or that it is called off. Left out.
- wbz-flohmarkt-reinach: this is a charity sale run by the WBZ itself, with goods donated and collected by volunteers. There are no exhibitors, so stall_count and seller_mix don't apply.
- vide-grenier-mathod: mathod.ch lists only the 2023 and 2024 editions.
- vrd-flohmarkt-riehen: the source is the Riehen town event calendar (the listed website). The organiser's site riehenerdorfmarkt.ch also gives "Dorfplatz / Webergässchen".
- vide-grenier-bern-altstadt: `mixed` is inferred because shop owners as well as residents may hold stalls.
