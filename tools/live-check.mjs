/*
 * Uruchamia kartę lokalnie (jsdom) na PRAWDZIWYCH danych z Home Assistanta:
 * konfiguracja karty z Lovelace, stany encji i statystyki z rejestratora idą po websockecie.
 * Wypisuje, co karta pokazuje dla wybranych okresów, tabelę zestawienia i zapisuje CSV.
 *
 *   node tools/live-check.mjs [--period day|week|month|year] [--range today|7d|month|year|custom]
 *                             [--from 2026-09-01 --to 2026-09-16] [--out katalog]
 *
 * Dane logowania: plik tokenHA.txt w katalogu projektu (URL: … / TOKEN: …), poza repozytorium.
 */
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const root = path.resolve(new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf('--' + name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const PERIOD = opt('period', 'month');
const RANGE = opt('range', 'month');
const OUT = opt('out', path.join(root, 'tools', 'out'));

const tok = fs.readFileSync(path.join(root, 'tokenHA.txt'), 'utf8');
const URL_HA = tok.match(/^URL:\s*(\S+)/m)[1].replace(/\/$/, '');
const TOKEN = tok.match(/^TOKEN:\s*(\S+)/m)[1];

/* --------------------------------------------------------------- websocket */
class HaWs {
  constructor(url, token) {
    this.url = url.replace(/^http/, 'ws') + '/api/websocket';
    this.token = token;
    this.id = 1;
    this.pending = new Map();
  }
  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);
      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'auth_required') this.ws.send(JSON.stringify({ type: 'auth', access_token: this.token }));
        else if (msg.type === 'auth_ok') resolve();
        else if (msg.type === 'auth_invalid') reject(new Error('auth_invalid'));
        else if (msg.type === 'result') {
          const p = this.pending.get(msg.id);
          if (!p) return;
          this.pending.delete(msg.id);
          if (msg.success) p.resolve(msg.result);
          else p.reject(new Error(JSON.stringify(msg.error)));
        }
      };
      this.ws.onerror = (e) => reject(e);
    });
  }
  call(msg) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(Object.assign({ id }, msg)));
    });
  }
  close() {
    this.ws.close();
  }
}

/* -------------------------------------------------------------------- jsdom */
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/'
});
const { window } = dom;
window.ResizeObserver = class {
  observe() {}
  disconnect() {}
};
window.Element.prototype.getBoundingClientRect = function () {
  return { left: 0, top: 0, width: 1400, height: 800, right: 1400, bottom: 800, x: 0, y: 0 };
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
/* Event/CustomEvent zostają natywne — WebSocket Node'a sprawdza instanceof przy zdarzeniach */
globalThis.ResizeObserver = window.ResizeObserver;
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.MouseEvent = window.MouseEvent;
window.HTMLAnchorElement.prototype.click = function () {};
/* karta loguje baner wersji i ostrzeżenia o brakujących encjach — zostawiamy je widoczne */

await import(new URL('../dist/energy-flow-card.js', import.meta.url).href);

/* ------------------------------------------------------------------ dane HA */
const ha = new HaWs(URL_HA, TOKEN);
await ha.connect();
const cfgAll = await ha.call({ type: 'lovelace/config' });
const cards = [];
const walk = (o) => {
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) return o.forEach(walk);
  if (o.type && String(o.type).includes('energy-flow-card')) cards.push(o);
  Object.keys(o).forEach((k) => walk(o[k]));
};
walk(cfgAll);
if (!cards.length) {
  console.error('Nie znaleziono energy-flow-card w domyślnym dashboardzie.');
  process.exit(1);
}
const cardCfg = JSON.parse(JSON.stringify(cards[0]));
cardCfg.energy_period = PERIOD;
cardCfg.report = { expanded: true, range: RANGE === 'custom' ? 'month' : RANGE };
/* układ i okres z localStorage nie mają tu znaczenia — jsdom startuje czysty */

const statesArr = await ha.call({ type: 'get_states' });
const states = Object.fromEntries(statesArr.map((s) => [s.entity_id, s]));

