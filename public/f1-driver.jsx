/* ============================================================
   F1 DELTA — driver page (split-tier, light reference template)
   Renders into #root. Public page: free facts for everyone,
   Pro teammate H2H behind a fade gate. Tier is decided by the
   server (/api/driver?d=) from the token; this file reacts to
   data.pro. Standalone light styling — does not use the dark
   site CSS. Self-contained (own hooks, own chrome).
   ============================================================ */
const { useState, useEffect } = React;

const TEAM = {
  red_bull:"#3671C6", toro_rosso:"#4562FF", rb:"#6692FF", ferrari:"#E8002D",
  mclaren:"#FF8000", mercedes:"#27F4D2", williams:"#64C4FF", aston_martin:"#229971",
  alpine:"#0093CC", haas:"#B6BABD", sauber:"#52E252", renault:"#FFF500",
  racing_point:"#F596C8", force_india:"#F596C8", lotus_f1:"#FFB800", brawn:"#B8FD6E",
};
const ac = (id) => TEAM[id] || "#9aa0ab";
const fmt = (n) => (n % 1 === 0 ? String(n) : n.toFixed(1));

const TOKEN_KEY = "f1delta_token"; // matches f1-access.js
function readToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }

const RTF1 = {
  "lando-norris": [
    ["Karting", "Won the 2013 CIK-FIA KF-Junior European Championship (and the International Super Cup and WSK Euro Series); 2014 CIK-FIA World KF Championship with Ricky Flynn Motorsport, becoming the youngest CIK-FIA KF World champion at the time."],
    ["Junior single-seaters", "2014 Ginetta Junior Championship (3rd, Rookie Cup); 2015 MSA Formula/British F4 champion with Carlin (8 wins); 2016 Toyota Racing Series champion, Eurocup Formula Renault 2.0 champion and Formula Renault 2.0 NEC champion; 2017 FIA F3 European Championship champion with Carlin (9 wins); 2018 FIA F2 runner-up with Carlin (won the season opener in Bahrain)."],
    ["Academy", "McLaren young driver programme from 2017; McLaren test & reserve driver in 2018."],
    ["Highlights", "2016 McLaren Autosport BRDC Award winner; won F4, Formula Renault and F3 titles in successive years."],
    ["F1 debut", "2019 with McLaren, partnering Carlos Sainz."],
  ],
  "oscar-piastri": [
    ["Karting", "Began karting in Australia in 2011; moved to Europe with Ricky Flynn Motorsport in 2015–16."],
    ["Junior single-seaters", "2016 Formula 4 UAE (part, 6th); 2017 British F4 runner-up with TRS Arden (6 wins); 2019 Formula Renault Eurocup champion with R-ace GP; 2020 FIA F3 champion with Prema (rookie); 2021 FIA F2 champion with Prema (rookie)."],
    ["Academy", "Renault Sport Academy/Alpine Academy from January 2020 to 2022; managed by Mark Webber; Alpine and McLaren reserve driver in 2022."],
    ["Highlights", "Only driver in history to win Formula Renault, F3 and F2 titles in three successive seasons; sixth driver to win F2 as a rookie."],
    ["F1 debut", "2023 with McLaren, following a contract dispute between Alpine and McLaren resolved in McLaren's favour by the FIA Contract Recognition Board."],
  ],
  "charles-leclerc": [
    ["Karting", "French and Monégasque karting titles; 2011 CIK-FIA KF3 World Cup, Academy Trophy and ERDF Junior Kart Masters; 2013 runner-up to Max Verstappen in the CIK-FIA World KZ Championship. Managed from 2011 by Nicolas Todt."],
    ["Junior single-seaters", "2014 Formula Renault 2.0 Alps runner-up (and Junior champion) with Fortec; 2015 FIA F3 European Championship 4th (rookie) with Van Amersfoort; 2016 GP3 Series champion with ART (rookie); 2017 FIA F2 champion with Prema (rookie)."],
    ["Academy", "Ferrari Driver Academy from 2016; Ferrari development and Haas test driver in 2016–17."],
    ["Highlights", "Won GP3 and F2 titles in consecutive rookie seasons; youngest GP3 champion at the time."],
    ["F1 debut", "2018 with Sauber (Alfa Romeo Sauber)."],
  ],
  "lewis-hamilton": [
    ["Karting", "British cadet and junior karting champion through the 1990s; 2000 European Formula A champion and World Cup winner; signed to the McLaren–Mercedes young driver support programme in 1998, aged 13."],
    ["Junior single-seaters", "2001–03 British Formula Renault (champion in 2003 with Manor); 2004 F3 Euro Series 5th with Manor; 2005 F3 Euro Series champion with ASM (15 of 20 wins) plus the Marlboro Masters of F3; 2006 GP2 champion with ART (rookie)."],
    ["Academy", "McLaren–Mercedes young driver support programme from 1998."],
    ["Highlights", "Dominant 2005 F3 season; rookie GP2 champion."],
    ["F1 debut", "2007 with McLaren, partnering reigning champion Fernando Alonso."],
  ],
  "george-russell": [
    ["Karting", "Multiple British karting titles; CIK-FIA KF3 European Champion in 2011 and 2012 — the first driver to defend the Junior European title."],
    ["Junior single-seaters", "2014 BRDC Formula 4 champion with Lanan (rookie), alongside a Formula Renault 2.0 Alps campaign; 2015–16 FIA F3 European Championship (3rd in 2016 with Hitech); 2017 GP3 champion with ART (rookie); 2018 FIA F2 champion with ART (rookie), beating Lando Norris by 86 points."],
    ["Academy", "Mercedes Junior Team from January 2017; Mercedes and Force India F1 reserve and FP1 outings."],
    ["Highlights", "2014 McLaren Autosport BRDC Award; won GP3 and F2 in consecutive rookie seasons."],
    ["F1 debut", "2019 with Williams, partnering Robert Kubica."],
  ],
  "kimi-antonelli": [
    ["Karting", "Extensive karting titles; back-to-back European Championship (OK class) wins in 2020 and 2021; joined the Mercedes Junior Team in 2019, aged 12."],
    ["Junior single-seaters", "2021 Italian F4 (part) with Prema; 2022 Italian F4 and ADAC German F4 champion with Prema; 2023 Formula Regional Middle East and Formula Regional European (FRECA) champion; 2024 FIA F2 with Prema (6th, two wins — the Silverstone sprint and Hungary feature)."],
    ["Academy", "Mercedes Junior Team from 2019."],
    ["Highlights", "Promoted directly from FRECA to F2, skipping FIA F3; became the youngest multiple race winner in F2 history at the time."],
    ["F1 debut", "2025 with Mercedes, replacing Lewis Hamilton, aged 18 years 6 months 20 days — the third-youngest driver ever to start an F1 race."],
  ],
  "max-verstappen": [
    ["Karting", "Won numerous karting titles culminating in a record-breaking 2013 season (world and European KZ honours)."],
    ["Junior single-seaters", "2014 Florida Winter Series (winning races on debut); 2014 FIA F3 European Championship 3rd (rookie) with Van Amersfoort, scoring the most wins of any driver that year (10)."],
    ["Academy", "Joined the Red Bull Junior Team in August 2014, turning down a Mercedes offer."],
    ["Highlights", "Made three FP1 appearances in 2014 starting at the Japanese GP, becoming the youngest person to participate in an F1 weekend."],
    ["F1 debut", "2015 with Toro Rosso, partnering Carlos Sainz. Became the youngest driver to start an F1 race at the 2015 Australian GP, aged 17 years 166 days."],
  ],
  "isack-hadjar": [
    ["Karting", "Began karting in 2012; progressed to international level in 2017; contested the 2018 Karting World Championship."],
    ["Junior single-seaters", "2019 French F4 (7th); 2020 French F4 3rd with the FFSA Academy; 2021 Formula Regional European 5th with R-ace GP (won the Monaco round) plus F3 Asian; 2022 FIA F3 4th with Hitech (three wins) plus Formula Regional Asian; 2023 FIA F2 with Hitech (14th); 2024 FIA F2 runner-up with Campos, losing to Gabriel Bortoleto."],
    ["Academy", "Red Bull Junior Team from 2022."],
    ["Highlights", "Nicknamed \"le Petit Prost\" in the French media; took the 2024 F2 title fight to the final round."],
    ["F1 debut", "2025 with Racing Bulls (promoted to Red Bull Racing for 2026)."],
  ],
  "alexander-albon": [
    ["Karting", "Began karting aged eight; won the junior World Cup and European titles in 2010; runner-up to Nyck de Vries in the 2011 World Championship."],
    ["Junior single-seaters", "2012–14 Eurocup Formula Renault 2.0 (3rd in 2014); 2015 FIA F3 European Championship with Signature; 2016 GP3 Series runner-up to Charles Leclerc with ART; 2017 FIA F2 with ART (10th); 2018 FIA F2 3rd with DAMS (four wins)."],
    ["Academy", "Red Bull Junior Team in 2012 (dropped after one year); later supported by the Lotus junior scheme; rejoined Red Bull for 2019."],
    ["Highlights", "Won the 2010 junior World Cup; battled Russell and Norris for the 2018 F2 title."],
    ["F1 debut", "2019 with Toro Rosso (had signed a Formula E deal with Nissan e.dams before being called up)."],
  ],
  "carlos-sainz-jr": [
    ["Karting", "Asia-Pacific KF3 champion in 2008; Monaco Kart Cup KF3 winner in 2009; runner-up in the European and Spanish KF3 championships."],
    ["Junior single-seaters", "2010 Formula BMW Europe; 2011 Formula Renault 2.0 NEC champion with Koiranen and Eurocup runner-up to Robin Frijns; 2012 British F3, F3 Euro Series and FIA European F3 with Carlin; 2013 GP3 Series 10th with Arden; 2014 Formula Renault 3.5 Series champion with DAMS (seven wins, a series record at the time)."],
    ["Academy", "Red Bull Junior Team from 2010."],
    ["Highlights", "Dominant 2014 Formula Renault 3.5 title; son of two-time World Rally Champion Carlos Sainz."],
    ["F1 debut", "2015 with Toro Rosso, partnering Max Verstappen."],
  ],
  "fernando-alonso": [
    ["Karting", "Multiple Spanish karting titles in the 1990s; 1996 World Junior and CIK-FIA Five Continents karting honours."],
    ["Junior single-seaters", "1999 Euro Open by Nissan champion with Campos (six wins); 2000 International F3000 4th with Team Astromega (won at Spa-Francorchamps)."],
    ["Academy", "Managed by Flavio Briatore; Minardi test/reserve driver in 2000; Renault test driver in 2002."],
    ["Highlights", "Won the Nissan series at the first attempt; took an F3000 win at Spa aged 19."],
    ["F1 debut", "2001 with Minardi."],
  ],
  "lance-stroll": [
    ["Karting", "Began karting aged 10; numerous North American titles; Quebec Rookie of the Year (2008) and Driver of the Year (2009)."],
    ["Junior single-seaters", "2014 Italian F4 champion with Prema (rookie); 2015 Toyota Racing Series champion with M2; 2015 F3 European Championship 5th with Prema; 2016 FIA F3 European Championship champion with Prema (14 wins, 187 points clear of runner-up Maximilian Günther)."],
    ["Academy", "Ferrari Driver Academy from 2010 to 2015; Williams test/development driver from 2016."],
    ["Highlights", "Dominant 2016 European F3 title; reached F1 in roughly two years of car racing. His podium at the 2017 Azerbaijan GP (aged 18 years 239 days) made him the youngest-ever rookie F1 podium finisher."],
    ["F1 debut", "2017 with Williams, partnering Felipe Massa."],
  ],
  "pierre-gasly": [
    ["Karting", "Raced karts from 2006 across France and Europe."],
    ["Junior single-seaters", "2011 French F4 3rd with the FFSA Academy; 2013 Formula Renault Eurocup champion with Tech 1; 2014 Formula Renault 3.5 runner-up to Carlos Sainz with Arden; 2015 GP2 8th with DAMS; 2016 GP2 Series champion with Prema; 2017 Super Formula runner-up with Team Mugen (losing the title by half a point after the finale was cancelled by Typhoon Lan)."],
    ["Academy", "Red Bull Junior Team from 2014; Red Bull reserve driver from September 2015."],
    ["Highlights", "2016 GP2 champion; narrowly missed the 2017 Super Formula title."],
    ["F1 debut", "2017 with Toro Rosso at the Malaysian Grand Prix, replacing Daniil Kvyat."],
  ],
  "franco-colapinto": [
    ["Karting", "Began karting aged nine in Argentina; Argentine titles in 2016 and 2018; won the karting event at the 2018 Youth Olympic Games in Buenos Aires."],
    ["Junior single-seaters", "2018 F4 Spanish Championship (debut round) with Drivex; 2019 F4 Spanish champion with FA Racing by Drivex (11 wins); 2020 Formula Renault Eurocup 3rd and Toyota Racing Series 3rd; 2021 sportscars (LMP2 in WEC/ELMS/Asian Le Mans with G-Drive) plus Formula Regional European 6th with MP; 2022 FIA F3 with Van Amersfoort (9th); 2023 FIA F3 4th with MP, plus an F2 debut at the season finale; 2024 FIA F2 with MP (first F2 win at the Imola sprint)."],
    ["Academy", "Williams Driver Academy from January 2023 to 2024."],
    ["Highlights", "First Argentine F1 driver since Gastón Mazzacane in 2001."],
    ["F1 debut", "2024 with Williams at the Italian Grand Prix, replacing Logan Sargeant."],
  ],
  "liam-lawson": [
    ["Karting", "Began karting aged six in New Zealand; multiple national titles."],
    ["Junior single-seaters", "2015 NZ Formula First winner; 2016 NZ F1600 champion; 2017 Australian F4 runner-up; 2018 ADAC German F4 runner-up (won all three races at an Asian F3 round); 2019 Toyota Racing Series champion with M2, Euroformula Open runner-up, FIA F3 debut (11th with MP Motorsport); 2020 FIA F3 5th with Hitech; 2021 FIA F2 with Hitech (9th) and DTM runner-up with Red Bull AF Corse; 2022 FIA F2 3rd with Carlin; 2023 Super Formula runner-up with Mugen (winning on debut)."],
    ["Academy", "Red Bull Junior Team from 2019."],
    ["Highlights", "Won on debut in multiple categories — Formula First, F3, F2, DTM, and Super Formula."],
    ["F1 debut", "2023 with AlphaTauri at the Dutch Grand Prix, replacing the injured Daniel Ricciardo."],
  ],
  "arvid-lindblad": [
    ["Karting", "British Cadet champion in 2018; 2020 WSK Super Master Series (OKJ); 2021 WSK Euro Series and WSK Final Cup (OK)."],
    ["Junior single-seaters", "2022 Italian F4 debut with Van Amersfoort; 2023 Italian F4 3rd with Prema (also won the Macau F4 race); 2024 FIA F3 4th with Prema (rookie; youngest F3 race winner; Silverstone sprint+feature double); 2025 Formula Regional Oceania champion with M2; 2025 FIA F2 with Campos (youngest race winner in F2 history at the Jeddah sprint, aged 17 years 254 days, plus a feature win in Barcelona)."],
    ["Academy", "Red Bull Junior Team from 2021."],
    ["Highlights", "Youngest race winner in both FIA F3 and FIA F2 history; made F1 FP1 appearances for Red Bull in 2025 at the British GP, Mexican GP and Abu Dhabi."],
    ["F1 debut", "2026 with Racing Bulls — the only true rookie on the 2026 grid."],
  ],
  "esteban-ocon": [
    ["Karting", "French karting titles in the cadet and KF3 classes; runner-up to Max Verstappen in the 2011 WSK Euro Series."],
    ["Junior single-seaters", "2012–13 Eurocup Formula Renault 2.0 (3rd in 2013 with ART); 2014 FIA F3 European Championship champion with Prema (beating Verstappen and Tom Blomqvist); 2015 GP3 Series champion with ART; 2016 DTM with Mercedes/ART (partial season before his F1 call-up)."],
    ["Academy", "Gravity/Lotus junior scheme, then Mercedes Junior Team from 2015; Renault reserve in early 2016."],
    ["Highlights", "Back-to-back F3 (2014) and GP3 (2015) titles."],
    ["F1 debut", "2016 with Manor at the Belgian Grand Prix, replacing Rio Haryanto."],
  ],
  "oliver-bearman": [
    ["Karting", "British/IAME karting route; Kartmasters British GP winner in 2017; IAME international titles in 2019–20."],
    ["Junior single-seaters", "2020 ADAC German F4 7th with US Racing; 2021 Italian F4 and ADAC German F4 champion with Van Amersfoort — the first driver to win two F4 titles in a single year; 2022 FIA F3 3rd with Prema (rookie); 2023 FIA F2 6th with Prema (rookie; sprint+feature double in Baku)."],
    ["Academy", "Ferrari Driver Academy from late 2021; Ferrari and Haas reserve driver in 2024."],
    ["Highlights", "First driver to win the Italian and ADAC German F4 titles in the same year."],
    ["F1 debut", "2024 with Ferrari at the Saudi Arabian Grand Prix — a last-minute stand-in for Carlos Sainz (appendicitis), finishing 7th on debut. Later substituted for Kevin Magnussen at Haas before signing full-time."],
  ],
  "nico-hulkenberg": [
    ["Karting", "German Junior Kart champion in 2002; German Kart champion in 2003."],
    ["Junior single-seaters", "2005 Formula BMW ADAC champion with Josef Kaufmann (rookie); 2006 German F3 5th; 2006–07 A1 Grand Prix champion with A1 Team Germany (nine wins — the most successful driver in A1GP history); 2007 F3 Euro Series 3rd plus a Masters of F3 win; 2008 F3 Euro Series champion with ART; 2009 GP2 Series champion with ART (rookie)."],
    ["Academy", "Williams F1 test driver from 2007 to 2009."],
    ["Highlights", "Won a title in essentially every junior series he entered; rookie GP2 champion."],
    ["F1 debut", "2010 with Williams; took a shock pole position at the 2010 Brazilian GP."],
  ],
  "gabriel-bortoleto": [
    ["Karting", "Brazilian karting from 2011; finished 3rd in the 2018 OK-Junior European and World Championships."],
    ["Junior single-seaters", "2020 Italian F4 5th with Prema (won at Mugello); 2021–22 Formula Regional European (FRECA) — 6th in 2022 with R-ace GP (two wins); 2023 FIA F3 champion with Trident (rookie); 2024 FIA F2 champion with Invicta (rookie)."],
    ["Academy", "McLaren Driver Development Programme from October 2023 to 2024; managed by Fernando Alonso's A14 Management."],
    ["Highlights", "Won F3 and F2 in consecutive rookie seasons. At the 2024 Monza feature race became the first driver to win from last on the grid in F2, starting P22 and winning by 9.4 seconds."],
    ["F1 debut", "2025 with Sauber, ahead of the team's transition to Audi."],
  ],
  "sergio-perez": [
    ["Karting", "Began karting aged six in Mexico; multiple national titles; backed early by Escudería Telmex."],
    ["Junior single-seaters", "2004 Skip Barber National (USA); 2005–06 Formula BMW ADAC (6th in 2006); 2007 British F3 National Class champion with T-Sport; 2008 British F3 International Class 4th; 2009 GP2 12th with Arden; 2010 GP2 runner-up with Barwa Addax (five wins), behind Pastor Maldonado."],
    ["Academy", "Ferrari Driver Academy from October 2010 to 2012."],
    ["Highlights", "2007 British F3 National Class title; 2010 GP2 runner-up."],
    ["F1 debut", "2011 with Sauber — the first Mexican in F1 since Héctor Rebaque."],
  ],
  "valtteri-bottas": [
    ["Karting", "Karting from age six; competed in the Formula A World Championship/World Cup in the mid-2000s."],
    ["Junior single-seaters", "2008 Formula Renault 2.0 Eurocup champion (beating Daniel Ricciardo by three points) and NEC champion with Motopark; 2009–10 F3 Euro Series 3rd with ART (winning the Masters of F3 in both 2009 and 2010); 2011 GP3 Series champion with ART (rookie)."],
    ["Academy", "Williams F1 test/reserve driver from 2010 to 2012."],
    ["Highlights", "Eurocup and NEC double in 2008; first driver to win the F3 Masters twice."],
    ["F1 debut", "2013 with Williams, partnering Pastor Maldonado."],
  ],
};

