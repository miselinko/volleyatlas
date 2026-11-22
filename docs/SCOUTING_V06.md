# VolleyAtlas v0.6 — scouting-first release

## Interfejs
Novi urednički sport-data izgled: neutralni tonovi, jasne skautske tabele, direktno otvaranje utakmica i igrača; bez dekorativnih "AI" kartica. Na telefonu postoji stalna donja navigacija, dovoljno kontrastne aktivne stavke i horizontalno pomeranje široke statističke tabele.

## Teme
Samo svetla/tamna, prekidač u zaglavlju. Pamti se u `localStorage`. Ne postoji automatski/sistemski režim.

## Izvori kompletnih zapisnika
- LNV D1M042: Tours – St Nazaire, 13.11.2026: https://lnv.fr/pdf/2026/DataVolley/Men/D1M042-2027.pdf
- LNV D1M036: Sète – Royan, 13.11.2026: https://lnv.fr/pdf/2026/DataVolley/Men/D1M036-2027.pdf
- LNV D1M032: Royan – Cannes, 07.11.2026: https://www.lnv.fr/pdf/2026/DataVolley/Men/D1M032-2027.pdf
- PLS AZS2627_PLS_07: Olsztyn – GKS, 20.11.2026: https://www.tauronliga.pl/games/action/stats/id/1104850/tour/53/nocookies/1.html

Provereni agregati: poeni igrača == napad + as + blok, timski zbirovi == zbir aktivnih igrača, rezultat se poklapa sa setovima. Validacija se pokreće pre svakog frontend builda.

Ostali mečevi u uzorku ostaju `result-only` ili `partial-player-points`.
Sajt ne sme da tvrdi da ima sve mečeve niti sezonske brojke.
2026/27 poljska muška liga zvanično se zove TAURON Liga (ranije PlusLiga), ženska TAURON Liga Kobiet.

## Sledeći podaci i operacije
PDF parser sa staging skladištem, provider match IDs i istorijom izmena; prava i uslovi pristupa zvaničnim podacima moraju biti provereni pre masovnog automatizovanog preuzimanja. Posebna obrada za italijanski HTML, francuski PDF i poljski VolleyStation PDF.
