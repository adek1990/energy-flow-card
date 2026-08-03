/*!
 * Energy Flow Card — wizualny edytor konfiguracji (Lovelace GUI)
 * Licencja: MIT
 */

const ICONS = [
  'plug', 'sun', 'panel', 'house', 'tower', 'battery', 'climate', 'stove',
  'washer', 'car', 'bulb', 'tv', 'water', 'server', 'fan'
];

const ICON_LABELS = {
  plug: 'Gniazdko', sun: 'Słońce', panel: 'Panel PV', house: 'Dom',
  tower: 'Słup energetyczny', battery: 'Akumulator', climate: 'Klimatyzacja',
  stove: 'Kuchnia', washer: 'Pralka', car: 'Samochód / EV', bulb: 'Oświetlenie',
  tv: 'Multimedia', water: 'Woda', server: 'Serwer / sieć', fan: 'Wentylator'
};

const LAYOUT_LABELS = {
  strings: 'Falowniki', solar: 'Fotowoltaika', hub: 'Dom',
  grid: 'Sieć', batt: 'Akumulator', consumers: 'Odbiorniki'
};

const clone = (o) => JSON.parse(JSON.stringify(o === undefined ? null : o));

const STYLES = `
:host { display:block; }
.ed { display:flex;flex-direction:column;gap:14px;padding:4px 0 16px;
  font-family:var(--ha-font-family-body,var(--primary-font-family,Roboto,system-ui,sans-serif));
  color:var(--primary-text-color); }

/* --- sekcje --- */
.sec { border:1px solid var(--divider-color,#3335);border-radius:12px;overflow:hidden; }
.sec-head {
  display:flex;align-items:center;gap:10px;padding:13px 14px;cursor:pointer;user-select:none;
  font-weight:600;font-size:15px;background:rgba(127,127,127,.07);
}
.sec-head:hover { background:rgba(127,127,127,.12); }
.sec-head .chev { margin-left:auto;opacity:.55;font-size:13px;transition:transform .15s; }
.sec.closed .sec-head .chev { transform:rotate(-90deg); }
.sec-head .count {
  font-size:11px;font-weight:600;opacity:.6;padding:2px 8px;border-radius:999px;
  border:1px solid var(--divider-color,#3335);
}
.sec-body { padding:16px 14px;display:flex;flex-direction:column;gap:16px; }
.sec.closed .sec-body { display:none; }

/* --- pola --- */
.field { display:flex;flex-direction:column;gap:6px;min-width:0; }
.field > .lbl { font-size:12px;font-weight:500;opacity:.72;letter-spacing:.01em; }
.grid2 { display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:12px; }
.grid3 { display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px; }

input.txt, select.sel {
  width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;font-size:14px;
  border:1px solid var(--divider-color,#4446);
  background:var(--secondary-background-color,rgba(127,127,127,.08));
  color:var(--primary-text-color,inherit);
  font-family:inherit;
}
input.txt:focus, select.sel:focus { outline:none;border-color:var(--primary-color,#03a9f4); }
input.txt::placeholder { opacity:.45; }
input.txt:disabled { opacity:.6; }
ha-entity-picker { width:100%;display:block; }

/* --- przełączniki --- */
.switches { display:flex;flex-wrap:wrap;gap:10px 20px; }
label.sw { display:flex;align-items:center;gap:9px;font-size:14px;cursor:pointer; }

/* --- karty pozycji --- */
.item {
  border:1px solid var(--divider-color,#3335);border-radius:10px;padding:12px;
  display:flex;flex-direction:column;gap:12px;background:rgba(127,127,127,.035);
}
.item-head { display:flex;align-items:center;gap:8px;min-height:30px; }
.item-title {
  font-weight:600;font-size:13px;flex:1;min-width:0;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.item-title .sub { font-weight:400;opacity:.6;margin-left:6px;font-size:12px; }
.kids { display:flex;flex-direction:column;gap:10px;padding-left:12px;border-left:2px solid var(--divider-color,#3335); }

/* --- przyciski --- */
.btn {
  cursor:pointer;border:1px solid var(--divider-color,#4446);border-radius:8px;padding:7px 12px;
  font-size:13px;font-weight:500;background:transparent;color:var(--primary-text-color,inherit);
  font-family:inherit;white-space:nowrap;
}
.btn:hover { border-color:var(--primary-color,#03a9f4);color:var(--primary-color,#03a9f4); }
.btn.icon { padding:6px 9px;line-height:1; }
.btn.danger:hover { border-color:var(--error-color,#db4437);color:var(--error-color,#db4437); }
.btn.add { align-self:flex-start;border-style:dashed; }

.hint { font-size:12px;opacity:.65;line-height:1.5; }
.hint.warn { color:var(--warning-color,#ffa726);opacity:.9; }
`;

class EnergyFlowCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._open = { look: true, layout: false, solar: false, grid: false, batt: false, house: false, groups: true };
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
      new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true })
    );
  }

  /* ------------------------------------------------------- kreatory pól */

  _field(label, control) {
    const f = document.createElement('div');
    f.className = 'field';
    if (label) {
      const l = document.createElement('div');
      l.className = 'lbl';
      l.textContent = label;
      f.appendChild(l);
    }
    f.appendChild(control);
    return f;
  }

  /* własny input — ha-textfield bywa niezarejestrowany w kontekście edytora
     i wtedy renderuje się jako pusty element, gubiąc całe pole */
  _text(label, value, onInput, opts) {
    const i = document.createElement('input');
    i.className = 'txt';
    i.type = (opts && opts.type) || 'text';
    i.value = value === undefined || value === null ? '' : String(value);
    if (opts && opts.placeholder) i.placeholder = opts.placeholder;
    if (opts && opts.min !== undefined) i.min = opts.min;
    i.addEventListener('input', () => onInput(i.value));
    return this._field(label, i);
  }

  _select(label, value, options, onChange) {
    const s = document.createElement('select');
    s.className = 'sel';
    options.forEach(([k, l]) => {
      const o = document.createElement('option');
      o.value = k;
      o.textContent = l;
      if (k === value) o.selected = true;
      s.appendChild(o);
    });
    s.addEventListener('change', () => onChange(s.value));
    return this._field(label, s);
  }

  _icon(label, value, onChange) {
    return this._select(
      label,
      value || 'plug',
      ICONS.map((k) => [k, ICON_LABELS[k] || k]),
      onChange
    );
  }

  _entity(label, value, onChange, domains) {
    /* listy encji edytuje się w YAML — picker obsługuje jedną encję i skasowałby resztę */
    if (Array.isArray(value)) {
      const i = document.createElement('input');
      i.className = 'txt';
      i.value = value.join(', ');
      i.disabled = true;
      const f = this._field(label + ' — lista ' + value.length + ' encji', i);
      const h = document.createElement('div');
      h.className = 'hint';
      h.textContent = 'Listy encji edytuje się w widoku YAML.';
      f.appendChild(h);
      return f;
    }
    const p = document.createElement('ha-entity-picker');
    p.hass = this._hass;
    p.value = value || '';
    p.allowCustomEntity = true;
    p.includeDomains = domains || ['sensor', 'input_number', 'number'];
    p.addEventListener('value-changed', (ev) => {
      ev.stopPropagation();
      onChange(ev.detail.value || null);
    });
    return this._field(label, p);
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

  _btn(text, onClick, cls) {
    const b = document.createElement('button');
    b.className = 'btn' + (cls ? ' ' + cls : '');
    b.textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }

  _group(...children) {
    const r = document.createElement('div');
    r.className = 'grid2';
    children.filter(Boolean).forEach((c) => r.appendChild(c));
    return r;
  }

  _cols3(...children) {
    const r = document.createElement('div');
    r.className = 'grid3';
    children.filter(Boolean).forEach((c) => r.appendChild(c));
    return r;
  }

  _hint(text, warn) {
    const d = document.createElement('div');
    d.className = 'hint' + (warn ? ' warn' : '');
    d.textContent = text;
    return d;
  }

  _section(key, title, count, build) {
    const sec = document.createElement('div');
    sec.className = 'sec' + (this._open[key] ? '' : ' closed');
    const head = document.createElement('div');
    head.className = 'sec-head';
    head.innerHTML =
      `<span>${title}</span>` +
      (count ? `<span class="count">${count}</span>` : '') +
      '<span class="chev">▾</span>';
    head.addEventListener('click', () => {
      this._open[key] = !this._open[key];
      this._render();
    });
    const body = document.createElement('div');
    body.className = 'sec-body';
    build(body);
    sec.appendChild(head);
    sec.appendChild(body);
    return sec;
  }

  _itemCard(title, sub, actions) {
    const it = document.createElement('div');
    it.className = 'item';
    const head = document.createElement('div');
    head.className = 'item-head';
    const t = document.createElement('div');
    t.className = 'item-title';
    t.innerHTML = `<span class="name"></span>${sub ? `<span class="sub">${sub}</span>` : ''}`;
    t.querySelector('.name').textContent = title;
    head.appendChild(t);
    (actions || []).forEach((a) => head.appendChild(a));
    it.appendChild(head);
    it._title = t.querySelector('.name');
    return it;
  }

  /* -------------------------------------------------------------- render */

  _render() {
    if (!this.shadowRoot) return;
    const c = this._config || {};
    this.shadowRoot.innerHTML = `<style>${STYLES}</style>`;
    const ed = document.createElement('div');
    ed.className = 'ed';
    this.shadowRoot.appendChild(ed);

    ed.appendChild(this._secLook(c));
    ed.appendChild(this._secLayout(c));
    ed.appendChild(this._secSolar(c));
    ed.appendChild(this._secGrid(c));
    ed.appendChild(this._secBattery(c));
    ed.appendChild(this._secHouse(c));
    ed.appendChild(this._secGroups(c));

    this._built = true;
    if (this._hass) {
      this.shadowRoot.querySelectorAll('ha-entity-picker').forEach((p) => {
        p.hass = this._hass;
      });
    }
  }

  /* --------------------------------------------------- wygląd */

  _secLook(c) {
    return this._section('look', 'Wygląd i zachowanie', '', (b) => {
      b.appendChild(
        this._group(
          this._text('Tytuł', c.title !== undefined ? c.title : 'Przepływ energii', (v) => {
            this._config.title = v;
            this._emit();
          }),
          this._text('Nadtytuł', c.kicker, (v) => {
            this._config.kicker = v;
            this._emit();
          })
        )
      );
      b.appendChild(
        this._text('Podtytuł', c.subtitle, (v) => {
          this._config.subtitle = v;
          this._emit();
        }, { placeholder: 'np. Fronius Symo · Smart Meter' })
      );
      b.appendChild(
        this._cols3(
          this._select(
            'Motyw',
            c.theme_mode || 'auto',
            [['auto', 'Automatyczny (wg HA)'], ['dark', 'Ciemny'], ['light', 'Jasny']],
            (v) => {
              this._config.theme_mode = v;
              this._emit();
            }
          ),
          this._select(
            'Język',
            c.language || 'auto',
            [['auto', 'Automatyczny (wg HA)'], ['pl', 'Polski'], ['en', 'Angielski']],
            (v) => {
              this._config.language = v;
              this._emit();
            }
          ),
          this._text(
            'Próg bezczynności (W)',
            c.idle_threshold !== undefined ? c.idle_threshold : 15,
            (v) => {
              this._config.idle_threshold = Number(v) || 15;
              this._emit();
            },
            { type: 'number', min: 0 }
          )
        )
      );

      const sw = document.createElement('div');
      sw.className = 'switches';
      sw.appendChild(
        this._switch('Animacja przepływu', c.animate !== false, (v) => {
          this._config.animate = v;
          this._emit();
        })
      );
      sw.appendChild(
        this._switch('Legenda', c.legend !== false, (v) => {
          this._config.legend = v;
          this._emit();
        })
      );
      sw.appendChild(
        this._switch('Okno historii po kliknięciu', c.history !== false, (v) => {
          this._config.history = v;
          this._emit();
        })
      );
      sw.appendChild(
        this._switch('Przycisk układu na karcie', c.layout_button !== false, (v) => {
          this._config.layout_button = v;
          this._emit();
        })
      );
      b.appendChild(sw);
      b.appendChild(
        this._hint(
          'Bez okna historii kliknięcie węzła otwiera standardowe okno „więcej informacji" Home Assistanta.'
        )
      );
    });
  }

  /* --------------------------------------------------- układ */

  _secLayout(c) {
    const L = c.layout || {};
    const free = L.mode === 'free';
    const nodes = L.nodes || {};
    const count = Object.keys(nodes).length;
    return this._section('layout', 'Układ węzłów', free ? 'swobodny' : 'automatyczny', (b) => {
      const upd = (patch) => {
        this._config.layout = Object.assign({}, this._config.layout, patch);
        this._emit();
      };
      b.appendChild(
        this._hint(
          'Najprościej: kliknij przycisk „⠿ Układ" w rogu karty i przeciągnij węzły. ' +
            'Układ zapisze się w tej przeglądarce, a przyciskiem „Kopiuj YAML" przeniesiesz go tutaj na stałe.'
        )
      );
      const sw = document.createElement('div');
      sw.className = 'switches';
      sw.appendChild(
        this._switch('Swobodne pozycjonowanie', free, (v) => {
          upd({ mode: v ? 'free' : 'auto' });
          this._render();
        })
      );
      b.appendChild(sw);

      if (!free) return;

      b.appendChild(
        this._group(
          this._text('Wysokość karty (px)', L.height || 700, (v) => upd({ height: Number(v) || 700 }), {
            type: 'number',
            min: 200
          }),
          this._text(
            'Szerokość szyny odbiorników (%)',
            L.rail_width || 46,
            (v) => upd({ rail_width: Number(v) || 46 }),
            { type: 'number', min: 10 }
          )
        )
      );
      if (count) {
        b.appendChild(
          this._hint(
            'Zapisane pozycje: ' +
              Object.keys(nodes)
                .map((k) => `${LAYOUT_LABELS[k] || k} ${nodes[k].x}%/${nodes[k].y}%`)
                .join(' · ')
          )
        );
      }
      b.appendChild(
        this._btn(
          'Przywróć układ automatyczny',
          () => {
            upd({ mode: 'auto', edit: false, nodes: {} });
            this._render();
          },
          'danger'
        )
      );
    });
  }

  /* --------------------------------------------------- fotowoltaika */

  _secSolar(c) {
    const s = c.solar || {};
    const strings = s.strings || [];
    return this._section('solar', 'Fotowoltaika', strings.length ? strings.length + ' str.' : '', (b) => {
      const upd = (patch) => {
        this._config.solar = Object.assign({ name: 'Fotowoltaika łącznie' }, this._config.solar, patch);
        this._emit();
      };
      b.appendChild(
        this._group(
          this._text('Nazwa węzła', s.name, (v) => upd({ name: v }), { placeholder: 'Fotowoltaika łącznie' }),
          this._text('Moc znamionowa falownika (W)', s.max_power, (v) => upd({ max_power: Number(v) || 0 }), {
            type: 'number',
            min: 0,
            placeholder: 'np. 8000'
          })
        )
      );
      b.appendChild(
        this._group(
          this._entity('Moc łączna (opcjonalnie)', s.power, (v) => upd({ power: v })),
          this._entity('Energia dzisiaj — łącznie (opcjonalnie)', s.energy, (v) => upd({ energy: v }))
        )
      );
      b.appendChild(
        this._hint(
          'Bez encji łącznych karta sumuje stringi poniżej. Moc znamionowa daje procent wykorzystania ' +
            'przy sumie (np. 5,97 kW z 8 kW = 75%).'
        )
      );

      b.appendChild(this._hint('Strona AC falownika — pokazywana pod sumą:'));
      b.appendChild(
        this._cols3(
          this._entity('Napięcie AC', s.voltage, (v) => upd({ voltage: v })),
          this._entity('Prąd AC', s.current, (v) => upd({ current: v })),
          this._entity('Częstotliwość', s.frequency, (v) => upd({ frequency: v }))
        )
      );
      b.appendChild(
        this._entity('Stan pracy falownika', s.status, (v) => upd({ status: v }), ['sensor', 'binary_sensor'])
      );

      strings.forEach((str, i) => {
        const card = this._itemCard(str.name || 'String ' + (i + 1), '', [
          this._btn('Usuń', () => {
            this._config.solar.strings.splice(i, 1);
            this._emit();
            this._render();
          }, 'danger')
        ]);
        card.appendChild(
          this._group(
            this._text('Nazwa', str.name, (v) => {
              str.name = v;
              card._title.textContent = v || 'String ' + (i + 1);
              this._emit();
            }),
            this._icon('Ikona', str.icon || 'panel', (v) => {
              str.icon = v;
              this._emit();
            })
          )
        );
        card.appendChild(
          this._group(
            this._entity('Moc', str.power, (v) => {
              str.power = v;
              this._emit();
            }),
            this._entity('Energia dzisiaj', str.energy, (v) => {
              str.energy = v;
              this._emit();
            })
          )
        );
        card.appendChild(
          this._cols3(
            this._entity('Napięcie DC', str.voltage, (v) => {
              str.voltage = v;
              this._emit();
            }),
            this._entity('Prąd DC', str.current, (v) => {
              str.current = v;
              this._emit();
            }),
            this._text('Moc szczytowa (W)', str.max_power, (v) => {
              str.max_power = Number(v) || 0;
              this._emit();
            }, { type: 'number', min: 0 })
          )
        );
        b.appendChild(card);
      });

      b.appendChild(
        this._btn('+ Dodaj string falownika', () => {
          const solar = this._config.solar || {};
          solar.strings = solar.strings || [];
          solar.strings.push({ name: 'Falownik ' + (solar.strings.length + 1), icon: 'panel' });
          this._config.solar = solar;
          this._emit();
          this._render();
        }, 'add')
      );
    });
  }

  /* --------------------------------------------------- sieć */

  _secGrid(c) {
    const g = c.grid || {};
    return this._section('grid', 'Sieć energetyczna', '', (b) => {
      const upd = (patch) => {
        this._config.grid = Object.assign({}, this._config.grid, patch);
        this._emit();
      };
      b.appendChild(this._text('Nazwa', g.name, (v) => upd({ name: v }), { placeholder: 'Sieć' }));
      b.appendChild(this._entity('Moc ze znakiem (+ pobór / − oddanie)', g.power, (v) => upd({ power: v })));
      b.appendChild(this._hint('albo dwie osobne encje kierunkowe — pewniejsze, bo nie da się pomylić znaku:'));
      b.appendChild(
        this._group(
          this._entity('Moc poboru', g.power_import, (v) => upd({ power_import: v })),
          this._entity('Moc oddawania', g.power_export, (v) => upd({ power_export: v }))
        )
      );
      b.appendChild(
        this._group(
          this._entity('Energia pobrana dzisiaj', g.energy_import, (v) => upd({ energy_import: v })),
          this._entity('Energia oddana dzisiaj', g.energy_export, (v) => upd({ energy_export: v }))
        )
      );
      const sw = document.createElement('div');
      sw.className = 'switches';
      sw.appendChild(this._switch('Odwróć znak mocy', !!g.invert, (v) => upd({ invert: v })));
      b.appendChild(sw);
      b.appendChild(
        this._hint('Liczniki od uruchomienia instalacji pokażą MWh zamiast dziennych kWh — użyj utility_meter.')
      );
    });
  }

  /* --------------------------------------------------- akumulator */

  _secBattery(c) {
    const t = c.battery || {};
    return this._section('batt', 'Akumulator', t.power ? '' : 'brak', (b) => {
      const upd = (patch) => {
        this._config.battery = Object.assign({}, this._config.battery, patch);
        this._emit();
      };
      b.appendChild(this._text('Nazwa', t.name, (v) => upd({ name: v }), { placeholder: 'Akumulator' }));
      b.appendChild(
        this._group(
          this._entity('Moc (+ ładowanie / − rozładowanie)', t.power, (v) => upd({ power: v })),
          this._entity('Stan naładowania (%)', t.soc, (v) => upd({ soc: v }))
        )
      );
      b.appendChild(this._entity('Energia dzisiaj', t.energy, (v) => upd({ energy: v })));
      const sw = document.createElement('div');
      sw.className = 'switches';
      sw.appendChild(this._switch('Odwróć znak mocy', !!t.invert, (v) => upd({ invert: v })));
      b.appendChild(sw);
    });
  }

  /* --------------------------------------------------- dom */

  _secHouse(c) {
    const h = c.house || {};
    const mode = h.power === 'auto' ? 'auto' : h.power ? 'entity' : 'sum';
    return this._section('house', 'Węzeł domu', '', (b) => {
      const upd = (patch) => {
        this._config.house = Object.assign({}, this._config.house, patch);
        this._emit();
      };
      b.appendChild(this._text('Nazwa', h.name, (v) => upd({ name: v }), { placeholder: 'Dom' }));
      b.appendChild(
        this._select(
          'Skąd brać moc domu',
          mode,
          [
            ['sum', 'Suma odbiorników z grup (domyślnie)'],
            ['auto', 'Bilans: fotowoltaika + sieć − akumulator'],
            ['entity', 'Osobna encja zużycia']
          ],
          (v) => {
            if (v === 'sum') upd({ power: null });
            else if (v === 'auto') upd({ power: 'auto' });
            else upd({ power: '' });
            this._render();
          }
        )
      );
      if (mode === 'entity') {
        b.appendChild(this._entity('Encja mocy domu', h.power === 'auto' ? '' : h.power, (v) => upd({ power: v })));
      }
      b.appendChild(
        this._group(
          this._entity('Energia dzisiaj (opcjonalnie)', h.energy, (v) => upd({ energy: v })),
          this._entity('Autonomia / samowystarczalność (%)', h.self_sufficiency, (v) =>
            upd({ self_sufficiency: v })
          )
        )
      );
      b.appendChild(
        this._hint(
          'Bez encji autonomii karta liczy ją z bilansu: (moc domu − pobór z sieci) / moc domu. ' +
            'Fronius wystawia gotową encję „Autonomia względna".'
        )
      );
    });
  }

  /* --------------------------------------------------- grupy */

  _deviceCard(dev, index, parentList, depth) {
    const label = depth ? 'Kanał ' + (index + 1) : 'Urządzenie ' + (index + 1);
    const kids = dev.devices || [];
    const card = this._itemCard(dev.name || label, kids.length ? kids.length + ' kan.' : '', [
      this._btn('Usuń', () => {
        parentList.splice(index, 1);
        this._emit();
        this._render();
      }, 'danger')
    ]);

    card.appendChild(
      this._group(
        this._text('Nazwa', dev.name, (v) => {
          dev.name = v;
          card._title.textContent = v || label;
          this._emit();
        }),
        this._icon('Ikona', dev.icon || 'plug', (v) => {
          dev.icon = v;
          this._emit();
        })
      )
    );

    if (!kids.length) {
      card.appendChild(
        this._group(
          this._entity('Moc', dev.power, (v) => {
            dev.power = v;
            this._emit();
          }),
          this._entity('Energia dzisiaj', dev.energy, (v) => {
            dev.energy = v;
            this._emit();
          })
        )
      );
      card.appendChild(
        this._group(
          this._entity('Napięcie (opcjonalnie)', dev.voltage, (v) => {
            dev.voltage = v;
            this._emit();
          }),
          this._entity('Prąd (opcjonalnie)', dev.current, (v) => {
            dev.current = v;
            this._emit();
          })
        )
      );
    } else {
      card.appendChild(this._hint('Moc i energia liczone jako suma kanałów poniżej.'));
      const box = document.createElement('div');
      box.className = 'kids';
      kids.forEach((k, ki) => box.appendChild(this._deviceCard(k, ki, kids, depth + 1)));
      card.appendChild(box);
    }

    if (depth < 1) {
      card.appendChild(
        this._btn('+ Dodaj kanał', () => {
          dev.devices = dev.devices || [];
          /* pierwszy kanał przejmuje encje rodzica, żeby nic nie zniknęło z karty */
          if (!dev.devices.length && (dev.power || dev.energy)) {
            dev.devices.push({ name: 'Kanał 1', icon: dev.icon || 'plug', power: dev.power, energy: dev.energy });
            dev.power = null;
            dev.energy = null;
          }
          dev.devices.push({ name: 'Kanał ' + (dev.devices.length + 1), icon: dev.icon || 'plug' });
          this._emit();
          this._render();
        }, 'add')
      );
    }
    return card;
  }

  _secGroups(c) {
    const groups = c.groups || [];
    const total = groups.reduce((t, g) => {
      const count = (g.devices || []).reduce((n, d) => n + ((d.devices || []).length || 1), 0);
      return t + count;
    }, 0);
    return this._section('groups', 'Grupy odbiorników', groups.length + ' gr. · ' + total + ' urz.', (b) => {
      groups.forEach((g, gi) => {
        const devices = g.devices || [];
        const card = this._itemCard(g.name || 'Grupa ' + (gi + 1), devices.length + ' poz.', [
          this._btn('▲', () => {
            if (gi === 0) return;
            const a = this._config.groups;
            [a[gi - 1], a[gi]] = [a[gi], a[gi - 1]];
            this._emit();
            this._render();
          }, 'icon'),
          this._btn('▼', () => {
            const a = this._config.groups;
            if (gi >= a.length - 1) return;
            [a[gi + 1], a[gi]] = [a[gi], a[gi + 1]];
            this._emit();
            this._render();
          }, 'icon'),
          this._btn('Usuń grupę', () => {
            this._config.groups.splice(gi, 1);
            this._emit();
            this._render();
          }, 'danger')
        ]);

        card.appendChild(
          this._group(
            this._text('Nazwa grupy', g.name, (v) => {
              g.name = v;
              card._title.textContent = v || 'Grupa ' + (gi + 1);
              this._emit();
            }),
            this._icon('Ikona', g.icon || 'plug', (v) => {
              g.icon = v;
              this._emit();
            })
          )
        );
        const sw = document.createElement('div');
        sw.className = 'switches';
        sw.appendChild(
          this._switch('Rozwinięta domyślnie', !!g.expanded, (v) => {
            g.expanded = v;
            this._emit();
          })
        );
        sw.appendChild(
          this._switch('Licznik dwukierunkowy', !!(g.bidirectional || g.energy_import), (v) => {
            g.bidirectional = v;
            this._emit();
            this._render();
          })
        );
        card.appendChild(sw);

        if (g.bidirectional || g.energy_import || g.energy_export) {
          card.appendChild(
            this._group(
              this._entity('Energia pobrana', g.energy_import, (v) => {
                g.energy_import = v;
                this._emit();
              }),
              this._entity('Energia oddana', g.energy_export, (v) => {
                g.energy_export = v;
                this._emit();
              })
            )
          );
          card.appendChild(
            this._hint('Grupa dostaje bilans jak węzeł sieci, a linia odwraca się, gdy oddaje energię.')
          );
        }

        const box = document.createElement('div');
        box.className = 'kids';
        devices.forEach((d, di) => box.appendChild(this._deviceCard(d, di, devices, 0)));
        card.appendChild(box);

        card.appendChild(
          this._btn('+ Dodaj urządzenie', () => {
            g.devices = g.devices || [];
            g.devices.push({ name: 'Urządzenie ' + (g.devices.length + 1), icon: 'plug' });
            this._emit();
            this._render();
          }, 'add')
        );

        b.appendChild(card);
      });

      b.appendChild(
        this._btn('+ Dodaj grupę', () => {
          this._config.groups = this._config.groups || [];
          this._config.groups.push({
            name: 'Grupa ' + (this._config.groups.length + 1),
            icon: 'plug',
            devices: []
          });
          this._emit();
          this._render();
        }, 'add')
      );
      b.appendChild(
        this._hint(
          'Grupy są jedynymi połączeniami węzła domu — dodanie urządzenia pogrubia istniejącą linię ' +
            'zamiast rysować nową. Urządzenie z kanałami pokazuje sumę i rozwija je po kliknięciu.'
        )
      );
    });
  }
}

if (!customElements.get('energy-flow-card-editor')) {
  customElements.define('energy-flow-card-editor', EnergyFlowCardEditor);
}

export { EnergyFlowCardEditor };
