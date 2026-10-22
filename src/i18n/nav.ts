import { route, type Locale } from './routes';
import { PAGES, pageById, GROUPS } from '../lib/pages';
import type { Group } from '../lib/page-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  pl: { home: 'Kalkulator fotowoltaiki', method: 'Metodologia', about: 'O nas', widget: 'Kalkulator na Twoją stronę', contact: 'Kontakt', editorial: 'Polityka redakcyjna', privacy: 'Polityka prywatności', terms: 'Nota prawna', cookies: 'Cookies' },
  en: { home: 'Solar calculator', method: 'Method', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
};
const GROUP_LABEL: Record<Locale, Record<Group, string>> = {
  pl: { pv: 'Fotowoltaika', rozliczenie: 'Net-billing i ceny', cieplo: 'Ogrzewanie', dotacje: 'Dotacje' },
  en: { pv: 'Solar panels', rozliczenie: 'Net-billing and prices', cieplo: 'Heating', dotacje: 'Grants' },
};
const SITE: Record<Locale, string> = { pl: 'Serwis', en: 'Site' };
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? pageById(id)?.[lang].nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.map((g) => ({ label: GROUP_LABEL[lang][g], links: inGroup(g, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [...navCategories(lang), { label: SITE[lang], links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) }];
export const popularLinks = (_lang: Locale): NavLink[] => [];
