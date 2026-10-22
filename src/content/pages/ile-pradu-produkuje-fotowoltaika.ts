import { definePage, type Helpers } from '../../lib/page-types';

const MONTHS_PL = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthly = (h: Helpers) => { const v = h.M.VOIV[6]; return v.shape.map((s) => s * 1050); };

export default definePage({
  id: 'ile-pradu-produkuje-fotowoltaika', group: 'pv', order: 60, tool: 'produkcja',
  related: ['panele-fotowoltaiczne', 'fotowoltaika-6-kw', 'czy-fotowoltaika-sie-oplaca'],
  sources: ['pvgis', 'pvgisTool'],
  pl: {
    slug: 'ile-pradu-produkuje-fotowoltaika', nav: 'Ile prądu produkuje fotowoltaika', card: 'Produkcja z 1 kWp w Twojej gminie, miesiąc po miesiącu.',
    title: 'Ile prądu produkuje fotowoltaika: gmina po gminie, PVGIS',
    description: 'Ile prądu produkuje fotowoltaika w Twojej gminie: roczny uzysk z 1 kWp według PVGIS dla 2077 gmin, rozkład na miesiące, wpływ strony dachu i nachylenia paneli.',
    h1: 'Ile prądu produkuje fotowoltaika w Twojej gminie',
    intro: 'Wybierz gminę albo powiat: kalkulator pokaże produkcję rocznie i w każdym miesiącu, z podziałem na zużycie i sieć.',
    resume: (h) => {
      const N = h.M.MODEL.national, m = monthly(h);
      return `Instalacja fotowoltaiczna w Polsce produkuje rocznie od ${h.num(N.min)} do ${h.num(N.max)} kWh z każdego kilowata mocy, jeśli panele są nachylone pod kątem 35° na południe, a straty systemu wynoszą 14 %. Tak wynika z PVGIS 5.3, narzędzia Wspólnego Centrum Badawczego Komisji Europejskiej, które pobraliśmy osobno dla środka każdej z ${h.num(N.gminas)} gmin. Średnia gmin wynosi ${h.num(N.mean)} kWh/kWp, a Warszawa ma 1050 kWh. Najmniej produkuje ${N.minN} w Karkonoszach, gdzie słońce chowa się za stokiem, najwięcej ${N.maxN} na Dolnym Śląsku. Ważniejsze od różnic między gminami są różnice między miesiącami: w Warszawie 1 kWp daje w czerwcu około ${h.num(m[5])} kWh, a w grudniu tylko ${h.num(m[11])} kWh. Dlatego to, ile produkcji zużyjesz na miejscu, zależy od pory roku, a zimą prawie cały prąd pobierasz z sieci. Kalkulator liczy produkcję dla wybranej gminy, mocy, strony dachu i kąta nachylenia.`;
    },
    faqs: (h) => [
      { q: 'Ile kWh rocznie daje 1 kWp fotowoltaiki w Polsce?', a: `Według PVGIS od ${h.num(h.M.MODEL.national.min)} do ${h.num(h.M.MODEL.national.max)} kWh, średnio ${h.num(h.M.MODEL.national.mean)} kWh, przy dachu 35° na południe i stratach 14 %. To wartość średnia z lat 2005–2023: w roku słonecznym produkcja bywa o kilka procent wyższa, w pochmurnym niższa. Starsze kalkulatory często przyjmują okrągłe 1000 kWh dla całego kraju.` },
      { q: 'Dlaczego produkcja z PVGIS różni się od tego, co pokazuje aplikacja falownika?', a: 'PVGIS podaje średnią z wielu lat, a aplikacja pokazuje konkretny rok, z jego pogodą. Do tego dochodzi zacienienie, którego PVGIS nie zna, kurz i śnieg na panelach, nagrzewanie się modułów latem i ograniczanie mocy przez falownik przy wysokim napięciu w sieci. Dlatego pojedynczy rok może odbiegać od średniej o kilka procent w obie strony.' },
      { q: 'Jak sprawdzić produkcję dla dokładnej lokalizacji mojego dachu?', a: 'Kalkulator używa środka gminy, co w praktyce wystarcza, bo uzysk zmienia się między sąsiednimi gminami bardzo łagodnie. Dla dokładnego punktu można użyć bezpłatnego narzędzia PVGIS na stronie Komisji Europejskiej: zaznaczyć dom na mapie, wpisać moc, kąt i azymut. Wynik pokaże też wpływ horyzontu, czyli gór i wzniesień wokół domu.' },
    ],
    body: (h) => {
      const L = h.T(MONTHS_PL, MONTHS_EN), m = monthly(h);
      const rows = h.M.VOIV.map((v) => [v.name, ...[0, 3, 5, 8, 11].map((i) => h.num(v.shape[i] * v.mean))]);
      return `
<h2>Produkcja z 1 kWp w każdym miesiącu</h2>
<p>Tabela pokazuje średnią produkcję 1 kWp w gminach każdego województwa w pięciu miesiącach. Kształt roku jest wszędzie podobny: cztery miesiące od kwietnia do lipca dają około połowy rocznej produkcji, a listopad, grudzień i styczeń razem mniej niż jedną dziesiątą.</p>
${h.table(['Województwo', L[0], L[3], L[5], L[8], L[11]], rows, h.T('kWh z 1 kWp, średnia gmin województwa, PVGIS 5.3, 35° na południe.', 'kWh per kWp, average of the voivodeship’s municipalities, PVGIS 5.3, 35° facing south.'), ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>W Warszawie suma od kwietnia do lipca wynosi ${h.num(m[3] + m[4] + m[5] + m[6])} kWh z 1 kWp, a od listopada do stycznia ${h.num(m[10] + m[11] + m[0])} kWh. Strona dachu i kąt nachylenia zmieniają te liczby, co pokazuje ${h.a('panele-fotowoltaiczne', 'strona o ustawieniu paneli')}.</p>`;
    },
  },
  en: {
    slug: 'solar-output-poland', nav: 'Solar output in Poland', card: 'Yield per kWp in your municipality, month by month.',
    title: 'Solar output in Poland: yield per municipality from PVGIS',
    description: 'How much power solar panels produce in your Polish municipality: yearly yield per kWp from PVGIS for 2,077 municipalities, by month, by roof side and tilt.',
    h1: 'How much power solar panels produce in your municipality',
    intro: 'Pick a municipality or county: the calculator shows yearly and monthly output, split into use on site and the grid.',
    resume: (h) => {
      const N = h.M.MODEL.national, m = monthly(h);
      return `A solar system in Poland produces between ${h.num(N.min)} and ${h.num(N.max)} kWh a year per kilowatt of capacity, with panels tilted at 35° facing south and 14% system losses. That is the result from PVGIS 5.3, the European Commission Joint Research Centre tool, which we queried separately for the centre of each of ${h.num(N.gminas)} municipalities. The municipal average is ${h.num(N.mean)} kWh/kWp, and Warsaw has 1,050 kWh. ${N.minN} in the Karkonosze mountains, where the sun drops early behind the slope, produces least, and ${N.maxN} in Lower Silesia most. The gaps between months matter more than those between places: in Warsaw 1 kWp yields about ${h.num(m[5])} kWh in June and only ${h.num(m[11])} kWh in December. How much output you use on site therefore depends on the season, and in winter you draw almost all your power from the grid. The calculator works out output for the chosen municipality, size, roof side and tilt.`;
    },
    faqs: (h) => [
      { q: 'How many kWh a year does 1 kWp of solar produce in Poland?', a: `According to PVGIS between ${h.num(h.M.MODEL.national.min)} and ${h.num(h.M.MODEL.national.max)} kWh, ${h.num(h.M.MODEL.national.mean)} kWh on average, with a roof at 35° facing south and 14% losses. That is the 2005–2023 average: in a sunny year output can be a few per cent higher, in a cloudy one lower. Older calculators often assume a round 1,000 kWh for the whole country.` },
      { q: 'Why does PVGIS output differ from what my inverter app shows?', a: 'PVGIS gives a multi-year average, while the app shows a specific year with its weather. Add shading PVGIS does not know about, dust and snow on the panels, modules heating up in summer and the inverter curtailing power when grid voltage is high. So a single year can differ from the average by a few per cent either way.' },
      { q: 'How can I check output for the exact location of my roof?', a: 'The calculator uses the centre of the municipality, which is enough in practice, since yield changes only gently between neighbouring municipalities. For an exact point you can use the free PVGIS tool on the European Commission site: mark the house on the map and enter size, tilt and azimuth. The result also reflects the horizon, meaning hills and mountains around the house.' },
    ],
    body: (h) => {
      const L = h.T(MONTHS_PL, MONTHS_EN), m = monthly(h);
      const rows = h.M.VOIV.map((v) => [v.name, ...[0, 3, 5, 8, 11].map((i) => h.num(v.shape[i] * v.mean))]);
      return `
<h2>Output per kWp in each month</h2>
<p>The table shows the average output of 1 kWp in each voivodeship’s municipalities in five months. The shape of the year is similar everywhere: the four months from April to July bring about half the yearly output, while November, December and January together bring less than a tenth.</p>
${h.table(['Voivodeship', L[0], L[3], L[5], L[8], L[11]], rows, 'kWh per kWp, average of the voivodeship’s municipalities, PVGIS 5.3, 35° facing south.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>In Warsaw, April to July adds up to ${h.num(m[3] + m[4] + m[5] + m[6])} kWh per kWp, and November to January to ${h.num(m[10] + m[11] + m[0])} kWh. Roof side and tilt change these figures, as the ${h.a('panele-fotowoltaiczne', 'panel orientation page')} shows.</p>`;
    },
  },
});
