import { definePage, type Helpers } from '../../lib/page-types';
import type { Profile } from '../../lib/engine/pv';

const S = (h: Helpers, kwp: number, use: number, profile: Profile = 'flat', batteryKwh = 0) => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp, useKwh: use, profile, batteryKwh });

export default definePage({
  id: 'czy-fotowoltaika-sie-oplaca', group: 'pv', order: 55, tool: 'pv',
  related: ['fotowoltaika-cena', 'net-billing', 'fotowoltaika-z-magazynem-energii', 'fotowoltaika-6-kw'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'ureTaryfy2026', 'netBillingGov'],
  pl: {
    slug: 'czy-fotowoltaika-sie-oplaca', nav: 'Czy fotowoltaika się opłaca', card: 'Kiedy panele zwracają się szybko, a kiedy wcale.',
    title: 'Czy fotowoltaika się opłaca w 2026? Zwrot w net-billingu',
    description: 'Czy fotowoltaika się opłaca w 2026 r.: oszczędność i lata zwrotu w net-billingu dla Twojej gminy, zużycia i pory poboru, z cenami G11 i RCE na 2026 r.',
    h1: 'Czy fotowoltaika się opłaca w 2026 roku',
    intro: 'Opłacalność zależy od Twojego domu, nie od średniej. Wpisz gminę, moc i zużycie, a potem cenę z oferty.',
    resume: (h) => {
      const f = S(h, 6, 4000), o = S(h, 6, 4000, 'out'), d = S(h, 6, 4000, 'home');
      return `Fotowoltaika w 2026 r. opłaca się wtedy, gdy dom zużywa dużą część prądu w chwili, gdy panele pracują, a instalacja nie jest przewymiarowana. Powód jest prosty: kilowatogodzina zużyta od razu oszczędza pełną cenę z rachunku, około ${h.zl(f.priceGross, 2)} w taryfie G11, a oddana do sieci zamienia się w depozyt wart średnio kilkadziesiąt groszy, który pokrywa tylko część „energia” rachunku. Dla 6 kWp w Warszawie i zużycia 4000 kWh roczna oszczędność wynosi około ${h.zl(o.savings)}, gdy w dzień nikogo nie ma w domu, ${h.zl(f.savings)} przy poborze rozłożonym równo i ${h.zl(d.savings)} przy pracy z domu. Przy cenie 24 000 zł daje to zwrot w ${h.num(24000 / o.savings, 1)}, ${h.num(24000 / f.savings, 1)} albo ${h.num(24000 / d.savings, 1)} roku. Panele pracują 25–30 lat, a rozliczenie w net-billingu trwa 15 lat od przyłączenia. Kalkulator powyżej liczy to samo dla Twojej gminy i ceny z oferty.`;
    },
    faqs: (h) => [
      { q: 'Po ilu latach zwraca się fotowoltaika w 2026 roku?', a: `To zależy od ceny i od tego, ile prądu zużywasz w dzień. Dla 6 kWp w Warszawie przy zużyciu 4000 kWh oszczędność wynosi około ${h.zl(S(h, 6, 4000).savings)} rocznie, więc instalacja za 24 000 zł zwraca się w około ${h.num(24000 / S(h, 6, 4000).savings, 1)} roku. Wpisz w kalkulatorze cenę z oferty, a dostaniesz liczbę lat dla swojego domu.` },
      { q: 'Czy fotowoltaika opłaca się bez magazynu energii?', a: `Tak, magazyn nie jest warunkiem opłacalności. Podnosi autokonsumpcję i oszczędność, w przykładzie 6 kWp z ${h.zl(S(h, 6, 4000).savings)} do ${h.zl(S(h, 6, 4000, 'flat', 10).savings)} rocznie, ale sam kosztuje kilkanaście tysięcy złotych. Bez magazynu zwrot bywa krótszy, jeśli zużycie w dzień jest wysokie albo jeśli przesuniesz pranie i zmywanie na południe.` },
      { q: 'Kiedy fotowoltaika się nie opłaca?', a: 'Gdy dach jest mocno zacieniony, gdy dom zużywa mniej niż 2000 kWh rocznie, gdy moc jest dobrana „na zapas” albo gdy cena instalacji przekracza piętnastokrotność rocznej oszczędności. Wtedy większość produkcji trafia do sieci po cenie hurtowej, depozyt nie ma na co się rozejść, a zwrot przekracza okres gwarancji falownika.' },
      { q: 'Czy wzrost cen prądu skróci zwrot fotowoltaiki?', a: 'Tak, ale nie wiemy o ile, dlatego go nie zakładamy. Wyższa cena prądu podnosi wartość energii zużytej od razu. Cena nadwyżki zależy jednak od rynku hurtowego, a ten w południe, gdy produkują panele, ma coraz więcej godzin z ceną bliską zera. Kalkulator pozwala wpisać własne ceny energii i dystrybucji.' },
    ],
    body: (h) => {
      const rows = (['out', 'flat', 'home'] as Profile[]).map((p) => { const r = S(h, 6, 4000, p); return [{ out: 'w dzień poza domem', flat: 'równo przez dobę', home: 'praca z domu' }[p], h.pct(r.selfShare), h.zl(r.savings), `${h.num(24000 / r.savings, 1)} roku`, `${h.num(32000 / r.savings, 1)} roku`]; });
      return `
<h2>Ta sama instalacja, trzy różne domy</h2>
<p>Najwięcej o opłacalności mówi pora zużycia. Tabela pokazuje instalację 6 kWp w Warszawie przy zużyciu 4000 kWh i trzech sposobach życia domowników. Zmienia się tylko to, kiedy dom bierze prąd, a oszczędność różni się o kilkaset złotych rocznie.</p>
${h.table(['Kiedy zużywasz prąd', 'Zużyte na miejscu', 'Oszczędność', 'Zwrot przy 24 000 zł', 'przy 32 000 zł'], rows, 'Warszawa, 6 kWp, 35° na południe, RCE, ceny G11 2026, bez dotacji i bez magazynu.', ['l', 'r', 'r', 'r', 'r'])}
<p>Kwoty 24 000 i 32 000 zł nie są cenami rynkowymi, tylko przykładowymi wartościami do porównania. Swoją ofertę wpisz w kalkulatorze albo w mini-kalkulatorze poniżej.</p>
<!--mini:zwrot-->
<h2>Pięć warunków, przy których fotowoltaika się opłaca</h2>
<p>Po pierwsze dach bez cienia i z połacią na południe, wschód albo zachód. Po drugie moc dobrana do zużycia, a nie do wielkości dachu: w ${h.a('net-billing', 'net-billingu')} każdy kolejny kilowat dokłada coraz mniej. Po trzecie pobór w ciągu dnia: pompa ciepła do wody, pralka, zmywarka, ładowanie auta w południe. Po czwarte cena z oferty sprawdzona na stronie ${h.a('fotowoltaika-cena', 'cena fotowoltaiki')}. Po piąte rozliczenie po RCE, które ma limit zwrotu nadpłaty 30 zamiast 20 % i nie schodzi poniżej zera.</p>
<p>Jeśli większość tych warunków jest spełniona, prosty zwrot mieści się zwykle w 6–9 latach. Jeśli żaden, warto rozważyć mniejszą instalację albo ${h.a('fotowoltaika-z-magazynem-energii', 'instalację z magazynem energii')} z dotacją z programu Przydomowe Magazyny Energii.</p>`;
    },
  },
  en: {
    slug: 'is-solar-worth-it-poland', nav: 'Is solar worth it', card: 'When panels pay back fast, and when they never do.',
    title: 'Is solar worth it in Poland in 2026? Net-billing payback',
    description: 'Is solar worth it in Poland in 2026: yearly saving and payback under net-billing for your municipality, consumption and time of use, at 2026 G11 prices.',
    h1: 'Is solar worth it in Poland in 2026',
    intro: 'Whether it pays depends on your house, not on an average. Enter your municipality, size and consumption, then your quoted price.',
    resume: (h) => {
      const f = S(h, 6, 4000), o = S(h, 6, 4000, 'out'), d = S(h, 6, 4000, 'home');
      return `Solar pays in Poland in 2026 when the house uses much of its power while the panels are working and the system is not oversized. The reason is simple: a kilowatt-hour used on the spot saves the full bill price, about ${h.zl(f.priceGross, 2)} on the G11 tariff, while one exported to the grid becomes a deposit worth a few tens of groszy on average, which only pays the energy part of the bill. For 6 kWp in Warsaw and 4,000 kWh of use, the yearly saving is about ${h.zl(o.savings)} when nobody is home in the daytime, ${h.zl(f.savings)} when use is spread evenly and ${h.zl(d.savings)} when someone works from home. At a price of PLN 24,000 that means payback in ${h.num(24000 / o.savings, 1)}, ${h.num(24000 / f.savings, 1)} or ${h.num(24000 / d.savings, 1)} years. Panels work for 25–30 years, and net-billing settlement lasts 15 years from connection. The calculator above does the same for your municipality and your quote.`;
    },
    faqs: (h) => [
      { q: 'How many years does solar take to pay back in 2026?', a: `It depends on the price and on how much power you use in the daytime. For 6 kWp in Warsaw with 4,000 kWh of use the saving is about ${h.zl(S(h, 6, 4000).savings)} a year, so a PLN 24,000 system pays back in about ${h.num(24000 / S(h, 6, 4000).savings, 1)} years. Enter your quoted price in the calculator to get the figure for your own house.` },
      { q: 'Is solar worth it without a home battery?', a: `Yes, a battery is not a condition. It raises self-consumption and the saving, in the 6 kWp example from ${h.zl(S(h, 6, 4000).savings)} to ${h.zl(S(h, 6, 4000, 'flat', 10).savings)} a year, but it costs well over ten thousand zloty itself. Without one, payback is often shorter if daytime use is high or if you move washing and dishwashing to midday.` },
      { q: 'When is solar not worth it?', a: 'When the roof is heavily shaded, when the house uses less than 2,000 kWh a year, when the system is sized with a big margin, or when its price exceeds fifteen times the yearly saving. Most output then goes to the grid at wholesale price, the deposit has nothing to pay for, and payback outlasts the inverter warranty.' },
      { q: 'Will rising power prices shorten solar payback?', a: 'Yes, but we do not know by how much, so we do not assume it. A higher power price raises the value of energy used on the spot. The surplus price, however, follows the wholesale market, which at midday, when panels produce, has more and more hours priced near zero. The calculator lets you enter your own energy and distribution prices.' },
    ],
    body: (h) => {
      const rows = (['out', 'flat', 'home'] as Profile[]).map((p) => { const r = S(h, 6, 4000, p); return [{ out: 'out during the day', flat: 'evenly round the clock', home: 'working from home' }[p], h.pct(r.selfShare), h.zl(r.savings), `${h.num(24000 / r.savings, 1)} years`, `${h.num(32000 / r.savings, 1)} years`]; });
      return `
<h2>The same system, three different houses</h2>
<p>Time of use says most about whether solar pays. The table shows a 6 kWp system in Warsaw with 4,000 kWh of use and three household routines. Only the time at which the house draws power changes, yet the saving differs by several hundred zloty a year.</p>
${h.table(['When you use power', 'Used on site', 'Saving', 'Payback at PLN 24,000', 'at PLN 32,000'], rows, 'Warsaw, 6 kWp, 35° south, RCE, 2026 G11 prices, no grant and no battery.', ['l', 'r', 'r', 'r', 'r'])}
<p>PLN 24,000 and PLN 32,000 are not market prices, only example figures for comparison. Enter your own quote in the calculator or in the mini-calculator below.</p>
<!--mini:zwrot-->
<h2>Five conditions under which solar pays</h2>
<p>First, a roof without shade, facing south, east or west. Second, a size matched to consumption, not to the roof: under ${h.a('net-billing', 'net-billing')} each extra kilowatt adds less and less. Third, daytime use: a heat-pump water heater, washing machine, dishwasher, charging a car at midday. Fourth, a quote checked on the ${h.a('fotowoltaika-cena', 'solar panel cost')} page. Fifth, settlement at RCE, which has a 30% instead of 20% refund cap and never goes below zero.</p>
<p>If most of these conditions are met, simple payback usually falls within 6–9 years. If none is, consider a smaller system or ${h.a('fotowoltaika-z-magazynem-energii', 'solar with a home battery')} with a grant from the Przydomowe Magazyny Energii programme.</p>`;
    },
  },
});
