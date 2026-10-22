import { makeRouter, type RouteDef } from './routes-core';
import { PAGES } from '../lib/pages';
export const LOCALES = ['pl', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pl';
const R = (id: string, pl: string, en: string, noindex = false): RouteDef<Locale> => ({ id, paths: { pl: `/pl/${pl}/`, en: `/en/${en}/` }, ...(noindex ? { noindex } : {}) });
/** Strony rdzenia. Pozostałe strony pochodzą z `src/content/pages/` (lib/pages.ts). */
const CORE: RouteDef<Locale>[] = [
  { id: 'home', paths: { pl: '/pl/', en: '/en/' } },
  R('method', 'metodologia', 'method'),
  R('about', 'o-nas', 'about'),
  R('widget', 'widget', 'widget', true),
  R('contact', 'kontakt', 'contact', true),
  R('editorial', 'polityka-redakcyjna', 'editorial-policy', true),
  R('privacy', 'polityka-prywatnosci', 'privacy', true),
  R('terms', 'nota-prawna', 'legal-notice', true),
  R('cookies', 'cookies', 'cookies', true),
];
export const ROUTES: RouteDef<Locale>[] = [
  CORE[0],
  ...PAGES.map((p) => R(p.id, p.pl.slug, p.en.slug)),
  ...CORE.slice(1),
];
export const { NOINDEX_PATHS, route, altPaths } = makeRouter(LOCALES, ROUTES);
