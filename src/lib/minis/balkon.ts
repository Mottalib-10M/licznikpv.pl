/** Mini : ile prądu da fotowoltaika balkonowa (panele pionowo na balustradzie albo pod kątem). */
import { MODEL, simulate, type Aspect } from '../engine/index';
import { T, zl, num, pct, type L } from './_kit';
const MOUNT: Record<number, [number, Aspect]> = { 1: [90, '0'], 2: [90, '-45'], 3: [90, '-90'], 4: [35, '0'] };
export default (l: L) => ({
  title: T(l, 'Ile prądu da panel na balkonie?', 'How much power will a balcony panel give?'),
  cta: T(l, 'Pełny kalkulator dla Twojej gminy', 'The full calculator for your municipality'),
  inputs: [
    { id: 'n', label: T(l, 'Liczba paneli', 'Number of panels'), def: 2, max: 10 },
    { id: 'w', label: T(l, 'Moc jednego panelu', 'Power of one panel'), def: 400, unit: 'W', max: 800 },
    { id: 'm', label: T(l, 'Montaż', 'Mounting'), def: 1, options: [
      { value: '1', label: T(l, 'pionowo, balkon na południe', 'vertical, south-facing balcony') },
      { value: '2', label: T(l, 'pionowo, balkon na SE lub SW', 'vertical, SE or SW balcony') },
      { value: '3', label: T(l, 'pionowo, balkon na wschód lub zachód', 'vertical, east or west balcony') },
      { value: '4', label: T(l, 'na stelażu 35°, na południe', 'on a 35° frame, facing south') },
    ] },
  ],
  run: (v: Record<string, number>) => {
    const [tilt, aspect] = MOUNT[v.m] ?? MOUNT[1];
    const kwp = (v.n * v.w) / 1000;
    const r = simulate({ yieldKwhKwp: MODEL.national.mean, voivIdx: 6, kwp, useKwh: 2500, tilt, aspect });
    return {
      head: [T(l, 'Produkcja rocznie', 'Yearly output'), `${num(r.prod, 0, l)} kWh`] as [string, string],
      rows: [
        [T(l, 'Moc instalacji', 'System size'), `${num(kwp, 2, l)} kWp`],
        [T(l, 'Zużyte od razu w domu (2500 kWh/rok)', 'Used at once at home (2,500 kWh/yr)'), pct(r.selfShare, 0, l)],
        [T(l, 'Oszczędność rocznie, po zgłoszeniu do OSD', 'Yearly saving, once notified to the DSO'), zl(r.savings, 0, l)],
      ] as Array<[string, string]>,
      note: T(l, 'Średni uzysk gmin z PVGIS 5.3, współczynniki dla 90° z PVGIS (Warszawa), G11 2026, RCE.', 'Average municipal yield from PVGIS 5.3, 90° factors from PVGIS (Warsaw), G11 2026, RCE.'),
    };
  },
});
