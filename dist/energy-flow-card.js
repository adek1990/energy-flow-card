/*!
 * Energy Flow Card — schematyczny widok rozpływu energii dla Home Assistant
 * Port projektu "Energy Flow Card" 1:1 na natywną kartę Lovelace.
 * Licencja: MIT
 */

const EFC_VERSION = '1.0.0';

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

/* fonty projektu — ładowane raz na dokument, wyłączalne przez `fonts: false` */
function ensureFonts() {
  if (document.getElementById('efc-fonts')) return;
  const l = document.createElement('link');
  l.id = 'efc-fonts';
  l.rel = 'stylesheet';
  l.href =
    'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(l);
}

/* ------------------------------------------------------------- formatery */

const nf = (v, d) =>
  Number(v).toLocaleString('pl-PL', { minimumFractionDigits: d, maximumFractionDigits: d });

function fmtW(w) {
  if (w === null || w === undefined || Number.isNaN(w)) return '—';
  const a = Math.abs(w);
  if (a >= 1000000) return nf(w / 1000000, 2) + ' MW';
  if (a >= 1000) return nf(w / 1000, a >= 10000 ? 1 : 2) + ' kW';
  return nf(Math.round(w), 0) + ' W';
}

function fmtKwh(k) {
  if (k === null || k === undefined || Number.isNaN(k)) return '—';
  if (Math.abs(k) >= 1000) return nf(k / 1000, 2) + ' MWh';
  return nf(k, Math.abs(k) < 10 ? 2 : 1) + ' kWh';
}

const POWER_FACTOR = { W: 1, kW: 1000, MW: 1000000, mW: 0.001 };
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

const MONTHS_PL = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
  'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
