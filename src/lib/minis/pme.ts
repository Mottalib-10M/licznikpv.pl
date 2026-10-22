/** Mini : dotacja PME do magazynu energii. */
import { pmeGrant, P } from '../engine/index';
import { T, zl, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile dopłaty do magazynu energii?', 'How much grant for a home battery?'),
  cta: T(l, 'Magazyn i oszczędność w Twojej gminie', 'Battery and saving in your municipality'),
  inputs: [
    { id: 'kwh', label: T(l, 'Pojemność', 'Capacity'), def: 10, unit: 'kWh', max: 100, decimals: 1 },
    { id: 'cost', label: T(l, 'Cena z montażem', 'Installed price'), def: 25000, unit: 'zł', max: 300000 },
  ],
  run: (v: Record<string, number>) => {
    const g = pmeGrant({ kwh: v.kwh, cost: v.cost });
    return {
      head: [T(l, 'Dotacja PME (net-billing)', 'PME grant (net-billing)'), g.eligible ? zl(g.battery, 0, l) : T(l, 'nie przysługuje', 'not eligible')] as [string, string],
      rows: [
        [T(l, 'Do zapłaty po dotacji', 'Left to pay'), zl(Math.max(0, v.cost - g.battery), 0, l)],
        [T(l, 'Limit na magazyn', 'Cap per battery'), zl(P.pme.capNetBilling, 0, l)],
      ] as Array<[string, string]>,
      note: T(l, 'Minimum 10 kWh, cena do 3000 zł/kWh bez falownika.', 'At least 10 kWh, price up to PLN 3,000/kWh excluding the inverter.'),
    };
  },
});
