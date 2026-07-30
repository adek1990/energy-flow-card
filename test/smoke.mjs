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

const cardUrl = new URL('../dist/energy-flow-card.js', import.meta.url).href;
await import(cardUrl);

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
const before = JSON.stringify(emitted);
ed.setConfig(emitted); // echo z HA
ed._config.groups[0].devices[0].name = 'Pompa';
ed._emit();
ok(emitted.groups[0].devices[0].name === 'Pompa', 'edycja po echu z HA trafia do konfiguracji');
ok(before !== JSON.stringify(emitted), 'konfiguracja faktycznie się zmieniła');

console.log('\n' + (fails.length ? `NIEPOWODZENIA: ${fails.length}\n- ` + fails.join('\n- ') : 'WSZYSTKIE TESTY PRZESZŁY'));
process.exit(fails.length ? 1 : 0);
