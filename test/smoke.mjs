import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/'
});
const { window } = dom;

// stuby brakujące w jsdom
window.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
let seq = 0;
const boxes = new Map();
window.Element.prototype.getBoundingClientRect = function () {
  if (!boxes.has(this)) {
    const i = seq++;
    boxes.set(this, {
      left: 40 + (i % 5) * 220,
      top: 30 + Math.floor(i / 5) * 90,
      width: 180,
      height: 60
    });
  }
  const b = boxes.get(this);
  return { ...b, right: b.left + b.width, bottom: b.top + b.height, x: b.left, y: b.top };
};
Object.defineProperty(window.HTMLElement.prototype, 'offsetParent', {
  get() {
    return this.closest('.hidden') ? null : window.document.body;
  }
});

globalThis.window = window;
globalThis.document = window.document;
globalThis.customElements = window.customElements;
globalThis.HTMLElement = window.HTMLElement;
globalThis.Event = window.Event;
globalThis.CustomEvent = window.CustomEvent;
globalThis.ResizeObserver = window.ResizeObserver;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.MouseEvent = window.MouseEvent;

const cardUrl = new URL('../dist/energy-flow-card.js', import.meta.url).href;
await import(cardUrl);

const LAY_ALL = ['strings', 'solar', 'hub', 'grid', 'batt', 'consumers'];
const fails = [];
const ok = (cond, msg) => {
  if (!cond) fails.push(msg);
  console.log((cond ? '  OK   ' : '  FAIL ') + msg);
};

const S = (id, state, unit, extra = {}) => [
  id,
  { entity_id: id, state: String(state), attributes: { unit_of_measurement: unit, ...extra } }
];

const hass = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.inv1_p', 2.38, 'kW'),
    S('sensor.inv1_e', 9.8, 'kWh'),
    S('sensor.inv2_p', 3120, 'W'),
    S('sensor.inv2_e', 14.6, 'kWh'),
    S('sensor.inv3_p', 'unavailable', 'W'),
    S('sensor.inv3_e', 'unavailable', 'kWh'),
    S('sensor.grid_p', 6200, 'W'),
    S('sensor.grid_imp', 3.4, 'kWh'),
    S('sensor.grid_exp', 11200, 'Wh'),
    S('sensor.batt_p', 1.4, 'kW'),
    S('sensor.batt_soc', 78, '%'),
    S('sensor.batt_e', 8.2, 'kWh'),
    S('sensor.hp_p', 1650, 'W'),
    S('sensor.hp_e', 12.4, 'kWh'),
    S('sensor.ac_p', 420, 'W'),
    S('sensor.ac_e', 0.98, 'kWh'),
    S('sensor.bed_p', 0, 'W'),
    S('sensor.bed_e', 0, 'kWh'),
    S('sensor.fridge_p', 78, 'W'),
    S('sensor.fridge_e', 0.31, 'kWh')
  ]),
  callWS: async (msg) => {
    if (msg.type === 'history/history_during_period') {
      const out = {};
      msg.entity_ids.forEach((id) => {
        out[id] = Array.from({ length: 20 }, (_, i) => ({
          s: String(500 + i * 37),
          lu: (new Date(msg.start_time).getTime() + i * 600000) / 1000
        }));
      });
      return out;
    }
    if (msg.type === 'recorder/statistics_during_period') {
      const out = {};
      msg.statistic_ids.forEach((id) => {
        out[id] = Array.from({ length: 12 }, (_, i) => ({
          start: new Date(msg.start_time).getTime() + i * 3600000,
          change: 0.4 + i * 0.05
        }));
      });
      return out;
    }
    throw new Error('nieobsługiwany typ: ' + msg.type);
  }
};

const card = document.createElement('energy-flow-card');
card.setConfig({
  type: 'custom:energy-flow-card',
  title: 'Przepływ energii',
  solar: {
    strings: [
      { name: 'Falownik 1 · wschód', power: 'sensor.inv1_p', energy: 'sensor.inv1_e' },
      { name: 'Falownik 2 · południe', power: 'sensor.inv2_p', energy: 'sensor.inv2_e' },
      { name: 'Falownik 3 · zachód', power: 'sensor.inv3_p', energy: 'sensor.inv3_e' }
    ]
  },
  grid: { power: 'sensor.grid_p', energy_import: 'sensor.grid_imp', energy_export: 'sensor.grid_exp' },
  battery: { power: 'sensor.batt_p', soc: 'sensor.batt_soc', energy: 'sensor.batt_e' },
  groups: [
    {
      name: 'Klimat',
      icon: 'climate',
      expanded: true,
      devices: [
        { name: 'Pompa ciepła', icon: 'climate', power: 'sensor.hp_p', energy: 'sensor.hp_e' },
        { name: 'Klimatyzator salon', icon: 'fan', power: 'sensor.ac_p', energy: 'sensor.ac_e' },
        { name: 'Klimatyzator sypialnia', icon: 'fan', power: 'sensor.bed_p', energy: 'sensor.bed_e' }
      ]
    },
    {
      name: 'Kuchnia',
      icon: 'stove',
      devices: [{ name: 'Lodówka', icon: 'stove', power: 'sensor.fridge_p', energy: 'sensor.fridge_e' }]
    }
  ]
});
document.body.appendChild(card);
// karta w układzie desktopowym: 1500 px
card._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
card.hass = hass;
await new Promise((r) => setTimeout(r, 30));

const html = card.shadowRoot.innerHTML;
const txt = card.shadowRoot.textContent;

