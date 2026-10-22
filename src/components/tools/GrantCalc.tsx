/**
 * Dotacje : Czyste Powietrze (poziom według dochodu i kwoty według źródła ciepła) oraz
 * Przydomowe Magazyny Energii (magazyn prądu i ciepła). Tryby : 'cp', 'progi', 'pme'.
 */
import { useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Shell, Head, Rows, Note, MethodLink, T, zl, num, type L } from '../calc/kit';
import { cpLevel, cpGrant, pmeGrant, P, type HeatSource, type EuClass, type Level } from '../../lib/engine/index';

export type GrantMode = 'cp' | 'progi' | 'pme';
interface Props { lang: L; id: string; mode?: GrantMode; methodHref?: string }

const LEVEL_NAME = (l: L): Record<Level, string> => ({ none: T(l, 'brak dotacji (dochód za wysoki)', 'no grant (income too high)'), basic: T(l, 'podstawowy, do 40 %', 'basic, up to 40%'), raised: T(l, 'podwyższony, do 70 %', 'raised, up to 70%'), highest: T(l, 'najwyższy, do 100 %', 'highest, up to 100%') });
const LINE_NAME = (l: L): Record<string, string> => ({
  audit: T(l, 'Audyt energetyczny', 'Energy audit'), certificate: T(l, 'Świadectwo charakterystyki', 'Energy certificate'),
  pcAirWater: T(l, 'Pompa ciepła powietrze/woda', 'Air-to-water heat pump'), pcAirWaterPlus: T(l, 'Pompa powietrze/woda, podwyższona klasa', 'Air-to-water pump, higher class'),
  pcAirAir: T(l, 'Pompa ciepła powietrze/powietrze', 'Air-to-air heat pump'), pcGround: T(l, 'Gruntowa pompa ciepła', 'Ground-source heat pump'), groundSource: T(l, 'Dolne źródło (gruntowa)', 'Ground loop'),
  districtHeat: T(l, 'Sieć ciepłownicza', 'District heating'), biomass: T(l, 'Kocioł na drewno lub pellet', 'Wood or pellet boiler'), electric: T(l, 'Ogrzewanie elektryczne', 'Electric heating'),
  coInstall: T(l, 'Instalacja c.o./c.w.u.', 'Heating and hot-water pipework'), thermo: T(l, 'Termomodernizacja (ocieplenie, okna, drzwi)', 'Insulation, windows and doors'),
});

