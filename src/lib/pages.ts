/** Rejestr stron : każdy plik `src/content/pages/*.ts` jest wczytywany tutaj. */
import type { PageDef, Group } from './page-types';
const mods = import.meta.glob<{ default: PageDef }>('../content/pages/*.ts', { eager: true });
export const PAGES: PageDef[] = Object.entries(mods)
  .map(([file, m]) => {
    const p = m.default;
    const base = file.split('/').pop()!.replace(/\.ts$/, '');
    if (p.id !== base) throw new Error(`${file} : id « ${p.id} » różni się od nazwy pliku`);
    return p;
  })
  .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
export const GROUPS: Group[] = ['pv', 'rozliczenie', 'cieplo', 'dotacje'];
export const pageById = (id: string) => PAGES.find((p) => p.id === id);
