/** Mini : poziom Czystego Powietrza z dochodu na osobę. */
import { cpLevel } from '../engine/index';
import { T, zl, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Który poziom Czystego Powietrza?', 'Which Czyste Powietrze level?'),
  cta: T(l, 'Pełny kalkulator dotacji', 'The full grant calculator'),
  inputs: [
    { id: 'osoby', label: T(l, 'Osoby w domu', 'People in the household'), def: 3, max: 20 },
    { id: 'dochod', label: T(l, 'Dochód na osobę miesięcznie', 'Monthly income per person'), def: 2000, unit: 'zł', max: 100000 },
  ],
  run: (v: Record<string, number>) => {
    const r = cpLevel({ persons: v.osoby, monthlyPerPerson: v.dochod, annualIncome: v.dochod * 12, euClass: 'high' });
    const name = { none: T(l, 'brak', 'none'), basic: T(l, 'podstawowy (40 %)', 'basic (40%)'), raised: T(l, 'podwyższony (70 %)', 'raised (70%)'), highest: T(l, 'najwyższy (100 %)', 'highest (100%)') }[r.level];
    return {
      head: [T(l, 'Poziom dofinansowania', 'Grant level'), name] as [string, string],
      rows: [[T(l, 'Dochód gospodarstwa rocznie', 'Household income per year'), zl(v.dochod * 12 * Math.max(1, v.osoby), 0, l)]] as Array<[string, string]>,
      note: T(l, 'Zakłada dom powyżej 140 kWh/m²·rok i Twój roczny dochód = dochód na osobę × 12.', 'Assumes a house above 140 kWh/m²·yr and your yearly income = income per person × 12.'),
    };
  },
});