const wsLog = [];
const hass = {
  themes: { darkMode: true },
  language: 'pl',
  states,
  callWS: async (msg) => {
    wsLog.push(msg);
    return ha.call(msg);
  }
};

/* ------------------------------------------------------------------- karta */
const card = document.createElement('energy-flow-card');
card.setConfig(cardCfg);
document.body.appendChild(card);
card.hass = hass;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitFor = async (fn, ms = 20000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (fn()) return true;
    await sleep(100);
  }
  return false;
};

await waitFor(() => card._perVals && !card._perPending);
const txt = (sel) => {
  const el = card.shadowRoot.querySelector(sel);
  return el ? el.textContent.trim().replace(/\s+/g, ' ') : '(brak)';
};

console.log(`\n=== KARTA · okres liczników: ${PERIOD} ===`);
console.log('Fotowoltaika łącznie:', txt('[data-node="solar-sum"] [data-f="pwr"]'), '·', txt('[data-node="solar-sum"] [data-f="kwh"]'));
card._cfg.solar.strings.forEach((s) => {
  console.log('  ' + s.name + ':', txt(`[data-node="s_${s.key}"] [data-f="pwr"]`), '·', txt(`[data-node="s_${s.key}"] [data-f="kwh"]`));
});
console.log('Dom:', txt('[data-node="hub"] [data-f="pwr"]'), '·', txt('[data-node="hub"] [data-f="kwh"]'), '·', txt('[data-node="hub"] [data-f="self"]'));
console.log('Sieć:', txt('[data-node="grid"] [data-f="label"]'), txt('[data-node="grid"] [data-f="pwr"]'), '·', txt('[data-node="grid"] [data-f="kwh"]'));
console.log('Podsumowanie:');
card.shadowRoot.querySelectorAll('#summary [data-stat]').forEach((el) => {
  if (el.classList.contains('hidden')) return;
  console.log('  ' + el.querySelector('.cap').textContent + ': ' + el.querySelector('.val').textContent + '  ' + el.querySelector('.sub').textContent);
});
console.log('Grupy:');
card._m.groups.forEach((g) => {
  console.log('  ' + g.name + ': ' + txt(`[data-group="${g.id}"] [data-f="pwr"]`) + ' · ' + txt(`[data-group="${g.id}"] [data-f="meta"]`));
});

/* ------------------------------------------------------------- zestawienie */
if (RANGE === 'custom') {
  /* jak wpisanie dat w pola „od" / „do" — chip „Zakres" sam zaczyna od bieżących granic */
  card._setReportRange('custom');
  card._rep.from = new Date(opt('from', '2026-09-01') + 'T00:00:00').getTime();
  card._rep.to = new Date(opt('to', '2026-09-16') + 'T00:00:00').getTime();
  card._applyReport();
  card._loadReport(true);
}
await waitFor(() => card._rep && card._rep.data && !card._rep.loading);
const b = card._repBounds();
console.log(`\n=== ZESTAWIENIE · ${b.start.toLocaleString('pl-PL')} → ${b.end.toLocaleString('pl-PL')} · koszyk: ${card._rep.data.bucket} · koszyków: ${card._rep.data.buckets.length} ===`);
const rows = card._repRows(card._rep.data);
rows.forEach((r) => {
  const pad = '  '.repeat(r.depth);
  const share = r.share === null ? '' : `  ${r.share}% ${card._tx(r.shareLabel)}`;
  console.log(
    `${r.section.padEnd(10)} ${(pad + r.label).padEnd(44)} ${r.total.toFixed(2).padStart(10)} kWh${share}` +
      (r.derived ? '   [bilans]' : '   [' + r.ids.join(' + ') + ']')
  );
});

fs.mkdirSync(OUT, { recursive: true });
const csv = card._repCsv();
const csvPath = path.join(OUT, card._repCsvName());
fs.writeFileSync(csvPath, '﻿' + csv, 'utf8');
console.log(`\nCSV zapisany: ${csvPath} (${csv.split('\r\n').length - 1} wierszy)`);
console.log('Zapytania do rejestratora:', wsLog.filter((m) => m.type === 'recorder/statistics_during_period').length);

ha.close();
process.exit(0);
