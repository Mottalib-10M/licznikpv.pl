import { definePage, type Helpers } from '../../lib/page-types';

const W = (h: Helpers, use: number, batt = 0) => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: use, batteryKwh: batt });
const uses = [2500, 3500, 4500, 6000];

export default definePage({
  id: 'fotowoltaika-6-kw', group: 'pv', order: 20, tool: 'pv', toolArg: '6',
  related: ['fotowoltaika-4-kw', 'fotowoltaika-8-kw', 'fotowoltaika-cena', 'net-billing'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'ureTaryfy2026', 'energaOperator'],
  pl: {
    slug: 'fotowoltaika-6-kw', nav: 'Fotowoltaika 6 kW', card: 'Produkcja, oszczędność i zwrot najczęstszej mocy domowej.',
    title: 'Fotowoltaika 6 kW: produkcja, oszczędność i zwrot 2026',
    description: 'Fotowoltaika 6 kW w Twojej gminie: ile prądu da rocznie według PVGIS, ile zużyjesz na miejscu, jaki depozyt w net-billingu i po ilu latach się zwróci.',
    h1: 'Fotowoltaika 6 kW: ile da w Twojej gminie',
    intro: 'Moc 6 kWp jest dziś najczęściej montowana na domach jednorodzinnych. Wybierz gminę i wpisz zużycie z rachunku.',
    resume: (h) => {
      const r = W(h, 4000);
      return `Instalacja fotowoltaiczna 6 kWp zajmuje około 14 paneli o mocy 430–450 W, czyli 25–30 m² dachu. Według PVGIS w Warszawie wyprodukuje rocznie około ${h.num(r.prod)} kWh, a w zależności od gminy od ${h.num(6 * h.M.MODEL.national.min)} do ${h.num(6 * h.M.MODEL.national.max)} kWh. Przy zużyciu 4000 kWh rocznie i poborze rozłożonym na całą dobę dom zużyje od razu około ${h.pct(r.selfShare)} produkcji. Reszta, około ${h.num(r.exp)} kWh, trafi do sieci i zamieni się w depozyt prosumencki wart ${h.zl(r.depositValue)}. Łączna oszczędność na rachunkach wynosi wtedy około ${h.zl(r.savings)} rocznie, przy cenach taryfy G11 na 2026 r. i cenach RCEm z ostatnich 12 miesięcy. Instalacja zwróci się w 10 lat, jeśli kosztuje najwyżej ${h.zl(h.M.maxPriceFor(10, r.savings))} bez dotacji. Kalkulator powyżej przelicza to samo dla Twojej gminy, zużycia, dachu i magazynu.`;
    },
    faqs: (h) => [
      { q: 'Ile paneli i ile miejsca na dachu potrzeba na 6 kWp?', a: 'Przy panelach o mocy 430–450 W potrzeba 14 sztuk, a przy starszych panelach 400 W piętnastu. Jeden panel ma około 1,9–2 m², więc cała instalacja zajmuje 25–30 m² połaci, plus odstępy od krawędzi i kalenicy. Dach na wschód i zachód mieści tę samą moc, ale dzieloną na dwie połacie.' },
      { q: 'Na jakie roczne zużycie prądu pasuje instalacja 6 kWp?', a: `Sześć kilowatów wyprodukuje w Polsce od ${h.num(6 * h.M.MODEL.national.min)} do ${h.num(6 * h.M.MODEL.national.max)} kWh rocznie. W net-billingu nie warto dobierać mocy „na całe zużycie”, bo nadwyżka jest sprzedawana tanio. Moc 6 kWp najlepiej pasuje do domu zużywającego 4000–6000 kWh, zwłaszcza gdy część poboru przypada na dzień.` },
      { q: 'Czy 6 kWp wystarczy, jeśli planuję pompę ciepła?', a: 'Pompa ciepła w domu 120–150 m² zużywa kilka tysięcy kilowatogodzin rocznie, głównie od listopada do lutego, gdy panele produkują najmniej. Większa instalacja zwiększy więc głównie nadwyżkę latem. Zanim dobierzesz moc, policz zużycie pompy na stronie o pompie ciepła i fotowoltaice.' },
      { q: 'Ile prądu z 6 kWp zużyję od razu, a ile oddam do sieci?', a: `To zależy od pory zużycia. W domu, w którym w dzień nikogo nie ma, przy 4000 kWh rocznie na miejscu trafia około ${h.pct(h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, profile: 'out' }).selfShare)} produkcji, a przy pracy z domu około ${h.pct(h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, profile: 'home' }).selfShare)}. Pralka i zmywarka włączane w południe podnoszą ten udział bez żadnych kosztów.` },
    ],
    body: (h) => {
      const rows = uses.map((u) => { const r = W(h, u), b = W(h, u, 10); return [`${h.num(u)} kWh`, h.pct(r.selfShare), h.zl(r.savings), h.zl(b.savings), h.zl(h.M.maxPriceFor(10, r.savings))]; });
      return `
<h2>Oszczędność 6 kWp przy różnym zużyciu</h2>
<p>Ta sama instalacja daje różną korzyść w różnych domach. Im większe zużycie, tym więcej produkcji trafia od razu do gniazdek i tym mniej do sieci po cenie hurtowej. Tabela dotyczy Warszawy, dachu 35° na południe i rozliczenia po RCE.</p>
${h.table(['Zużycie rocznie', 'Zużyte na miejscu', 'Oszczędność', 'Z magazynem 10 kWh', 'Zwrot w 10 lat do'], rows, 'Warszawa, 1050 kWh/kWp, pobór równo przez dobę, ceny G11 2026, RCEm z 12 miesięcy.', ['l', 'r', 'r', 'r', 'r'])}
<p>Ostatnia kolumna nie jest ceną rynkową. Pokazuje, ile instalacja może kosztować, żeby oszczędność oddała ją w 10 lat. Jeśli masz ofertę instalatora, wpisz jej kwotę w kalkulatorze w polu „Cena z oferty”, a zobaczysz liczbę lat.</p>
<h2>Kiedy 6 kWp to za dużo, a kiedy za mało</h2>
<p>Za dużo, gdy dom zużywa mniej niż 3000 kWh rocznie: ponad połowa produkcji trafia wtedy do sieci, a depozytu nie ma na co wydać, bo pokrywa on tylko część „energia” rachunku. Nadwyżkę ponad potrzeby zwraca się w gotówce najwyżej do 30 % wartości oddanej energii, reszta przepada po 12 miesiącach. W takim domu lepiej sprawdzi się ${h.a('fotowoltaika-4-kw', 'instalacja 4 kW')}.</p>
<p>Za mało, gdy w domu jest pompa ciepła, samochód elektryczny albo klimatyzacja pracująca w dzień. Wtedy warto porównać ${h.a('fotowoltaika-8-kw', '8 kW')} i ${h.a('fotowoltaika-10-kw', '10 kW')}, pamiętając, że moc przyłączeniowa mikroinstalacji nie może przekroczyć mocy przyłączeniowej budynku.</p>`;
    },
  },
  en: {
    slug: 'solar-6-kw', nav: 'Solar 6 kW', card: 'Output, saving and payback of the most common home size.',
    title: '6 kW solar system in Poland: output, saving and payback',
    description: 'A 6 kW solar system in your Polish municipality: yearly PVGIS output, how much you use on site, the net-billing deposit and how many years it takes to pay back.',
    h1: '6 kW solar system: what it yields in your municipality',
    intro: 'A 6 kWp system is the size most often fitted to Polish family homes today. Pick your municipality and enter the use shown on your bill.',
    resume: (h) => {
      const r = W(h, 4000);
      return `A 6 kWp solar system takes about 14 panels of 430–450 W, or 25–30 m² of roof. According to PVGIS it produces about ${h.num(r.prod)} kWh a year in Warsaw, and between ${h.num(6 * h.M.MODEL.national.min)} and ${h.num(6 * h.M.MODEL.national.max)} kWh depending on the municipality. With 4,000 kWh of yearly use spread over the whole day, the house uses about ${h.pct(r.selfShare)} of the output straight away. The rest, about ${h.num(r.exp)} kWh, goes to the grid and becomes a prosumer deposit worth ${h.zl(r.depositValue)}. The total saving on bills is then about ${h.zl(r.savings)} a year, at 2026 G11 tariff prices and RCEm prices over the last 12 months. The system pays back within 10 years if it costs no more than ${h.zl(h.M.maxPriceFor(10, r.savings))} without a grant. The calculator above reworks the same figures for your municipality, use, roof and battery.`;
    },
    faqs: (h) => [
      { q: 'How many panels and how much roof does a 6 kWp system need?', a: 'With 430–450 W panels you need 14 of them, or fifteen of the older 400 W type. Each panel covers about 1.9–2 m², so the whole system takes 25–30 m² of roof plane, plus the gaps required from edges and the ridge. An east-west roof holds the same power split across two planes.' },
      { q: 'What yearly electricity use suits a 6 kWp system?', a: `Six kilowatts produce between ${h.num(6 * h.M.MODEL.national.min)} and ${h.num(6 * h.M.MODEL.national.max)} kWh a year in Poland. Under net-billing it does not pay to size the system to cover all your use, because the surplus sells cheaply. A 6 kWp system suits a house using 4,000 to 6,000 kWh, especially when some of that use falls in daytime.` },
      { q: 'Is 6 kWp enough if I plan to install a heat pump?', a: 'A heat pump in a 120–150 m² house uses several thousand kilowatt-hours a year, mostly from November to February, when panels produce least. A bigger system therefore mainly adds summer surplus. Before choosing a size, work out the pump’s consumption on the heat pump and solar page.' },
      { q: 'How much of the 6 kWp output will I use myself, and how much goes to the grid?', a: `It depends on when you use power. In a home that is empty in the daytime, with 4,000 kWh a year, about ${h.pct(h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, profile: 'out' }).selfShare)} of output is used on site; when someone works from home, about ${h.pct(h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, profile: 'home' }).selfShare)}. Running the washing machine and dishwasher at midday raises that share at no cost.` },
    ],
    body: (h) => {
      const rows = uses.map((u) => { const r = W(h, u), b = W(h, u, 10); return [`${h.num(u)} kWh`, h.pct(r.selfShare), h.zl(r.savings), h.zl(b.savings), h.zl(h.M.maxPriceFor(10, r.savings))]; });
      return `
<h2>Saving from 6 kWp at different levels of use</h2>
<p>The same system brings a different benefit to different homes. The higher the use, the more output goes straight to the sockets and the less to the grid at the wholesale price. The table is for Warsaw, a roof at 35° facing south and settlement at RCE.</p>
${h.table(['Yearly use', 'Used on site', 'Saving', 'With 10 kWh battery', '10-year payback up to'], rows, 'Warsaw, 1,050 kWh/kWp, use spread evenly over the day, 2026 G11 prices, RCEm over 12 months.', ['l', 'r', 'r', 'r', 'r'])}
<p>The last column is not a market price. It shows how much the system may cost for the saving to repay it within 10 years. If you have an installer’s quote, enter it in the calculator’s “Quoted price” field to see the number of years.</p>
<h2>When 6 kWp is too much, and when too little</h2>
<p>Too much when the house uses under 3,000 kWh a year: over half the output then goes to the grid, and the deposit has nothing to pay for, since it covers only the energy part of the bill. A surplus above your needs is refunded in cash up to 30% of the value of exported energy at most; the rest is forfeited after 12 months. Such a house is better served by a ${h.a('fotowoltaika-4-kw', '4 kW system')}.</p>
<p>Too little when the house has a heat pump, an electric car or air conditioning running in the daytime. Then compare ${h.a('fotowoltaika-8-kw', '8 kW')} and ${h.a('fotowoltaika-10-kw', '10 kW')}, bearing in mind that a micro-installation’s grid capacity may not exceed the connection capacity of the building.</p>`;
    },
  },
});
