import { useState, useMemo } from "react";

// ═══════════════════════════════════════════════
//  DATA: water properties, materials, units
// ═══════════════════════════════════════════════
const waterProps = [
  { T: 0, rho: 999.84, mu: 1.792e-3 }, { T: 5, rho: 999.97, mu: 1.519e-3 },
  { T: 10, rho: 999.70, mu: 1.307e-3 }, { T: 15, rho: 999.10, mu: 1.138e-3 },
  { T: 20, rho: 998.20, mu: 1.002e-3 }, { T: 25, rho: 997.05, mu: 0.890e-3 },
  { T: 30, rho: 995.65, mu: 0.798e-3 }, { T: 35, rho: 994.03, mu: 0.720e-3 },
  { T: 40, rho: 992.22, mu: 0.653e-3 }, { T: 45, rho: 990.21, mu: 0.596e-3 },
  { T: 50, rho: 988.07, mu: 0.547e-3 }, { T: 55, rho: 985.69, mu: 0.504e-3 },
  { T: 60, rho: 983.20, mu: 0.467e-3 }, { T: 65, rho: 980.55, mu: 0.434e-3 },
  { T: 70, rho: 977.76, mu: 0.404e-3 }, { T: 75, rho: 974.84, mu: 0.378e-3 },
  { T: 80, rho: 971.79, mu: 0.354e-3 }, { T: 85, rho: 968.61, mu: 0.334e-3 },
  { T: 90, rho: 965.31, mu: 0.315e-3 }, { T: 95, rho: 961.89, mu: 0.298e-3 },
  { T: 100, rho: 958.35, mu: 0.282e-3 },
];

function interpolateWater(T) {
  const c = Math.max(0, Math.min(100, T));
  let i = 0;
  while (i < waterProps.length - 1 && waterProps[i + 1].T < c) i++;
  if (i >= waterProps.length - 1) i = waterProps.length - 2;
  const a = waterProps[i], b = waterProps[i + 1], fr = (c - a.T) / (b.T - a.T);
  return { rho: a.rho + fr * (b.rho - a.rho), mu: a.mu + fr * (b.mu - a.mu) };
}

const pipeMaterials = [
  { n: { pl:"Stal handlowa (nowa)", en:"Commercial steel (new)", de:"Handelsstahl (neu)", ua:"Сталь торговельна (нова)" }, e: 0.046 },
  { n: { pl:"Stal nierdzewna", en:"Stainless steel", de:"Edelstahl", ua:"Нержавіюча сталь" }, e: 0.015 },
  { n: { pl:"Stal ocynkowana", en:"Galvanized steel", de:"Verzinkter Stahl", ua:"Оцинкована сталь" }, e: 0.15 },
  { n: { pl:"Stal spawana (zużyta)", en:"Welded steel (aged)", de:"Geschweißter Stahl (alt)", ua:"Зварна сталь (зношена)" }, e: 0.5 },
  { n: { pl:"Żeliwo (nowe)", en:"Cast iron (new)", de:"Gusseisen (neu)", ua:"Чавун (новий)" }, e: 0.26 },
  { n: { pl:"Żeliwo (skorodowane)", en:"Cast iron (corroded)", de:"Gusseisen (korrodiert)", ua:"Чавун (кородований)" }, e: 1.0 },
  { n: { pl:"Miedź", en:"Copper", de:"Kupfer", ua:"Мідь" }, e: 0.0015 },
  { n: { pl:"PVC / PE-HD", en:"PVC / PE-HD", de:"PVC / PE-HD", ua:"PVC / PE-HD" }, e: 0.0015 },
  { n: { pl:"PEX (polietylen sieciowany)", en:"PEX (cross-linked PE)", de:"PEX (vernetztes PE)", ua:"PEX (зшитий поліетилен)" }, e: 0.007 },
  { n: { pl:"Polietylen PE", en:"Polyethylene PE", de:"Polyethylen PE", ua:"Поліетилен PE" }, e: 0.007 },
  { n: { pl:"Beton (gładki)", en:"Concrete (smooth)", de:"Beton (glatt)", ua:"Бетон (гладкий)" }, e: 0.3 },
  { n: { pl:"Beton (szorstki)", en:"Concrete (rough)", de:"Beton (rau)", ua:"Бетон (шорсткий)" }, e: 3.0 },
  { n: { pl:"Szkło", en:"Glass", de:"Glas", ua:"Скло" }, e: 0.0015 },
];

const flowUnits = [
  { id:"m3s", label:"m³/s", toM3s:(v)=>v, fromM3s:(v)=>v, step:0.0001 },
  { id:"m3h", label:"m³/h", toM3s:(v)=>v/3600, fromM3s:(v)=>v*3600, step:0.01 },
  { id:"kgs", label:"kg/s", toM3s:(v,r)=>v/r, fromM3s:(v,r)=>v*r, step:0.01 },
  { id:"kgh", label:"kg/h", toM3s:(v,r)=>v/(r*3600), fromM3s:(v,r)=>v*r*3600, step:1 },
];

const pressureUnits = [
  { id:"Pa",  label:"Pa/m",  f:1,    d:1 },
  { id:"kPa", label:"kPa/m", f:1e-3, d:4 },
  { id:"bar", label:"bar/m", f:1e-5, d:6 },
  { id:"mbar",label:"mbar/m",f:1e-2, d:3 },
];

