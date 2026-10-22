/** Mini : dotacja Czystego Powietrza do pompy ciepła według dochodu na osobę (dom 80–140 kWh/m²·rok). */
import { cpLevel, P, LEVEL_IDX } from '../engine/index';
import { T, zl, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile dotacji do pompy ciepła?', 'How much grant for a heat pump?'),
  cta: T(l, 'Pełny kalkulator Czystego Powietrza', 'The full Czyste Powietrze calculator'),
  inputs: [
    { id: 'osoby', label: T(l, 'Osoby w domu', 'People in the household'), def: 3, max: 20 },
    { id: 'dochod', label: T(l, 'Dochód na osobę miesięcznie', 'Monthly income per person'), def: 2000, unit: 'zł', max: 100000 },
  ],
  run: (v: Record<string, number>) => {
    const r = cpLevel({ persons: v.osoby, monthlyPerPerson: v.dochod, annualIncome: v.dochod * 12, euClass: 'mid' });
    const g = P.cp.grants;
    const k = r.level === 'none' ? null : LEVEL_IDX[r.level];
    const amt = (a: number[]) => (k == null ? zl(0, 0, l) : zl(a[k], 0, l));
    return {
      head: [T(l, 'Pompa powietrze/woda, wyższa klasa', 'Air-to-water pump, higher class'), amt(g.pcAirWaterPlus)] as [string, string],
      rows: [
        [T(l, 'Pompa powietrze/woda', 'Air-to-water pump'), amt(g.pcAirWater)],
        [T(l, 'Gruntowa z dolnym źródłem', 'Ground source with loop'), k == null ? zl(0, 0, l) : zl(g.pcGround[k] + g.groundSource[k], 0, l)],
        [T(l, 'Pompa powietrze/powietrze', 'Air-to-air pump'), amt(g.pcAirAir)],
      ] as Array<[string, string]>,
      note: T(l, 'Dom 80–140 kWh/m²·rok, Twój roczny dochód = dochód na osobę × 12. Kwoty maksymalne NFOŚiGW.', 'House at 80–140 kWh/m²·yr, your yearly income = income per person × 12. NFOŚiGW maximum amounts.'),
    };
  },
});
