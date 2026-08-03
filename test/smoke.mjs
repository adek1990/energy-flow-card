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
// 13,69 kWh zużycia, z tego 3,40 kWh z sieci → 75% z własnych źródeł
ok(m.house.selfPct === 75, `samowystarczalność liczona z energii dnia: ${m.house.selfPct}%`);
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

// nawigacja po oknie czasowym
const winMs = () => card._modal.win.end - card._modal.win.start;
const w0 = { start: card._modal.win.start, end: card._modal.win.end, ms: winMs() };
ok(!!card._modalHost.querySelector('#win-start') && !!card._modalHost.querySelector('#win-end'), 'pola od/do z godziną');
ok(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(card._modalHost.querySelector('#win-start').value),
  `pole „od" ma datę i godzinę: ${card._modalHost.querySelector('#win-start').value}`
);
card._modalHost.querySelector('#win-prev').dispatchEvent(new MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 40));
ok(card._modal.win.end === w0.start, 'strzałka wstecz przesuwa okno o jego długość');
ok(winMs() === w0.ms, 'przesunięcie nie zmienia długości okna');
const midBefore = card._modal.win.start + winMs() / 2;
card._modalHost.querySelector('#win-in').dispatchEvent(new MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 40));
ok(Math.abs(winMs() - w0.ms / 2) < 2, `„+" zawęża okno dwukrotnie: ${Math.round(winMs() / 60000)} min`);
ok(Math.abs(card._modal.win.start + winMs() / 2 - midBefore) < 2, 'zoom trzyma środek okna');
card._modalHost.querySelector('#win-out').dispatchEvent(new MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 40));
ok(Math.abs(winMs() - w0.ms) < 4, '„−" wraca do poprzedniej długości');

// nie wychodzimy w przyszłość
card._modal.win = { start: Date.now() - 3600000, end: Date.now() };
card._modalHost.querySelector('#win-next').dispatchEvent(new MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 40));
ok(card._modal.win.end <= Date.now() + 1000, 'strzałka naprzód nie wychodzi w przyszłość');

// ręczne ustawienie godzin
const st = card._modalHost.querySelector('#win-start');
st.value = '2026-07-31T08:30';
st.dispatchEvent(new window.Event('change', { bubbles: true }));
await new Promise((r) => setTimeout(r, 40));
ok(new Date(card._modal.win.start).getHours() === 8 && new Date(card._modal.win.start).getMinutes() === 30, 'godzina z pola „od" trafia do okna');
ok(card._modalHost.textContent.includes('→'), 'podpis pokazuje przedział z godzinami');

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

console.log('\n— licznik dwukierunkowy (ujemna faza) —');
const hassZ = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.f1', 715.25, 'W'),
    S('sensor.f2', -2249.47, 'W'),
    S('sensor.f3', 3.23, 'W')
  ]),
  callWS: async () => ({})
};
const cz = document.createElement('energy-flow-card');
cz.setConfig({
  type: 'custom:energy-flow-card',
  groups: [
    {
      name: 'Altana',
      expanded: true,
      devices: [
        {
          name: 'Licznik',
          devices: [
            { name: 'Faza 1', power: 'sensor.f1' },
            { name: 'Faza 2', power: 'sensor.f2' },
            { name: 'Faza 3', power: 'sensor.f3' }
          ]
        }
      ]
    }
  ]
});
document.body.appendChild(cz);
cz._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
cz.hass = hassZ;
await new Promise((r) => setTimeout(r, 30));
const zg = cz._m.groups[0];
ok(Math.abs(zg.power + 1530.99) < 0.01, `suma faz zachowuje znak: ${zg.power} W`);
ok(cz.shadowRoot.querySelector('[data-node="dev_d0_0_1"] [data-f="pwr"]').textContent === '-2,25 kW', `ujemna faza widoczna: ${cz.shadowRoot.querySelector('[data-node="dev_d0_0_1"] [data-f="pwr"]').textContent}`);
ok(zg.leafCount === 3, `liczone są fazy: ${zg.leafCount}`);
const zLink = [...cz.shadowRoot.querySelectorAll('#lyr-idle path')].find((p) => p.getAttribute('stroke-dasharray') === '3 6');
ok(!!zLink, 'ujemny przepływ nie rysuje animowanej linii zużycia');
ok(cz.shadowRoot.querySelectorAll('#lyr-act path').length === 0, 'brak animacji przy ujemnej sumie grupy');

