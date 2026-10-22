import { describe, it, expect } from 'vitest';
import { simulate, paybackYears, maxPriceFor, orientFactor, P, PRICES, exportPrices, heatCosts, scopMin, cpLevel, cpGrant, pmeGrant, coalKwhPerKg, elecGross } from './index';

const base = { yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000 };

describe('produkcja i autokonsumpcja', () => {
  it('produkcja = uzysk × kWp przy dachu 35° na południe', () => {
    const r = simulate(base);
    expect(r.prod).toBeCloseTo(6300, -1);
  });
  it('bilans energii się domyka : produkcja = autokonsumpcja + ładowanie + eksport', () => {
    const r = simulate({ ...base, batteryKwh: 10 });
    const charged = r.prod - r.self - r.exp;
    expect(r.batt).toBeLessThanOrEqual(charged * 0.9 + 1e-6);
    expect(r.self + r.batt + r.imp).toBeCloseTo(r.use, 0);
  });
  it('magazyn zwiększa autokonsumpcję, a nie produkcję', () => {
    const a = simulate(base), b = simulate({ ...base, batteryKwh: 10 });
    expect(b.prod).toBeCloseTo(a.prod, 6);
    expect(b.selfShare).toBeGreaterThan(a.selfShare);
    expect(b.exp).toBeLessThan(a.exp);
  });
  it('dach wschód-zachód produkuje mniej niż południe', () => {
    expect(simulate({ ...base, aspect: '-90' }).prod).toBeLessThan(simulate(base).prod);
    expect(orientFactor(35, '0').every((x) => x === 1)).toBe(true);
  });
});

describe('net-billing (art. 4, 4b, 4c ustawy o OZE)', () => {
  it('depozyt = wartość oddanej energii × 1,23', () => {
    const r = simulate(base);
    expect(r.depositValue).toBeCloseTo(r.exportValue * 1.23, 6);
  });
  it('nadpłata nie przekracza 30 % (RCE) ani 20 % (RCEm) wartości oddanej energii', () => {
    const big = { ...base, kwp: 15, useKwh: 2000 };
    const rce = simulate({ ...big, regime: 'rce' }), rcem = simulate({ ...big, regime: 'rcem' });
    expect(rce.refund).toBeLessThanOrEqual(0.3 * rce.exportValue + 1e-6);
    expect(rcem.refund).toBeLessThanOrEqual(0.2 * rcem.exportValue + 1e-6);
    expect(rce.lost).toBeGreaterThan(0);
  });
  it('depozyt pokrywa tylko część « energia », nigdy dystrybucję', () => {
    const r = simulate({ ...base, kwp: 20 });
    expect(r.depositUsed).toBeLessThanOrEqual(r.imp * r.energyGross + 1e-6);
    // Dystrybucja zostaje do zapłaty ; tylko nadpłata (gotówka) może zejść poniżej zera.
    expect(r.billAfter + r.refund).toBeGreaterThan(0);
  });
  it('RCE ≥ RCEm, bo ujemne ceny liczą się jako zero', () => {
    const a = exportPrices('rce'), b = exportPrices('rcem');
    a.forEach((x, i) => expect(x).toBeGreaterThanOrEqual(b[i]));
  });
  it('okno cen = 12 kolejnych opublikowanych miesięcy RCEm', () => {
    expect(PRICES.window).toHaveLength(12);
    expect(new Set(PRICES.window.map((k) => k.slice(5))).size).toBe(12);
    PRICES.window.forEach((k) => expect(PRICES.rcem[k]).toBeDefined());
  });
  it('oszczędność = rachunek przed − rachunek po', () => {
    const r = simulate(base);
    expect(r.savings).toBeCloseTo(r.billBefore - r.billAfter, 6);
    expect(r.savings).toBeGreaterThan(r.savingsSelf);
  });
});