// ═══════════════════════════════════════════════
//  i18n dictionary
// ═══════════════════════════════════════════════
const D = {
  headerSub:       {pl:"Inżynieria Hydrauliczna",en:"Hydraulic Engineering",de:"Hydraulische Technik",ua:"Гідравлічна інженерія"},
  headerTitle:     {pl:"Straty ciśnienia w rurociągach",en:"Pipe Pressure Loss Calculator",de:"Druckverlust in Rohrleitungen",ua:"Втрати тиску у трубопроводах"},
  headerDesc:      {pl:"Równanie Darcy-Weisbacha · Colebrook-White · Analiza reżimu przepływu",en:"Darcy-Weisbach · Colebrook-White · Flow regime analysis",de:"Darcy-Weisbach · Colebrook-White · Strömungsregime-Analyse",ua:"Дарсі-Вейсбах · Колбрук-Вайт · Аналіз режиму течії"},
  tabCalc:         {pl:"Kalkulator",en:"Calculator",de:"Rechner",ua:"Калькулятор"},
  tabTheory:       {pl:"Teoria i wzory",en:"Theory & formulas",de:"Theorie & Formeln",ua:"Теорія і формули"},
  tabTable:        {pl:"Tabela parametryczna",en:"Parametric table",de:"Parametertabelle",ua:"Параметрична таблиця"},
  tabValidity:     {pl:"Zakres stosowalności",en:"Validity range",de:"Gültigkeitsbereich",ua:"Область застосування"},
  lblTemp:         {pl:"Temperatura wody [°C]",en:"Water temperature [°C]",de:"Wassertemperatur [°C]",ua:"Температура води [°C]"},
  lblDiam:         {pl:"Średnica wewnętrzna [mm]",en:"Inner diameter [mm]",de:"Innendurchmesser [mm]",ua:"Внутрішній діаметр [мм]"},
  lblFlow:         {pl:"Strumień / przepływ",en:"Flow rate",de:"Volumenstrom",ua:"Витрата"},
  lblMaterial:     {pl:"Materiał rury",en:"Pipe material",de:"Rohrmaterial",ua:"Матеріал труби"},
  lblPUnit:        {pl:"Jednostka ciśnienia",en:"Pressure unit",de:"Druckeinheit",ua:"Одиниця тиску"},
  results:         {pl:"Wyniki obliczenia",en:"Calculation results",de:"Berechnungsergebnisse",ua:"Результати розрахунку"},
  velocity:        {pl:"Prędkość [m/s]",en:"Velocity [m/s]",de:"Geschwindigkeit [m/s]",ua:"Швидкість [м/с]"},
  pLoss:           {pl:"Strata ciśnienia",en:"Pressure loss",de:"Druckverlust",ua:"Втрата тиску"},
  hLoss:           {pl:"Δh [mm wody/m]",en:"Δh [mm H₂O/m]",de:"Δh [mm WS/m]",ua:"Δh [мм вод.ст./м]"},
  reNum:           {pl:"Liczba Reynoldsa",en:"Reynolds number",de:"Reynolds-Zahl",ua:"Число Рейнольдса"},
  regime:          {pl:"Reżim przepływu",en:"Flow regime",de:"Strömungsregime",ua:"Режим течії"},
  fCoeff:          {pl:"Współcz. tarcia f",en:"Friction factor f",de:"Reibungsbeiwert f",ua:"Коеф. тертя f"},
  rLam:            {pl:"Laminarny",en:"Laminar",de:"Laminar",ua:"Ламінарний"},
  rTra:            {pl:"Przejściowy",en:"Transitional",de:"Übergang",ua:"Перехідний"},
  rTur:            {pl:"Turbulentny",en:"Turbulent",de:"Turbulent",ua:"Турбулентний"},
  chartTitle:      {pl:"Wykres Δp(v) dla wybranej rury",en:"Δp(v) chart for selected pipe",de:"Δp(v)-Diagramm für gewähltes Rohr",ua:"Графік Δp(v) для обраної труби"},
  axisV:           {pl:"Prędkość v [m/s]",en:"Velocity v [m/s]",de:"Geschwindigkeit v [m/s]",ua:"Швидкість v [м/с]"},
  chartVmax:       {pl:"Zakres osi prędkości",en:"Velocity axis range",de:"Geschwindigkeitsachse",ua:"Діапазон осі швидкості"},
  warn:            {pl:"Prędkość {v} m/s przekracza 4 m/s — ryzyko kawitacji i uderzeń hydraulicznych. Zalecane v ≤ 2–3 m/s.",en:"Velocity {v} m/s exceeds 4 m/s — cavitation and water hammer risk. Recommended v ≤ 2–3 m/s.",de:"Geschwindigkeit {v} m/s > 4 m/s — Kavitations- und Wasserschlagrisiko. Empfohlen: v ≤ 2–3 m/s.",ua:"Швидкість {v} м/с > 4 м/с — ризик кавітації та гідроудару. Рекомендовано v ≤ 2–3 м/с."},
  lgLam:           {pl:"Laminarny (Re<2320)",en:"Laminar (Re<2320)",de:"Laminar (Re<2320)",ua:"Ламінарний (Re<2320)"},
  lgTra:           {pl:"Przejściowy (2320–4000)",en:"Transitional (2320–4000)",de:"Übergang (2320–4000)",ua:"Перехідний (2320–4000)"},
  lgTur:           {pl:"Turbulentny (Re>4000)",en:"Turbulent (Re>4000)",de:"Turbulent (Re>4000)",ua:"Турбулентний (Re>4000)"},
  // Theory
  th1:             {pl:"1. Równanie Darcy-Weisbacha",en:"1. Darcy-Weisbach Equation",de:"1. Darcy-Weisbach-Gleichung",ua:"1. Рівняння Дарсі-Вейсбаха"},
  th1d:            {pl:"Podstawowe równanie opisujące stratę ciśnienia wskutek tarcia w rurociągu prostoliniowym:",en:"Fundamental equation for friction pressure loss in a straight pipe:",de:"Grundgleichung für reibungsbedingten Druckverlust in einem geraden Rohr:",ua:"Основне рівняння втрати тиску через тертя у прямолінійній трубі:"},
  thW:             {pl:"gdzie:",en:"where:",de:"wobei:",ua:"де:"},
  thDp:            {pl:"strata ciśnienia [Pa]",en:"pressure loss [Pa]",de:"Druckverlust [Pa]",ua:"втрата тиску [Па]"},
  thF:             {pl:"współczynnik tarcia Darcy'ego [-]",en:"Darcy friction factor [-]",de:"Darcy-Reibungsbeiwert [-]",ua:"коефіцієнт тертя Дарсі [-]"},
  thL:             {pl:"długość rury [m]",en:"pipe length [m]",de:"Rohrlänge [m]",ua:"довжина труби [м]"},
  thDi:            {pl:"średnica wewnętrzna [m]",en:"inner diameter [m]",de:"Innendurchmesser [m]",ua:"внутрішній діаметр [м]"},
  thRho:           {pl:"gęstość cieczy [kg/m³]",en:"fluid density [kg/m³]",de:"Fluiddichte [kg/m³]",ua:"густина рідини [кг/м³]"},
  thVe:            {pl:"prędkość średnia [m/s]",en:"mean velocity [m/s]",de:"mittlere Geschwindigkeit [m/s]",ua:"середня швидкість [м/с]"},
  thPm:            {pl:"Strata na metr bieżący:",en:"Loss per meter:",de:"Verlust pro Meter:",ua:"Втрата на метр:"},
  th2:             {pl:"2. Prędkość ze strumienia objętości",en:"2. Velocity from flow rate",de:"2. Geschwindigkeit aus Volumenstrom",ua:"2. Швидкість з витрати"},
  th3:             {pl:"3. Liczba Reynoldsa",en:"3. Reynolds Number",de:"3. Reynolds-Zahl",ua:"3. Число Рейнольдса"},
  th3d:            {pl:"gdzie ν = μ/ρ — lepkość kinematyczna [m²/s].",en:"where ν = μ/ρ — kinematic viscosity [m²/s].",de:"wobei ν = μ/ρ — kinematische Viskosität [m²/s].",ua:"де ν = μ/ρ — кінематична в'язкість [м²/с]."},
  th4:             {pl:"4. Współczynnik tarcia f",en:"4. Friction factor f",de:"4. Reibungsbeiwert f",ua:"4. Коефіцієнт тертя f"},
  th4a:            {pl:"a) Przepływ laminarny (Re < 2320)",en:"a) Laminar flow (Re < 2320)",de:"a) Laminare Strömung (Re < 2320)",ua:"a) Ламінарна течія (Re < 2320)"},
  th4ad:           {pl:"Wzór analityczny Hagen-Poiseuille'a. Nie zależy od chropowatości.",en:"Analytical Hagen-Poiseuille formula. Independent of roughness.",de:"Analytische Hagen-Poiseuille-Formel. Unabhängig von der Rauheit.",ua:"Аналітична формула Гагена-Пуазейля. Не залежить від шорсткості."},
  th4b:            {pl:"b) Turbulentny (Re > 4000) — Colebrook-White",en:"b) Turbulent (Re > 4000) — Colebrook-White",de:"b) Turbulent (Re > 4000) — Colebrook-White",ua:"b) Турбулентний (Re > 4000) — Колбрук-Вайт"},
  th4bd:           {pl:"Równanie uwikłane — rozwiązywane iteracyjnie. Przybliżenie Swamee-Jaina:",en:"Implicit equation — solved iteratively. Swamee-Jain approximation:",de:"Implizite Gleichung — iterativ gelöst. Swamee-Jain-Näherung:",ua:"Неявне рівняння — ітераційний розв'язок. Наближення Свамі-Джейна:"},
  th5:             {pl:"5. Strata wyrażona jako wysokość",en:"5. Head loss form",de:"5. Verlusthöhe",ua:"5. Втрата напору"},
  th6:             {pl:"6. Chropowatość ε — typowe wartości",en:"6. Roughness ε — typical values",de:"6. Rauheit ε — typische Werte",ua:"6. Шорсткість ε — типові значення"},
  thMat:           {pl:"Materiał",en:"Material",de:"Material",ua:"Матеріал"},
  // Table
  tFor:            {pl:"Wyniki dla:",en:"Results for:",de:"Ergebnisse für:",ua:"Результати для:"},
  // Validity
  vT:              {pl:"Zakres stosowalności modelu",en:"Model validity range",de:"Gültigkeitsbereich des Modells",ua:"Діапазон застосовності моделі"},
  vOk:             {pl:"Gdzie model jest poprawny",en:"Where the model is valid",de:"Wo das Modell gültig ist",ua:"Де модель коректна"},
  vO1:             {pl:"Przepływ laminarny (Re < 2320) — f = 64/Re jest ścisły analitycznie.",en:"Laminar flow (Re < 2320) — f = 64/Re is analytically exact.",de:"Laminare Strömung (Re < 2320) — f = 64/Re ist analytisch exakt.",ua:"Ламінарна течія (Re < 2320) — f = 64/Re аналітично точний."},
  vO2:             {pl:"Turbulentny (Re > 4000) — Colebrook-White, ±2% do Re ~ 10⁸.",en:"Turbulent (Re > 4000) — Colebrook-White, ±2% up to Re ~ 10⁸.",de:"Turbulent (Re > 4000) — Colebrook-White, ±2% bis Re ~ 10⁸.",ua:"Турбулентний (Re > 4000) — Колбрук-Вайт, ±2% до Re ~ 10⁸."},
  vCond:           {pl:"Warunki stosowalności:",en:"Applicability conditions:",de:"Anwendungsbedingungen:",ua:"Умови застосовності:"},
  vC1:{pl:"Przepływ ustalony",en:"Steady-state flow",de:"Stationäre Strömung",ua:"Стаціонарна течія"},
  vC2:{pl:"Przepływ w pełni rozwinięty",en:"Fully developed flow",de:"Voll ausgebildete Strömung",ua:"Повністю розвинена течія"},
  vC3:{pl:"Płyn nieściśliwy",en:"Incompressible fluid",de:"Inkompressibles Fluid",ua:"Нестисна рідина"},
  vC4:{pl:"Płyn newtonowski",en:"Newtonian fluid",de:"Newtonsches Fluid",ua:"Ньютонівська рідина"},
  vC5:{pl:"Rura o stałym przekroju kołowym",en:"Constant circular section",de:"Konstanter Kreisquerschnitt",ua:"Постійний круглий переріз"},
  vC6:{pl:"Brak kawitacji i zmian faz",en:"No cavitation or phase change",de:"Keine Kavitation / Phasenänderung",ua:"Без кавітації та зміни фаз"},
  vTr:             {pl:"Strefa przejściowa (Re ≈ 2320–4000)",en:"Transitional zone (Re ≈ 2320–4000)",de:"Übergangsbereich (Re ≈ 2320–4000)",ua:"Перехідна зона (Re ≈ 2320–4000)"},
  vTrd:            {pl:"Przepływ niestabilny — żaden model nie daje pewnych wyników. Nie projektuj w tej strefie.",en:"Unstable flow — no model gives reliable results. Avoid this range.",de:"Instabile Strömung — kein Modell liefert sichere Ergebnisse. Diesen Bereich vermeiden.",ua:"Нестабільна течія — жодна модель не дає надійних результатів. Уникайте цього діапазону."},
  vFa:             {pl:"Gdzie model przestaje obowiązywać",en:"Where the model breaks down",de:"Wo das Modell versagt",ua:"Де модель перестає діяти"},
  vF1:{pl:"Prędkości > 4–6 m/s: kawitacja, uderzenia hydrauliczne, erozja.",en:"v > 4–6 m/s: cavitation, water hammer, erosion.",de:"v > 4–6 m/s: Kavitation, Wasserschlag, Erosion.",ua:"v > 4–6 м/с: кавітація, гідроудар, ерозія."},
  vF2:{pl:"Przepływ nieustalony (uderzenia hydrauliczne).",en:"Unsteady flow (water hammer).",de:"Instationäre Strömung (Wasserschlag).",ua:"Нестаціонарна течія (гідроудар)."},
  vF3:{pl:"Gazy: spadek ciśnienia > 10% — istotne błędy.",en:"Gases: pressure drop > 10% — significant errors.",de:"Gase: Druckabfall > 10% — signifikante Fehler.",ua:"Гази: перепад тиску > 10% — суттєві похибки."},
  vF4:{pl:"Płyny nienewtonowskie (szlamy, polimery).",en:"Non-Newtonian fluids (slurries, polymers).",de:"Nicht-Newtonsche Fluide (Schlämme, Polymere).",ua:"Неньютонівські рідини (шлами, полімери)."},
  vF5:{pl:"Przepływ dwufazowy (gaz-ciecz).",en:"Two-phase flow (gas-liquid).",de:"Zweiphasenströmung (Gas-Flüssigkeit).",ua:"Двофазна течія (газ-рідина)."},
  vDes:            {pl:"Zalecane prędkości projektowe",en:"Recommended design velocities",de:"Empfohlene Auslegungsgeschwindigkeiten",ua:"Рекомендовані проектні швидкості"},
  vIT:{pl:"Typ instalacji",en:"Installation type",de:"Anlagentyp",ua:"Тип установки"},
  vIR:{pl:"Uzasadnienie",en:"Reason",de:"Begründung",ua:"Обґрунтування"},
  iSuc:{pl:"Rurociąg ssawny pompy",en:"Pump suction pipe",de:"Saugleitung",ua:"Всмоктувальний трубопровід"},
  iSuR:{pl:"Unikanie kawitacji",en:"Cavitation avoidance",de:"Kavitationsvermeidung",ua:"Уникнення кавітації"},
  iDis:{pl:"Rurociąg tłoczny",en:"Discharge pipe",de:"Druckleitung",ua:"Напірний трубопровід"},
  iDiR:{pl:"Straty vs. koszt",en:"Loss vs. cost",de:"Verlust vs. Kosten",ua:"Втрати vs. вартість"},
  iMai:{pl:"Rurociągi magistralne",en:"Trunk mains",de:"Hauptleitung",ua:"Магістральні трубопроводи"},
  iMaR:{pl:"Min. strat energii",en:"Min. energy loss",de:"Min. Energieverlust",ua:"Мін. втрат енергії"},
  iHea:{pl:"Instalacje c.o.",en:"Heating systems",de:"Heizungsanlage",ua:"Системи опалення"},
  iHeR:{pl:"Hałas, żywotność",en:"Noise, lifetime",de:"Lärm, Lebensdauer",ua:"Шум, довговічність"},
  iFir:{pl:"Instalacje p.poż.",en:"Fire protection",de:"Brandschutz",ua:"Протипожежні"},
  iFiR:{pl:"Priorytet = wydajność",en:"Priority = capacity",de:"Priorität = Kapazität",ua:"Пріоритет = продуктивність"},
  vSum:            {pl:"Podsumowanie: Granice Q i v",en:"Summary: Q and v limits",de:"Zusammenfassung: Q- und v-Grenzen",ua:"Підсумок: межі Q та v"},
  vPipe:           {pl:"Dla wybranej rury",en:"For selected pipe",de:"Für gewähltes Rohr",ua:"Для обраної труби"},
  vAvoid:          {pl:"unikaj!",en:"avoid!",de:"vermeiden!",ua:"уникати!"},
  vEng:            {pl:"Max. prędkość inż.",en:"Max. eng. velocity",de:"Max. techn. Geschw.",ua:"Макс. інж. швидкість"},
  vCav:            {pl:"Krytyczna (kawitacja)",en:"Critical (cavitation)",de:"Kritisch (Kavitation)",ua:"Критична (кавітація)"},
  vCavD:           {pl:"model formalnie działa, ale fizyka nie wspiera",en:"model formally works, physics don't support",de:"Modell formal gültig, physikalisch nicht gestützt",ua:"модель формально працює, фізика не підтримує"},
  anly:            {pl:"f = 64/Re — analityczny",en:"f = 64/Re — analytical",de:"f = 64/Re — analytisch",ua:"f = 64/Re — аналітичний"},
  unst:            {pl:"Niestabilny — niepewny",en:"Unstable — uncertain",de:"Instabil — unsicher",ua:"Нестабільний — невизначений"},
  cwOk:            {pl:"Colebrook-White — poprawny",en:"Colebrook-White — valid",de:"Colebrook-White — gültig",ua:"Колбрук-Вайт — коректний"},
};
const L = (k, lang) => (D[k] && D[k][lang]) || D[k]?.en || k;

