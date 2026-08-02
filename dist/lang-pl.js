/*! Energy Flow Card — polski */

export default {
  locale: 'pl-PL',

  /* domyślne nazwy węzłów */
  solar_total: 'Fotowoltaika łącznie',
  house: 'Dom',
  grid: 'Sieć',
  battery: 'Akumulator',
  group_n: 'Grupa {n}',
  string_n: 'String {n}',
  device: 'Urządzenie',

  /* stany */
  unavailable: 'niedostępny',
  unavailable_f: 'niedostępna',
  no_data: 'brak',
  no_entity: 'brak encji',

  /* węzły */
  grid_import: 'Pobór z sieci',
  grid_export: 'Oddanie do sieci',
  battery_charging: 'Ładowanie akumulatora',
  battery_discharging: 'Rozładowanie akumulatora',
  self_sufficient: '{n}% samowystarczalności',
  consumers: 'Odbiorniki',
  expand_all: 'Rozwiń wszystko',
  collapse_all: 'Zwiń wszystko',
  tap_to_expand: 'dotknij, aby rozwinąć',
  sum_suffix: 'suma',
  entities_sum: '{n} encji · suma',
  entities_in_group: '{n} encji w grupie',
  entities_channels: '{n} encji · suma kanałów',
  entities_strings: '{n} encji · suma stringów',
  entities_consumers: '{n} encji · suma odbiorników',
  devices_short: 'urz.',

  /* liczebniki: [1, 2-4, 5+] */
  plural_device: ['urządzenie', 'urządzenia', 'urządzeń'],
  plural_active: ['aktywne', 'aktywne', 'aktywnych'],
  plural_group: ['grupie', 'grupach', 'grupach'],
  plural_string: ['string falownika', 'stringi falownika', 'stringów falownika'],
  in_groups: 'w',

  /* podsumowanie dnia */
  unmetered: 'Niezmierzone',
  sum_produced: 'Wyprodukowano',
  sum_consumed: 'Zużył dom',
  sum_self_used: 'Zużyte z PV',
  sum_exported: 'Oddane do sieci',
  sum_imported: 'Pobrane z sieci',
  sum_of_production: '{n}% produkcji',
  sum_of_consumption: '{n}% zużycia',
  sum_self_sufficiency: '{n}% samowystarczalności',

  /* legenda */
  legend_solar: 'Fotowoltaika',
  legend_grid: 'Sieć',
  legend_consumption: 'Zużycie',
  legend_battery: 'Akumulator',
  legend_note: 'grubość linii ∝ moc · prędkość animacji ∝ moc · kropkowana = bezczynna',

  /* dymek */
  tip_now: 'teraz',
  tip_today: 'dzisiaj',

  /* historia */
  range_today: 'Dziś',
  range_yesterday: 'Wczoraj',
  range_7d: '7 dni',
  range_30d: '30 dni',
  range_custom: 'Zakres',
  now: 'teraz',
  pick_range: 'wybierz datę początkową i końcową',
  pick_start: 'wybierz datę początkową',
  pick_end: 'wybierz datę końcową',
  range_set: 'zakres ustawiony · kliknij dzień, aby zacząć od nowa',
  loading: 'Pobieranie historii z rejestratora…',
  load_failed: 'Nie udało się pobrać historii',
  no_history: 'Brak historii dla tego zakresu',
  no_history_pick: 'Wybierz datę początkową i końcową, aby wczytać statystyki.',
  no_history_off: 'Encja jest niedostępna — rejestrator nie ma statystyk dla wybranego okresu.',
  no_history_empty: 'Rejestrator nie zwrócił danych dla wybranych encji.',
  chart_power: 'Moc',
  chart_energy: 'Energia',
  peak: 'szczyt',
  average: 'średnio',
  hourly: 'godzinowo',
  daily: 'dobowo',
  total: 'łącznie',
  today_suffix: 'dzisiaj',
  months: [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'
  ],
  dow: ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'ndz'],

  /* nawigacja po czasie */
  win_from: 'od',
  win_to: 'do',
  win_prev: 'Przesuń wstecz',
  win_next: 'Przesuń naprzód',
  win_zoom_in: 'Zawęź zakres',
  win_zoom_out: 'Poszerz zakres',
  win_min: 'min',
  win_hours: 'godz.',
  win_days: 'dni',

  /* układ */
  layout: '⠿ Układ',
  layout_done: '✓ Gotowe',
  layout_copy: 'Kopiuj YAML',
  layout_reset: 'Reset',
  layout_hint: 'Przeciągnij węzły. Układ zapisuje się w tej przeglądarce.',
  layout_copied: 'Skopiowano — wklej do konfiguracji karty, aby utrwalić na stałe.',
  layout_clipboard_fail: 'Schowek niedostępny — układ wypisany w konsoli (F12).',
  layout_restored: 'Przywrócono układ z konfiguracji karty.',

  /* diagnostyka */
  missing_warning:
    'Te encje nie istnieją w Home Assistancie (sprawdź id w Narzędzia deweloperskie → Stany):'
};
