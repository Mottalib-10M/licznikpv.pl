/** Parametry i źródła : jeden plik JSON na rok (params-2026.json), ceny miesięczne z PSE (prices.json),
 *  model produkcji z PVGIS (pv-model.json). Żadna liczba nie jest wpisana w kod strony. */
import params from '../../data/params-2026.json';
import prices from '../../data/prices.json';
import model from '../../data/pv-model.json';

export const P = params;
export type Params = typeof params;
export type SourceKey = keyof typeof params.sources;
export const sourceUrl = (k: SourceKey) => P.sources[k].url;

export const PRICES = prices as unknown as {
  retrieved_at: string; window: string[];
  rcem: Record<string, { v: number; first: number; published: string; corrected?: string }>;
  rce: Record<string, { hourly: number[]; avg: number; pvw: number; clipBonus: number; negativeHours: number }>;
};
export const MODEL = model as unknown as {
  voivodeships: Array<{ code: string; name: string; n: number; mean: number; min: number; max: number; minN: string; maxN: string; shape: number[] }>;
  hourShape: Record<string, number[][]>;
  orient: Record<string, number[]>;
  national: { gminas: number; powiats: number; min: number; max: number; mean: number; minN: string; maxN: string };
  meta: { api: string; db: string; loss: number; angle: number; aspect: number; retrieved: string; shapeSite: string };
};

/** Miesiąc w oknie 12 miesięcy (indeks kalendarzowy 0–11) → klucz « 2026-03 ». */
export function windowKey(monthIndex: number): string {
  return PRICES.window.find((k) => Number(k.slice(5)) === monthIndex + 1)!;
}
/** Cena eksportu dla każdego miesiąca kalendarzowego (zł/MWh) z ostatnich 12 opublikowanych RCEm.
 *  RCE : ta sama RCEm plus premia za ujemne ceny liczone jako zero (art. 4b ust. 2 ustawy o OZE). */
export function exportPrices(regime: 'rcem' | 'rce'): number[] {
  return Array.from({ length: 12 }, (_, i) => {
    const k = windowKey(i);
    const base = PRICES.rcem[k].v;
    return regime === 'rce' ? base + PRICES.rce[k].clipBonus : base;
  });
}
export const LAST_RCEM_KEY = PRICES.window[PRICES.window.length - 1];
export const VOIV = MODEL.voivodeships;
