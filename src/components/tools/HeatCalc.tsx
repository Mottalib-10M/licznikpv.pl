/**
 * Koszt ogrzewania : pompa ciepła kontra węgiel i gaz, z dotacją Czyste Powietrze i (opcjonalnie)
 * fotowoltaiką, która pokrywa część prądu pompy. Tryby : 'ciepło' (porównanie), 'pompaPv' (pompa + PV),
 * 'cena' (cena pompy i dotacja).
 */
import { useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Shell, Head, Rows, Note, MethodLink, T, zl, num, type L } from '../calc/kit';
import PlaceField, { DEFAULT_PLACE, type Place } from './PlaceField';
import { heatCosts, scopMin, elecGross, gasGrossKwh, hpMonthly, simulate, cpGrant, paybackYears, EU_PRESETS, P, type GasArea, type Level } from '../../lib/engine/index';

export type HeatMode = 'ciepło' | 'pompaPv' | 'cena' | 'gaz' | 'węgiel';
interface Props { lang: L; id: string; mode?: HeatMode; methodHref?: string }

export default function HeatCalc({ lang: l, id, mode = 'ciepło', methodHref }: Props) {
  const [area, setArea] = useState(120);
  const [eu, setEu] = useState<number>(EU_PRESETS.mid);
  const [scop, setScop] = useState(scopMin(true));
  const [gasArea, setGasArea] = useState<GasArea>('WA');
  const [coalPrice, setCoalPrice] = useState(P.coal.pricePerTon2025);
  const [elec, setElec] = useState(Math.round(elecGross() * 100) / 100);
  const [hpPrice, setHpPrice] = useState(mode === 'cena' ? P.cp.grants.pcAirWaterPlus[2] : 0);
  const [level, setLevel] = useState<Level>('basic');
  const [kwp, setKwp] = useState(mode === 'pompaPv' ? 8 : 0);
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE);
  const [houseUse, setHouseUse] = useState(3500);

  const euClass = eu < 80 ? 'low' : eu <= 140 ? 'mid' : 'high';
  const r = useMemo(() => heatCosts({ area, eu, scop, elecPrice: elec, coalPricePerTon: coalPrice, gasArea }), [area, eu, scop, elec, coalPrice, gasArea]);
  const g = useMemo(() => cpGrant({ level, euClass, source: 'pcAirWaterPlus', coInstall: false, thermo: false }), [level, euClass]);
  const hpGrant = level === 'none' ? 0 : (g.lines.find((x) => x.key === 'pcAirWaterPlus')?.amount ?? 0);
  // Pompa + PV : prąd pompy dodany do zużycia domu w sezonie grzewczym ; oszczędność PV liczona na całym zużyciu.
  const pv = useMemo(() => {
    if (mode !== 'pompaPv' || kwp <= 0) return null;
    const extra = hpMonthly(r.hp.kwh);
    const withHp = simulate({ yieldKwhKwp: place.y, voivIdx: place.w, kwp, useKwh: houseUse, extraLoad: extra });
    const without = simulate({ yieldKwhKwp: place.y, voivIdx: place.w, kwp, useKwh: houseUse });
    return { withHp, without };
  }, [mode, kwp, place, houseUse, r.hp.kwh]);

  const gasOpts = (Object.keys(P.gas.areas) as GasArea[]).map((k) => ({ value: k, label: ({ GD: T(l, 'gdański', 'Gdańsk'), PO: T(l, 'poznański', 'Poznań'), TA: T(l, 'tarnowski', 'Tarnów'), WA: T(l, 'warszawski', 'Warsaw'), WR: T(l, 'wrocławski', 'Wrocław'), ZA: T(l, 'zabrzański', 'Zabrze') } as Record<GasArea, string>)[k] }));
  const form = (
    <>
      {mode === 'pompaPv' && <PlaceField id={`${id}-miejsce`} lang={l} value={place} onChange={setPlace} />}
      <NumberField id={`${id}-pow`} lang={l} label={T(l, 'Powierzchnia ogrzewana', 'Heated floor area')} value={area} onChange={setArea} unit="m²" max={2000} />
      <SelectField id={`${id}-eu`} label={T(l, 'Stan domu (EU)', 'House condition (EU)')} value={String(eu)} onChange={(v) => setEu(Number(v))}
        options={[{ value: String(EU_PRESETS.low), label: T(l, `ocieplony, ok. ${EU_PRESETS.low} kWh/m²`, `insulated, ~${EU_PRESETS.low} kWh/m²`) }, { value: String(EU_PRESETS.mid), label: T(l, `częściowo, ok. ${EU_PRESETS.mid} kWh/m²`, `partly, ~${EU_PRESETS.mid} kWh/m²`) }, { value: String(EU_PRESETS.high), label: T(l, `nieocieplony, ok. ${EU_PRESETS.high} kWh/m²`, `uninsulated, ~${EU_PRESETS.high} kWh/m²`) }]} />
      <NumberField id={`${id}-scop`} lang={l} label={T(l, 'SCOP pompy ciepła', 'Heat pump SCOP')} value={scop} onChange={setScop} max={7} decimals={1} className="col-span-2 sm:col-span-1" help={T(l, 'Z karty produktu; domyślnie minimum UE', 'From the product sheet; default EU minimum')} />
      <NumberField id={`${id}-prad`} lang={l} label={T(l, 'Cena prądu brutto', 'Electricity price, gross')} value={elec} onChange={setElec} unit="zł/kWh" max={5} decimals={2} />
      {(mode === 'ciepło' || mode === 'węgiel') && <NumberField id={`${id}-wegiel`} lang={l} label={T(l, 'Cena węgla', 'Coal price')} value={coalPrice} onChange={setCoalPrice} unit="zł/t" max={10000} />}
      {(mode === 'ciepło' || mode === 'gaz' || mode === 'cena') && <SelectField id={`${id}-gaz`} label={T(l, 'Obszar taryfowy gazu (PSG)', 'Gas tariff area (PSG)')} value={gasArea} onChange={(v) => setGasArea(v as GasArea)} options={gasOpts} />}
      {mode === 'cena' && <>
        <NumberField id={`${id}-cenapc`} lang={l} label={T(l, 'Cena pompy z montażem', 'Heat pump price, installed')} value={hpPrice} onChange={setHpPrice} unit="zł" max={300000} />
        <SelectField id={`${id}-poziom`} label={T(l, 'Poziom Czystego Powietrza', 'Czyste Powietrze level')} value={level} onChange={(v) => setLevel(v as Level)}
          options={[{ value: 'none', label: T(l, 'bez dotacji', 'no grant') }, { value: 'basic', label: T(l, 'podstawowy (40 %)', 'basic (40%)') }, { value: 'raised', label: T(l, 'podwyższony (70 %)', 'raised (70%)') }, { value: 'highest', label: T(l, 'najwyższy (100 %)', 'highest (100%)') }]} />
      </>}
      {mode === 'pompaPv' && <>
        <NumberField id={`${id}-kwp`} lang={l} label={T(l, 'Moc fotowoltaiki', 'Solar size')} value={kwp} onChange={setKwp} unit="kWp" max={50} decimals={1} />
        <NumberField id={`${id}-dom`} lang={l} label={T(l, 'Prąd domu bez pompy', 'House power without the pump')} value={houseUse} onChange={setHouseUse} unit="kWh" max={50000} />
      </>}
    </>
  );

  let result;
  if (mode === 'pompaPv' && pv) {
    const gain = pv.withHp.savings - pv.without.savings;
    result = (<>
      <Head label={T(l, 'Pompa ciepła + PV: ogrzewanie rocznie', 'Heat pump + solar: yearly heating cost')} value={zl(Math.max(0, r.hp.cost - gain), 0, l)} sub={T(l, `bez PV ${zl(r.hp.cost, 0, l)} · PV pokrywa ${zl(gain, 0, l)} z prądu pompy`, `without solar ${zl(r.hp.cost, 0, l)} · solar covers ${zl(gain, 0, l)} of the pump’s power`)} />
      <Rows rows={[
        [T(l, 'Ciepło potrzebne rocznie', 'Heat needed per year'), `${num(r.heat, 0, l)} kWh`],
        [T(l, 'Prąd pompy rocznie', 'Heat pump electricity'), `${num(r.hp.kwh, 0, l)} kWh`],
        [T(l, 'Produkcja PV', 'Solar output'), `${num(pv.withHp.prod, 0, l)} kWh`],
        [T(l, 'Zużyte na miejscu z pompą / bez', 'Used on site with / without pump'), `${num(pv.withHp.self + pv.withHp.batt, 0, l)} / ${num(pv.without.self + pv.without.batt, 0, l)} kWh`],
        [T(l, 'Oszczędność PV z pompą / bez', 'Solar saving with / without pump'), `${zl(pv.withHp.savings, 0, l)} / ${zl(pv.without.savings, 0, l)}`, true],
      ]} />
      <Note>{T(l, 'Prąd pompy rozłożony na październik–kwiecień; zimą słońca jest mało, więc większość tej energii przechodzi przez depozyt, który pokrywa tylko część „energia” rachunku. Szacunek.', 'Heat pump power spread over October to April; winter sun is weak, so most of that energy goes through the deposit, which covers only the energy part of the bill. An estimate.')}</Note>
      <MethodLink href={methodHref} lang={l} />
    </>);
  } else if (mode === 'cena') {
    const net = Math.max(0, hpPrice - hpGrant);
    const y = paybackYears(hpPrice, hpGrant, r.saveVsGas);
    result = (<>
      <Head label={T(l, 'Pompa ciepła po dotacji', 'Heat pump after the grant')} value={zl(net, 0, l)} sub={T(l, `dotacja do ${zl(hpGrant, 0, l)} (pompa powietrze/woda, podwyższona klasa)`, `grant up to ${zl(hpGrant, 0, l)} (air-to-water, higher efficiency class)`)} />
      <Rows rows={[
        [T(l, 'Ogrzewanie pompą rocznie', 'Heat pump running cost'), zl(r.hp.cost, 0, l)],
        [T(l, 'Ogrzewanie gazem rocznie', 'Gas running cost'), zl(r.gas.cost, 0, l)],
        [T(l, 'Różnica rocznie', 'Yearly difference'), zl(r.saveVsGas, 0, l)],
        [T(l, 'Zwrot dopłaty względem gazu', 'Payback of your share vs gas'), y == null ? T(l, 'pompa nie jest tańsza w eksploatacji', 'heat pump does not cost less to run') : `${num(y, 1, l)} ${T(l, 'lat', 'years')}`, true],
      ]} />
      <Note>{T(l, `Domyślna cena to pułap kosztów kwalifikowanych pompy powietrze/woda w programie (${zl(P.cp.grants.pcAirWaterPlus[2], 0, l)}), a nie cena rynkowa: wpisz kwotę z oferty.`, `The default price is the programme’s eligible-cost cap for an air-to-water pump (${zl(P.cp.grants.pcAirWaterPlus[2], 0, l)}), not a market price: enter your quote.`)}</Note>
      <MethodLink href={methodHref} lang={l} />
    </>);
  } else {
    const lowest = Math.min(r.hp.cost, r.coal.cost, r.gas.cost);
    const name = lowest === r.hp.cost ? T(l, 'pompa ciepła', 'heat pump') : lowest === r.coal.cost ? T(l, 'węgiel', 'coal') : T(l, 'gaz', 'gas');
    const headVal = mode === 'gaz' ? r.gas.cost : mode === 'węgiel' ? r.coal.cost : r.hp.cost;
    const headLab = mode === 'gaz' ? T(l, 'Ogrzewanie gazem rocznie', 'Gas heating per year') : mode === 'węgiel' ? T(l, 'Ogrzewanie węglem rocznie', 'Coal heating per year') : T(l, 'Ogrzewanie pompą ciepła rocznie', 'Heat pump heating per year');
    result = (<>
      <Head label={headLab} value={zl(headVal, 0, l)} sub={T(l, `Najtaniej przy tych założeniach: ${name}`, `Cheapest with these inputs: ${name}`)} />
      <Rows rows={[
        [T(l, 'Ciepło potrzebne rocznie', 'Heat needed per year'), `${num(r.heat, 0, l)} kWh`],
        [T(l, 'Pompa ciepła', 'Heat pump'), `${zl(r.hp.cost, 0, l)} · ${num(r.hp.kwh, 0, l)} kWh`],
        [T(l, 'Węgiel (kocioł 5. klasy)', 'Coal (class 5 boiler)'), `${zl(r.coal.cost, 0, l)} · ${num(r.coal.tons, 1, l)} t`],
        [T(l, 'Gaz (kocioł kondensacyjny)', 'Gas (condensing boiler)'), `${zl(r.gas.cost, 0, l)} · ${num(r.gas.kwh, 0, l)} kWh`],
        [T(l, 'w tym opłaty stałe gazu', 'of which fixed gas charges'), zl(r.gas.fixed, 0, l)],
        [T(l, 'Pompa taniej niż węgiel / gaz o', 'Heat pump cheaper than coal / gas by'), `${zl(r.saveVsCoal, 0, l)} / ${zl(r.saveVsGas, 0, l)}`, true],
      ]} />
      <Note>{T(l, `Gaz: myORLEN ${num(P.gas.energyNet * 1000, 2, l)} zł/MWh netto + dystrybucja PSG W-3.6 (${num(gasGrossKwh(gasArea), 3, l)} zł/kWh brutto). Węgiel: średnia cena GUS 2025, 24 MJ/kg, sprawność 75 %. Kwota ujemna: pompa droższa. Szacunek.`, `Gas: myORLEN PLN ${num(P.gas.energyNet * 1000, 2, l)}/MWh net + PSG W-3.6 distribution (PLN ${num(gasGrossKwh(gasArea), 3, l)}/kWh gross). Coal: Statistics Poland 2025 average, 24 MJ/kg, 75% efficiency. A negative figure means the pump costs more. An estimate.`)}</Note>
      <MethodLink href={methodHref} lang={l} />
    </>);
  }
  return <Shell id={id} form={form} result={result} />;
}
