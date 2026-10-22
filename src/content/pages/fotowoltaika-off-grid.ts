import { definePage, type Helpers } from '../../lib/page-types';

const DPK = (h: Helpers, tilt = 45) => h.M.dailyPerKwp(h.M.MODEL.national.mean, 6, tilt, '0');
const USES = [1, 3, 5, 8];
const MPL = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const MEN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default definePage({
  id: 'fotowoltaika-off-grid', group: 'pv', order: 85, tool: 'produkcja', mini: 'offgrid',
  related: ['fotowoltaika-z-magazynem-energii', 'ile-pradu-produkuje-fotowoltaika', 'magazyn-energii-cena', 'fotowoltaika-balkonowa'],
  sources: ['pvgis', 'pvgisTool', 'prawoEnergetyczne', 'ozeAct'],
  pl: {
    slug: 'fotowoltaika-off-grid', nav: 'Fotowoltaika off-grid', card: 'Moc i magazyn energii dla domku lub działki bez podłączenia do sieci.',
    title: 'Fotowoltaika off-grid: magazyn energii bez sieci, dobór',
    description: 'Fotowoltaika off-grid z magazynem energii bez podłączenia do sieci: ile kWp i ile kWh magazynu potrzeba na Twoje zużycie latem i zimą, według danych PVGIS.',
    h1: 'Fotowoltaika off-grid: ile paneli i jaki magazyn bez sieci',
    intro: 'Bez sieci nie ma depozytu ani zakupu prądu zimą. O mocy decyduje najsłabszy miesiąc, a o magazynie liczba dni bez słońca.',
    resume: (h) => {
      const d = DPK(h), s = Math.min(...d.slice(3, 9));
      return `Fotowoltaika off-grid to instalacja z magazynem energii bez podłączenia do sieci: cały prąd, którego potrzebujesz, musi pochodzić z paneli i z akumulatora. Dobiera się ją inaczej niż instalację w net-billingu, gdzie liczy się bilans roczny. Tu decyduje najsłabszy miesiąc. Według PVGIS jeden kilowat paneli ustawionych pod kątem 45° na południe daje średnio w Polsce ${h.num(Math.min(...d), 2)} kWh na dobę w grudniu i ${h.num(Math.max(...d), 1)} kWh w najlepszym miesiącu. Domek letniskowy zużywający 3 kWh dziennie potrzebuje więc około ${h.num(3 / s, 1)} kWp, jeśli korzystasz z niego od kwietnia do września, ale aż ${h.num(3 / Math.min(...d), 1)} kWp, jeśli ma działać także w grudniu. Magazyn liczy się z liczby dni bez słońca: na dwa dni przy 3 kWh dziennie potrzeba 6 kWh pojemności użytkowej. Instalacja niepodłączona do sieci nie wymaga zgłoszenia do operatora, ale też nie daje depozytu ani zwrotu za nadwyżkę.`;
    },
    faqs: (h) => [
      { q: 'Czy instalację off-grid trzeba zgłaszać do operatora sieci?', a: 'Nie, jeśli nie jest w żaden sposób połączona z siecią dystrybucyjną. Zgłoszenie z art. 7 ust. 8d4 Prawa energetycznego dotyczy przyłączenia mikroinstalacji do sieci. Instalacja zupełnie wyspowa nie jest też rozliczana w net-billingu, więc nadwyżka latem po prostu się marnuje, jeśli magazyn jest pełny, a dom niczego nie zużywa.' },
      { q: 'Dlaczego zimą off-grid potrzebuje kilka razy więcej paneli niż latem?', a: `Bo w grudniu 1 kWp daje w Polsce średnio ${h.num(Math.min(...DPK(h)), 2)} kWh na dobę, a w miesiącach letnich kilka razy więcej. Instalacja dobrana na lato zimą pokryje tylko część zużycia. Dlatego domy całoroczne bez sieci łączą panele z innym źródłem, na przykład agregatem, a panele ustawiają stromo, żeby łapały niskie zimowe słońce.` },
      { q: 'Jaki kąt paneli wybrać w instalacji bez sieci?', a: `Stromszy niż na dachu przyłączonym do sieci, jeśli instalacja ma pracować zimą. Przy 45° jeden kWp daje w grudniu ${h.num(DPK(h, 45)[11], 2)} kWh na dobę, przy 35° ${h.num(DPK(h, 35)[11], 2)} kWh, a pionowo ${h.num(DPK(h, 90)[11], 2)} kWh. Panel pionowy dodatkowo nie trzyma śniegu. Latem stromy kąt traci, ale wtedy produkcji jest i tak za dużo.` },
      { q: 'Czy magazyn energii pozwala na całkowite odcięcie się od sieci?', a: 'Technicznie tak, ale w polskim klimacie zimą wymaga to dużej mocy paneli, dużego magazynu i zapasu na kilka pochmurnych dni z rzędu. Przeciętna doba z PVGIS nie pokazuje tygodni bez słońca. Dom, który ma już przyłącze, zwykle zyskuje więcej na net-billingu z magazynem niż na pełnej niezależności.' },
    ],
    body: (h) => {
      const d = DPK(h), s = Math.min(...d.slice(3, 9)), w = Math.min(...d);
      const rows = USES.map((u) => [`${h.num(u)} kWh`, `${h.num(u / s, 1)} kWp`, `${h.num(u / w, 1)} kWp`, `${h.num(u * 2)} kWh`, `${h.num(u * 4)} kWh`]);
      const months = d.map((x, i) => [MPL[i], `${h.num(x, 2)} kWh`]);
      return `
<h2>Dobór mocy i magazynu do zużycia</h2>
<p>Tabela pokazuje moc paneli ustawionych pod kątem 45° na południe i pojemność użytkową magazynu dla czterech poziomów zużycia dziennego. Wersja sezonowa pokrywa najsłabszy miesiąc od kwietnia do września, całoroczna grudzień.</p>
${h.table(['Zużycie na dobę', 'Moc: kwiecień–wrzesień', 'Moc: cały rok', 'Magazyn na 2 dni', 'Magazyn na 4 dni'], rows, 'Średni uzysk gmin z PVGIS 5.3, przeciętna doba miesiąca, straty 14 %, bez strat ładowania magazynu.', ['l', 'r', 'r', 'r', 'r'])}
<p>Pojemność użytkowa to energia, którą magazyn może oddać, a nie pojemność nominalna z tabliczki. Producent podaje ją w karcie produktu. Do tego dochodzą straty falownika i ładowania, dlatego warto dodać zapas.</p>
<!--mini:offgrid-->
<h2>Produkcja 1 kWp miesiąc po miesiącu</h2>
${h.table(['Miesiąc', '1 kWp na dobę (45°)'], months, 'PVGIS 5.3, średnio dla gmin w Polsce, panele na południe.', ['l', 'r'])}
<p>Dla dokładnej lokalizacji sprawdź produkcję w kalkulatorze u góry strony: wybierz gminę, a zobaczysz uzysk w każdym miesiącu. Jeśli działka ma przyłącze albo da się je wykonać, porównaj ten wynik z instalacją ${h.a('fotowoltaika-z-magazynem-energii', 'fotowoltaiki z magazynem energii')} rozliczaną w net-billingu, gdzie zimą brakującą energię kupujesz z sieci.</p>`;
    },
  },
  en: {
    slug: 'off-grid-solar-poland', nav: 'Off-grid solar', card: 'Panels and battery for a cabin or plot with no grid connection.',
    title: 'Off-grid solar in Poland: battery and panels without grid',
    description: 'Off-grid solar in Poland with a home battery and no grid connection: how many kWp and kWh of storage you need for your use in summer and winter, per PVGIS data.',
    h1: 'Off-grid solar: how many panels and what battery without grid',
    intro: 'With no grid there is no deposit and no buying power in winter. The weakest month sets the size, the number of sunless days sets the battery.',
    resume: (h) => {
      const d = DPK(h), s = Math.min(...d.slice(3, 9));
      return `Off-grid solar is a system with a battery and no grid connection: all the power you need has to come from the panels and the battery. It is sized differently from a net-billing system, where the yearly balance counts. Here the weakest month decides. According to PVGIS, one kilowatt of panels tilted at 45° facing south gives on average ${h.num(Math.min(...d), 2)} kWh per day in December across Poland and ${h.num(Math.max(...d), 1)} kWh in the best month. A summer cabin using 3 kWh a day therefore needs about ${h.num(3 / s, 1)} kWp if you use it from April to September, but as much as ${h.num(3 / Math.min(...d), 1)} kWp if it must also work in December. The battery follows from the number of sunless days: two days at 3 kWh a day need 6 kWh of usable capacity. A system not connected to the grid needs no notification to the operator, but it also earns no deposit or refund for its surplus.`;
    },
    faqs: (h) => [
      { q: 'Does an off-grid system have to be notified to the grid operator?', a: 'No, if it is not connected to the distribution grid in any way. The notification under Art. 7(8d4) of Polish Energy Law concerns connecting a micro-installation to the grid. A fully islanded system is not settled under net-billing either, so the summer surplus is simply wasted once the battery is full and the house is not using anything.' },
      { q: 'Why does off-grid need several times more panels in winter than in summer?', a: `Because in December 1 kWp gives on average ${h.num(Math.min(...DPK(h)), 2)} kWh per day in Poland, and several times more in the summer months. A system sized for summer covers only part of the use in winter. That is why year-round homes without grid pair panels with another source, such as a generator, and mount panels steeply to catch the low winter sun.` },
      { q: 'What panel angle should an off-grid system use?', a: `Steeper than on a grid-connected roof if it has to work in winter. At 45°, one kWp gives ${h.num(DPK(h, 45)[11], 2)} kWh per day in December, at 35° ${h.num(DPK(h, 35)[11], 2)} kWh, and vertically ${h.num(DPK(h, 90)[11], 2)} kWh. A vertical panel also sheds snow. A steep angle loses out in summer, but output is more than enough then anyway.` },
      { q: 'Can a home battery let you cut loose from the grid entirely?', a: 'Technically yes, but in the Polish climate in winter it takes a large panel array, a large battery and a reserve for several cloudy days in a row. The average PVGIS day does not show sunless weeks. A house that already has a grid connection usually gains more from net-billing with a battery than from full independence.' },
    ],
    body: (h) => {
      const d = DPK(h), s = Math.min(...d.slice(3, 9)), w = Math.min(...d);
      const rows = USES.map((u) => [`${h.num(u)} kWh`, `${h.num(u / s, 1)} kWp`, `${h.num(u / w, 1)} kWp`, `${h.num(u * 2)} kWh`, `${h.num(u * 4)} kWh`]);
      const months = d.map((x, i) => [MEN[i], `${h.num(x, 2)} kWh`]);
      return `
<h2>Sizing panels and battery to your use</h2>
<p>The table shows the size of panels tilted at 45° facing south and the usable battery capacity for four levels of daily use. The seasonal version covers the weakest month from April to September, the year-round version December.</p>
${h.table(['Use per day', 'Size: April–September', 'Size: all year', 'Battery for 2 days', 'Battery for 4 days'], rows, 'Average municipal yield from PVGIS 5.3, an average day of the month, 14% losses, battery charging losses not included.', ['l', 'r', 'r', 'r', 'r'])}
<p>Usable capacity is the energy the battery can deliver, not the nominal capacity on its label. The maker gives it on the product sheet. Inverter and charging losses come on top, so it is worth adding a margin.</p>
<!--mini:offgrid-->
<h2>Output of 1 kWp month by month</h2>
${h.table(['Month', '1 kWp per day (45°)'], months, 'PVGIS 5.3, average across Polish municipalities, panels facing south.', ['l', 'r'])}
<p>For your exact location check the output in the calculator at the top of the page: pick the municipality and you will see the yield in each month. If the plot has a grid connection, or one can be made, compare this result with ${h.a('fotowoltaika-z-magazynem-energii', 'solar with a home battery')} settled under net-billing, where in winter you buy the missing energy from the grid.</p>`;
    },
  },
});
