/** Wspólne elementy kalkulatorów : układ dwóch kolumn, karta wyniku, wiersze szczegółów. */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { formatMoney, formatNumber, formatPercent } from '../../lib/format';

export type L = 'pl' | 'en';
export const T = <A,>(l: L, pl: A, en: A) => (l === 'en' ? en : pl);
export const zl = (x: number, a?: L | number, b?: L | number) => { const l = (typeof a === 'string' ? a : b) as L; const d = (typeof a === 'number' ? a : typeof b === 'number' ? b : 0); return formatMoney(x, d, l); };
export const num = (x: number, a?: L | number, b?: L | number) => { const l = (typeof a === 'string' ? a : b) as L; const d = (typeof a === 'number' ? a : typeof b === 'number' ? b : 0); return formatNumber(x, d, l); };
export const pct = (x: number, a?: L | number, b?: L | number) => { const l = (typeof a === 'string' ? a : b) as L; const d = (typeof a === 'number' ? a : typeof b === 'number' ? b : 0); return formatPercent(x, d, l); };

const KeyFigure = createContext<((k: { label: string; value: string }) => void) | null>(null);

/** Formularz po lewej, wynik po prawej (pod spodem na telefonie). Na telefonie, gdy karta wyniku
 *  jest pod ekranem, pasek na dole pokazuje kluczową liczbę (RECETTE §5). */
export function Shell({ form, result, id, below }: { form: ReactNode; result: ReactNode; id: string; below?: ReactNode }) {
  const card = useRef<HTMLDivElement>(null);
  const [under, setUnder] = useState(false);
  const [key, setKey] = useState<{ label: string; value: string } | null>(null);
  useEffect(() => {
    const el = card.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setUnder(!e.isIntersecting && e.boundingClientRect.top > 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="kalk not-prose rounded-xl border border-navy-200 bg-white p-4 sm:p-5" data-chrome data-calc={id}>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] lg:items-start lg:gap-6">
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2 gap-x-4 gap-y-3">{form}</form>
        <div ref={card} aria-live="polite" data-resultat className="mt-5 rounded-xl border border-accent-200 bg-accent-50/50 p-4 lg:sticky lg:top-20 lg:mt-0"><KeyFigure.Provider value={setKey}>{result}</KeyFigure.Provider></div>
      </div>
      {below}
      {under && key && (
        <button type="button" aria-hidden="true" tabIndex={-1} onClick={() => card.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="fixed inset-x-0 bottom-0 z-40 flex items-baseline justify-between gap-3 border-t border-accent-200 bg-accent-50 px-4 py-3 text-left shadow-lg lg:hidden">
          <span className="text-sm font-medium text-navy-700">{key.label}</span>
          <span className="tabular-nums text-xl font-bold text-navy-900">{key.value}</span>
        </button>
      )}
    </div>
  );
}
export const Full = ({ children }: { children: ReactNode }) => <div className="col-span-2">{children}</div>;

export function Head({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const report = useContext(KeyFigure);
  useEffect(() => { report?.({ label, value }); }, [report, label, value]);
  return (
    <>
      <p className="text-sm font-medium text-navy-700">{label}</p>
      <p className="tabular-nums mt-0.5 text-4xl font-bold text-navy-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-navy-700">{sub}</p>}
    </>
  );
}
export function Rows({ rows }: { rows: Array<[string, string] | [string, string, boolean]> }) {
  return (
    <table className="mt-3 w-full text-sm"><tbody className="divide-y divide-accent-100">
      {rows.map(([l, v, strong]) => (
        <tr key={l} className={strong ? 'font-semibold' : ''}><td className="py-1.5 pr-3 text-navy-700">{l}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{v}</td></tr>
      ))}
    </tbody></table>
  );
}
export const Note = ({ children }: { children: ReactNode }) => <p className="mt-3 text-xs leading-relaxed text-navy-700">{children}</p>;
export function MethodLink({ href, lang }: { href?: string; lang: L }) {
  if (!href) return null;
  return <p className="mt-2 text-sm"><a href={href} className="font-medium text-accent-700 underline">{T(lang, 'Jak to liczymy i skąd są dane', 'How we compute it and where the data come from')}</a></p>;
}
/** Pasek miesięcy : produkcja (słupek) i zużycie (kreska), bez biblioteki wykresów. */
export function MonthBars({ prod, use, lang, labels }: { prod: number[]; use: number[]; lang: L; labels: string[] }) {
  const max = Math.max(...prod, ...use, 1);
  return (
    <figure className="mt-4">
      <div className="flex h-28 items-end gap-1" aria-hidden="true">
        {prod.map((p, i) => (
          <div key={i} className="relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t bg-accent-500/80" style={{ height: `${(p / max) * 100}%` }} />
            <div className="absolute inset-x-0 border-t-2 border-navy-700" style={{ bottom: `${(use[i] / max) * 100}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-1 text-[10px] text-navy-600" aria-hidden="true">{labels.map((m) => <span key={m} className="flex-1 text-center">{m}</span>)}</div>
      <figcaption className="mt-1 text-xs text-navy-700">{T(lang, 'Słupki: produkcja w miesiącu, kreska: zużycie (kWh).', 'Bars: monthly output, line: consumption (kWh).')}</figcaption>
    </figure>
  );
}
