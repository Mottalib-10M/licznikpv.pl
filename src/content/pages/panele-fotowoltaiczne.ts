import { definePage, type Helpers } from '../../lib/page-types';

/** Produkcja roczna 6 kWp w Warszawie dla danej strony dachu i nachylenia (PVGIS, kształt mazowiecki). */
const Y = (h: Helpers, tilt: number, aspect: '0' | '-45' | '45' | '-90' | '90') => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, tilt, aspect }).prod;

export default definePage({
  id: 'panele-fotowoltaiczne', group: 'pv', order: 5, tool: 'orientacja',
  related: ['ile-pradu-produkuje-fotowoltaika', 'fotowoltaika-6-kw', 'czy-fotowoltaika-sie-oplaca', 'fotowoltaika-cena'],
  sources: ['pvgis', 'pvgisTool', 'ozeAct', 'ureTaryfy2026'],
  pl: {
    slug: 'panele-fotowoltaiczne', nav: 'Panele fotowoltaiczne', card: 'Ile prądu da dach według strony świata i kąta.',
    title: 'Panele fotowoltaiczne: ile prądu da dach i jak je ustawić',
    description: 'Panele fotowoltaiczne na Twoim dachu: produkcja z PVGIS dla gminy, wpływ strony świata i kąta nachylenia, liczba paneli na daną moc i miejsce na dachu.',
    h1: 'Panele fotowoltaiczne: ile prądu da Twój dach',
    intro: 'Wybierz gminę, moc i stronę dachu. Tabela pod wynikiem pokazuje produkcję dla każdego kąta i każdej strony świata.',
    resume: (h) => `Panel fotowoltaiczny zamienia światło na prąd stały, a falownik zamienia go na prąd zmienny, którego używa dom. O tym, ile energii da cały dach, decydują trzy rzeczy: nasłonecznienie w gminie, strona świata i kąt połaci, a dopiero potem marka paneli. Według PVGIS 1 kWp na dachu 35° skierowanym na południe daje w Polsce od ${h.num(h.M.MODEL.national.min)} do ${h.num(h.M.MODEL.national.max)} kWh rocznie. W Warszawie instalacja 6 kWp na południe wyprodukuje około ${h.num(Y(h, 35, '0'))} kWh, na wschód albo zachód około ${h.num(Y(h, 35, '90'))} kWh, czyli o ${h.pct(1 - Y(h, 35, '90') / Y(h, 35, '0'))} mniej. Dach wschód-zachód nie jest więc przeszkodą, a w net-billingu bywa nawet korzystny, bo rozkłada produkcję na ranek i popołudnie, gdy dom zużywa więcej. Kalkulator powyżej liczy produkcję dla Twojej gminy, mocy, strony dachu i kąta nachylenia, a tabela pod nim pokazuje, ile tracisz przy każdym innym ustawieniu paneli na tym samym dachu.`,
    faqs: (h) => [
      { q: 'Ile paneli fotowoltaicznych potrzeba na dom?', a: 'Liczba paneli wynika z mocy instalacji: moc w watach podzielona przez moc jednego panelu. Na 6 kWp przy panelach 450 W potrzeba 14 sztuk, na 8 kWp 18, na 10 kWp 23. Moc dobiera się do zużycia, a nie do wielkości dachu, bo nadwyżka w net-billingu jest sprzedawana po cenie hurtowej.' },
      { q: 'Czy panele na dachu wschód-zachód się opłacają?', a: `Tak. W Warszawie połać na wschód albo zachód daje około ${h.pct(Y(h, 35, '90') / Y(h, 35, '0'))} produkcji połaci południowej przy tym samym kącie. Produkcja rozkłada się za to na ranek i popołudnie, więc większa jej część trafia od razu do gniazdek, a mniejsza do sieci w południe, gdy cena RCE jest najniższa.` },
      { q: 'Jaki kąt nachylenia paneli jest najlepszy w Polsce?', a: `Na połaci południowej najwięcej energii w ciągu roku daje kąt 35–40°. Różnice są jednak małe: w Warszawie 6 kWp przy 20° wyprodukuje około ${h.num(Y(h, 20, '0'))} kWh, a przy 35° około ${h.num(Y(h, 35, '0'))} kWh. Na płaskim dachu zwykle montuje się panele pod kątem 10–20°, żeby rzędy się nie zacieniały.` },
      { q: 'Ile miejsca na dachu zajmuje 1 kWp paneli?', a: 'Panel o mocy 430–450 W ma około 1,7 na 1,1 metra, czyli 1,9–2 m². Na 1 kWp przypada więc około 4,5 m² połaci, a na instalację 6 kWp 25–30 m². Trzeba doliczyć odstępy od krawędzi dachu i kalenicy oraz ominąć kominy, okna dachowe i miejsca zacienione.' },
    ],
    body: (h) => {
      const asp: Array<['0' | '-45' | '45' | '-90' | '90', string]> = [['0', 'południe'], ['45', 'południowy zachód'], ['90', 'zachód']];
      const rows = [10, 20, 35, 45].map((t) => [`${t}°`, ...asp.map(([a]) => `${h.num(Y(h, t, a))} kWh`)]);
      return `
<h2>Strona świata i kąt: produkcja 6 kWp w Warszawie</h2>
<p>Tabela pokazuje roczną produkcję tej samej instalacji ustawionej na różne sposoby. Strony wschodnie dają prawie tyle samo co zachodnie, dlatego ich nie powtarzamy. Wartości pochodzą z PVGIS, z kształtem miesięcznym województwa mazowieckiego i stratami systemu 14 %.</p>
${h.table(['Nachylenie', ...asp.map(([, n]) => n)], rows, 'PVGIS 5.3, Warszawa, 6 kWp, straty 14 %. Kalkulator powyżej liczy to samo dla Twojej gminy.', ['l', 'r', 'r', 'r'])}
<h2>Co jest ważniejsze niż marka paneli</h2>
<p>Różnica sprawności między popularnymi panelami monokrystalicznymi wynosi dziś 1–2 punkty procentowe i przekłada się głównie na mniejszą powierzchnię, a nie na więcej kilowatogodzin z tej samej mocy. Dużo więcej zmienia cień: komin albo drzewo zasłaniające jeden panel w szeregu potrafi obniżyć produkcję całego łańcucha. Przy dachu z cieniem pytaj instalatora o optymalizatory albo mikrofalowniki.</p>
<p>Drugą rzeczą jest dobór mocy do zużycia. Od kwietnia 2022 r. nadwyżka trafia do ${h.a('net-billing', 'net-billingu')} i jest wyceniana po cenie rynkowej, więc instalacja dwa razy większa od potrzeb nie daje dwa razy większej oszczędności. Ile mocy potrzebuje Twój dom, pokazują strony ${h.a('fotowoltaika-4-kw', '4 kW')}, ${h.a('fotowoltaika-6-kw', '6 kW')} i ${h.a('fotowoltaika-8-kw', '8 kW')}, a koszt opisuje ${h.a('fotowoltaika-cena', 'cena fotowoltaiki')}.</p>
<p>Wynik z kalkulatora możesz sprawdzić w ${h.src('pvgisTool', 'narzędziu PVGIS')}, wpisując współrzędne własnego dachu. Dostaniesz tę samą liczbę z dokładnością do kilku procent, bo my liczymy dla środka gminy.</p>`;
    },
  },
  en: {
    slug: 'solar-panels-poland', nav: 'Solar panels', card: 'How much power a roof gives by direction and tilt.',
    title: 'Solar panels in your Polish home: output by roof and tilt',
    description: 'Solar panels on your Polish roof: PVGIS output for your municipality, the effect of roof direction and tilt, and how many panels and how much roof you need.',
    h1: 'Solar panels: how much power your roof will give',
    intro: 'Pick your municipality, system size and roof direction. The table below the result gives the output for every tilt and direction.',
    resume: (h) => `A solar panel turns light into direct current, and an inverter turns that into the alternating current a house uses. How much energy the whole roof gives depends on three things: sunshine in the municipality, the direction of the roof and its tilt, and only then on the panel brand. According to PVGIS, 1 kWp on a 35° south-facing roof produces between ${h.num(h.M.MODEL.national.min)} and ${h.num(h.M.MODEL.national.max)} kWh a year in Poland. In Warsaw a 6 kWp system facing south produces about ${h.num(Y(h, 35, '0'))} kWh, and facing east or west about ${h.num(Y(h, 35, '90'))} kWh, which is ${h.pct(1 - Y(h, 35, '90') / Y(h, 35, '0'))} less. An east-west roof is therefore no obstacle, and under net-billing it can even help, because it spreads output over the morning and afternoon, when the house uses more. The calculator above works out the output for your municipality, size, roof direction and tilt.`,
    faqs: (h) => [
      { q: 'How many solar panels does a house need?', a: 'The number of panels follows from the system size: power in watts divided by the power of one panel. A 6 kWp system with 450 W panels needs 14 of them, 8 kWp needs 18 and 10 kWp needs 23. Size is matched to your consumption, not to the roof, because under net-billing surplus sells at the wholesale price.' },
      { q: 'Are panels on an east-west roof worth it?', a: `Yes. In Warsaw a roof facing east or west gives about ${h.pct(Y(h, 35, '90') / Y(h, 35, '0'))} of the output of a south-facing one at the same tilt. That output is spread over the morning and afternoon, so more of it goes straight to the sockets and less to the grid at midday, when the RCE price is lowest.` },
      { q: 'What is the best panel tilt in Poland?', a: `On a south-facing roof the most energy over a year comes at 35–40°. The differences are small, though: in Warsaw 6 kWp at 20° produces about ${h.num(Y(h, 20, '0'))} kWh and at 35° about ${h.num(Y(h, 35, '0'))} kWh. On a flat roof panels are usually mounted at 10–20° so that the rows do not shade each other.` },
      { q: 'How much roof does 1 kWp of panels take?', a: 'A 430–450 W panel measures about 1.7 by 1.1 metres, or 1.9–2 m². One kWp therefore takes about 4.5 m² of roof, and a 6 kWp system 25–30 m². Add the gaps required from the roof edges and ridge, and work around chimneys, roof windows and shaded spots.' },
    ],
    body: (h) => {
      const asp: Array<['0' | '-45' | '45' | '-90' | '90', string]> = [['0', 'south'], ['45', 'south-west'], ['90', 'west']];
      const rows = [10, 20, 35, 45].map((t) => [`${t}°`, ...asp.map(([a]) => `${h.num(Y(h, t, a))} kWh`)]);
      return `
<h2>Direction and tilt: 6 kWp output in Warsaw</h2>
<p>The table shows the yearly output of the same system set up in different ways. Eastern directions give almost the same as western ones, so they are not repeated. Values come from PVGIS, with the monthly profile of the Mazowieckie region and 14% system losses.</p>
${h.table(['Tilt', ...asp.map(([, n]) => n)], rows, 'PVGIS 5.3, Warsaw, 6 kWp, 14% losses. The calculator above does the same for your municipality.', ['l', 'r', 'r', 'r'])}
<h2>What matters more than the panel brand</h2>
<p>The efficiency gap between common monocrystalline panels is now 1–2 percentage points, and it mainly means less roof area, not more kilowatt-hours from the same power. Shade changes far more: a chimney or tree covering one panel in a string can cut the output of the whole string. On a shaded roof, ask the installer about optimisers or micro-inverters.</p>
<p>The second thing is matching size to consumption. Since April 2022 surplus goes into ${h.a('net-billing', 'net-billing')} and is valued at the market price, so a system twice as large as you need does not save twice as much. The pages on ${h.a('fotowoltaika-4-kw', '4 kW')}, ${h.a('fotowoltaika-6-kw', '6 kW')} and ${h.a('fotowoltaika-8-kw', '8 kW')} show what size your house needs, and ${h.a('fotowoltaika-cena', 'solar panel cost')} covers the price.</p>
<p>You can check the calculator’s figure in the ${h.src('pvgisTool', 'PVGIS tool')} by entering the coordinates of your own roof. You will get the same number to within a few per cent, because we calculate for the centre of the municipality.</p>`;
    },
  },
});