console.log('\n— model i formatowanie —');
const m = card._m;
ok(Math.abs(m.solar.power - 5500) < 1, `suma PV pomija niedostępny string: ${m.solar.power} W (oczek. 5500)`);
ok(Math.abs(m.solar.energy - 24.4) < 0.01, `suma energii PV: ${m.solar.energy} kWh (oczek. 24.4)`);
ok(m.strings[2].off === true, 'string 3 oznaczony jako niedostępny');
ok(Math.abs(m.house.power - 2148) < 1, `moc domu = suma urządzeń: ${m.house.power} W (oczek. 2148)`);
ok(Math.abs(m.grid.energyExport - 11.2) < 0.001, `Wh → kWh dla eksportu: ${m.grid.energyExport} (oczek. 11.2)`);
ok(m.battery.soc === 78, `SOC: ${m.battery.soc}`);
ok(m.house.selfPct === 0, `samowystarczalność przy poborze 6,2 kW > zużycie: ${m.house.selfPct}%`);
ok(m.groups[0].active === 2, `aktywne urządzenia w grupie Klimat: ${m.groups[0].active} (oczek. 2)`);

console.log('\n— teksty po polsku —');
ok(txt.includes('Pobór z sieci'), 'etykieta „Pobór z sieci"');
ok(txt.includes('Ładowanie akumulatora'), 'etykieta „Ładowanie akumulatora"');
ok(txt.includes('samowystarczalności'), 'wskaźnik samowystarczalności');
ok(txt.includes('Odbiorniki · 4 urządzenia w 2 grupach'), 'odmiana: „4 urządzenia w 2 grupach"');
ok(txt.includes('3 urządzenia · 2 aktywne'), 'odmiana w meta grupy: ' + (txt.match(/3 urządzenia · \d+ \S+/) || [''])[0]);
ok(txt.includes('Zwiń wszystko'), 'przycisk „Zwiń wszystko" przy rozwiniętej grupie');
ok(txt.includes('niedostępny'), 'niedostępna encja opisana słownie');
ok(txt.includes('5,50 kW'), 'polski separator dziesiętny: ' + (txt.match(/5[,.]50 kW/) || ['brak'])[0]);
ok(txt.includes('78% · 8,20 kWh'), 'SOC + energia akumulatora');
ok(txt.includes('↓ 3,40 kWh   ↑ 11,2 kWh'), 'import/eksport sieci: ' + (txt.match(/↓[^<]*/) || [''])[0].trim());

console.log('\n— połączenia SVG —');
const paths = [...card.shadowRoot.querySelectorAll('#lyr-idle path')];
const act = [...card.shadowRoot.querySelectorAll('#lyr-act path')];
ok(paths.length === 8, `linie bazowe: ${paths.length} (3 stringi + PV→dom + sieć→dom + dom→akum. + 2 grupy = 8)`);
ok(act.length >= 6, `linie animowane (bez bezczynnych): ${act.length}`);
ok(paths.every((p) => /^M [\d.-]+ [\d.-]+ C /.test(p.getAttribute('d'))), 'wszystkie ścieżki to poprawne krzywe Béziera');
ok(
  paths.some((p) => p.getAttribute('stroke-dasharray') === '3 6'),
  'niedostępny string ma linię kropkowaną'
);

console.log('\n— tryb wąski (mobile) —');
card._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 900 });
card._measure();
await new Promise((r) => setTimeout(r, 30));
ok(card._narrow === true, 'poniżej 720 px karta przechodzi w tryb pionowy');
ok(card._q.grid.classList.contains('narrow'), 'siatka dostaje klasę narrow');
ok(card._q.stringlist.classList.contains('hidden') === false, 'stringi składają się do zwijanej listy');
ok(card.shadowRoot.textContent.includes('3 stringi falownika'), 'odmiana: „3 stringi falownika"');

console.log('\n— okno historii —');
card._openModal(card._nodes['dev_d0_0'], 'dev_d0_0');
await new Promise((r) => setTimeout(r, 50));
const mtxt = card._modalHost.textContent;
ok(mtxt.includes('Pompa ciepła'), 'nagłówek modala');
ok(mtxt.includes('Dziś') && mtxt.includes('Wczoraj') && mtxt.includes('30 dni'), 'zakresy po polsku');
ok(!!card._modal.chart, 'wykres zbudowany z danych rejestratora');
ok(card._modal.chart.line.startsWith('M 0.0 '), 'ścieżka wykresu mocy');
ok(card._modal.chart.bars.length === 12, `słupki energii ze statystyk: ${card._modal.chart.bars.length}`);
ok(mtxt.includes('godzinowo'), 'podpis „godzinowo" dla zakresu jednodniowego');

// celownik podążający za kursorem
const cw = card._modalHost.querySelector('.chart-wrap');
const cwBox = { left: 100, top: 50, width: 600, height: 200 };
cw.getBoundingClientRect = () => ({ ...cwBox, right: 700, bottom: 250, x: 100, y: 50 });
ok(!!cw.querySelector('.cross-line') && !!cw.querySelector('.cross-dot'), 'elementy celownika w wykresie mocy');
ok(cw.querySelector('.cross-line').style.display === '', 'celownik ukryty przed najechaniem');
cw.dispatchEvent(new MouseEvent('mousemove', { clientX: 400, clientY: 150, bubbles: true }));
const ctip = cw.querySelector('.cross-tip');
ok(cw.querySelector('.cross-line').style.display === 'block', 'ruch myszy pokazuje pionową linię');
// linia przyskakuje do najbliższej próbki, żeby punkt leżał dokładnie na serii
const lineX = parseFloat(cw.querySelector('.cross-line').style.left);
const spacing = 600 / (card._modal.chart.pts.length - 1);
// +0.1 px: pozycja jest zapisywana z dokładnością do jednego miejsca po przecinku
ok(Math.abs(lineX - 300) <= spacing / 2 + 0.1, `linia przyskakuje do próbki przy kursorze: ${lineX}px (odstęp próbek ${spacing.toFixed(1)}px)`);
ok(/W$/.test(ctip.querySelector('.v').textContent), `wartość pod kursorem: ${ctip.querySelector('.v').textContent}`);
ok(/^\d{2}:\d{2}$/.test(ctip.querySelector('.t').textContent), `godzina punktu: ${ctip.querySelector('.t').textContent}`);
ok(cw.querySelector('.cross-dot').style.display === 'block', 'punkt na serii widoczny');
const dotTop = parseFloat(cw.querySelector('.cross-dot').style.top);
ok(dotTop >= 0 && dotTop <= 200, `punkt w granicach wykresu: ${dotTop}px`);
cw.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
ok(cw.querySelector('.cross-line').style.display === 'none', 'zjechanie myszą chowa celownik');