const RTF1_TL = {
  "lando-norris": {
    entries: [
      { year: 2013, series: "Karting (CIK-FIA KF-Junior Europe)", team: "Ricky Flynn", result: "Champion" },
      { year: 2014, series: "Karting (CIK-FIA World KF)", team: "Ricky Flynn", result: "Champion" },
      { year: 2015, series: "British F4", team: "Carlin", result: "Champion" },
      { year: 2016, series: "Formula Renault 2.0 Eurocup", result: "Champion" },
      { year: 2016, series: "Formula Renault 2.0 NEC", result: "Champion" },
      { year: 2016, series: "Toyota Racing Series", result: "Champion" },
      { year: 2017, series: "FIA F3 European Championship", team: "Carlin", result: "Champion" },
      { year: 2018, series: "FIA F2", team: "Carlin", result: "Runner-up" },
    ],
    debut: { year: 2019, team: "McLaren" },
  },
  "oscar-piastri": {
    entries: [
      { year: 2017, series: "British F4", team: "TRS Arden", result: "Runner-up" },
      { year: 2019, series: "Formula Renault Eurocup", team: "R-ace GP", result: "Champion" },
      { year: 2020, series: "FIA F3", team: "Prema", result: "Champion" },
      { year: 2021, series: "FIA F2", team: "Prema", result: "Champion" },
    ],
    debut: { year: 2023, team: "McLaren" },
  },
  "charles-leclerc": {
    entries: [
      { year: 2014, series: "Formula Renault 2.0 Alps", team: "Fortec", result: "Runner-up" },
      { year: 2015, series: "FIA F3 European Championship", team: "Van Amersfoort", result: "4th" },
      { year: 2016, series: "GP3 Series", team: "ART", result: "Champion" },
      { year: 2017, series: "FIA F2", team: "Prema", result: "Champion" },
    ],
    debut: { year: 2018, team: "Sauber" },
  },
  "lewis-hamilton": {
    entries: [
      { year: 2003, series: "British Formula Renault", team: "Manor", result: "Champion" },
      { year: 2005, series: "F3 Euro Series", team: "ASM", result: "Champion" },
      { year: 2006, series: "GP2", team: "ART", result: "Champion" },
    ],
    debut: { year: 2007, team: "McLaren" },
  },
  "george-russell": {
    entries: [
      { year: 2014, series: "BRDC Formula 4", team: "Lanan", result: "Champion" },
      { year: 2016, series: "FIA F3 European Championship", team: "Hitech", result: "3rd" },
      { year: 2017, series: "GP3 Series", team: "ART", result: "Champion" },
      { year: 2018, series: "FIA F2", team: "ART", result: "Champion" },
    ],
    debut: { year: 2019, team: "Williams" },
  },
  "kimi-antonelli": {
    entries: [
      { year: 2022, series: "Italian F4", team: "Prema", result: "Champion" },
      { year: 2022, series: "ADAC German F4", team: "Prema", result: "Champion" },
      { year: 2023, series: "Formula Regional European", team: "Prema", result: "Champion" },
      { year: 2024, series: "FIA F2", team: "Prema", result: "6th" },
    ],
    debut: { year: 2025, team: "Mercedes" },
  },
  "max-verstappen": {
    entries: [
      { year: 2013, series: "Karting (CIK-FIA KZ)", result: "World & European Champion" },
      { year: 2014, series: "FIA F3 European Championship", team: "Van Amersfoort", result: "3rd" },
    ],
    debut: { year: 2015, team: "Toro Rosso" },
  },
  "isack-hadjar": {
    entries: [
      { year: 2020, series: "French F4", team: "FFSA Academy", result: "3rd" },
      { year: 2022, series: "FIA F3", team: "Hitech", result: "4th" },
      { year: 2023, series: "FIA F2", team: "Hitech", result: "14th" },
      { year: 2024, series: "FIA F2", team: "Campos", result: "Runner-up" },
    ],
    debut: { year: 2025, team: "Racing Bulls" },
  },
  "alexander-albon": {
    entries: [
      { year: 2014, series: "Formula Renault 2.0 Eurocup", result: "3rd" },
      { year: 2016, series: "GP3 Series", team: "ART", result: "Runner-up" },
      { year: 2017, series: "FIA F2", team: "ART", result: "10th" },
      { year: 2018, series: "FIA F2", team: "DAMS", result: "3rd" },
    ],
    debut: { year: 2019, team: "Toro Rosso" },
  },
  "carlos-sainz-jr": {
    entries: [
      { year: 2011, series: "Formula Renault 2.0 NEC", team: "Koiranen", result: "Champion" },
      { year: 2011, series: "Formula Renault 2.0 Eurocup", team: "Koiranen", result: "Runner-up" },
      { year: 2013, series: "GP3 Series", team: "Arden", result: "10th" },
      { year: 2014, series: "Formula Renault 3.5", team: "DAMS", result: "Champion" },
    ],
    debut: { year: 2015, team: "Toro Rosso" },
  },
  "fernando-alonso": {
    entries: [
      { year: 1999, series: "Euro Open by Nissan", team: "Campos", result: "Champion" },
      { year: 2000, series: "International F3000", team: "Team Astromega", result: "4th" },
    ],
    debut: { year: 2001, team: "Minardi" },
  },
  "lance-stroll": {
    entries: [
      { year: 2014, series: "Italian F4", team: "Prema", result: "Champion" },
      { year: 2015, series: "Toyota Racing Series", team: "M2", result: "Champion" },
      { year: 2016, series: "FIA F3 European Championship", team: "Prema", result: "Champion" },
    ],
    debut: { year: 2017, team: "Williams" },
  },
  "pierre-gasly": {
    entries: [
      { year: 2013, series: "Formula Renault Eurocup", team: "Tech 1", result: "Champion" },
      { year: 2014, series: "Formula Renault 3.5", team: "Arden", result: "Runner-up" },
      { year: 2015, series: "GP2", team: "DAMS", result: "8th" },
      { year: 2016, series: "GP2", team: "Prema", result: "Champion" },
    ],
    debut: { year: 2017, team: "Toro Rosso" },
  },
  "franco-colapinto": {
    entries: [
      { year: 2019, series: "F4 Spanish Championship", team: "FA Racing by Drivex", result: "Champion" },
      { year: 2022, series: "FIA F3", team: "Van Amersfoort", result: "9th" },
      { year: 2023, series: "FIA F3", team: "MP Motorsport", result: "4th" },
      { year: 2024, series: "FIA F2", team: "MP Motorsport", result: "Race winner" },
    ],
    debut: { year: 2024, team: "Williams" },
  },
  "liam-lawson": {
    entries: [
      { year: 2019, series: "Toyota Racing Series", team: "M2", result: "Champion" },
      { year: 2021, series: "FIA F2", team: "Hitech", result: "9th" },
      { year: 2021, series: "DTM", team: "Red Bull AF Corse", result: "Runner-up" },
      { year: 2022, series: "FIA F2", team: "Carlin", result: "3rd" },
      { year: 2023, series: "Super Formula", team: "Mugen", result: "Runner-up" },
    ],
    debut: { year: 2023, team: "AlphaTauri" },
  },
  "arvid-lindblad": {
    entries: [
      { year: 2023, series: "Italian F4", team: "Prema", result: "3rd" },
      { year: 2024, series: "FIA F3", team: "Prema", result: "4th" },
      { year: 2025, series: "FIA F2", team: "Campos", result: "Race winner" },
    ],
    debut: { year: 2026, team: "Racing Bulls" },
  },
  "esteban-ocon": {
    entries: [
      { year: 2013, series: "Formula Renault 2.0 Eurocup", team: "ART", result: "3rd" },
      { year: 2014, series: "FIA F3 European Championship", team: "Prema", result: "Champion" },
      { year: 2015, series: "GP3 Series", team: "ART", result: "Champion" },
    ],
    debut: { year: 2016, team: "Manor" },
  },
  "oliver-bearman": {
    entries: [
      { year: 2021, series: "Italian F4", team: "Van Amersfoort", result: "Champion" },
      { year: 2021, series: "ADAC German F4", team: "Van Amersfoort", result: "Champion" },
      { year: 2022, series: "FIA F3", team: "Prema", result: "3rd" },
      { year: 2023, series: "FIA F2", team: "Prema", result: "6th" },
    ],
    debut: { year: 2024, team: "Ferrari" },
  },
  "nico-hulkenberg": {
    entries: [
      { year: 2005, series: "Formula BMW ADAC", team: "Josef Kaufmann", result: "Champion" },
      { year: 2008, series: "F3 Euro Series", team: "ART", result: "Champion" },
      { year: 2009, series: "GP2", team: "ART", result: "Champion" },
    ],
    debut: { year: 2010, team: "Williams" },
  },
  "gabriel-bortoleto": {
    entries: [
      { year: 2023, series: "FIA F3", team: "Trident", result: "Champion" },
      { year: 2024, series: "FIA F2", team: "Invicta", result: "Champion" },
    ],
    debut: { year: 2025, team: "Sauber" },
  },
  "sergio-perez": {
    entries: [
      { year: 2007, series: "British F3 National Class", team: "T-Sport", result: "Champion" },
      { year: 2009, series: "GP2", team: "Arden", result: "12th" },
      { year: 2010, series: "GP2", team: "Barwa Addax", result: "Runner-up" },
    ],
    debut: { year: 2011, team: "Sauber" },
  },
  "valtteri-bottas": {
    entries: [
      { year: 2008, series: "Formula Renault 2.0 Eurocup", team: "Motopark", result: "Champion" },
      { year: 2008, series: "Formula Renault 2.0 NEC", team: "Motopark", result: "Champion" },
      { year: 2010, series: "F3 Euro Series", team: "ART", result: "3rd" },
      { year: 2011, series: "GP3 Series", team: "ART", result: "Champion" },
    ],
    debut: { year: 2013, team: "Williams" },
  },
};

