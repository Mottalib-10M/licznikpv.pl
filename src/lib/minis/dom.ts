/** Mini : jaka fotowoltaika na dom o danej powierzchni : zużycie z rachunku + ciepła woda + pompa ciepła. */
import { MODEL, cwuKwh, heatCosts, hpMonthly, simulate, sizeFor, maxPriceFor, EU_PRESETS } from '../engine/index';
import { T, zl, num, type L } from './_kit';
export default (l: L) => ({
  title: T(l, 'Jaka fotowoltaika na Twój dom?', 'What solar system for your house?'),
  cta: T(l, 'Sprawdź tę moc w swojej gminie', 'Check this size in your municipality'),
  inputs: [
    { id: 'area', label: T(l, 'Powierzchnia ogrzewana', 'Heated floor area'), def: 150, unit: 'm²', max: 1000 },
    { id: 'base', label: T(l, 'Zużycie z rachunku (bez ogrzewania)', 'Use on your bill (no heating)'), def: 3000, unit: 'kWh', max: 100000 },
    { id: 'hp', label: T(l, 'Ogrzewanie', 'Heating'), def: 0, options: [
      { value: '0', label: T(l, 'nie prądem', 'not electric') },
      { value: '1', label: T(l, 'pompa ciepła (planowana)', 'heat pump (planned)') },
      { value: '2', label: T(l, 'pompa ciepła + woda grzałką', 'heat pump + water by element') },
    ] },
  ],
  run: (v: Record<string, number>) => {
    const pump = v.hp >= 1 ? heatCosts({ area: v.area, eu: EU_PRESETS.mid }).hp.kwh : 0;
    const water = v.hp === 2 ? cwuKwh(v.area) : 0;
    const total = v.base + pump + water;
    const kwp = Math.max(1, sizeFor(total, MODEL.national.mean, 0.9));
    const r = simulate({ yieldKwhKwp: MODEL.national.mean, voivIdx: 6, kwp, useKwh: v.base + water, extraLoad: hpMonthly(pump) });
    return {
      head: [T(l, 'Moc instalacji', 'System size'), `${num(kwp, 1, l)} kWp`] as [string, string],
      rows: [
        [T(l, 'Zużycie razem rocznie', 'Total yearly use'), `${num(total, 0, l)} kWh`],
        [T(l, 'W tym pompa / ciepła woda', 'Of which pump / hot water'), `${num(pump, 0, l)} / ${num(water, 0, l)} kWh`],
        [T(l, 'Cena opłacalna (zwrot w 10 lat)', 'Price that pays back in 10 years'), zl(maxPriceFor(10, r.savings), 0, l)],
      ] as Array<[string, string]>,
      note: T(l, 'Produkcja = 90 % zużycia, średni uzysk gmin PVGIS. Pompa: dom 110 kWh/m²·rok, minimalny SCOP z rozp. UE 813/2013.', 'Output = 90% of use, average PVGIS municipal yield. Pump: house at 110 kWh/m²·yr, minimum SCOP under EU Reg. 813/2013.'),
    };
  },
});
