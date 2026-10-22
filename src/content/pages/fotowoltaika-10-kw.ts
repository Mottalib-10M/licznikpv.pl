import { definePage, type Helpers } from '../../lib/page-types';

const S = (h: Helpers, y: number, use: number, profile: 'out' | 'flat' | 'home' = 'flat') => h.M.simulate({ yieldKwhKwp: y, voivIdx: 6, kwp: 10, useKwh: use, profile });

export default definePage({
  id: 'fotowoltaika-10-kw', group: 'pv', order: 40, tool: 'pv', toolArg: '10',
  related: ['fotowoltaika-8-kw', 'fotowoltaika-cena', 'magazyn-energii-cena'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'ureTaryfy2026', 'pme'],
  pl: {
    slug: 'fotowoltaika-10-kw', nav: 'Fotowoltaika 10 kW', card: 'Cena, przy której 10 kWp się zwraca.',
    title: 'Fotowoltaika 10 kW: cena opłacalna, produkcja i zwrot',
    description: 'Fotowoltaika 10 kW: ile może kosztować, żeby zwróciła się w 8, 10 lub 12 lat, ile prądu da w Twojej gminie według PVGIS i ile nadwyżki sprzedasz do sieci.',
    h1: 'Fotowoltaika 10 kW: ile może kosztować, żeby się opłacała',
    intro: 'Przy 10 kWp pytanie brzmi nie „ile kosztuje”, tylko „do jakiej ceny ma sens”. Kalkulator liczy to z Twojego zużycia.',
    resume: (h) => {
      const r = S(h, 1050, 8000), lo = S(h, h.M.MODEL.national.min, 8000), hi = S(h, h.M.MODEL.national.max, 8000);
      return `Dziesięć kilowatów to górna granica tego, co mieści typowy dach domu jednorodzinnego: 22–23 panele i 45–50 m² połaci. W Warszawie PVGIS podaje dla 10 kWp około ${h.num(r.prod)} kWh rocznie, w najsłabszej gminie kraju ${h.num(lo.prod)} kWh, w najlepszej ${h.num(hi.prod)} kWh. Przy zużyciu 8000 kWh rocznie oszczędność w Warszawie wynosi około ${h.zl(r.savings)}, a to oznacza, że instalacja zwróci się w 10 lat, jeśli kosztuje najwyżej ${h.zl(h.M.maxPriceFor(10, r.savings))}, w 12 lat przy ${h.zl(h.M.maxPriceFor(12, r.savings))}. Te kwoty nie są cenami rynkowymi, tylko progiem, powyżej którego oferta przestaje się bronić w danym czasie. W gminie najsłabszej próg dla 10 lat spada do ${h.zl(h.M.maxPriceFor(10, lo.savings))}, w najlepszej rośnie do ${h.zl(h.M.maxPriceFor(10, hi.savings))}. Wpisz kwotę z oferty, a kalkulator poda liczbę lat zwrotu dla Twojej gminy.`;
    },
    faqs: (h) => [
      { q: 'Do jakiej ceny opłaca się instalacja 10 kWp?', a: `Zależy od zużycia i gminy. Przy 8000 kWh w Warszawie oszczędność wynosi około ${h.zl(S(h, 1050, 8000).savings)} rocznie, więc zwrot w 10 lat wymaga ceny do ${h.zl(h.M.maxPriceFor(10, S(h, 1050, 8000).savings))}. Przy 5000 kWh próg spada do ${h.zl(h.M.maxPriceFor(10, S(h, 1050, 5000).savings))}, bo coraz większa część produkcji sprzedawana jest do sieci po cenie hurtowej.` },
      { q: 'Ile metrów kwadratowych dachu zajmuje 10 kWp?', a: 'Przy panelach 430–450 W potrzeba 22 lub 23 modułów, co daje 45–50 m² samej powierzchni paneli. Do tego dochodzą odstępy od krawędzi dachu, kominów i okien dachowych. Na dachu dwuspadowym wschód-zachód da się zmieścić tę moc łatwiej, kosztem kilku procent produkcji.' },
      { q: 'Czy do 10 kWp opłaca się dokupić magazyn energii?', a: 'Przy dużej instalacji magazyn ma więcej energii do przesunięcia, więc jego efekt jest wyraźniejszy niż przy 4 kWp. Program Przydomowe Magazyny Energii wymaga jednak, by pojemność w Wh była co najmniej dwa razy większa niż moc paneli w Wp, czyli przy 10 kWp magazynu co najmniej 20 kWh.' },
    ],
    body: (h) => {
      const rows = [5000, 8000, 12000].map((u) => { const r = S(h, 1050, u); return [`${h.num(u)} kWh`, h.zl(r.savings), h.zl(h.M.maxPriceFor(8, r.savings)), h.zl(h.M.maxPriceFor(10, r.savings)), h.zl(h.M.maxPriceFor(12, r.savings))]; });
      return `
<h2>Próg opłacalności 10 kWp</h2>
<p>Tabela podaje najwyższą cenę instalacji, przy której zwraca się ona w 8, 10 lub 12 lat, bez dotacji i bez wzrostu cen prądu. Liczymy prosty zwrot: cena podzielona przez roczną oszczędność.</p>
${h.table(['Zużycie', 'Oszczędność rocznie', 'Zwrot w 8 lat do', 'Zwrot w 10 lat do', 'Zwrot w 12 lat do'], rows, 'Warszawa, 10 kWp, 1050 kWh/kWp, RCE, ceny G11 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>Nie podajemy średniej ceny rynkowej za kilowat, bo nie ma jej urzędowego źródła, a cenniki instalatorów różnią się zakresem prac. Porównuj oferty po tym samym zakresie: panele, falownik, konstrukcja, zabezpieczenia, zgłoszenie i serwis. ${h.a('fotowoltaika-cena', 'Strona o cenie fotowoltaiki')} pokazuje progi dla dowolnej mocy.</p>
<h2>Gdzie przy 10 kWp idzie produkcja</h2>
<p>W lipcu instalacja 10 kWp w Warszawie produkuje ponad dwa razy więcej, niż dom o zużyciu 8000 kWh zużywa w tym miesiącu, a w grudniu kilka razy mniej. Letnia nadwyżka zamienia się w depozyt, który dom wydaje zimą. Depozyt jest ważny 12 miesięcy i pokrywa tylko część „energia” rachunku, więc przy bardzo dużej instalacji jego część przepada albo wraca jako zwrot ograniczony do 30 % wartości oddanej energii.</p>`;
    },
  },
  en: {
    slug: 'solar-10-kw', nav: 'Solar 10 kW', card: 'The price at which 10 kWp pays back.',
    title: '10 kW solar system in Poland: break-even price and payback',
    description: 'A 10 kW solar system in Poland: what it can cost to pay back in 8, 10 or 12 years, what it yields in your municipality per PVGIS and how much surplus you sell.',
    h1: '10 kW solar system: how much it can cost and still pay off',
    intro: 'At 10 kWp the question is not “what does it cost” but “up to what price does it make sense”. The calculator works it out from your use.',
    resume: (h) => {
      const r = S(h, 1050, 8000), lo = S(h, h.M.MODEL.national.min, 8000), hi = S(h, h.M.MODEL.national.max, 8000);
      return `Ten kilowatts is the upper limit of what a typical family-home roof holds: 22 or 23 panels and 45–50 m² of roof plane. In Warsaw PVGIS gives about ${h.num(r.prod)} kWh a year for 10 kWp, ${h.num(lo.prod)} kWh in the country’s weakest municipality and ${h.num(hi.prod)} kWh in the best. At 8,000 kWh of yearly use the saving in Warsaw is about ${h.zl(r.savings)}, which means the system pays back within 10 years if it costs no more than ${h.zl(h.M.maxPriceFor(10, r.savings))}, and within 12 years at ${h.zl(h.M.maxPriceFor(12, r.savings))}. These amounts are not market prices but the threshold above which a quote no longer holds up over that time. In the weakest municipality the 10-year threshold falls to ${h.zl(h.M.maxPriceFor(10, lo.savings))}; in the best it rises to ${h.zl(h.M.maxPriceFor(10, hi.savings))}. Enter the amount from your quote and the calculator gives the payback years for your municipality.`;
    },
    faqs: (h) => [
      { q: 'Up to what price does a 10 kWp system pay off?', a: `It depends on use and location. At 8,000 kWh in Warsaw the saving is about ${h.zl(S(h, 1050, 8000).savings)} a year, so a 10-year payback needs a price up to ${h.zl(h.M.maxPriceFor(10, S(h, 1050, 8000).savings))}. At 5,000 kWh the threshold falls to ${h.zl(h.M.maxPriceFor(10, S(h, 1050, 5000).savings))}, because a growing share of output is sold to the grid at the wholesale price.` },
      { q: 'How many square metres of roof does 10 kWp take?', a: 'With 430–450 W panels you need 22 or 23 modules, giving 45–50 m² of panel area alone. Add the required gaps from roof edges, chimneys and roof windows. On an east-west gable roof this size fits more easily, at the cost of a few per cent of output.' },
      { q: 'Is a home battery worth adding to a 10 kWp system?', a: 'With a large system the battery has more energy to shift, so its effect is clearer than with 4 kWp. The Przydomowe Magazyny Energii programme, however, requires a capacity in Wh at least twice the panel capacity in Wp, which means at least a 20 kWh battery for 10 kWp.' },
    ],
    body: (h) => {
      const rows = [5000, 8000, 12000].map((u) => { const r = S(h, 1050, u); return [`${h.num(u)} kWh`, h.zl(r.savings), h.zl(h.M.maxPriceFor(8, r.savings)), h.zl(h.M.maxPriceFor(10, r.savings)), h.zl(h.M.maxPriceFor(12, r.savings))]; });
      return `
<h2>Break-even price for 10 kWp</h2>
<p>The table gives the highest system price at which it pays back in 8, 10 or 12 years, with no grant and no rise in power prices. We use simple payback: price divided by yearly saving.</p>
${h.table(['Use', 'Yearly saving', '8-year payback up to', '10-year payback up to', '12-year payback up to'], rows, 'Warsaw, 10 kWp, 1,050 kWh/kWp, RCE, 2026 G11 prices.', ['l', 'r', 'r', 'r', 'r'])}
<p>We give no average market price per kilowatt, because there is no official source for one and installers’ price lists differ in scope. Compare quotes on the same scope: panels, inverter, mounting, protection, notification and servicing. The ${h.a('fotowoltaika-cena', 'solar price page')} shows thresholds for any size.</p>
<h2>Where the output of 10 kWp goes</h2>
<p>In July a 10 kWp system in Warsaw produces more than twice what a home using 8,000 kWh consumes that month, and in December several times less. The summer surplus becomes a deposit the house spends in winter. The deposit is valid for 12 months and only covers the energy part of the bill, so with a very large system part of it is forfeited or returned as a refund capped at 30% of the value of exported energy.</p>`;
    },
  },
});