const bw = card._modalHost.querySelector('.bars-wrap');
bw.getBoundingClientRect = () => ({ left: 100, top: 300, width: 600, height: 110, right: 700, bottom: 410, x: 100, y: 300 });
bw.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 350, bubbles: true }));
ok(/kWh$/.test(bw.querySelector('.cross-tip .v').textContent), `słupki też mają odczyt: ${bw.querySelector('.cross-tip .v').textContent}`);

card._modal.range = 'custom';
card._renderModal();
ok(card._modalHost.textContent.includes('wybierz datę początkową'), 'kalendarz zakresu własnego');
ok([...card._modalHost.querySelectorAll('.pk-dow')].map((e) => e.textContent).join(' ') === 'pon wt śr czw pt sob ndz', 'tydzień od poniedziałku, po polsku');

console.log('\n— brak encji / degradacja —');
const card2 = document.createElement('energy-flow-card');
card2.setConfig({ type: 'custom:energy-flow-card', groups: [{ name: 'Test', devices: [{ name: 'X', power: 'sensor.nie_ma' }] }] });
document.body.appendChild(card2);
card2.hass = hass;
ok(card2.shadowRoot.querySelector('.sumwrap').classList.contains('hidden'), 'brak PV → sekcja ukryta');
ok(card2.shadowRoot.querySelector('.gridwrap').classList.contains('hidden'), 'brak sieci → sekcja ukryta');
ok(card2.shadowRoot.textContent.includes('brak'), 'nieistniejąca encja pokazuje „brak"');
ok(card2._m.house.power === 0, 'moc domu = 0 bez odczytów');

console.log('\n— listy encji, invert, brak pomiaru mocy —');
const hass3 = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.load_consumed', -2148, 'W'), // Fronius raportuje zużycie ujemnie
    S('sensor.meter_p', -6200, 'W'), // dodatnie = eksport → wymaga invert
    S('sensor.s1', 0.5, 'kWh'),
    S('sensor.s2', 1.5, 'kWh'),
    S('sensor.s3', 'unavailable', 'kWh'),
    S('sensor.p1', 300, 'W'),
    S('sensor.p2', 700, 'W')
  ]),
  callWS: async () => ({})
};
const card3 = document.createElement('energy-flow-card');
card3.setConfig({
  type: 'custom:energy-flow-card',
  grid: { power: 'sensor.meter_p', invert: true },
  house: { power: 'sensor.load_consumed', invert: true },
  groups: [
    {
      name: 'Sonoff',
      devices: [
        { name: 'Zestaw 1', energy: ['sensor.s1', 'sensor.s2', 'sensor.s3'] },
        { name: 'Zestaw 2', power: ['sensor.p1', 'sensor.p2'], energy: 'sensor.s1' }
      ]
    }
  ]
});
document.body.appendChild(card3);
card3._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
card3.hass = hass3;
await new Promise((r) => setTimeout(r, 30));
const g3 = card3._m.groups[0];
ok(card3._m.house.power === 2148, `invert domu: ${card3._m.house.power} W (oczek. 2148)`);
ok(card3._m.grid.power === 6200, `invert sieci: ${card3._m.grid.power} W (oczek. 6200)`);
ok(card3.shadowRoot.textContent.includes('Pobór z sieci'), 'po invert kierunek sieci = pobór');
ok(Math.abs(g3.devices[0].energy - 2) < 0.001, `suma listy energii z pominięciem niedostępnej: ${g3.devices[0].energy} kWh`);
ok(g3.devices[0].unset === true && g3.devices[0].off === false, 'urządzenie bez encji mocy nie jest wygaszone');
ok(g3.devices[1].power === 1000, `suma listy mocy: ${g3.devices[1].power} W`);
ok(g3.power === 1000, `moc grupy z listy: ${g3.power} W`);
ok(card3._nodes['dev_d0_0'].energyEntities.length === 3, 'modal dostaje wszystkie encje z listy');
ok(card3._nodes['dev_d0_1'].entityId === '2 encji · suma', `podpis listy: ${card3._nodes['dev_d0_1'].entityId}`);
ok(card3.shadowRoot.querySelector('[data-node="dev_d0_0"]').getAttribute('data-off') === null, 'brak data-off przy samym liczniku energii');

