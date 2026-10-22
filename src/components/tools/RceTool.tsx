/** Ceny nadwyżki : RCEm z tabeli PSE i średnie godzinowe RCE z API PSE, z wyceną Twojej nadwyżki. */
import { useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Shell, Head, Rows, Note, MethodLink, T, zl, num, type L } from '../calc/kit';
import { PRICES, P } from '../../lib/engine/index';

const MONTHS: Record<L, string[]> = {
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
export default function RceTool({ lang: l, id, methodHref }: { lang: L; id: string; methodHref?: string }) {
  const win = PRICES.window;
  const [key, setKey] = useState(win[win.length - 1]);
  const [kwh, setKwh] = useState(300);
  const label = (k: string) => `${MONTHS[l][Number(k.slice(5)) - 1]} ${k.slice(0, 4)}`;
  const rcem = PRICES.rcem[key].v, rce = PRICES.rce[key];
  const vM = (kwh * rcem) / 1000, vR = (kwh * (rcem + rce.clipBonus)) / 1000;
  const hourly = rce.hourly, max = Math.max(...hourly, 1);
  const form = (<>
    <SelectField id={`${id}-miesiac`} label={T(l, 'Miesiąc', 'Month')} value={key} onChange={setKey} options={[...win].reverse().map((k) => ({ value: k, label: label(k) }))} />
    <NumberField id={`${id}-kwh`} lang={l} label={T(l, 'Energia oddana w miesiącu', 'Energy exported that month')} value={kwh} onChange={setKwh} unit="kWh" max={100000} />
  </>);
  const result = (<>
    <Head label={T(l, `RCEm, ${label(key)}`, `RCEm, ${label(key)}`)} value={`${num(rcem, 2, l)} zł/MWh`} sub={T(l, `${num(rcem / 1000, 3, l)} zł za kWh oddaną do sieci`, `PLN ${num(rcem / 1000, 3, l)} per kWh exported`)} />
    <Rows rows={[
      [T(l, 'Wartość nadwyżki po RCEm', 'Surplus value at RCEm'), zl(vM, 2, l)],
      [T(l, 'Depozyt po RCEm (×1,23)', 'Deposit at RCEm (×1.23)'), zl(vM * P.netBilling.depositFactor, 2, l)],
      [T(l, 'Szacunek po RCE (ujemne = 0)', 'Estimate at RCE (negatives = 0)'), zl(vR, 2, l)],
      [T(l, 'Depozyt po RCE (×1,23)', 'Deposit at RCE (×1.23)'), zl(vR * P.netBilling.depositFactor, 2, l), true],
      [T(l, 'Godziny z ujemną RCE', 'Hours with negative RCE'), num(rce.negativeHours, 0, l)],
      [T(l, 'Średnia RCE w miesiącu', 'Average RCE in the month'), `${num(rce.avg, 2, l)} zł/MWh`],
    ]} />
    <Note>{T(l, `RCEm opublikowana przez PSE ${PRICES.rcem[key].published.split('-').reverse().join('.')}${PRICES.rcem[key].corrected ? ', skorygowana' : ''}. RCE według API PSE, pobrane ${PRICES.retrieved_at.split('-').reverse().join('.')}.`, `RCEm published by PSE on ${PRICES.rcem[key].published}${PRICES.rcem[key].corrected ? ', corrected' : ''}. RCE from the PSE API, read on ${PRICES.retrieved_at}.`)}</Note>
    <MethodLink href={methodHref} lang={l} />
  </>);
  const below = (
    <figure className="mt-5 border-t border-navy-100 pt-4">
      <div className="flex h-28 items-end gap-0.5" aria-hidden="true">{hourly.map((x, h) => <div key={h} className="flex-1 rounded-t bg-navy-400" style={{ height: `${(x / max) * 100}%` }} />)}</div>
      <div className="mt-1 flex justify-between text-[10px] text-navy-600" aria-hidden="true"><span>0:00</span><span>6:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div>
      <figcaption className="mt-1 text-xs text-navy-700">{T(l, `Średnia RCE w każdej godzinie, ${label(key)} (ujemne liczone jako 0): w południe, gdy panele produkują najwięcej, cena jest najniższa.`, `Average RCE in each hour, ${label(key)} (negatives as 0): at midday, when panels produce most, the price is lowest.`)}</figcaption>
    </figure>
  );
  return <Shell id={id} form={form} result={result} below={below} />;
}
