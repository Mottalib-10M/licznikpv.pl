/** Mini : lata zwrotu z ceny, dotacji i oszczędności. */
import { paybackYears } from '../engine/index';
import { T, zl, num, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Po ilu latach się zwróci?', 'How many years to pay back?'),
  cta: T(l, 'Policz oszczędność dla swojego dachu', 'Work out the saving for your roof'),
  inputs: [
    { id: 'cost', label: T(l, 'Cena instalacji', 'System price'), def: 24000, unit: 'zł', max: 1000000 },
    { id: 'save', label: T(l, 'Oszczędność rocznie', 'Yearly saving'), def: 3000, unit: 'zł', max: 100000 },
  ],
  run: (v: Record<string, number>) => {
    const y = paybackYears(v.cost, 0, v.save);
    return {
      head: [T(l, 'Zwrot inwestycji', 'Payback'), y == null ? '–' : `${num(y, 1, l)} ${T(l, 'lat', 'years')}`] as [string, string],
      rows: [
        [T(l, 'Zysk po 15 latach net-billingu', 'Gain after the 15 net-billing years'), zl(v.save * 15 - v.cost, 0, l)],
        [T(l, 'Cena dla zwrotu w 8 lat', 'Price for an 8-year payback'), zl(v.save * 8, 0, l)],
      ] as Array<[string, string]>,
      note: T(l, 'Bez zmian cen prądu i bez spadku sprawności paneli.', 'No change in power prices and no panel degradation assumed.'),
    };
  },
});