console.log('\n— invert nie dotyczy energii, dom sumuje moc odbiorników —');
const hass5 = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.zuzycie_licznik', 38660, 'kWh'), // licznik narastający, zawsze dodatni
    S('sensor.zero_w', 0, 'W'),
    S('sensor.pv', 16900, 'W'),
    S('sensor.siec', -6890, 'W'), // ujemne = oddawanie
    S('sensor.gniazdko_1', 1200, 'W'),
    S('sensor.gniazdko_2', 800, 'W'),
    S('sensor.gniazdko_e', 2.67, 'kWh')
  ]),
  callWS: async () => ({})
};
const mk = (housePower) => {
  const el = document.createElement('energy-flow-card');
  el.setConfig({
    type: 'custom:energy-flow-card',
    solar: { power: 'sensor.pv', strings: [{ name: 'S1', power: 'sensor.pv' }] },
    grid: { power: 'sensor.siec' },
    house: Object.assign({ energy: 'sensor.zuzycie_licznik', invert: true }, housePower ? { power: housePower } : {}),
    groups: [
      {
        name: 'Gniazdka',
        expanded: true,
        devices: [{ name: 'G1', power: ['sensor.gniazdko_1', 'sensor.gniazdko_2'], energy: 'sensor.gniazdko_e' }]
      }
    ]
  });
  document.body.appendChild(el);
  el._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
  el.hass = hass5;
  return el;
};

const c5 = mk(null);
await new Promise((r) => setTimeout(r, 30));
ok(c5._m.house.energy === 38660, `invert nie odwraca licznika energii: ${c5._m.house.energy} kWh`);
ok(c5.shadowRoot.textContent.includes('38,66 MWh'), 'energia domu dodatnia na karcie');
ok(c5._m.house.power === 2000, `dom sumuje moc odbiorników: ${c5._m.house.power} W (oczek. 2000)`);
ok(c5.shadowRoot.textContent.includes('Oddanie do sieci'), 'ujemna moc sieci = oddawanie');
ok(c5._nodes['grp-gniazdka_0'].entityId === '2 encji w grupie', `dymek grupy liczy encje: ${c5._nodes['grp-gniazdka_0'].entityId}`);

const c5b = mk('sensor.zero_w');
await new Promise((r) => setTimeout(r, 30));
ok(
  c5b.shadowRoot.querySelector('[data-node="hub"] [data-f="pwr"]').textContent === '0 W',
  `encja 0 W z invert nie daje „-0 W" (jest: ${c5b.shadowRoot.querySelector('[data-node="hub"] [data-f="pwr"]').textContent})`
);

const c5c = mk('auto');
await new Promise((r) => setTimeout(r, 30));
ok(c5c._m.house.power === 10010, `power: auto = PV + sieć − akumulator: ${c5c._m.house.power} W (oczek. 10010)`);
ok(c5c._m.house.selfPct === 100, `przy oddawaniu do sieci: ${c5c._m.house.selfPct}% samowystarczalności`);

console.log('\n— rozróżnienie: brak encji vs encja niedostępna —');
const hass4 = {
  themes: { darkMode: true },
  states: Object.fromEntries([S('sensor.jest_ale_niedostepny', 'unavailable', 'W'), S('sensor.ok_energia', 1.5, 'kWh')]),
  callWS: async () => ({})
};
const card4 = document.createElement('energy-flow-card');
card4.setConfig({
  type: 'custom:energy-flow-card',
  grid: { power: 'sensor.nie_istnieje_wcale' },
  groups: [
    {
      name: 'Diagnostyka',
      expanded: true,
      devices: [
        { name: 'Literówka', power: 'sensor.tez_nie_istnieje' },
        { name: 'Niedostępny', power: 'sensor.jest_ale_niedostepny' },
        { name: 'Tylko energia', energy: 'sensor.ok_energia' }
      ]
    }
  ]
});
document.body.appendChild(card4);
card4._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
card4.hass = hass4;
await new Promise((r) => setTimeout(r, 30));
const dtxt = (k) => card4.shadowRoot.querySelector(`[data-node="${k}"] [data-f="pwr"]`).textContent;
ok(dtxt('dev_d0_0') === 'brak encji', `literówka w id → „brak encji" (jest: ${dtxt('dev_d0_0')})`);
ok(dtxt('dev_d0_1') === 'brak', `encja istnieje, ale unavailable → „brak" (jest: ${dtxt('dev_d0_1')})`);
ok(dtxt('dev_d0_2') === '—', `sam licznik energii → „—" bez wygaszania (jest: ${dtxt('dev_d0_2')})`);
ok(
  card4.shadowRoot.querySelector('[data-node="dev_d0_2"]').getAttribute('data-off') === null,
  'urządzenie z samą energią nie dostaje data-off'
);
ok(card4.shadowRoot.textContent.includes('Sieć · brak encji'), 'nieistniejąca encja sieci opisana wprost');
ok(card4._missing.has('sensor.nie_istnieje_wcale') && card4._missing.has('sensor.tez_nie_istnieje'), 'lista brakujących encji zebrana do ostrzeżenia');
ok(card4._missing.has('sensor.jest_ale_niedostepny') === false, 'encja unavailable nie trafia na listę brakujących');

console.log('\n— kanały modułu: osobno + suma —');
const hass6 = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.k1_p', 120, 'W'),
    S('sensor.k2_p', 80, 'W'),
    S('sensor.k1_e', 1.2, 'kWh'),
    S('sensor.k2_e', 0.8, 'kWh'),
    S('sensor.inne_p', 500, 'W')
  ]),
  callWS: async () => ({})
};
const c6 = document.createElement('energy-flow-card');
c6.setConfig({
  type: 'custom:energy-flow-card',
  groups: [
    {
      name: 'Gniazdka',
      expanded: true,
      devices: [
        {
          name: 'Napowietrzanie stawu',
          icon: 'plug',
          expanded: true,
          devices: [
            { name: 'Kanał 1', power: 'sensor.k1_p', energy: 'sensor.k1_e' },
            { name: 'Kanał 2', power: 'sensor.k2_p', energy: 'sensor.k2_e' }
          ]
        },
        { name: 'Inne', power: 'sensor.inne_p' }
      ]
    }
  ]
});
document.body.appendChild(c6);
c6._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
c6.hass = hass6;
await new Promise((r) => setTimeout(r, 30));

