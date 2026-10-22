/** Mini : zwrot nadpłaty z depozytu (art. 4 ust. 11a : 20 % RCEm, 30 % RCE). */
import { P } from '../engine/index';
import { T, zl, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile wróci na konto z niewykorzystanego depozytu?', 'How much unused deposit comes back as cash?'),
  cta: T(l, 'Policz depozyt dla swojej instalacji', 'Work out the deposit for your system'),
  inputs: [
    { id: 'dep', label: T(l, 'Depozyt za miesiąc', 'Deposit for the month'), def: 300, unit: 'zł', max: 100000 },
    { id: 'used', label: T(l, 'Wykorzystane w 12 miesięcy', 'Used within 12 months'), def: 150, unit: 'zł', max: 100000 },
  ],
  run: (v: Record<string, number>) => {
    const unused = Math.max(0, v.dep - Math.min(v.used, v.dep));
    const value = v.dep / P.netBilling.depositFactor;
    const rce = Math.min(unused, value * P.netBilling.refundCapRCE), rcem = Math.min(unused, value * P.netBilling.refundCapRCEm);
    return {
      head: [T(l, 'Zwrot w systemie RCE (do 30 %)', 'Refund on RCE (up to 30%)'), zl(rce, 0, l)] as [string, string],
      rows: [
        [T(l, 'Zwrot w systemie RCEm (do 20 %)', 'Refund on RCEm (up to 20%)'), zl(rcem, 0, l)],
        [T(l, 'Niewykorzystane', 'Unused'), zl(unused, 0, l)],
        [T(l, 'Przepada (RCE)', 'Forfeited (RCE)'), zl(unused - rce, 0, l)],
      ] as Array<[string, string]>,
      note: T(l, 'Limit liczony od wartości energii oddanej w danym miesiącu, bez współczynnika 1,23 (nasza lektura art. 4 ust. 11a).', 'Cap computed on the value of energy exported that month, without the 1.23 factor (our reading of Art. 4(11a)).'),
    };
  },
});
