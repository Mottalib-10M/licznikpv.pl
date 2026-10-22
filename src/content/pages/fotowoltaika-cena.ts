import { definePage, type Helpers } from '../../lib/page-types';

const S = (h: Helpers, kwp: number, use: number) => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp, useKwh: use });

export default definePage({
  id: 'fotowoltaika-cena', group: 'pv', order: 50, tool: 'cena',
  related: ['czy-fotowoltaika-sie-oplaca', 'fotowoltaika-10-kw', 'moj-prad-2026'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'ureTaryfy2026', 'mojPrad', 'ulgaTermo'],
  pl: {
    slug: 'fotowoltaika-cena', nav: 'Cena fotowoltaiki', card: 'Ile możesz zapłacić, żeby instalacja się zwróciła.',
    title: 'Fotowoltaika cena 2026: ile zapłacić, by zwrot był w 10 lat',
    description: 'Ile kosztuje fotowoltaika, żeby się opłacała: najwyższa cena instalacji przy zwrocie w 6, 8, 10, 12 i 15 lat, z produkcji w Twojej gminie i rachunków 2026.',
    h1: 'Cena fotowoltaiki: ile możesz zapłacić, żeby się zwróciła',
    intro: 'Zamiast średniego cennika liczymy cenę graniczną dla Twojego domu. Masz ofertę? Wpisz kwotę i zobacz liczbę lat.',
    resume: (h) => {
      const r = S(h, 6, 4000);
      return `Pytanie „ile kosztuje fotowoltaika” ma dwie części: ile żąda instalator i ile instalacja jest warta dla Twojego domu. Pierwszej nie podajemy, bo nie istnieje urzędowe źródło cen rynkowych, a cenniki firm różnią się zakresem. Drugą da się policzyć dokładnie: wartość instalacji to roczna oszczędność na rachunkach razy liczba lat, w których ma się zwrócić, plus dotacja. Dla 6 kWp w Warszawie przy zużyciu 4000 kWh oszczędność wynosi około ${h.zl(r.savings)} rocznie, więc instalacja zwróci się w 8 lat przy cenie do ${h.zl(h.M.maxPriceFor(8, r.savings))}, w 10 lat do ${h.zl(h.M.maxPriceFor(10, r.savings))}, a w 15 lat do ${h.zl(h.M.maxPriceFor(15, r.savings))}. Kalkulator powyżej liczy te progi dla Twojej gminy, mocy, zużycia i dachu. Jeśli wpiszesz kwotę z oferty, pokaże liczbę lat prostego zwrotu, bez założeń o przyszłych cenach prądu.`;
    },
    faqs: (h) => [
      { q: 'Jak sprawdzić, czy oferta instalatora jest za droga?', a: 'Wpisz w kalkulatorze moc, zużycie i kwotę brutto z oferty. Jeśli prosty zwrot przekracza 12–15 lat, a gwarancja na falownik obejmuje 10 lat, ryzyko wymiany falownika przed zwrotem jest realne. Porównaj też, czy oferty obejmują ten sam zakres: konstrukcję, zabezpieczenia, zgłoszenie do operatora i serwis.' },
      { q: 'Co powinna obejmować oferta, żeby dało się ją porównać z innymi?', a: 'Moc paneli w kWp i ich model, model falownika, rodzaj konstrukcji, zabezpieczenia po stronie prądu stałego i zmiennego, projekt, zgłoszenie mikroinstalacji do operatora sieci, okres gwarancji na produkt, na wydajność paneli i na montaż. Brak którejś pozycji zwykle oznacza dopłatę później. Porównuj kwoty brutto, po tym samym zakresie, i licz lata zwrotu dla każdej oferty osobno.' },
      { q: 'Czy można odliczyć fotowoltaikę od podatku w ramach ulgi termomodernizacyjnej?', a: `Tak, wydatki na mikroinstalację fotowoltaiczną na domu jednorodzinnym (albo na garażu przy nim), którego jesteś właścicielem lub współwłaścicielem, mieszczą się w uldze termomodernizacyjnej do 53 000 zł na osobę. Odliczeniu podlega kwota po odjęciu dotacji. Rzeczywista korzyść zależy od stawki podatku, więc nie dodajemy jej automatycznie do wyniku.` },
      { q: 'Dlaczego cena za kilowat małej instalacji bywa wyższa niż dużej?', a: 'Bo część kosztów nie zależy od mocy: projekt, zgłoszenie, zabezpieczenia, dojazd ekipy i najmniejszy dostępny falownik. Przy 4 kWp rozkładają się na mniej kilowatów niż przy 10 kWp. Dlatego porównuj oferty po całej kwocie i po liczbie lat zwrotu, a nie po cenie za kilowat.' },
    ],
    body: (h) => {
      const rows = [[4, 2800], [6, 4000], [8, 6000], [10, 8000]].map(([k, u]) => { const r = S(h, k, u); return [`${k} kWp / ${h.num(u)} kWh`, h.zl(r.savings), h.zl(h.M.maxPriceFor(8, r.savings)), h.zl(h.M.maxPriceFor(10, r.savings)), h.zl(h.M.maxPriceFor(12, r.savings))]; });
      return `
<h2>Cena graniczna dla czterech typowych domów</h2>
${h.table(['Moc i zużycie', 'Oszczędność rocznie', 'Zwrot w 8 lat do', 'w 10 lat do', 'w 12 lat do'], rows, 'Warszawa, 35° na południe, RCE, pobór równo przez dobę, ceny G11 2026, bez dotacji.', ['l', 'r', 'r', 'r', 'r'])}
<p>Prosty zwrot pomija dwie rzeczy, które działają w przeciwnych kierunkach: wzrost cen prądu skraca zwrot, a spadek sprawności paneli i wymiana falownika go wydłużają. Dlatego progi traktuj jako punkt odniesienia, a nie obietnicę. Dotacji na same panele w 2026 r. nie ma: nabór Mój Prąd 6.0 zakończył się 12 września 2025 r. (${h.a('moj-prad-2026', 'Mój Prąd 2026')}).</p>`;
    },
  },
  en: {
    slug: 'solar-panel-cost', nav: 'Solar system price', card: 'How much you can pay for the system to pay back.',
    title: 'Solar panel cost in Poland 2026: price for a 10-year payback',
    description: 'What a solar system in Poland can cost to pay off: the top price for a payback in 6, 8, 10, 12 or 15 years, from output in your municipality and 2026 bills.',
    h1: 'Solar system price: how much you can pay for it to pay back',
    intro: 'Instead of an average price list we work out the break-even price for your home. Have a quote? Enter it and see the years.',
    resume: (h) => {
      const r = S(h, 6, 4000);
      return `The question “what does solar cost” has two parts: what the installer asks and what the system is worth to your home. We do not give the first, because there is no official source for market prices and companies’ price lists differ in scope. The second can be worked out precisely: the system’s value is the yearly saving on bills times the number of years in which it should pay back, plus any grant. For 6 kWp in Warsaw with 4,000 kWh of use the saving is about ${h.zl(r.savings)} a year, so the system pays back in 8 years at a price up to ${h.zl(h.M.maxPriceFor(8, r.savings))}, in 10 years up to ${h.zl(h.M.maxPriceFor(10, r.savings))} and in 15 years up to ${h.zl(h.M.maxPriceFor(15, r.savings))}. The calculator above works out these thresholds for your municipality, size, use and roof. If you enter the amount from a quote, it shows the simple payback in years, with no assumption about future power prices.`;
    },
    faqs: (h) => [
      { q: 'How can I tell whether an installer’s quote is too expensive?', a: 'Enter the size, your use and the gross amount from the quote in the calculator. If simple payback exceeds 12–15 years while the inverter warranty covers 10, the risk of replacing the inverter before payback is real. Also check that quotes cover the same scope: mounting, protection, grid notification and servicing.' },
      { q: 'What should a quote include so it can be compared with others?', a: 'Panel capacity in kWp and the panel model, the inverter model, the mounting type, protection on the DC and AC side, the design, notification of the micro-installation to the grid operator, and the warranty periods for the product, for panel output and for the fitting. A missing item usually means a surcharge later. Compare gross amounts for the same scope and work out the payback for each quote separately.' },
      { q: 'Can solar panels be deducted under the Polish thermomodernisation relief?', a: `Yes: spending on a solar micro-installation on a family house you own or co-own (or on its garage) falls under the thermomodernisation relief of up to ${h.zl(h.P.ulgaTermoCap)} per person. The deductible amount is the cost minus any grant. The actual benefit depends on your tax rate, so we do not add it to the result automatically.` },
      { q: 'Why is the price per kilowatt of a small system often higher?', a: 'Because some costs do not depend on size: design, notification, protection, the crew’s travel and the smallest inverter available. At 4 kWp they are spread over fewer kilowatts than at 10 kWp. So compare quotes on the total amount and payback years, not on the price per kilowatt.' },
    ],
    body: (h) => {
      const rows = [[4, 2800], [6, 4000], [8, 6000], [10, 8000]].map(([k, u]) => { const r = S(h, k, u); return [`${k} kWp / ${h.num(u)} kWh`, h.zl(r.savings), h.zl(h.M.maxPriceFor(8, r.savings)), h.zl(h.M.maxPriceFor(10, r.savings)), h.zl(h.M.maxPriceFor(12, r.savings))]; });
      return `
<h2>Break-even price for four typical homes</h2>
${h.table(['Size and use', 'Yearly saving', '8-year payback up to', '10 years up to', '12 years up to'], rows, 'Warsaw, 35° facing south, RCE, use spread evenly over the day, 2026 G11 prices, no grant.', ['l', 'r', 'r', 'r', 'r'])}
<p>Simple payback leaves out two things that pull in opposite directions: rising power prices shorten it, while panel degradation and an inverter replacement lengthen it. Treat the thresholds as a reference point, not a promise. There is no grant for panels alone in 2026: the Mój Prąd 6.0 call closed on 12 September 2025 (${h.a('moj-prad-2026', 'Mój Prąd 2026')}).</p>`;
    },
  },
});