const mod = c6._m.groups[0].devices[0];
ok(mod.power === 200, `moduł sumuje kanały: ${mod.power} W (oczek. 200)`);
ok(Math.abs(mod.energy - 2) < 0.001, `moduł sumuje energię kanałów: ${mod.energy} kWh`);
ok(mod.children.length === 2 && mod.children[0].power === 120, 'kanały widoczne osobno z własnymi wartościami');
ok(c6._m.groups[0].power === 700, `grupa liczy moduł raz, bez podwajania: ${c6._m.groups[0].power} W (oczek. 700)`);
ok(c6._m.groups[0].leafCount === 3, `liczone są kanały, nie moduły: ${c6._m.groups[0].leafCount} urządzeń`);
ok(c6.shadowRoot.textContent.includes('3 urządzenia'), 'meta grupy podaje liczbę kanałów');

const rowP = (k) => c6.shadowRoot.querySelector(`[data-node="dev_${k}"] [data-f="pwr"]`).textContent;
ok(rowP('d0_0') === '200 W', `wiersz modułu pokazuje sumę: ${rowP('d0_0')}`);
ok(rowP('d0_0_0') === '120 W' && rowP('d0_0_1') === '80 W', 'wiersze kanałów pokazują własną moc');
const body = c6.shadowRoot.querySelector('[data-devbody="d0_0"]');
ok(!!body && body.classList.contains('hidden') === false, 'expanded: true rozwija kanały od razu');
c6.shadowRoot.querySelector('[data-devtoggle="d0_0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
ok(body.classList.contains('hidden'), 'klik w moduł zwija kanały');
ok(!c6._modalHost, 'klik w moduł nie otwiera okna historii');
c6.shadowRoot.querySelector('[data-node="dev_d0_0_0"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
ok(!!c6._modalHost, 'klik w kanał otwiera historię');
ok(c6._modalHost.textContent.includes('Kanał 1'), 'historia dotyczy klikniętego kanału');
c6._closeModal();
ok(c6._nodes['dev_d0_0'].powerEntities.length === 2, 'historia modułu sumuje encje obu kanałów');

console.log('\n— autonomia z encji zamiast wyliczenia —');
const hass9 = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.dom_p', 2000, 'W'),
    S('sensor.siec9', 1500, 'W'),
    S('sensor.autonomia', 100, '%')
  ]),
  callWS: async () => ({})
};
const mkSelf = (extra) => {
  const el = document.createElement('energy-flow-card');
  el.setConfig({
    type: 'custom:energy-flow-card',
    grid: { power: 'sensor.siec9' },
    house: Object.assign({ power: 'sensor.dom_p' }, extra),
    groups: []
  });
  document.body.appendChild(el);
  el._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
  el.hass = hass9;
  return el;
};
const sf1 = mkSelf({});
await new Promise((r) => setTimeout(r, 30));
ok(sf1._m.house.selfPct === 25, `bez encji liczone z bilansu: ${sf1._m.house.selfPct}% (2000 W, 1500 W z sieci)`);
const sf2 = mkSelf({ self_sufficiency: 'sensor.autonomia' });
await new Promise((r) => setTimeout(r, 30));
ok(sf2._m.house.selfPct === 100, `encja Fronius ma pierwszeństwo: ${sf2._m.house.selfPct}%`);
ok(sf2.shadowRoot.textContent.includes('100% samowystarczalności'), 'wartość z encji trafia na kartę');

console.log('\n— język: pl / en / auto —');
const langCfg = (language) => ({
  type: 'custom:energy-flow-card',
  language,
  grid: { power: 'sensor.grid_p' },
  battery: { power: 'sensor.batt_p', soc: 'sensor.batt_soc' },
  groups: [{ name: 'Klimat', expanded: true, devices: [{ name: 'D', power: 'sensor.hp_p' }] }]
});
const mkLang = (language, hassLang) => {
  const el = document.createElement('energy-flow-card');
  el.setConfig(langCfg(language));
  document.body.appendChild(el);
  el._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
  el.hass = Object.assign({}, hass, { language: hassLang || 'pl' });
  return el;
};

const lpl = mkLang('pl');
await new Promise((r) => setTimeout(r, 30));
ok(lpl.shadowRoot.textContent.includes('Pobór z sieci'), 'pl: etykieta sieci');
ok(lpl.shadowRoot.textContent.includes('Ładowanie akumulatora'), 'pl: etykieta akumulatora');
ok(lpl.shadowRoot.textContent.includes('Odbiorniki · 1 urządzenie w 1 grupie'), 'pl: odmiana liczebników');
ok(lpl.shadowRoot.textContent.includes('Zużycie'), 'pl: legenda');

const len = mkLang('en');
await new Promise((r) => setTimeout(r, 30));
ok(len.shadowRoot.textContent.includes('Grid import'), 'en: etykieta sieci');
ok(len.shadowRoot.textContent.includes('Battery charging'), 'en: etykieta akumulatora');
ok(len.shadowRoot.textContent.includes('Consumers · 1 device in 1 group'), 'en: liczba pojedyncza');
ok(len.shadowRoot.textContent.includes('Consumption'), 'en: legenda');
ok(len.shadowRoot.textContent.includes('self-sufficient'), 'en: wskaźnik samowystarczalności');
ok(len.shadowRoot.getElementById('lay-toggle').textContent.includes('Layout'), 'en: przycisk układu');
ok(len.shadowRoot.textContent.includes('6.20 kW'), `en: kropka dziesiętna: ${(len.shadowRoot.textContent.match(/6[.,]20 kW/) || ['brak'])[0]}`);
ok(lpl.shadowRoot.textContent.includes('6,20 kW'), 'pl: przecinek dziesiętny');

