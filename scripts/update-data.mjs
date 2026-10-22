#!/usr/bin/env node
/**
 * update-data.mjs — odświeża ceny, które zmieniają się co miesiąc (RECETTE §17, cron w .github/workflows).
 *
 * 1. RCEm (rynkowa miesięczna cena energii, art. 4b ust. 6–7 ustawy o OZE) : tabela publikowana
 *    przez PSE 10. dnia roboczego następnego miesiąca. Czytamy oficjalną stronę PSE, bierzemy
 *    cenę skorygowaną, jeśli jest, inaczej pierwotną.
 * 2. RCE (cena dla każdego okresu rozliczenia, art. 4b ust. 2) : otwarte API raportów PSE
 *    (api.raporty.pse.pl, endpoint rce-pln). Dla 12 ostatnich pełnych miesięcy liczymy
 *    średnią godzinową, a z niej « premię za ujemne ceny » : o ile wzrasta średnia ważona
 *    produkcją PV, gdy ujemne RCE liczy się jako zero (tak każe art. 4b ust. 2).
 *
 * Wynik : src/data/prices.json. Nic nie zmienia się po cichu : skrypt wypisuje różnice.
 * Użycie : node scripts/update-data.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/data/prices.json');
const MODEL = JSON.parse(readFileSync(join(ROOT, 'src/data/pv-model.json'), 'utf8'));
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; data-refresh)' };
const MIESIACE = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
const dry = process.argv.includes('--dry');
const num = (s) => Number(String(s).replace(/\s|&nbsp;/g, '').replace(',', '.'));

async function rcem() {
  const html = await (await fetch('https://www.pse.pl/oire/rcem-rynkowa-miesieczna-cena-energii-elektrycznej', { headers: UA })).text();
  const txt = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
  const out = {};
  // Blok roku : « 2026 cena [zł/MWh]** … styczeń RCEm 551,96 11.02.2026 - skorygowana RCEm* 331,39 11.06.2026 … »
  for (const m of txt.matchAll(/(20\d\d) cena \[zł\/MWh\]\*\*(.*?)(?=20\d\d cena \[zł\/MWh\]|$)/g)) {
    const year = m[1];
    // \b nie działa z « ń » na końcu słowa (styczeń) : granice to spacje.
    const parts = m[2].split(new RegExp(`(?<= )(${MIESIACE.join('|')})(?= RCEm)`));
    for (let i = 1; i < parts.length; i += 2) {
      const month = MIESIACE.indexOf(parts[i]) + 1;
      const body = parts[i + 1];
      const first = body.match(/RCEm ([\d\s]+,\d\d) (\d\d\.\d\d\.\d{4})/);
      if (!first) continue;
      const corr = [...body.matchAll(/skorygowana RCEm\*? ([\d\s]+,\d\d) (\d\d\.\d\d\.\d{4})/g)].pop();
      const key = `${year}-${String(month).padStart(2, '0')}`;
      out[key] = { v: num(corr ? corr[1] : first[1]), first: num(first[1]), published: first[2].split('.').reverse().join('-'), ...(corr ? { corrected: corr[2].split('.').reverse().join('-') } : {}) };
    }
  }
  if (Object.keys(out).length < 12) throw new Error(`RCEm : tylko ${Object.keys(out).length} miesięcy odczytanych, strona PSE zmieniła układ`);
  return out;
}

async function rceMonth(y, m) {
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const filter = `business_date ge '${y}-${String(m).padStart(2, '0')}-01' and business_date le '${y}-${String(m).padStart(2, '0')}-${last}'`;
  let url = `https://api.raporty.pse.pl/api/rce-pln?${new URLSearchParams({ $filter: filter, $select: 'period,rce_pln,business_date', $first: '5000' })}`;
  const vals = [];
  while (url) {
    const d = await (await fetch(url, { headers: UA })).json();
    vals.push(...d.value);
    url = d.nextLink ?? d['@odata.nextLink'] ?? null;
  }
  if (vals.length < last * 90) throw new Error(`RCE ${y}-${m} : ${vals.length} okresów, za mało`);
  const shape = MODEL.hourShape['0'][m - 1];
  const sum = Array(24).fill(0), sumRaw = Array(24).fill(0), n = Array(24).fill(0);
  let neg = 0;
  for (const v of vals) {
    const h = Number(v.period.slice(0, 2));
    sum[h] += Math.max(0, v.rce_pln); sumRaw[h] += v.rce_pln; n[h]++;
    if (v.rce_pln < 0) neg++;
  }
  const hourly = sum.map((s, h) => Math.round((s / n[h]) * 100) / 100);
  const pvw = hourly.reduce((a, x, h) => a + x * shape[h], 0);
  const pvwRaw = sumRaw.reduce((a, s, h) => a + (s / n[h]) * shape[h], 0);
  return { hourly, avg: Math.round((vals.reduce((a, v) => a + Math.max(0, v.rce_pln), 0) / vals.length) * 100) / 100,
    pvw: Math.round(pvw * 100) / 100, clipBonus: Math.round((pvw - pvwRaw) * 100) / 100, negativeHours: neg / 4, periods: vals.length };
}

const prev = (() => { try { return JSON.parse(readFileSync(OUT, 'utf8')); } catch { return null; } })();
const today = new Date();
const R = await rcem();
const months = [];
for (let k = 12; k >= 1; k--) {
  const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - k, 1));
  months.push([d.getUTCFullYear(), d.getUTCMonth() + 1]);
}
// Okno 12 miesięcy kończy się na ostatnim miesiącu, dla którego PSE opublikowało już RCEm.
const lastRcem = Object.keys(R).sort().pop();
const window = [];
for (let k = 11; k >= 0; k--) {
  const [y, m] = lastRcem.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 - k, 1));
  window.push([d.getUTCFullYear(), d.getUTCMonth() + 1]);
}
const rce = {};
for (const [y, m] of window) {
  const key = `${y}-${String(m).padStart(2, '0')}`;
  rce[key] = await rceMonth(y, m);
  process.stdout.write(`RCE ${key} : śr. ${rce[key].avg} zł/MWh, ważona PV ${rce[key].pvw}, premia za ujemne ceny ${rce[key].clipBonus}\n`);
}
const out = { retrieved_at: today.toISOString().slice(0, 10), window: window.map(([y, m]) => `${y}-${String(m).padStart(2, '0')}`), rcem: R, rce };
if (prev) {
  for (const k of out.window) if (prev.rcem?.[k] && prev.rcem[k].v !== R[k]?.v) console.log(`zmiana RCEm ${k} : ${prev.rcem[k].v} → ${R[k]?.v}`);
  const added = out.window.filter((k) => !prev.window?.includes(k));
  if (added.length) console.log(`nowe miesiące : ${added.join(', ')}`);
}
if (dry) console.log(JSON.stringify(out).slice(0, 400));
else { writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n'); console.log(`zapisano ${OUT}`); }
