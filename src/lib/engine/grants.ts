/** Dotacje : Czyste Powietrze (poziomy i kwoty po zmianach z 20.07.2026) i Przydomowe Magazyny Energii (część 2). */
import { P } from './params';

export type Level = 'none' | 'basic' | 'raised' | 'highest';
export const LEVEL_IDX: Record<Exclude<Level, 'none'>, 0 | 1 | 2> = { basic: 0, raised: 1, highest: 2 };
export type HeatSource = keyof typeof P.cp.grants;
export type EuClass = 'low' | 'mid' | 'high';

export interface CpLevelInput {
  persons: number;            // liczba osób w gospodarstwie
  monthlyPerPerson: number;   // przeciętny miesięczny dochód na osobę
  annualIncome: number;       // roczny dochód wnioskodawcy
  benefit?: boolean;          // zasiłek stały, okresowy, rodzinny lub specjalny opiekuńczy
  bizRevenue?: number;        // roczny przychód z działalności gospodarczej
  euClass: EuClass;
}
export interface CpLevelResult { level: Level; reason: string; capped?: Level }

/** Poziom dofinansowania według progów z czystepowietrze.gov.pl (dla kogo). */
export function cpLevel(i: CpLevelInput): CpLevelResult {
  const single = i.persons <= 1;
  const wage = P.minWage2026;
  const biz = i.bizRevenue ?? 0;
  const hi = single ? P.cp.highestMonthly.single : P.cp.highestMonthly.multi;
  const mid = single ? P.cp.raisedMonthly.single : P.cp.raisedMonthly.multi;
  let level: Level = 'none', reason = 'income';
  if ((i.benefit || i.monthlyPerPerson <= hi) && biz <= P.cp.highestBizWages * wage) { level = 'highest'; reason = i.benefit ? 'benefit' : 'monthly'; }
  else if (i.monthlyPerPerson <= mid && biz <= P.cp.raisedBizWages * wage) { level = 'raised'; reason = 'monthly'; }
  else if (i.annualIncome <= P.cp.basicAnnualIncome) { level = 'basic'; reason = 'annual'; }
  // Poziom najwyższy tylko dla domu powyżej 140 kWh/(m²·rok) : niżej spada do podwyższonego.
  if (level === 'highest' && i.euClass !== 'high') return { level: 'raised', reason, capped: 'highest' };
  return { level, reason };
}

export interface CpGrantInput { level: Level; euClass: EuClass; source: HeatSource; coInstall?: boolean; thermo?: boolean; groundSource?: boolean }
export interface CpGrantResult { lines: Array<{ key: string; amount: number }>; total: number; rate: number; allowedSourceOnly: boolean }

export function cpGrant(i: CpGrantInput): CpGrantResult {
  if (i.level === 'none') return { lines: [], total: 0, rate: 0, allowedSourceOnly: i.euClass !== 'high' };
  const k = LEVEL_IDX[i.level];
  const g = P.cp.grants;
  const lines: Array<{ key: string; amount: number }> = [
    { key: 'audit', amount: g.audit[k] }, { key: 'certificate', amount: g.certificate[k] },
    { key: i.source, amount: g[i.source][k] },
  ];
  if (i.source === 'pcGround' && i.groundSource !== false) lines.push({ key: 'groundSource', amount: g.groundSource[k] });
  if (i.coInstall) lines.push({ key: 'coInstall', amount: g.coInstall[k] });
  // Dom > 140 kWh/(m²·rok) : sama wymiana źródła ciepła nie wystarcza, termomodernizacja jest warunkiem.
  const thermo = i.euClass === 'high' ? true : !!i.thermo;
  if (thermo && i.euClass !== 'low') {
    const t = i.euClass === 'high' ? P.cp.thermo.high[k] : P.cp.thermo.mid[k];
    if (t > 0) lines.push({ key: 'thermo', amount: t });
  }
  return { lines, total: lines.reduce((a, l) => a + l.amount, 0), rate: P.cp.rates[i.level], allowedSourceOnly: i.euClass !== 'high' };
}

/** Dotacja do magazynu (PME część 2) : 30 % kosztów, najwyżej 800 zł/kWh i 16 000 zł (net-billing)
 *  lub 8 000 zł (net-metering), od 10 kWh ; cena magazynu ≤ 3 000 zł/kWh bez falownika i EMS. */
export interface PmeInput { kwh: number; cost: number; netMetering?: boolean; pvKwp?: number; heatStore?: number; euDevice?: number }
export interface PmeResult { battery: number; heat: number; eu: number; total: number; eligible: boolean; reasons: string[] }
export function pmeGrant(i: PmeInput): PmeResult {
  const p = P.pme, reasons: string[] = [];
  if (i.kwh < p.minKwh) reasons.push('minKwh');
  if (i.kwh > 0 && i.cost / i.kwh > p.priceCapPerKwh) reasons.push('priceCap');
  if (i.pvKwp && i.kwh * 1000 < 2 * i.pvKwp * 1000) reasons.push('ratio');
  const eligible = reasons.length === 0;
  const cap = i.netMetering ? p.capNetMetering : p.capNetBilling;
  const battery = eligible ? Math.min(i.cost * p.rate, i.kwh * p.perKwh, cap) : 0;
  const heat = i.heatStore ? Math.min(i.heatStore * p.heatRate, p.heatCap) : 0;
  const eu = eligible && i.euDevice ? Math.min(p.euBonusCap, i.euDevice * p.euBonusRate) : 0;
  return { battery, heat, eu, total: battery + heat + eu, eligible, reasons };
}