console.log('\n— samowystarczalność i autokonsumpcja z całego dnia —');
// wieczór: PV już nie produkuje, ale dzień był słoneczny
const hassNight = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.pv_now', 0, 'W'),
    S('sensor.pv_day', 84.8, 'kWh'),
    S('sensor.gimp_now', 1200, 'W'),
    S('sensor.gimp_day', 17.44, 'kWh'),
    S('sensor.gexp_day', 5, 'kWh')
  ]),
  callWS: async () => ({})
};
const cnight = document.createElement('energy-flow-card');
cnight.setConfig({
  type: 'custom:energy-flow-card',
  solar: { power: 'sensor.pv_now', energy: 'sensor.pv_day', strings: [{ name: 'S', power: 'sensor.pv_now' }] },
  grid: { power: 'sensor.gimp_now', energy_import: 'sensor.gimp_day', energy_export: 'sensor.gexp_day' },
  house: { power: 'auto', energy: 'auto' },
  groups: []
});
document.body.appendChild(cnight);
cnight._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
cnight.hass = hassNight;
await new Promise((r) => setTimeout(r, 30));
ok(cnight._m.house.selfPct === 82, `wieczorem wskaźnik liczy cały dzień, nie chwilę: ${cnight._m.house.selfPct}%`);
ok(cnight._m.house.selfDaily === true, 'oznaczone jako wartość dobowa');
const sbox = cnight.shadowRoot.getElementById('summary');
const stt = (k) => sbox.querySelector(`[data-stat="${k}"]`);
ok(stt('selfConsumption').querySelector('.val').textContent === '94%', `kafelek autokonsumpcji: ${stt('selfConsumption').querySelector('.val').textContent}`);
ok(stt('selfSufficiency').querySelector('.val').textContent === '82%', `kafelek samowystarczalności: ${stt('selfSufficiency').querySelector('.val').textContent}`);
ok(stt('selfConsumption').querySelector('.sub').textContent === 'ile produkcji zużyto u siebie', 'kafelek tłumaczy, co znaczy autokonsumpcja');
ok(stt('consumed').querySelector('.val').textContent === '97,2 kWh', `dzienne zużycie domu: ${stt('consumed').querySelector('.val').textContent}`);

console.log('\n— autowyszukiwanie nieprzypisanych odbiorników —');
const P = (id, v, name) => [id, { entity_id: id, state: String(v), attributes: { unit_of_measurement: 'W', device_class: 'power', friendly_name: name } }];
const hassDisc = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    P('sensor.pralka_power', 320, 'Pralka'),
    P('sensor.zmywarka_power', 1100, 'Zmywarka'),
    P('sensor.przypisany_power', 50, 'Już w grupie'),
    P('sensor.grid_p2', 4000, 'Sieć'),
    P('sensor.debug_power', 7, 'Debug'),
    S('sensor.pralka_energy_daily', 0.85, 'kWh'),
    S('sensor.temperatura', 21, '°C', { device_class: 'temperature' })
  ]),
  callWS: async () => ({})
};
const cd = document.createElement('energy-flow-card');
cd.setConfig({
  type: 'custom:energy-flow-card',
  grid: { power: 'sensor.grid_p2' },
  auto_discover: { name: 'Nieprzypisane', exclude: ['debug'] },
  groups: [{ name: 'Znane', devices: [{ name: 'Znane', power: 'sensor.przypisany_power' }] }]
});
document.body.appendChild(cd);
cd._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
cd.hass = hassDisc;
await new Promise((r) => setTimeout(r, 30));
const dg = cd._m.groups.find((g) => g.id === '__discovered');
const names = dg.devices.map((d) => d.name);
ok(names.join(', ') === 'Pralka, Zmywarka', `znalezione nieprzypisane: ${names.join(', ')}`);
ok(!names.includes('Już w grupie'), 'encja przypisana do grupy pominięta');
ok(!names.includes('Sieć'), 'encja użyta w węźle sieci pominięta');
ok(!names.includes('Debug'), 'wykluczenie po fragmencie id działa');
ok(dg.power === 1420, `suma nieprzypisanych: ${dg.power} W`);
ok(dg.devices[0].energyEntity === 'sensor.pralka_energy_daily', `dopasowany licznik energii: ${dg.devices[0].energyEntity}`);
ok(dg.devices[1].energyEntity === null, 'brak licznika energii nie psuje wpisu');
ok(!!cd.shadowRoot.querySelector('[data-group="__discovered"]'), 'grupa wyszukanych jest na karcie');
// nowa encja pojawia się w HA → karta ją dołącza (po upływie okna skanowania)
cd._discAt = 0;
cd.hass = Object.assign({}, hassDisc, {
  states: Object.assign({}, hassDisc.states, Object.fromEntries([P('sensor.suszarka_power', 900, 'Suszarka')]))
});
await new Promise((r) => setTimeout(r, 30));
ok(
  cd._m.groups.find((g) => g.id === '__discovered').devices.map((d) => d.name).includes('Suszarka'),
  'nowa encja dołącza się bez zmiany konfiguracji'
);