const lauto = mkLang('auto', 'en');
await new Promise((r) => setTimeout(r, 30));
ok(lauto.shadowRoot.textContent.includes('Grid import'), 'auto: język brany z Home Assistanta');
const lauto2 = mkLang('auto', 'de');
await new Promise((r) => setTimeout(r, 30));
ok(lauto2.shadowRoot.textContent.includes('Pobór z sieci'), 'auto: nieznany język spada na polski');

len._openModal(len._nodes.grid, 'grid');
await new Promise((r) => setTimeout(r, 40));
ok(len._modalHost.textContent.includes('Today') && len._modalHost.textContent.includes('7 days'), 'en: zakresy w historii');
len._modal.range = 'custom';
len._renderModal();
ok([...len._modalHost.querySelectorAll('.pk-dow')].map((e) => e.textContent).join(' ') === 'Mon Tue Wed Thu Fri Sat Sun', 'en: dni tygodnia');
ok(/January|February|March|April|May|June|July|August|September|October|November|December/.test(len._modalHost.textContent), 'en: nazwa miesiąca');
len._closeModal();

console.log('\n— PV: napięcie, prąd, wykorzystanie mocy —');
const hass8 = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.pv1_p', 6850, 'W'),
    S('sensor.pv1_u', 620.4, 'V'),
    S('sensor.pv1_i', 11.04, 'A'),
    S('sensor.pv2_p', 10.1, 'kW'),
    S('sensor.pv2_u', 598, 'V'),
    S('sensor.pv2_i', 16.9, 'A')
  ]),
  callWS: async () => ({})
};
const c8 = document.createElement('energy-flow-card');
c8.setConfig({
  type: 'custom:energy-flow-card',
  solar: {
    strings: [
      { name: 'Falownik 1', power: 'sensor.pv1_p', voltage: 'sensor.pv1_u', current: 'sensor.pv1_i', max_power: 14900 },
      { name: 'Falownik 2', power: 'sensor.pv2_p', voltage: 'sensor.pv2_u', current: 'sensor.pv2_i', max_power: 10000 }
    ]
  },
  groups: []
});
document.body.appendChild(c8);
c8._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
c8.hass = hass8;
await new Promise((r) => setTimeout(r, 30));
const s8 = c8._m.strings;
ok(s8[0].volt === 620.4 && s8[0].amp === 11.04, `odczyt V i A: ${s8[0].volt} V / ${s8[0].amp} A`);
ok(s8[0].pct === 46, `wykorzystanie stringu 1: ${s8[0].pct}% (6850 z 14900)`);
ok(s8[1].pct === 101, `wykorzystanie stringu 2 powyżej 100%: ${s8[1].pct}% (10,1 kW z 10 kW)`);
const dc0 = c8.shadowRoot.querySelector('[data-node="s_str0"] [data-f="dc"]');
ok(!dc0.classList.contains('hidden'), 'wiersz DC widoczny, gdy podano V/A');
ok(dc0.textContent.includes('620,4 V') && dc0.textContent.includes('11,04 A'), `wiersz DC: ${dc0.textContent}`);
ok(dc0.textContent.includes('46%'), 'procent wykorzystania w wierszu DC');
const bar0 = dc0.querySelector('.dc-bar i');
ok(bar0 && bar0.style.width === '46%', `pasek wykorzystania: ${bar0 && bar0.style.width}`);
const bar1 = c8.shadowRoot.querySelector('[data-node="s_str1"] .dc-bar i');
ok(bar1.style.width === '100%', `pasek przycięty do 100% przy 101%: ${bar1.style.width}`);
ok(c8._m.solar.maxPower === 24900, `moc szczytowa sumowana ze stringów: ${c8._m.solar.maxPower} W`);
ok(c8._m.solar.pct === 68, `wykorzystanie całej instalacji: ${c8._m.solar.pct}% (16,95 z 24,9 kW)`);
ok(c8.shadowRoot.querySelector('[data-node="solar-sum"] [data-f="ac"]').textContent.includes('68%'), 'procent w wierszu AC sumy PV');

// strona AC falownika: V, A, Hz, status + własna moc znamionowa
const hass8b = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.pv_sum', 5970, 'W'),
    S('sensor.ac_u', 240, 'V'),
    S('sensor.ac_i', 3.6, 'A'),
    S('sensor.ac_f', 49.9, 'Hz'),
    S('sensor.inv_status', 'Running')
  ]),
  callWS: async () => ({})
};
const c8c = document.createElement('energy-flow-card');
c8c.setConfig({
  type: 'custom:energy-flow-card',
  solar: {
    power: 'sensor.pv_sum',
    max_power: 8000,
    voltage: 'sensor.ac_u',
    current: 'sensor.ac_i',
    frequency: 'sensor.ac_f',
    status: 'sensor.inv_status',
    strings: [{ name: 'S1', power: 'sensor.pv_sum', max_power: 14900 }]
  },
  groups: []
});
document.body.appendChild(c8c);
c8c._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
c8c.hass = hass8b;
await new Promise((r) => setTimeout(r, 30));
ok(c8c._m.solar.maxPower === 8000, `moc znamionowa falownika ma pierwszeństwo przed sumą stringów: ${c8c._m.solar.maxPower} W`);
ok(c8c._m.solar.pct === 75, `wykorzystanie falownika jak w sunsynk: ${c8c._m.solar.pct}% (5,97 z 8 kW)`);
const acRow = c8c.shadowRoot.querySelector('[data-node="solar-sum"] [data-f="ac"]').textContent;
ok(acRow.includes('240,0 V') && acRow.includes('3,60 A') && acRow.includes('49,90 Hz'), `wiersz AC: ${acRow}`);
ok(
  c8c.shadowRoot.querySelector('[data-node="solar-sum"] [data-f="status"]').textContent === 'Running',
  'stan pracy falownika przy sumie'
);

