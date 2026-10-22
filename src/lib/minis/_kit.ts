/** Wspólne narzędzia mini-symulatorów (plik pomijany przez rejestr : przedrostek « _ »). */
import { formatMoney, formatPercent, formatNumber } from '../format';
export type L = 'pl' | 'en';
export const T = <A>(l: L, pl: A, en: A) => (l === 'en' ? en : pl);
export const zl = (x: number, a?: L | number, b?: L | number) => { const l = (typeof a === 'string' ? a : b) as L; const d = (typeof a === 'number' ? a : typeof b === 'number' ? b : 0); return formatMoney(x, d, l); };
export const pct = (x: number, a?: L | number, b?: L | number) => { const l = (typeof a === 'string' ? a : b) as L; const d = (typeof a === 'number' ? a : typeof b === 'number' ? b : 0); return formatPercent(x, d, l); };
export const num = (x: number, a?: L | number, b?: L | number) => { const l = (typeof a === 'string' ? a : b) as L; const d = (typeof a === 'number' ? a : typeof b === 'number' ? b : 0); return formatNumber(x, d, l); };