console.log('\n— przebudowa nie psuje trybu mobilnego ani wydajności —');
// telefon: karta w trybie pionowym, potem dochodzi nowa encja z autowyszukiwania
const cm = document.createElement('energy-flow-card');
cm.setConfig({
  type: 'custom:energy-flow-card',
  solar: { strings: [{ name: 'S', power: 'sensor.pralka_power' }] },
  auto_discover: { name: 'Nieprzypisane' },
  groups: [{ name: 'Znane', devices: [{ name: 'Z', power: 'sensor.przypisany_power' }] }]
});
document.body.appendChild(cm);
cm._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 400, height: 900 });
cm.hass = hassDisc;
await new Promise((r) => setTimeout(r, 40));
ok(cm._narrow === true, 'karta w trybie pionowym');
ok(cm._q.grid.classList.contains('narrow'), 'siatka ma klasę narrow');

let scans = 0;
const realDiscover = cm._discover.bind(cm);
cm._discover = function () {
  scans++;
  return realDiscover();
};
// dziesięć aktualizacji stanów pod rząd, jak w prawdziwym HA
for (let i = 0; i < 10; i++) {
  cm.hass = Object.assign({}, hassDisc, {
    states: Object.assign({}, hassDisc.states, Object.fromEntries([P('sensor.pralka_power', 300 + i, 'Pralka')]))
  });
}
await new Promise((r) => setTimeout(r, 40));
ok(scans === 0, `skan encji nie powtarza się przy każdej aktualizacji: ${scans} razy`);
ok(cm._q.grid.classList.contains('narrow'), 'tryb pionowy przeżywa aktualizacje');

// wymuszona przebudowa (nowa encja) nie może zgubić układu mobilnego
cm._discAt = 0;
cm.hass = Object.assign({}, hassDisc, {
  states: Object.assign({}, hassDisc.states, Object.fromEntries([P('sensor.nowa_power', 500, 'Nowa')]))
});
await new Promise((r) => setTimeout(r, 40));
ok(
  cm._m.groups.find((g) => g.id === '__discovered').devices.some((d) => d.name === 'Nowa'),
  'nowa encja trafia na listę po odświeżeniu skanu'
);
ok(cm._q.grid.classList.contains('narrow'), 'po przebudowie DOM tryb pionowy wraca');
ok(cm._q.stringlist.classList.contains('hidden') === false, 'zwijana lista falowników nadal aktywna');
ok(cm._q.groups.style.getPropertyValue('--colmin') === '150px', `kolumny mobilne zachowane: ${cm._q.groups.style.getPropertyValue('--colmin')}`);
ok(cm.shadowRoot.querySelectorAll('#lyr-idle path').length > 0, 'łączniki przeliczone po przebudowie');

// encja chwilowo niedostępna nie może wywoływać przebudowy
cm._discAt = 0;
const beforeSig = cm._discSig;
cm.hass = Object.assign({}, hassDisc, {
  states: Object.assign({}, hassDisc.states, Object.fromEntries([P('sensor.nowa_power', 500, 'Nowa')]), {
    'sensor.pralka_power': { entity_id: 'sensor.pralka_power', state: 'unavailable', attributes: { device_class: 'power', unit_of_measurement: 'W', friendly_name: 'Pralka' } }
  })
});
await new Promise((r) => setTimeout(r, 40));
ok(cm._discSig === beforeSig, 'chwilowa niedostępność nie przebudowuje karty');

