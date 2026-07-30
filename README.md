# Energy Flow Card

Schematyczna karta rozpływu energii dla Home Assistanta — fotowoltaika, sieć, akumulator i grupy
odbiorników na jednym ekranie, z animowanymi połączeniami, których grubość i prędkość zależą od mocy.

Port projektu „Energy Flow Card" 1:1 na natywną kartę Lovelace. Bez zależności, bez kroku budowania,
interfejs w całości po polsku.

---

## Kluczowe cechy

- **Grupy są jedynymi połączeniami węzła domu.** Dodanie urządzenia pogrubia istniejącą linię zamiast
  rysować nową — hub nigdy nie zyskuje nowych szprych, niezależnie od liczby urządzeń.
- **Grupy zwijane w węzły zbiorcze.** Zwinięta grupa to jeden węzeł z sumą; kliknięcie rozwija
  wewnętrzną listę urządzeń, bez rysowania nowych łączników.
- **Automatyczny reflow kolumn.** Szyna odbiorników to siatka `auto-fill` o minimum 190 px. Przy 1600 px
  daje trzy kolumny, przy 400 px jedną — 40 urządzeń mieści się na jednym ekranie.
- **Przestawienie topologii na mobile.** Poniżej 720 px karta staje się pionowym kręgosłupem
  (PV → dom → sieć → akumulator → odbiorniki), a stringi falowników składają się do zwijanej listy
  w węźle fotowoltaiki. Łączniki są przeliczane z realnie zmierzonych pudełek DOM.
- **Ciche degradowanie stanów.** Poniżej progu bezczynności linia staje się kropkowana i nieruchoma;
  encje niedostępne przygasają, ich obramowanie zmienia się na przerywane, a wartość zastępuje słowo
  „niedostępny" zamiast zamrożonego odczytu.
- **Okno historii** po kliknięciu dowolnego węzła: wykres mocy z rejestratora, słupki energii ze
  statystyk długoterminowych, zakresy Dziś / Wczoraj / 7 dni / 30 dni oraz własny zakres z kalendarzem.
- **Wizualny edytor** w Lovelace — cała konfiguracja przez `ha-entity-picker`, bez pisania YAML-a.

## Instalacja

### HACS (zalecane)

1. HACS → Frontend → menu ⋮ → **Custom repositories**.
2. Repozytorium: `https://github.com/adek1990/energy-flow-card`, kategoria: **Lovelace**.
3. Zainstaluj **Energy Flow Card** i odśwież przeglądarkę (Ctrl+F5).

### Ręcznie

1. Skopiuj `dist/energy-flow-card.js` i `dist/energy-flow-card-editor.js` do
   `/config/www/energy-flow-card/`.
2. Ustawienia → Pulpity nawigacyjne → ⋮ → Zasoby → **Dodaj zasób**:
   - URL: `/local/energy-flow-card/energy-flow-card.js`
   - Typ: **Moduł JavaScript**

> Oba pliki muszą leżeć obok siebie — karta ładuje edytor leniwie, ścieżką względną.

## Szybki start

```yaml
type: custom:energy-flow-card
title: Przepływ energii
solar:
  strings:
    - name: Falownik 1 · wschód
      power: sensor.inverter_1_power
      energy: sensor.inverter_1_energy_today
grid:
  power: sensor.grid_power
  energy_import: sensor.grid_import_today
  energy_export: sensor.grid_export_today
battery:
  power: sensor.battery_power
  soc: sensor.battery_soc
  energy: sensor.battery_energy_today
groups:
  - name: Klimat
    icon: climate
    expanded: true
    devices:
      - name: Pompa ciepła
        power: sensor.heat_pump_power
        energy: sensor.heat_pump_energy_today
```

## Konfiguracja

### Poziom karty