async function fetchDriver(slug) {
  const token = readToken();
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  const res = await fetch(`/api/driver?d=${encodeURIComponent(slug)}`, { headers });
  if (res.status === 404) { const e = new Error("nf"); e.code = 404; throw e; }
  if (res.status === 400) { const e = new Error("bad"); e.code = 400; throw e; }
  if (!res.ok) throw new Error("fail");
  return res.json();
}

function Styles() {
  return (
    <style>{`
      :root{--bg:#f4f4f1;--surface:#fff;--ink:#15171c;--dim:#5b606b;--faint:#9398a3;--line:#e4e4de;--line2:#eeeee9;--red:#e10600;--champ:#fbf5e3;--champ-edge:#c9a227;--disp:"Barlow Condensed",system-ui,sans-serif;--body:"Inter",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace;}
      .dp *{box-sizing:border-box}
      .dp{background:var(--bg);color:var(--ink);font-family:var(--body);-webkit-font-smoothing:antialiased;line-height:1.4;min-height:100vh}
      .dp a{color:inherit;text-decoration:none}
      .dp .wrap{max-width:760px;margin:0 auto;padding:0 12px}
      .dp table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}

      .dp .top{border-bottom:1px solid var(--line);background:var(--surface)}
      .dp .top .wrap{display:flex;align-items:center;justify-content:space-between;height:48px}
      .dp .brand{display:flex;align-items:center;gap:6px;font-family:var(--disp);font-weight:700;font-size:18px;letter-spacing:.02em}
      .dp .brand .d{color:var(--red)}
      .dp .topnav{display:flex;gap:16px;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
      .dp .topnav a.on{color:var(--ink);font-weight:700}

      .dp .id{background:var(--surface);border-bottom:1px solid var(--line)}
      .dp .id .wrap{padding:16px 12px 14px}
      .dp .id-row{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
      .dp .id .code{font-family:var(--disp);font-weight:700;font-size:34px;line-height:1;color:var(--red)}
      .dp .id h1{font-family:var(--disp);font-weight:700;font-size:34px;line-height:1;letter-spacing:-.01em}
      .dp .id .meta{font-family:var(--mono);font-size:11px;color:var(--dim);margin-top:8px}
      .dp .id .meta b{color:var(--ink)}
      .dp .totals{display:flex;flex-wrap:wrap;margin-top:14px;border:1px solid var(--line);border-radius:5px;overflow:hidden;background:var(--surface)}
      .dp .totals .t{flex:1 1 0;min-width:62px;padding:9px 10px;border-right:1px solid var(--line2)}
      .dp .totals .t:last-child{border-right:0}
      .dp .totals .v{font-family:var(--disp);font-weight:700;font-size:22px;line-height:1}
      .dp .totals .v.g{color:var(--champ-edge)}
      .dp .totals .k{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-top:4px}

      .dp section{margin-top:18px}
      .dp .sec-h{display:flex;align-items:baseline;justify-content:space-between;padding:0 2px 7px}
      .dp .sec-h h2{font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:.06em;text-transform:uppercase}
      .dp .sec-h .hint{font-family:var(--mono);font-size:10px;color:var(--faint)}
      .dp .sec-h .protag{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--red);border:1px solid var(--red);border-radius:3px;padding:2px 6px}
      .dp .card{background:var(--surface);border:1px solid var(--line);border-radius:6px;overflow:hidden}

      .dp thead th{font-family:var(--mono);font-size:9.5px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);text-align:right;padding:9px 8px;border-bottom:1px solid var(--line);white-space:nowrap;cursor:pointer;user-select:none}
      .dp thead th.l{text-align:left}
      .dp thead th:hover{color:var(--dim)}
      .dp thead th.s{color:var(--ink)}
      .dp tbody td{font-family:var(--mono);font-size:12.5px;padding:9px 8px;border-bottom:1px solid var(--line2);text-align:right;color:var(--dim);white-space:nowrap}
      .dp tbody tr:last-child td{border-bottom:0}
      .dp tbody tr:hover td{background:#faf9f6}
      .dp td.yr{text-align:left;color:var(--ink);font-weight:500}
      .dp td.yr a{color:inherit;text-decoration:none}
      .dp td.yr a:hover{color:var(--red)}
      .dp td.tm{text-align:left;font-family:var(--body);font-size:13px;color:var(--ink);max-width:0;overflow:hidden;text-overflow:ellipsis}
      .dp td.tm a:hover{color:var(--red)}
      .dp td.tm .dot{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:7px;vertical-align:middle}
      .dp td.tm .alt{color:var(--faint);font-size:11px}
      .dp td.n.strong,.dp td.n.hot{color:var(--ink);font-weight:600}
      .dp td.wdc{color:var(--ink)}
      .dp td.wdc.t{color:var(--champ-edge);font-weight:700}
      .dp tr.champ td{background:var(--champ)}
      .dp tr.champ td.yr{box-shadow:inset 3px 0 0 var(--champ-edge)}

      .dp td.who{text-align:left;font-family:var(--body);font-size:13px;color:var(--ink);line-height:1.25;max-width:0;overflow:hidden}
      .dp td.who a{font-weight:600}
      .dp td.who a:hover{color:var(--red)}
      .dp td.who .ys{display:block;font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:2px}
      .dp td.h2{text-align:left;min-width:74px}
      .dp td.h2 .sc{font-size:12.5px;color:var(--dim)}
      .dp td.h2 .sc b{color:var(--ink);font-weight:700}
      .dp td.h2 .bar{display:block;height:4px;border-radius:2px;background:var(--line);margin-top:5px;overflow:hidden;max-width:70px}
      .dp td.h2 .bar i{display:block;height:100%;background:var(--red);opacity:.78}
      .dp td.pts{min-width:64px}
      .dp td.pts b{color:var(--ink);font-weight:700;font-size:12.5px}
      .dp td.pts .vs{display:block;color:var(--faint);font-size:11px;margin-top:2px}
      .dp td.pts .vs::before{content:"vs "}

      .dp .adslot{margin-top:18px;height:96px;border:1px dashed var(--line);border-radius:6px;background:repeating-linear-gradient(45deg,#fff,#fff 10px,#fbfbf9 10px,#fbfbf9 20px);display:flex;align-items:center;justify-content:center}
      .dp .adslot span{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--faint)}

      .dp .gatewrap{position:relative}
      .dp .gatecard{max-height:240px;overflow:hidden}
      .dp .gate{position:absolute;left:0;right:0;bottom:0;top:84px;background:linear-gradient(180deg,rgba(244,244,241,0) 0%,rgba(244,244,241,.82) 42%,var(--bg) 70%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;padding:0 14px 18px}
      .dp .gpanel{background:var(--surface);border:1px solid var(--line);border-radius:9px;box-shadow:0 16px 38px -16px rgba(0,0,0,.30);padding:15px 22px 17px;max-width:340px;width:100%;display:flex;flex-direction:column;align-items:center}
      .dp .gate .lock{font-family:var(--mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--red);margin-bottom:7px}
      .dp .gate h3{font-family:var(--disp);font-weight:700;font-size:21px;letter-spacing:.01em;line-height:1}
      .dp .gate p{font-family:var(--body);font-size:12px;color:var(--dim);margin-top:6px;max-width:34ch}
      .dp .gate .go{margin-top:12px;display:inline-flex;align-items:center;gap:8px;font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:.02em;color:#fff;background:var(--red);border:0;border-radius:4px;padding:11px 20px;cursor:pointer}
      .dp .gate .fine{font-family:var(--mono);font-size:10px;color:var(--faint);margin-top:9px}
      .dp .sk{display:inline-block;height:10px;border-radius:3px;background:var(--line2)}

      .dp .state{padding:clamp(70px,16vh,170px) 0;text-align:center;font-family:var(--mono);font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint)}
      .dp .foot{font-family:var(--mono);font-size:10px;color:var(--faint);text-align:center;padding:24px 0 32px}
      .dp .foot b{color:var(--dim)}
      .dp .ham{display:none;background:none;border:none;font-size:20px;color:var(--dim);cursor:pointer;padding:10px 0 10px 12px;line-height:1;margin-left:auto;flex-shrink:0}
      .dp .ham:hover{color:var(--ink)}
      @media(max-width:620px){
        .dp .top .wrap{height:auto;padding:0 12px;flex-wrap:wrap}
        .dp .ham{display:block}
        .dp .topnav{display:none;flex-direction:column;align-items:stretch;width:100%;order:3;padding:4px 0;border-top:1px solid var(--line);gap:0}
        .dp .topnav.open{display:flex}
        .dp .topnav a{padding:10px 4px;font-size:13px}
      }
      @media (min-width:560px){.dp .id .code,.dp .id h1{font-size:42px}.dp tbody td{font-size:13px;padding:10px 11px}.dp thead th{padding:10px 11px}}
      .dp .eng-card{padding:12px 14px}
      .dp .eng-cur{border-left:3px solid var(--red);padding-left:10px;margin-bottom:2px}
      .dp .eng-name{font-family:var(--body);font-size:13px;color:var(--ink);font-weight:600}
      .dp .eng-name:hover{color:var(--red)}
      .dp .eng-meta{font-family:var(--mono);font-size:11px;color:var(--dim);display:block;margin-top:2px}
      .dp .eng-meta a{color:var(--dim)}
      .dp .eng-meta a:hover{color:var(--ink)}
      .dp .eng-note{font-family:var(--body);font-size:12px;color:var(--faint);font-style:italic;display:block;margin-top:5px}
      .dp .eng-past{margin-top:10px;border-top:1px solid var(--line);padding-top:8px}
      .dp .eng-past-row{padding:5px 0;border-bottom:1px solid var(--line2)}
      .dp .eng-past-row:last-child{border-bottom:none}

      .dp .rtf1-card{padding:0 14px}
      .dp .rtf1-row{padding:10px 0;border-bottom:1px solid var(--line2)}
      .dp .rtf1-row:last-child{border-bottom:none}
      .dp .rtf1-label{font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);margin-bottom:4px}
      .dp .rtf1-text{font-family:var(--body);font-size:13px;color:var(--dim);line-height:1.55;margin:0}

      .dp .rtf1-tl{position:relative;padding:8px 14px 14px}
      .dp .rtf1-tl::before{content:'';position:absolute;left:63px;top:0;bottom:0;width:2px;background:var(--line);z-index:0}
      .dp .rtf1-tl-row{display:flex;align-items:flex-start}
      .dp .rtf1-tl-yr{width:40px;flex-shrink:0;font-family:var(--mono);font-size:10px;color:var(--faint);text-align:right;padding:1px 8px 12px 0;font-variant-numeric:tabular-nums;line-height:1.2}
      .dp .rtf1-tl-nd{width:20px;flex-shrink:0;display:flex;justify-content:center;padding-top:1px;padding-bottom:12px;position:relative;z-index:1}
      .dp .rtf1-tl-ct{flex:1;padding:0 0 12px 8px}
      .dp .rtf1-tl-row--f1 .rtf1-tl-yr{color:var(--ink);font-weight:700;padding-bottom:0}
      .dp .rtf1-tl-row--f1 .rtf1-tl-nd{padding-top:0;padding-bottom:0}
      .dp .rtf1-tl-row--f1 .rtf1-tl-ct{padding-bottom:0}
      .dp .rtf1-tl-sr{font-family:var(--body);font-size:13px;color:var(--ink);font-weight:500;line-height:1.3}
      .dp .rtf1-tl-row--f1 .rtf1-tl-sr{font-family:var(--disp);font-size:14px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--red)}
      .dp .rtf1-tl-mt{font-family:var(--mono);font-size:11px;color:var(--faint);margin-top:2px}
      .dp .rtf1-res-w{color:var(--champ-edge);font-weight:600}
    `}</style>
  );
}

