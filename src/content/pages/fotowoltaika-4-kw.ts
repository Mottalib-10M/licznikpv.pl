import { definePage, type Helpers } from '../../lib/page-types';

const S = (h: Helpers, use: number, profile: 'out' | 'flat' | 'home' = 'flat') => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 4, useKwh: use, profile });

export default definePage({
  id: 'fotowoltaika-4-kw', group: 'pv', order: 10, tool: 'pv', toolArg: '4',
  related: ['fotowoltaika-6-kw', 'czy-fotowoltaika-sie-oplaca', 'depozyt-prosumencki'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'ureTaryfy2026'],
  pl: {
    slug: 'fotowoltaika-4-kw', nav: 'Fotowoltaika 4 kW', card: 'Mała instalacja dla domu, który zużywa mało prądu.',
    title: 'Fotowoltaika 4 kW: ile prądu da i ile oszczędzi w 2026',
    description: 'Fotowoltaika 4 kW dla domu o niskim zużyciu: produkcja z PVGIS dla Twojej gminy, autokonsumpcja, depozyt w net-billingu i maksymalna cena przy zwrocie w 10 lat.',
    h1: 'Fotowoltaika 4 kW dla małego zużycia',
    intro: 'Cztery kilowaty to rozsądna moc, gdy rachunek pokazuje 2000–3500 kWh rocznie. Sprawdź wynik dla swojej gminy.',
    resume: (h) => {
      const r = S(h, 2800);
      return `Mała instalacja fotowoltaiczna 4 kWp to dziewięć lub dziesięć paneli i 18–20 m² dachu. W Warszawie PVGIS podaje dla niej około ${h.num(r.prod)} kWh rocznie, a w całym kraju od ${h.num(4 * h.M.MODEL.national.min)} do ${h.num(4 * h.M.MODEL.national.max)} kWh. Dla domu, który zużywa 2800 kWh rocznie, to prawie tyle, ile pokazuje rachunek, ale w net-billingu liczy się nie suma, tylko pora. Przy poborze rozłożonym równo na dobę dom zużyje na miejscu około ${h.pct(r.selfShare)} produkcji, a oszczędność wyniesie około ${h.zl(r.savings)} rocznie. Zaletą małej instalacji jest to, że depozyt prawie w całości znajduje zastosowanie: zostaje wydany na energię pobraną wieczorem i zimą, a nie przepada. Instalacja zwraca się w 10 lat przy cenie do ${h.zl(h.M.maxPriceFor(10, r.savings))}. Wynik jest szacunkiem dla Warszawy; kalkulator liczy go dla Twojej gminy.`;
    },
    faqs: (h) => [
      { q: 'Dla jakiego domu instalacja 4 kWp jest najlepszym wyborem?', a: 'Dla domu lub połowy bliźniaka, w którym mieszkają dwie lub trzy osoby, ogrzewanie nie jest elektryczne, a roczne zużycie prądu wynosi 2000–3500 kWh. Także tam, gdzie dach jest mały albo częściowo zacieniony. Przy większym zużyciu albo planowanej pompie ciepła lepiej od razu porównać 6 i 8 kWp.' },
      { q: 'Czy małą instalację da się później rozbudować?', a: 'Tak, ale rozbudowa to nowe zgłoszenie u operatora sieci i zwykle drugi falownik albo wymiana obecnego na mocniejszy. Panele dokupione po latach rzadko pasują parametrami do starych. Jeśli w ciągu kilku lat planujesz samochód elektryczny albo pompę ciepła, policz od razu docelową moc i zapytaj instalatora o falownik z zapasem.' },
      { q: 'Ile depozytu przepada przy instalacji 4 kWp?', a: `Zwykle niewiele albo nic. Przy zużyciu 2800 kWh w Warszawie roczny depozyt wynosi około ${h.zl(S(h, 2800).depositValue)} i niemal cały zostaje wydany na energię pobraną z sieci. Depozyt przepada dopiero wtedy, gdy przez 12 miesięcy jest go więcej, niż kosztuje pobrana energia, a nadwyżka przekracza limit zwrotu w gotówce.` },
    ],
    body: (h) => {
      const rows = [2000, 2800, 3500].map((u) => [`${h.num(u)} kWh`, h.pct(S(h, u, 'out').selfShare), h.pct(S(h, u, 'flat').selfShare), h.pct(S(h, u, 'home').selfShare), h.zl(S(h, u).savings)]);
      return `
<h2>Ile z 4 kWp zostaje w domu</h2>
<p>Tabela pokazuje udział produkcji zużytej od razu przy trzech sposobach korzystania z prądu: dom pusty w dzień, pobór równo przez dobę i ktoś w domu przez cały dzień. Oszczędność w ostatniej kolumnie dotyczy wariantu środkowego.</p>
${h.table(['Zużycie', 'Pusty w dzień', 'Równo przez dobę', 'Ktoś w domu', 'Oszczędność'], rows, 'Warszawa, 4 kWp, dach 35° na południe, RCE, ceny G11 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>Różnica między pierwszą a trzecią kolumną jest większa niż różnica między gminą najsłabszą a najlepszą w Polsce. Dlatego przy małej instalacji najwięcej daje przesunięcie prania, zmywania i grzania wody na godziny 10–15, a nie dokładanie paneli. Szczegóły rozliczenia opisuje ${h.a('depozyt-prosumencki', 'strona o depozycie prosumenckim')}.</p>
<h2>Mała instalacja a koszty stałe</h2>
<p>Część kosztów instalacji nie zależy od mocy: projekt, zgłoszenie, zabezpieczenia, dojazd ekipy, falownik o najmniejszej dostępnej mocy. Przez to cena za kilowat małej instalacji jest zwykle wyższa niż dużej, choć cała kwota jest niższa. Porównując oferty, patrz na kwotę całkowitą i liczbę lat zwrotu, które pokaże kalkulator.</p>`;
    },
  },
  en: {
    slug: 'solar-4-kw', nav: 'Solar 4 kW', card: 'A small system for a home with low power use.',
    title: '4 kW solar system in Poland: output and savings in 2026',
    description: 'A 4 kW solar system for a low-use Polish home: PVGIS output for your municipality, self-consumption, the net-billing deposit and price for a 10-year payback.',
    h1: '4 kW solar system for low electricity use',
    intro: 'Four kilowatts is a sensible size when the bill shows 2,000 to 3,500 kWh a year. Check the result for your municipality.',
    resume: (h) => {
      const r = S(h, 2800);
      return `A small 4 kWp solar system means nine or ten panels and 18–20 m² of roof. In Warsaw PVGIS gives it about ${h.num(r.prod)} kWh a year, and across Poland between ${h.num(4 * h.M.MODEL.national.min)} and ${h.num(4 * h.M.MODEL.national.max)} kWh. For a home using 2,800 kWh a year that is almost the whole bill, but under net-billing timing matters, not the total. With use spread evenly over the day the home consumes about ${h.pct(r.selfShare)} of output on site, and the saving is about ${h.zl(r.savings)} a year. The strength of a small system is that the deposit is almost entirely put to use: it is spent on energy drawn in the evening and in winter instead of being forfeited. The system pays back within 10 years at a price of up to ${h.zl(h.M.maxPriceFor(10, r.savings))}. This is an estimate for Warsaw; the calculator works it out for your municipality.`;
    },
    faqs: (h) => [
      { q: 'Which homes are best served by a 4 kWp system?', a: 'A house or half of a semi-detached home with two or three people, heating that is not electric and yearly use of 2,000 to 3,500 kWh. Also homes with a small or partly shaded roof. With higher use or a planned heat pump, compare 6 and 8 kWp straight away.' },
      { q: 'Can a small solar system be extended later?', a: 'Yes, but an extension means a new notification to the grid operator and usually a second inverter or a stronger replacement. Panels bought years later rarely match the old ones. If you plan an electric car or a heat pump within a few years, work out the target size now and ask the installer for an inverter with headroom.' },
      { q: 'How much deposit is forfeited with a 4 kWp system?', a: `Usually little or none. With 2,800 kWh of use in Warsaw the yearly deposit is about ${h.zl(S(h, 2800).depositValue)}, and nearly all of it is spent on energy drawn from the grid. A deposit is only forfeited when, over 12 months, it exceeds the cost of imported energy and the excess is above the cash refund limit.` },
    ],
    body: (h) => {
      const rows = [2000, 2800, 3500].map((u) => [`${h.num(u)} kWh`, h.pct(S(h, u, 'out').selfShare), h.pct(S(h, u, 'flat').selfShare), h.pct(S(h, u, 'home').selfShare), h.zl(S(h, u).savings)]);
      return `
<h2>How much of 4 kWp stays in the house</h2>
<p>The table shows the share of output used straight away under three patterns: house empty in the daytime, use spread evenly over the day, and someone at home all day. The saving in the last column is for the middle pattern.</p>
${h.table(['Use', 'Empty by day', 'Even over the day', 'Someone at home', 'Saving'], rows, 'Warsaw, 4 kWp, roof at 35° facing south, RCE, 2026 G11 prices.', ['l', 'r', 'r', 'r', 'r'])}
<p>The gap between the first and third columns is larger than the gap between the weakest and the best municipality in Poland. That is why, for a small system, shifting laundry, dishwashing and water heating to 10:00–15:00 does more than adding panels. The ${h.a('depozyt-prosumencki', 'prosumer deposit page')} explains the settlement in detail.</p>
<h2>Small systems and fixed costs</h2>
<p>Some installation costs do not depend on size: design, notification, protection devices, the crew’s travel and an inverter of the smallest size on offer. The price per kilowatt of a small system is therefore usually higher than for a large one, even though the total is lower. When comparing quotes, look at the total and the payback the calculator shows.</p>`;
    },
  },
});