const c8b = document.createElement('energy-flow-card');
c8b.setConfig({ type: 'custom:energy-flow-card', solar: { strings: [{ name: 'S', power: 'sensor.pv1_p' }] }, groups: [] });
document.body.appendChild(c8b);
c8b._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
c8b.hass = hass8;
await new Promise((r) => setTimeout(r, 30));
ok(
  c8b.shadowRoot.querySelector('[data-node="s_str0"] [data-f="dc"]').classList.contains('hidden'),
  'bez V/A i max_power wiersz DC się nie pokazuje'
);

console.log('\n— układ swobodny: przeciąganie węzłów —');
const hass7 = {
  themes: { darkMode: true },
  states: Object.fromEntries([S('sensor.pv7', 5000, 'W'), S('sensor.g7', 1000, 'W'), S('sensor.d7', 300, 'W')]),
  callWS: async () => ({})
};
const mkFree = (layout) => {
  const el = document.createElement('energy-flow-card');
  el.setConfig({
    type: 'custom:energy-flow-card',
    solar: { power: 'sensor.pv7', strings: [{ name: 'S1', power: 'sensor.pv7' }] },
    grid: { power: 'sensor.g7' },
    groups: [{ name: 'Klimat', devices: [{ name: 'D', power: 'sensor.d7' }] }],
    layout
  });
  document.body.appendChild(el);
  el._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 600, right: 1000, bottom: 600 });
  el.hass = hass7;
  return el;
};

// przycisk na karcie, bez wchodzenia w edytor HA
const c7start = mkFree({});
await new Promise((r) => setTimeout(r, 30));
const btn = c7start.shadowRoot.getElementById('lay-toggle');
ok(!!btn && !c7start.shadowRoot.getElementById('lay-bar').classList.contains('hidden'), 'przycisk układu widoczny w normalnym trybie');
ok(btn.textContent.includes('Układ'), `etykieta przycisku: ${btn.textContent}`);
ok(!c7start._q.grid.classList.contains('editing'), 'domyślnie bez trybu przeciągania');
btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
ok(c7start._q.grid.classList.contains('free') && c7start._q.grid.classList.contains('editing'), 'klik przycisku włącza przeciąganie bez edytora HA');
ok(btn.textContent.includes('Gotowe'), `przycisk zmienia się w „Gotowe": ${btn.textContent}`);
ok(!c7start.shadowRoot.getElementById('lay-copy').classList.contains('hidden'), 'pojawia się „Kopiuj YAML"');
btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
ok(!c7start._q.grid.classList.contains('editing'), 'ponowny klik wyłącza tryb przeciągania');

const c7 = mkFree({ mode: 'free', edit: true });
await new Promise((r) => setTimeout(r, 30));
const gridEl = c7._q.grid;
ok(gridEl.classList.contains('free'), 'tryb swobodny włącza pozycjonowanie bezwzględne');
ok(gridEl.classList.contains('editing'), 'tryb przeciągania dodaje uchwyty');
ok(gridEl.style.getPropertyValue('--freeh') !== '', `wysokość karty ustawiona: ${gridEl.style.getPropertyValue('--freeh')}`);
const hubWrap = c7.shadowRoot.querySelector('[data-lay="hub"]');
ok(hubWrap.style.left.endsWith('%') && hubWrap.style.top.endsWith('%'), `pozycja w procentach: ${hubWrap.style.left}, ${hubWrap.style.top}`);
ok(
  LAY_ALL.every((k) => {
    const el = c7.shadowRoot.querySelector(`[data-lay="${k}"]`);
    const x = parseFloat(el.style.left);
    const y = parseFloat(el.style.top);
    return x >= 0 && x <= 100 && y >= 0 && y <= 100;
  }),
  'wyliczone pozycje mieszczą się w karcie'
);

// przeciągnięcie węzła domu
hubWrap.getBoundingClientRect = () => ({ left: 200, top: 250, width: 160, height: 120, right: 360, bottom: 370 });
hubWrap.setPointerCapture = () => {};
hubWrap.releasePointerCapture = () => {};
const ptr = (type, x, y) => {
  const e = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, button: 0 });
  e.pointerId = 1;
  return e;
};
let emitted7 = null;
window.addEventListener('energy-flow-card-layout', (e) => (emitted7 = e.detail));
hubWrap.dispatchEvent(ptr('pointerdown', 280, 310)); // środek bloku
ok(hubWrap.classList.contains('dragging'), 'wciśnięcie chwyta blok');
hubWrap.dispatchEvent(ptr('pointermove', 700, 120));
ok(hubWrap.style.left === '70%', `blok podąża za wskaźnikiem w poziomie: ${hubWrap.style.left}`);
ok(hubWrap.style.top === '20%', `blok podąża za wskaźnikiem w pionie: ${hubWrap.style.top}`);
hubWrap.dispatchEvent(ptr('pointermove', 5000, 5000)); // poza kartę
ok(parseFloat(hubWrap.style.left) <= 100 && parseFloat(hubWrap.style.top) <= 100, `blok nie ucieka poza kartę: ${hubWrap.style.left}, ${hubWrap.style.top}`);
hubWrap.dispatchEvent(ptr('pointerup', 5000, 5000));
ok(!hubWrap.classList.contains('dragging'), 'puszczenie kończy przeciąganie');
ok(!!emitted7 && !!emitted7.nodes.hub, 'po przeciągnięciu leci zdarzenie z pozycjami');
ok(LAY_ALL.every((k) => emitted7.nodes[k]), `zdarzenie zawiera wszystkie bloki: ${Object.keys(emitted7.nodes).join(', ')}`);

