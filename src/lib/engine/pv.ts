/**
 * Model roczny instalacji PV w net-billingu (metodologia : strona « Metodologia »).
 *
 * 1. Produkcja miesięczna = uzysk PVGIS gminy (kWh/kWp/rok) × udział miesiąca w województwie
 *    × kWp × współczynnik orientacji dachu (PVGIS, Warszawa).
 * 2. Doba przeciętna w każdym miesiącu : produkcja rozłożona na 24 godziny według kształtu
 *    godzinowego PVGIS (2019–2023), zużycie według wybranego profilu. Ustawa każe bilansować
 *    pobór i oddanie w każdej godzinie (art. 4 ust. 2b), więc autokonsumpcja = suma min(PV, zużycie).
 * 3. Magazyn : nadwyżka dnia ładuje magazyn do jego pojemności użytkowej, wieczór i noc go
 *    rozładowują ze sprawnością cyklu.
 * 4. Depozyt = energia oddana × cena (RCEm albo RCE) × 1,23 (art. 4c ust. 4) ; pokrywa tylko
 *    część « energia » rachunku (art. 4c ust. 2–3). Niewykorzystana reszta wraca jako nadpłata,
 *    najwyżej 20 % (RCEm) lub 30 % (RCE) wartości oddanej energii (art. 4 ust. 11a).
 */
import { P, MODEL, exportPrices } from './params';

export type Regime = 'rcem' | 'rce';
export type Aspect = '0' | '-45' | '45' | '-90' | '90';
export type Profile = 'out' | 'flat' | 'home';
export const DAYS = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** Udział zużycia doby w godzinach 8–18 : poza domem 30 %, równomiernie 10/24, w domu 55 %.
 *  To założenie modelu, nie statystyka : użytkownik je wybiera. */
export const DAY_SHARE: Record<Profile, number> = { out: 0.3, flat: 10 / 24, home: 0.55 };
export const DAY_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

export interface PvInput {
  yieldKwhKwp: number;      // roczny uzysk PVGIS gminy, kWh/kWp (dach 35°, południe)
  voivIdx: number;          // indeks województwa (kształt miesięczny)
  kwp: number;
  tilt?: number;            // 10, 20, 30, 35, 40, 45
  aspect?: Aspect;
  useKwh: number;           // roczne zużycie prądu
  profile?: Profile;
  batteryKwh?: number;      // pojemność użytkowa
  batteryEff?: number;      // sprawność cyklu ładowanie-rozładowanie
  regime?: Regime;
  energyNet?: number;       // cena energii netto zł/kWh
  otherVarNet?: number;     // dystrybucja zmienna + opłaty zmienne netto zł/kWh
  exportPrice?: number[];   // zł/MWh, 12 miesięcy ; domyślnie ostatnie 12 RCEm
  extraLoad?: number[];     // dodatkowe zużycie miesięczne (np. pompa ciepła), kWh
}
export interface PvMonth { prod: number; self: number; batt: number; exp: number; imp: number; use: number; deposit: number }
export interface PvResult {
  months: PvMonth[];
  prod: number; self: number; batt: number; exp: number; imp: number; use: number;
  selfShare: number;        // część produkcji zużyta na miejscu (z magazynem)
  coverShare: number;       // część zużycia pokryta z własnej produkcji
  priceGross: number;       // pełna cena kWh brutto
  energyGross: number;      // część « energia » brutto
  depositValue: number;     // depozyt (z 1,23)
  exportValue: number;      // wartość energii oddanej, bez 1,23
  depositUsed: number;
  refund: number;
  lost: number;             // depozyt umorzony
  billBefore: number;       // część zmienna rachunku bez PV
  billAfter: number;
  savings: number;          // roczna oszczędność
  savingsSelf: number;      // z autokonsumpcji (z magazynem)
}

export function orientFactor(tilt = 35, aspect: Aspect = '0'): number[] {
  const k = `${tilt},${aspect}`;
  return MODEL.orient[k] ?? MODEL.orient['35,0'];
}

export function loadShape(profile: Profile): number[] {
  const s = DAY_SHARE[profile];
  return Array.from({ length: 24 }, (_, h) => (DAY_HOURS.includes(h) ? s / 10 : (1 - s) / 14));
}