| Opcja            | Typ     | Domyślnie                        | Opis |
|------------------|---------|----------------------------------|------|
| `type`           | string  | —                                | `custom:energy-flow-card` |
| `title`          | string  | `Przepływ energii`               | Tytuł nad kartą; `''` ukrywa nagłówek |
| `kicker`         | string  | `Home Assistant · karta niestandardowa` | Mały nadtytuł |
| `subtitle`       | string  | —                                | Opis pod tytułem |
| `theme_mode`     | string  | `auto`                           | `auto` \| `dark` \| `light` |
| `animate`        | bool    | `true`                           | Animacja przepływu na liniach |
| `legend`         | bool    | `true`                           | Legenda kolorów pod kartą |
| `history`        | bool    | `true`                           | Okno historii po kliknięciu węzła (`false` → standardowe „więcej informacji") |
| `idle_threshold` | liczba  | `15`                             | Próg w W, poniżej którego węzeł i linia są traktowane jako bezczynne |
| `fonts`          | bool    | `true`                           | Doładowanie IBM Plex Sans/Mono z Google Fonts |

### `solar`

Sekcja pojawia się tylko wtedy, gdy jest co najmniej jeden string.

| Opcja     | Opis |
|-----------|------|
| `name`    | Nazwa węzła zbiorczego (domyślnie `Fotowoltaika łącznie`) |
| `power`   | Encja mocy łącznej; bez niej karta sumuje stringi |
| `energy`  | Encja energii dziennej łącznej; bez niej karta sumuje stringi |
| `strings` | Lista: `name`, `icon`, `power`, `energy` |

### `grid`

| Opcja           | Opis |
|-----------------|------|
| `power`         | Jedna encja ze znakiem: **+ pobór**, **− oddanie** |
| `power_import` / `power_export` | Alternatywa dla `power` — dwie osobne encje, karta liczy różnicę |
| `energy_import` / `energy_export` | Energia dobowa pokazywana jako `↓ …  ↑ …` |
| `invert`        | Odwraca znak `power`, gdy falownik raportuje odwrotnie |

### `battery`

| Opcja    | Opis |
|----------|------|
| `power`  | **+ ładowanie**, **− rozładowanie** |
| `soc`    | Stan naładowania w % — pasek pod wartością |
| `energy` | Energia dobowa |
| `invert` | Odwraca znak `power` |

### `house`

| Opcja    | Opis |
|----------|------|
| `name`   | Nazwa węzła centralnego (domyślnie `Dom`) |
| `power`  | Moc całkowita; bez niej suma wszystkich urządzeń z grup |
| `energy` | Energia dobowa; bez niej suma z grup |

Wskaźnik samowystarczalności liczy się jako `(moc domu − pobór z sieci) / moc domu`.

### `groups`

```yaml
groups:
  - name: Kuchnia
    icon: stove
    expanded: false        # rozwinięta po załadowaniu karty
    devices:
      - name: Lodówka
        icon: stove
        power: sensor.fridge_power
        energy: sensor.fridge_energy_today
```

Encja `energy` jest opcjonalna — bez niej urządzenie pokazuje `—` w kolumnie energii, a słupki
w oknie historii są liczone przez całkowanie mocy. Urządzenie z samą encją `energy` nie jest
traktowane jako awaria: pokazuje `—` w kolumnie mocy i nie jest wygaszane.

### Listy encji

Każde pole encji (`power`, `energy`, `energy_import`, …) przyjmuje pojedyncze id albo listę — wtedy
wartości są sumowane, a encje niedostępne pomijane:

```yaml
- name: Gniazdka Sonoff
  energy:
    - sensor.sonoff_dual_r3_1_energy_1_daily
    - sensor.sonoff_dual_r3_1_energy_2_daily
```

Listy edytuje się w widoku YAML — edytor GUI pokazuje je tylko do odczytu, żeby ich nie nadpisać.

### Odwracanie znaku

`invert: true` działa w `grid`, `battery`, `house`, `solar` (dziedziczone przez stringi) oraz
w pojedynczej grupie i urządzeniu. Przydaje się np. przy integracji Fronius, która raportuje zużycie
domu wartością ujemną.

### Migracja z `sunsynk-power-flow-card`

Gotowy przykład portu (Fronius Symo + Smart Meter + Sonoff/Shelly) leży w
[examples/fronius-sunsynk-port.yaml](examples/fronius-sunsynk-port.yaml).

| sunsynk-power-flow-card | Energy Flow Card |
|---|---|
| `pv1_power_186`, `pv2_power_187` | `solar.strings[].power` |
| `pv_total`, `day_pv_energy_108` | `solar.power`, `solar.energy` |
| `grid_ct_power_172` + `grid.invert_power` | `grid.power` + `grid.invert` |
| `day_grid_import_76` / `day_grid_export_77` | `grid.energy_import` / `grid.energy_export` |
| `essential_power`, `day_load_energy_84` | `house.power`, `house.energy` |
| `essential_load1..4` + `load1_name` | `groups[].devices[]` (lista encji dozwolona) |
| `dynamic_line_width`, `animation_speed` | zawsze dynamiczne — pochodne mocy |
| `decimal_places`, `large_font` | stałe formatowanie wg polskiej lokalizacji |
| `card_height`, `card_width`, `wide` | `grid_options` Home Assistanta |
| `autarky: power` | wskaźnik samowystarczalności w węźle domu |

### Dostępne ikony

`sun` · `panel` · `house` · `tower` · `battery` · `climate` · `stove` · `washer` · `car` · `bulb` ·
`tv` · `water` · `server` · `plug` · `fan`

## Jednostki

Karta normalizuje jednostki z `unit_of_measurement`:

- moc: `mW`, `W`, `kW`, `MW` → wyświetlane jako W / kW / MW,
- energia: `Wh`, `kWh`, `MWh`, `GWh` → wyświetlane jako kWh / MWh.

Liczby są formatowane wg polskiej lokalizacji (przecinek dziesiętny).

## Okno historii

- **Wykres mocy** — `history/history_during_period`, próbkowanie schodkowe do wspólnej siatki czasu.
  Dla węzłów zbiorczych (dom, grupa, fotowoltaika łącznie) serie składowych są sumowane.
- **Słupki energii** — `recorder/statistics_during_period` (`period: hour` dla jednego dnia, `day` dla
  dłuższych zakresów, `types: ['change']`). Jeśli encja nie ma statystyk długoterminowych, słupki są
  liczone przez całkowanie przebiegu mocy.
- Zakres własny: kalendarz z polskimi nazwami miesięcy, tydzień od poniedziałku, wybór dwóch dat.

Okno jest wbudowane w kartę i nie wymaga `browser_mod`; jeśli używasz `browser_mod`, karta działa
normalnie także w jego popupach.

## Rozwiązywanie problemów

| Objaw | Przyczyna |
|-------|-----------|
| Węzeł pokazuje „niedostępny" | Encja nie istnieje, jest `unavailable`/`unknown` albo jej stan nie jest liczbą |
| Brak sekcji fotowoltaiki / sieci / akumulatora | Nie skonfigurowano żadnej encji w danej sekcji — węzeł jest ukrywany celowo |
| „Brak historii dla tego zakresu" | Rejestrator nie ma danych dla wybranych encji i okresu (np. krótkie `purge_keep_days`) |
| Brak edytora GUI | `energy-flow-card-editor.js` nie leży obok `energy-flow-card.js` |
| Linie nie trafiają w węzły | Karta mierzy pudełka DOM — przeładuj widok po zmianie układu (Ctrl+F5) |

## Testy

W repozytorium jest test dymny uruchamiany w Node z jsdom — sprawdza model danych, normalizację
jednostek, polskie odmiany, generowanie łączników SVG, tryb mobilny, okno historii i edytor:

```bash
npm install
npm test
```

## Licencja

MIT