console.log('\n— grupa dwukierunkowa (Altana jak dom) —');
const hassBi = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.bf1', 715.25, 'W'),
    S('sensor.bf2', -2249.47, 'W'),
    S('sensor.bf3', 3.23, 'W'),
    S('sensor.b_imp', 8175.79, 'kWh'),
    S('sensor.b_exp', 8457.14, 'kWh'),
    S('sensor.zwykly', 500, 'W')
  ]),
  callWS: async () => ({})
};
const cbi = document.createElement('energy-flow-card');
cbi.setConfig({
  type: 'custom:energy-flow-card',
  groups: [
    {
      name: 'Altana',
      icon: 'server',
      expanded: true,
      bidirectional: true,
      energy_import: 'sensor.b_imp',
      energy_export: 'sensor.b_exp',
      devices: [
        { name: 'Faza 1', power: 'sensor.bf1' },
        { name: 'Faza 2', power: 'sensor.bf2' },
        { name: 'Faza 3', power: 'sensor.bf3' }
      ]
    },
    { name: 'Zwykła', devices: [{ name: 'X', power: 'sensor.zwykly' }] }
  ]
});
document.body.appendChild(cbi);
cbi._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
cbi.hass = hassBi;
await new Promise((r) => setTimeout(r, 30));
const bg = cbi._m.groups[0];
ok(bg.bidir === true, 'grupa oznaczona jako dwukierunkowa');
ok(bg.imp === 8175.79 && bg.exp === 8457.14, `własne liczniki grupy: ↓ ${bg.imp} ↑ ${bg.exp}`);
const flowEl = cbi.shadowRoot.querySelector(`[data-group="${cbi._m.groups[0].id}"] [data-f="flow"]`);
ok(!!flowEl && !flowEl.classList.contains('hidden'), 'kafelek pokazuje bilans ze strzałkami');
ok(flowEl.textContent.includes('↓ 8,18 MWh') && flowEl.textContent.includes('↑ 8,46 MWh'), `bilans grupy: ${flowEl.textContent}`);
ok(
  cbi.shadowRoot.querySelector(`[data-group="${cbi._m.groups[0].id}"] [data-f="meta"]`).textContent.includes('oddaje'),
  'meta mówi, że grupa oddaje energię'
);
ok(
  cbi.shadowRoot.querySelector(`[data-group="${cbi._m.groups[1].id}"] [data-f="flow"]`).classList.contains('hidden'),
  'zwykła grupa nie dostaje bilansu'
);
// kierunek linii: przy oddawaniu strzałka wraca do domu
const defs = cbi._linkDefs();
const altLink = defs.find((l) => l.a === 'grp-' + cbi._m.groups[0].id || l.b === 'grp-' + cbi._m.groups[0].id);
ok(altLink.a === 'grp-' + cbi._m.groups[0].id && altLink.b === 'hub', 'oddająca grupa rysuje linię w stronę domu');
ok(altLink.c === 'solar' && altLink.p > 0, `linia oddawania w kolorze produkcji: ${altLink.c}, ${Math.round(altLink.p)} W`);
const normLink = defs.find((l) => l.b === 'grp-' + cbi._m.groups[1].id);
ok(normLink.a === 'hub' && normLink.c === 'cons', 'zwykła grupa nadal od domu do odbiornika');

console.log('\n— napięcie i prąd przy odbiornikach —');
const hassVA = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.f1p', 715.25, 'W'),
    S('sensor.f1u', 243.09, 'V'),
    S('sensor.f1i', 2.98, 'A'),
    S('sensor.f2p', -2249.47, 'W'),
    S('sensor.f2u', 238.52, 'V'),
    S('sensor.f3p', 3.23, 'W')
  ]),
  callWS: async () => ({})
};
const cva = document.createElement('energy-flow-card');
cva.setConfig({
  type: 'custom:energy-flow-card',
  groups: [
    {
      name: 'Altana',
      expanded: true,
      devices: [
        {
          name: 'Licznik',
          devices: [
            { name: 'Faza 1', power: 'sensor.f1p', voltage: 'sensor.f1u', current: 'sensor.f1i' },
            { name: 'Faza 2', power: 'sensor.f2p', voltage: 'sensor.f2u' },
            { name: 'Faza 3', power: 'sensor.f3p' }
          ]
        }
      ]
    }
  ]
});
document.body.appendChild(cva);
cva._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
cva.hass = hassVA;
await new Promise((r) => setTimeout(r, 30));
const dcv = (k) => cva.shadowRoot.querySelector(`[data-node="dev_${k}"] [data-f="dcv"]`);
ok(dcv('d0_0_0').textContent === '243,1 V · 2,98 A', `V i A obok mocy: ${dcv('d0_0_0').textContent}`);
ok(!dcv('d0_0_0').classList.contains('hidden'), 'kolumna V/A widoczna, gdy są dane');
ok(dcv('d0_0_1').textContent === '238,5 V', `samo napięcie bez prądu: ${dcv('d0_0_1').textContent}`);
ok(dcv('d0_0_2').classList.contains('hidden'), 'bez V/A kolumna się nie pokazuje');
ok(cva._m.groups[0].devices[0].children[0].volt === 243.09, 'napięcie w modelu urządzenia');
ok(cva._m.groups[0].devices[0].volt === null, 'moduł nie sumuje napięć kanałów');
ok(
  cva.shadowRoot.querySelector('[data-node="dev_d0_0_0"] [data-f="pwr"]').textContent === '715 W',
  'moc nadal na swoim miejscu'
);

