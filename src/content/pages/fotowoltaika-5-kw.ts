import { definePage, type Helpers } from '../../lib/page-types';

const W = (h: Helpers, use: number, batt = 0, profile: 'out' | 'flat' | 'home' = 'flat') => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 5, useKwh: use, batteryKwh: batt, profile });
const YEARS = [8, 10, 12];

export default definePage({
  id: 'fotowoltaika-5-kw', group: 'pv', order: 15, tool: 'pv', toolArg: '5',
  related: ['fotowoltaika-4-kw', 'fotowoltaika-6-kw', 'fotowoltaika-cena', 'magazyn-energii-cena'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'ureTaryfy2026'],
  pl: {
    slug: 'fotowoltaika-5-kw', nav: 'Fotowoltaika 5 kW', card: 'Ile może kosztować 5 kWp, żeby zwrot był w 8, 10 albo 12 lat.',
    title: 'Fotowoltaika 5 kW: ile kosztuje, ile da i kiedy się zwróci',
    description: 'Ile kosztuje fotowoltaika 5 kW, żeby się opłacała: produkcja w Twojej gminie według PVGIS, oszczędność w net-billingu i cena, przy której zwrot jest w 10 lat.',
    h1: 'Fotowoltaika 5 kW: ile może kosztować i kiedy się zwróci',
    intro: 'Pięć kilowatów to moc dla domu, który zużywa około 3000–4500 kWh rocznie. Wpisz zużycie z rachunku i cenę z oferty.',
    resume: (h) => {
      const r = W(h, 3500);
      return `Instalacja fotowoltaiczna 5 kWp to zwykle 11–12 paneli o mocy 430–450 W, czyli około 22–25 m² dachu. Według PVGIS w Warszawie wyprodukuje rocznie około ${h.num(r.prod)} kWh, a w zależności od gminy od ${h.num(5 * h.M.MODEL.national.min)} do ${h.num(5 * h.M.MODEL.national.max)} kWh. Pytanie „ile kosztuje fotowoltaika 5 kW” ma dwie odpowiedzi: cenę z oferty instalatora i cenę, przy której inwestycja się zwraca. Tę drugą liczymy z oszczędności. Dom zużywający 3500 kWh rocznie, z poborem rozłożonym na całą dobę, zużyje od razu około ${h.pct(r.selfShare)} produkcji i zaoszczędzi około ${h.zl(r.savings)} rocznie przy cenach G11 na 2026 r. i rozliczeniu po RCE. Żeby instalacja zwróciła się w 10 lat, może więc kosztować najwyżej ${h.zl(h.M.maxPriceFor(10, r.savings))} po odjęciu dotacji i ulgi. Kalkulator powyżej przelicza to dla Twojej gminy, zużycia i oferty.`;
    },
    faqs: (h) => [
      { q: 'Ile kosztuje fotowoltaika 5 kW, żeby zwrot był w 10 lat?', a: `Przy zużyciu 3500 kWh rocznie i poborze równo przez dobę najwyżej ${h.zl(h.M.maxPriceFor(10, W(h, 3500).savings))}, a w domu, w którym ktoś pracuje w dzień, do ${h.zl(h.M.maxPriceFor(10, W(h, 3500, 0, 'home').savings))}. To nie jest cena rynkowa, tylko granica opłacalności. Ofertę droższą od tej kwoty porównaj z innymi albo sprawdź, czy obejmuje coś więcej niż panele i falownik.` },
      { q: 'Czy 5 kWp to dobra moc dla domu z rachunkiem około 3500 kWh?', a: `Tak, to jedna z najlepiej dopasowanych mocy. Pięć kilowatów da w Polsce od ${h.num(5 * h.M.MODEL.national.min)} do ${h.num(5 * h.M.MODEL.national.max)} kWh, czyli tyle, ile dom zużywa w roku, ale nadwyżka letnia nie jest tak duża, żeby depozyt przepadał. Przy mniejszym zużyciu lepszy będzie wariant 4 kW, przy pompie ciepła raczej 8 kW.` },
      { q: 'Czy do instalacji 5 kWp warto dokupić magazyn 5 kWh?', a: `Magazyn 5 kWh podnosi oszczędność tego domu z ${h.zl(W(h, 3500).savings)} do około ${h.zl(W(h, 3500, 5).savings)} rocznie, bo wieczorem zużywasz energię z dnia zamiast oddawać ją po cenie rynkowej. Czy to się zwróci, zależy od ceny magazynu i dotacji z programu Przydomowe Magazyny Energii, którą liczy osobny kalkulator.` },
      { q: 'Ile prądu da 5 kWp zimą, a ile latem?', a: `W Warszawie instalacja 5 kWp daje w grudniu około ${h.num(W(h, 3500).months[11].prod)} kWh, a w lipcu około ${h.num(W(h, 3500).months[6].prod)} kWh, czyli około ${h.num(W(h, 3500).months[6].prod / W(h, 3500).months[11].prod, 0)} razy więcej. Dlatego zimą dom kupuje prąd z sieci mimo paneli, a latem oddaje nadwyżkę. Depozyt z lata pokrywa część „energia” zimowych rachunków, ale dystrybucję płacisz zawsze.` },
    ],
    body: (h) => {
      const uses = [2500, 3500, 4500];
      const rows = uses.map((u) => { const r = W(h, u); return [`${h.num(u)} kWh`, h.zl(r.savings), ...YEARS.map((y) => h.zl(h.M.maxPriceFor(y, r.savings)))]; });
      return `
<h2>Ile może kosztować 5 kWp przy różnym zużyciu</h2>
<p>Tabela pokazuje cenę instalacji po odjęciu dotacji i ulgi, przy której oszczędność odda ją w 8, 10 albo 12 lat. Liczymy dla Warszawy, dachu 35° na południe, poboru równo przez dobę i rozliczenia po RCE.</p>
${h.table(['Zużycie rocznie', 'Oszczędność rocznie', 'Zwrot w 8 lat', 'Zwrot w 10 lat', 'Zwrot w 12 lat'], rows, 'PVGIS 5.3 (1050 kWh/kWp), ceny G11 2026, RCEm z 12 miesięcy z premią RCE, bez zmian cen w czasie.', ['l', 'r', 'r', 'r', 'r'])}
<p>Rozliczenie w net-billingu trwa 15 lat, a panele mają zwykle dłuższą gwarancję mocy, więc zwrot w 12 lat wciąż zostawia kilka lat czystego zysku. Zwrot dłuższy niż 15 lat oznacza, że oferta jest za droga albo moc źle dobrana do zużycia.</p>
<h2>5 kW czy 6 kW: kiedy dopłacić do większej mocy</h2>
<p>Szósty kilowat dodaje około ${h.num(1050)} kWh produkcji rocznie w Warszawie. W domu o zużyciu 3500 kWh większość z tego trafi do sieci latem, więc dołoży mniej oszczędności niż poprzednie kilowaty: ${h.zl(h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 3500 }).savings - W(h, 3500).savings)} rocznie. Opłaca się, gdy instalator dolicza za niego mniej niż dziesięciokrotność tej kwoty. Szczegóły większej mocy pokazuje strona ${h.a('fotowoltaika-6-kw', 'fotowoltaika 6 kW')}, a mniejszej ${h.a('fotowoltaika-4-kw', 'fotowoltaika 4 kW')}.</p>
<p>Jeśli masz już ofertę, wpisz jej kwotę w polu „Cena z oferty” w kalkulatorze. Zobaczysz liczbę lat zwrotu dla swojej gminy, zużycia i orientacji dachu. Jak czytać ofertę i porównać kilka z nich, opisuje strona o ${h.a('fotowoltaika-cena', 'cenie fotowoltaiki')}.</p>`;
    },
  },
  en: {
    slug: 'solar-5-kw', nav: 'Solar 5 kW', card: 'What 5 kWp may cost for an 8, 10 or 12-year payback.',
    title: '5 kW solar system in Poland: cost, output and payback',
    description: 'What a 5 kW solar system in Poland may cost and still pay off: PVGIS output in your municipality, the net-billing saving and the price for a 10-year payback.',
    h1: '5 kW solar system: what it may cost and when it pays back',
    intro: 'Five kilowatts suits a house using about 3,000 to 4,500 kWh a year. Enter the use from your bill and the quoted price.',
    resume: (h) => {
      const r = W(h, 3500);
      return `A 5 kWp solar system usually means 11 or 12 panels of 430–450 W, or about 22–25 m² of roof. According to PVGIS it produces about ${h.num(r.prod)} kWh a year in Warsaw, and between ${h.num(5 * h.M.MODEL.national.min)} and ${h.num(5 * h.M.MODEL.national.max)} kWh depending on the municipality. The question “how much does a 5 kW system cost” has two answers: the installer’s quote and the price at which the investment pays back. We work out the second from the saving. A house using 3,500 kWh a year, spread over the whole day, uses about ${h.pct(r.selfShare)} of the output straight away and saves about ${h.zl(r.savings)} a year at 2026 G11 prices with RCE settlement. To pay back within 10 years the system may therefore cost at most ${h.zl(h.M.maxPriceFor(10, r.savings))} after grants and tax relief. The calculator above reworks this for your municipality, use and quote.`;
    },
    faqs: (h) => [
      { q: 'What can a 5 kW system cost for a 10-year payback?', a: `With 3,500 kWh of yearly use spread evenly over the day, at most ${h.zl(h.M.maxPriceFor(10, W(h, 3500).savings))}, and in a home where someone works in the daytime up to ${h.zl(h.M.maxPriceFor(10, W(h, 3500, 0, 'home').savings))}. That is not a market price but the break-even limit. Compare any quote above it with others, or check whether it covers more than panels and an inverter.` },
      { q: 'Is 5 kWp a good size for a house with a bill of about 3,500 kWh?', a: `Yes, it is one of the best-matched sizes. Five kilowatts give between ${h.num(5 * h.M.MODEL.national.min)} and ${h.num(5 * h.M.MODEL.national.max)} kWh in Poland, about what the house uses in a year, yet the summer surplus is not so large that the deposit is lost. With lower use the 4 kW option is better; with a heat pump, rather 8 kW.` },
      { q: 'Should a 5 kWp system come with a 5 kWh battery?', a: `A 5 kWh battery raises this house’s saving from ${h.zl(W(h, 3500).savings)} to about ${h.zl(W(h, 3500, 5).savings)} a year, because in the evening you use daytime energy instead of exporting it at the market price. Whether it pays back depends on the battery price and the grant from the Przydomowe Magazyny Energii programme, which a separate calculator works out.` },
      { q: 'How much power does 5 kWp give in winter and in summer?', a: `In Warsaw a 5 kWp system gives about ${h.num(W(h, 3500).months[11].prod)} kWh in December and about ${h.num(W(h, 3500).months[6].prod)} kWh in July, about ${h.num(W(h, 3500).months[6].prod / W(h, 3500).months[11].prod, 0)} times as much. That is why in winter the house buys power from the grid despite the panels, and in summer exports a surplus. The summer deposit pays part of the energy share of winter bills, but distribution is always charged.` },
    ],
    body: (h) => {
      const uses = [2500, 3500, 4500];
      const rows = uses.map((u) => { const r = W(h, u); return [`${h.num(u)} kWh`, h.zl(r.savings), ...YEARS.map((y) => h.zl(h.M.maxPriceFor(y, r.savings)))]; });
      return `
<h2>What 5 kWp may cost at different levels of use</h2>
<p>The table shows the system price after grants and relief at which the saving repays it within 8, 10 or 12 years. Figures are for Warsaw, a roof at 35° facing south, use spread evenly over the day and RCE settlement.</p>
${h.table(['Yearly use', 'Yearly saving', '8-year payback', '10-year payback', '12-year payback'], rows, 'PVGIS 5.3 (1,050 kWh/kWp), 2026 G11 prices, RCEm over 12 months with the RCE bonus, prices held constant.', ['l', 'r', 'r', 'r', 'r'])}
<p>Net-billing settlement lasts 15 years, and panels usually carry a longer power warranty, so a 12-year payback still leaves several years of clear gain. A payback longer than 15 years means the quote is too high or the size is badly matched to use.</p>
<h2>5 kW or 6 kW: when to pay for more power</h2>
<p>The sixth kilowatt adds about ${h.num(1050)} kWh of yearly output in Warsaw. In a house using 3,500 kWh, most of it goes to the grid in summer, so it adds less saving than the earlier kilowatts: ${h.zl(h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 3500 }).savings - W(h, 3500).savings)} a year. It pays when the installer charges less than ten times that amount for it. The larger size is covered on the ${h.a('fotowoltaika-6-kw', '6 kW solar')} page, the smaller on the ${h.a('fotowoltaika-4-kw', '4 kW solar')} page.</p>
<p>If you already have a quote, enter it in the calculator’s “Quoted price” field. You will see the payback in years for your municipality, use and roof direction. How to read a quote and compare several is explained on the ${h.a('fotowoltaika-cena', 'solar price')} page.</p>`;
    },
  },
});
