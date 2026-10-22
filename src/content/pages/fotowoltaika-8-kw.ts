import { definePage, type Helpers } from '../../lib/page-types';

const S = (h: Helpers, use: number, batt = 0, regime: 'rce' | 'rcem' = 'rce') => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 8, useKwh: use, batteryKwh: batt, regime });

export default definePage({
  id: 'fotowoltaika-8-kw', group: 'pv', order: 30, tool: 'pv', toolArg: '8',
  related: ['fotowoltaika-10-kw', 'pompa-ciepla-i-fotowoltaika', 'fotowoltaika-z-magazynem-energii'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'rceApi', 'ureTaryfy2026'],
  pl: {
    slug: 'fotowoltaika-8-kw', nav: 'Fotowoltaika 8 kW', card: 'Dom z pompą ciepła lub autem elektrycznym.',
    title: 'Fotowoltaika 8 kW: produkcja i zwrot przy dużym zużyciu',
    description: 'Fotowoltaika 8 kW dla domu z pompą ciepła albo autem elektrycznym: produkcja PVGIS dla gminy, ile depozytu przepada, co zmienia magazyn i kiedy jest zwrot.',
    h1: 'Fotowoltaika 8 kW: kiedy większa moc ma sens',
    intro: 'Osiem kilowatów wybierają domy, które zużywają 6000 kWh i więcej. Sprawdź, ile z tej produkcji realnie wykorzystasz.',
    resume: (h) => {
      const a = S(h, 6000), b = S(h, 4000);
      return `Instalacja 8 kWp to około 18–19 paneli i 35–40 m² dachu, a w Warszawie według PVGIS około ${h.num(a.prod)} kWh rocznie. Taka moc ma sens przede wszystkim tam, gdzie zużycie jest duże: przy 6000 kWh rocznie dom zużyje od razu około ${h.pct(a.selfShare)} produkcji i zaoszczędzi około ${h.zl(a.savings)} rocznie. Przy zużyciu 4000 kWh ta sama instalacja oszczędza ${h.zl(b.savings)}, a depozytu, który przepada po 12 miesiącach, zbiera się ${h.zl(b.lost)}. To najważniejsza lekcja net-billingu: większa instalacja zwiększa przede wszystkim sprzedaż do sieci po cenie hurtowej, a ta w 2026 r. bywała w południe ujemna. Ujemną RCE liczy się dla prosumenta jako zero, ale nadwyżka w takich godzinach nie przynosi nic. Ósemka opłaca się więc domom, które zużywają prąd w dzień: z pompą ciepła na ciepłą wodę, klimatyzacją albo samochodem ładowanym w domu.`;
    },
    faqs: (h) => [
      { q: 'Jakie zużycie uzasadnia instalację 8 kWp zamiast 6 kWp?', a: `Mniej więcej od 5500–6000 kWh rocznie. Poniżej tego progu dodatkowe dwa kilowaty trafiają głównie do sieci: przy 4000 kWh różnica w oszczędności między 6 a 8 kWp w Warszawie wynosi tylko około ${h.zl(S(h, 4000).savings - h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000 }).savings)} rocznie, a koszt dwóch kilowatów jest wielokrotnie wyższy.` },
      { q: 'Czy do instalacji 8 kWp potrzebna jest zgoda zakładu energetycznego?', a: 'Mikroinstalacja do 50 kW przyłączana jest na podstawie zgłoszenia, bez warunków przyłączenia, o ile jej moc nie przekracza mocy przyłączeniowej budynku. Moc przyłączeniową znajdziesz w umowie z operatorem albo na fakturze; jeśli jest niższa niż planowana moc paneli, trzeba najpierw złożyć wniosek o jej zwiększenie.' },
      { q: 'Czy samochód elektryczny ładowany w domu zmienia opłacalność 8 kWp?', a: 'Tak, jeśli auto stoi w domu w dzień i ładuje się, gdy panele pracują. Samochód ładowany wyłącznie nocą korzysta z depozytu, a nie z autokonsumpcji, więc zysk jest mniejszy. Wpisz w kalkulatorze zużycie razem z autem i wybierz profil „dużo w dzień”, jeśli auto ładuje się przy słońcu.' },
    ],
    body: (h) => {
      const rows = [4000, 6000, 8000, 10000].map((u) => { const r = S(h, u), m = S(h, u, 0, 'rcem'), b = S(h, u, 10); return [`${h.num(u)} kWh`, h.zl(r.savings), h.zl(m.savings), h.zl(b.savings), h.zl(r.lost)]; });
      return `
<h2>8 kWp przy różnym zużyciu, RCE i RCEm</h2>
<p>Prosument, który zaczął oddawać energię przed 1 lipca 2024 r., rozlicza się po RCEm, chyba że złożył oświadczenie o przejściu na RCE. Nowsi rozliczają się po RCE. Tabela pokazuje oba warianty i wariant z magazynem 10 kWh.</p>
${h.table(['Zużycie', 'Oszczędność, RCE', 'Oszczędność, RCEm', 'RCE i magazyn 10 kWh', 'Depozyt, który przepada'], rows, 'Warszawa, 8 kWp, 35° na południe, pobór równo przez dobę, ceny G11 2026.', ['l', 'r', 'r', 'r', 'r'])}
<p>Przy dużej instalacji różnica między RCE a RCEm rośnie, bo więcej energii trafia do sieci w godzinach z ujemną ceną. W kwietniu 2026 r. takich godzin było ${h.num(h.M.PRICES.rce['2026-04'].negativeHours)}, w maju ${h.num(h.M.PRICES.rce['2026-05'].negativeHours)}. Szczegóły i historia cen są na stronie ${h.a('rce-cena', 'RCE i RCEm')}.</p>
<h2>Pompa ciepła i 8 kWp</h2>
<p>Pompa ciepła podnosi zużycie, ale głównie zimą. Latem grzeje tylko wodę, więc letnia nadwyżka zostaje prawie taka sama. Dlatego do domu z pompą ciepła lepiej porównać moc z rzeczywistym rozkładem zużycia na stronie ${h.a('pompa-ciepla-i-fotowoltaika', 'pompa ciepła i fotowoltaika')}, zamiast dzielić roczną sumę przez uzysk z kilowata.</p>`;
    },
  },
  en: {
    slug: 'solar-8-kw', nav: 'Solar 8 kW', card: 'A home with a heat pump or an electric car.',
    title: '8 kW solar system in Poland: output and payback at high use',
    description: 'An 8 kW solar system for a Polish home with a heat pump or electric car: PVGIS output per municipality, deposit lost, what a battery changes and the payback.',
    h1: '8 kW solar system: when a bigger size makes sense',
    intro: 'Eight kilowatts suits homes using 6,000 kWh a year or more. Check how much of that output you would actually use.',
    resume: (h) => {
      const a = S(h, 6000), b = S(h, 4000);
      return `An 8 kWp system means about 18 or 19 panels and 35–40 m² of roof, and in Warsaw about ${h.num(a.prod)} kWh a year according to PVGIS. That size makes sense mainly where use is high: at 6,000 kWh a year the house uses about ${h.pct(a.selfShare)} of output on the spot and saves about ${h.zl(a.savings)} a year. At 4,000 kWh of use the same system saves ${h.zl(b.savings)}, and ${h.zl(b.lost)} of deposit is forfeited after 12 months. That is the main lesson of net-billing: a bigger system mostly increases sales to the grid at the wholesale price, and in 2026 that price was often negative at midday. A negative RCE counts as zero for a prosumer, but surplus in those hours earns nothing. Eight kilowatts therefore pays off for homes that use power in daytime: with a heat pump for hot water, air conditioning or a car charged at home.`;
    },
    faqs: (h) => [
      { q: 'What level of use justifies 8 kWp rather than 6 kWp?', a: `Roughly from 5,500–6,000 kWh a year. Below that, the two extra kilowatts mostly feed the grid: at 4,000 kWh, the difference in saving between 6 and 8 kWp in Warsaw is only about ${h.zl(S(h, 4000).savings - h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000 }).savings)} a year, while two kilowatts cost many times more.` },
      { q: 'Does an 8 kWp system need the network operator’s consent?', a: 'A micro-installation up to 50 kW is connected on the basis of a notification, without connection conditions, as long as its capacity does not exceed the building’s connection capacity. You will find the connection capacity in your grid contract or on your invoice; if it is lower than the planned panel capacity, you first have to apply to have it raised.' },
      { q: 'Does charging an electric car at home change the case for 8 kWp?', a: 'Yes, if the car is parked at home in daytime and charges while the panels work. A car charged only at night draws on the deposit, not on self-consumption, so the gain is smaller. Enter your use including the car and pick the “much in the daytime” pattern if the car charges in sunshine.' },
    ],
    body: (h) => {
      const rows = [4000, 6000, 8000, 10000].map((u) => { const r = S(h, u), m = S(h, u, 0, 'rcem'), b = S(h, u, 10); return [`${h.num(u)} kWh`, h.zl(r.savings), h.zl(m.savings), h.zl(b.savings), h.zl(r.lost)]; });
      return `
<h2>8 kWp at different levels of use, RCE and RCEm</h2>
<p>A prosumer who began exporting before 1 July 2024 is settled at RCEm unless they filed a statement switching to RCE. Newer prosumers are settled at RCE. The table shows both, plus a variant with a 10 kWh battery.</p>
${h.table(['Use', 'Saving, RCE', 'Saving, RCEm', 'RCE and 10 kWh battery', 'Deposit forfeited'], rows, 'Warsaw, 8 kWp, 35° facing south, use spread evenly over the day, 2026 G11 prices.', ['l', 'r', 'r', 'r', 'r'])}
<p>With a large system, the gap between RCE and RCEm widens, because more energy reaches the grid in hours with a negative price. April 2026 had ${h.num(h.M.PRICES.rce['2026-04'].negativeHours)} such hours and May ${h.num(h.M.PRICES.rce['2026-05'].negativeHours)}. Details and price history are on the ${h.a('rce-cena', 'RCE and RCEm')} page.</p>
<h2>A heat pump and 8 kWp</h2>
<p>A heat pump raises use, but mostly in winter. In summer it only heats water, so the summer surplus stays almost the same. For a house with a heat pump, it is better to compare the size with the real spread of use on the ${h.a('pompa-ciepla-i-fotowoltaika', 'heat pump and solar')} page than to divide the yearly total by the yield per kilowatt.</p>`;
    },
  },
});