console.log('\n— wykres z wartościami ujemnymi —');
const hassNeg = {
  themes: { darkMode: true },
  states: Object.fromEntries([S('sensor.bidir', -2249, 'W')]),
  callWS: async (msg) => {
    if (msg.type === 'history/history_during_period') {
      const out = {};
      msg.entity_ids.forEach((id) => {
        // przebieg od -2500 do +800 W
        out[id] = Array.from({ length: 20 }, (_, i) => ({
          s: String(-2500 + i * 174),
          lu: (new Date(msg.start_time).getTime() + i * 600000) / 1000
        }));
      });
      return out;
    }
    if (msg.type === 'recorder/statistics_during_period') {
      const out = {};
      msg.statistic_ids.forEach((id) => {
        out[id] = Array.from({ length: 6 }, (_, i) => ({
          start: new Date(msg.start_time).getTime() + i * 3600000,
          change: i < 3 ? -0.5 - i * 0.2 : 0.4 + i * 0.1
        }));
      });
      return out;
    }
    return {};
  }
};
const cn = document.createElement('energy-flow-card');
cn.setConfig({
  type: 'custom:energy-flow-card',
  groups: [{ name: 'Altana', expanded: true, devices: [{ name: 'Faza 2', power: 'sensor.bidir', energy: 'sensor.bidir' }] }]
});
document.body.appendChild(cn);
cn._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
cn.hass = hassNeg;
await new Promise((r) => setTimeout(r, 30));
cn._openModal(cn._nodes['dev_d0_0'], 'dev_d0_0');
await new Promise((r) => setTimeout(r, 60));
const chN = cn._modal.chart;
const ys = chN.line.match(/-?\d+\.\d+/g).filter((_, i) => i % 2 === 1).map(Number);
ok(Math.min(...ys) >= 0 && Math.max(...ys) <= 200, `przebieg mieści się w wykresie: y od ${Math.min(...ys).toFixed(1)} do ${Math.max(...ys).toFixed(1)}`);
ok(chN.lo < 0 && chN.hi > 0, `dziedzina obejmuje zero: ${Math.round(chN.lo)} … ${Math.round(chN.hi)} W`);
const zeroLine = chN.hlines.find((h) => h.zero);
ok(!!zeroLine, 'wykres ma wyróżnioną linię zera');
ok(chN.hlines.every((h) => parseFloat(h.y) >= 0 && parseFloat(h.y) <= 200), 'linie pomocnicze w granicach wykresu');
ok(chN.hlines.every((h) => h.top >= 0 && h.top <= 187), 'etykiety osi nie uciekają poza wykres');
ok(chN.peak === '-2,50 kW', `szczyt bierze największą wartość bezwzględną: ${chN.peak}`);
ok(chN.area.includes('L 760 ' + parseFloat(zeroLine.y).toFixed(1)), 'wypełnienie kończy się na linii zera');
// tylko płótna wykresów, nie ikony w nagłówku
const svgs = [...cn._modalHost.querySelectorAll('svg')].filter((e) =>
  (e.getAttribute('viewBox') || '').startsWith('0 0 760')
);
ok(svgs.length === 2, `oba wykresy obecne: ${svgs.length}`);
ok(
  svgs.every((e) => /pointer-events:none/.test(e.getAttribute('style') || '')),
  'wykresy nie przechwytują kliknięć'
);
ok(
  svgs.every((e) => !/overflow:visible/.test(e.getAttribute('style') || '')),
  'wykresy nie wychodzą poza swoje ramy'
);
ok(chN.barZero > 0 && chN.barZero < 100, `słupki mają własną linię zera: y=${chN.barZero.toFixed(1)}`);
ok(chN.bars.every((r) => parseFloat(r.y) >= 0 && parseFloat(r.y) + parseFloat(r.h) <= 101), 'słupki mieszczą się w swoim polu');
// przyciski nadal klikalne przy ujemnym przebiegu
cn._modalHost.querySelector('#win-prev').dispatchEvent(new MouseEvent('click', { bubbles: true }));
await new Promise((r) => setTimeout(r, 40));
ok(!!cn._modal, 'nawigacja działa mimo ujemnych wartości');
cn._closeModal();

