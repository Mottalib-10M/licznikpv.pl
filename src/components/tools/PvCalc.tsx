/**
 * Kalkulator fotowoltaiki : gmina → produkcja PVGIS → autokonsumpcja, depozyt, nadpłata, oszczędność,
 * lata zwrotu. Jeden silnik (lib/engine/pv.ts), kilka widoków (`mode`) dla stron tematycznych.
 */
import { useMemo, useState, type ReactNode } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import PlaceField, { DEFAULT_PLACE, type Place } from './PlaceField';
import { Shell, Full, Head, Rows, Note, MethodLink, MonthBars, T, zl, num, pct, type L } from '../calc/kit';
import { simulate, paybackYears, maxPriceFor, pmeGrant, orientFactor, P, MODEL, type Aspect, type Profile, type Regime } from '../../lib/engine/index';

export type PvMode = 'pv' | 'cena' | 'produkcja' | 'magazyn' | 'depozyt' | 'orientacja';
interface Props { lang: L; id: string; mode?: PvMode; kwp?: number; use?: number; battery?: number; methodHref?: string }

const MONTHS: Record<L, string[]> = {
  pl: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export default function PvCalc({ lang: l, id, mode = 'pv', kwp: kwp0 = 6, use: use0 = 4000, battery: b0 = 0, methodHref }: Props) {
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE);
  const [kwp, setKwp] = useState(kwp0);
  const [use, setUse] = useState(use0);
  const [batt, setBatt] = useState(b0);
  const [regime, setRegime] = useState<Regime>('rce');
  const [aspect, setAspect] = useState<Aspect>('0');
  const [tilt, setTilt] = useState(35);
  const [profile, setProfile] = useState<Profile>('flat');
  const [cost, setCost] = useState(0);
  const [grant, setGrant] = useState(0);
  const [energy, setEnergy] = useState(P.elec.energyNet);
  const [other, setOther] = useState(Math.round((P.elec.distVarNet + P.elec.qualityNet + P.elec.ozeNet + P.elec.kogenNet) * 10000) / 10000);

  const base = { yieldKwhKwp: place.y, voivIdx: place.w, kwp, useKwh: use, tilt, aspect, profile, regime, energyNet: energy, otherVarNet: other };
  const r = useMemo(() => simulate({ ...base, batteryKwh: batt }), [place, kwp, use, batt, regime, aspect, tilt, profile, energy, other]);
  const r0 = useMemo(() => (batt > 0 ? simulate({ ...base, batteryKwh: 0 }) : r), [place, kwp, use, batt, regime, aspect, tilt, profile, energy, other, r]);
  const years = cost > 0 ? paybackYears(cost, grant, r.savings) : null;
  const yr = (y: number | null) => (y == null ? '–' : `${num(y, 1, l)} ${T(l, 'lat', 'years')}`);

  const ASPECTS: Array<{ value: Aspect; label: string }> = [
    { value: '0', label: T(l, 'południe', 'south') }, { value: '-45', label: T(l, 'południowy wschód', 'south-east') }, { value: '45', label: T(l, 'południowy zachód', 'south-west') },
    { value: '-90', label: T(l, 'wschód', 'east') }, { value: '90', label: T(l, 'zachód', 'west') },
  ];
  const form = (
    <>
      <PlaceField id={`${id}-miejsce`} lang={l} value={place} onChange={setPlace} />
      <NumberField id={`${id}-kwp`} lang={l} label={T(l, 'Moc instalacji', 'System size')} value={kwp} onChange={setKwp} unit="kWp" max={50} decimals={1} />
      <NumberField id={`${id}-zuzycie`} lang={l} label={T(l, 'Zużycie prądu rocznie', 'Yearly electricity use')} value={use} onChange={setUse} unit="kWh" max={100000} />
      <SelectField id={`${id}-magazyn`} label={T(l, 'Magazyn energii', 'Home battery')} value={String(batt)} onChange={(v) => setBatt(Number(v))}
        options={[0, 5, 10, 15, 20].map((k) => ({ value: String(k), label: k === 0 ? T(l, 'bez magazynu', 'no battery') : `${k} kWh` }))} />
      <Toggle id={`${id}-system`} label={T(l, 'Rozliczenie nadwyżki', 'Surplus valued at')} value={regime} onChange={(v) => setRegime(v as Regime)}
        options={[{ value: 'rce', label: 'RCE' }, { value: 'rcem', label: 'RCEm' }]} />
        <SelectField id={`${id}-dach`} label={T(l, 'Strona dachu', 'Roof faces')} value={aspect} onChange={(v) => setAspect(v as Aspect)} options={ASPECTS} />
        <SelectField id={`${id}-kat`} label={T(l, 'Nachylenie', 'Tilt')} value={String(tilt)} onChange={(v) => setTilt(Number(v))} options={[10, 20, 30, 35, 40, 45].map((a) => ({ value: String(a), label: `${a}°` }))} />
        <Full><SelectField id={`${id}-profil`} label={T(l, 'Kiedy zużywasz prąd', 'When you use power')} value={profile} onChange={(v) => setProfile(v as Profile)}
          options={[{ value: 'out', label: T(l, 'głównie wieczorem (w dzień poza domem)', 'mostly evenings (out during the day)') }, { value: 'flat', label: T(l, 'równo przez całą dobę', 'evenly round the clock') }, { value: 'home', label: T(l, 'dużo w dzień (praca w domu)', 'a lot in daytime (home office)') }]} /></Full>
        <NumberField id={`${id}-cena`} lang={l} label={T(l, 'Cena z oferty (brutto)', 'Quoted price (gross)')} value={cost} onChange={setCost} unit="zł" max={500000} className="col-span-2 sm:col-span-1" help={T(l, 'Puste: pokażemy, ile możesz zapłacić', 'Empty: we show what you can afford')} />
        <NumberField id={`${id}-dotacja`} lang={l} label={T(l, 'Dotacja', 'Grant')} value={grant} onChange={setGrant} unit="zł" max={200000} />
        <NumberField id={`${id}-energia`} lang={l} label={T(l, 'Cena energii netto', 'Energy price, net')} value={Math.round(energy * 10000) / 100} onChange={(v) => setEnergy(v / 100)} unit="gr/kWh" max={500} decimals={2} />
        <NumberField id={`${id}-dystr`} lang={l} label={T(l, 'Dystrybucja i opłaty netto', 'Distribution and fees, net')} value={Math.round(other * 10000) / 100} onChange={(v) => setOther(v / 100)} unit="gr/kWh" max={500} decimals={2} />
    </>
  );

  const head = mode === 'produkcja'
    ? <Head label={T(l, 'Produkcja rocznie', 'Yearly output')} value={`${num(r.prod, 0, l)} kWh`} sub={T(l, `${num(r.prod / kwp, 0, l)} kWh z każdego kWp · oszczędność ${zl(r.savings, 0, l)} rocznie`, `${num(r.prod / kwp, 0, l)} kWh per kWp · saves ${zl(r.savings, 0, l)} a year`)} />
    : mode === 'cena' && cost === 0
      ? <Head label={T(l, 'Zwrot w 10 lat, jeśli zapłacisz najwyżej', 'Pays back in 10 years if you pay at most')} value={zl(maxPriceFor(10, r.savings, grant), 0, l)} sub={T(l, `czyli ${zl(maxPriceFor(10, r.savings, grant) / kwp, 0, l)} za 1 kWp · oszczędność ${zl(r.savings, 0, l)} rocznie`, `that is ${zl(maxPriceFor(10, r.savings, grant) / kwp, 0, l)} per kWp · saves ${zl(r.savings, 0, l)} a year`)} />
      : <Head label={T(l, 'Oszczędność na rachunkach rocznie', 'Yearly saving on your bills')} value={zl(r.savings, 0, l)} sub={T(l, `${num(r.prod, 0, l)} kWh produkcji · ${pct(r.selfShare, 0, l)} zużyte na miejscu`, `${num(r.prod, 0, l)} kWh produced · ${pct(r.selfShare, 0, l)} used on site`)} />;

  const rows: Array<[string, string] | [string, string, boolean]> = [
    [T(l, 'Zużyte od razu i z magazynu', 'Used directly and from the battery'), `${num(r.self + r.batt, 0, l)} kWh`],
    [T(l, 'Oddane do sieci', 'Exported to the grid'), `${num(r.exp, 0, l)} kWh`],
    [T(l, 'Depozyt (×1,23)', 'Deposit (×1.23)'), zl(r.depositValue, 0, l)],
    [T(l, 'Depozyt wykorzystany na energię', 'Deposit spent on energy'), zl(r.depositUsed, 0, l)],
    [T(l, 'Zwrot nadpłaty', 'Overpayment refunded'), zl(r.refund, 0, l)],
    ...(r.lost > 1 ? [[T(l, 'Depozyt przepada', 'Deposit forfeited'), zl(r.lost, 0, l)] as [string, string]] : []),
    [T(l, 'Rachunek za prąd przed / po', 'Bill before / after'), `${zl(r.billBefore, 0, l)} / ${zl(Math.max(0, r.billAfter + r.refund), 0, l)}`],
    cost > 0
      ? [T(l, 'Zwrot inwestycji', 'Payback'), yr(years), true]
      : [T(l, 'Zwrot w 10 lat przy cenie do', 'Pays back in 10 years up to'), zl(maxPriceFor(10, r.savings, grant), 0, l), true],
  ];
  const result = (
    <>
      {head}
      <Rows rows={rows} />
      <Note>{T(l,
        `Model godzinowy dla doby przeciętnej każdego miesiąca, ceny nadwyżki: ostatnie 12 miesięcy RCEm (PSE)${regime === 'rce' ? ' z premią za ujemne RCE liczone jako zero' : ''}. Szacunek, nie oferta; rachunek bez opłat stałych.`,
        `Hourly model of an average day in each month; surplus priced at the last 12 months of RCEm (PSE)${regime === 'rce' ? ' plus the gain from negative RCE counted as zero' : ''}. An estimate, not an offer; fixed charges excluded.`)}</Note>
      <MethodLink href={methodHref} lang={l} />
    </>
  );

  let below: ReactNode = null;
  if (mode === 'produkcja' || mode === 'pv') {
    below = (
      <div className="mt-5 border-t border-navy-100 pt-4">
        <MonthBars prod={r.months.map((m) => m.prod)} use={r.months.map((m) => m.use)} lang={l} labels={MONTHS[l]} />
        {mode === 'produkcja' && (
          <div className="mt-4 overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="bg-navy-50 text-navy-900">{[T(l, 'Miesiąc', 'Month'), T(l, 'Produkcja', 'Output'), T(l, 'Zużyte na miejscu', 'Used on site'), T(l, 'Do sieci', 'To grid'), T(l, 'Z sieci', 'From grid')].map((h, i) => <th key={h} scope="col" className={`px-2 py-1.5 font-semibold ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
            <tbody>{r.months.map((m, i) => <tr key={i} className="border-b border-navy-100"><td className="px-2 py-1">{MONTHS[l][i]}</td>{[m.prod, m.self + m.batt, m.exp, m.imp].map((x, j) => <td key={j} className="tabular-nums px-2 py-1 text-right">{num(x, 0, l)}</td>)}</tr>)}</tbody>
          </table></div>
        )}
      </div>
    );
  } else if (mode === 'cena') {
    below = (
      <div className="mt-5 overflow-x-auto border-t border-navy-100 pt-4"><table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm text-navy-700">{T(l, 'Najwyższa cena instalacji, przy której zwraca się ona w danym czasie (Twoja oszczędność, Twoja dotacja)', 'Highest system price that pays back within the given time (your saving, your grant)')}</caption>
        <thead><tr className="bg-navy-50">{[T(l, 'Zwrot w', 'Payback in'), T(l, 'Cena instalacji do', 'System price up to'), T(l, 'Za 1 kWp do', 'Per kWp up to')].map((h, i) => <th key={h} scope="col" className={`px-2 py-1.5 font-semibold ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{[6, 8, 10, 12, 15].map((y) => <tr key={y} className="border-b border-navy-100"><td className="px-2 py-1">{y} {T(l, 'lat', 'years')}</td><td className="tabular-nums px-2 py-1 text-right">{zl(maxPriceFor(y, r.savings, grant), 0, l)}</td><td className="tabular-nums px-2 py-1 text-right">{zl(maxPriceFor(y, r.savings, grant) / kwp, 0, l)}</td></tr>)}</tbody>
      </table></div>
    );
  } else if (mode === 'magazyn') {
    const g = pmeGrant({ kwh: batt, cost: cost > 0 ? cost : batt * P.pme.priceCapPerKwh, pvKwp: kwp });
    below = (
      <div className="mt-5 overflow-x-auto border-t border-navy-100 pt-4"><table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm text-navy-700">{T(l, 'Ta sama instalacja bez magazynu i z magazynem', 'The same system without and with the battery')}</caption>
        <thead><tr className="bg-navy-50">{['', T(l, 'Bez magazynu', 'No battery'), batt ? `${batt} kWh` : T(l, 'Wybierz magazyn', 'Pick a battery')].map((h, i) => <th key={i} scope="col" className={`px-2 py-1.5 font-semibold ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>
          {([[T(l, 'Zużyte na miejscu', 'Used on site'), pct(r0.selfShare, 0, l), pct(r.selfShare, 0, l)], [T(l, 'Oddane do sieci', 'Exported'), `${num(r0.exp, 0, l)} kWh`, `${num(r.exp, 0, l)} kWh`], [T(l, 'Oszczędność rocznie', 'Yearly saving'), zl(r0.savings, 0, l), zl(r.savings, 0, l)], [T(l, 'Różnica dzięki magazynowi', 'Gain from the battery'), '–', zl(r.savings - r0.savings, 0, l)], [T(l, 'Dotacja PME (30 %, ≤ 800 zł/kWh)', 'PME grant (30%, ≤ PLN 800/kWh)'), '–', g.eligible ? zl(g.battery, 0, l) : T(l, 'warunki niespełnione', 'conditions not met')]] as string[][]).map((row) => <tr key={row[0]} className="border-b border-navy-100">{row.map((c, i) => <td key={i} className={`px-2 py-1 ${i ? 'tabular-nums text-right' : ''}`}>{c}</td>)}</tr>)}
        </tbody>
      </table>
      {!g.eligible && batt > 0 && <p className="mt-2 text-xs text-navy-700">{T(l, 'PME wymaga co najmniej 10 kWh, pojemności w Wh co najmniej dwa razy większej niż moc PV w Wp i ceny magazynu do 3000 zł za kWh.', 'PME requires at least 10 kWh, capacity in Wh at least twice the PV peak power in Wp, and a battery price of at most PLN 3,000 per kWh.')}</p>}
      </div>
    );
  } else if (mode === 'depozyt') {
    below = (
      <div className="mt-5 overflow-x-auto border-t border-navy-100 pt-4"><table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm text-navy-700">{T(l, 'Depozyt prosumencki miesiąc po miesiącu (zł, z 1,23)', 'Prosumer deposit month by month (PLN, incl. ×1.23)')}</caption>
        <thead><tr className="bg-navy-50">{[T(l, 'Miesiąc', 'Month'), T(l, 'Oddane kWh', 'kWh exported'), T(l, 'Pobrane kWh', 'kWh imported'), T(l, 'Depozyt', 'Deposit')].map((h, i) => <th key={h} scope="col" className={`px-2 py-1.5 font-semibold ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
        <tbody>{r.months.map((m, i) => <tr key={i} className="border-b border-navy-100"><td className="px-2 py-1">{MONTHS[l][i]}</td><td className="tabular-nums px-2 py-1 text-right">{num(m.exp, 0, l)}</td><td className="tabular-nums px-2 py-1 text-right">{num(m.imp, 0, l)}</td><td className="tabular-nums px-2 py-1 text-right">{zl(m.deposit, 0, l)}</td></tr>)}</tbody>
      </table></div>
    );
  } else if (mode === 'orientacja') {
    const ann = (t: number, a: Aspect) => { const f = orientFactor(t, a); const sh = MODEL.voivodeships[place.w].shape; return place.y * kwp * sh.reduce((s, x, i) => s + x * f[i], 0); };
    below = (
      <div className="mt-5 overflow-x-auto border-t border-navy-100 pt-4"><table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm text-navy-700">{T(l, `Produkcja roczna ${num(kwp, 1, l)} kWp w tym miejscu (kWh) według strony dachu i nachylenia`, `Yearly output of ${num(kwp, 1, l)} kWp here (kWh) by roof direction and tilt`)}</caption>
        <thead><tr className="bg-navy-50"><th scope="col" className="px-2 py-1.5 text-left font-semibold">{T(l, 'Nachylenie', 'Tilt')}</th>{ASPECTS.map((a) => <th key={a.value} scope="col" className="px-2 py-1.5 text-right font-semibold">{a.label}</th>)}</tr></thead>
        <tbody>{[10, 20, 30, 35, 40, 45].map((t) => <tr key={t} className="border-b border-navy-100"><td className="px-2 py-1">{t}°</td>{ASPECTS.map((a) => <td key={a.value} className="tabular-nums px-2 py-1 text-right">{num(ann(t, a.value), 0, l)}</td>)}</tr>)}</tbody>
      </table></div>
    );
  }
  return <Shell id={id} form={form} result={result} below={below} />;
}
