/** Mini : dobór fotowoltaiki off-grid (bez sieci) : moc na najsłabszy miesiąc i pojemność magazynu. */
import { MODEL, dailyPerKwp } from '../engine/index';
import { T, num, type L } from './_kit';
const TILT: Record<number, number> = { 1: 35, 2: 45, 3: 90 };
export default (l: L) => ({
  title: T(l, 'Jaka instalacja off-grid na Twoje zużycie?', 'What off-grid system for your use?'),
  cta: T(l, 'Produkcja w Twojej gminie miesiąc po miesiącu', 'Output in your municipality, month by month'),
  inputs: [
    { id: 'use', label: T(l, 'Zużycie na dobę', 'Use per day'), def: 3, unit: 'kWh', max: 100, decimals: 1 },
    { id: 'days', label: T(l, 'Dni bez słońca do przetrwania', 'Sunless days to ride through'), def: 2, max: 10 },
    { id: 't', label: T(l, 'Nachylenie paneli (na południe)', 'Panel tilt (facing south)'), def: 2, options: [
      { value: '1', label: '35°' }, { value: '2', label: '45°' }, { value: '3', label: T(l, '90° (pionowo)', '90° (vertical)') },
    ] },
  ],
  run: (v: Record<string, number>) => {
    const d = dailyPerKwp(MODEL.national.mean, 6, TILT[v.t] ?? 45, '0');
    const summer = Math.min(...d.slice(3, 9));
    return {
      head: [T(l, 'Moc na cały rok, także grudzień', 'Size for the whole year, December included'), `${num(v.use / Math.min(...d), 1, l)} kWp`] as [string, string],
      rows: [
        [T(l, 'Moc na sezon kwiecień–wrzesień', 'Size for the April–September season'), `${num(v.use / summer, 1, l)} kWp`],
        [T(l, 'Pojemność użytkowa magazynu', 'Usable battery capacity'), `${num(v.use * v.days, 1, l)} kWh`],
        [T(l, '1 kWp na dobę: najsłabszy / najlepszy miesiąc', '1 kWp per day: weakest / best month'), `${num(Math.min(...d), 2, l)} / ${num(Math.max(...d), 1, l)} kWh`],
      ] as Array<[string, string]>,
      note: T(l, 'Średni uzysk gmin z PVGIS 5.3, przeciętna doba miesiąca: pochmurne tygodnie pokrywa magazyn albo agregat.', 'Average municipal yield from PVGIS 5.3, an average day of the month: cloudy weeks need the battery or a generator.'),
    };
  },
});
