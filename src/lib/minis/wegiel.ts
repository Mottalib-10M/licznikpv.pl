/** Mini : ile ciepła daje tona węgla i ile kosztowałoby to samo z pompy ciepła. */
import { P, coalKwhPerKg, elecGross, scopMin } from '../engine/index';
import { T, zl, num, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile kosztuje to samo ciepło z pompy?', 'What would the same heat cost from a heat pump?'),
  cta: T(l, 'Pełne porównanie: pompa, węgiel, gaz', 'Full comparison: heat pump, coal, gas'),
  inputs: [{ id: 't', label: T(l, 'Węgiel spalany rocznie', 'Coal burnt per year'), def: 3, unit: 't', max: 50, decimals: 1 }],
  run: (v: Record<string, number>) => {
    const heat = v.t * 1000 * coalKwhPerKg() * P.coal.boilerEff;
    const hp = heat / scopMin(true) * elecGross();
    return {
      head: [T(l, 'Pompa ciepła (SCOP minimum UE)', 'Heat pump (EU minimum SCOP)'), zl(hp, 0, l)] as [string, string],
      rows: [
        [T(l, 'Węgiel po cenie GUS 2025', 'Coal at the 2025 GUS price'), zl(v.t * P.coal.pricePerTon2025, 0, l)],
        [T(l, 'Ciepło użyteczne', 'Useful heat'), `${num(heat, 0, l)} kWh`],
      ] as Array<[string, string]>,
      note: T(l, '24 MJ/kg, kocioł 75 %, prąd G11 ok. 1,09 zł/kWh brutto.', '24 MJ/kg, 75% boiler, G11 power about PLN 1.09/kWh gross.'),
    };
  },
});