console.log('\n— podsumowanie dnia i węzeł niezmierzony —');
// realne liczby: PV 84,8 kWh · pobór 4,02+13,42 · oddanie 5,0+0 · zmierzone odbiorniki 0,77 kWh
const hassE = {
  themes: { darkMode: true },
  states: Object.fromEntries([
    S('sensor.pv_p', 16700, 'W'),
    S('sensor.pv_e', 84.8, 'kWh'),
    S('sensor.imp1', 4.02, 'kWh'),
    S('sensor.imp2', 13.42, 'kWh'),
    S('sensor.exp1', 5, 'kWh'),
    S('sensor.exp2', 0, 'kWh'),
    S('sensor.gimp', 0, 'W'),
    S('sensor.gexp', 6640, 'W'),
    S('sensor.pompa_p', 21, 'W'),
    S('sensor.pompa_e', 0.77, 'kWh')
  ]),
  callWS: async () => ({})
};
const ce = document.createElement('energy-flow-card');
ce.setConfig({
  type: 'custom:energy-flow-card',
  solar: { power: 'sensor.pv_p', energy: 'sensor.pv_e', strings: [{ name: 'S', power: 'sensor.pv_p' }] },
  grid: {
    power_import: 'sensor.gimp',
    power_export: 'sensor.gexp',
    energy_import: ['sensor.imp1', 'sensor.imp2'],
    energy_export: ['sensor.exp1', 'sensor.exp2']
  },
  house: { power: 'auto', energy: 'auto', unmetered: { name: 'Niezmierzone' } },
  groups: [{ name: 'Ogrzewanie', devices: [{ name: 'Pompa', power: 'sensor.pompa_p', energy: 'sensor.pompa_e' }] }]
});
document.body.appendChild(ce);
ce._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
ce.hass = hassE;
await new Promise((r) => setTimeout(r, 30));

ok(ce._missing.size === 0, `„auto" nie jest traktowane jak encja: ${[...ce._missing].join(', ') || 'brak zgłoszeń'}`);
const sm = ce._m.house.summary;
ok(Math.abs(ce._m.grid.energyImport - 17.44) < 0.001, `pobór sumuje obie strefy taryfowe: ${ce._m.grid.energyImport} kWh`);
ok(ce._m.grid.energyExport === 5, `oddanie sumuje obie strefy: ${ce._m.grid.energyExport} kWh`);
ok(Math.abs(sm.consumed - 97.24) < 0.01, `realne zużycie domu = PV + pobór − oddanie: ${sm.consumed} kWh`);
ok(Math.abs(sm.selfUsed - 79.8) < 0.01, `zużyte z PV: ${sm.selfUsed} kWh`);
ok(sm.selfConsumption === 94, `autokonsumpcja: ${sm.selfConsumption}%`);
ok(sm.selfSufficiency === 82, `samowystarczalność: ${sm.selfSufficiency}%`);
ok(ce._m.house.power === 10060, `moc domu z bilansu: ${ce._m.house.power} W (16700 − 6640)`);

