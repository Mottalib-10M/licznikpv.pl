/** Mini : ile prądu potrzeba na ciepłą wodę i ile kWp fotowoltaiki to pokrywa (rozporządzenie Dz.U. 2015 poz. 376). */
import { MODEL, cwuKwh, elecGross, sizeFor, dailyPerKwp } from '../engine/index';
import { T, zl, num, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile prądu na ciepłą wodę i ile paneli?', 'How much power for hot water, and how many panels?'),
  cta: T(l, 'Policz oszczędność z podgrzewaniem wody', 'Work out the saving with water heating'),
  inputs: [
    { id: 'area', label: T(l, 'Powierzchnia ogrzewana domu', 'Heated floor area'), def: 120, unit: 'm²', max: 1000 },
    { id: 'cop', label: T(l, 'Sprawność podgrzewacza (grzałka = 1, pompa CWU = COP)', 'Heater efficiency (element = 1, heat pump = COP)'), def: 1, max: 6, decimals: 1 },
  ],
  run: (v: Record<string, number>) => {
    const heat = cwuKwh(v.area), el = heat / Math.max(0.5, v.cop || 1);
    const d = dailyPerKwp(MODEL.national.mean);
    return {
      head: [T(l, 'Prąd na ciepłą wodę rocznie', 'Power for hot water per year'), `${num(el, 0, l)} kWh`] as [string, string],
      rows: [
        [T(l, 'Koszt z sieci, G11 2026', 'Cost from the grid, G11 2026'), zl(el * elecGross(), 0, l)],
        [T(l, 'Moc PV dająca tyle w roku', 'PV size giving that much a year'), `${num(sizeFor(el, MODEL.national.mean), 1, l)} kWp`],
        [T(l, 'Potrzeba na dobę / 1 kWp w lipcu / w grudniu', 'Need per day / 1 kWp in July / in December'), `${num(el / 365, 1, l)} / ${num(d[6], 1, l)} / ${num(d[11], 1, l)} kWh`],
      ] as Array<[string, string]>,
      note: T(l, 'Ciepło: 1,4 l/(m²·dobę), 10 → 55 °C, wzór (61) rozporządzenia o charakterystyce energetycznej. Bez strat zasobnika.', 'Heat: 1.4 l/(m²·day), 10 → 55 °C, formula (61) of the energy performance regulation. Tank losses not included.'),
    };
  },
});
