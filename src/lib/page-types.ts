/**
 * Jedna strona = jeden plik w `src/content/pages/` z dwiema wersjami językowymi (pl, en) :
 * tekst, FAQ, źródła, narzędzie albo mini-symulator, powiązane strony. Trasy, menu, stopka,
 * mapa strony, hreflang i schematy czytają te pliki same (CONTRIBUTING-STRONY.md).
 */
import type { SourceKey, Params } from './engine/params';

export type Lang = 'pl' | 'en';
export type Group = 'pv' | 'rozliczenie' | 'cieplo' | 'dotacje';
export type Tool = 'pv' | 'cena' | 'produkcja' | 'magazyn' | 'depozyt' | 'rce' | 'ciepło' | 'pompaPv' | 'cp' | 'progi' | 'pme' | 'orientacja';
export interface FAQ { q: string; a: string }

export interface Helpers {
  lang: Lang;
  T: <A>(pl: A, en: A) => A;
  a: (id: string, text: string) => string;
  zl: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  pct: (x: number, decimals?: number) => string;
  date: (iso: string) => string;
  month: (key: string) => string;
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  src: (key: SourceKey, text?: string) => string;
  P: Params;
  M: typeof import('./engine/index');
}

export interface PageText {
  slug: string;
  nav: string;
  card: string;
  /** 50 do 60 znaków, fraza kluczowa na początku (RECETTE §11). */
  title: string;
  /** 150 do 160 znaków. */
  description: string;
  h1: string;
  intro: string;
  /** Akapit do cytowania : JEDEN akapit, co najmniej 120 słów (RECETTE §21). */
  resume: (h: Helpers) => string;
  faqs: (h: Helpers) => FAQ[];
  body: (h: Helpers) => string;
}

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  tool?: Tool;
  toolArg?: string;
  mini?: string;
  related: string[];
  sources: SourceKey[];
  pl: PageText;
  en: PageText;
}
export const definePage = (p: PageDef): PageDef => p;
