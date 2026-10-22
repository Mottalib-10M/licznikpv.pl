/** Mini : ile depozytu daje roczna nadwyżka (średnia RCEm z 12 miesięcy × 1,23). */
import { PRICES, P, exportPrices } from '../engine/index';
import { T, zl, num, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Ile depozytu da Twoja nadwyżka?', 'How much deposit will your surplus earn?'),
  cta: T(l, 'Pełny rachunek depozytu miesiąc po miesiącu', 'The full month-by-month deposit calculation'),
  inputs: [{ id: 'kwh', label: T(l, 'Energia oddana rocznie', 'Energy exported per year'), def: 3000, unit: 'kWh', max: 100000 }],
  run: (v: Record<string, number>) => {
    const avgM = exportPrices('rcem').reduce((a, x) => a + x, 0) / 12;
    const avgR = exportPrices('rce').reduce((a, x) => a + x, 0) / 12;
    return {
      head: [T(l, 'Depozyt rocznie (RCE)', 'Yearly deposit (RCE)'), zl((v.kwh * avgR / 1000) * P.netBilling.depositFactor, 0, l)] as [string, string],
      rows: [
        [T(l, 'Depozyt rocznie (RCEm)', 'Yearly deposit (RCEm)'), zl((v.kwh * avgM / 1000) * P.netBilling.depositFactor, 0, l)],
        [T(l, 'Średnia RCEm, 12 miesięcy', '12-month average RCEm'), `${num(avgM, 0, l)} zł/MWh`],
        [T(l, 'Okno cen', 'Price window'), `${PRICES.window[0]} – ${PRICES.window[11]}`],
      ] as Array<[string, string]>,
      note: T(l, 'Średnia prosta; nadwyżka latem jest warta mniej niż średnia. Szacunek.', 'Simple average; summer surplus is worth less than the average. An estimate.'),
    };
  },
});
