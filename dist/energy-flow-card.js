/*!
 * Energy Flow Card — schematyczny widok rozpływu energii dla Home Assistant
 * Port projektu "Energy Flow Card" 1:1 na natywną kartę Lovelace.
 * Licencja: MIT
 */

import PL from './lang-pl.js';
import EN from './lang-en.js';

const EFC_VERSION = '1.4.0';

const LANGS = { pl: PL, en: EN };

/* podstawienia: t('self_sufficient', {n: 47}) */
const tr = (dict, key, vars) => {
  let s = dict[key];
  if (s === undefined) s = PL[key] !== undefined ? PL[key] : key;
  if (vars && typeof s === 'string') {
    Object.keys(vars).forEach((k) => {
      s = s.split('{' + k + '}').join(vars[k]);
    });
  }
  return s;
};

/* eslint-disable no-console */
console.info(
  `%c ENERGY-FLOW-CARD %c ${EFC_VERSION} `,
  'color:#0a0e13;background:#2dd4bf;font-weight:600;border-radius:3px 0 0 3px',
  'color:#2dd4bf;background:#0f151c;font-weight:600;border-radius:0 3px 3px 0'
);

/* ------------------------------------------------------------------ ikony */

const ICON_SYMBOLS = `
<symbol id="ic-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.6"></circle><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 2.6v2.4M12 19v2.4M2.6 12h2.4M19 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"></path></g></symbol>
<symbol id="ic-panel" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3.5 5h17l2 9h-21z"></path><path d="M12 5v9M5.6 9.5h12.8"></path><path d="M12 14v5.5M8.5 19.5h7"></path></g></symbol>
<symbol id="ic-house" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3.5 10.6 12 3.8l8.5 6.8V20a.9.9 0 0 1-.9.9H4.4a.9.9 0 0 1-.9-.9z"></path><path d="M9.6 20.9v-6.3h4.8v6.3"></path></g></symbol>
<symbol id="ic-tower" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6.5 21 9 3h6l2.5 18"></path><path d="M3.5 6.2h17M7.6 10.4h8.8M6.9 15h10.2"></path><path d="m8.6 10.4 6.8 10.6M15.4 10.4 8.6 21"></path></g></symbol>
<symbol id="ic-battery" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3.4" y="7.2" width="15.4" height="9.6" rx="2.2"></rect><path d="M20.6 10.5v3"></path><path d="m10.6 9.6-1.8 3.2h2.4l-1.4 2.4"></path></g></symbol>
<symbol id="ic-climate" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 2.8v18.4M4 7.4l16 9.2M20 7.4 4 16.6"></path><path d="M9.4 4.8 12 7.2l2.6-2.4M9.4 19.2 12 16.8l2.6 2.4"></path></g></symbol>
<symbol id="ic-stove" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3.6" y="4.4" width="16.8" height="15.2" rx="2"></rect><path d="M3.6 9.6h16.8"></path><circle cx="8.4" cy="7" r="1"></circle><circle cx="12" cy="7" r="1"></circle><path d="M8 13.2h8v3.4H8z"></path></g></symbol>
<symbol id="ic-washer" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="4" y="3.4" width="16" height="17.2" rx="2.2"></rect><path d="M4 8h16"></path><circle cx="12" cy="14.4" r="3.6"></circle><circle cx="7.4" cy="5.7" r=".9"></circle></g></symbol>
<symbol id="ic-car" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3.2 15.4v-2.2l2-5.2A2 2 0 0 1 7.1 6.7h9.8a2 2 0 0 1 1.9 1.3l2 5.2v2.2"></path><path d="M3.2 15.4h17.6v2.4H3.2z"></path><path d="M5.4 12.4h13.2"></path><path d="M6.4 17.8v1.6M17.6 17.8v1.6"></path></g></symbol>
<symbol id="ic-bulb" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8.4 13.6a4.6 4.6 0 1 1 7.2 0c-.9 1.1-1.4 1.9-1.5 3H9.9c-.1-1.1-.6-1.9-1.5-3z"></path><path d="M10 19.6h4M10.7 21.8h2.6"></path></g></symbol>
<symbol id="ic-tv" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="2.8" y="4.4" width="18.4" height="12" rx="2"></rect><path d="M8.4 19.8h7.2"></path></g></symbol>
<symbol id="ic-water" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3.2s6 6.5 6 10.4a6 6 0 0 1-12 0C6 9.7 12 3.2 12 3.2z"></path></g></symbol>
<symbol id="ic-server" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3.4" y="4" width="17.2" height="6.4" rx="1.6"></rect><rect x="3.4" y="13.6" width="17.2" height="6.4" rx="1.6"></rect><path d="M6.6 7.2h.01M6.6 16.8h.01M17.4 7.2h-3M17.4 16.8h-3"></path></g></symbol>
<symbol id="ic-plug" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7.4 3.6v5M16.6 3.6v5"></path><path d="M5 8.6h14v2.6a7 7 0 0 1-14 0z"></path><path d="M12 18.2v2.6"></path></g></symbol>
<symbol id="ic-fan" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="12" r="2"></circle><path d="M12 10c0-3.4-1-6.6 2.4-6.6 2.6 0 2.6 4-2.4 6.6M14 12c3.4 0 6.6-1 6.6 2.4 0 2.6-4 2.6-6.6-2.4M10 12c-3.4 0-6.6 1-6.6-2.4C3.4 7 7.4 7 10 12M12 14c0 3.4 1 6.6-2.4 6.6-2.6 0-2.6-4 2.4-6.6"></path></g></symbol>
`;

export const EFC_ICONS = [
  'sun', 'panel', 'house', 'tower', 'battery', 'climate', 'stove',
  'washer', 'car', 'bulb', 'tv', 'water', 'server', 'plug', 'fan'
];

const iconHref = (name) => '#ic-' + (EFC_ICONS.indexOf(name) >= 0 ? name : 'plug');

/* ------------------------------------------------------------- formatery */

/* ustawiane przez kartę na początku każdego renderu, żeby liczby szły w języku karty */
let LOCALE = 'pl-PL';

const nf = (v, d) =>
  Number(v).toLocaleString(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d });

/* `-0` po odwróceniu znaku wypisywałoby się jako „-0 W" */
const noNegZero = (v) => (v === 0 ? 0 : v);

function fmtW(w) {
  if (w === null || w === undefined || Number.isNaN(w)) return '—';
  const a = Math.abs(w);
  if (a >= 1000000) return nf(w / 1000000, 2) + ' MW';
  if (a >= 1000) return nf(w / 1000, a >= 10000 ? 1 : 2) + ' kW';
  return nf(noNegZero(Math.round(w)), 0) + ' W';
}

function fmtKwh(k) {
  if (k === null || k === undefined || Number.isNaN(k)) return '—';
  if (Math.abs(k) >= 1000) return nf(k / 1000, 2) + ' MWh';
  return nf(noNegZero(k), Math.abs(k) < 10 ? 2 : 1) + ' kWh';
}

const POWER_FACTOR = { W: 1, kW: 1000, MW: 1000000, mW: 0.001 };
const VOLT_FACTOR = { V: 1, kV: 1000, mV: 0.001 };
const AMP_FACTOR = { A: 1, mA: 0.001, kA: 1000 };
const FREQ_FACTOR = { Hz: 1, kHz: 1000, mHz: 0.001 };

const fmtHz = (v) => (v === null || v === undefined ? null : nf(v, 2) + ' Hz');

const fmtV = (v) => (v === null || v === undefined ? null : nf(v, Math.abs(v) < 1000 ? 1 : 0) + ' V');
const fmtA = (a) => (a === null || a === undefined ? null : nf(a, Math.abs(a) < 100 ? 2 : 1) + ' A');
const ENERGY_FACTOR = { Wh: 0.001, kWh: 1, MWh: 1000, GWh: 1000000 };

/* każde pole encji może być pojedynczym id albo listą id — lista jest sumowana */
const asList = (ref) =>
  ref === null || ref === undefined ? [] : Array.isArray(ref) ? ref.filter(Boolean) : [ref];

const entityLabel = (ref) => {
  const l = asList(ref);
  if (!l.length) return '—';
  if (l.length === 1) return l[0];
  return l.length + ' encji · suma';
};

/* bloki, które można przesuwać w trybie swobodnym */
const LAY_KEYS = ['strings', 'solar', 'hub', 'grid', 'batt', 'consumers'];
const LAY_LABELS = {
  strings: 'Falowniki',
  solar: 'Fotowoltaika',
  hub: 'Dom',
  grid: 'Sieć',
  batt: 'Akumulator',
  consumers: 'Odbiorniki'
};
/* awaryjne pozycje, gdy nie da się zmierzyć układu automatycznego */
const LAY_FALLBACK = {
  strings: { x: 50, y: 9 },
  solar: { x: 26, y: 32 },
  hub: { x: 26, y: 58 },
  grid: { x: 9, y: 58 },
  batt: { x: 26, y: 85 },
  consumers: { x: 72, y: 55 }
};

const slug = (s, i) =>
  (String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9ąćęłńóśźż]+/gi, '_')
    .replace(/^_+|_+$/g, '') || 'grupa') + '_' + i;

const esc = (s) =>
  String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');


const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);


/* --------------------------------------------------------------- style */

