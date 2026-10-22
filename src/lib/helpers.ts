/** Narzędzia pisania (`Helpers`) przekazywane do treści każdej strony. */
import { route, ROUTES, type Locale } from '../i18n/routes';
import { P, sourceUrl, type SourceKey } from './engine/params';
import * as M from './engine/index';
import type { Helpers } from './page-types';
import { formatMoney, formatNumber, formatPercent, displayDate } from './format';
import { LANG_TAGS } from '../data/site-config';

const lt = (s: string) => s.replace(/<(?=[\s\d])/g, '&lt;');
const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
const MONTHS: Record<Locale, string[]> = {
  pl: ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
export const monthName = (key: string, lang: Locale) => `${MONTHS[lang][Number(key.slice(5)) - 1]} ${key.slice(0, 4)}`;
export const monthShort = (i: number, lang: Locale) => MONTHS[lang][i];

export function helpers(lang: Locale): Helpers {
  const T = <A,>(pl: A, en: A) => (lang === 'en' ? en : pl);
  return {
    lang, P, M, T,
    a: (id, text) => (ROUTES.some((r) => r.id === id) ? `<a href="${route(id, lang)}">${text}</a>` : text),
    zl: (n, d = 0) => formatMoney(n, d, lang),
    num: (n, d = 0) => formatNumber(n, d, lang),
    pct: (x, d = 0) => formatPercent(x, d, lang),
    date: (iso) => displayDate(iso, LANG_TAGS[lang]),
    month: (key) => monthName(key, lang),
    src: (key: SourceKey, text?: string) => `<a href="${sourceUrl(key)}" target="_blank" rel="nofollow noopener noreferrer">${text ?? P.sources[key].label[lang]}</a>`,
    table: (headers, rows, caption, align = []) => {
      const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
      return `<div class="not-prose my-6 overflow-x-auto"><table class="w-full text-sm">${caption ? `<caption class="mb-2 text-left text-sm text-navy-600">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="border-b border-navy-300 bg-navy-50 px-3 py-2 font-semibold text-navy-900 ${al(i)}">${lt(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, ri) => `<tr class="${ri % 2 ? 'bg-navy-50/40' : ''}">${r.map((c, i) => `<td class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0, lang)) : lt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    },
  };
}
