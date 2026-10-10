-- The months each market runs, read from its own rhythm line (20261010120000_pages_without_a_date.sql).
-- "April to October" is 4–10; an annual market is its one month — named in the rhythm, or else the
-- month of its own edition (next if dated, last if not), which is what "Usually in September" says.
-- Hand-corrected where the rhythm misleads a pattern: Bonn and Saxon are monthly, not annual; Halle
-- is closed June to August, so it runs September to May; Oetwil skips only July; Kreisflohmi runs
-- May to September across the districts. Rhythms that name no months ("twice a year", "occasionally")
-- stay null, and their pages say when the market last ran instead.

do $$
begin
  if not exists (select 1 from public.markets) then return; end if;

  create temporary table season (slug text primary key, season_from smallint, season_to smallint) on commit drop;
  insert into season values
  ($t$alpin-flohmi-basel$t$, 4, 4),  -- Once a year, in April
  ($t$alpin-flohmi-bern$t$, 10, 10),  -- Once a year, in October
  ($t$alpin-flohmi-bulle$t$, 11, 11),  -- Once a year, in November
  ($t$alpin-flohmi-interlaken$t$, 10, 10),  -- Once a year, in October
  ($t$alpin-flohmi-lausanne$t$, 11, 11),  -- Once a year, in November
  ($t$alpin-flohmi-luzern$t$, 11, 11),  -- Once a year, in November
  ($t$alpin-flohmi-st-gallen$t$, 5, 5),  -- Once a year, in May
  ($t$alpin-flohmi-yverdon-les-bains$t$, 10, 10),  -- Once a year, in October
  ($t$alpin-flohmi-zuerich$t$, 10, 10),  -- Once a year, in October
  ($t$altstadtflohmarkt-hannover$t$, 3, 10),  -- Every Saturday, March to October
  ($t$antik-und-troedelmarkt-messe-halle-saale$t$, 9, 5),  -- Monthly on a Saturday, in December Saturday and Sunday; closed June to August
  ($t$antikflohmarkt-trabrennbahn-karlshorst-berlin$t$, 4, 11),  -- Once a month, April to November
  ($t$bourse-jouets-collection-fribourg-granges-paccot$t$, 2, 2),  -- One Saturday in February
  ($t$bourse-jouets-collection-geneve-le-grand-saconnex$t$, 1, 1),  -- One Sunday in January
  ($t$bourse-photo-vieux-papiers-fribourg-granges-paccot$t$, 2, 2),  -- One Sunday in February
  ($t$bourse-vinyls-cd-geneve-le-grand-saconnex$t$, 1, 1),  -- One Sunday in January
  ($t$breitsch-maerit-bern$t$, 6, 6),  -- Once a year, in June
  ($t$brocante-de-carouge-geneve$t$, 3, 12),  -- Every 1st Sunday, March to December
  ($t$brocante-de-fribourg-granges-paccot$t$, 11, 11),  -- One weekend in November
  ($t$brocante-de-la-gruyere-bulle$t$, 1, 1),  -- Once a year, a weekend at the end of January
  ($t$brocante-de-misery$t$, 9, 9),  -- Once a year, a weekend in September
  ($t$brocante-de-rive-nyon$t$, 8, 8),  -- Once a year, on the last weekend of August
  ($t$brocante-lutry$t$, 6, 6),  -- Once a year, in June.
  ($t$brocante-vide-grenier-55-plus-ecublens$t$, 11, 11),  -- One Saturday in November
  ($t$brocantissima-morges$t$, 12, 12),  -- Once a year, a weekend at the start of December
  ($t$chilbi-flohmarkt-glarus$t$, 8, 8),  -- Once a year, a Saturday in August, during the Chilbi fair
  ($t$coffre-ouvert-monthey$t$, 4, 11),  -- First Saturday of the month, April to November
  ($t$coffre-ouvert-oron$t$, 10, 10),  -- Once a year, a Sunday in October
  ($t$coffre-ouvert-villeneuve$t$, 3, 11),  -- The 2nd and last Saturday of the month, March to November.
  ($t$enter-modellbau-boerse-derendingen$t$, 12, 12),  -- One weekend in December
  ($t$enter-retrotechnikmarkt-derendingen$t$, 11, 11),  -- One weekend in November
  ($t$enter-vinyl-film-buecher-boerse-derendingen$t$, 2, 2),  -- One Sunday in February
  ($t$fete-de-la-brocante-le-landeron$t$, 9, 9),  -- Once a year, the last weekend of September
  ($t$fete-livres-disques-ouchy-lausanne$t$, 4, 10),  -- Selected Sundays, April to October
  ($t$flodo-flohmarkt-solothurn$t$, 8, 8),  -- Once a year, a Saturday in August
  ($t$floh-sammler-antikmarkt-grabs$t$, 3, 11),  -- Monthly, on a Saturday, March to November
  ($t$floh-sammler-antikmarkt-romanshorn$t$, 3, 11),  -- Monthly, on a Saturday, March to November
  ($t$floh-und-antiquitaetenmarkt-schadaumaerit-thun$t$, 3, 11),  -- Every third Sunday, March to November
  ($t$floh-und-troedelmarkt-buergerpark-saarbruecken$t$, 3, 11),  -- Once a month on the second Saturday, March to November
  ($t$flohmaert-zueg-ond-sache-beromuenster$t$, 9, 9),  -- Once a year, the last Saturday of September, during the Kilbi fair
  ($t$flohmarkt-aarau$t$, 3, 11),  -- Every first Saturday, March to November
  ($t$flohmarkt-alte-holzbruecke-olten$t$, 3, 10),  -- Last Saturday of the month, March to October
  ($t$flohmarkt-am-see-wollishofen-zuerich$t$, 4, 10),  -- Every 1st Sunday of the month, April to October
  ($t$flohmarkt-arlesheim$t$, 8, 8),  -- Once a year, a Saturday in August
  ($t$flohmarkt-barfuesserplatz-basel$t$, 1, 10),  -- 2nd and 4th Wednesday of the month, January to early October
  ($t$flohmarkt-biel$t$, 4, 10),  -- Twelve Saturdays from April to October
  ($t$flohmarkt-bruderholzallee$t$, 9, 9),  -- Once a year, usually late summer or early autumn
  ($t$flohmarkt-buerkliplatz-zuerich$t$, 5, 10),  -- Every Saturday, May to October
  ($t$flohmarkt-burstelpark-frauenfeld$t$, 4, 10),  -- 2nd Saturday of the month, April to October
  ($t$flohmarkt-dampfzentrale-bern$t$, 4, 9),  -- Last Sunday of the month, April to September
  ($t$flohmarkt-dorfplatz-horgen$t$, 5, 10),  -- Five Saturdays a year, May to October
  ($t$flohmarkt-dreispitzpark-kreuzlingen$t$, 3, 11),  -- First Saturday of the month, March to November (not August)
  ($t$flohmarkt-eiszentrum-luzern$t$, 4, 4),  -- Once a year, in April.
  ($t$flohmarkt-emmen$t$, 4, 10),  -- Once a month on selected Saturdays, April to October
  ($t$flohmarkt-flugplatz-buttwil$t$, 3, 10),  -- 3rd Sunday of the month, March to October
  ($t$flohmarkt-gallusplatz-stgallen$t$, 4, 11),  -- Every first Saturday, April to November
  ($t$flohmarkt-glarus$t$, 5, 5),  -- Once a year, the Saturday before the Landsgemeinde (early May)
  ($t$flohmarkt-glattbrugg$t$, 11, 11),  -- One Saturday in November
  ($t$flohmarkt-hofmattplatz-kriens$t$, 4, 11),  -- Twice a month, April to November, usually on Saturdays
  ($t$flohmarkt-innenstadt-kiel$t$, 4, 10),  -- On several Sundays between April and October
  ($t$flohmarkt-kloten$t$, 9, 9),  -- Once a year
  ($t$flohmarkt-marktplatz-amriswil$t$, 4, 11),  -- Monthly, on a Saturday, April to November (not in July)
  ($t$flohmarkt-minigolf-lido-luzern$t$, 5, 9),  -- Monthly in the warm season (May to September)
  ($t$flohmarkt-mosergarten-schaffhausen$t$, 4, 10),  -- Every first Saturday, April to October, in good weather only
  ($t$flohmarkt-muensterplatz-bern$t$, 5, 10),  -- Every 3rd Saturday, May to October
  ($t$flohmarkt-oetwil-am-see$t$, 3, 10),  -- Last Saturday of the month, March to June and August to October; no market in July
  ($t$flohmarkt-rathausplatz-wettingen$t$, 3, 11),  -- Monthly, March to November, 06:00–16:00
  ($t$flohmarkt-rheinaue-bonn$t$, 4, 10),  -- One Saturday a month, April to October
  ($t$flohmarkt-riem-muenchen$t$, 4, 11),  -- Selected Saturdays, April to November
  ($t$flohmarkt-rudolf-steiner-schule-basel$t$, 4, 4),  -- Once a year, usually in April
  ($t$flohmarkt-rueticenter-pratteln$t$, 2, 11),  -- About ten Sundays a year, February to November (not August)
  ($t$flohmarkt-schlieren-herbstmarkt$t$, 9, 9),  -- Once a year
  ($t$flohmarkt-seeplatz-waedenswil$t$, 4, 10),  -- Seven Saturdays, April to October, usually the first
  ($t$flohmarkt-st-mangen-quartier$t$, 3, 10),  -- Every last Saturday, March to October
  ($t$flohmarkt-theaterplatz-baden$t$, 5, 10),  -- Monthly on a Saturday, May to October, 09:00–16:00
  ($t$flohmarkt-uster-stadthausplatz$t$, 4, 10),  -- First Saturday of the month, April to October
  ($t$flohmarkt-weinfelden$t$, 3, 10),  -- Last Saturday of the month, March to October (not September)
  ($t$flohmi-bullingerhof-zuerich$t$, 3, 10),  -- Last Saturday of the month, March to October
  ($t$flohmi-muttenz$t$, 9, 9),  -- Once a year, one Sunday in September
  ($t$flohmi-spass-heimstrasse-bern$t$, 4, 4),  -- Once a year, in April
  ($t$flosch-schwamendingen-zuerich$t$, 2, 11),  -- Usually the last Saturday of the month, February–November
  ($t$folie-flea-market-lausanne$t$, 4, 4),  -- Once a year, in April.
  ($t$gaenggali-markt-chur$t$, 4, 12),  -- Usually the first Saturday, April to December
  ($t$grenzueberschreitender-flohmarkt-kreuzlingen-konstanz$t$, 6, 6),  -- Once a year, a weekend in June, 24 hours
  ($t$grosser-flohmarkt-thun$t$, 6, 11),  -- Several Sundays a year, June to November
  ($t$hallenflohmarkt-arboldswil$t$, 10, 10),  -- One Saturday in October, with an autumn market
  ($t$hallenflohmarkt-uster$t$, 10, 4),  -- Monthly, on a Sunday, October to April
  ($t$herbst-flohmarkt-richterswil$t$, 9, 9),  -- Once a year, the last Saturday of September
  ($t$hyper-bazar-la-chaux-de-fonds$t$, 4, 9),  -- Last Saturday of the month, April to September
  ($t$jenaer-troedelmarkt-jena$t$, 2, 10),  -- Roughly monthly on a Saturday, February to October
  ($t$kinder-flohmi-schloss-arbon$t$, 10, 10),  -- Once a year, in October
  ($t$kinderflohmarkt-chur$t$, 9, 9),  -- Once a year, a Saturday in September
  ($t$kinderflohmarkt-uster$t$, 7, 7),  -- Once a year
  ($t$kinderflohmarkt-winterthur-altstadt$t$, 7, 7),  -- Once a year
  ($t$kofmehl-flohmi-solothurn$t$, 9, 9),  -- Once a year, a Saturday in September
  ($t$kreisflohmi-zuerich$t$, 5, 9),  -- One Saturday per city district, May to September
  ($t$krempelmarkt-rheinufer-mainz$t$, 3, 11),  -- Roughly every other Saturday, March to November
  ($t$kulturflohmarkt-museum-der-arbeit-hamburg$t$, 4, 10),  -- Seven times a year, from Easter Monday to 3 October
  ($t$les-puces-du-loup-lausanne$t$, 6, 6),  -- Once a year, in June. First held in 2026.
  ($t$luzerner-flohmarkt-voegeligaertli$t$, 5, 10),  -- Every Saturday, May to October
  ($t$marche-aux-puces-archipel-sion$t$, 3, 11),  -- First Sunday of the month, March to November (not August)
  ($t$marche-aux-puces-coupole-biel$t$, 10, 3),  -- About every six weeks, on Sundays, October to March
  ($t$marche-aux-puces-fribourg-cathedrale$t$, 3, 11),  -- Every first Saturday, March to November
  ($t$marche-aux-puces-fribourg-place-python$t$, 3, 11),  -- Every last Saturday, March to November
  ($t$marche-aux-puces-jardin-anglais-neuchatel$t$, 3, 10),  -- Once or twice a month, on Saturdays, March to October
  ($t$mercatino-lusso-vintage-lugano$t$, 11, 11),  -- One weekend in November
  ($t$mercatino-pulci-ragazzi-locarno$t$, 10, 10),  -- Once a year, a Saturday in October
  ($t$metalboerse-schweiz-zofingen$t$, 11, 11),  -- One Saturday in November
  ($t$musikflohmarkt-markthalle-basel$t$, 12, 12),  -- Once a year, in December
  ($t$nostalgie-flohmarkt-worb-bern$t$, 3, 11),  -- Second Sunday of the month, March to November
  ($t$nowkoelln-flowmarkt-berlin$t$, 3, 11),  -- Every other Sunday, March to November
  ($t$quartier-flohmarkt-areal-bach$t$, 4, 10),  -- Selected Sundays, April to October 2026, in dry weather
  ($t$quartierflohmarkt-bachletten$t$, 4, 4),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-bottmingen$t$, 8, 8),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-breite-st-alban$t$, 6, 6),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-gellert$t$, 9, 9),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-gotthelf-iselin$t$, 5, 5),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-gundeli$t$, 5, 5),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-hirzbrunnen$t$, 4, 4),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-innerstadt$t$, 8, 8),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-klybeck-kleinhueningen$t$, 9, 9),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-lehenmatt$t$, 6, 6),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-matthaeus$t$, 6, 6),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-neubad$t$, 8, 8),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-pratteln-gehrenacker$t$, 4, 4),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-riehen-grenzacherweg$t$, 6, 6),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-riehen-niederholz$t$, 4, 4),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-rosental-erlenmatt$t$, 8, 8),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-saeli-bruch-obergueetsch-luzern$t$, 9, 9),  -- Once a year, a Sunday in September
  ($t$quartierflohmarkt-spalen-holbein$t$, 6, 6),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-st-johann$t$, 8, 8),  -- Once a year, between April and October.
  ($t$quartierflohmarkt-wettstein$t$, 9, 9),  -- Once a year, between April and October.
  ($t$quartierflohmi-neu-allschwil$t$, 9, 9),  -- Once a year, in September
  ($t$quartierflohmi-reinach-nord$t$, 9, 9),  -- Once a year, a Sunday in late summer
  ($t$rosenhof-markt-zuerich$t$, 3, 11),  -- Every Saturday, March to November
  ($t$saeuliaemtler-flohmarkt-affoltern$t$, 3, 10),  -- The last Saturday of the month, March to October (except July).
  ($t$slow-fashion-market-lausanne$t$, 10, 10),  -- Once a year, in October.
  ($t$strassenflohmarkt-rafz$t$, 9, 9),  -- Once a year
  ($t$subiger-dorf-flohmarkt$t$, 5, 5),  -- Once a year, usually late May
  ($t$svuotacantine-muralto$t$, 6, 6),  -- Once a year, a Saturday evening in June
  ($t$swiss-vintage-and-design-market-granges-paccot$t$, 3, 3),  -- One weekend in March
  ($t$troedelmarkt-alte-messe-leipzig$t$, 3, 11),  -- The first Sunday of the month, March to November
  ($t$vide-dressing-bains-payes-vevey$t$, 4, 4),  -- Once a year, in spring.
  ($t$vide-dressing-flon-lausanne$t$, 4, 11),  -- The first Saturday of the month, April to November (except August).
  ($t$vide-grenier-bern-altstadt$t$, 4, 4),  -- Once a year, in April
  ($t$vide-grenier-brocante-les-brenets$t$, 11, 11),  -- One Saturday in November
  ($t$vide-grenier-echichens$t$, 11, 11),  -- Once a year, usually in November
  ($t$vide-grenier-ecobroc-saxon$t$, 3, 10),  -- One Saturday a month, March to October
  ($t$vide-grenier-familles-renens$t$, 10, 10),  -- Once a year, in autumn
  ($t$vide-grenier-mathod$t$, 10, 10),  -- Once a year, a Saturday in October
  ($t$vide-grenier-onex$t$, 9, 9),  -- Once a year, a Sunday in September
  ($t$vide-grenier-place-de-milan-lausanne$t$, 6, 6),  -- Once a year, in June.
  ($t$vide-grenier-prilly$t$, 10, 10),  -- Once a year, in autumn, on the Journée de la durabilité
  ($t$vide-grenier-villars-tiercelin$t$, 11, 11),  -- One Sunday in November
  ($t$wbz-flohmarkt-reinach$t$, 10, 10)  -- Once a year, late October (four days)
  ;

  update public.markets m
     set season_from = s.season_from, season_to = s.season_to
    from season s
   where m.slug = s.slug;

  if (select count(*) from public.markets m join season s using (slug)) <> (select count(*) from season) then
    raise exception $m$a season names a market that does not exist$m$;
  end if;
end
$$;
