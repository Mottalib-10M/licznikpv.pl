/** Narzędzie strony : jedno wejście dla wszystkich kalkulatorów (strona wybiera `tool` i `arg`). */
import PvCalc, { type PvMode } from './PvCalc';
import HeatCalc, { type HeatMode } from './HeatCalc';
import GrantCalc, { type GrantMode } from './GrantCalc';
import RceTool from './RceTool';
import type { L } from '../calc/kit';

interface Props { tool: string; arg?: string; lang: L; id: string; methodHref?: string }
export default function Tool({ tool, arg, lang, id, methodHref }: Props) {
  const n = arg ? Number(arg) : NaN;
  switch (tool) {
    case 'pv': return <PvCalc lang={lang} id={id} methodHref={methodHref} kwp={Number.isFinite(n) ? n : 6} use={Number.isFinite(n) ? Math.max(2500, Math.round(n * 700 / 100) * 100) : 4000} />;
    case 'cena': case 'produkcja': case 'depozyt': case 'orientacja': return <PvCalc lang={lang} id={id} methodHref={methodHref} mode={tool as PvMode} />;
    case 'magazyn': return <PvCalc lang={lang} id={id} methodHref={methodHref} mode="magazyn" battery={10} kwp={5} />;
    case 'rce': return <RceTool lang={lang} id={id} methodHref={methodHref} />;
    case 'ciepło': return <HeatCalc lang={lang} id={id} methodHref={methodHref} mode={(arg as HeatMode) ?? 'ciepło'} />;
    case 'pompaPv': return <HeatCalc lang={lang} id={id} methodHref={methodHref} mode="pompaPv" />;
    case 'cp': case 'progi': case 'pme': return <GrantCalc lang={lang} id={id} methodHref={methodHref} mode={tool as GrantMode} />;
    default: return null;
  }
}