export function simulate(inp: PvInput): PvResult {
  const vat = 1 + P.vat;
  const tilt = inp.tilt ?? 35, aspect = inp.aspect ?? '0', profile = inp.profile ?? 'flat';
  const battCap = Math.max(0, inp.batteryKwh ?? 0), eff = inp.batteryEff ?? 0.9;
  const energyNet = inp.energyNet ?? P.elec.energyNet;
  const otherNet = inp.otherVarNet ?? (P.elec.distVarNet + P.elec.qualityNet + P.elec.ozeNet + P.elec.kogenNet);
  const price = inp.exportPrice ?? exportPrices(inp.regime ?? 'rce');
  const fac = orientFactor(tilt, aspect);
  const shapeM = MODEL.voivodeships[inp.voivIdx]?.shape ?? MODEL.voivodeships[6].shape;
  const hour = MODEL.hourShape[aspect] ?? MODEL.hourShape['0'];
  const ls = loadShape(profile);
  const months: PvMonth[] = [];
  for (let m = 0; m < 12; m++) {
    const prod = inp.yieldKwhKwp * shapeM[m] * fac[m] * inp.kwp;
    const use = inp.useKwh * (DAYS[m] / 365.25) + (inp.extraLoad?.[m] ?? 0);
    const dProd = prod / DAYS[m], dUse = use / DAYS[m];
    // Godzina po godzinie : autokonsumpcja, nadwyżka i deficyt doby przeciętnej.
    let self = 0, surplus = 0, deficitAll = 0;
    for (let h = 0; h < 24; h++) {
      const pv = dProd * hour[m][h], ld = dUse * ls[h];
      self += Math.min(pv, ld);
      if (pv > ld) surplus += pv - ld; else deficitAll += ld - pv;
    }
    // Magazyn : nadwyżka dnia go ładuje, deficyt wieczoru, nocy i ranka go rozładowuje.
    // Ładujemy tylko tyle, ile doba potem zużyje : nadmiar ładowania byłby stratą sprawności.
    const charge = Math.min(surplus, battCap, deficitAll / eff);
    const dis = Math.min(charge * eff, deficitAll);
    const exp = surplus - charge;
    const imp = deficitAll - dis;
    const ex = exp * DAYS[m], im = imp * DAYS[m];
    months.push({ prod, self: self * DAYS[m], batt: dis * DAYS[m], exp: ex, imp: im, use, deposit: (ex * price[m] / 1000) * P.netBilling.depositFactor });
  }
  const sum = (k: keyof PvMonth) => months.reduce((a, x) => a + x[k], 0);
  const prod = sum('prod'), self = sum('self'), batt = sum('batt'), exp = sum('exp'), imp = sum('imp'), use = sum('use');
  const priceGross = (energyNet + otherNet) * vat;
  const energyGross = energyNet * vat;
  const depositValue = sum('deposit');
  const exportValue = depositValue / P.netBilling.depositFactor;
  const energyBill = imp * energyGross;
  const depositUsed = Math.min(depositValue, energyBill);
  const unused = depositValue - depositUsed;
  const cap = (inp.regime ?? 'rce') === 'rce' ? P.netBilling.refundCapRCE : P.netBilling.refundCapRCEm;
  const refund = Math.min(unused, cap * exportValue);
  const billBefore = use * priceGross;
  const billAfter = imp * priceGross - depositUsed - refund;
  const savingsSelf = (self + batt) * priceGross;
  return {
    months, prod, self, batt, exp, imp, use,
    selfShare: prod > 0 ? (self + batt) / prod : 0,
    coverShare: use > 0 ? (self + batt) / use : 0,
    priceGross, energyGross, depositValue, exportValue, depositUsed, refund, lost: unused - refund,
    billBefore, billAfter, savings: billBefore - billAfter, savingsSelf,
  };
}

/** Lata zwrotu : (cena − dotacja) / oszczędność roczna. Bez inflacji cen i bez spadku sprawności :
 *  pokazujemy to wprost, zamiast udawać precyzję. */
export function paybackYears(cost: number, grant: number, savings: number): number | null {
  if (savings <= 0) return null;
  return Math.max(0, cost - grant) / savings;
}
/** Najwyższa cena, przy której instalacja zwraca się w `years` latach. */
export const maxPriceFor = (years: number, savings: number, grant = 0) => savings * years + grant;

/** Moc dobrana do zużycia : tyle kWp, by roczna produkcja = zużycie × współczynnik. */
export function sizeFor(useKwh: number, yieldKwhKwp: number, ratio = 1): number {
  return Math.round(((useKwh * ratio) / yieldKwhKwp) * 10) / 10;
}

/** Produkcja 1 kWp na dobę w każdym miesiącu (kWh), dla rocznego uzysku i orientacji :
 *  podstawa doboru instalacji bez sieci (off-grid), gdzie decyduje najsłabszy miesiąc. */
export function dailyPerKwp(yieldKwhKwp: number, voivIdx = 6, tilt = 35, aspect: Aspect = '0'): number[] {
  const fac = orientFactor(tilt, aspect);
  const shapeM = MODEL.voivodeships[voivIdx]?.shape ?? MODEL.voivodeships[6].shape;
  return shapeM.map((s, m) => (yieldKwhKwp * s * fac[m]) / DAYS[m]);
}