const box = ce.shadowRoot.getElementById('summary');
ok(!box.classList.contains('hidden'), 'pasek podsumowania widoczny');
const stat = (k) => box.querySelector(`[data-stat="${k}"]`);
ok(stat('produced').querySelector('.val').textContent === '84,8 kWh', `kafelek produkcji: ${stat('produced').querySelector('.val').textContent}`);
ok(stat('consumed').querySelector('.val').textContent === '97,2 kWh', `kafelek zużycia domu: ${stat('consumed').querySelector('.val').textContent}`);
ok(stat('exported').querySelector('.sub').textContent === '6% produkcji', `podpis oddanego: ${stat('exported').querySelector('.sub').textContent}`);
ok(stat('imported').querySelector('.sub').textContent === '18% zużycia', `podpis pobranego: ${stat('imported').querySelector('.sub').textContent}`);

// brak liczników sieci ≠ zerowe liczniki
const cnull = document.createElement('energy-flow-card');
cnull.setConfig({
  type: 'custom:energy-flow-card',
  solar: { power: 'sensor.pv_p', energy: 'sensor.pv_e', strings: [{ name: 'S', power: 'sensor.pv_p' }] },
  grid: { power_export: 'sensor.gexp', energy_import: 'sensor.nie_ma_importu' },
  house: { power: 'auto', energy: 'auto' },
  groups: []
});
document.body.appendChild(cnull);
cnull._q.card.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1500, height: 700 });
cnull.hass = hassE;
await new Promise((r) => setTimeout(r, 30));
const gk = cnull.shadowRoot.querySelector('[data-node="grid"] [data-f="kwh"]').textContent;
ok(gk === '↓ —   ↑ —', `brak licznika sieci pokazuje „—", nie 0,00: ${gk}`);
ok(cnull._m.house.energy === null, 'bez licznika poboru energia domu nie jest zmyślana');
ok(
  cnull.shadowRoot.getElementById('summary').querySelector('[data-stat="consumed"]').classList.contains('hidden'),
  'kafelek zużycia domu chowa się przy braku danych'
);
ok(
  !cnull.shadowRoot.getElementById('summary').querySelector('[data-stat="produced"]').classList.contains('hidden'),
  'kafelek produkcji zostaje, bo dane są'
);

const um = ce._m.groups.find((g) => g.virtual);
ok(!!um, 'grupa niezmierzona istnieje');
ok(um.power === 10039, `niezmierzone = dom − zmierzone: ${um.power} W (10060 − 21)`);
ok(Math.abs(um.energy - 96.47) < 0.01, `niezmierzona energia: ${um.energy} kWh (97,24 − 0,77)`);
ok(ce._m.groups.filter((g) => !g.virtual).reduce((t, g) => t + g.power, 0) === 21, 'grupa wirtualna nie wchodzi do sumy odbiorników');
// żaden napis na karcie nie może być surowym kluczem tłumaczenia
const rawKeys = (el) =>
  [...el.shadowRoot.querySelectorAll('*')]
    .map((e) => (e.children.length ? '' : (e.textContent || '').trim()))
    .filter((tx) => /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(tx) && !tx.startsWith('sensor'));
ok(rawKeys(ce).length === 0, `brak surowych kluczy tłumaczeń: ${rawKeys(ce).join(', ') || 'czysto'}`);

const umTile = ce.shadowRoot.querySelector('[data-group="__unmetered"]');
ok(
  umTile.querySelector('[data-f="meta"]').textContent === 'reszta domu poza pomiarem',
  `opis kafelka niezmierzonego: ${umTile.querySelector('[data-f="meta"]').textContent}`
);
ok(!!umTile && umTile.classList.contains('est'), 'kafelek niezmierzony ma przerywaną ramkę');
ok(!umTile.querySelector('.grp-chev'), 'kafelek niezmierzony nie ma strzałki rozwijania');
ok(umTile.querySelector('[data-f="pwr"]').textContent === '10,0 kW', `moc na kafelku: ${umTile.querySelector('[data-f="pwr"]').textContent}`);

console.log('\n— nagłówek karty —');
ok(!card.shadowRoot.querySelector('.kicker'), 'brak domyślnego nadtytułu');
ok(!card.shadowRoot.textContent.includes('karta niestandardowa'), 'napis „karta niestandardowa" nie pojawia się sam');
const kick = document.createElement('energy-flow-card');
kick.setConfig({ type: 'custom:energy-flow-card', title: 'X', kicker: 'Mój nadtytuł', groups: [] });
document.body.appendChild(kick);
kick.hass = hass;
ok(kick.shadowRoot.querySelector('.kicker').textContent === 'Mój nadtytuł', 'własny nadtytuł nadal działa');

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