// ═══════════════════════════════════════════════
//  SOLVER
// ═══════════════════════════════════════════════
function colebrook(Re, epsD) {
  if (Re < 1) return 64;
  if (Re <= 2320) return 64 / Re;
  let f = 0.25 / Math.pow(Math.log10(epsD / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2);
  for (let i = 0; i < 50; i++) {
    const rhs = -2 * Math.log10(epsD / 3.7 + 2.51 / (Re * Math.sqrt(f)));
    const fn = 1 / (rhs * rhs);
    if (Math.abs(fn - f) / f < 1e-8) break;
    f = fn;
  }
  return f;
}

function regime(Re, lang) {
  if (Re < 2320) return { label: L("rLam", lang), color: "#22c55e" };
  if (Re < 4000) return { label: L("rTra", lang), color: "#f59e0b" };
  return { label: L("rTur", lang), color: "#ef4444" };
}

function calc(T, Q, Dmm, emm, lang) {
  const { rho, mu } = interpolateWater(T);
  const Di = Dmm / 1000, A = Math.PI * Di * Di / 4;
  const v = Q / A, nu = mu / rho, Re = v * Di / nu, ed = (emm / 1000) / Di;
  const f = colebrook(Re, ed);
  const dp = f * (1 / Di) * (rho * v * v / 2);
  return { rho, mu, nu, v, Re, ed, f, dp, hf: dp / (rho * 9.81), reg: regime(Re, lang), Di, A };
}

// ═══════════════════════════════════════════════
//  CHART
// ═══════════════════════════════════════════════
function Chart({ T, Dmm, emm, pu, lang, vCalc, dpCalc, vMax }) {
  const V = vMax || 2;

  const d = useMemo(() => {
    const { rho, mu } = interpolateWater(T);
    const Di = Dmm / 1000, nu = mu / rho;
    const step = V / 200;
    const pts = [];
    for (let v = step; v <= V * 1.005; v += step) {
      const Re = v * Di / nu, ed = (emm / 1000) / Di;
      pts.push({ v: Math.min(v, V), dp: colebrook(Re, ed) * (1 / Di) * (rho * v * v / 2), Re });
    }
    return { pts, vL: 2320 * nu / Di, vT: 4000 * nu / Di };
  }, [T, Dmm, emm, V]);

  const { pts, vL, vT } = d;
  const puf = pressureUnits.find(u => u.id === pu) || pressureUnits[0];
  const mx = Math.max(...pts.map(p => p.dp));
  const W = 720, H = 388, pa = { l: 78, r: 24, t: 30, b: 58 };
  const iw = W - pa.l - pa.r, ih = H - pa.t - pa.b;
  const sx = v => pa.l + (v / V) * iw, sy = dp => pa.t + ih - (dp / (mx * 1.08)) * ih;
  const path = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${sx(pt.v).toFixed(1)},${sy(pt.dp).toFixed(1)}`).join(" ");

  // Nice Y ticks
  const rs = (mx * 1.08) / 6, mg = Math.pow(10, Math.floor(Math.log10(rs || 1)));
  const ns = [1, 2, 5, 10].map(m => m * mg).find(s => s >= rs) || mg * 10;
  const yt = []; for (let y = ns; y <= mx * 1.08; y += ns) yt.push(y);
  const fy = y => { const val = y * puf.f; return val >= 1e4 ? (val / 1e3).toFixed(1) + "k" : val >= 100 ? val.toFixed(0) : val >= 1 ? val.toFixed(1) : val.toFixed(3); };

  // Nice X ticks: pick step from [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2]
  const xRaw = V / 6;
  const xStep = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2].find(s => s >= xRaw) || 1;
  const xt = []; for (let x = xStep; x <= V * 1.001; x += xStep) xt.push(+x.toFixed(3));

  const xL = Math.min(sx(vL), sx(V)), xT = Math.min(sx(vT), sx(V));

  // Operating point position (clamped to chart area)
  const opV = Math.min(vCalc || 0, V);
  const opDp = dpCalc || 0;
  const opX = sx(opV), opY = sy(Math.min(opDp, mx * 1.08));
  const showOp = opV > 0 && opV <= V && opDp > 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity=".28"/><stop offset="100%" stopColor="#22c55e" stopOpacity=".04"/></linearGradient>
        <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity=".28"/><stop offset="100%" stopColor="#f59e0b" stopOpacity=".04"/></linearGradient>
        <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity=".22"/><stop offset="100%" stopColor="#3b82f6" stopOpacity=".03"/></linearGradient>
        <pattern id="ht" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity=".22"/></pattern>
        <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6b35" stopOpacity=".2"/><stop offset="100%" stopColor="#ff6b35" stopOpacity=".01"/></linearGradient>
      </defs>
      <rect x={pa.l} y={pa.t} width={iw} height={ih} fill="#0f1729" rx="4"/>

      {/* Regime zones */}
      {vL > 0 && <rect x={pa.l} y={pa.t} width={Math.max(xL - pa.l, 0)} height={ih} fill="url(#gL)"/>}
      {vL < V && vT > 0 && <><rect x={xL} y={pa.t} width={Math.max(xT - xL, 0)} height={ih} fill="url(#gT)"/><rect x={xL} y={pa.t} width={Math.max(xT - xL, 0)} height={ih} fill="url(#ht)"/></>}
      {vT < V && <rect x={xT} y={pa.t} width={Math.max(sx(V) - xT, 0)} height={ih} fill="url(#gR)"/>}

      {/* Zone labels */}
      {vL > 0.01 && vL < V && (xL - pa.l) > 40 && <text x={(pa.l + xL) / 2} y={pa.t + 18} fill="#22c55e" fontSize="10" fontWeight="800" textAnchor="middle" opacity=".9">{L("rLam", lang).toUpperCase()}</text>}
      {vL < V && vT < V && (xT - xL) > 22 && <text x={(xL + xT) / 2} y={pa.t + 18} fill="#f59e0b" fontSize="9" fontWeight="800" textAnchor="middle" opacity=".9">{L("rTra", lang).toUpperCase()}</text>}
      {vT < V && (sx(V) - xT) > 40 && <text x={(xT + sx(V)) / 2} y={pa.t + 18} fill="#3b82f6" fontSize="10" fontWeight="800" textAnchor="middle" opacity=".9">{L("rTur", lang).toUpperCase()}</text>}

      {/* Grid X */}
      {xt.map(x => <g key={x}><line x1={sx(x)} y1={pa.t} x2={sx(x)} y2={pa.t+ih} stroke="#1e293b" strokeWidth=".7"/><text x={sx(x)} y={H-16} fill="#94a3b8" fontSize="10" textAnchor="middle">{x % 1 === 0 ? x : x.toFixed(2)}</text></g>)}
      {/* Grid Y */}
      {yt.map((y,i) => <g key={i}><line x1={pa.l} y1={sy(y)} x2={pa.l+iw} y2={sy(y)} stroke="#1e293b" strokeWidth=".7"/><text x={pa.l-6} y={sy(y)+3} fill="#94a3b8" fontSize="9" textAnchor="end">{fy(y)}</text></g>)}

      {/* Area fill + curve */}
      <path d={`${path} L${sx(pts[pts.length-1].v).toFixed(1)},${sy(0).toFixed(1)} L${sx(pts[0].v).toFixed(1)},${sy(0).toFixed(1)} Z`} fill="url(#cf)"/>
      <path d={path} fill="none" stroke="#ff6b35" strokeWidth="2.5" strokeLinejoin="round"/>

      {/* Regime boundary lines */}
      {vL < V && <><line x1={xL} y1={pa.t} x2={xL} y2={pa.t+ih} stroke="#22c55e" strokeWidth="1.5" strokeDasharray="6,4"/><rect x={xL-1} y={pa.t+ih-18} width={56} height={16} rx="3" fill="#0f1729" fillOpacity=".85"/><text x={xL+3} y={pa.t+ih-7} fill="#22c55e" fontSize="9" fontWeight="700">Re=2320</text></>}
      {vT < V && <><line x1={xT} y1={pa.t} x2={xT} y2={pa.t+ih} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="6,4"/><rect x={xT-1} y={pa.t+ih-18} width={56} height={16} rx="3" fill="#0f1729" fillOpacity=".85"/><text x={xT+3} y={pa.t+ih-7} fill="#f59e0b" fontSize="9" fontWeight="700">Re=4000</text></>}

      {/* Operating point marker */}
      {showOp && <>
        <line x1={opX} y1={pa.t} x2={opX} y2={pa.t+ih} stroke="#fff" strokeWidth=".7" strokeDasharray="3,3" opacity=".4"/>
        <line x1={pa.l} y1={opY} x2={pa.l+iw} y2={opY} stroke="#fff" strokeWidth=".7" strokeDasharray="3,3" opacity=".4"/>
        <circle cx={opX} cy={opY} r="6" fill="#ff6b35" stroke="#fff" strokeWidth="2" opacity=".95"/>
        <circle cx={opX} cy={opY} r="12" fill="none" stroke="#ff6b35" strokeWidth="1" opacity=".4"/>
      </>}

      {/* Axes labels */}
      <text x={pa.l+iw/2} y={H-2} fill="#cbd5e1" fontSize="11" textAnchor="middle" fontWeight="600">{L("axisV",lang)}</text>
      <text x="14" y={pa.t+ih/2} fill="#cbd5e1" fontSize="11" textAnchor="middle" fontWeight="600" transform={`rotate(-90,14,${pa.t+ih/2})`}>Δp [{puf.label}]</text>

      {/* Legend */}
      <g transform={`translate(${pa.l+iw-196},${pa.t+ih-64})`}>
        <rect x="0" y="0" width="192" height="60" rx="6" fill="#0f1729" fillOpacity=".92" stroke="#334155" strokeWidth=".7"/>
        {[{c:"#22c55e",k:"lgLam"},{c:"#f59e0b",k:"lgTra"},{c:"#3b82f6",k:"lgTur"}].map((it,i)=>(
          <g key={i} transform={`translate(8,${8+i*17})`}><rect x="0" y="0" width="12" height="12" rx="2" fill={it.c} opacity=".35" stroke={it.c} strokeWidth="1"/><text x="18" y="10" fill="#cbd5e1" fontSize="9.5" fontWeight="500">{L(it.k,lang)}</text></g>
        ))}
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════
//  TABLE
// ═══════════════════════════════════════════════
function Tbl({ T, Dmm, emm, pu, lang }) {
  const vs = [0.1,0.3,0.5,1,1.5,2,3,4,5,6,8,10];
  const Di = Dmm / 1000, A = Math.PI * Di * Di / 4;
  const puf = pressureUnits.find(u => u.id === pu) || pressureUnits[0];
  const rows = vs.map(v => { const Q = v * A; return { ...calc(T, Q, Dmm, emm, lang), Q }; });
  return (
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>
        <thead><tr style={{borderBottom:"2px solid #334155"}}>
          {["v [m/s]","Q [m³/s]","Q [m³/h]","Re [-]","f [-]",`Δp [${puf.label}]`,"Δh [mm/m]",L("regime",lang)].map(h=>(
            <th key={h} style={{padding:"8px 6px",textAlign:"right",color:"#94a3b8",fontWeight:600,fontSize:10,textTransform:"uppercase",letterSpacing:".04em"}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i} style={{borderBottom:"1px solid #1e293b",background:i%2?"rgba(255,255,255,.02)":"transparent"}}>
            <td style={{padding:6,textAlign:"right",color:"#e2e8f0",fontWeight:600}}>{r.v.toFixed(2)}</td>
            <td style={{padding:6,textAlign:"right",color:"#cbd5e1"}}>{r.Q.toExponential(3)}</td>
            <td style={{padding:6,textAlign:"right",color:"#cbd5e1"}}>{(r.Q*3600).toFixed(3)}</td>
            <td style={{padding:6,textAlign:"right",color:"#cbd5e1"}}>{r.Re<1e4?r.Re.toFixed(0):r.Re.toExponential(2)}</td>
            <td style={{padding:6,textAlign:"right",color:"#cbd5e1"}}>{r.f.toFixed(5)}</td>
            <td style={{padding:6,textAlign:"right",color:"#ff6b35",fontWeight:700}}>{(r.dp*puf.f).toFixed(puf.d)}</td>
            <td style={{padding:6,textAlign:"right",color:"#38bdf8"}}>{(r.hf*1000).toFixed(2)}</td>
            <td style={{padding:6,textAlign:"right"}}><span style={{color:r.reg.color,fontWeight:700,fontSize:10}}>{r.reg.label}</span></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  VALIDITY BAR
// ═══════════════════════════════════════════════
function VBar({ T, Dmm, lang }) {
  const { mu, rho } = interpolateWater(T);
  const Di = Dmm / 1000, nu = mu / rho;
  const vL = 2320 * nu / Di, vT = 4000 * nu / Di, M = 10;
  const z = [
    {l:L("rLam",lang),a:0,b:Math.min(vL,M),c:"#22c55e",d:L("anly",lang)},
    {l:L("rTra",lang),a:vL,b:Math.min(vT,M),c:"#f59e0b",d:L("unst",lang)},
    {l:L("rTur",lang),a:vT,b:M,c:"#3b82f6",d:L("cwOk",lang)},
  ].filter(z=>z.a<M&&z.b>0);
  const W=700,H=90,pl=10,iw=W-20,sx=v=>pl+(v/M)*iw;
  return (<div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",maxWidth:700,display:"block",margin:"0 auto"}}>
      {z.map((z,i)=><g key={i}><rect x={sx(z.a)} y={10} width={sx(z.b)-sx(z.a)} height={32} fill={z.c} opacity=".2" rx="4" stroke={z.c} strokeWidth="1.5"/><text x={(sx(z.a)+sx(z.b))/2} y={30} fill={z.c} fontSize="11" textAnchor="middle" fontWeight="700">{z.l}</text></g>)}
      {[0,1,2,3,4,5,6,7,8,9,10].map(v=><g key={v}><line x1={sx(v)} y1={42} x2={sx(v)} y2={50} stroke="#64748b" strokeWidth="1"/><text x={sx(v)} y={62} fill="#94a3b8" fontSize="9" textAnchor="middle">{v}</text></g>)}
      <text x={sx(5)} y={78} fill="#cbd5e1" fontSize="10" textAnchor="middle">{L("axisV",lang)}</text>
      <line x1={sx(4)} y1={8} x2={sx(4)} y2={50} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,2"/>
      <text x={sx(4)+2} y={8} fill="#ef4444" fontSize="7" fontWeight="600">&gt;4 m/s</text>
    </svg>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",marginTop:4}}>
      {z.map((z,i)=><div key={i} style={{fontSize:11,display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,borderRadius:2,background:z.c,display:"inline-block"}}/><span style={{color:"#cbd5e1"}}>{z.l}: </span><span style={{color:z.c}}>{z.d}</span></div>)}
    </div>
  </div>);
}

// ═══════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════
const flags = {pl:"🇵🇱",en:"🇬🇧",de:"🇩🇪",ua:"🇺🇦"};
const lnames = {pl:"Polski",en:"English",de:"Deutsch",ua:"Українська"};

export default function App() {
  const [lang,setLang]=useState("pl");
  const [temp,setTemp]=useState(20);
  const [fv,setFv]=useState(3.6);
  const [fui,setFui]=useState("m3h");
  const [dia,setDia]=useState(50);
  const [mi,setMi]=useState(0);
  const [pu,setPu]=useState("Pa");
  const [tab,setTab]=useState("calc");
  const [chartVmax,setChartVmax]=useState(2);

  const {rho}=interpolateWater(temp);
  const fu=flowUnits.find(u=>u.id===fui)||flowUnits[0];
  const puf=pressureUnits.find(u=>u.id===pu)||pressureUnits[0];
  const eps=pipeMaterials[mi].e;
  const Q=fu.toM3s(fv,rho);
  const r=useMemo(()=>calc(temp,Q,dia,eps,lang),[temp,Q,dia,eps,lang]);

  const switchFU=(nid)=>{const nf=flowUnits.find(u=>u.id===nid);setFui(nid);setFv(+(nf.fromM3s(fu.toM3s(fv,rho),rho)).toPrecision(6));};

  const $=k=>L(k,lang);
  const IS={background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"8px 10px",color:"#f1f5f9",fontSize:14,width:"100%",outline:"none",fontFamily:"'JetBrains Mono',monospace",transition:"border-color .2s"};
  const LS={fontSize:11,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:4,display:"block"};
  const ST={fontSize:16,fontWeight:800,color:"#f8fafc",margin:"24px 0 12px",letterSpacing:"-.02em"};

  return (
    <div style={{background:"linear-gradient(145deg,#0b0e1a,#111827 50%,#0f172a)",minHeight:"100vh",color:"#e2e8f0",fontFamily:"'Instrument Sans','DM Sans',-apple-system,sans-serif",padding:"24px 16px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        input[type=range]{-webkit-appearance:none;background:transparent;width:100%}
        input[type=range]::-webkit-slider-runnable-track{height:4px;background:#334155;border-radius:2px}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#ff6b35;margin-top:-6px;cursor:pointer;border:2px solid #0f172a}
        input:focus{border-color:#ff6b35!important} select{background:#0f172a;border:1px solid #334155;border-radius:6px;padding:8px 10px;color:#f1f5f9;font-size:14px;width:100%;outline:none} select:focus{border-color:#ff6b35}
        ::selection{background:#ff6b3540}
        .tb{padding:8px 14px;border:none;border-radius:6px 6px 0 0;cursor:pointer;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;transition:all .2s}
        .tb.a{background:#1e293b;color:#ff6b35}.tb:not(.a){background:transparent;color:#64748b}.tb:hover:not(.a){color:#94a3b8}
        .fb{background:#1e293b;border-left:3px solid #ff6b35;padding:16px 20px;border-radius:0 8px 8px 0;margin:12px 0;font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.7;color:#e2e8f0;overflow-x:auto}
        .rc{background:linear-gradient(135deg,#1e293b,#162032);border:1px solid #334155;border-radius:10px;padding:16px;text-align:center}
        .rv{font-size:24px;font-weight:800;font-family:'JetBrains Mono',monospace;letter-spacing:-.02em}
        .rl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-top:4px}
        .lb{padding:4px 10px;border:1px solid #334155;border-radius:6px;cursor:pointer;font-size:13px;transition:all .2s;background:transparent;color:#94a3b8}
        .lb.s{border-color:#ff6b35;background:#ff6b3518;color:#ff6b35}.lb:hover:not(.s){border-color:#64748b;color:#e2e8f0}
        .pu{padding:4px 12px;border-radius:6px;border:1px solid #334155;background:transparent;color:#94a3b8;cursor:pointer;font-size:12px;font-weight:700;transition:all .2s}
        .pu.s{border-color:#ff6b35;background:#ff6b3518;color:#ff6b35}
      `}</style>

      <div style={{maxWidth:820,margin:"0 auto"}}>
        {/* Language */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginBottom:12}}>
          {Object.keys(flags).map(l=><button key={l} className={`lb ${lang===l?"s":""}`} onClick={()=>setLang(l)}>{flags[l]} {lnames[l]}</button>)}
        </div>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:10,color:"#ff6b35",fontWeight:700,textTransform:"uppercase",letterSpacing:".2em",marginBottom:6}}>{$("headerSub")}</div>
          <h1 style={{fontSize:26,fontWeight:800,color:"#f8fafc",margin:0,letterSpacing:"-.03em",lineHeight:1.1}}>{$("headerTitle")}</h1>
          <p style={{fontSize:12,color:"#64748b",marginTop:6}}>{$("headerDesc")}</p>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:2,flexWrap:"wrap",borderBottom:"1px solid #334155"}}>
          {[["calc","tabCalc"],["theory","tabTheory"],["table","tabTable"],["validity","tabValidity"]].map(([id,k])=>(
            <button key={id} className={`tb ${tab===id?"a":""}`} onClick={()=>setTab(id)}>{$(k)}</button>
          ))}
        </div>

        <div style={{background:"#1e293b",borderRadius:"0 0 12px 12px",padding:24,border:"1px solid #334155",borderTop:"none"}}>

          {/* ═══ CALC ═══ */}
          {tab==="calc"&&(<div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <label style={LS}>{$("lblTemp")}</label>
                <input type="number" min={0} max={100} step={1} value={temp} onChange={e=>setTemp(+e.target.value)} style={IS}/>
                <input type="range" min={0} max={100} step={1} value={temp} onChange={e=>setTemp(+e.target.value)} style={{marginTop:4}}/>
                <div style={{fontSize:10,color:"#64748b",marginTop:2}}>ρ = {r.rho.toFixed(1)} kg/m³ · μ = {(r.mu*1e3).toFixed(3)} mPa·s</div>
              </div>
              <div>
                <label style={LS}>{$("lblDiam")}</label>
                <input type="number" min={5} max={2000} step={1} value={dia} onChange={e=>setDia(+e.target.value)} style={IS}/>
                <input type="range" min={10} max={500} step={1} value={dia} onChange={e=>setDia(+e.target.value)} style={{marginTop:4}}/>
              </div>
              <div>
                <label style={LS}>{$("lblFlow")} [{fu.label}]</label>
                <div style={{display:"flex",gap:6}}>
                  <input type="number" min={0} step={fu.step} value={fv} onChange={e=>setFv(+e.target.value)} style={{...IS,flex:1}}/>
                  <select value={fui} onChange={e=>switchFU(e.target.value)} style={{width:90,fontSize:12,padding:"6px 8px"}}>{flowUnits.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select>
                </div>
                <div style={{fontSize:10,color:"#64748b",marginTop:4}}>= {(Q*3600).toFixed(4)} m³/h = {(Q*1000).toFixed(4)} l/s = {Q.toExponential(4)} m³/s</div>
              </div>
              <div>
                <label style={LS}>{$("lblMaterial")}</label>
                <select value={mi} onChange={e=>setMi(+e.target.value)}>{pipeMaterials.map((m,i)=><option key={i} value={i}>{m.n[lang]||m.n.en} (ε={m.e} mm)</option>)}</select>
                <div style={{fontSize:10,color:"#64748b",marginTop:4}}>ε = {eps} mm · ε/D = {r.ed.toExponential(3)}</div>
              </div>
            </div>

            <div style={{marginTop:16,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{...LS,marginBottom:0}}>{$("lblPUnit")}:</span>
              {pressureUnits.map(u=><button key={u.id} className={`pu ${pu===u.id?"s":""}`} onClick={()=>setPu(u.id)}>{u.label}</button>)}
            </div>

            <div style={ST}>{$("results")}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              <div className="rc"><div className="rv" style={{color:"#38bdf8"}}>{r.v.toFixed(3)}</div><div className="rl">{$("velocity")}</div></div>
              <div className="rc"><div className="rv" style={{color:"#ff6b35"}}>{(r.dp*puf.f).toFixed(puf.d)}</div><div className="rl">{$("pLoss")} [{puf.label}]</div></div>
              <div className="rc"><div className="rv" style={{color:"#a78bfa"}}>{(r.hf*1000).toFixed(2)}</div><div className="rl">{$("hLoss")}</div></div>
              <div className="rc"><div className="rv" style={{color:r.reg.color}}>{r.Re<1e5?r.Re.toFixed(0):r.Re.toExponential(2)}</div><div className="rl">{$("reNum")}</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:12}}>
              <div className="rc"><div className="rv" style={{color:r.reg.color,fontSize:18}}>{r.reg.label}</div><div className="rl">{$("regime")}</div></div>
              <div className="rc"><div className="rv" style={{color:"#fbbf24",fontSize:18}}>{r.f.toFixed(5)}</div><div className="rl">{$("fCoeff")}</div></div>
              <div className="rc"><div className="rv" style={{color:"#34d399",fontSize:18}}>{(r.dp*1e-5).toFixed(6)}</div><div className="rl">Δp [bar/m]</div></div>
            </div>

            {r.v>4&&<div style={{background:"#3f1010",border:"1px solid #7f1d1d",borderRadius:8,padding:12,marginTop:16,fontSize:12,color:"#fca5a5"}}>⚠️ <strong>{$("warn").replace("{v}",r.v.toFixed(2))}</strong></div>}

            <div style={ST}>{$("chartTitle")}</div>
            <Chart T={temp} Dmm={dia} emm={eps} pu={pu} lang={lang} vCalc={r.v} dpCalc={r.dp} vMax={chartVmax}/>
            <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap"}}>{$("chartVmax")}:</span>
              <input type="range" min={0.1} max={10} step={0.1} value={chartVmax} onChange={e=>setChartVmax(+e.target.value)} style={{flex:1,minWidth:120}}/>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:"#ff6b35",minWidth:70,textAlign:"right"}}>{chartVmax.toFixed(1)} m/s</span>
            </div>
          </div>)}

          {/* ═══ THEORY ═══ */}
          {tab==="theory"&&(<div style={{lineHeight:1.8,fontSize:13.5}}>
            <h2 style={ST}>{$("th1")}</h2><p>{$("th1d")}</p>
            <div className="fb">Δp = f · (L / D) · (ρ · v² / 2) &nbsp;&nbsp;[Pa]</div>
            <p>{$("thW")}</p>
            <ul style={{paddingLeft:20,color:"#cbd5e1"}}>
              {[["Δp","thDp"],["f","thF"],["L","thL"],["D","thDi"],["ρ","thRho"],["v","thVe"]].map(([s,k])=><li key={k}><strong style={{color:"#ff6b35"}}>{s}</strong> — {$(k)}</li>)}
            </ul>
            <p>{$("thPm")}</p><div className="fb">Δp/L = f · (1/D) · (ρ · v² / 2) &nbsp;&nbsp;[Pa/m]</div>
            <h2 style={ST}>{$("th2")}</h2><div className="fb">v = 4·Q / (π · D²) &nbsp;&nbsp;[m/s]</div>
            <h2 style={ST}>{$("th3")}</h2><div className="fb">Re = v · D / ν = ρ · v · D / μ &nbsp;&nbsp;[-]</div>
            <p>{$("th3d")}</p>
            <ul style={{paddingLeft:20,color:"#cbd5e1"}}>
              <li>Re &lt; 2320 → <span style={{color:"#22c55e",fontWeight:700}}>{$("rLam")}</span></li>
              <li>2320 ≤ Re &lt; 4000 → <span style={{color:"#f59e0b",fontWeight:700}}>{$("rTra")}</span></li>
              <li>Re ≥ 4000 → <span style={{color:"#ef4444",fontWeight:700}}>{$("rTur")}</span></li>
            </ul>
            <h2 style={ST}>{$("th4")}</h2>
            <h3 style={{fontSize:14,color:"#38bdf8",marginTop:16,marginBottom:8}}>{$("th4a")}</h3>
            <div className="fb">f = 64 / Re</div><p>{$("th4ad")}</p>
            <h3 style={{fontSize:14,color:"#38bdf8",marginTop:16,marginBottom:8}}>{$("th4b")}</h3>
            <div className="fb">1/√f = −2 · log₁₀( ε/(3.7·D) + 2.51/(Re·√f) )</div>
            <p>{$("th4bd")}</p><div className="fb">f ≈ 0.25 / [ log₁₀( ε/(3.7·D) + 5.74/Re⁰·⁹ ) ]²</div>
            <h2 style={ST}>{$("th5")}</h2><div className="fb">h_f = Δp / (ρ · g) = f · (L/D) · (v² / (2·g)) &nbsp;&nbsp;[m]</div>
            <h2 style={ST}>{$("th6")}</h2>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>
              <thead><tr style={{borderBottom:"2px solid #334155"}}><th style={{padding:8,textAlign:"left",color:"#94a3b8"}}>{$("thMat")}</th><th style={{padding:8,textAlign:"right",color:"#94a3b8"}}>ε [mm]</th></tr></thead>
              <tbody>{pipeMaterials.map((m,i)=><tr key={i} style={{borderBottom:"1px solid #1e293b"}}><td style={{padding:"6px 8px",color:"#e2e8f0"}}>{m.n[lang]||m.n.en}</td><td style={{padding:"6px 8px",textAlign:"right",color:"#ff6b35",fontWeight:600}}>{m.e}</td></tr>)}</tbody>
            </table>
          </div>)}

          {/* ═══ TABLE ═══ */}
          {tab==="table"&&(<div>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>{$("tFor")} D={dia} mm · {pipeMaterials[mi].n[lang]||pipeMaterials[mi].n.en} · T={temp} °C · [{puf.label}]</p>
            <Tbl T={temp} Dmm={dia} emm={eps} pu={pu} lang={lang}/>
          </div>)}

          {/* ═══ VALIDITY ═══ */}
          {tab==="validity"&&(<div style={{lineHeight:1.8,fontSize:13.5}}>
            <h2 style={ST}>{$("vT")}</h2>
            <VBar T={temp} Dmm={dia} lang={lang}/>

            <h3 style={{fontSize:14,color:"#22c55e",marginTop:24,marginBottom:8}}>✅ {$("vOk")}</h3>
            <div style={{background:"#0f2918",border:"1px solid #16a34a40",borderRadius:8,padding:16,fontSize:13}}>
              <p><strong>1.</strong> {$("vO1")}</p><p style={{marginTop:8}}><strong>2.</strong> {$("vO2")}</p>
              <p style={{marginTop:8}}><strong>{$("vCond")}</strong></p>
              <ul style={{paddingLeft:20,marginTop:4}}>{["vC1","vC2","vC3","vC4","vC5","vC6"].map(k=><li key={k}>{$(k)}</li>)}</ul>
            </div>

            <h3 style={{fontSize:14,color:"#f59e0b",marginTop:24,marginBottom:8}}>⚠️ {$("vTr")}</h3>
            <div style={{background:"#291f0f",border:"1px solid #f59e0b40",borderRadius:8,padding:16,fontSize:13}}><p>{$("vTrd")}</p></div>

            <h3 style={{fontSize:14,color:"#ef4444",marginTop:24,marginBottom:8}}>❌ {$("vFa")}</h3>
            <div style={{background:"#290f0f",border:"1px solid #ef444440",borderRadius:8,padding:16,fontSize:13}}>
              {["vF1","vF2","vF3","vF4","vF5"].map((k,i)=><p key={k} style={{marginTop:i?8:0}}><strong>{i+1}.</strong> {$(k)}</p>)}
            </div>

            <h3 style={{fontSize:14,color:"#38bdf8",marginTop:24,marginBottom:8}}>📐 {$("vDes")}</h3>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>
              <thead><tr style={{borderBottom:"2px solid #334155"}}>
                <th style={{padding:8,textAlign:"left",color:"#94a3b8"}}>{$("vIT")}</th>
                <th style={{padding:8,textAlign:"right",color:"#94a3b8"}}>v [m/s]</th>
                <th style={{padding:8,textAlign:"right",color:"#94a3b8"}}>{$("vIR")}</th>
              </tr></thead>
              <tbody>
                {[["iSuc","0.5–1.5","iSuR"],["iDis","1.0–3.0","iDiR"],["iMai","0.5–2.0","iMaR"],["iHea","0.3–1.5","iHeR"],["iFir","≤ 5.0","iFiR"]].map(([tk,vel,rk],i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #1e293b"}}><td style={{padding:"6px 8px",color:"#e2e8f0"}}>{$(tk)}</td><td style={{padding:"6px 8px",textAlign:"right",color:"#38bdf8",fontWeight:600}}>{vel}</td><td style={{padding:"6px 8px",textAlign:"right",color:"#94a3b8"}}>{$(rk)}</td></tr>
                ))}
              </tbody>
            </table>

            <h3 style={{fontSize:14,color:"#a78bfa",marginTop:24,marginBottom:8}}>{$("vSum")}</h3>
            <div style={{background:"#1a1333",border:"1px solid #a78bfa40",borderRadius:8,padding:16,fontSize:13}}>
              {(()=>{
                const{rho:r2,mu:m2}=interpolateWater(temp);
                const Di=dia/1000,A=Math.PI*Di*Di/4,nu=m2/r2;
                const vLa=2320*nu/Di,vTu=4000*nu/Di;
                return(<>
                  <p>{$("vPipe")} (D={dia} mm, T={temp} °C, ν={(nu*1e6).toFixed(3)}×10⁻⁶ m²/s):</p>
                  <ul style={{paddingLeft:20,marginTop:8}}>
                    <li><span style={{color:"#22c55e"}}>{$("rLam")}:</span> v &lt; <strong>{vLa.toFixed(4)} m/s</strong> → Q &lt; <strong>{(vLa*A*3600).toFixed(4)} m³/h</strong></li>
                    <li><span style={{color:"#f59e0b"}}>{$("rTra")}:</span> v = {vLa.toFixed(4)} – {vTu.toFixed(4)} m/s → <em>{$("vAvoid")}</em></li>
                    <li><span style={{color:"#3b82f6"}}>{$("rTur")}:</span> v &gt; <strong>{vTu.toFixed(4)} m/s</strong> → Q &gt; <strong>{(vTu*A*3600).toFixed(4)} m³/h</strong></li>
                    <li><span style={{color:"#ef4444"}}>{$("vEng")}:</span> v ≤ <strong>3 m/s</strong> → Q ≤ <strong>{(3*A*3600).toFixed(3)} m³/h</strong></li>
                    <li><span style={{color:"#ef4444"}}>{$("vCav")}:</span> v &gt; <strong>4–6 m/s</strong> — {$("vCavD")}</li>
                  </ul>
                </>);
              })()}
            </div>
          </div>)}
        </div>

        <div style={{textAlign:"center",marginTop:20,fontSize:10,color:"#475569"}}>Darcy-Weisbach · Colebrook-White (1939) · Moody Chart · IAPWS-95</div>
      </div>
    </div>
  );
}
