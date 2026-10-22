import { definePage, type Helpers } from '../../lib/page-types';

const S = (h: Helpers, kwp: number, use: number) => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp, useKwh: use });

export default definePage({
  id: 'depozyt-prosumencki', group: 'rozliczenie', order: 20, tool: 'depozyt',
  related: ['net-billing', 'rce-cena', 'fotowoltaika-z-magazynem-energii', 'fotowoltaika-10-kw'],
  sources: ['ozeAct', 'netBillingGov', 'rcem', 'rceApi'],
  pl: {
    slug: 'depozyt-prosumencki', nav: 'Depozyt prosumencki', card: 'Ile depozytu dostaniesz, zużyjesz i odzyskasz.',
    title: 'Depozyt prosumencki 2026: kalkulator miesiąc po miesiącu',
    description: 'Depozyt prosumencki w 2026 r.: ile da energia oddana do sieci, ile pójdzie na rachunki, ile wróci jako nadpłata i ile przepadnie, miesiąc po miesiącu.',
    h1: 'Depozyt prosumencki: ile dostaniesz i ile wykorzystasz',
    intro: 'Kalkulator liczy depozyt dla każdego miesiąca roku. Wpisz gminę, moc, zużycie i sposób rozliczenia.',
    resume: (h) => {
      const r = S(h, 6, 4000);
      return `Depozyt prosumencki to kwota na koncie prosumenta u sprzedawcy prądu, w którą zamienia się energia oddana do sieci w net-billingu. Co miesiąc sprzedawca mnoży nadwyżkę z każdej godziny przez cenę z PSE, RCE albo RCEm, a wynik przez współczynnik 1,23. Z tej kwoty opłaca potem część „energia” Twoich rachunków przez kolejne 12 miesięcy. Depozyt nie pokrywa dystrybucji, opłaty mocowej ani abonamentu. Gdy po 12 miesiącach zostaje niewykorzystany, wraca na konto bankowe do 30 % (RCE) lub 20 % (RCEm) wartości oddanej energii, a reszta przepada. Dla 6 kWp w Warszawie przy zużyciu 4000 kWh depozyt wynosi około ${h.zl(r.depositValue)} rocznie, z czego ${h.zl(r.depositUsed)} pokrywa zakup energii, a ${h.zl(r.refund)} wraca jako nadpłata. Kalkulator powyżej pokazuje te kwoty dla Twojej gminy, mocy i zużycia, osobno dla każdego miesiąca.`;
    },
    faqs: (h) => [
      { q: 'Jak sprawdzić stan depozytu prosumenckiego?', a: 'Stan depozytu podaje sprzedawca prądu na fakturze rozliczeniowej i w serwisie internetowym dla klientów. Faktura pokazuje wartość energii oddanej w okresie, kwotę wykorzystaną na zakup energii i saldo przeniesione na kolejne miesiące. Jeśli tych pozycji nie ma, poproś sprzedawcę o szczegółowe rozliczenie konta prosumenta.' },
      { q: 'Czy depozyt prosumencki przepada?', a: `Częściowo, jeśli nie zużyjesz go w 12 miesięcy. Wraca wtedy na konto do 30 % (RCE) lub 20 % (RCEm) wartości energii oddanej w danym miesiącu, reszta przepada. W przykładzie 10 kWp w Warszawie przy zużyciu 4000 kWh przepada około ${h.zl(S(h, 10, 4000).lost)} rocznie, a przy 6 kWp ${S(h, 6, 4000).lost > 1 ? h.zl(S(h, 6, 4000).lost) : 'nic, bo depozyt mieści się w rachunkach i limicie zwrotu'}.` },
      { q: 'Dlaczego depozyt nie wystarcza na cały rachunek zimą?', a: 'Bo pokrywa tylko część „energia” rachunku. Przy taryfie G11 na 2026 r. energia to mniej więcej połowa ceny kilowatogodziny, druga połowa to dystrybucja i opłaty. Nawet pełny depozyt obniża więc zimowy rachunek najwyżej o tę część, a opłaty stałe zostają bez zmian.' },
      { q: 'Czy współczynnik 1,23 dotyczy wszystkich prosumentów?', a: 'Dotyczy prosumentów rozliczanych w net-billingu, zarówno po RCE, jak i po RCEm. Współczynnik podnosi wartość depozytu o 23 %, ale limit zwrotu nadpłaty liczy się od wartości energii bez tego współczynnika. Nie dotyczy prosumentów w net-meteringu, którzy rozliczają się w kilowatogodzinach.' },
    ],
    body: (h) => {
      const rows = [[4, 4000], [6, 4000], [8, 4000], [10, 4000], [10, 7000]].map(([k, u]) => { const r = S(h, k, u); return [`${k} kWp / ${h.num(u)} kWh`, h.zl(r.depositValue), h.zl(r.depositUsed), h.zl(r.refund), h.zl(r.lost)]; });
      return `
<h2>Depozyt rośnie szybciej niż jego wykorzystanie</h2>
<p>Tabela pokazuje, co dzieje się z depozytem, gdy moc rośnie przy tym samym zużyciu. Przy małej instalacji cały depozyt idzie na zakup energii. Przy dużej rośnie zwrot nadpłaty, a potem kwota, która przepada, bo dom nie ma na co wydać depozytu.</p>
${h.table(['Moc / zużycie', 'Depozyt', 'Na energię', 'Zwrot', 'Przepada'], rows, 'Warszawa, 35° na południe, pobór równo przez dobę, RCE, ceny G11 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>Wniosek jest praktyczny: jeśli kalkulator pokazuje kwotę w kolumnie „przepada”, instalacja jest za duża na obecne zużycie. Można ją zmniejszyć, dodać ${h.a('fotowoltaika-z-magazynem-energii', 'magazyn energii')} albo zaplanować nowe zużycie, na przykład pompę ciepła. Jak sprzedawca liczy cenę każdej godziny, opisuje strona ${h.a('rce-cena', 'RCE i RCEm')}, a całość systemu ${h.a('net-billing', 'net-billing')}.</p>`;
    },
  },
  en: {
    slug: 'prosumer-deposit-poland', nav: 'Prosumer deposit', card: 'How much deposit you get, use and recover.',
    title: 'Prosumer deposit in Poland 2026: month-by-month calculator',
    description: 'The Polish prosumer deposit in 2026: what exported energy earns, how much goes on your bills, what comes back as a refund and what is lost, month by month.',
    h1: 'Prosumer deposit: how much you get and how much you use',
    intro: 'The calculator works out the deposit for every month of the year. Enter your municipality, size, use and settlement type.',
    resume: (h) => {
      const r = S(h, 6, 4000);
      return `The prosumer deposit is the amount in a prosumer’s account with the electricity seller into which exported energy turns under net-billing. Every month the seller multiplies the surplus of each hour by the PSE price, RCE or RCEm, and the result by a factor of 1.23. From that amount it then pays the energy part of your bills for the next 12 months. The deposit does not pay distribution, the capacity charge or the subscription fee. When it is still unused after 12 months, it comes back to your bank account up to 30% (RCE) or 20% (RCEm) of the value of exported energy, and the rest is lost. For 6 kWp in Warsaw with 4,000 kWh of use, the deposit is about ${h.zl(r.depositValue)} a year, of which ${h.zl(r.depositUsed)} pays for energy and ${h.zl(r.refund)} comes back as a refund. The calculator above shows these amounts for your municipality, size and use, separately for each month.`;
    },
    faqs: (h) => [
      { q: 'How do I check my prosumer deposit balance?', a: 'The seller shows the deposit on the settlement invoice and in its online customer portal. The invoice gives the value of energy exported in the period, the amount spent on buying energy and the balance carried over to later months. If those lines are missing, ask the seller for a detailed statement of the prosumer account.' },
      { q: 'Is the prosumer deposit ever lost?', a: `Partly, if you do not use it within 12 months. It then comes back to your account up to 30% (RCE) or 20% (RCEm) of the value of energy exported that month, and the rest is lost. For 10 kWp in Warsaw with 4,000 kWh of use about ${h.zl(S(h, 10, 4000).lost)} is lost a year, and with 6 kWp ${S(h, 6, 4000).lost > 1 ? h.zl(S(h, 6, 4000).lost) : 'nothing, because the deposit fits within the bills and the refund cap'}.` },
      { q: 'Why does the deposit not cover the whole winter bill?', a: 'Because it only pays the energy part of the bill. On the 2026 G11 tariff, energy is roughly half the price of a kilowatt-hour; the other half is distribution and charges. Even a full deposit therefore reduces a winter bill by that part at most, and fixed charges stay the same.' },
      { q: 'Does the 1.23 factor apply to every prosumer?', a: 'It applies to prosumers settled under net-billing, at RCE and at RCEm alike. The factor raises the deposit value by 23%, but the refund cap is computed on the value of energy without it. It does not apply to net-metering prosumers, who are settled in kilowatt-hours.' },
    ],
    body: (h) => {
      const rows = [[4, 4000], [6, 4000], [8, 4000], [10, 4000], [10, 7000]].map(([k, u]) => { const r = S(h, k, u); return [`${k} kWp / ${h.num(u)} kWh`, h.zl(r.depositValue), h.zl(r.depositUsed), h.zl(r.refund), h.zl(r.lost)]; });
      return `
<h2>The deposit grows faster than you can use it</h2>
<p>The table shows what happens to the deposit as size grows at the same use. With a small system the whole deposit goes on buying energy. With a large one the refund grows, and then the amount that is lost, because the house has nothing left to spend the deposit on.</p>
${h.table(['Size / use', 'Deposit', 'On energy', 'Refund', 'Lost'], rows, 'Warsaw, 35° south, use spread evenly round the clock, RCE, 2026 G11 prices.', ['l', 'r', 'r', 'r', 'r'])}
<p>The lesson is practical: if the calculator shows an amount in the “lost” column, the system is too big for your current use. You can make it smaller, add a ${h.a('fotowoltaika-z-magazynem-energii', 'home battery')} or plan new use, such as a heat pump. The ${h.a('rce-cena', 'RCE and RCEm')} page explains how the seller prices each hour, and ${h.a('net-billing', 'net-billing')} covers the system as a whole.</p>`;
    },
  },
});
