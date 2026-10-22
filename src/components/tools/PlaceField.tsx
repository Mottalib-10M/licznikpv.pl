/**
 * Wybór gminy lub powiatu : 2 391 miejsc z uzyskiem PVGIS (public/data/miejsca.json, ładowany przy
 * pierwszym dotknięciu pola). Wpisywany tekst nigdy nie jest przepisywany (check-saisie).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { T, type L } from '../calc/kit';

export interface Place { label: string; teryt: string; y: number; w: number }
export const DEFAULT_PLACE: Place = { label: 'Warszawa', teryt: '1465011', y: 1050, w: 6 };
const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
let cache: Place[] | null = null;
async function load(): Promise<Place[]> {
  if (cache) return cache;
  const d = await (await fetch('/data/miejsca.json')).json() as { places: Array<[string, string, number, number]> };
  cache = d.places.map(([label, teryt, y, w]) => ({ label, teryt, y, w }));
  return cache;
}

export default function PlaceField({ id, lang, value, onChange }: { id: string; lang: L; value: Place; onChange: (p: Place) => void }) {
  const [text, setText] = useState(value.label);
  const [all, setAll] = useState<Place[] | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { setText(value.label); }, [value.label]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  const hits = useMemo(() => {
    if (!all || !text.trim() || text === value.label) return [];
    const q = fold(text.trim());
    const starts = all.filter((p) => fold(p.label).startsWith(q));
    const inside = all.filter((p) => !fold(p.label).startsWith(q) && fold(p.label).includes(q));
    return [...starts, ...inside].slice(0, 8);
  }, [all, text, value.label]);
  const pick = (p: Place) => { onChange(p); setText(p.label); setOpen(false); };
  const listId = `${id}-lista`;
  return (
    <div ref={box} className="relative col-span-2 grid grid-rows-subgrid row-span-3 content-start gap-y-0">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-navy-700">{T(lang, 'Gmina lub powiat', 'Municipality (gmina) or county (powiat)')}</label>
      <input id={id} type="text" autoComplete="off" spellCheck={false} role="combobox" aria-expanded={open && hits.length > 0} aria-controls={listId} aria-autocomplete="list"
        value={text}
        onFocus={(e) => { load().then(setAll); e.currentTarget.select(); }}
        onChange={(e) => { setText(e.target.value); setOpen(true); setActive(0); if (!all) load().then(setAll); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === 'Enter' && hits[active]) { e.preventDefault(); pick(hits[active]); }
          else if (e.key === 'Escape') setOpen(false);
        }}
        className="h-12 w-full rounded-lg border border-navy-300 bg-white px-4 text-lg text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20" />
      <p className="mt-1 text-xs text-navy-600">{T(lang, `PVGIS: ${value.y} kWh z 1 kWp rocznie w tym miejscu`, `PVGIS: ${value.y} kWh per kWp per year here`)}</p>
      {open && hits.length > 0 && (
        <ul id={listId} role="listbox" className="absolute left-0 right-0 top-[4.6rem] z-30 max-h-72 overflow-y-auto rounded-lg border border-navy-200 bg-white py-1 shadow-lg">
          {hits.map((p, i) => (
            <li key={p.teryt} role="option" aria-selected={i === active} onMouseDown={(e) => { e.preventDefault(); pick(p); }}
              className={`cursor-pointer px-4 py-2 text-sm ${i === active ? 'bg-accent-50 text-accent-800' : 'text-navy-800'}`}>
              {p.label} <span className="tabular-nums text-navy-500">· {p.y} kWh/kWp</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