function TopBar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="top"><div className="wrap">
      <a className="brand" href="/">F1<svg className="d" width="11" height="10" viewBox="0 0 100 86"><path d="M50 4 L97 82 L3 82 Z" fill="currentColor"/></svg>DELTA</a>
      <button className="ham" aria-label="Toggle menu" aria-expanded={open ? "true" : "false"} onClick={() => setOpen(o => !o)}>&#9776;</button>
      <nav className={"topnav" + (open ? " open" : "")}><a href="/drivers" className="on">Drivers</a><a href="/#standings">Standings</a><a href="/records">Records</a><a href="/teams">Teams</a><a href="/engineers">Engineers</a><a href="/pro">Pro</a></nav>
    </div></div>
  );
}

function Identity({ d }) {
  const titles = d.career.filter((s) => s.wdcFinish === 1).length;
  const active = d.lastSeason >= 2026;
  const stats = [
    ["Starts", d.totals.races, false], ["Wins", d.totals.wins, false], ["Podiums", d.totals.podiums, false],
    ["Poles", d.totals.poles, false], ["Titles", titles, titles > 0], ["Points", fmt(d.totals.points), false],
  ];
  return (
    <div className="id"><div className="wrap">
      <div className="id-row"><span className="code">{d.code || "—"}</span><h1>{d.name}</h1></div>
      <div className="meta">{d.firstSeason}{active ? "–present" : `–${d.lastSeason}`}</div>
      <div className="totals">
        {stats.map(([k, v, g]) => (
          <div className="t" key={k}><div className={"v" + (g ? " g" : "")}>{v}</div><div className="k">{k}</div></div>
        ))}
      </div>
    </div></div>
  );
}