describe('zwrot', () => {
  it('lata zwrotu i cena maksymalna są odwrotnością', () => {
    expect(paybackYears(maxPriceFor(10, 2500), 0, 2500)).toBeCloseTo(10);
    expect(paybackYears(10000, 12000, 1000)).toBe(0);
    expect(paybackYears(10000, 0, 0)).toBeNull();
  });
});

describe('ogrzewanie', () => {
  it('SCOP minimalny z ηs 125 % × CC 2,5', () => { expect(scopMin(true)).toBeCloseTo(3.1, 1); });
  it('węgiel 24 MJ/kg = 6,67 kWh/kg', () => { expect(coalKwhPerKg()).toBeCloseTo(6.667, 2); });
  it('pełna cena prądu brutto G11 ok. 1,09 zł/kWh', () => { expect(elecGross()).toBeGreaterThan(1.05); expect(elecGross()).toBeLessThan(1.15); });
  it('koszt pompy = ciepło / SCOP × cena prądu', () => {
    const r = heatCosts({ area: 120, eu: 110, scop: 3.5, elecPrice: 1 });
    expect(r.hp.cost).toBeCloseTo(120 * 110 / 3.5, 6);
    expect(r.coal.tons).toBeCloseTo(13200 / 0.75 / (24 / 3.6) / 1000, 6);
  });
});

describe('Czyste Powietrze i PME', () => {
  it('progi dochodowe 2026', () => {
    expect(cpLevel({ persons: 3, monthlyPerPerson: 1200, annualIncome: 40000, euClass: 'high' }).level).toBe('highest');
    expect(cpLevel({ persons: 3, monthlyPerPerson: 1200, annualIncome: 40000, euClass: 'mid' }).level).toBe('raised');
    expect(cpLevel({ persons: 1, monthlyPerPerson: 3000, annualIncome: 36000, euClass: 'mid' }).level).toBe('raised');
    expect(cpLevel({ persons: 2, monthlyPerPerson: 4000, annualIncome: 96000, euClass: 'mid' }).level).toBe('basic');
    expect(cpLevel({ persons: 2, monthlyPerPerson: 8000, annualIncome: 150000, euClass: 'mid' }).level).toBe('none');
  });
  it('kwoty z tabeli NFOŚiGW (pompa p/w podwyższonej klasy, dom > 140)', () => {
    const r = cpGrant({ level: 'highest', euClass: 'high', source: 'pcAirWaterPlus', coInstall: true });
    expect(r.total).toBe(140300);
    const b = cpGrant({ level: 'basic', euClass: 'low', source: 'pcAirWaterPlus', coInstall: true });
    expect(b.total).toBe(22920);
    expect(cpGrant({ level: 'raised', euClass: 'mid', source: 'pcGround', coInstall: true, thermo: true }).total).toBe(94570);
  });
  it('PME : 30 %, 800 zł/kWh, 16 000 zł', () => {
    expect(pmeGrant({ kwh: 10, cost: 25000 }).battery).toBe(7500);
    expect(pmeGrant({ kwh: 20, cost: 60000 }).battery).toBe(16000);
    expect(pmeGrant({ kwh: 20, cost: 60000, netMetering: true }).battery).toBe(8000);
    expect(pmeGrant({ kwh: 8, cost: 20000 }).eligible).toBe(false);
    expect(pmeGrant({ kwh: 10, cost: 35000 }).reasons).toContain('priceCap');
    expect(P.pme.capNetBilling + P.pme.heatCap + P.pme.euBonusCap).toBe(P.pme.maxPerPPE);
  });
});

describe('magazyn : większy nie obniża oszczędności', () => {
  it('oszczędność rośnie albo stoi wraz z pojemnością', () => {
    for (const [kwp, use] of [[4, 3000], [6, 4000], [10, 7000]]) {
      const s = [0, 5, 10, 15, 20].map((b) => simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp, useKwh: use, batteryKwh: b }).savings);
      for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThanOrEqual(s[i - 1] - 0.01);
    }
  });
});
