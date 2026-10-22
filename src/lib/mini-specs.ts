/**
 * Rejestr mini-symulatorów (RECETTE §9.3) : jeden plik na temat w `lib/minis/<kind>.ts`, wczytywany
 * tutaj automatycznie. Każdy liczy silnikiem serwisu (lib/engine), nigdy drugim rachunkiem.
 */
import type { MiniSpec } from './mini-types';
export type Lang = 'pl' | 'en';
type Factory = (l: Lang) => MiniSpec;
const mods = import.meta.glob<{ default: Factory }>(['./minis/*.ts', '!./minis/_*.ts'], { eager: true });
export const MINIS: Record<string, Factory> = Object.fromEntries(
  Object.entries(mods).map(([f, m]) => [f.split('/').pop()!.replace(/\.ts$/, ''), m.default]),
);
export function getSpec(kind: string, lang: string): MiniSpec {
  const f = MINIS[kind];
  if (!f) throw new Error(`Nieznany mini-symulator : ${kind} (utwórz src/lib/minis/${kind}.ts)`);
  return f(lang === 'en' ? 'en' : 'pl');
}