const CAREER_COLS = [
  { k: "season", label: "Season", cls: "l" }, { k: "team", label: "Team", cls: "l" },
  { k: "races", label: "R" }, { k: "wins", label: "Win" }, { k: "podiums", label: "Pod" },
  { k: "poles", label: "Pole" }, { k: "points", label: "Pts" }, { k: "wdc", label: "WDC" },
];

function CareerTable({ d }) {
  const [sort, setSort] = useState({ k: "season", asc: true });
  function click(k) {
    const numeric = k !== "season" && k !== "team";
    setSort((s) => (s.k === k ? { k, asc: !s.asc } : { k, asc: !numeric }));
  }
  const rows = [...d.career].sort((a, b) => {
    const { k, asc } = sort;
    if (k === "team") { const r = a.primaryTeam.localeCompare(b.primaryTeam); return asc ? r : -r; }
    const map = { season: "season", races: "races", wins: "wins", podiums: "podiums", poles: "poles", points: "points", wdc: "wdcFinish" };
    return asc ? a[map[k]] - b[map[k]] : b[map[k]] - a[map[k]];
  });
  return (
    <section>
      <div className="sec-h"><h2>Season by season</h2><span className="hint">tap a header to sort</span></div>
      <div className="card"><table>
        <thead><tr>
          {CAREER_COLS.map((c) => (
            <th key={c.k} className={(c.cls || "") + (sort.k === c.k ? " s" : "")} onClick={() => click(c.k)}>{c.label}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((s) => {
            const champ = s.wdcFinish === 1;
            const others = s.teams.filter((t) => t.constructorId !== s.primaryTeamId);
            return (
              <tr key={s.season} className={champ ? "champ" : ""}>
                <td className="yr"><a href={`/standings/${s.season}`}>{s.season}</a></td>
                <td className="tm"><span className="dot" style={{ background: ac(s.primaryTeamId) }} /><a href={"/teams/" + s.primaryTeamId}>{s.primaryTeam}</a>{others.length ? <span className="alt"> +{others.map((t, i) => <span key={t.constructorId}>{i > 0 ? ", " : ""}<a href={"/teams/" + t.constructorId}>{t.constructor}</a></span>)}</span> : null}</td>
                <td className="n">{s.races}</td>
                <td className={"n" + (s.wins ? " hot" : "")}>{s.wins}</td>
                <td className="n">{s.podiums}</td>
                <td className="n">{s.poles}</td>
                <td className="n strong">{fmt(s.points)}</td>
                <td className={"wdc" + (champ ? " t" : "")}>P{s.wdcFinish}</td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </section>
  );
}

function yrRange(ys) {
  if (!ys || !ys.length) return "";
  return ys.length === 1 ? `'${String(ys[0]).slice(2)}` : `'${String(Math.min(...ys)).slice(2)}–'${String(Math.max(...ys)).slice(2)}`;
}
function H2HRow({ code, t }) {
  const a = t.aggregate;
  const qp = a.qualiAhead + a.qualiBehind ? Math.round(a.qualiAhead / (a.qualiAhead + a.qualiBehind) * 100) : 50;
  const rp = a.raceAhead + a.raceBehind ? Math.round(a.raceAhead / (a.raceAhead + a.raceBehind) * 100) : 50;
  return (
    <tr>
      <td className="who"><a href={`/driver?d=${t.teammateId}`}>{t.teammate}</a><span className="ys">{yrRange(t.seasonsShared)} · {a.races}r</span></td>
      <td className="h2"><span className="sc"><b>{a.qualiAhead}</b>–{a.qualiBehind}</span><span className="bar"><i style={{ width: qp + "%" }} /></span></td>
      <td className="h2"><span className="sc"><b>{a.raceAhead}</b>–{a.raceBehind}</span><span className="bar"><i style={{ width: rp + "%" }} /></span></td>
      <td className="pts"><b>{fmt(a.pointsSelf)}</b><span className="vs">{fmt(a.pointsMate)}</span></td>
    </tr>
  );
}
function H2HHead() {
  return <thead><tr><th className="l">Teammate</th><th className="l">Qualifying</th><th className="l">Race</th><th className="l">Points</th></tr></thead>;
}

function H2HPro({ d }) {
  const sorted = [...d.teammates].sort((a, b) => b.aggregate.races - a.aggregate.races);
  return (
    <section>
      <div className="sec-h"><h2>Teammates, head to head</h2><span className="hint">most races first</span></div>
      <div className="card"><table><H2HHead />
        <tbody>{sorted.map((t) => <H2HRow key={t.teammateId} code={d.code} t={t} />)}</tbody>
      </table></div>
    </section>
  );
}

function GhostRow() {
  const w = () => 40 + Math.floor(Math.random() * 40);
  return (
    <tr>
      <td className="who"><span className="sk" style={{ width: w() + "px" }} /></td>
      <td className="h2"><span className="sk" style={{ width: "44px" }} /></td>
      <td className="h2"><span className="sk" style={{ width: "40px" }} /></td>
      <td className="pts"><span className="sk" style={{ width: "48px" }} /></td>
    </tr>
  );
}

function EngineerSection({ engineer }) {
  const current = engineer?.current ?? null;
  const past = Array.isArray(engineer?.past) ? engineer.past : [];
  if (!current && past.length === 0) return null;
  return (
    <section>
      <div className="sec-h"><h2>Race engineer</h2></div>
      <div className="card eng-card">
        {current && (
          <div className="eng-cur">
            <a className="eng-name" href={`/people/${current.personId}`}>
              {current.personName}{current.aka ? ` "${current.aka}"` : ""}
            </a>
            <span className="eng-meta">
              <a href={`/teams/${current.teamId}`}>{current.teamName}</a>{" · since "}{current.fromYear}
            </span>
            {current.notes && <span className="eng-note">{current.notes}</span>}
          </div>
        )}
        {past.length > 0 && (
          <div className="eng-past">
            {past.map((p, i) => (
              <div className="eng-past-row" key={i}>
                <a className="eng-name" href={`/people/${p.personId}`}>
                  {p.personName}{p.aka ? ` "${p.aka}"` : ""}
                </a>
                <span className="eng-meta">
                  <a href={`/teams/${p.teamId}`}>{p.teamName}</a>
                  {" · "}{p.fromYear === p.toYear ? p.fromYear : `${p.fromYear}–${p.toYear}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function H2HGate({ d }) {
  const teaser = d.teammateTeaser;
  const more = Math.max(0, (d.teammateCount || 1) - 1);
  return (
    <section>
      <div className="sec-h"><h2>Teammates, head to head</h2><span className="protag">Pro</span></div>
      <div className="gatewrap">
        <div className="card gatecard"><table><H2HHead />
          <tbody>
            {teaser ? <H2HRow code={d.code} t={teaser} /> : null}
            <GhostRow /><GhostRow /><GhostRow /><GhostRow />
          </tbody>
        </table></div>
        <div className="gate">
          <div className="gpanel">
            <div className="lock">🔒 {more} more teammate{more === 1 ? "" : "s"}</div>
            <h3>Unlock more with Pro</h3>
            <p>Every teammate battle, race engineer, and salary — for all drivers.</p>
            <a className="go" href="/pro">Go Pro · $9/mo →</a>
            <div className="fine">cancel anytime</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoadToF1Timeline({ slug }) {
  const data = RTF1_TL[slug];
  if (!data || !data.entries || data.entries.length === 0) return null;
  let lastYear = null;
  const rows = data.entries.map(function(e, i) {
    const show = e.year !== lastYear;
    lastYear = e.year;
    return { i: i, show: show, year: e.year, series: e.series, team: e.team, result: e.result };
  });
  return (
    <div className="rtf1-tl">
      {rows.map(function(r) {
        return (
          <div className="rtf1-tl-row" key={r.i}>
            <span className="rtf1-tl-yr">{r.show ? r.year : ""}</span>
            <span className="rtf1-tl-nd">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <circle cx="6" cy="6" r="4" fill="var(--surface)" stroke="var(--faint)" strokeWidth="1.5" />
              </svg>
            </span>
            <div className="rtf1-tl-ct">
              <div className="rtf1-tl-sr">{r.series}</div>
              {(r.team || r.result) && (
                <div className="rtf1-tl-mt">
                  {r.team && <span>{r.team}</span>}
                  {r.team && r.result && <span>{" · "}</span>}
                  {r.result && (
                    <span className={r.result === "Champion" ? "rtf1-res-w" : ""}>{r.result}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="rtf1-tl-row rtf1-tl-row--f1">
        <span className="rtf1-tl-yr">{data.debut.year}</span>
        <span className="rtf1-tl-nd">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="7" fill="var(--red)" />
          </svg>
        </span>
        <div className="rtf1-tl-ct">
          <div className="rtf1-tl-sr">Formula 1 Debut</div>
          <div className="rtf1-tl-mt">{data.debut.team}</div>
        </div>
      </div>
    </div>
  );
}

function RoadToF1({ slug }) {
  const rows = RTF1[slug];
  const hasTl = !!RTF1_TL[slug];
  if (!rows && !hasTl) return null;
  return (
    <section>
      <div className="sec-h"><h2>Road to Formula 1</h2></div>
      {rows && (
        <div className="card" style={hasTl ? {marginBottom: "10px"} : null}>
          <div className="rtf1-card">
            {rows.map(([label, text]) => (
              <div className="rtf1-row" key={label}>
                <div className="rtf1-label">{label}</div>
                <p className="rtf1-text">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasTl && (
        <div className="card">
          <RoadToF1Timeline slug={slug} />
        </div>
      )}
    </section>
  );
}

function DriverPage() {
  const [st, setSt] = useState({ s: "loading", d: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (window.F1Access && window.F1Access.ready) { try { await window.F1Access.ready; } catch (e) {} }
        const slug = (new URLSearchParams(location.search).get("d") || "").toLowerCase();
        if (!slug) { if (alive) setSt({ s: "noslug", d: null }); return; }
        const d = await fetchDriver(slug);
        if (alive) setSt({ s: "ready", d });
      } catch (e) {
        if (alive) setSt({ s: e.code === 404 ? "notfound" : "error", d: null });
      }
    })();
    return () => { alive = false; };
  }, []);

  const { s, d } = st;
  return (
    <div className="dp">
      <Styles />
      <TopBar />
      {s === "loading" && <div className="state">Loading…</div>}
      {s === "noslug" && <div className="state">No driver selected</div>}
      {s === "notfound" && <div className="state">Driver not found</div>}
      {s === "error" && <div className="state">Couldn’t load this driver — refresh to retry</div>}
      {s === "ready" && d && (
        <>
          <Identity d={d} />
          <div className="wrap">
            <CareerTable d={d} />
            <EngineerSection engineer={d.engineer} />
            {!d.pro && <div className="adslot"><span>Advertisement</span></div>}
            {d.pro ? <H2HPro d={d} /> : <H2HGate d={d} />}
            <RoadToF1 slug={(new URLSearchParams(location.search).get("d") || "").toLowerCase()} />
            <div className="foot">F1 <b>Δ</b> DELTA · data via F1DB · unofficial</div>
          </div>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DriverPage />);