export default function GrantCalc({ lang: l, id, mode = 'cp', methodHref }: Props) {
  const [persons, setPersons] = useState(3);
  const [perPerson, setPerPerson] = useState(2000);
  const [annual, setAnnual] = useState(60000);
  const [benefit, setBenefit] = useState('no');
  const [eu, setEu] = useState<EuClass>('high');
  const [source, setSource] = useState<HeatSource>('pcAirWaterPlus');
  const [co, setCo] = useState('yes');
  const [thermo, setThermo] = useState('yes');
  const [kwh, setKwh] = useState(10);
  const [cost, setCost] = useState(25000);
  const [pvKwp, setPvKwp] = useState(5);
  const [heat, setHeat] = useState(0);
  const [nm, setNm] = useState('nb');

  const lv = useMemo(() => cpLevel({ persons, monthlyPerPerson: perPerson, annualIncome: annual, benefit: benefit === 'yes', euClass: eu }), [persons, perPerson, annual, benefit, eu]);
  const g = useMemo(() => cpGrant({ level: lv.level, euClass: eu, source, coInstall: co === 'yes', thermo: thermo === 'yes' }), [lv.level, eu, source, co, thermo]);
  const pm = useMemo(() => pmeGrant({ kwh, cost, netMetering: nm === 'nm', pvKwp, heatStore: heat }), [kwh, cost, nm, pvKwp, heat]);
  const single = persons <= 1;

  if (mode === 'pme') {
    const form = (<>
      <NumberField id={`${id}-kwh`} lang={l} label={T(l, 'Pojemność magazynu', 'Battery capacity')} value={kwh} onChange={setKwh} unit="kWh" max={100} decimals={1} />
      <NumberField id={`${id}-koszt`} lang={l} label={T(l, 'Cena magazynu z montażem', 'Battery price, installed')} value={cost} onChange={setCost} unit="zł" max={300000} help={T(l, 'Bez falownika i EMS', 'Without inverter and EMS')} />
      <NumberField id={`${id}-pv`} lang={l} label={T(l, 'Moc Twojej instalacji PV', 'Your solar peak power')} value={pvKwp} onChange={setPvKwp} unit="kWp" max={50} decimals={1} />
      <NumberField id={`${id}-cieplo`} lang={l} label={T(l, 'Magazyn ciepła (koszt)', 'Heat store (cost)')} value={heat} onChange={setHeat} unit="zł" max={50000} />
      <Toggle id={`${id}-system`} className="col-span-2" label={T(l, 'Rozliczasz się w', 'You are on')} value={nm} onChange={setNm} options={[{ value: 'nb', label: 'net-billing' }, { value: 'nm', label: 'net-metering' }]} />
    </>);
    const result = (<>
      <Head label={T(l, 'Dotacja PME do magazynu', 'PME grant for the battery')} value={zl(pm.total, 0, l)} sub={pm.eligible ? T(l, `do zapłaty po dotacji: ${zl(Math.max(0, cost + heat - pm.total), 0, l)}`, `left to pay after the grant: ${zl(Math.max(0, cost + heat - pm.total), 0, l)}`) : T(l, 'Ten magazyn nie spełnia warunków programu', 'This battery does not meet the programme rules')} />
      <Rows rows={[
        [T(l, 'Magazyn prądu: 30 % kosztów', 'Battery: 30% of costs'), zl(cost * P.pme.rate, 0, l)],
        [T(l, `Limit ${num(P.pme.perKwh, 0, l)} zł za kWh`, `Cap PLN ${num(P.pme.perKwh, 0, l)} per kWh`), zl(kwh * P.pme.perKwh, 0, l)],
        [T(l, 'Limit na magazyn', 'Cap per battery'), zl(nm === 'nm' ? P.pme.capNetMetering : P.pme.capNetBilling, 0, l)],
        [T(l, 'Cena za kWh (limit 3000 zł)', 'Price per kWh (cap PLN 3,000)'), zl(kwh > 0 ? cost / kwh : 0, 0, l)],
        [T(l, 'Magazyn ciepła: 30 %, do 1000 zł', 'Heat store: 30%, up to PLN 1,000'), zl(pm.heat, 0, l)],
        [T(l, 'Dotacja razem', 'Total grant'), zl(pm.total, 0, l), true],
      ]} />
      {!pm.eligible && <Note>{pm.reasons.map((r) => ({ minKwh: T(l, 'Minimum 10 kWh. ', 'At least 10 kWh. '), priceCap: T(l, 'Cena powyżej 3000 zł/kWh. ', 'Price above PLN 3,000/kWh. '), ratio: T(l, 'Pojemność w Wh musi wynosić co najmniej dwa razy moc PV w Wp. ', 'Capacity in Wh must be at least twice the solar peak power in Wp. ') } as Record<string, string>)[r]).join('')}</Note>}
      <Note>{T(l, 'Nabór PME część 2 (Fundusz Modernizacyjny) trwa od 20.10.2026 do 01.10.2027, liczą się zakupy od 01.11.2025. Dodatkowo do 2000 zł za falownik hybrydowy lub magazyn wyprodukowany w UE.', 'PME part 2 (Modernisation Fund) runs from 20 Oct 2026 to 1 Oct 2027 and covers purchases from 1 Nov 2025. Up to PLN 2,000 extra for an EU-made hybrid inverter or battery.')}</Note>
      <MethodLink href={methodHref} lang={l} />
    </>);
    return <Shell id={id} form={form} result={result} />;
  }

  const form = (<>
    <NumberField id={`${id}-osoby`} lang={l} label={T(l, 'Osoby w gospodarstwie', 'People in the household')} value={persons} onChange={setPersons} max={20} />
    <NumberField id={`${id}-dochod`} lang={l} label={T(l, 'Dochód miesięczny na osobę', 'Monthly income per person')} value={perPerson} onChange={setPerPerson} unit="zł" max={100000} />
    <NumberField id={`${id}-roczny`} lang={l} label={T(l, 'Twój dochód roczny', 'Your yearly income')} value={annual} onChange={setAnnual} unit="zł" max={2000000} />
    <Toggle id={`${id}-zasilek`} label={T(l, 'Zasiłek stały, okresowy, rodzinny lub opiekuńczy', 'Social, family or carer benefit')} value={benefit} onChange={setBenefit} options={[{ value: 'no', label: T(l, 'nie', 'no') }, { value: 'yes', label: T(l, 'tak', 'yes') }]} />
    <SelectField id={`${id}-eu`} label={T(l, 'Zapotrzebowanie domu (EU)', 'House heating demand (EU)')} value={eu} onChange={(v) => setEu(v as EuClass)}
      options={[{ value: 'low', label: T(l, 'poniżej 80 kWh/m²·rok', 'below 80 kWh/m²·yr') }, { value: 'mid', label: '80–140 kWh/m²·rok' }, { value: 'high', label: T(l, 'powyżej 140 kWh/m²·rok', 'above 140 kWh/m²·yr') }]} />
    {mode === 'cp' && <>
      <SelectField id={`${id}-zrodlo`} label={T(l, 'Nowe źródło ciepła', 'New heat source')} value={source} onChange={(v) => setSource(v as HeatSource)}
        options={(['pcAirWaterPlus', 'pcAirWater', 'pcGround', 'pcAirAir', 'districtHeat', 'biomass', 'electric'] as HeatSource[]).map((k) => ({ value: k, label: LINE_NAME(l)[k] }))} />
      <Toggle id={`${id}-co`} label={T(l, 'Nowa instalacja c.o./c.w.u.', 'New heating pipework')} value={co} onChange={setCo} options={[{ value: 'yes', label: T(l, 'tak', 'yes') }, { value: 'no', label: T(l, 'nie', 'no') }]} />
      {eu === 'mid' && <Toggle id={`${id}-termo`} label={T(l, 'Ocieplenie, okna, drzwi', 'Insulation, windows, doors')} value={thermo} onChange={setThermo} options={[{ value: 'yes', label: T(l, 'tak', 'yes') }, { value: 'no', label: T(l, 'nie', 'no') }]} />}
    </>}
  </>);

  const hi = single ? P.cp.highestMonthly.single : P.cp.highestMonthly.multi;
  const mid = single ? P.cp.raisedMonthly.single : P.cp.raisedMonthly.multi;
  const result = mode === 'progi' ? (<>
    <Head label={T(l, 'Twój poziom dofinansowania', 'Your grant level')} value={LEVEL_NAME(l)[lv.level]} sub={lv.capped ? T(l, 'Dochód pozwala na poziom najwyższy, ale tylko dla domu powyżej 140 kWh/m²·rok', 'Income allows the highest level, but only for a house above 140 kWh/m²·yr') : undefined} />
    <Rows rows={[
      [T(l, 'Próg najwyższy na osobę', 'Highest-level threshold per person'), `${zl(hi, 0, l)} ${T(l, 'mies.', '/month')}`],
      [T(l, 'Próg podwyższony na osobę', 'Raised-level threshold per person'), `${zl(mid, 0, l)} ${T(l, 'mies.', '/month')}`],
      [T(l, 'Próg podstawowy (rocznie)', 'Basic-level threshold (yearly)'), zl(P.cp.basicAnnualIncome, 0, l)],
      [T(l, 'Twój dochód na osobę', 'Your income per person'), zl(perPerson, 0, l)],
      [T(l, 'Limit przychodu z firmy (podwyższony)', 'Business revenue cap (raised)'), zl(P.cp.raisedBizWages * P.minWage2026, 0, l)],
      [T(l, 'Limit przychodu z firmy (najwyższy)', 'Business revenue cap (highest)'), zl(P.cp.highestBizWages * P.minWage2026, 0, l)],
    ]} />
    <Note>{T(l, 'Gospodarstwo jednoosobowe ma wyższe progi; małżonkowie bez separacji zawsze tworzą jedno gospodarstwo. Dochód liczy się według zasad programu (zaświadczenie z gminy).', 'Single-person households have higher thresholds; spouses without legal separation always form one household. Income is assessed under the programme rules (certificate from the municipality).')}</Note>
    <MethodLink href={methodHref} lang={l} />
  </>) : (<>
    <Head label={T(l, 'Maksymalna dotacja Czyste Powietrze', 'Maximum Czyste Powietrze grant')} value={zl(g.total, 0, l)} sub={LEVEL_NAME(l)[lv.level]} />
    <Rows rows={[...g.lines.map((x) => [LINE_NAME(l)[x.key] ?? x.key, zl(x.amount, 0, l)] as [string, string]), [T(l, 'Razem', 'Total'), zl(g.total, 0, l), true]]} />
    <Note>{eu === 'high' ? T(l, 'Dom powyżej 140 kWh/m²·rok: sama wymiana pieca nie wystarczy, termomodernizacja musi obniżyć wskaźnik o co najmniej 40 %.', 'House above 140 kWh/m²·yr: replacing the boiler alone is not enough; insulation work must cut the index by at least 40%.') : T(l, 'Kwoty to maksima z tabeli NFOŚiGW; dotacja nie przekroczy też 40, 70 lub 100 % faktycznych kosztów. Urządzenie musi być na liście ZUM.', 'Amounts are the NFOŚiGW maximums; the grant also cannot exceed 40, 70 or 100% of actual costs. The device must be on the ZUM list.')}</Note>
    <MethodLink href={methodHref} lang={l} />
  </>);
  return <Shell id={id} form={form} result={result} />;
}