const STYLES = `
:host { display:block; }
* { box-sizing:border-box; }

.wrap[data-theme="dark"] {
  --bg:#0a0e13; --card:#0f151c; --panel:#141c25; --line:#24303c; --tx:#e4ecf3;
  --mut:#8fa3b5; --sh:rgba(0,0,0,.45);
  --solar:#f5a524; --grid:#5aa9ff; --cons:#2dd4bf; --batt:#f472b6;
}
.wrap[data-theme="light"] {
  --bg:#eef1f5; --card:#f8fafc; --panel:#ffffff; --line:#d5dde6; --tx:#101820;
  --mut:#5d6f80; --sh:rgba(16,32,48,.10);
  --solar:#a9600a; --grid:#1f6feb; --cons:#0f766e; --batt:#be185d;
}

@keyframes dcflow { to { stroke-dashoffset:-34; } }
@keyframes dcpulse { 0%,100% { opacity:.35 } 50% { opacity:.75 } }
@keyframes dcspin { to { transform:rotate(360deg) } }

.wrap {
  font-family:var(--ha-font-family-body,var(--primary-font-family,Roboto,system-ui,sans-serif));
  color:var(--tx);
}
.mono { font-family:var(--ha-font-family-code,var(--code-font-family,ui-monospace,SFMono-Regular,Menlo,monospace)); }

.head { margin:0 0 14px; }
.head .kicker { font-size:11px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--mut); }
.head .title { font-size:22px;font-weight:600;letter-spacing:-.01em;margin-top:6px; }
.head .sub { font-size:13px;color:var(--mut);margin-top:5px;max-width:640px; }

.card {
  position:relative;width:100%;padding:18px;border:1px solid var(--line);
  border-radius:18px;background:var(--card);
}
.flows { position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:0; }

.grid {
  position:relative;z-index:1;display:grid;gap:30px 46px;align-items:center;
  grid-template-columns:minmax(200px,230px) minmax(210px,250px) minmax(320px,1fr);
  grid-template-areas:"strings strings strings" "gridn sum consumers" "gridn hub consumers" "gridn batt consumers";
}
.grid.narrow {
  gap:26px 12px;grid-template-columns:1fr;
  grid-template-areas:"strings" "sum" "hub" "gridn" "batt" "consumers";
}

/* tryb swobodny: bloki pozycjonowane procentowo względem karty, łączniki liczone z DOM */
.grid.free { display:block;position:relative;height:var(--freeh,700px); }
.grid.free > * { position:absolute;transform:translate(-50%,-50%);margin:0;max-width:96%; }
.grid.free .consumers { width:var(--railw,46%); }
.grid.free.editing > * {
  outline:1px dashed color-mix(in oklab,var(--cons) 50%,transparent);outline-offset:7px;
  border-radius:14px;cursor:grab;touch-action:none;
}
.grid.free.editing > *:hover { outline-color:var(--cons); }
.grid.free.editing > *.dragging { cursor:grabbing;outline-color:var(--cons);z-index:6; }
.lay-bar {
  position:absolute;top:10px;right:12px;z-index:8;display:flex;align-items:center;gap:6px;
}
.lay-btn {
  display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:999px;cursor:pointer;
  background:var(--panel);border:1px solid var(--line);color:var(--mut);
  font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;user-select:none;
  font-family:inherit;
}
.lay-btn:hover { border-color:var(--cons);color:var(--cons); }
.lay-btn.on { background:color-mix(in oklab,var(--cons) 18%,var(--panel));border-color:var(--cons);color:var(--cons); }
.lay-toast {
  position:absolute;top:44px;right:12px;z-index:9;padding:7px 11px;border-radius:9px;
  background:var(--panel);border:1px solid var(--cons);color:var(--tx);font-size:11px;
  box-shadow:0 10px 24px var(--sh);pointer-events:none;
}

[data-off="true"] { opacity:.42;filter:saturate(.15);border-style:dashed !important; }
[data-idle="true"] { opacity:.62; }
.hidden { display:none !important; }

.strings { grid-area:strings;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:flex-start; }
.string {
  position:relative;z-index:1;display:flex;gap:9px;align-items:center;padding:9px 11px;
  border:1px solid var(--line);border-radius:13px;background:var(--panel);cursor:pointer;
  box-shadow:0 1px 2px var(--sh);transition:border-color .15s,transform .15s;
}
.string:hover { border-color:var(--solar);transform:translateY(-1px); }
.string svg { color:var(--solar);flex:none; }
.string .lbl { font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--mut);white-space:nowrap; }
.string .row { display:flex;gap:7px;align-items:center;margin-top:5px; }
.chip-solar {
  font-size:13px;font-weight:600;color:var(--solar);border:1px solid color-mix(in oklab,var(--solar) 48%,transparent);
  background:color-mix(in oklab,var(--solar) 12%,transparent);border-radius:7px;padding:3px 7px;white-space:nowrap;
}
.sub-mono { font-size:11px;color:var(--mut);white-space:nowrap; }
.dc-row { font-size:10px;color:var(--mut);margin-top:4px;white-space:nowrap;display:flex;gap:6px;align-items:center; }
.dc-row .pct { color:var(--solar);font-weight:600; }
.dc-bar { flex:1;min-width:34px;height:3px;border-radius:2px;background:color-mix(in oklab,var(--solar) 18%,transparent);overflow:hidden; }
.dc-bar i { display:block;height:100%;background:var(--solar);border-radius:2px; }
.inv-status {
  font-size:10px;color:var(--mut);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  max-width:200px;
}
.inv-status::before {
  content:'';display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--solar);
  margin-right:5px;vertical-align:middle;
}

.sumwrap { grid-area:sum;display:flex;flex-direction:column;align-items:center;gap:6px; }
.node-sum {
  position:relative;z-index:1;display:flex;gap:10px;align-items:center;padding:10px 13px;
  border:1px solid color-mix(in oklab,var(--solar) 40%,var(--line));border-radius:13px;
  background:var(--panel);cursor:pointer;box-shadow:0 1px 2px var(--sh);
}
.node-sum:hover { border-color:var(--solar); }
.node-sum svg { color:var(--solar);flex:none; }
.node-sum .big {
  font-size:16px;font-weight:600;color:var(--solar);border:1px solid color-mix(in oklab,var(--solar) 48%,transparent);
  background:color-mix(in oklab,var(--solar) 14%,transparent);border-radius:8px;padding:3px 8px;
}

.stringlist { width:100%;border:1px solid var(--line);border-radius:12px;background:var(--panel);overflow:hidden; }
.stringlist .sl-head { display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer; }
.stringlist .sl-meta { flex:1;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mut); }
.stringlist .sl-chev { font-size:10px;color:var(--mut); }
.stringlist .sl-body { padding:4px 10px 8px 20px;border-top:1px solid var(--line);display:flex;flex-direction:column; }
.sl-item { display:flex;align-items:center;gap:7px;padding:5px 4px 5px 9px;border-left:1px solid var(--line);cursor:pointer; }
.sl-item svg { color:var(--solar);flex:none;opacity:.85; }
.sl-item .n { flex:1;min-width:0;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.sl-item .p { font-size:11px;font-weight:600;color:var(--solar); }
.sl-item .e { font-size:10px;color:var(--mut);min-width:44px;text-align:right; }

.hubwrap { grid-area:hub;display:flex;justify-content:center;align-items:center; }
.node-hub {
  position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:6px;
  padding:16px 20px;border:1px solid color-mix(in oklab,var(--cons) 34%,var(--line));border-radius:20px;
  background:var(--panel);cursor:pointer;box-shadow:0 2px 10px var(--sh);
}
.node-hub:hover { border-color:var(--cons); }
.node-hub svg { color:var(--cons); }
.node-hub .lbl { font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--mut); }
.node-hub .big {
  font-size:19px;font-weight:600;color:var(--cons);border:1px solid color-mix(in oklab,var(--cons) 48%,transparent);
  background:color-mix(in oklab,var(--cons) 13%,transparent);border-radius:9px;padding:4px 10px;
}
.node-hub .kwh { font-size:11px;color:var(--mut); }
.node-hub .self { font-size:10px;letter-spacing:.04em;color:var(--solar); }

.gridwrap { grid-area:gridn;display:flex;justify-content:center;align-items:center; }
.node-grid {
  position:relative;z-index:1;display:flex;gap:10px;align-items:center;padding:11px 13px;
  border:1px solid color-mix(in oklab,var(--grid) 34%,var(--line));border-radius:14px;
  background:var(--panel);cursor:pointer;box-shadow:0 1px 2px var(--sh);
}
.node-grid:hover { border-color:var(--grid); }
.node-grid svg { color:var(--grid);flex:none; }
.node-grid .lbl { font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--mut); }
.node-grid .row { display:flex;gap:7px;align-items:center;margin-top:5px; }
.node-grid .big {
  font-size:15px;font-weight:600;color:var(--grid);border:1px solid color-mix(in oklab,var(--grid) 48%,transparent);
  background:color-mix(in oklab,var(--grid) 13%,transparent);border-radius:8px;padding:3px 8px;white-space:nowrap;
}
.node-grid .kwh { font-size:11px;color:var(--mut);margin-top:5px; }

.battwrap { grid-area:batt;display:flex;justify-content:center;align-items:center; }
.node-batt {
  position:relative;z-index:1;display:flex;gap:10px;align-items:center;padding:10px 13px;
  border:1px solid color-mix(in oklab,var(--batt) 34%,var(--line));border-radius:14px;
  background:var(--panel);cursor:pointer;box-shadow:0 1px 2px var(--sh);
}
.node-batt:hover { border-color:var(--batt); }
.node-batt svg { color:var(--batt);flex:none; }
.node-batt .lbl { font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--mut); }
.node-batt .row { display:flex;gap:7px;align-items:center;margin-top:5px; }
.node-batt .big {
  font-size:15px;font-weight:600;color:var(--batt);border:1px solid color-mix(in oklab,var(--batt) 48%,transparent);
  background:color-mix(in oklab,var(--batt) 13%,transparent);border-radius:8px;padding:3px 8px;white-space:nowrap;
}
.soc-track { margin-top:7px;height:4px;border-radius:3px;background:color-mix(in oklab,var(--batt) 18%,transparent);overflow:hidden; }
.soc-fill { height:100%;background:var(--batt);border-radius:3px;width:0%; }

.consumers { grid-area:consumers;display:flex;flex-direction:column;justify-content:center;gap:8px; }
.cons-head { display:flex;align-items:center;gap:8px;padding:0 2px; }
.cons-title { font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mut); }
.cons-rule { flex:1;height:1px;background:var(--line); }
.toggle-all {
  font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--cons);
  cursor:pointer;padding:3px 7px;border:1px solid color-mix(in oklab,var(--cons) 34%,transparent);border-radius:6px;
}
.groups {
  display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--colmin,215px),1fr));
  gap:10px;align-content:start;
}
.group.est { border-style:dashed;opacity:.85; }
.group {
  position:relative;z-index:1;border:1px solid var(--line);border-radius:14px;background:var(--panel);
  box-shadow:0 1px 2px var(--sh);align-self:start;width:100%;
}
.grp-head { display:flex;gap:9px;align-items:center;padding:9px 10px;cursor:pointer;border-radius:13px; }
.grp-head:hover { background:color-mix(in oklab,var(--cons) 7%,transparent); }
.grp-head svg { color:var(--cons);flex:none; }
.grp-txt { min-width:0;flex:1; }
.grp-lbl { font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.grp-meta { font-size:10px;color:var(--mut);margin-top:3px; }
.grp-pwr {
  font-size:12px;font-weight:600;color:var(--cons);border:1px solid color-mix(in oklab,var(--cons) 45%,transparent);
  background:color-mix(in oklab,var(--cons) 11%,transparent);border-radius:7px;padding:3px 6px;white-space:nowrap;
}
.grp-chev { font-size:10px;color:var(--mut);width:9px;text-align:center; }
.grp-body { padding:6px 10px 9px 20px;border-top:1px solid var(--line);display:flex;flex-direction:column; }
.dev { display:flex;align-items:center;gap:7px;padding:5px 6px 5px 9px;border-left:1px solid var(--line);cursor:pointer; }
.dev:hover { background:color-mix(in oklab,var(--cons) 8%,transparent); }
.dev svg { color:var(--cons);flex:none;opacity:.85; }
.dev .n { flex:1;min-width:0;font-size:11px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.dev .p { font-size:11px;font-weight:600;color:var(--cons);white-space:nowrap; }
.dev .e { font-size:10px;color:var(--mut);white-space:nowrap;min-width:44px;text-align:right; }
.dev-chev { font-size:10px;color:var(--mut);width:9px;text-align:center;flex:none; }
.dev-body { display:flex;flex-direction:column; }
.dev-body .dev .n { color:var(--mut); }

.summary {
  display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1px;margin-top:14px;
  border:1px solid var(--line);border-radius:12px;background:var(--line);overflow:hidden;
}
.stat { background:var(--card);padding:11px 13px;display:flex;flex-direction:column;gap:5px;min-width:0; }
.stat .cap { font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.stat .val { font-size:16px;font-weight:600;white-space:nowrap; }
.stat .sub { font-size:10px;color:var(--mut);white-space:nowrap;min-height:13px; }
.stat.solar .val { color:var(--solar); }
.stat.cons .val { color:var(--cons); }
.stat.grid .val { color:var(--grid); }

.legend {
  display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:14px;padding:11px 14px;
  border:1px solid var(--line);border-radius:12px;background:var(--card);
}
.legend .it { display:flex;align-items:center;gap:8px; }
.legend .sw { width:22px;height:3px;border-radius:2px; }
.legend .cap { font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--mut); }
.legend .spacer { flex:1;min-width:20px; }
.legend .note { font-size:11px;color:var(--mut); }

.tip {
  position:fixed;z-index:70;pointer-events:none;padding:10px 12px;border-radius:11px;
  background:var(--panel);border:1px solid var(--line);box-shadow:0 12px 30px var(--sh);min-width:180px;display:none;
}
.tip .lbl { font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--mut); }
.tip .vals { display:flex;gap:14px;margin-top:6px; }
.tip .v { font-size:15px;font-weight:600;color:var(--tx); }
.tip .c { font-size:9px;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-top:2px; }
.tip .eid { font-size:10px;color:var(--mut);margin-top:7px; }

.overlay {
  position:fixed;inset:0;z-index:60;background:color-mix(in oklab,#050a0f 62%,transparent);
  backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:24px;
}
.modal {
  width:100%;max-width:920px;max-height:92vh;overflow:auto;background:var(--card);
  border:1px solid var(--line);border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.5);
}
.m-head { display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid var(--line); }
.m-icon { width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:11px; }
.m-title { flex:1;min-width:0; }
.m-title .t { font-size:15px;font-weight:600; }
.m-title .e { font-size:11px;color:var(--mut);margin-top:3px;word-break:break-all; }
.m-val { text-align:right; }
.m-val .p { font-size:17px;font-weight:600; }
.m-val .k { font-size:11px;color:var(--mut);margin-top:4px; }
.m-close {
  margin-left:6px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;
  border:1px solid var(--line);border-radius:9px;color:var(--mut);cursor:pointer;font-size:15px;flex:none;
}
.m-close:hover { color:var(--tx);border-color:var(--tx); }
.m-bar { display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:14px 20px;border-bottom:1px solid var(--line); }
.chips { display:flex;gap:2px;padding:3px;border:1px solid var(--line);border-radius:10px;background:var(--panel); }
.chip {
  padding:7px 12px;border-radius:8px;cursor:pointer;font-size:11px;font-weight:600;letter-spacing:.06em;
  text-transform:uppercase;white-space:nowrap;color:var(--mut);background:transparent;
}
.chip.on { color:var(--bg); }
.m-cap { font-size:11px;color:var(--mut); }
.picker { padding:16px 20px;border-bottom:1px solid var(--line);background:var(--panel); }
.pk-head { display:flex;align-items:center;gap:12px;margin-bottom:12px; }
.pk-nav {
  width:26px;height:26px;display:flex;align-items:center;justify-content:center;border:1px solid var(--line);
  border-radius:8px;cursor:pointer;color:var(--mut);font-size:12px;
}
.pk-month { font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;min-width:170px;text-align:center; }
.pk-grid { display:grid;grid-template-columns:repeat(7,1fr);gap:4px;max-width:360px; }
.pk-dow { font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);text-align:center;padding-bottom:4px; }
.pk-day {
  text-align:center;padding:7px 0;border-radius:8px;cursor:pointer;font-size:12px;color:var(--tx);
  border:1px solid var(--line);background:transparent;
}
.pk-day.blank { border-color:transparent;cursor:default; }
.pk-day.inr { background:color-mix(in oklab,var(--cons) 20%,transparent);border-color:transparent; }
.pk-day.sel { color:var(--bg);border-color:transparent; }
.m-body { padding:18px 20px 22px; }
.state-box {
  height:300px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;
  border:1px dashed var(--line);border-radius:14px;text-align:center;
}
.spinner { width:26px;height:26px;border:2px solid var(--line);border-top-color:var(--cons);border-radius:50%;animation:dcspin .8s linear infinite; }
.state-cap { font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--mut); }
.skeleton { display:flex;gap:6px;width:70%;height:60px;align-items:flex-end; }
.skeleton i { flex:1;background:var(--line);border-radius:3px;display:block; }
.state-t { font-size:13px;font-weight:600; }
.state-s { font-size:12px;color:var(--mut);max-width:340px; }
.sec-head { display:flex;align-items:baseline;gap:10px;margin-bottom:8px; }
.sec-t { font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mut); }
.sec-m { font-size:11px;color:var(--mut); }
.chart-wrap { position:relative;width:100%;height:200px;cursor:crosshair; }
.bars-wrap { position:relative;width:100%;cursor:crosshair; }
.cross-line {
  position:absolute;top:0;bottom:0;width:1px;background:var(--mut);opacity:.5;
  pointer-events:none;display:none;
}
.cross-dot {
  position:absolute;width:9px;height:9px;border-radius:50%;border:2px solid var(--card);
  pointer-events:none;display:none;transform:translate(-50%,-50%);
}
.cross-tip {
  position:absolute;z-index:3;pointer-events:none;display:none;padding:6px 9px;border-radius:9px;
  background:var(--panel);border:1px solid var(--line);box-shadow:0 8px 20px var(--sh);white-space:nowrap;
}
.cross-tip .t { font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--mut); }
.cross-tip .v { font-size:14px;font-weight:600;margin-top:3px; }
.hlabel { position:absolute;left:2px;font-size:9px;color:var(--mut);background:var(--card);padding:0 3px;border-radius:3px;pointer-events:none; }
.xlabels { display:flex;justify-content:space-between;margin-top:5px; }
.xlabels div { font-size:9px;color:var(--mut); }
.blabels { display:flex;gap:2px;margin-top:5px; }
.blabels div { flex:1;text-align:center;font-size:9px;color:var(--mut);overflow:hidden;white-space:nowrap; }

.err { padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--card);font-size:13px; }
`;

/* ------------------------------------------------------------ szablony */

const nodeSvg = (size, name) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24"><use href="${iconHref(name)}"></use></svg>`;

/* ============================================================== KARTA */

class EnergyFlowCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._els = {};
    this._expanded = {};
    this._stringsOpen = false;
    this._narrow = false;
    this._sig = '';
    this._modal = null;
  }

  /* ---------------------------------------------------------- lovelace */

  static getConfigElement() {
    return document.createElement('energy-flow-card-editor');
  }

  static getStubConfig(hass) {
    const pick = (needle) =>
      Object.keys(hass && hass.states ? hass.states : {}).find(
        (e) =>
          e.startsWith('sensor.') &&
          e.includes(needle) &&
          hass.states[e].attributes.device_class === 'power'
      );
    return {
      type: 'custom:energy-flow-card',
      title: 'Przepływ energii',
      grid: { power: pick('grid') || '' },
      groups: [{ name: 'Odbiorniki', icon: 'plug', devices: [] }]
    };
  }

  getCardSize() {
    const n = this._cfg && this._cfg.groups ? this._cfg.groups.length : 1;
    return 6 + Math.ceil(n / 3) * 2;
  }

  /* ------------------------------------------------------ konfiguracja */

  setConfig(config) {
    if (!config || typeof config !== 'object') throw new Error('Brak konfiguracji karty.');
    this._cfg = this._normalize(config);
    this._expanded = {};
    this._expandedDev = {};
    const markDev = (d) => {
      if (d.expanded) this._expandedDev[d.key] = true;
      d.children.forEach(markDev);
    };
    this._cfg.groups.forEach((g) => {
      if (g.expanded) this._expanded[g.id] = true;
      g.devices.forEach(markDev);
    });
    this._sig = '';
    this._derived = null;
    this._hash = null;
    this._rawLayoutNodes = Object.assign({}, this._cfg.layout.nodes);
    this._rawLayoutMode = this._cfg.layout.mode;
    this._editLayout = !!this._cfg.layout.edit;
    this._loadStoredLayout();
    this._build();
    if (this._hass) this._update();
  }

  _normalize(raw) {
    const c = {
      title: raw.title !== undefined ? raw.title : 'Przepływ energii',
      subtitle: raw.subtitle || '',
      /* nadtytuł tylko wtedy, gdy ktoś świadomie go wpisze */
      kicker: raw.kicker || '',
      header: raw.header !== false && (raw.title !== '' || raw.subtitle),
      legend: raw.legend !== false,
      animate: raw.animate !== false,
      history: raw.history !== false,
      layout_button: raw.layout_button !== false,
      theme_mode: raw.theme_mode || 'auto',
      language: raw.language || 'auto',
      idle_threshold: Number(raw.idle_threshold) > 0 ? Number(raw.idle_threshold) : 15,
      solar: null,
      grid: null,
      battery: null,
      house: null,
      groups: [],
      layout: {
        mode: raw.layout && raw.layout.mode === 'free' ? 'free' : 'auto',
        edit: !!(raw.layout && raw.layout.edit),
        height: Number(raw.layout && raw.layout.height) || 0,
        rail_width: Number(raw.layout && raw.layout.rail_width) || 46,
        nodes: Object.assign({}, (raw.layout && raw.layout.nodes) || {})
      }
    };

    if (raw.solar && (raw.solar.strings || []).length) {
      c.solar = {
        name: raw.solar.name || null,
        power: raw.solar.power || null,
        energy: raw.solar.energy || null,
        invert: !!raw.solar.invert,
        max_power: Number(raw.solar.max_power) || 0,
        status: raw.solar.status || null,
        voltage: raw.solar.voltage || null,
        current: raw.solar.current || null,
        frequency: raw.solar.frequency || null,
        strings: (raw.solar.strings || []).map((s, i) => ({
          key: 'str' + i,
          name: s.name || null,
          icon: s.icon || 'panel',
          power: s.power || null,
          energy: s.energy || null,
          voltage: s.voltage || null,
          current: s.current || null,
          max_power: Number(s.max_power) || 0,
          invert: s.invert === undefined ? !!raw.solar.invert : !!s.invert
        }))
      };
    }

    if (raw.grid && (raw.grid.power || raw.grid.power_import || raw.grid.power_export)) {
      c.grid = {
        name: raw.grid.name || null,
        power: raw.grid.power || null,
        power_import: raw.grid.power_import || null,
        power_export: raw.grid.power_export || null,
        energy_import: raw.grid.energy_import || null,
        energy_export: raw.grid.energy_export || null,
        invert: !!raw.grid.invert
      };
    }

    if (raw.battery && raw.battery.power) {
      c.battery = {
        name: raw.battery.name || null,
        power: raw.battery.power,
        soc: raw.battery.soc || null,
        energy: raw.battery.energy || null,
        invert: !!raw.battery.invert
      };
    }

    c.house = {
      name: (raw.house && raw.house.name) || null,
      power: (raw.house && raw.house.power) || null,
      energy: (raw.house && raw.house.energy) || null,
      self_sufficiency: (raw.house && raw.house.self_sufficiency) || null,
      invert: !!(raw.house && raw.house.invert)
    };

    /* urządzenie może mieć własne pod-urządzenia (`devices:`) — np. kanały modułu.
       Rodzic bez własnych encji sumuje dzieci. */
    const normDevice = (d, key, inheritInvert) => {
      const invert = d.invert === undefined ? inheritInvert : !!d.invert;
      return {
        key,
        name: d.name || (typeof d.power === 'string' ? d.power : null),
        icon: d.icon || 'plug',
        power: d.power || null,
        energy: d.energy || null,
        invert,
        expanded: !!d.expanded,
        children: (d.devices || []).map((cd, k) => normDevice(cd, key + '_' + k, invert))
      };
    };

    c.groups = (raw.groups || []).map((g, i) => ({
      id: g.id || slug(g.name, i),
      name: g.name || null,
      icon: g.icon || 'plug',
      expanded: !!g.expanded,
      virtual: false,
      devices: (g.devices || []).map((d, j) => normDevice(d, 'd' + i + '_' + j, !!g.invert))
    }));

    /* reszta domu = moc domu − suma opomiarowanych grup; ma sens tylko wtedy,
       gdy moc domu pochodzi z bilansu albo osobnej encji, a nie z sumy tych grup */
    const um = raw.house && raw.house.unmetered;
    if (um && c.house.power) {
      c.groups.push({
        id: '__unmetered',
        name: (um.name || null),
        icon: (um.icon || 'plug'),
        expanded: false,
        virtual: true,
        devices: []
      });
    }

    return c;
  }

  /* ----------------------------------------------------------- odczyty */

  /* --------------------------------------------------------- język */

  _fmtDay(t) {
    return new Date(t).toLocaleDateString(this._dict().locale, { day: 'numeric', month: 'short' });
  }

  _dict() {
    const want = this._cfg ? this._cfg.language : 'auto';
    if (LANGS[want]) return LANGS[want];
    const hl =
      (this._hass && (this._hass.language || (this._hass.locale && this._hass.locale.language))) || 'pl';
    return LANGS[String(hl).slice(0, 2).toLowerCase()] || PL;
  }

  _tx(key, vars) {
    return tr(this._dict(), key, vars);
  }

  /* liczebniki: 1 / 2-4 / 5+ (w angielskim druga i trzecia forma są takie same) */
  _plural(n, key) {
    const forms = this._dict()[key] || PL[key] || ['', '', ''];
    if (n === 1) return forms[0];
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
    return forms[2];
  }

  _state(entityId) {
    if (!entityId || !this._hass) return null;
    return this._hass.states[entityId] || null;
  }

  _read(entityId, factors) {
    const st = this._state(entityId);
    /* encji nie ma w ogóle w Home Assistancie — literówka w id albo usunięta integracja */
    if (!st) {
      if (entityId) this._missing.add(entityId);
      return { v: null, off: true, missing: true };
    }
    if (st.state === 'unavailable' || st.state === 'unknown') return { v: null, off: true };
    const raw = parseFloat(st.state);
    if (Number.isNaN(raw)) return { v: null, off: true };
    return { v: raw * (factors[st.attributes.unit_of_measurement] || 1), off: false };
  }

  /* suma po liście encji; „niedostępne", gdy żadna z nich nie ma poprawnego odczytu */
  _sum(ref, factors, invert) {
    const ids = asList(ref);
    if (!ids.length) return { v: null, off: true };
    let sum = 0;
    let any = false;
    let missing = 0;
    ids.forEach((id) => {
      const r = this._read(id, factors);
      if (r.missing) missing++;
      if (!r.off) {
        sum += r.v;
        any = true;
      }
    });
    if (any) return { v: sum * (invert ? -1 : 1), off: false };
    return { v: null, off: true, missing: missing === ids.length };
  }

  _power(ref, invert) {
    return this._sum(ref, POWER_FACTOR, invert);
  }

  /* `invert` dotyczy wyłącznie mocy — liczniki energii są zawsze narastające i dodatnie */
  _energy(ref) {
    return this._sum(ref, ENERGY_FACTOR, false);
  }

  _numeric(entityId) {
    const st = this._state(entityId);
    if (!st) return null;
    const v = parseFloat(st.state);
    return Number.isNaN(v) ? null : v;
  }

  /* -------------------------------------------------------------- hass */

  set hass(hass) {
    this._hass = hass;
    if (!this._cfg) return;
    if (!this._built) this._build();
    this._update();
    if (this._modal) this._syncModalHeader();
  }

  get hass() {
    return this._hass;
  }

  _themeName() {
    const t = this._cfg.theme_mode;
    if (t === 'dark' || t === 'light') return t;
    const dark =
      this._hass && this._hass.themes && this._hass.themes.darkMode !== undefined
        ? this._hass.themes.darkMode
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
    return dark ? 'dark' : 'light';
  }

  /* ------------------------------------------------------- budowa DOM */

  connectedCallback() {
    if (this._cfg && !this._built) this._build();
    this._onKey = (e) => {
      if (e.key === 'Escape') this._closeModal();
    };
    window.addEventListener('keydown', this._onKey);
    this._timer = setInterval(() => this._measure(), 900);
  }

  disconnectedCallback() {
    window.removeEventListener('keydown', this._onKey);
    clearInterval(this._timer);
    if (this._ro) this._ro.disconnect();
    this._ro = null;
    this._closeModal();
  }

  _build() {
    const c = this._cfg;
    const t = (k, v) => this._tx(k, v);
    if (!c) return;
    const root = this.shadowRoot;
    const g = c.groups;

    const stringsHtml = c.solar
      ? c.solar.strings
          .map(
            (s, si) => `
      <div class="string" data-node="s_${s.key}">
        ${nodeSvg(20, s.icon)}
        <div style="min-width:0">
          <div class="lbl">${esc(s.name || t('string_n', { n: si + 1 }))}</div>
          <div class="row"><span class="mono chip-solar" data-f="pwr">—</span><span class="mono sub-mono" data-f="kwh">—</span></div>
          <div class="mono dc-row hidden" data-f="dc"></div>
        </div>
      </div>`
          )
          .join('')
      : '';

    const stringListHtml = c.solar
      ? c.solar.strings
          .map(
            (s, si) => `
      <div class="sl-item" data-node="sl_${s.key}">
        ${nodeSvg(14, s.icon)}
        <div class="n">${esc(s.name || t('string_n', { n: si + 1 }))}</div>
        <div class="mono p" data-f="pwr">—</div>
        <div class="mono e" data-f="kwh">—</div>
      </div>`
          )
          .join('')
      : '';

    /* wiersz urządzenia; moduł z pod-urządzeniami dostaje strzałkę i zwijaną listę kanałów */
    const devRow = (d, depth) => {
      const kids = d.children || [];
      return `
      <div class="dev" data-node="dev_${d.key}"${kids.length ? ` data-devtoggle="${d.key}"` : ''} style="padding-left:${
        9 + depth * 12
      }px">
        ${nodeSvg(14, d.icon)}
        <div class="n">${esc(d.name || t('device'))}</div>
        <div class="mono p" data-f="pwr">—</div>
        <div class="mono e" data-f="kwh">—</div>
        ${kids.length ? '<span class="dev-chev" data-f="chev">▸</span>' : ''}
      </div>
      ${
        kids.length
          ? `<div class="dev-body hidden" data-devbody="${d.key}">${kids
              .map((k) => devRow(k, depth + 1))
              .join('')}</div>`
          : ''
      }`;
    };

    const groupsHtml = g
      .map(
        (grp, gi) => `
      <div class="group ${grp.virtual ? 'est' : ''}" data-group="${esc(grp.id)}">
        <div class="grp-head" data-toggle="${esc(grp.id)}">
          ${nodeSvg(19, grp.icon)}
          <div class="grp-txt">
            <div class="grp-lbl">${esc(grp.name || t('group_n', { n: gi + 1 }))}</div>
            <div class="mono grp-meta" data-f="meta">—</div>
          </div>
          <span class="mono grp-pwr" data-f="pwr">—</span>
          ${grp.virtual ? '' : '<span class="grp-chev" data-f="chev">▸</span>'}
        </div>
        <div class="grp-body hidden" data-body="${esc(grp.id)}">
          ${grp.devices.map((d) => devRow(d, 0)).join('')}
        </div>
      </div>`
      )
      .join('');

    root.innerHTML = `
<style>${STYLES}</style>
<div class="wrap" data-theme="dark">
  ${
    c.header
      ? `<div class="head">
      ${c.kicker ? `<div class="kicker">${esc(c.kicker)}</div>` : ''}
      ${c.title ? `<div class="title">${esc(c.title)}</div>` : ''}
      ${c.subtitle ? `<div class="sub">${esc(c.subtitle)}</div>` : ''}
    </div>`
      : ''
  }

  <div class="card" id="card">
    <svg class="flows" aria-hidden="true">
      <defs>${ICON_SYMBOLS}</defs>
      <g id="lyr-idle"></g>
      <g id="lyr-act"></g>
    </svg>
    <div class="lay-bar ${c.layout_button === false ? 'hidden' : ''}" id="lay-bar">
      <div class="lay-btn" id="lay-toggle">${t('layout')}</div>
      <div class="lay-btn hidden" id="lay-copy">${t('layout_copy')}</div>
      <div class="lay-btn hidden" id="lay-reset">${t('layout_reset')}</div>
    </div>
    <div class="lay-toast hidden" id="lay-toast"></div>

    <div class="grid" id="grid">
      <div class="strings ${c.solar ? '' : 'hidden'}" id="strings" data-lay="strings">${stringsHtml}</div>

      <div class="sumwrap ${c.solar ? '' : 'hidden'}" id="sumwrap" data-lay="solar">
        <div class="node-sum" data-node="solar-sum">
          ${nodeSvg(22, 'sun')}
          <div>
            <div class="lbl">${esc(c.solar ? c.solar.name || t('solar_total') : '')}</div>
            <div class="row">
              <span class="mono big" data-f="pwr">—</span>
              <span class="mono sub-mono" data-f="kwh">—</span>
            </div>
            <div class="mono dc-row hidden" data-f="ac"></div>
            <div class="mono inv-status hidden" data-f="status"></div>
          </div>
        </div>
        <div class="stringlist hidden" id="stringlist">
          <div class="sl-head" id="sl-head">
            <div class="sl-meta" id="sl-meta">—</div>
            <span class="sl-chev" id="sl-chev">▸</span>
          </div>
          <div class="sl-body hidden" id="sl-body">${stringListHtml}</div>
        </div>
      </div>

      <div class="hubwrap" data-lay="hub">
        <div class="node-hub" data-node="hub">
          ${nodeSvg(30, 'house')}
          <div class="lbl">${esc(c.house.name || t('house'))}</div>
          <span class="mono big" data-f="pwr">—</span>
          <div class="mono kwh" data-f="kwh">—</div>
          <div class="mono self" data-f="self">—</div>
        </div>
      </div>

      <div class="gridwrap ${c.grid ? '' : 'hidden'}" data-lay="grid">
        <div class="node-grid" data-node="grid">
          ${nodeSvg(24, 'tower')}
          <div>
            <div class="lbl" data-f="label">${esc(c.grid ? c.grid.name || t('grid') : '')}</div>
            <div class="row"><span class="mono big" data-f="pwr">—</span></div>
            <div class="mono kwh" data-f="kwh">—</div>
          </div>
        </div>
      </div>

      <div class="battwrap ${c.battery ? '' : 'hidden'}" data-lay="batt">
        <div class="node-batt" data-node="batt">
          ${nodeSvg(24, 'battery')}
          <div>
            <div class="lbl" data-f="label">${esc(c.battery ? c.battery.name || t('battery') : '')}</div>
            <div class="row">
              <span class="mono big" data-f="pwr">—</span>
              <span class="mono sub-mono" data-f="kwh">—</span>
            </div>
            <div class="soc-track"><div class="soc-fill" data-f="soc"></div></div>
          </div>
        </div>
      </div>

      <div class="consumers" data-lay="consumers">
        <div class="cons-head">
          <div class="cons-title" id="cons-title">${t('consumers')}</div>
          <div class="cons-rule"></div>
          <div class="toggle-all" id="toggle-all">${t('expand_all')}</div>
        </div>
        <div class="groups" id="groups">${groupsHtml}</div>
      </div>
    </div>
  </div>

  <div class="summary hidden" id="summary">
    <div class="stat solar" data-stat="produced"><div class="cap">${t('sum_produced')}</div><div class="mono val">—</div><div class="mono sub"></div></div>
    <div class="stat cons" data-stat="consumed"><div class="cap">${t('sum_consumed')}</div><div class="mono val">—</div><div class="mono sub"></div></div>
    <div class="stat solar" data-stat="selfUsed"><div class="cap">${t('sum_self_used')}</div><div class="mono val">—</div><div class="mono sub"></div></div>
    <div class="stat grid" data-stat="exported"><div class="cap">${t('sum_exported')}</div><div class="mono val">—</div><div class="mono sub"></div></div>
    <div class="stat grid" data-stat="imported"><div class="cap">${t('sum_imported')}</div><div class="mono val">—</div><div class="mono sub"></div></div>
  </div>

  ${
    c.legend
      ? `<div class="legend">
    <div class="it"><span class="sw" style="background:var(--solar);box-shadow:0 0 6px var(--solar)"></span><span class="cap">${t('legend_solar')}</span></div>
    <div class="it"><span class="sw" style="background:var(--grid);box-shadow:0 0 6px var(--grid)"></span><span class="cap">${t('legend_grid')}</span></div>
    <div class="it"><span class="sw" style="background:var(--cons);box-shadow:0 0 6px var(--cons)"></span><span class="cap">${t('legend_consumption')}</span></div>
    <div class="it"><span class="sw" style="background:var(--batt);box-shadow:0 0 6px var(--batt)"></span><span class="cap">${t('legend_battery')}</span></div>
    <div class="spacer"></div>
    <div class="mono note">${t('legend_note')}</div>
  </div>`
      : ''
  }

  <div class="tip" id="tip">
    <div class="lbl" id="tip-lbl"></div>
    <div class="vals">
      <div><div class="mono v" id="tip-p"></div><div class="c">${t('tip_now')}</div></div>
      <div><div class="mono v" id="tip-e"></div><div class="c">${t('tip_today')}</div></div>
    </div>
    <div class="mono eid" id="tip-id"></div>
  </div>
</div>`;

    this._built = true;
    this._builtLang = this._dict();
    this._cacheRefs();
    this._bindEvents();
    this._bindDrag();
    this._bindLayoutButtons();

    const card = root.getElementById('card');
    if (this._ro) this._ro.disconnect();
    this._ro = new ResizeObserver(() => this._measure());
    this._ro.observe(card);
    requestAnimationFrame(() => this._measure());
  }

  _cacheRefs() {
    const root = this.shadowRoot;
    this._els = {};
    root.querySelectorAll('[data-node]').forEach((el) => {
      this._els[el.dataset.node] = el;
    });
    root.querySelectorAll('[data-group]').forEach((el) => {
      this._els['grp-' + el.dataset.group] = el;
    });
    this._q = {
      wrap: root.querySelector('.wrap'),
      card: root.getElementById('card'),
      grid: root.getElementById('grid'),
      groups: root.getElementById('groups'),
      summary: root.getElementById('summary'),
      strings: root.getElementById('strings'),
      stringlist: root.getElementById('stringlist'),
      slHead: root.getElementById('sl-head'),
      slBody: root.getElementById('sl-body'),
      slMeta: root.getElementById('sl-meta'),
      slChev: root.getElementById('sl-chev'),
      consTitle: root.getElementById('cons-title'),
      toggleAll: root.getElementById('toggle-all'),
      lyrIdle: root.getElementById('lyr-idle'),
      lyrAct: root.getElementById('lyr-act'),
      tip: root.getElementById('tip'),
      tipLbl: root.getElementById('tip-lbl'),
      tipP: root.getElementById('tip-p'),
      tipE: root.getElementById('tip-e'),
      tipId: root.getElementById('tip-id')
    };
  }

  _bindEvents() {
    const root = this.shadowRoot;

    root.querySelectorAll('[data-devtoggle]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const k = el.dataset.devtoggle;
        this._expandedDev[k] = !this._expandedDev[k];
        this._applyExpansion();
      });
    });

    root.querySelectorAll('[data-node]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        /* po przeciągnięciu bloku nie otwieramy historii */
        if (this._suppressClick || this._layoutEditing()) return;
        /* moduł z kanałami rozwija listę zamiast otwierać historię */
        if (el.hasAttribute('data-devtoggle')) return;
        const n = this._nodes && this._nodes[el.dataset.node];
        if (n) this._openModal(n, el.dataset.node);
      });
      el.addEventListener('mouseenter', (ev) => this._showTip(el.dataset.node, ev));
      el.addEventListener('mousemove', (ev) => this._showTip(el.dataset.node, ev));
      el.addEventListener('mouseleave', () => this._hideTip());
    });

    root.querySelectorAll('[data-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.toggle;
        this._expanded[id] = !this._expanded[id];
        this._applyExpansion();
      });
      el.addEventListener('mouseenter', (ev) => this._showTip('grp-' + el.dataset.toggle, ev));
      el.addEventListener('mousemove', (ev) => this._showTip('grp-' + el.dataset.toggle, ev));
      el.addEventListener('mouseleave', () => this._hideTip());
    });

    this._q.toggleAll.addEventListener('click', () => {
      const anyOpen = this._cfg.groups.some((g) => this._expanded[g.id]);
      this._cfg.groups.forEach((g) => {
        this._expanded[g.id] = !anyOpen;
      });
      this._applyExpansion();
    });

    this._q.slHead.addEventListener('click', () => {
      this._stringsOpen = !this._stringsOpen;
      this._applyExpansion();
    });
  }

  _applyExpansion() {
    const root = this.shadowRoot;
    root.querySelectorAll('[data-devbody]').forEach((body) => {
      const k = body.dataset.devbody;
      const open = !!this._expandedDev[k];
      body.classList.toggle('hidden', !open);
      const chev = root.querySelector(`[data-devtoggle="${k}"] [data-f="chev"]`);
      if (chev) chev.textContent = open ? '▾' : '▸';
    });
    this._cfg.groups.forEach((g) => {
      const body = root.querySelector(`[data-body="${g.id}"]`);
      const chev = root.querySelector(`[data-toggle="${g.id}"] [data-f="chev"]`);
      const open = !!this._expanded[g.id];
      if (body) body.classList.toggle('hidden', !open);
      if (chev) chev.textContent = open ? '▾' : '▸';
    });
    const anyOpen = this._cfg.groups.some((g) => this._expanded[g.id]);
    this._q.toggleAll.textContent = this._tx(anyOpen ? 'collapse_all' : 'expand_all');

    this._q.slBody.classList.toggle('hidden', !this._stringsOpen);
    this._q.slChev.textContent = this._stringsOpen ? '▾' : '▸';
    if (this._cfg.solar) {
      this._q.slMeta.textContent =
        this._cfg.solar.strings.length +
        ' ' +
        this._plural(this._cfg.solar.strings.length, 'plural_string') +
        (this._stringsOpen ? '' : ' · ' + this._tx('tap_to_expand'));
    }
    requestAnimationFrame(() => this._measure());
  }

  /* -------------------------------------------------- obliczenia modelu */

  /* własna encja autonomii ma pierwszeństwo przed wyliczeniem z bilansu */
  _selfPct(power, gridImport) {
    const own = this._numeric(this._cfg.house.self_sufficiency);
    if (own !== null) return Math.round(Math.max(0, Math.min(100, own)));
    if (!(power > 0)) return 100;
    return Math.round((100 * Math.max(0, power - gridImport)) / power);
  }

  /* energia domu z bilansu, reszta niezmierzona i podsumowanie dnia */
  _fillDerived(house, groups, solar, grid, consSum, consNrg) {
    const pv = solar && solar.energy != null ? solar.energy : null;
    const imp = grid && grid.energyImport != null ? grid.energyImport : null;
    const exp = grid && grid.energyExport != null ? grid.energyExport : null;

    /* zużycie domu = produkcja + pobór − oddanie */
    if (this._cfg.house.energy === 'auto') {
      house.energy = pv !== null && imp !== null ? pv + imp - (exp || 0) : null;
    }

    const um = groups.find((g) => g.virtual);
    if (um) {
      um.power = Math.max(0, Math.round((house.power || 0) - consSum));
      um.energy = house.energy != null ? Math.max(0, house.energy - consNrg) : null;
      um.idle = um.power < this._cfg.idle_threshold;
    }

    house.summary = {
      produced: pv,
      consumed: house.energy != null ? house.energy : null,
      exported: exp,
      imported: imp,
      /* z produkcji: ile zużyte na miejscu, ile oddane */
      selfUsed: pv !== null && exp !== null ? Math.max(0, pv - exp) : null,
      selfConsumption: pv > 0 && exp !== null ? Math.round((100 * Math.max(0, pv - exp)) / pv) : null,
      selfSufficiency:
        house.energy > 0 && imp !== null
          ? Math.round((100 * Math.max(0, house.energy - imp)) / house.energy)
          : null
    };
  }

  _model() {
    const c = this._cfg;
    const idle = c.idle_threshold;
    this._missing = new Set();

    const strings = c.solar
      ? c.solar.strings.map((s, i) => {
          const p = this._power(s.power, s.invert);
          const e = this._energy(s.energy);
          const u = this._sum(s.voltage, VOLT_FACTOR, false);
          const a = this._sum(s.current, AMP_FACTOR, false);
          return {
            key: s.key,
            name: s.name || this._tx('string_n', { n: i + 1 }),
            icon: s.icon,
            power: p.v,
            energy: e.v,
            volt: u.off ? null : u.v,
            amp: a.off ? null : a.v,
            maxPower: s.max_power,
            pct: s.max_power > 0 && !p.off ? Math.round((Math.abs(p.v) / s.max_power) * 100) : null,
            off: p.off,
            missing: !!p.missing,
            idle: !p.off && Math.abs(p.v) < idle,
            powerEntity: s.power,
            energyEntity: s.energy
          };
        })
      : [];

    let solar = null;
    if (c.solar) {
      const direct = c.solar.power ? this._power(c.solar.power, c.solar.invert) : null;
      const sum = strings.reduce((t, s) => t + (s.off ? 0 : s.power), 0);
      const eDirect = c.solar.energy ? this._energy(c.solar.energy) : null;
      const eSum = strings.reduce((t, s) => t + (s.energy || 0), 0);
      solar = {
        name: c.solar.name || this._tx('solar_total'),
        power: direct && !direct.off ? direct.v : sum,
        energy: eDirect && !eDirect.off ? eDirect.v : eSum,
        maxPower: c.solar.max_power || strings.reduce((t, s) => t + (s.maxPower || 0), 0),
        powerEntities: c.solar.power
          ? asList(c.solar.power)
          : strings.reduce((a, s) => a.concat(asList(s.powerEntity)), []),
        energyEntities: c.solar.energy
          ? asList(c.solar.energy)
          : strings.reduce((a, s) => a.concat(asList(s.energyEntity)), [])
      };
      solar.idle = Math.abs(solar.power) < idle;
      solar.pct = solar.maxPower > 0 ? Math.round((Math.abs(solar.power) / solar.maxPower) * 100) : null;

      /* strona AC falownika: napięcie, prąd, częstotliwość i stan pracy */
      const su = this._sum(c.solar.voltage, VOLT_FACTOR, false);
      const sa = this._sum(c.solar.current, AMP_FACTOR, false);
      const sf = this._sum(c.solar.frequency, FREQ_FACTOR, false);
      const sst = c.solar.status ? this._state(c.solar.status) : null;
      solar.volt = su.off ? null : su.v;
      solar.amp = sa.off ? null : sa.v;
      solar.freq = sf.off ? null : sf.v;
      solar.status =
        sst && sst.state !== 'unavailable' && sst.state !== 'unknown' ? sst.state : null;
    }

    let grid = null;
    if (c.grid) {
      let p = null;
      let off = false;
      if (c.grid.power) {
        const r = this._power(c.grid.power, c.grid.invert);
        p = r.v;
        off = r.off;
      } else {
        const imp = this._power(c.grid.power_import);
        const exp = this._power(c.grid.power_export);
        off = imp.off && exp.off;
        p = (imp.off ? 0 : imp.v) - (exp.off ? 0 : exp.v);
      }
      const ei = this._energy(c.grid.energy_import);
      const ee = this._energy(c.grid.energy_export);
      grid = {
        name: c.grid.name || this._tx('grid'),
        power: off ? null : p,
        off,
        missing: !!(c.grid.power ? this._power(c.grid.power).missing : this._power(c.grid.power_import).missing),
        idle: !off && Math.abs(p) < idle,
        energyImport: ei.v,
        energyExport: ee.v,
        powerEntities: asList(c.grid.power).concat(asList(c.grid.power_import)),
        energyEntities: asList(c.grid.energy_import).concat(asList(c.grid.energy_export))
      };
    }

    let battery = null;
    if (c.battery) {
      const r = this._power(c.battery.power, c.battery.invert);
      const e = this._energy(c.battery.energy);
      const soc = this._numeric(c.battery.soc);
      battery = {
        name: c.battery.name || this._tx('battery'),
        power: r.off ? null : r.v,
        off: r.off,
        missing: !!r.missing,
        idle: !r.off && Math.abs(r.v) < idle,
        energy: e.v,
        soc,
        powerEntities: asList(c.battery.power),
        energyEntities: asList(c.battery.energy)
      };
    }

    const buildDevice = (d) => {
      const children = d.children.map(buildDevice);
      const ownPower = asList(d.power).length > 0;
      const ownEnergy = asList(d.energy).length > 0;
      const p = ownPower ? this._power(d.power, d.invert) : null;
      const e = ownEnergy ? this._energy(d.energy) : null;
      const kidPower = children.reduce((t, k) => t + (k.off || k.unset ? 0 : k.power), 0);
      const kidEnergy = children.reduce((t, k) => t + (k.energy || 0), 0);
      const kidEntities = (f) => children.reduce((a, k) => a.concat(k[f]), []);

      const power = ownPower ? p.v : children.length ? kidPower : null;
      const energy = ownEnergy ? e.v : children.length ? kidEnergy : null;
      /* brak skonfigurowanej encji mocy ≠ encja niedostępna — nie wygaszamy wiersza */
      const unset = ownPower
        ? false
        : children.length
        ? children.every((k) => k.unset)
        : true;
      const off = ownPower ? p.off : children.length ? children.every((k) => k.off) : !!(e && e.off);
      const missing = ownPower ? !!p.missing : ownEnergy && !children.length ? !!e.missing : false;

      return {
        key: d.key,
        name: d.name || this._tx('device'),
        icon: d.icon,
        power,
        energy,
        unset,
        off,
        missing,
        idle: power !== null && !off && Math.abs(power) < 5,
        children,
        hasChildren: children.length > 0,
        powerEntities: ownPower ? asList(d.power) : kidEntities('powerEntities'),
        energyEntities: ownEnergy ? asList(d.energy) : kidEntities('energyEntities'),
        powerEntity: ownPower ? d.power : null,
        energyEntity: ownEnergy ? d.energy : null
      };
    };

    /* spłaszczona lista wszystkich poziomów — do renderowania i sum grupy */
    const flatten = (list) => list.reduce((a, d) => a.concat([d], flatten(d.children)), []);

    const groups = c.groups.map((g, gi) => {
      if (g.virtual) {
        return {
          id: g.id, name: g.name || this._tx('unmetered'), icon: g.icon, virtual: true,
          devices: [], all: [], leafCount: 0, power: 0, energy: null, active: 0,
          off: false, idle: true, powerEntities: [], energyEntities: []
        };
      }
      const devices = g.devices.map(buildDevice);
      const all = flatten(devices);
      const sum = devices.reduce((t, d) => t + (d.off || d.unset ? 0 : d.power), 0);
      const nrg = devices.reduce((t, d) => t + (d.energy || 0), 0);
      const active = all.filter((d) => !d.hasChildren && !d.off && Math.abs(d.power || 0) >= 5).length;
      const leaves = all.filter((d) => !d.hasChildren);
      return {
        id: g.id,
        name: g.name || this._tx('group_n', { n: gi + 1 }),
        icon: g.icon,
        devices,
        all,
        leafCount: leaves.length,
        power: sum,
        energy: nrg,
        active,
        off: devices.length > 0 && devices.every((d) => d.off),
        idle: sum < idle,
        powerEntities: devices.reduce((a, d) => a.concat(d.powerEntities), []),
        energyEntities: devices.reduce((a, d) => a.concat(d.energyEntities), [])
      };
    });

    const real = groups.filter((g) => !g.virtual);
    const consSum = real.reduce((t, g) => t + g.power, 0);
    const consNrg = real.reduce((t, g) => t + g.energy, 0);

    /* `power: auto` — bilans węzła zamiast osobnej encji zużycia:
       zużycie = fotowoltaika + sieć(+pobór/−oddanie) − akumulator(+ładowanie) */
    if (c.house.power === 'auto') {
      const derived =
        (solar ? solar.power : 0) +
        (grid && !grid.off ? grid.power : 0) -
        (battery && !battery.off ? battery.power : 0);
      const house0 = {
        name: c.house.name || this._tx('house'),
        power: Math.max(0, Math.round(derived)),
        energy: c.house.energy && c.house.energy !== 'auto' ? this._energy(c.house.energy).v : consNrg,
        derived: true,
        powerEntities: (solar ? solar.powerEntities : []).concat(grid ? grid.powerEntities : []),
        energyEntities: c.house.energy && c.house.energy !== 'auto' ? asList(c.house.energy) : []
      };
      const gi0 = grid && !grid.off && grid.power > 0 ? grid.power : 0;
      house0.selfPct = this._selfPct(house0.power, gi0);
      this._fillDerived(house0, groups, solar, grid, consSum, consNrg);
      return { strings, solar, grid, battery, groups, house: house0 };
    }

    const hp = c.house.power ? this._power(c.house.power, c.house.invert) : null;
    const he = c.house.energy && c.house.energy !== 'auto' ? this._energy(c.house.energy) : null;
    const house = {
      name: c.house.name || this._tx('house'),
      power: hp && !hp.off ? hp.v : consSum,
      energy: he && !he.off ? he.v : consNrg,
      powerEntities: c.house.power
        ? asList(c.house.power)
        : groups.reduce((a, g) => a.concat(g.powerEntities), []),
      energyEntities: c.house.energy && c.house.energy !== 'auto'
        ? asList(c.house.energy)
        : groups.reduce((a, g) => a.concat(g.energyEntities), [])
    };

    const gridImport = grid && !grid.off && grid.power > 0 ? grid.power : 0;
    house.selfPct = this._selfPct(house.power, gridImport);

    this._fillDerived(house, groups, solar, grid, consSum, consNrg);
    return { strings, solar, grid, battery, groups, house };
  }

  /* ---------------------------------------------------- aktualizacja UI */

  _update() {
    if (!this._cfg || !this._built || !this._hass) return;
    const c = this._cfg;
    /* język 'auto' rozwiązuje się dopiero, gdy dojdzie hass — wtedy odbuduj etykiety */
    if (this._builtLang && this._builtLang !== this._dict()) this._build();
    const t = (k, v) => this._tx(k, v);
    LOCALE = this._dict().locale;
    const m = this._model();
    this._m = m;
    this._q.wrap.dataset.theme = this._themeName();

    const nodes = {};
    const set = (el, field, value) => {
      if (!el) return;
      const t = el.querySelector(`[data-f="${field}"]`);
      if (t && t.textContent !== value) t.textContent = value;
    };
    const flags = (el, off, idle) => {
      if (!el) return;
      if (off) el.setAttribute('data-off', 'true');
      else el.removeAttribute('data-off');
      if (idle) el.setAttribute('data-idle', 'true');
      else el.removeAttribute('data-idle');
    };

    /* falowniki */
    m.strings.forEach((s) => {
      ['s_' + s.key, 'sl_' + s.key].forEach((id) => {
        const el = this._els[id];
        if (!el) return;
        set(el, 'pwr', s.missing ? t('no_entity') : s.off ? t('unavailable') : fmtW(s.power));
        set(el, 'kwh', s.off ? '—' : fmtKwh(s.energy));
        flags(el, s.off, !s.off && s.idle);

        /* wiersz DC: napięcie · prąd · wykorzystanie mocy szczytowej */
        const dc = el.querySelector('[data-f="dc"]');
        if (dc) {
          const parts = [fmtV(s.volt), fmtA(s.amp)].filter(Boolean);
          if (s.pct === null && !parts.length) {
            dc.classList.add('hidden');
          } else {
            dc.classList.remove('hidden');
            const pct = Math.max(0, Math.min(100, s.pct === null ? 0 : s.pct));
            dc.innerHTML =
              (parts.length ? `<span>${esc(parts.join(' · '))}</span>` : '') +
              (s.pct === null
                ? ''
                : `<span class="pct">${nf(s.pct, 0)}%</span><span class="dc-bar"><i style="width:${pct}%"></i></span>`);
          }
        }
        nodes[id] = {
          label: s.name,
          entityId: entityLabel(s.powerEntity),
          icon: s.icon,
          accent: 'solar',
          power: s.power,
          energy: s.energy,
          off: s.off,
          powerEntities: asList(s.powerEntity),
          energyEntities: asList(s.energyEntity)
        };
      });
    });

    /* fotowoltaika łącznie */
    if (m.solar) {
      const el = this._els['solar-sum'];
      set(el, 'pwr', fmtW(m.solar.power));
      set(el, 'kwh', fmtKwh(m.solar.energy));

      /* wiersz AC: wykorzystanie falownika + napięcie, prąd, częstotliwość */
      const ac = el.querySelector('[data-f="ac"]');
      if (ac) {
        const parts = [fmtV(m.solar.volt), fmtA(m.solar.amp), fmtHz(m.solar.freq)].filter(Boolean);
        if (m.solar.pct === null && !parts.length) {
          ac.classList.add('hidden');
        } else {
          ac.classList.remove('hidden');
          const pct = Math.max(0, Math.min(100, m.solar.pct === null ? 0 : m.solar.pct));
          ac.innerHTML =
            (m.solar.pct === null
              ? ''
              : `<span class="pct">${nf(m.solar.pct, 0)}%</span><span class="dc-bar"><i style="width:${pct}%"></i></span>`) +
            (parts.length ? `<span>${esc(parts.join(' · '))}</span>` : '');
        }
      }
      const stEl = el.querySelector('[data-f="status"]');
      if (stEl) {
        stEl.classList.toggle('hidden', !m.solar.status);
        if (m.solar.status) stEl.textContent = m.solar.status;
      }
      flags(el, false, m.solar.idle);
      nodes['solar-sum'] = {
        label: m.solar.name,
        entityId: c.solar.power
          ? entityLabel(c.solar.power)
          : t('entities_strings', { n: m.solar.powerEntities.length }),
        icon: 'sun',
        accent: 'solar',
        power: m.solar.power,
        energy: m.solar.energy,
        off: false,
        powerEntities: m.solar.powerEntities,
        energyEntities: m.solar.energyEntities
      };
    }

    /* dom */
    const hub = this._els.hub;
    set(hub, 'pwr', fmtW(m.house.power));
    set(hub, 'kwh', fmtKwh(m.house.energy));
    set(hub, 'self', t('self_sufficient', { n: m.house.selfPct }));
    nodes.hub = {
      label: m.house.name,
      entityId: c.house.power
        ? entityLabel(c.house.power)
        : t('entities_consumers', { n: m.house.powerEntities.length }),
      icon: 'house',
      accent: 'cons',
      power: m.house.power,
      energy: m.house.energy,
      off: false,
      powerEntities: m.house.powerEntities,
      energyEntities: m.house.energyEntities
    };

    /* sieć */
    if (m.grid) {
      const el = this._els.grid;
      const label = m.grid.missing
        ? m.grid.name + ' · ' + t('no_entity')
        : m.grid.off
        ? m.grid.name + ' · ' + t('unavailable_f')
        : m.grid.power >= 0
        ? t('grid_import')
        : t('grid_export');
      set(el, 'label', label);
      set(el, 'pwr', m.grid.missing ? t('no_entity') : m.grid.off ? t('unavailable') : fmtW(Math.abs(m.grid.power)));
      set(
        el,
        'kwh',
        m.grid.off ? '—' : '↓ ' + fmtKwh(m.grid.energyImport || 0) + '   ↑ ' + fmtKwh(m.grid.energyExport || 0)
      );
      flags(el, m.grid.off, !m.grid.off && m.grid.idle);
      nodes.grid = {
        label,
        entityId: entityLabel(c.grid.power || c.grid.power_import),
        icon: 'tower',
        accent: 'grid',
        power: m.grid.power,
        energy: m.grid.energyImport,
        off: m.grid.off,
        powerEntities: m.grid.powerEntities,
        energyEntities: m.grid.energyEntities
      };
    }

    /* akumulator */
    if (m.battery) {
      const el = this._els.batt;
      const label = m.battery.missing
        ? m.battery.name + ' · ' + t('no_entity')
        : m.battery.off
        ? m.battery.name + ' · ' + t('unavailable')
        : m.battery.power >= 0
        ? t('battery_charging')
        : t('battery_discharging');
      set(el, 'label', label);
      set(
        el,
        'pwr',
        m.battery.missing ? t('no_entity') : m.battery.off ? t('unavailable') : fmtW(Math.abs(m.battery.power))
      );
      set(
        el,
        'kwh',
        (m.battery.soc !== null ? nf(m.battery.soc, 0) + '% · ' : '') + fmtKwh(m.battery.energy)
      );
      const soc = el.querySelector('[data-f="soc"]');
      if (soc) soc.style.width = Math.max(0, Math.min(100, m.battery.soc || 0)) + '%';
      flags(el, m.battery.off, !m.battery.off && m.battery.idle);
      nodes.batt = {
        label,
        entityId: entityLabel(c.battery.power),
        icon: 'battery',
        accent: 'batt',
        power: m.battery.power,
        energy: m.battery.energy,
        off: m.battery.off,
        powerEntities: m.battery.powerEntities,
        energyEntities: m.battery.energyEntities
      };
    }

    /* grupy i urządzenia */
    let totalDevices = 0;
    m.groups.forEach((g) => {
      totalDevices += g.leafCount;
      const el = this._els['grp-' + g.id];
      if (!el) return;
      set(el, 'pwr', fmtW(g.power));
      set(
        el,
        'meta',
        g.leafCount +
          ' ' +
          this._plural(g.leafCount, 'plural_device') +
          ' · ' +
          g.active +
          ' ' +
          this._plural(g.active, 'plural_active') +
          ' · ' +
          fmtKwh(g.energy)
      );
      flags(el, g.off, !g.off && g.idle);
      nodes['grp-' + g.id] = {
        label: g.name + ' · ' + g.leafCount + ' ' + t('devices_short'),
        entityId: t('entities_in_group', { n: g.powerEntities.length || g.energyEntities.length }),
        icon: g.icon,
        accent: 'cons',
        power: g.power,
        energy: g.energy,
        off: g.off,
        powerEntities: g.powerEntities,
        energyEntities: g.energyEntities
      };

      g.all.forEach((d) => {
        const de = this._els['dev_' + d.key];
        if (!de) return;
        set(de, 'pwr', d.missing ? t('no_entity') : d.off ? t('no_data') : d.unset ? '—' : fmtW(d.power));
        set(de, 'kwh', d.off ? '—' : fmtKwh(d.energy));
        flags(de, d.off, !d.off && d.idle);
        nodes['dev_' + d.key] = {
          label: d.hasChildren ? d.name + ' · ' + t('sum_suffix') : d.name,
          entityId: d.hasChildren
            ? t('entities_channels', { n: d.powerEntities.length })
            : entityLabel(d.powerEntity || d.energyEntity),
          icon: d.icon,
          accent: 'cons',
          power: d.power,
          energy: d.energy,
          off: d.off,
          powerEntities: d.powerEntities,
          energyEntities: d.energyEntities
        };
      });
    });

    this._nodes = nodes;

    /* jednorazowe ostrzeżenie o encjach, których nie ma w Home Assistancie */
    const missingSig = Array.from(this._missing).sort().join(',');
    if (missingSig && missingSig !== this._missingSig) {
      this._missingSig = missingSig;
      console.warn(
        '[energy-flow-card] ' + t('missing_warning') + '\n  ' +
          Array.from(this._missing).sort().join('\n  ')
      );
    }

    this._q.consTitle.textContent =
      t('consumers') +
      ' · ' +
      totalDevices +
      ' ' +
      this._plural(totalDevices, 'plural_device') +
      ' ' +
      t('in_groups') +
      ' ' +
      m.groups.length +
      ' ' +
      this._plural(m.groups.length, 'plural_group');

    const colMin = this._narrow ? 150 : totalDevices > 18 ? 190 : 215;
    this._q.groups.style.setProperty('--colmin', colMin + 'px');

    this._fillSummary(m, t);
    this._applyExpansion();
    this._applyLayout();
    this._measure();
  }

  /* pasek podsumowania dnia: produkcja, zużycie, oddane, pobrane */
  _fillSummary(m, t) {
    const box = this._q.summary;
    if (!box) return;
    if (this._cfg.summary === false || !m.house.summary) {
      box.classList.add('hidden');
      return;
    }
    const s = m.house.summary;
    let shown = 0;
    box.querySelectorAll('[data-stat]').forEach((el) => {
      const key = el.dataset.stat;
      const v = s[key];
      if (v === null || v === undefined) {
        el.classList.add('hidden');
        return;
      }
      el.classList.remove('hidden');
      shown++;
      el.querySelector('.val').textContent = fmtKwh(v);
      const sub = el.querySelector('.sub');
      if (key === 'selfUsed' && s.selfConsumption !== null) {
        sub.textContent = t('sum_of_production', { n: s.selfConsumption });
      } else if (key === 'exported' && s.selfConsumption !== null) {
        sub.textContent = t('sum_of_production', { n: 100 - s.selfConsumption });
      } else if (key === 'consumed' && s.selfSufficiency !== null) {
        sub.textContent = t('sum_self_sufficiency', { n: s.selfSufficiency });
      } else if (key === 'imported' && s.selfSufficiency !== null) {
        sub.textContent = t('sum_of_consumption', { n: 100 - s.selfSufficiency });
      } else {
        sub.textContent = '';
      }
    });
    box.classList.toggle('hidden', shown === 0);
  }

  /* ------------------------------------------------------------- układ */

  _layEl(key) {
    return this.shadowRoot.querySelector(`[data-lay="${key}"]`);
  }

  /* włączenie trybu przeciągania samo w sobie oznacza pozycjonowanie swobodne */
  _layoutActive() {
    if (!this._cfg || this._narrow) return false;
    return this._cfg.layout.mode === 'free' || this._editLayout;
  }

  _layoutEditing() {
    return this._layoutActive() && !!this._editLayout;
  }

  /* ---- zapis lokalny: karta poza edytorem HA nie może pisać do konfiguracji ---- */

  _storeKey() {
    if (this._cfg.layout.id) return 'efc-layout:' + this._cfg.layout.id;
    if (!this._hash) {
      /* w odcisku jest też blok `layout` z konfiguracji — zmiana pozycji w YAML-u
         unieważnia stary zapis lokalny, zamiast być przez niego nadpisywana */
      const src = JSON.stringify({
        t: this._cfg.title,
        s: this._cfg.solar && this._cfg.solar.strings.map((x) => x.power),
        g: this._cfg.grid && this._cfg.grid.power,
        b: this._cfg.battery && this._cfg.battery.power,
        r: this._cfg.groups.map((x) => x.id),
        l: this._rawLayoutMode,
        n: this._rawLayoutNodes
      });
      let h = 0;
      for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) | 0;
      this._hash = (h >>> 0).toString(36);
    }
    return 'efc-layout:' + this._hash;
  }

  _loadStoredLayout() {
    try {
      const raw = window.localStorage.getItem(this._storeKey());
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s || !s.nodes) return;
      this._cfg.layout.mode = 'free';
      this._cfg.layout.nodes = Object.assign({}, this._cfg.layout.nodes, s.nodes);
      if (s.height) this._cfg.layout.height = s.height;
      if (s.rail_width) this._cfg.layout.rail_width = s.rail_width;
    } catch (e) {
      /* prywatny tryb przeglądarki albo zablokowany storage — działamy na konfiguracji */
    }
  }

  _saveStoredLayout() {
    const L = this._cfg.layout;
    try {
      window.localStorage.setItem(
        this._storeKey(),
        JSON.stringify({
          nodes: this._layoutPositions(),
          height: L.height || (this._derived && this._derived.height) || 700,
          rail_width: L.rail_width
        })
      );
    } catch (e) {
      /* brak dostępu do storage — układ zostaje tylko na czas tej sesji */
    }
  }

  _clearStoredLayout() {
    try {
      window.localStorage.removeItem(this._storeKey());
    } catch (e) {
      /* nic do posprzątania */
    }
  }

  _layoutYaml() {
    const L = this._cfg.layout;
    const pos = this._layoutPositions();
    const lines = [
      'layout:',
      '  mode: free',
      '  height: ' + (L.height || (this._derived && this._derived.height) || 700),
      '  rail_width: ' + L.rail_width,
      '  nodes:'
    ];
    LAY_KEYS.forEach((k) => {
      lines.push('    ' + k + ': { x: ' + pos[k].x + ', y: ' + pos[k].y + ' }');
    });
    return lines.join('\n');
  }

  _toast(text) {
    const t = this.shadowRoot.getElementById('lay-toast');
    if (!t) return;
    t.textContent = text;
    t.classList.remove('hidden');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.add('hidden'), 2600);
  }

  _bindLayoutButtons() {
    const root = this.shadowRoot;
    const toggle = root.getElementById('lay-toggle');
    const copy = root.getElementById('lay-copy');
    const reset = root.getElementById('lay-reset');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      this._editLayout = !this._editLayout;
      if (this._editLayout) this._toast(this._tx('layout_hint'));
      this._applyLayout();
      this._measure();
    });

    copy.addEventListener('click', () => {
      const yaml = this._layoutYaml();
      const done = () => this._toast(this._tx('layout_copied'));
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(yaml).then(done, () => {
          console.info('[energy-flow-card] Układ karty:\n' + yaml);
          this._toast(this._tx('layout_clipboard_fail'));
        });
      } else {
        console.info('[energy-flow-card] Układ karty:\n' + yaml);
        this._toast(this._tx('layout_clipboard_fail'));
      }
    });

    reset.addEventListener('click', () => {
      this._clearStoredLayout();
      this._cfg.layout.nodes = Object.assign({}, this._rawLayoutNodes || {});
      this._cfg.layout.mode = this._rawLayoutMode || 'auto';
      this._derived = null;
      this._applyLayout();
      this._measure();
      this._toast(this._tx('layout_restored'));
    });
  }

  /* pozycje z układu automatycznego → procenty, żeby przejście w tryb swobodny nic nie przesunęło */
  _deriveLayout() {
    const card = this._q.card.getBoundingClientRect();
    if (!card.width || !card.height) return null;
    const out = {};
    LAY_KEYS.forEach((k) => {
      const el = this._layEl(k);
      if (!el || el.classList.contains('hidden')) return;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) return;
      /* pomiar w trakcie przebudowy układu potrafi wyjść poza kartę — przycinamy */
      const pin = (v) => +Math.max(2, Math.min(98, v)).toFixed(2);
      out[k] = {
        x: pin(((b.left - card.left + b.width / 2) / card.width) * 100),
        y: pin(((b.top - card.top + b.height / 2) / card.height) * 100)
      };
    });
    return Object.keys(out).length ? { nodes: out, height: Math.round(card.height) } : null;
  }

  _layoutPositions() {
    const stored = this._cfg.layout.nodes || {};
    const derived = (this._derived && this._derived.nodes) || {};
    const out = {};
    LAY_KEYS.forEach((k) => {
      out[k] = stored[k] || derived[k] || LAY_FALLBACK[k];
    });
    return out;
  }

  _applyLayout() {
    if (!this._built || !this._q) return;
    const grid = this._q.grid;
    const active = this._layoutActive();
    const editing = this._layoutEditing();
    const root = this.shadowRoot;
    const toggle = root.getElementById('lay-toggle');
    const bar = root.getElementById('lay-bar');

    if (toggle) {
      toggle.classList.toggle('on', editing);
      toggle.textContent = this._tx(editing ? 'layout_done' : 'layout');
      root.getElementById('lay-copy').classList.toggle('hidden', !editing);
      root.getElementById('lay-reset').classList.toggle('hidden', !editing);
    }
    /* w trybie pionowym układ swobodny nie działa, więc przycisk tylko myliłby */
    if (bar && this._cfg.layout_button !== false) bar.classList.toggle('hidden', this._narrow);

    if (!active) {
      grid.classList.remove('free', 'editing');
      grid.style.removeProperty('--freeh');
      grid.style.removeProperty('--railw');
      LAY_KEYS.forEach((k) => {
        const el = this._layEl(k);
        if (el) {
          el.style.removeProperty('left');
          el.style.removeProperty('top');
        }
      });
      return;
    }

    /* zanim przełączymy na pozycjonowanie bezwzględne, zapamiętaj układ automatyczny */
    if (!this._derived && !grid.classList.contains('free')) this._derived = this._deriveLayout();

    const L = this._cfg.layout;
    const height = L.height || (this._derived && this._derived.height) || 700;
    grid.classList.add('free');
    grid.classList.toggle('editing', editing);
    grid.style.setProperty('--freeh', height + 'px');
    grid.style.setProperty('--railw', L.rail_width + '%');

    const pos = this._layoutPositions();
    LAY_KEYS.forEach((k) => {
      const el = this._layEl(k);
      if (!el) return;
      el.style.left = pos[k].x + '%';
      el.style.top = pos[k].y + '%';
    });
  }

  _bindDrag() {
    LAY_KEYS.forEach((key) => {
      const el = this._layEl(key);
      if (!el) return;

      el.addEventListener('pointerdown', (ev) => {
        if (!this._layoutEditing() || ev.button !== 0) return;
        const card = this._q.card.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        /* uchwyt liczony od środka bloku, bo transform to translate(-50%,-50%) */
        const grabX = ev.clientX - (box.left + box.width / 2);
        const grabY = ev.clientY - (box.top + box.height / 2);
        const halfX = (box.width / 2 / card.width) * 100;
        const halfY = (box.height / 2 / card.height) * 100;

        this._drag = { key, el, card, grabX, grabY, halfX, halfY, moved: false };
        el.classList.add('dragging');
        el.setPointerCapture(ev.pointerId);
        ev.preventDefault();
        ev.stopPropagation();
      });

      el.addEventListener('pointermove', (ev) => {
        const d = this._drag;
        if (!d || d.el !== el) return;
        const x = ((ev.clientX - d.grabX - d.card.left) / d.card.width) * 100;
        const y = ((ev.clientY - d.grabY - d.card.top) / d.card.height) * 100;
        const clamp = (v, half) => Math.max(half, Math.min(100 - half, v));
        const nx = +clamp(x, d.halfX).toFixed(2);
        const ny = +clamp(y, d.halfY).toFixed(2);
        d.moved = true;
        this._cfg.layout.nodes[d.key] = { x: nx, y: ny };
        el.style.left = nx + '%';
        el.style.top = ny + '%';
        if (!this._dragRaf) {
          this._dragRaf = requestAnimationFrame(() => {
            this._dragRaf = null;
            this._measure();
          });
        }
      });

      const end = (ev) => {
        const d = this._drag;
        if (!d || d.el !== el) return;
        el.classList.remove('dragging');
        try {
          el.releasePointerCapture(ev.pointerId);
        } catch (e) {
          /* wskaźnik mógł już zostać zwolniony */
        }
        this._drag = null;
        if (d.moved) {
          this._suppressClick = true;
          setTimeout(() => {
            this._suppressClick = false;
          }, 0);
          this._saveStoredLayout();
          this._emitLayout();
          this._measure();
        }
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    });
  }

  /* edytor karty nasłuchuje tego zdarzenia i zapisuje pozycje do konfiguracji */
  _emitLayout() {
    const L = this._cfg.layout;
    window.dispatchEvent(
      new CustomEvent('energy-flow-card-layout', {
        detail: {
          nodes: Object.assign({}, this._layoutPositions(), L.nodes),
          height: L.height || (this._derived && this._derived.height) || 700,
          rail_width: L.rail_width
        }
      })
    );
  }

  /* ------------------------------------------------------------ ścieżki */

  _rect(id) {
    const el = this._els[id];
    const host = this._q && this._q.card;
    if (!el || !host || el.offsetParent === null) return null;
    const a = el.getBoundingClientRect();
    const b = host.getBoundingClientRect();
    if (!a.width || !a.height) return null;
    return {
      x: a.left - b.left,
      y: a.top - b.top,
      w: a.width,
      h: a.height,
      cx: a.left - b.left + a.width / 2,
      cy: a.top - b.top + a.height / 2
    };
  }

  _path(a, b) {
    const dx = b.cx - a.cx;
    const dy = b.cy - a.cy;
    if (Math.abs(dx) > Math.abs(dy) * 1.05) {
      const x1 = dx > 0 ? a.x + a.w : a.x;
      const x2 = dx > 0 ? b.x : b.x + b.w;
      const o = Math.max(24, Math.abs(x2 - x1) * 0.45) * (dx > 0 ? 1 : -1);
      return `M ${x1} ${a.cy} C ${x1 + o} ${a.cy}, ${x2 - o} ${b.cy}, ${x2} ${b.cy}`;
    }
    const y1 = dy > 0 ? a.y + a.h : a.y;
    const y2 = dy > 0 ? b.y : b.y + b.h;
    const o = Math.max(20, Math.abs(y2 - y1) * 0.5) * (dy > 0 ? 1 : -1);
    return `M ${a.cx} ${y1} C ${a.cx} ${y1 + o}, ${b.cx} ${y2 - o}, ${b.cx} ${y2}`;
  }

  _linkDefs() {
    const m = this._m;
    const out = [];
    if (!m) return out;

    if (m.solar) {
      if (!this._narrow) {
        m.strings.forEach((s) =>
          out.push({ a: 's_' + s.key, b: 'solar-sum', p: s.off ? 0 : s.power, c: 'solar', dead: s.off })
        );
      }
      out.push({ a: 'solar-sum', b: 'hub', p: m.solar.power, c: 'solar' });
    }
    if (m.grid) {
      const p = m.grid.off ? 0 : m.grid.power;
      if (p >= 0) out.push({ a: 'grid', b: 'hub', p, c: 'grid', dead: m.grid.off });
      else out.push({ a: 'hub', b: 'grid', p: -p, c: 'solar' });
    }
    if (m.battery) {
      const p = m.battery.off ? 0 : m.battery.power;
      if (p >= 0) out.push({ a: 'hub', b: 'batt', p, c: 'batt', dead: m.battery.off });
      else out.push({ a: 'batt', b: 'hub', p: -p, c: 'batt' });
    }
    m.groups.forEach((g) => out.push({ a: 'hub', b: 'grp-' + g.id, p: g.power, c: 'cons', dead: g.off }));
    return out;
  }

  _measure() {
    if (!this._built || !this._q || !this._q.card || !this._m) return;
    const width = this._q.card.getBoundingClientRect().width;
    if (!width) return;

    const narrow = width < 720;
    if (narrow !== this._narrow) {
      this._narrow = narrow;
      this._q.grid.classList.toggle('narrow', narrow);
      if (this._cfg.solar) {
        this._q.strings.classList.toggle('hidden', narrow);
        this._q.stringlist.classList.toggle('hidden', !narrow);
      }
      const total = this._m ? this._m.groups.reduce((t, g) => t + g.leafCount, 0) : 0;
      this._q.groups.style.setProperty('--colmin', (narrow ? 150 : total > 18 ? 190 : 215) + 'px');
      /* tryb pionowy zawsze wygrywa z układem swobodnym */
      this._applyLayout();
      requestAnimationFrame(() => this._measure());
      return;
    }

    const links = [];
    this._linkDefs().forEach((L, i) => {
      const a = this._rect(L.a);
      const b = this._rect(L.b);
      if (!a || !b) return;
      const p = Math.max(0, L.p || 0);
      const idle = L.dead || p < this._cfg.idle_threshold;
      links.push({
        id: i,
        d: this._path(a, b),
        color: 'var(--' + L.c + ')',
        idle,
        baseW: idle ? 1 : Math.min(5.5, 1.2 + Math.sqrt(p) / 20),
        w: Math.min(5.5, 1.2 + Math.sqrt(p) / 20),
        dur: Math.max(0.55, Math.min(5, 2400 / (p + 160))).toFixed(2) + 's'
      });
    });

    const sig = JSON.stringify(links) + '|' + Math.round(width);
    if (sig === this._sig) return;
    this._sig = sig;

    this._q.lyrIdle.innerHTML = links
      .map(
        (l) =>
          `<path d="${l.d}" fill="none" stroke="${l.color}" stroke-width="${l.baseW}" stroke-linecap="round" opacity="${
            l.idle ? 0.28 : 0.22
          }" stroke-dasharray="${l.idle ? '3 6' : 'none'}"></path>`
      )
      .join('');

    this._q.lyrAct.innerHTML = this._cfg.animate
      ? links
          .filter((l) => !l.idle)
          .map(
            (l) =>
              `<path d="${l.d}" fill="none" stroke-width="${l.w}" stroke-linecap="round" stroke-dasharray="7 13" style="color:${l.color};stroke:${l.color};animation:dcflow ${l.dur} linear infinite;filter:drop-shadow(0 0 5px currentColor)"></path>`
          )
          .join('')
      : '';
  }

  /* ---------------------------------------------------------- tooltip */

  _showTip(nodeId, ev) {
    const n = this._nodes && this._nodes[nodeId];
    if (!n) return;
    const t = this._q.tip;
    this._q.tipLbl.textContent = n.label;
    this._q.tipP.textContent = n.off ? this._tx('unavailable') : fmtW(n.power);
    this._q.tipE.textContent = n.off ? '—' : fmtKwh(n.energy);
    this._q.tipId.textContent = n.entityId;
    t.style.display = 'block';
    t.style.left = Math.min(ev.clientX + 16, window.innerWidth - 250) + 'px';
    t.style.top = Math.max(10, ev.clientY - 92) + 'px';
  }

  _hideTip() {
    if (this._q && this._q.tip) this._q.tip.style.display = 'none';
  }

  /* ------------------------------------------------------------- modal */

  _openModal(node, nodeKey) {
    this._modalNodeKey = nodeKey;
    if (!this._cfg.history) {
      if (node.powerEntities.length === 1) this._moreInfo(node.powerEntities[0]);
      return;
    }
    this._hideTip();
    this._closeModal();
    this._modal = {
      node,
      range: 'today',
      sel: [],
      month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      loading: true,
      chart: null,
      error: null
    };
    const host = document.createElement('div');
    host.className = 'overlay';
    this.shadowRoot.querySelector('.wrap').appendChild(host);
    this._modalHost = host;
    host.addEventListener('click', (e) => {
      if (e.target === host) this._closeModal();
    });
    this._renderModal();
    this._loadHistory();
  }

  _closeModal() {
    if (this._modalHost && this._modalHost.parentNode) this._modalHost.parentNode.removeChild(this._modalHost);
    this._modalHost = null;
    this._modal = null;
  }

  _moreInfo(entityId) {
    const ev = new Event('hass-more-info', { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  _syncModalHeader() {
    if (!this._modal || !this._modalHost) return;
    const n = this._modal.node;
    const live = this._nodes && this._nodes[this._modalNodeKey];
    const src = live || n;
    const p = this._modalHost.querySelector('.m-val .p');
    const k = this._modalHost.querySelector('.m-val .k');
    if (p) p.textContent = src.off ? this._tx('unavailable') : fmtW(src.power);
    if (k) k.textContent = (src.off ? '—' : fmtKwh(src.energy)) + ' ' + this._tx('today_suffix');
  }

  _rangeBounds() {
    const m = this._modal;
    const now = new Date();
    const today = startOfDay(now);
    switch (m.range) {
      case 'today':
        return { start: today, end: now, single: true, days: 1 };
      case 'yesterday':
        return { start: addDays(today, -1), end: today, single: true, days: 1 };
      case '7d':
        return { start: addDays(today, -6), end: now, single: false, days: 7 };
      case '30d':
        return { start: addDays(today, -29), end: now, single: false, days: 30 };
      case 'custom': {
        if (m.sel.length < 2) return null;
        const a = new Date(Math.min.apply(null, m.sel));
        const b = addDays(new Date(Math.max.apply(null, m.sel)), 1);
        const days = Math.max(1, Math.round((b - a) / 86400000));
        return { start: a, end: b, single: days === 1, days };
      }
      default:
        return { start: today, end: now, single: true, days: 1 };
    }
  }

  async _loadHistory() {
    const m = this._modal;
    if (!m) return;
    const b = this._rangeBounds();
    if (!b) {
      m.loading = false;
      m.chart = null;
      this._renderModal();
      return;
    }
    m.loading = true;
    m.error = null;
    this._renderModal();

    const token = {};
    this._loadToken = token;

    try {
      const n = b.single ? 96 : Math.min(360, b.days * 12);
      const power = await this._powerSeries(m.node.powerEntities, b.start, b.end, n);
      const bars = await this._energyBars(m.node.energyEntities, b.start, b.end, b.single);
      if (this._loadToken !== token || !this._modal) return;
      m.chart = this._buildChart(power, bars, b, m.node.accent);
    } catch (err) {
      if (this._loadToken !== token || !this._modal) return;
      m.chart = null;
      m.error = (err && err.message) || String(err);
    }
    m.loading = false;
    this._renderModal();
  }

  async _powerSeries(ids, start, end, n) {
    const list = Array.from(new Set((ids || []).filter(Boolean)));
    if (!list.length) return null;
    const res = await this._hass.callWS({
      type: 'history/history_during_period',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      entity_ids: list,
      minimal_response: true,
      no_attributes: true
    });
    if (!res) return null;

    const t0 = start.getTime();
    const t1 = end.getTime();
    const step = (t1 - t0) / (n - 1);
    const total = new Array(n).fill(0);
    let any = false;

    list.forEach((id) => {
      const raw = res[id];
      if (!raw || !raw.length) return;
      const st = this._hass.states[id];
      const factor = POWER_FACTOR[st && st.attributes.unit_of_measurement] || 1;
      const pts = raw
        .map((s) => {
          const ts = s.lu ? s.lu * 1000 : new Date(s.last_updated || s.last_changed).getTime();
          const v = parseFloat(s.s !== undefined ? s.s : s.state);
          return { t: ts, v: Number.isNaN(v) ? null : v * factor };
        })
        .filter((p) => p.v !== null)
        .sort((a, b) => a.t - b.t);
      if (!pts.length) return;
      any = true;
      let k = 0;
      let cur = pts[0].v;
      for (let i = 0; i < n; i++) {
        const t = t0 + i * step;
        while (k < pts.length && pts[k].t <= t) {
          cur = pts[k].v;
          k++;
        }
        total[i] += cur;
      }
    });

    return any ? { values: total, t0, step } : null;
  }

  async _energyBars(ids, start, end, single) {
    const list = Array.from(new Set((ids || []).filter(Boolean)));
    if (!list.length) return null;
    let res;
    try {
      res = await this._hass.callWS({
        type: 'recorder/statistics_during_period',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        statistic_ids: list,
        period: single ? 'hour' : 'day',
        units: { energy: 'kWh' },
        types: ['change']
      });
    } catch (e) {
      return null;
    }
    if (!res) return null;

    const buckets = new Map();
    Object.keys(res).forEach((id) => {
      (res[id] || []).forEach((row) => {
        const ts = typeof row.start === 'number' ? row.start : new Date(row.start).getTime();
        const v = row.change !== undefined && row.change !== null ? row.change : 0;
        buckets.set(ts, (buckets.get(ts) || 0) + v);
      });
    });
    if (!buckets.size) return null;

    const keys = Array.from(buckets.keys()).sort((a, b) => a - b);
    return keys.map((t) => ({ t, v: buckets.get(t) }));
  }

  _buildChart(power, bars, bounds, accent) {
    const color = 'var(--' + accent + ')';
    let line = null;
    let area = null;
    let hlines = [];
    let peak = '—';
    let avg = '—';
    let xlabels = [];
    let pts = null;
    let max = 1;
    let t0 = 0;
    let step = 0;

    if (power && power.values.length) {
      pts = power.values;
      t0 = power.t0;
      step = power.step;
      const n = pts.length;
      max = Math.max.apply(null, pts) * 1.12 || 1;
      const X = (i) => (i / (n - 1)) * 760;
      const Y = (v) => 200 - (v / max) * 186;
      line = 'M ' + X(0).toFixed(1) + ' ' + Y(pts[0]).toFixed(1);
      for (let i = 1; i < n; i++) line += ' L ' + X(i).toFixed(1) + ' ' + Y(pts[i]).toFixed(1);
      area = line + ' L 760 200 L 0 200 Z';
      hlines = [0, 0.5, 1].map((f) => ({
        y: (200 - f * 186).toFixed(1),
        top: Math.max(0, 200 - f * 186 - 13),
        label: fmtW(max * f)
      }));
      peak = fmtW(Math.max.apply(null, pts));
      avg = fmtW(pts.reduce((a, b) => a + b, 0) / n);
      xlabels = bounds.single
        ? ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00']
        : [this._fmtDay(bounds.start), '', this._fmtDay(bounds.start.getTime() + (bounds.end - bounds.start) / 2), '', this._fmtDay(bounds.end - 1)];
    }

    let barRects = [];
    let barLabels = [];
    let barCaption = '';
    let barsData = bars;

    if (!barsData && power) {
      /* fallback: całkowanie mocy w koszykach */
      const nb = bounds.single ? 24 : bounds.days;
      const acc = new Array(nb).fill(0);
      const spanMs = bounds.end - bounds.start;
      const bucketMs = spanMs / nb;
      power.values.forEach((v, i) => {
        const t = power.t0 + i * power.step;
        const b = Math.min(nb - 1, Math.max(0, Math.floor((t - bounds.start.getTime()) / bucketMs)));
        acc[b] += (v * power.step) / 3600000 / 1000;
      });
      barsData = acc.map((v, i) => ({ t: bounds.start.getTime() + i * bucketMs, v }));
    }

    if (barsData && barsData.length) {
      const vals = barsData.map((b) => Math.max(0, b.v || 0));
      const bmax = Math.max.apply(null, vals) || 1;
      const bw = 760 / vals.length;
      barRects = vals.map((v, i) => {
        const h = Math.max(1, (v / bmax) * 92);
        return {
          x: (i * bw + bw * 0.16).toFixed(1),
          w: (bw * 0.68).toFixed(1),
          h: h.toFixed(1),
          y: (100 - h).toFixed(1)
        };
      });
      barLabels = barsData.map((b, i) => {
        const d = new Date(b.t);
        if (bounds.single) return i % 3 === 0 ? d.getHours() + ':00' : '';
        if (vals.length > 14) return i % 4 === 0 ? d.getDate() + '.' + (d.getMonth() + 1) : '';
        return d.getDate() + '.' + (d.getMonth() + 1);
      });
      barCaption =
        (bounds.single ? this._tx('hourly') : this._tx('daily')) + ' · ' +
        fmtKwh(vals.reduce((a, b) => a + b, 0)) +
        ' ' + this._tx('total');
    }

    if (!line && !barRects.length) return null;
    return {
      color,
      line,
      area,
      hlines,
      xlabels,
      peak,
      avg,
      bars: barRects,
      barLabels,
      barCaption,
      /* dane pod celownik podążający za kursorem */
      pts,
      max,
      t0,
      step,
      single: bounds.single,
      barPoints: barsData || []
    };
  }

  /* celownik podążający za kursorem: pionowa linia, punkt na serii i wartość w danym momencie */
  _bindCrosshair(host, ch) {
    const stamp = (t) => {
      const d = new Date(t);
      const hhmm =
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      return ch.single ? hhmm : d.getDate() + '.' + (d.getMonth() + 1) + ' · ' + hhmm;
    };

    const attach = (wrap, count, valueAt, labelAt, yAt) => {
      if (!wrap || !count) return;
      const line = wrap.querySelector('.cross-line');
      const dot = wrap.querySelector('.cross-dot');
      const tip = wrap.querySelector('.cross-tip');
      const tipT = tip.querySelector('.t');
      const tipV = tip.querySelector('.v');

      const move = (ev) => {
        const r = wrap.getBoundingClientRect();
        if (!r.width) return;
        const f = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
        const i = Math.min(count - 1, Math.max(0, Math.round(f * (count - 1))));
        const x = count > 1 ? (i / (count - 1)) * r.width : r.width / 2;

        line.style.display = 'block';
        line.style.left = x.toFixed(1) + 'px';

        if (dot) {
          const y = yAt(i);
          dot.style.display = 'block';
          dot.style.left = x.toFixed(1) + 'px';
          dot.style.top = y.toFixed(1) + 'px';
        }

        tipT.textContent = labelAt(i);
        tipV.textContent = valueAt(i);
        tip.style.display = 'block';
        const tw = tip.offsetWidth || 120;
        tip.style.left = Math.min(Math.max(0, x + 12), Math.max(0, r.width - tw)) + 'px';
        tip.style.top = (dot ? Math.max(0, yAt(i) - 52) : 6) + 'px';
      };

      const hide = () => {
        line.style.display = 'none';
        if (dot) dot.style.display = 'none';
        tip.style.display = 'none';
      };

      wrap.addEventListener('mousemove', move);
      wrap.addEventListener('mouseleave', hide);
    };

    /* wykres mocy */
    if (ch.pts && ch.pts.length) {
      attach(
        host.querySelector('.chart-wrap'),
        ch.pts.length,
        (i) => fmtW(ch.pts[i]),
        (i) => stamp(ch.t0 + i * ch.step),
        (i) => 200 - (ch.pts[i] / ch.max) * 186
      );
    }

    /* słupki energii */
    if (ch.barPoints && ch.barPoints.length) {
      attach(
        host.querySelector('.bars-wrap'),
        ch.barPoints.length,
        (i) => fmtKwh(Math.max(0, ch.barPoints[i].v || 0)),
        (i) => stamp(ch.barPoints[i].t),
        null
      );
    }
  }

  _renderModal() {
    const t = (k, v) => this._tx(k, v);
    LOCALE = this._dict().locale;
    const m = this._modal;
    if (!m || !this._modalHost) return;
    const n = m.node;
    const accent = 'var(--' + n.accent + ')';
    const b = this._rangeBounds();

    const chip = (key, label) =>
      `<div class="chip ${m.range === key ? 'on' : ''}" data-range="${key}" style="${
        m.range === key ? 'background:' + accent : ''
      }">${label}</div>`;

    const caption =
      m.range === 'custom'
        ? m.sel.length === 2
          ? this._fmtDay(Math.min.apply(null, m.sel)) + ' → ' + this._fmtDay(Math.max.apply(null, m.sel))
          : t('pick_range')
        : b
        ? this._fmtDay(b.start) + ' → ' + (m.range === 'yesterday' ? this._fmtDay(b.end - 1) : t('now'))
        : '';

    let body;
    if (m.loading) {
      body = `<div class="state-box">
        <div class="spinner"></div>
        <div class="state-cap">${t('loading')}</div>
        <div class="skeleton">${Array.from({ length: 16 })
          .map(
            (_, i) =>
              `<i style="height:${25 + ((i * 37) % 70)}%;animation:dcpulse 1.4s ease-in-out ${(i * 0.06).toFixed(
                2
              )}s infinite"></i>`
          )
          .join('')}</div>
      </div>`;
    } else if (m.error) {
      body = `<div class="state-box">
        <div class="state-t">${t('load_failed')}</div>
        <div class="state-s">${esc(m.error)}</div>
      </div>`;
    } else if (!m.chart) {
      body = `<div class="state-box">
        <svg width="34" height="34" viewBox="0 0 24 24" style="color:var(--mut);opacity:.6"><g fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="15" rx="2"></rect><path d="M3 10h18M8 5V3M16 5V3M8.5 15.5l7-4"></path></g></svg>
        <div class="state-t">${t('no_history')}</div>
        <div class="state-s">${
          m.range === 'custom' && m.sel.length < 2
            ? t('no_history_pick')
            : n.off
            ? t('no_history_off')
            : t('no_history_empty')
        }</div>
      </div>`;
    } else {
      const ch = m.chart;
      body = `
        ${
          ch.line
            ? `<div class="sec-head">
                 <div class="sec-t">${t('chart_power')}</div>
                 <div class="mono sec-m">${t('peak')} ${ch.peak} · ${t('average')} ${ch.avg}</div>
               </div>
               <div class="chart-wrap">
                 <svg viewBox="0 0 760 200" preserveAspectRatio="none" style="width:100%;height:200px;display:block;overflow:visible">
                   <defs>
                     <linearGradient id="efcArea" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stop-color="${ch.color}" stop-opacity="0.34"></stop>
                       <stop offset="100%" stop-color="${ch.color}" stop-opacity="0.02"></stop>
                     </linearGradient>
                   </defs>
                   ${ch.hlines
                     .map((h) => `<line x1="0" y1="${h.y}" x2="760" y2="${h.y}" stroke="var(--line)" stroke-width="1"></line>`)
                     .join('')}
                   <path d="${ch.area}" fill="url(#efcArea)"></path>
                   <path d="${ch.line}" fill="none" stroke="${ch.color}" stroke-width="1.8" stroke-linejoin="round"></path>
                 </svg>
                 ${ch.hlines.map((h) => `<div class="mono hlabel" style="top:${h.top}px">${h.label}</div>`).join('')}
                 <div class="cross-line"></div>
                 <div class="cross-dot" style="background:${ch.color}"></div>
                 <div class="cross-tip"><div class="mono t"></div><div class="mono v" style="color:${ch.color}"></div></div>
               </div>
               <div class="xlabels">${ch.xlabels.map((x) => `<div class="mono">${esc(x)}</div>`).join('')}</div>`
            : ''
        }
        ${
          ch.bars.length
            ? `<div class="sec-head" style="margin:22px 0 8px">
                 <div class="sec-t">${t('chart_energy')}</div>
                 <div class="mono sec-m">${esc(ch.barCaption)}</div>
               </div>
               <div class="bars-wrap">
                 <svg viewBox="0 0 760 110" preserveAspectRatio="none" style="width:100%;height:110px;display:block">
                   <line x1="0" y1="100" x2="760" y2="100" stroke="var(--line)" stroke-width="1"></line>
                   ${ch.bars
                     .map(
                       (r) =>
                         `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="2" fill="${ch.color}" opacity="0.72"></rect>`
                     )
                     .join('')}
                 </svg>
                 <div class="cross-line"></div>
                 <div class="cross-tip"><div class="mono t"></div><div class="mono v" style="color:${ch.color}"></div></div>
               </div>
               <div class="blabels">${ch.barLabels.map((l) => `<div class="mono">${esc(l)}</div>`).join('')}</div>`
            : ''
        }`;
    }

    const cal = [];
    if (m.range === 'custom') {
      const first = new Date(m.month.getFullYear(), m.month.getMonth(), 1);
      const pad = (first.getDay() + 6) % 7;
      const dim = new Date(m.month.getFullYear(), m.month.getMonth() + 1, 0).getDate();
      for (let i = 0; i < pad; i++) cal.push('<div class="pk-day blank"></div>');
      for (let d = 1; d <= dim; d++) {
        const ts = new Date(m.month.getFullYear(), m.month.getMonth(), d).getTime();
        const sel = m.sel.indexOf(ts) >= 0;
        const inR =
          m.sel.length === 2 && ts > Math.min.apply(null, m.sel) && ts < Math.max.apply(null, m.sel);
        cal.push(
          `<div class="mono pk-day ${sel ? 'sel' : ''} ${inR ? 'inr' : ''}" data-day="${ts}" style="${
            sel ? 'background:' + accent : ''
          }">${d}</div>`
        );
      }
    }

    this._modalHost.innerHTML = `
<div class="modal">
  <div class="m-head">
    <div class="m-icon" style="border:1px solid color-mix(in oklab,${accent} 45%,transparent);background:color-mix(in oklab,${accent} 12%,transparent)">
      <svg width="22" height="22" viewBox="0 0 24 24" style="color:${accent}"><use href="${iconHref(n.icon)}"></use></svg>
    </div>
    <div class="m-title">
      <div class="t">${esc(n.label)}</div>
      <div class="mono e">${esc(n.entityId)}</div>
    </div>
    <div class="m-val">
      <div class="mono p" style="color:${accent}">${n.off ? t('unavailable') : fmtW(n.power)}</div>
      <div class="mono k">${(n.off ? '—' : fmtKwh(n.energy)) + ' ' + t('today_suffix')}</div>
    </div>
    <div class="m-close" id="m-close">✕</div>
  </div>

  <div class="m-bar">
    <div class="chips">
      ${chip('today', t('range_today'))}${chip('yesterday', t('range_yesterday'))}${chip('7d', t('range_7d'))}${chip('30d', t('range_30d'))}${chip('custom', t('range_custom'))}
    </div>
    <div style="flex:1"></div>
    <div class="mono m-cap">${esc(caption)}</div>
  </div>

  ${
    m.range === 'custom'
      ? `<div class="picker">
    <div class="pk-head">
      <div class="pk-nav" id="pk-prev">‹</div>
      <div class="pk-month">${esc(this._dict().months[m.month.getMonth()] + ' ' + m.month.getFullYear())}</div>
      <div class="pk-nav" id="pk-next">›</div>
      <div style="flex:1"></div>
      <div class="mono m-cap">${
        m.sel.length === 2 ? t('range_set') : m.sel.length ? t('pick_end') : t('pick_start')
      }</div>
    </div>
    <div class="pk-grid">
      ${this._dict().dow.map((d) => `<div class="pk-dow">${d}</div>`).join('')}
      ${cal.join('')}
    </div>
  </div>`
      : ''
  }

  <div class="m-body">${body}</div>
</div>`;

    const h = this._modalHost;
    h.querySelector('#m-close').addEventListener('click', () => this._closeModal());
    h.querySelectorAll('[data-range]').forEach((el) =>
      el.addEventListener('click', () => {
        m.range = el.dataset.range;
        if (m.range !== 'custom') m.sel = [];
        this._loadHistory();
      })
    );
    const prev = h.querySelector('#pk-prev');
    const next = h.querySelector('#pk-next');
    if (prev)
      prev.addEventListener('click', () => {
        m.month = new Date(m.month.getFullYear(), m.month.getMonth() - 1, 1);
        this._renderModal();
      });
    if (next)
      next.addEventListener('click', () => {
        m.month = new Date(m.month.getFullYear(), m.month.getMonth() + 1, 1);
        this._renderModal();
      });
    if (m.chart) this._bindCrosshair(h, m.chart);

    h.querySelectorAll('[data-day]').forEach((el) =>
      el.addEventListener('click', () => {
        const ts = Number(el.dataset.day);
        m.sel = m.sel.length >= 2 ? [ts] : m.sel.concat(ts).sort((a, b) => a - b);
        if (m.sel.length === 2) this._loadHistory();
        else this._renderModal();
      })
    );
  }
}

customElements.define('energy-flow-card', EnergyFlowCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'energy-flow-card',
  name: 'Energy Flow Card',
  description: 'Schematyczny widok rozpływu energii: fotowoltaika, sieć, akumulator i grupy odbiorników.',
  preview: false,
  documentationURL: 'https://github.com/adek1990/energy-flow-card'
});

/* edytor GUI ładowany leniwie */
import('./energy-flow-card-editor.js').catch((e) =>
  console.warn('[energy-flow-card] Nie udało się załadować edytora GUI:', e)
);

export { EnergyFlowCard, fmtW, fmtKwh, ICON_SYMBOLS };
