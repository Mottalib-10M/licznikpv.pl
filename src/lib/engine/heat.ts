/**
 * Koszt ogrzewania domu : pompa ciepła, węgiel, gaz (metodologia : strona « Metodologia »).
 * Zapotrzebowanie na ciepło = powierzchnia × wskaźnik EU (kWh/m²·rok), ten sam wskaźnik,
 * którym program Czyste Powietrze dzieli domy na < 80, 80–140 i > 140 kWh/m²·rok.
 */
import { P } from './params';

export type GasArea = keyof typeof P.gas.areas;
/** Przykładowe wskaźniki EU wewnątrz trzech klas programu Czyste Powietrze (założenie, nie pomiar). */
export const EU_PRESETS = { low: 70, mid: 110, high: 170 } as const;

/** SCOP z minimalnej sezonowej efektywności ηs z rozporządzenia 813/2013 i współczynnika CC 2,5 :
 *  SCOP ≈ ηs × CC. Dolna granica, którą musi spełnić każda pompa sprzedawana w UE. */
export const scopMin = (lowTemp = true) => Math.round((lowTemp ? P.heatPump.etaSLow : P.heatPump.etaSMid) * P.heatPump.cc * 10) / 10;

export const coalKwhPerKg = () => P.coal.mjPerKg / 3.6;
export const elecGross = () => (P.elec.energyNet + P.elec.distVarNet + P.elec.qualityNet + P.elec.ozeNet + P.elec.kogenNet) * (1 + P.vat);
export const gasGrossKwh = (area: GasArea) => (P.gas.energyNet + P.gas.areas[area].dist) * (1 + P.vat);
export const gasFixedYear = (area: GasArea) => P.gas.areas[area].fixed * 12 * (1 + P.vat);

export interface HeatInput {
  area: number; eu: number;
  scop?: number; elecPrice?: number;
  coalPricePerTon?: number; coalEff?: number;
  gasArea?: GasArea; gasPriceKwh?: number; gasEff?: number; gasFixed?: boolean;
}
export interface HeatResult {
  heat: number;
  hp: { kwh: number; cost: number };
  coal: { kg: number; tons: number; cost: number };
  gas: { kwh: number; cost: number; fixed: number };
  saveVsCoal: number; saveVsGas: number;
}

export function heatCosts(i: HeatInput): HeatResult {
  const heat = i.area * i.eu;
  const scop = i.scop ?? scopMin(true);
  const kwhEl = heat / scop;
  const hpCost = kwhEl * (i.elecPrice ?? elecGross());
  const coalEff = i.coalEff ?? P.coal.boilerEff;
  const kg = heat / coalEff / coalKwhPerKg();
  const coalCost = (kg / 1000) * (i.coalPricePerTon ?? P.coal.pricePerTon2025);
  const area = i.gasArea ?? 'WA';
  const gasKwh = heat / (i.gasEff ?? P.gas.boilerEff);
  const fixed = i.gasFixed === false ? 0 : gasFixedYear(area);
  const gasCost = gasKwh * (i.gasPriceKwh ?? gasGrossKwh(area)) + fixed;
  return { heat, hp: { kwh: kwhEl, cost: hpCost }, coal: { kg, tons: kg / 1000, cost: coalCost }, gas: { kwh: gasKwh, cost: gasCost, fixed },
    saveVsCoal: coalCost - hpCost, saveVsGas: gasCost - hpCost };
}

/** Miesięczny rozkład zużycia prądu przez pompę ciepła : według stopniodni nie mamy źródła na każdą
 *  gminę, więc dzielimy roczne zużycie na sezon grzewczy (październik–kwiecień) proporcjonalnie
 *  do liczby dni. Uproszczenie opisane w metodologii. */
export function hpMonthly(kwhYear: number): number[] {
  const season = [1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1];
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const tot = season.reduce((a, s, i) => a + s * days[i], 0);
  return season.map((s, i) => (s * days[i] / tot) * kwhYear);
}

/** Ciepło użytkowe na ciepłą wodę w domu jednorodzinnym, kWh/rok : wzór (61) rozporządzenia
 *  w sprawie metodologii charakterystyki energetycznej (Dz.U. 2015 poz. 376), tabela 27 :
 *  V = 1,4 dm³/(m²·doba), kR = 0,9, woda 10 → 55 °C, c = 4,19 kJ/(kg·K), 365 dni. */
export function cwuKwh(area: number): number {
  const c = P.cwu;
  return (c.litresPerM2Day * area * c.cWater * (c.tHot - c.tCold) * c.kR * c.days) / 3600;
}
