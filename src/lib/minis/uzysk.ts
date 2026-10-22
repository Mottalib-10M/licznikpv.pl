/** Mini : ile prądu da instalacja o danej mocy (zakres gmin PVGIS). */
import { MODEL } from '../engine/index';
import { T, num, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile prądu wyprodukuje instalacja?', 'How much power will the system produce?'),
  cta: T(l, 'Produkcja w Twojej gminie miesiąc po miesiącu', 'Output in your municipality, month by month'),
  inputs: [{ id: 'kwp', label: T(l, 'Moc instalacji', 'System size'), def: 6, unit: 'kWp', max: 50, decimals: 1 }],
  run: (v: Record<string, number>) => ({
    head: [T(l, 'Produkcja rocznie, średnio w Polsce', 'Yearly output, Polish average'), `${num(v.kwp * MODEL.national.mean, 0, l)} kWh`] as [string, string],
    rows: [
      [`${T(l, 'Najmniej', 'Lowest')} (${MODEL.national.minN})`, `${num(v.kwp * MODEL.national.min, 0, l)} kWh`],
      [`${T(l, 'Najwięcej', 'Highest')} (${MODEL.national.maxN})`, `${num(v.kwp * MODEL.national.max, 0, l)} kWh`],
      [T(l, 'Dziennie w czerwcu / w grudniu', 'Per day in June / December'), `${num(v.kwp * MODEL.national.mean * MODEL.voivodeships[6].shape[5] / 30, 1, l)} / ${num(v.kwp * MODEL.national.mean * MODEL.voivodeships[6].shape[11] / 31, 1, l)} kWh`],
    ] as Array<[string, string]>,
    note: T(l, 'Dach 35° na południe, straty 14 %, PVGIS 5.3 (SARAH3).', 'Roof at 35° facing south, 14% losses, PVGIS 5.3 (SARAH3).'),
  }),
});
