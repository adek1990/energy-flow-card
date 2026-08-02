/*! Energy Flow Card — English */

export default {
  locale: 'en-GB',

  /* default node names */
  solar_total: 'Solar total',
  house: 'House',
  grid: 'Grid',
  battery: 'Battery',
  group_n: 'Group {n}',
  string_n: 'String {n}',
  device: 'Device',

  /* states */
  unavailable: 'unavailable',
  unavailable_f: 'unavailable',
  no_data: 'n/a',
  no_entity: 'no entity',

  /* nodes */
  grid_import: 'Grid import',
  grid_export: 'Grid export',
  battery_charging: 'Battery charging',
  battery_discharging: 'Battery discharging',
  self_sufficient: '{n}% self-sufficient',
  consumers: 'Consumers',
  expand_all: 'Expand all',
  collapse_all: 'Collapse all',
  tap_to_expand: 'tap to expand',
  sum_suffix: 'total',
  entities_sum: '{n} entities · sum',
  entities_in_group: '{n} entities in group',
  entities_channels: '{n} entities · channel sum',
  entities_strings: '{n} entities · string sum',
  entities_consumers: '{n} entities · consumer sum',
  devices_short: 'dev.',

  /* plurals: [one, few, many] — English uses one/other, so few = many */
  plural_device: ['device', 'devices', 'devices'],
  plural_active: ['active', 'active', 'active'],
  plural_group: ['group', 'groups', 'groups'],
  plural_string: ['inverter string', 'inverter strings', 'inverter strings'],
  in_groups: 'in',

  /* daily summary */
  unmetered: 'Unmetered',
  sum_produced: 'Produced',
  sum_consumed: 'House used',
  sum_self_used: 'Used from solar',
  sum_exported: 'Exported',
  sum_imported: 'Imported',
  sum_of_production: '{n}% of production',
  sum_of_consumption: '{n}% of consumption',
  sum_self_sufficiency: '{n}% self-sufficient',

  /* legend */
  legend_solar: 'Solar',
  legend_grid: 'Grid',
  legend_consumption: 'Consumption',
  legend_battery: 'Battery',
  legend_note: 'line width ∝ power · dash speed ∝ power · dotted = idle',

  /* tooltip */
  tip_now: 'now',
  tip_today: 'today',

  /* history */
  range_today: 'Today',
  range_yesterday: 'Yesterday',
  range_7d: '7 days',
  range_30d: '30 days',
  range_custom: 'Custom',
  now: 'now',
  pick_range: 'pick a start and end date',
  pick_start: 'select start date',
  pick_end: 'select end date',
  range_set: 'range set · click a day to restart',
  loading: 'Fetching recorder history…',
  load_failed: 'Could not load history',
  no_history: 'No history for this range',
  no_history_pick: 'Pick both a start and an end date to load statistics.',
  no_history_off: 'This entity is unavailable — the recorder has no statistics for the selected period.',
  no_history_empty: 'The recorder returned no data for the selected entities.',
  chart_power: 'Power',
  chart_energy: 'Energy',
  peak: 'peak',
  average: 'avg',
  hourly: 'hourly',
  daily: 'daily',
  total: 'total',
  today_suffix: 'today',
  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  dow: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

  /* time navigation */
  win_from: 'from',
  win_to: 'to',
  win_prev: 'Shift back',
  win_next: 'Shift forward',
  win_zoom_in: 'Zoom in',
  win_zoom_out: 'Zoom out',
  win_min: 'min',
  win_hours: 'h',
  win_days: 'days',

  /* layout */
  layout: '⠿ Layout',
  layout_done: '✓ Done',
  layout_copy: 'Copy YAML',
  layout_reset: 'Reset',
  layout_hint: 'Drag the nodes. The layout is saved in this browser.',
  layout_copied: 'Copied — paste into the card config to make it permanent.',
  layout_clipboard_fail: 'Clipboard unavailable — layout printed to the console (F12).',
  layout_restored: 'Restored the layout from the card config.',

  /* diagnostics */
  missing_warning:
    'These entities do not exist in Home Assistant (check the ids in Developer tools → States):'
};