const DOW_PL = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz'];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const fmtDayPl = (t) =>
  new Date(t).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });

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
  font-family:'IBM Plex Sans',ui-sans-serif,system-ui,-apple-system,sans-serif;
  color:var(--tx);
}
.mono { font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace; }

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
.chart-wrap { position:relative;width:100%;height:200px; }
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
    if (config.fonts !== false) ensureFonts();
    this._expanded = {};
    this._cfg.groups.forEach((g) => {
      if (g.expanded) this._expanded[g.id] = true;
    });
    this._sig = '';
    this._build();
    if (this._hass) this._update();
  }

  _normalize(raw) {
    const c = {
      title: raw.title !== undefined ? raw.title : 'Przepływ energii',
      subtitle: raw.subtitle || '',
      kicker: raw.kicker !== undefined ? raw.kicker : 'Home Assistant · karta niestandardowa',
      header: raw.header !== false && (raw.title !== '' || raw.subtitle),
      legend: raw.legend !== false,
      animate: raw.animate !== false,
      history: raw.history !== false,
      theme_mode: raw.theme_mode || 'auto',
      idle_threshold: Number(raw.idle_threshold) > 0 ? Number(raw.idle_threshold) : 15,
      solar: null,
      grid: null,
      battery: null,
      house: null,
      groups: []
    };

    if (raw.solar && (raw.solar.strings || []).length) {
      c.solar = {
        name: raw.solar.name || 'Fotowoltaika łącznie',
        power: raw.solar.power || null,
        energy: raw.solar.energy || null,
        invert: !!raw.solar.invert,
        strings: (raw.solar.strings || []).map((s, i) => ({
          key: 'str' + i,
          name: s.name || 'String ' + (i + 1),
          icon: s.icon || 'panel',
          power: s.power || null,
          energy: s.energy || null,
          invert: s.invert === undefined ? !!raw.solar.invert : !!s.invert
        }))
      };
    }

    if (raw.grid && (raw.grid.power || raw.grid.power_import || raw.grid.power_export)) {
      c.grid = {
        name: raw.grid.name || 'Sieć',
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
        name: raw.battery.name || 'Akumulator',
        power: raw.battery.power,
        soc: raw.battery.soc || null,
        energy: raw.battery.energy || null,
        invert: !!raw.battery.invert
      };
    }

    c.house = {
      name: (raw.house && raw.house.name) || 'Dom',
      power: (raw.house && raw.house.power) || null,
      energy: (raw.house && raw.house.energy) || null,
      invert: !!(raw.house && raw.house.invert)
    };

    c.groups = (raw.groups || []).map((g, i) => ({
      id: g.id || slug(g.name, i),
      name: g.name || 'Grupa ' + (i + 1),
      icon: g.icon || 'plug',
      expanded: !!g.expanded,
      devices: (g.devices || []).map((d, j) => ({
        key: 'd' + i + '_' + j,
        name: d.name || (typeof d.power === 'string' ? d.power : 'Urządzenie'),
        icon: d.icon || 'plug',
        power: d.power || null,
        energy: d.energy || null,
        invert: d.invert === undefined ? !!g.invert : !!d.invert
      }))
    }));

    return c;
  }

  /* ----------------------------------------------------------- odczyty */

  _state(entityId) {
    if (!entityId || !this._hass) return null;
    return this._hass.states[entityId] || null;
  }

  _read(entityId, factors) {
    const st = this._state(entityId);
    if (!st) return { v: null, off: true };
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
    ids.forEach((id) => {
      const r = this._read(id, factors);
      if (!r.off) {
        sum += r.v;
        any = true;
      }
    });
    return any ? { v: sum * (invert ? -1 : 1), off: false } : { v: null, off: true };
  }

  _power(ref, invert) {
    return this._sum(ref, POWER_FACTOR, invert);
  }

  _energy(ref, invert) {
    return this._sum(ref, ENERGY_FACTOR, invert);
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
    if (!c) return;
    const root = this.shadowRoot;
    const g = c.groups;

    const stringsHtml = c.solar
      ? c.solar.strings
          .map(
            (s) => `
      <div class="string" data-node="s_${s.key}">
        ${nodeSvg(20, s.icon)}
        <div style="min-width:0">
          <div class="lbl">${esc(s.name)}</div>
          <div class="row"><span class="mono chip-solar" data-f="pwr">—</span><span class="mono sub-mono" data-f="kwh">—</span></div>
        </div>
      </div>`
          )
          .join('')
      : '';

    const stringListHtml = c.solar
      ? c.solar.strings
          .map(
            (s) => `
      <div class="sl-item" data-node="sl_${s.key}">
        ${nodeSvg(14, s.icon)}
        <div class="n">${esc(s.name)}</div>
        <div class="mono p" data-f="pwr">—</div>
        <div class="mono e" data-f="kwh">—</div>
      </div>`
          )
          .join('')
      : '';

    const groupsHtml = g
      .map(
        (grp) => `
      <div class="group" data-group="${esc(grp.id)}">
        <div class="grp-head" data-toggle="${esc(grp.id)}">
          ${nodeSvg(19, grp.icon)}
          <div class="grp-txt">
            <div class="grp-lbl">${esc(grp.name)}</div>
            <div class="mono grp-meta" data-f="meta">—</div>
          </div>
          <span class="mono grp-pwr" data-f="pwr">—</span>
          <span class="grp-chev" data-f="chev">▸</span>
        </div>
        <div class="grp-body hidden" data-body="${esc(grp.id)}">
          ${grp.devices
            .map(
              (d) => `
            <div class="dev" data-node="dev_${d.key}">
              ${nodeSvg(14, d.icon)}
              <div class="n">${esc(d.name)}</div>
              <div class="mono p" data-f="pwr">—</div>
              <div class="mono e" data-f="kwh">—</div>
            </div>`
            )
            .join('')}
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

    <div class="grid" id="grid">
      <div class="strings ${c.solar ? '' : 'hidden'}" id="strings">${stringsHtml}</div>

      <div class="sumwrap ${c.solar ? '' : 'hidden'}" id="sumwrap">
        <div class="node-sum" data-node="solar-sum">
          ${nodeSvg(22, 'sun')}
          <div>
            <div class="lbl">${esc(c.solar ? c.solar.name : '')}</div>
            <div class="row">
              <span class="mono big" data-f="pwr">—</span>
              <span class="mono sub-mono" data-f="kwh">—</span>
            </div>
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

      <div class="hubwrap">
        <div class="node-hub" data-node="hub">
          ${nodeSvg(30, 'house')}
          <div class="lbl">${esc(c.house.name)}</div>
          <span class="mono big" data-f="pwr">—</span>
          <div class="mono kwh" data-f="kwh">—</div>
          <div class="mono self" data-f="self">—</div>
        </div>
      </div>

      <div class="gridwrap ${c.grid ? '' : 'hidden'}">
        <div class="node-grid" data-node="grid">
          ${nodeSvg(24, 'tower')}
          <div>
            <div class="lbl" data-f="label">${esc(c.grid ? c.grid.name : '')}</div>
            <div class="row"><span class="mono big" data-f="pwr">—</span></div>
            <div class="mono kwh" data-f="kwh">—</div>
          </div>
        </div>
      </div>

      <div class="battwrap ${c.battery ? '' : 'hidden'}">
        <div class="node-batt" data-node="batt">
          ${nodeSvg(24, 'battery')}
          <div>
            <div class="lbl" data-f="label">${esc(c.battery ? c.battery.name : '')}</div>
            <div class="row">
              <span class="mono big" data-f="pwr">—</span>
              <span class="mono sub-mono" data-f="kwh">—</span>
            </div>
            <div class="soc-track"><div class="soc-fill" data-f="soc"></div></div>
          </div>
        </div>
      </div>

      <div class="consumers">
        <div class="cons-head">
          <div class="cons-title" id="cons-title">Odbiorniki</div>
          <div class="cons-rule"></div>
          <div class="toggle-all" id="toggle-all">Rozwiń wszystko</div>
        </div>
        <div class="groups" id="groups">${groupsHtml}</div>
      </div>
    </div>
  </div>

  ${
    c.legend
      ? `<div class="legend">
    <div class="it"><span class="sw" style="background:var(--solar);box-shadow:0 0 6px var(--solar)"></span><span class="cap">Fotowoltaika</span></div>
    <div class="it"><span class="sw" style="background:var(--grid);box-shadow:0 0 6px var(--grid)"></span><span class="cap">Sieć</span></div>
    <div class="it"><span class="sw" style="background:var(--cons);box-shadow:0 0 6px var(--cons)"></span><span class="cap">Zużycie</span></div>
    <div class="it"><span class="sw" style="background:var(--batt);box-shadow:0 0 6px var(--batt)"></span><span class="cap">Akumulator</span></div>
    <div class="spacer"></div>
    <div class="mono note">grubość linii ∝ moc · prędkość animacji ∝ moc · kropkowana = bezczynna</div>
  </div>`
      : ''
  }

  <div class="tip" id="tip">
    <div class="lbl" id="tip-lbl"></div>
    <div class="vals">
      <div><div class="mono v" id="tip-p"></div><div class="c">teraz</div></div>
      <div><div class="mono v" id="tip-e"></div><div class="c">dzisiaj</div></div>
    </div>
    <div class="mono eid" id="tip-id"></div>
  </div>
</div>`;

    this._built = true;
    this._cacheRefs();
    this._bindEvents();

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

    root.querySelectorAll('[data-node]').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
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
    this._cfg.groups.forEach((g) => {
      const body = root.querySelector(`[data-body="${g.id}"]`);
      const chev = root.querySelector(`[data-toggle="${g.id}"] [data-f="chev"]`);
      const open = !!this._expanded[g.id];
      if (body) body.classList.toggle('hidden', !open);
      if (chev) chev.textContent = open ? '▾' : '▸';
    });
    const anyOpen = this._cfg.groups.some((g) => this._expanded[g.id]);
    this._q.toggleAll.textContent = anyOpen ? 'Zwiń wszystko' : 'Rozwiń wszystko';

    this._q.slBody.classList.toggle('hidden', !this._stringsOpen);
    this._q.slChev.textContent = this._stringsOpen ? '▾' : '▸';
    if (this._cfg.solar) {
      this._q.slMeta.textContent =
        this._cfg.solar.strings.length +
        ' ' +
        this._plural(this._cfg.solar.strings.length, 'string falownika', 'stringi falownika', 'stringów falownika') +
        (this._stringsOpen ? '' : ' · dotknij, aby rozwinąć');
    }
    requestAnimationFrame(() => this._measure());
  }

  _plural(n, one, few, many) {
    if (n === 1) return one;
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }

  /* -------------------------------------------------- obliczenia modelu */

  _model() {
    const c = this._cfg;
    const idle = c.idle_threshold;

    const strings = c.solar
      ? c.solar.strings.map((s) => {
          const p = this._power(s.power, s.invert);
          const e = this._energy(s.energy, s.invert);
          return {
            key: s.key,
            name: s.name,
            icon: s.icon,
            power: p.v,
            energy: e.v,
            off: p.off,
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
      const eDirect = c.solar.energy ? this._energy(c.solar.energy, c.solar.invert) : null;
      const eSum = strings.reduce((t, s) => t + (s.energy || 0), 0);
      solar = {
        name: c.solar.name,
        power: direct && !direct.off ? direct.v : sum,
        energy: eDirect && !eDirect.off ? eDirect.v : eSum,
        powerEntities: c.solar.power
          ? asList(c.solar.power)
          : strings.reduce((a, s) => a.concat(asList(s.powerEntity)), []),
        energyEntities: c.solar.energy
          ? asList(c.solar.energy)
          : strings.reduce((a, s) => a.concat(asList(s.energyEntity)), [])
      };
      solar.idle = Math.abs(solar.power) < idle;
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
        name: c.grid.name,
        power: off ? null : p,
        off,
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
        name: c.battery.name,
        power: r.off ? null : r.v,
        off: r.off,
        idle: !r.off && Math.abs(r.v) < idle,
        energy: e.v,
        soc,
        powerEntities: asList(c.battery.power),
        energyEntities: asList(c.battery.energy)
      };
    }

    const groups = c.groups.map((g) => {
      const devices = g.devices.map((d) => {
        const p = this._power(d.power, d.invert);
        const e = this._energy(d.energy, d.invert);
        /* brak skonfigurowanej encji mocy ≠ encja niedostępna — nie wygaszamy wiersza */
        const noPower = asList(d.power).length === 0;
        return {
          key: d.key,
          name: d.name,
          icon: d.icon,
          power: p.v,
          energy: e.v,
          unset: noPower,
          off: p.off && !noPower,
          idle: !p.off && Math.abs(p.v) < 5,
          powerEntity: d.power,
          energyEntity: d.energy
        };
      });
      const sum = devices.reduce((t, d) => t + (d.off ? 0 : d.power), 0);
      const nrg = devices.reduce((t, d) => t + (d.energy || 0), 0);
      const active = devices.filter((d) => !d.off && Math.abs(d.power) >= 5).length;
      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        devices,
        power: sum,
        energy: nrg,
        active,
        off: devices.length > 0 && devices.every((d) => d.off),
        idle: sum < idle,
        powerEntities: devices.reduce((a, d) => a.concat(asList(d.powerEntity)), []),
        energyEntities: devices.reduce((a, d) => a.concat(asList(d.energyEntity)), [])
      };
    });

    const consSum = groups.reduce((t, g) => t + g.power, 0);
    const consNrg = groups.reduce((t, g) => t + g.energy, 0);
    const hp = c.house.power ? this._power(c.house.power, c.house.invert) : null;
    const he = c.house.energy ? this._energy(c.house.energy, c.house.invert) : null;
    const house = {
      name: c.house.name,
      power: hp && !hp.off ? hp.v : consSum,
      energy: he && !he.off ? he.v : consNrg,
      powerEntities: c.house.power
        ? asList(c.house.power)
        : groups.reduce((a, g) => a.concat(g.powerEntities), []),
      energyEntities: c.house.energy
        ? asList(c.house.energy)
        : groups.reduce((a, g) => a.concat(g.energyEntities), [])
    };

    const gridImport = grid && !grid.off && grid.power > 0 ? grid.power : 0;
    house.selfPct =
      house.power > 0 ? Math.round((100 * Math.max(0, house.power - gridImport)) / house.power) : 100;

    return { strings, solar, grid, battery, groups, house };
  }

  /* ---------------------------------------------------- aktualizacja UI */

  _update() {
    if (!this._cfg || !this._built || !this._hass) return;
    const c = this._cfg;
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
        set(el, 'pwr', s.off ? 'niedostępny' : fmtW(s.power));
        set(el, 'kwh', s.off ? '—' : fmtKwh(s.energy));
        flags(el, s.off, !s.off && s.idle);
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
      flags(el, false, m.solar.idle);
      nodes['solar-sum'] = {
        label: m.solar.name,
        entityId: c.solar.power
          ? entityLabel(c.solar.power)
          : m.solar.powerEntities.length + ' encji · suma stringów',
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
    set(hub, 'self', m.house.selfPct + '% samowystarczalności');
    nodes.hub = {
      label: m.house.name,
      entityId: c.house.power
        ? entityLabel(c.house.power)
        : m.house.powerEntities.length + ' encji · suma odbiorników',
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
      const label = m.grid.off
        ? m.grid.name + ' · niedostępna'
        : m.grid.power >= 0
        ? 'Pobór z sieci'
        : 'Oddanie do sieci';
      set(el, 'label', label);
      set(el, 'pwr', m.grid.off ? 'niedostępny' : fmtW(Math.abs(m.grid.power)));
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
      const label = m.battery.off
        ? m.battery.name + ' · niedostępny'
        : m.battery.power >= 0
        ? 'Ładowanie akumulatora'
        : 'Rozładowanie akumulatora';
      set(el, 'label', label);
      set(el, 'pwr', m.battery.off ? 'niedostępny' : fmtW(Math.abs(m.battery.power)));
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
      totalDevices += g.devices.length;
      const el = this._els['grp-' + g.id];
      if (!el) return;
      set(el, 'pwr', fmtW(g.power));
      set(
        el,
        'meta',
        g.devices.length +
          ' ' +
          this._plural(g.devices.length, 'urządzenie', 'urządzenia', 'urządzeń') +
          ' · ' +
          g.active +
          ' ' +
          this._plural(g.active, 'aktywne', 'aktywne', 'aktywnych') +
          ' · ' +
          fmtKwh(g.energy)
      );
      flags(el, g.off, !g.off && g.idle);
      nodes['grp-' + g.id] = {
        label: g.name + ' · ' + g.devices.length + ' urz.',
        entityId: g.powerEntities.length + ' encji w grupie',
        icon: g.icon,
        accent: 'cons',
        power: g.power,
        energy: g.energy,
        off: g.off,
        powerEntities: g.powerEntities,
        energyEntities: g.energyEntities
      };

      g.devices.forEach((d) => {
        const de = this._els['dev_' + d.key];
        if (!de) return;
        set(de, 'pwr', d.unset ? '—' : d.off ? 'brak' : fmtW(d.power));
        set(de, 'kwh', d.off && !d.unset ? '—' : fmtKwh(d.energy));
        flags(de, d.off, !d.off && d.idle);
        nodes['dev_' + d.key] = {
          label: d.name,
          entityId: entityLabel(d.powerEntity || d.energyEntity),
          icon: d.icon,
          accent: 'cons',
          power: d.power,
          energy: d.energy,
          off: d.off,
          powerEntities: asList(d.powerEntity),
          energyEntities: asList(d.energyEntity)
        };
      });
    });

    this._nodes = nodes;

    this._q.consTitle.textContent =
      'Odbiorniki · ' +
      totalDevices +
      ' ' +
      this._plural(totalDevices, 'urządzenie', 'urządzenia', 'urządzeń') +
      ' w ' +
      m.groups.length +
      ' ' +
      this._plural(m.groups.length, 'grupie', 'grupach', 'grupach');

    const colMin = this._narrow ? 150 : totalDevices > 18 ? 190 : 215;
    this._q.groups.style.setProperty('--colmin', colMin + 'px');

    this._applyExpansion();
    this._measure();
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
      const total = this._cfg.groups.reduce((t, g) => t + g.devices.length, 0);
      this._q.groups.style.setProperty('--colmin', (narrow ? 150 : total > 18 ? 190 : 215) + 'px');
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
    this._q.tipP.textContent = n.off ? 'niedostępny' : fmtW(n.power);
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
    if (p) p.textContent = src.off ? 'niedostępny' : fmtW(src.power);
    if (k) k.textContent = (src.off ? '—' : fmtKwh(src.energy)) + ' dzisiaj';
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

    if (power && power.values.length) {
      const pts = power.values;
      const n = pts.length;
      const max = Math.max.apply(null, pts) * 1.12 || 1;
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
        : [fmtDayPl(bounds.start), '', fmtDayPl(bounds.start.getTime() + (bounds.end - bounds.start) / 2), '', fmtDayPl(bounds.end - 1)];
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
        (bounds.single ? 'godzinowo · ' : 'dobowo · ') +
        fmtKwh(vals.reduce((a, b) => a + b, 0)) +
        ' łącznie';
    }

    if (!line && !barRects.length) return null;
    return { color, line, area, hlines, xlabels, peak, avg, bars: barRects, barLabels, barCaption };
  }

  _renderModal() {
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
          ? fmtDayPl(Math.min.apply(null, m.sel)) + ' → ' + fmtDayPl(Math.max.apply(null, m.sel))
          : 'wybierz datę początkową i końcową'
        : b
        ? fmtDayPl(b.start) + ' → ' + (m.range === 'yesterday' ? fmtDayPl(b.end - 1) : 'teraz')
        : '';

    let body;
    if (m.loading) {
      body = `<div class="state-box">
        <div class="spinner"></div>
        <div class="state-cap">Pobieranie historii z rejestratora…</div>
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
        <div class="state-t">Nie udało się pobrać historii</div>
        <div class="state-s">${esc(m.error)}</div>
      </div>`;
    } else if (!m.chart) {
      body = `<div class="state-box">
        <svg width="34" height="34" viewBox="0 0 24 24" style="color:var(--mut);opacity:.6"><g fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="5" width="18" height="15" rx="2"></rect><path d="M3 10h18M8 5V3M16 5V3M8.5 15.5l7-4"></path></g></svg>
        <div class="state-t">Brak historii dla tego zakresu</div>
        <div class="state-s">${
          m.range === 'custom' && m.sel.length < 2
            ? 'Wybierz datę początkową i końcową, aby wczytać statystyki.'
            : n.off
            ? 'Encja jest niedostępna — rejestrator nie ma statystyk dla wybranego okresu.'
            : 'Rejestrator nie zwrócił danych dla wybranych encji.'
        }</div>
      </div>`;
    } else {
      const ch = m.chart;
      body = `
        ${
          ch.line
            ? `<div class="sec-head">
                 <div class="sec-t">Moc</div>
                 <div class="mono sec-m">szczyt ${ch.peak} · średnio ${ch.avg}</div>
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
               </div>
               <div class="xlabels">${ch.xlabels.map((x) => `<div class="mono">${esc(x)}</div>`).join('')}</div>`
            : ''
        }
        ${
          ch.bars.length
            ? `<div class="sec-head" style="margin:22px 0 8px">
                 <div class="sec-t">Energia</div>
                 <div class="mono sec-m">${esc(ch.barCaption)}</div>
               </div>
               <svg viewBox="0 0 760 110" preserveAspectRatio="none" style="width:100%;height:110px;display:block">
                 <line x1="0" y1="100" x2="760" y2="100" stroke="var(--line)" stroke-width="1"></line>
                 ${ch.bars
                   .map(
                     (r) =>
                       `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="2" fill="${ch.color}" opacity="0.72"></rect>`
                   )
                   .join('')}
               </svg>
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
      <div class="mono p" style="color:${accent}">${n.off ? 'niedostępny' : fmtW(n.power)}</div>
      <div class="mono k">${(n.off ? '—' : fmtKwh(n.energy)) + ' dzisiaj'}</div>
    </div>
    <div class="m-close" id="m-close">✕</div>
  </div>

  <div class="m-bar">
    <div class="chips">
      ${chip('today', 'Dziś')}${chip('yesterday', 'Wczoraj')}${chip('7d', '7 dni')}${chip('30d', '30 dni')}${chip(
      'custom',
      'Zakres'
    )}
    </div>
    <div style="flex:1"></div>
    <div class="mono m-cap">${esc(caption)}</div>
  </div>

  ${
    m.range === 'custom'
      ? `<div class="picker">
    <div class="pk-head">
      <div class="pk-nav" id="pk-prev">‹</div>
      <div class="pk-month">${esc(MONTHS_PL[m.month.getMonth()] + ' ' + m.month.getFullYear())}</div>
      <div class="pk-nav" id="pk-next">›</div>
      <div style="flex:1"></div>
      <div class="mono m-cap">${
        m.sel.length === 2 ? 'zakres ustawiony · kliknij dzień, aby zacząć od nowa' : 'wybierz datę ' + (m.sel.length ? 'końcową' : 'początkową')
      }</div>
    </div>
    <div class="pk-grid">
      ${DOW_PL.map((d) => `<div class="pk-dow">${d}</div>`).join('')}
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
