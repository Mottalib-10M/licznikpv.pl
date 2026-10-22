/** Mini : jaka moc PV dla danego zużycia (średni uzysk gmin z PVGIS). */
import { MODEL, sizeFor } from '../engine/index';
import { T, num, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Jaka moc instalacji do Twojego zużycia?', 'What system size for your consumption?'),
  cta: T(l, 'Policz oszczędność dla swojej gminy', 'Work out the saving for your municipality'),
  inputs: [{ id: 'use', label: T(l, 'Zużycie prądu rocznie', 'Yearly electricity use'), def: 4000, unit: 'kWh', max: 100000 }],
  run: (v: Record<string, number>) => {
    const y = MODEL.national.mean;
    return {
      head: [T(l, 'Moc pokrywająca roczne zużycie', 'Size matching yearly use'), `${num(sizeFor(v.use, y), 1, l)} kWp`] as [string, string],
      rows: [
        [T(l, 'Średni uzysk w Polsce (PVGIS)', 'Average yield in Poland (PVGIS)'), `${num(y, 0, l)} kWh/kWp`],
        [T(l, 'Najsłabsza gmina', 'Weakest municipality'), `${num(sizeFor(v.use, MODEL.national.min), 1, l)} kWp`],
        [T(l, 'Najlepsza gmina', 'Best municipality'), `${num(sizeFor(v.use, MODEL.national.max), 1, l)} kWp`],
      ] as Array<[string, string]>,
      note: T(l, 'W net-billingu instalacja „na całe zużycie” rzadko opłaca się najbardziej: liczy się autokonsumpcja.', 'Under net-billing, sizing to cover all use is rarely the best deal: self-consumption is what pays.'),
    };
  },
});