// łączniki przeliczone po przesunięciu
await new Promise((r) => setTimeout(r, 30));
ok(c7.shadowRoot.querySelectorAll('#lyr-idle path').length > 0, 'łączniki istnieją po przesunięciu węzła');

// klik w trybie układu nie otwiera historii
c7.shadowRoot.querySelector('[data-node="hub"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
ok(!c7._modalHost, 'w trybie przeciągania klik nie otwiera historii');

// tryb pionowy wyłącza układ swobodny
c7._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 900, right: 400, bottom: 900 });
c7._measure();
await new Promise((r) => setTimeout(r, 40));
ok(!c7._q.grid.classList.contains('free'), 'poniżej 720 px wraca układ pionowy');
ok(hubWrap.style.left === '', 'pozycje bezwzględne są zdejmowane w trybie pionowym');

// zapis lokalny: układ przeżywa przeładowanie karty bez ruszania konfiguracji
const stored = JSON.parse(window.localStorage.getItem(Object.keys(window.localStorage).find((k) => k.startsWith('efc-layout:'))));
ok(!!stored && !!stored.nodes.hub, 'układ zapisany w localStorage po przeciągnięciu');
ok(typeof c7._layoutYaml() === 'string' && c7._layoutYaml().includes('hub: { x:'), 'YAML układu do skopiowania');

// bez trybu edycji: pozycje działają, ale bez uchwytów i z działającą historią
const c7b = mkFree({ mode: 'free', nodes: { hub: { x: 30, y: 40 } } });
await new Promise((r) => setTimeout(r, 30));
ok(c7b._q.grid.classList.contains('free') && !c7b._q.grid.classList.contains('editing'), 'zapisany układ bez trybu przeciągania');
ok(c7b.shadowRoot.querySelector('[data-lay="hub"]').style.left === '30%', 'pozycja z konfiguracji zastosowana');
c7b.shadowRoot.querySelector('[data-node="hub"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
ok(!!c7b._modalHost, 'poza trybem przeciągania klik znów otwiera historię');
c7b._closeModal();

console.log('\n— edytor —');
const ed = document.createElement('energy-flow-card-editor');
let emitted = null;
ed.addEventListener('config-changed', (e) => (emitted = e.detail.config));
ed.hass = hass;
ed.setConfig({ type: 'custom:energy-flow-card', groups: [{ name: 'Klimat', devices: [] }] });
ok(!!ed.shadowRoot.querySelector('.ed'), 'edytor renderuje sekcje');
ok(ed.shadowRoot.textContent.includes('Grupy odbiorników'), 'sekcja grup odbiorników');
const addDev = [...ed.shadowRoot.querySelectorAll('button')].find((b) => b.textContent.includes('Dodaj urządzenie'));
ok(!!addDev, 'przycisk dodawania urządzenia');
addDev.click();
ok(emitted && emitted.groups[0].devices.length === 1, 'dodanie urządzenia emituje config-changed');

// pola tekstowe muszą realnie istnieć — ha-textfield bywa niezarejestrowany
const inputs = [...ed.shadowRoot.querySelectorAll('input.txt')];
ok(inputs.length > 0, `edytor renderuje własne pola tekstowe: ${inputs.length}`);
ok(
  inputs.every((i) => i.closest('.field') && i.closest('.field').querySelector('.lbl')),
  'każde pole ma widoczną etykietę'
);
const nameInput = inputs.find((i) => i.closest('.field').querySelector('.lbl').textContent === 'Nazwa grupy');
ok(!!nameInput, 'pole nazwy grupy jest obecne');
nameInput.value = 'Kuchnia';
nameInput.dispatchEvent(new window.Event('input', { bubbles: true }));
ok(emitted.groups[0].name === 'Kuchnia', 'wpisanie nazwy trafia do konfiguracji');

// wszystkie sekcje i opcje
const heads = [...ed.shadowRoot.querySelectorAll('.sec-head')].map((h) => h.textContent);
ok(
  ['Wygląd i zachowanie', 'Układ węzłów', 'Fotowoltaika', 'Sieć energetyczna', 'Akumulator', 'Węzeł domu', 'Grupy odbiorników'].every(
    (s) => heads.some((h) => h.includes(s))
  ),
  `wszystkie sekcje obecne: ${heads.length}`
);
const labels = [...ed.shadowRoot.querySelectorAll('.lbl')].map((l) => l.textContent);
ok(labels.includes('Język'), 'wybór języka w edytorze');
ok(labels.includes('Próg bezczynności (W)'), 'próg bezczynności w edytorze');

// kanały urządzenia z GUI
const addCh = [...ed.shadowRoot.querySelectorAll('button')].find((b) => b.textContent.includes('Dodaj kanał'));
ok(!!addCh, 'przycisk dodawania kanału');
addCh.click();
ok(emitted.groups[0].devices[0].devices && emitted.groups[0].devices[0].devices.length >= 1, 'kanały dodawane z edytora');
const before = JSON.stringify(emitted);
ed.setConfig(emitted); // echo z HA
ed._config.groups[0].devices[0].name = 'Pompa';
ed._emit();
ok(emitted.groups[0].devices[0].name === 'Pompa', 'edycja po echu z HA trafia do konfiguracji');
ok(before !== JSON.stringify(emitted), 'konfiguracja faktycznie się zmieniła');

console.log('\n' + (fails.length ? `NIEPOWODZENIA: ${fails.length}\n- ` + fails.join('\n- ') : 'WSZYSTKIE TESTY PRZESZŁY'));
process.exit(fails.length ? 1 : 0);
