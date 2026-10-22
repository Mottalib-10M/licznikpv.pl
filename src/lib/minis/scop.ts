/** Mini : koszt 1 kWh ciepła według SCOP i ceny prądu. */
import { P, elecGross, gasGrossKwh, coalKwhPerKg } from '../engine/index';
import { T, zl, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile kosztuje 1 kWh ciepła?', 'What does 1 kWh of heat cost?'),
  cta: T(l, 'Koszt ogrzewania całego domu', 'Heating cost for the whole house'),
  inputs: [{ id: 'scop', label: 'SCOP', def: 3.5, max: 7, decimals: 1 }],
  run: (v: Record<string, number>) => ({
    head: [T(l, 'Pompa ciepła, za 1 kWh ciepła', 'Heat pump, per kWh of heat'), zl(elecGross() / Math.max(v.scop, 0.1), 3, l)] as [string, string],
    rows: [
      [T(l, 'Gaz W-3.6 (Warszawa), kocioł 86 %', 'Gas W-3.6 (Warsaw), 86% boiler'), zl(gasGrossKwh('WA') / P.gas.boilerEff, 3, l)],
      [T(l, 'Węgiel, kocioł 75 %', 'Coal, 75% boiler'), zl(P.coal.pricePerTon2025 / 1000 / coalKwhPerKg() / P.coal.boilerEff, 3, l)],
    ] as Array<[string, string]>,
    note: T(l, 'Bez opłat stałych za gaz.', 'Fixed gas charges excluded.'),
  }),
});
