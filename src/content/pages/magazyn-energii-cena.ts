import { definePage, type Helpers } from '../../lib/page-types';

const gain = (h: Helpers, kwh: number) => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, batteryKwh: kwh }).savings - h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000 }).savings;
const pme = (h: Helpers, kwh: number, cost: number) => h.M.pmeGrant({ kwh, cost }).battery;

export default definePage({
  id: 'magazyn-energii-cena', group: 'dotacje', order: 60, tool: 'pme',
  related: ['fotowoltaika-z-magazynem-energii', 'moj-prad-2026', 'depozyt-prosumencki'],
  sources: ['pme', 'pmeProgram', 'pmeFaq', 'ozeAct', 'ulgaTermo'],
  pl: {
    slug: 'magazyn-energii-cena', nav: 'Cena magazynu energii', card: 'Cena po dotacji PME i warunki programu.',
    title: 'Magazyn energii cena 2026: koszt po dotacji PME i zwrot',
    description: 'Magazyn energii cena w 2026 r.: ile zapłacisz po dotacji PME, limit 3000 zł za kWh, warunki pojemności, dodatek za falownik z UE i zwrot w net-billingu.',
    h1: 'Cena magazynu energii po dotacji PME',
    intro: 'Wpisz pojemność, cenę z oferty i moc swoich paneli. Kalkulator sprawdzi warunki programu i policzy dotację.',
    resume: (h) => `Cena domowego magazynu energii zależy od pojemności, technologii i zakresu montażu, a urzędowej średniej nie ma. Jest jednak urzędowy pułap: w programie Przydomowe Magazyny Energii magazyn nie może kosztować więcej niż ${h.zl(h.P.pme.priceCapPerKwh)} za kWh pojemności bez falownika i systemu zarządzania energią, inaczej dotacja nie przysługuje. Sama dotacja wynosi 30 % kosztów, najwyżej ${h.zl(h.P.pme.perKwh)} za kWh i ${h.zl(h.P.pme.capNetBilling)} w net-billingu albo ${h.zl(h.P.pme.capNetMetering)} w net-meteringu. Magazyn 10 kWh za 25 000 zł dostaje więc ${h.zl(pme(h, 10, 25000))} i kosztuje po dotacji ${h.zl(25000 - pme(h, 10, 25000))}. W domu z instalacją 6 kWp i zużyciem 4000 kWh w Warszawie taki magazyn podnosi roczną oszczędność o około ${h.zl(gain(h, 10))}, więc udział własny zwraca się w ${h.num((25000 - pme(h, 10, 25000)) / gain(h, 10), 1)} roku. Nabór części 2 programu trwa do ${h.date(h.P.pme.pme2.to)}. Kalkulator powyżej sprawdza warunki dla Twojej oferty.`,
    faqs: (h) => [
      { q: 'Ile kosztuje magazyn energii 10 kWh w 2026 roku?', a: `Nie podajemy średniej ceny, bo nie ma jej urzędowego źródła. Program PME przyjmuje jako górną granicę ${h.zl(h.P.pme.priceCapPerKwh)} za kWh bez falownika, czyli ${h.zl(10 * h.P.pme.priceCapPerKwh)} za 10 kWh. Droższy magazyn nie dostanie dotacji. Porównując oferty, sprawdzaj pojemność użytkową, a nie nominalną, i okres gwarancji w cyklach.` },
      { q: 'Jaki magazyn energii spełnia warunki dotacji PME?', a: 'Magazyn o pojemności co najmniej 10 kWh, której wartość w watogodzinach jest co najmniej dwa razy większa niż moc paneli w watach, o cenie do 3000 zł za kWh bez falownika i systemu zarządzania. Musi być nowy, kupiony od 1 listopada 2025 r. i podłączony do mikroinstalacji prosumenta.' },
      { q: 'Po ilu latach zwraca się magazyn energii?', a: `Zależy od ceny i od domu. W przykładzie 6 kWp w Warszawie magazyn 10 kWh daje ${h.zl(gain(h, 10))} rocznie więcej oszczędności, więc przy cenie 25 000 zł zwraca się w ${h.num(25000 / gain(h, 10), 1)} roku bez dotacji i w ${h.num((25000 - pme(h, 10, 25000)) / gain(h, 10), 1)} roku z dotacją PME. Więcej zyskuje dom, w którym w dzień nikogo nie ma, i dom rozliczany po RCE, bo wieczorna energia jest wtedy cenniejsza.` },
      { q: 'Czy można dostać dodatek za falownik hybrydowy?', a: `Tak. W części 2 programu przysługuje dodatek do ${h.zl(h.P.pme.euBonusCap)}, czyli połowa kosztu, za falownik hybrydowy albo magazyn wyprodukowany w Unii Europejskiej. Łączna dotacja na jeden punkt poboru energii, z magazynem ciepła i dodatkiem, nie przekroczy ${h.zl(h.P.pme.maxPerPPE)}.` },
    ],
    body: (h) => {
      const rows = [[10, 20000], [10, 30000], [15, 36000], [20, 45000], [20, 65000]].map(([k, c]) => { const g = h.M.pmeGrant({ kwh: k, cost: c }); return [`${k} kWh, ${h.zl(c)}`, h.zl(c / k), g.eligible ? h.zl(g.battery) : 'brak (cena > 3000 zł/kWh)', h.zl(c - g.battery), gain(h, k) > 0 ? `${h.num((c - g.battery) / gain(h, k), 1)} roku` : '–']; });
      return `
<h2>Dotacja i zwrot dla przykładowych ofert</h2>
${h.table(['Magazyn i cena', 'Za 1 kWh', 'Dotacja PME', 'Po dotacji', 'Zwrot udziału'], rows, 'PME część 2, net-billing. Zwrot: dom 6 kWp, 4000 kWh, Warszawa, RCE, pobór równo przez dobę. Ceny przykładowe.', ['l', 'r', 'r', 'r', 'r'])}
<p>Ostatni wiersz pokazuje najczęstszą pułapkę: magazyn droższy niż ${h.zl(h.P.pme.priceCapPerKwh)} za kWh traci całą dotację, a nie tylko nadwyżkę ponad limit. Zwrot jest dłuższy przy dużych magazynach, bo dom zużywa wieczorem i w nocy ograniczoną ilość energii. Jak oszczędność zmienia się z pojemnością, pokazuje strona ${h.a('fotowoltaika-z-magazynem-energii', 'fotowoltaika z magazynem energii')}, a historię programu i jego zasady ${h.a('moj-prad-2026', 'Mój Prąd 2026')}.</p>`;
    },
  },
  en: {
    slug: 'home-battery-price-poland', nav: 'Home battery price', card: 'Price after the PME grant and programme rules.',
    title: 'Home battery price in Poland 2026: cost after PME grant',
    description: 'Home battery price in Poland in 2026: what you pay after the PME grant, the PLN 3,000 per kWh cap, capacity rules, the EU inverter bonus and the payback.',
    h1: 'Home battery price after the PME grant',
    intro: 'Enter the capacity, quoted price and your solar size. The calculator checks the programme rules and works out the grant.',
    resume: (h) => `The price of a home battery depends on capacity, technology and installation scope, and there is no official average. There is an official ceiling, though: under the Przydomowe Magazyny Energii programme a battery may not cost more than ${h.zl(h.P.pme.priceCapPerKwh)} per kWh of capacity excluding the inverter and energy management system, or no grant is paid. The grant itself is 30% of costs, at most ${h.zl(h.P.pme.perKwh)} per kWh and ${h.zl(h.P.pme.capNetBilling)} under net-billing or ${h.zl(h.P.pme.capNetMetering)} under net-metering. A 10 kWh battery costing PLN 25,000 therefore gets ${h.zl(pme(h, 10, 25000))} and costs ${h.zl(25000 - pme(h, 10, 25000))} after the grant. In a Warsaw house with a 6 kWp system and 4,000 kWh of use, such a battery raises the yearly saving by about ${h.zl(gain(h, 10))}, so your share pays back in ${h.num((25000 - pme(h, 10, 25000)) / gain(h, 10), 1)} years. The part 2 call runs until ${h.date(h.P.pme.pme2.to)}. The calculator above checks the conditions for your quote.`,
    faqs: (h) => [
      { q: 'What does a 10 kWh home battery cost in Poland in 2026?', a: `We give no average price, because there is no official source for one. The PME programme sets an upper limit of ${h.zl(h.P.pme.priceCapPerKwh)} per kWh excluding the inverter, or ${h.zl(10 * h.P.pme.priceCapPerKwh)} for 10 kWh. A more expensive battery gets no grant. When comparing quotes, check usable rather than nominal capacity and the warranty in cycles.` },
      { q: 'Which batteries qualify for the PME grant?', a: 'A battery of at least 10 kWh, whose capacity in watt-hours is at least twice the panel power in watts, priced at up to PLN 3,000 per kWh excluding the inverter and management system. It must be new, bought from 1 November 2025 and connected to the prosumer’s micro-installation.' },
      { q: 'How many years does a home battery take to pay back?', a: `It depends on the price and the house. In the 6 kWp Warsaw example a 10 kWh battery adds ${h.zl(gain(h, 10))} a year to the saving, so at PLN 25,000 it pays back in ${h.num(25000 / gain(h, 10), 1)} years without a grant and ${h.num((25000 - pme(h, 10, 25000)) / gain(h, 10), 1)} years with the PME grant. A house that is empty in the daytime gains more, as does one settled at RCE, because evening energy is then worth more.` },
      { q: 'Is there a bonus for a hybrid inverter?', a: `Yes. Part 2 of the programme adds up to ${h.zl(h.P.pme.euBonusCap)}, half the cost, for an EU-made hybrid inverter or battery. The total grant per metering point, including a heat store and the bonus, will not exceed ${h.zl(h.P.pme.maxPerPPE)}. The exact conditions of the bonus are set out in the part 2 programme document.` },
    ],
    body: (h) => {
      const rows = [[10, 20000], [10, 30000], [15, 36000], [20, 45000], [20, 65000]].map(([k, c]) => { const g = h.M.pmeGrant({ kwh: k, cost: c }); return [`${k} kWh, ${h.zl(c)}`, h.zl(c / k), g.eligible ? h.zl(g.battery) : 'none (price > PLN 3,000/kWh)', h.zl(c - g.battery), gain(h, k) > 0 ? `${h.num((c - g.battery) / gain(h, k), 1)} years` : '–']; });
      return `
<h2>Grant and payback for example quotes</h2>
${h.table(['Battery and price', 'Per kWh', 'PME grant', 'After grant', 'Payback of share'], rows, 'PME part 2, net-billing. Payback: 6 kWp house, 4,000 kWh, Warsaw, RCE, use spread evenly round the clock. Example prices.', ['l', 'r', 'r', 'r', 'r'])}
<p>The last row shows the most common trap: a battery costing more than ${h.zl(h.P.pme.priceCapPerKwh)} per kWh loses the whole grant, not just the excess over the cap. Payback is longer for large batteries, because the house uses a limited amount of energy in the evening and at night. The ${h.a('fotowoltaika-z-magazynem-energii', 'solar with a battery')} page shows how the saving changes with capacity, and ${h.a('moj-prad-2026', 'Mój Prąd 2026')} the programme’s history and rules.</p>`;
    },
  },
});
