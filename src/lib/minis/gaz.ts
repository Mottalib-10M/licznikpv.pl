/** Mini : roczny koszt gazu W-3.6 z rachunku w kWh. */
import { P, gasGrossKwh, gasFixedYear } from '../engine/index';
import { T, zl, num, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile kosztuje gaz do ogrzewania w 2026 r.?', 'What does heating gas cost in 2026?'),
  cta: T(l, 'Porównaj z pompą ciepła i węglem', 'Compare with a heat pump and coal'),
  inputs: [{ id: 'kwh', label: T(l, 'Zużycie gazu rocznie', 'Yearly gas use'), def: 15000, unit: 'kWh', max: 500000 }],
  run: (v: Record<string, number>) => ({
    head: [T(l, 'Rocznie, obszar warszawski', 'Per year, Warsaw area'), zl(v.kwh * gasGrossKwh('WA') + gasFixedYear('WA'), 0, l)] as [string, string],
    rows: [
      [T(l, 'Obszar zabrzański', 'Zabrze area'), zl(v.kwh * gasGrossKwh('ZA') + gasFixedYear('ZA'), 0, l)],
      [T(l, 'Paliwo myORLEN', 'myORLEN fuel price'), `${num(P.gas.energyNet * 1000, 2, l)} zł/MWh ${T(l, 'netto', 'net')}`],
    ] as Array<[string, string]>,
    note: T(l, 'Grupa W-3.6, z VAT, z opłatą stałą PSG, bez abonamentu sprzedawcy.', 'Group W-3.6, VAT included, with the PSG fixed charge, without the seller’s subscription fee.'),
  }),
});
