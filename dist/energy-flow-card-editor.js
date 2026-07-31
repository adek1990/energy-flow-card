/*!
 * Energy Flow Card — wizualny edytor konfiguracji (Lovelace GUI)
 * Licencja: MIT
 */

const ICONS = [
  'plug', 'sun', 'panel', 'house', 'tower', 'battery', 'climate', 'stove',
  'washer', 'car', 'bulb', 'tv', 'water', 'server', 'fan'
];

const ICON_LABELS = {
  plug: 'Gniazdko',
  sun: 'Słońce',
  panel: 'Panel PV',
  house: 'Dom',
  tower: 'Słup energetyczny',
  battery: 'Akumulator',
  climate: 'Klimatyzacja',
  stove: 'Kuchnia',
  washer: 'Pralka',
  car: 'Samochód / EV',
  bulb: 'Oświetlenie',
  tv: 'Multimedia',
  water: 'Woda',
  server: 'Serwer / sieć',
  fan: 'Wentylator'
};

const LAYOUT_LABELS = {
  strings: 'Falowniki',
  solar: 'Fotowoltaika',
  hub: 'Dom',
  grid: 'Sieć',
  batt: 'Akumulator',
  consumers: 'Odbiorniki'
};

const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));

const EDITOR_STYLES = `
:host { display:block; }
.ed { display:flex;flex-direction:column;gap:12px;padding:4px 0 12px; }
.sec { border:1px solid var(--divider-color,#3335);border-radius:10px;overflow:hidden;background:var(--card-background-color,transparent); }
.sec > .sec-head {
  display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer;
  font-weight:600;font-size:14px;background:rgba(127,127,127,.06);
}
.sec > .sec-head .chev { margin-left:auto;opacity:.6;font-size:12px; }
.sec > .sec-body { padding:12px;display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--divider-color,#3335); }
.sec.closed > .sec-body { display:none; }
.row { display:flex;gap:10px;flex-wrap:wrap;align-items:center; }
.row > * { flex:1 1 220px;min-width:0; }
.row.tight > * { flex:0 0 auto; }
ha-textfield, ha-entity-picker { width:100%;display:block; }
.item {
  border:1px dashed var(--divider-color,#3335);border-radius:10px;padding:10px;
  display:flex;flex-direction:column;gap:8px;
}
.item-head { display:flex;align-items:center;gap:8px; }
.item-title { font-weight:600;font-size:13px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
.btn {
  cursor:pointer;border:1px solid var(--divider-color,#3335);border-radius:8px;padding:6px 10px;
  font-size:12px;font-weight:600;background:transparent;color:var(--primary-text-color,inherit);
}
.btn:hover { border-color:var(--primary-color,#03a9f4);color:var(--primary-color,#03a9f4); }
.btn.danger:hover { border-color:var(--error-color,#db4437);color:var(--error-color,#db4437); }
.hint { font-size:12px;opacity:.7;line-height:1.45; }
label.sw { display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;flex:0 0 auto; }
select.icon, select.plain {
  width:100%;padding:9px 8px;border-radius:6px;border:1px solid var(--divider-color,#3335);
  background:var(--card-background-color,#0000);color:var(--primary-text-color,inherit);font-size:14px;
}
.group-card { border:1px solid var(--divider-color,#3335);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:10px; }
.devs { display:flex;flex-direction:column;gap:8px;padding-left:10px;border-left:2px solid var(--divider-color,#3335); }
`;

class EnergyFlowCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = { look: true, layout: false, solar: true, grid: true, batt: true, house: false, groups: true };
    this._built = false;
    /* karta w podglądzie zgłasza tu nowe pozycje po przeciągnięciu węzła */
    this._onLayout = (ev) => {
      if (!this._config) return;
      const d = ev.detail || {};
      this._config.layout = Object.assign({}, this._config.layout, {
        mode: 'free',
        nodes: d.nodes || {},
        height: d.height,
        rail_width: d.rail_width
      });
      this._emit();
      if (this._open.layout) this._render();
    };
  }

  connectedCallback() {
    window.addEventListener('energy-flow-card-layout', this._onLayout);
  }

  disconnectedCallback() {
    window.removeEventListener('energy-flow-card-layout', this._onLayout);
  }

  setConfig(config) {
    const incoming = JSON.stringify(config);
    /* echo naszej własnej zmiany — zachowaj bieżący graf obiektów i nie przebudowuj DOM,
       inaczej edycje w polach tekstowych trafiałyby do porzuconej kopii konfiguracji */
    if (this._emitted === incoming && this._built) return;
    this._config = clone(config) || {};
    this._emitted = incoming;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this.shadowRoot.querySelectorAll('ha-entity-picker').forEach((p) => {
      p.hass = hass;
    });
  }

  get hass() {
    return this._hass;
  }

  _emit() {
    const cfg = clone(this._config);
    this._emitted = JSON.stringify(cfg);
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: cfg },
        bubbles: true,
        composed: true
      })
    );
  }

  /* ---------------------------------------------------------- kreatory */

  _textField(label, value, onInput, opts) {
    const f = document.createElement('ha-textfield');
    f.label = label;
    f.value = value === undefined || value === null ? '' : String(value);
    if (opts && opts.type) f.type = opts.type;
    if (opts && opts.suffix) f.suffix = opts.suffix;
    f.addEventListener('input', () => onInput(f.value));
    return f;
  }

  _entityPicker(label, value, onChange, domains) {
    /* listy encji edytuje się w YAML — picker obsługuje jedną encję i skasowałby resztę */
    if (Array.isArray(value)) {
      const f = document.createElement('ha-textfield');
      f.label = label + ' — lista ' + value.length + ' encji';
      f.value = value.join(', ');
      f.disabled = true;
      f.helper = 'Edytuj w widoku YAML';
      return f;
    }
    const p = document.createElement('ha-entity-picker');
    p.hass = this._hass;
    p.label = label;
    p.value = value || '';
    p.allowCustomEntity = true;
    p.includeDomains = domains || ['sensor', 'input_number', 'number'];
    p.addEventListener('value-changed', (ev) => {
      ev.stopPropagation();
      onChange(ev.detail.value || null);
    });
    return p;
  }

  _iconSelect(value, onChange) {
    const s = document.createElement('select');
    s.className = 'icon';
    ICONS.forEach((k) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = ICON_LABELS[k] || k;
      if (k === value) o.selected = true;
      s.appendChild(o);
    });
    s.addEventListener('change', () => onChange(s.value));
    return s;
  }

  _switch(label, checked, onChange) {
    const wrap = document.createElement('label');
    wrap.className = 'sw';
    const sw = document.createElement('ha-switch');
    sw.checked = !!checked;
    sw.addEventListener('change', () => onChange(sw.checked));
    wrap.appendChild(sw);
    wrap.appendChild(document.createTextNode(label));
    return wrap;
  }

  _button(text, onClick, danger) {
    const b = document.createElement('button');
    b.className = 'btn' + (danger ? ' danger' : '');
    b.textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }

  _row(...children) {
    const r = document.createElement('div');
    r.className = 'row';
    children.filter(Boolean).forEach((c) => r.appendChild(c));
    return r;
  }

  _section(key, title, buildBody) {
    const sec = document.createElement('div');
    sec.className = 'sec' + (this._open[key] ? '' : ' closed');
    const head = document.createElement('div');
    head.className = 'sec-head';
    head.innerHTML = `<span>${title}</span><span class="chev">${this._open[key] ? '▾' : '▸'}</span>`;
    head.addEventListener('click', () => {
      this._open[key] = !this._open[key];
      this._render();
    });
    const body = document.createElement('div');
    body.className = 'sec-body';
    buildBody(body);
    sec.appendChild(head);
    sec.appendChild(body);
    return sec;
  }

  _hint(text) {
    const d = document.createElement('div');
    d.className = 'hint';
    d.textContent = text;
    return d;
  }

  /* -------------------------------------------------------------- render */

  _render() {
    if (!this.shadowRoot) return;
    const c = this._config || {};
    this.shadowRoot.innerHTML = `<style>${EDITOR_STYLES}</style>`;
    const ed = document.createElement('div');
    ed.className = 'ed';
    this.shadowRoot.appendChild(ed);

    /* ------------------------------------------------------- wygląd */
    ed.appendChild(
      this._section('look', 'Wygląd i zachowanie', (b) => {
        b.appendChild(
          this._row(
            this._textField('Tytuł', c.title !== undefined ? c.title : 'Przepływ energii', (v) => {
              this._config.title = v;
              this._emit();
            }),
            this._textField('Nadtytuł', c.kicker, (v) => {
              this._config.kicker = v;
              this._emit();
            })
          )
        );
        b.appendChild(
          this._textField('Podtytuł', c.subtitle, (v) => {
            this._config.subtitle = v;
            this._emit();
          })
        );

        const theme = document.createElement('select');
        theme.className = 'plain';
        [
          ['auto', 'Motyw: automatyczny (wg HA)'],
          ['dark', 'Motyw: ciemny'],
          ['light', 'Motyw: jasny']
        ].forEach(([k, l]) => {
          const o = document.createElement('option');
          o.value = k;
          o.textContent = l;
          if ((c.theme_mode || 'auto') === k) o.selected = true;
          theme.appendChild(o);
        });
        theme.addEventListener('change', () => {
          this._config.theme_mode = theme.value;
          this._emit();
        });

        b.appendChild(
          this._row(
            theme,
            this._textField(
              'Próg bezczynności (W)',
              c.idle_threshold !== undefined ? c.idle_threshold : 15,
              (v) => {
                this._config.idle_threshold = Number(v) || 15;
                this._emit();
              },
              { type: 'number' }
            )
          )
        );

        const flags = document.createElement('div');
        flags.className = 'row tight';
        flags.appendChild(
          this._switch('Animacja przepływu', c.animate !== false, (v) => {
            this._config.animate = v;
            this._emit();
          })
        );
        flags.appendChild(
          this._switch('Legenda', c.legend !== false, (v) => {
            this._config.legend = v;
            this._emit();
          })
        );
        flags.appendChild(
          this._switch('Okno historii po kliknięciu', c.history !== false, (v) => {
            this._config.history = v;
            this._emit();
          })
        );
        b.appendChild(flags);
        b.appendChild(
          this._hint(
            'Wyłączenie okna historii sprawia, że kliknięcie węzła otwiera standardowe okno „więcej informacji” Home Assistanta.'
          )
        );
      })
    );

    /* --------------------------------------------------------- układ */
    ed.appendChild(
      this._section('layout', 'Układ węzłów', (b) => {
        const L = c.layout || {};
        const free = L.mode === 'free';
        const upd = (patch) => {
          this._config.layout = Object.assign({}, this._config.layout, patch);
          this._emit();
        };

        const flags = document.createElement('div');
        flags.className = 'row tight';
        flags.appendChild(
          this._switch('Swobodne pozycjonowanie', free, (v) => {
            upd({ mode: v ? 'free' : 'auto' });
            this._render();
          })
        );
        if (free) {
          flags.appendChild(
            this._switch('Tryb przeciągania', !!L.edit, (v) => {
              upd({ edit: v });
            })
          );
        }
        b.appendChild(flags);

        if (!free) {
          b.appendChild(
            this._hint(
              'Układ automatyczny: węzły rozkładają się same, a szyna odbiorników przelewa się na kolumny. ' +
                'Włącz swobodne pozycjonowanie, aby ustawić węzły po swojemu.'
            )
          );
          return;
        }

        b.appendChild(
          this._row(
            this._textField('Wysokość karty (px)', L.height || 700, (v) => upd({ height: Number(v) || 700 }), {
              type: 'number'
            }),
            this._textField(
              'Szerokość szyny odbiorników (%)',
              L.rail_width || 46,
              (v) => upd({ rail_width: Number(v) || 46 }),
              { type: 'number' }
            )
          )
        );

        const nodes = L.nodes || {};
        const keys = Object.keys(nodes);
        if (keys.length) {
          const list = document.createElement('div');
          list.className = 'hint';
          list.textContent =
            'Zapisane pozycje: ' +
            keys.map((k) => `${LAYOUT_LABELS[k] || k} (${nodes[k].x}%, ${nodes[k].y}%)`).join(' · ');
          b.appendChild(list);
        }

        b.appendChild(
          this._button('Przywróć układ automatyczny', () => {
            upd({ mode: 'auto', edit: false, nodes: {} });
            this._render();
          })
        );

        b.appendChild(
          this._hint(
            'Włącz „Tryb przeciągania" i przeciągnij węzły w podglądzie obok — pozycje zapiszą się tutaj automatycznie, ' +
              'a linie przeliczą się w trakcie ruchu. Wyłącz tryb przeciągania, gdy skończysz, żeby kliknięcie węzła znów ' +
              'otwierało historię. Poniżej 720 px karta i tak wraca do układu pionowego.'
          )
        );
      })
    );

    /* -------------------------------------------------- fotowoltaika */
    ed.appendChild(
      this._section('solar', 'Fotowoltaika', (b) => {
        const s = c.solar || {};
        b.appendChild(
          this._row(
            this._textField('Nazwa węzła', s.name || 'Fotowoltaika łącznie', (v) => {
              this._config.solar = Object.assign({}, this._config.solar, { name: v });
              this._emit();
            }),
            this._entityPicker('Moc łączna (opcjonalnie)', s.power, (v) => {
              this._config.solar = Object.assign({}, this._config.solar, { power: v });
              this._emit();
            })
          )
        );
        b.appendChild(
          this._entityPicker('Energia dzisiaj — łącznie (opcjonalnie)', s.energy, (v) => {
            this._config.solar = Object.assign({}, this._config.solar, { energy: v });
            this._emit();
          })
        );
        b.appendChild(
          this._hint(
            'Bez encji łącznych karta sumuje wartości ze stringów falowników poniżej. Sekcja fotowoltaiki pokazuje się tylko, gdy jest co najmniej jeden string.'
          )
        );

        (s.strings || []).forEach((str, i) => {
          const it = document.createElement('div');
          it.className = 'item';
          const head = document.createElement('div');
          head.className = 'item-head';
          const t = document.createElement('div');
          t.className = 'item-title';
          t.textContent = str.name || 'String ' + (i + 1);
          head.appendChild(t);
          head.appendChild(
            this._button(
              'Usuń',
              () => {
                this._config.solar.strings.splice(i, 1);
                this._emit();
                this._render();
              },
              true
            )
          );
          it.appendChild(head);
          it.appendChild(
            this._row(
              this._textField('Nazwa', str.name, (v) => {
                str.name = v;
                t.textContent = v || 'String ' + (i + 1);
                this._emit();
              }),
              this._iconSelect(str.icon || 'panel', (v) => {
                str.icon = v;
                this._emit();
              })
            )
          );
          it.appendChild(
            this._row(
              this._entityPicker('Moc', str.power, (v) => {
                str.power = v;
                this._emit();
              }),
              this._entityPicker('Energia dzisiaj', str.energy, (v) => {
                str.energy = v;
                this._emit();
              })
            )
          );
          b.appendChild(it);
        });

        b.appendChild(
          this._button('+ Dodaj string falownika', () => {
            const solar = this._config.solar || {};
            solar.name = solar.name || 'Fotowoltaika łącznie';
            solar.strings = solar.strings || [];
            solar.strings.push({ name: 'Falownik ' + (solar.strings.length + 1), icon: 'panel', power: null, energy: null });
            this._config.solar = solar;
            this._emit();
            this._render();
          })
        );
      })
    );

    /* --------------------------------------------------------- sieć */
    ed.appendChild(
      this._section('grid', 'Sieć energetyczna', (b) => {
        const g = c.grid || {};
        const upd = (patch) => {
          this._config.grid = Object.assign({}, this._config.grid, patch);
          this._emit();
        };
        b.appendChild(
          this._row(
            this._textField('Nazwa', g.name || 'Sieć', (v) => upd({ name: v })),
            this._entityPicker('Moc (dodatnia = pobór)', g.power, (v) => upd({ power: v }))
          )
        );
        b.appendChild(
          this._row(
            this._entityPicker('Moc poboru (alternatywnie)', g.power_import, (v) => upd({ power_import: v })),
            this._entityPicker('Moc oddawania (alternatywnie)', g.power_export, (v) => upd({ power_export: v }))
          )
        );
        b.appendChild(
          this._row(
            this._entityPicker('Energia pobrana dzisiaj', g.energy_import, (v) => upd({ energy_import: v })),
            this._entityPicker('Energia oddana dzisiaj', g.energy_export, (v) => upd({ energy_export: v }))
          )
        );
        b.appendChild(this._switch('Odwróć znak mocy', !!g.invert, (v) => upd({ invert: v })));
        b.appendChild(
          this._hint(
            'Użyj jednej encji mocy ze znakiem (+ pobór / − oddanie) albo pary osobnych encji poboru i oddawania.'
          )
        );
      })
    );

    /* --------------------------------------------------- akumulator */
    ed.appendChild(
      this._section('batt', 'Akumulator', (b) => {
        const t = c.battery || {};
        const upd = (patch) => {
          this._config.battery = Object.assign({}, this._config.battery, patch);
          this._emit();
        };
        b.appendChild(
          this._row(
            this._textField('Nazwa', t.name || 'Akumulator', (v) => upd({ name: v })),
            this._entityPicker('Moc (dodatnia = ładowanie)', t.power, (v) => upd({ power: v }))
          )
        );
        b.appendChild(
          this._row(
            this._entityPicker('Stan naładowania (%)', t.soc, (v) => upd({ soc: v })),
            this._entityPicker('Energia dzisiaj', t.energy, (v) => upd({ energy: v }))
          )
        );
        b.appendChild(this._switch('Odwróć znak mocy', !!t.invert, (v) => upd({ invert: v })));
      })
    );

    /* --------------------------------------------------------- dom */
    ed.appendChild(
      this._section('house', 'Węzeł domu', (b) => {
        const h = c.house || {};
        const upd = (patch) => {
          this._config.house = Object.assign({}, this._config.house, patch);
          this._emit();
        };
        b.appendChild(
          this._row(
            this._textField('Nazwa', h.name || 'Dom', (v) => upd({ name: v })),
            this._entityPicker('Moc całkowita (opcjonalnie)', h.power, (v) => upd({ power: v }))
          )
        );
        b.appendChild(
          this._entityPicker('Energia dzisiaj (opcjonalnie)', h.energy, (v) => upd({ energy: v }))
        );
        b.appendChild(
          this._hint('Bez tych encji karta sumuje moc i energię wszystkich urządzeń z grup odbiorników.')
        );
      })
    );

    /* ---------------------------------------------------- odbiorniki */
    ed.appendChild(
      this._section('groups', 'Grupy odbiorników', (b) => {
        const groups = c.groups || [];
        groups.forEach((g, gi) => {
          const card = document.createElement('div');
          card.className = 'group-card';

          const head = document.createElement('div');
          head.className = 'item-head';
          const t = document.createElement('div');
          t.className = 'item-title';
          t.textContent = (g.name || 'Grupa ' + (gi + 1)) + ' · ' + (g.devices || []).length + ' urz.';
          head.appendChild(t);
          head.appendChild(
            this._button('▲', () => {
              if (gi === 0) return;
              const arr = this._config.groups;
              [arr[gi - 1], arr[gi]] = [arr[gi], arr[gi - 1]];
              this._emit();
              this._render();
            })
          );
          head.appendChild(
            this._button('▼', () => {
              const arr = this._config.groups;
              if (gi >= arr.length - 1) return;
              [arr[gi + 1], arr[gi]] = [arr[gi], arr[gi + 1]];
              this._emit();
              this._render();
            })
          );
          head.appendChild(
            this._button(
              'Usuń grupę',
              () => {
                this._config.groups.splice(gi, 1);
                this._emit();
                this._render();
              },
              true
            )
          );
          card.appendChild(head);

          card.appendChild(
            this._row(
              this._textField('Nazwa grupy', g.name, (v) => {
                g.name = v;
                this._emit();
              }),
              this._iconSelect(g.icon || 'plug', (v) => {
                g.icon = v;
                this._emit();
              }),
              this._switch('Rozwinięta domyślnie', !!g.expanded, (v) => {
                g.expanded = v;
                this._emit();
              })
            )
          );

          const devs = document.createElement('div');
          devs.className = 'devs';
          (g.devices || []).forEach((d, di) => {
            const it = document.createElement('div');
            it.className = 'item';
            const dh = document.createElement('div');
            dh.className = 'item-head';
            const dt = document.createElement('div');
            dt.className = 'item-title';
            dt.textContent = d.name || 'Urządzenie ' + (di + 1);
            dh.appendChild(dt);
            dh.appendChild(
              this._button(
                'Usuń',
                () => {
                  g.devices.splice(di, 1);
                  this._emit();
                  this._render();
                },
                true
              )
            );
            it.appendChild(dh);
            it.appendChild(
              this._row(
                this._textField('Nazwa', d.name, (v) => {
                  d.name = v;
                  dt.textContent = v || 'Urządzenie ' + (di + 1);
                  this._emit();
                }),
                this._iconSelect(d.icon || 'plug', (v) => {
                  d.icon = v;
                  this._emit();
                })
              )
            );
            it.appendChild(
              this._row(
                this._entityPicker('Moc', d.power, (v) => {
                  d.power = v;
                  this._emit();
                }),
                this._entityPicker('Energia dzisiaj', d.energy, (v) => {
                  d.energy = v;
                  this._emit();
                })
              )
            );
            devs.appendChild(it);
          });
          card.appendChild(devs);

          card.appendChild(
            this._button('+ Dodaj urządzenie', () => {
              g.devices = g.devices || [];
              g.devices.push({ name: 'Urządzenie ' + (g.devices.length + 1), icon: 'plug', power: null, energy: null });
              this._emit();
              this._render();
            })
          );

          b.appendChild(card);
        });

        b.appendChild(
          this._button('+ Dodaj grupę', () => {
            this._config.groups = this._config.groups || [];
            this._config.groups.push({
              name: 'Grupa ' + (this._config.groups.length + 1),
              icon: 'plug',
              devices: []
            });
            this._emit();
            this._render();
          })
        );

        b.appendChild(
          this._hint(
            'Grupy są jedynymi połączeniami węzła domu — dodanie urządzenia pogrubia istniejącą linię zamiast rysować nową.'
          )
        );
      })
    );

    this._built = true;
    if (this._hass) {
      this.shadowRoot.querySelectorAll('ha-entity-picker').forEach((p) => {
        p.hass = this._hass;
      });
    }
  }
}

if (!customElements.get('energy-flow-card-editor')) {
  customElements.define('energy-flow-card-editor', EnergyFlowCardEditor);
}

export { EnergyFlowCardEditor };
