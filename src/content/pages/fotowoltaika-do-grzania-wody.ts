import { definePage, type Helpers } from '../../lib/page-types';

/** Dom z rachunkiem `base` kWh, 4 kWp, woda grzałką (cop = 1) lub pompą CWU (cop > 1). Grzałka w dzień
 *  przesuwa pobór na godziny produkcji : profil « home ». */
const R = (h: Helpers, area: number, cop: number, kwp = 4, base = 2500, profile: 'flat' | 'home' = 'home') =>
  h.M.simulate({ yieldKwhKwp: h.M.MODEL.national.mean, voivIdx: 6, kwp, useKwh: base + h.M.cwuKwh(area) / cop, profile });
const MONTHS_PL = ['styczeń', 'kwiecień', 'lipiec', 'październik', 'grudzień'];
const MONTHS_EN = ['January', 'April', 'July', 'October', 'December'];
const IDX = [0, 3, 6, 9, 11];

export default definePage({
  id: 'fotowoltaika-do-grzania-wody', group: 'pv', order: 80, tool: 'pv', toolArg: '4',
  related: ['fotowoltaika-na-dom', 'pompa-ciepla-i-fotowoltaika', 'fotowoltaika-z-magazynem-energii', 'net-billing'],
  sources: ['metodologiaCwu', 'pvgis', 'ozeAct', 'ureTaryfy2026'],
  pl: {
    slug: 'fotowoltaika-do-grzania-wody', nav: 'Fotowoltaika do grzania wody', card: 'Ile prądu na ciepłą wodę i ile pokryją panele w lecie i zimą.',
    title: 'Fotowoltaika do grzania wody: grzałka czy pompa CWU?',
    description: 'Panele fotowoltaiczne do grzania wody: ile prądu zużywa ciepła woda w domu, ile pokryje dach latem i zimą i czy lepsza jest grzałka, czy pompa ciepła CWU.',
    h1: 'Panele fotowoltaiczne do grzania wody: ile naprawdę pokryją',
    intro: 'Ciepła woda to stałe zużycie przez cały rok. Policz je dla swojego domu i dodaj do zużycia w kalkulatorze poniżej.',
    resume: (h) => {
      const q = h.M.cwuKwh(120), d = h.M.dailyPerKwp(h.M.MODEL.national.mean);
      return `Fotowoltaika do grzania wody działa najlepiej wtedy, gdy grzałka albo pompa ciepła do wody pracuje w godzinach produkcji paneli. Rozporządzenie w sprawie metodologii charakterystyki energetycznej budynków przyjmuje dla domu jednorodzinnego 1,4 litra ciepłej wody na metr kwadratowy dziennie, podgrzewanej z 10 do 55 °C. Dla domu 120 m² to około ${h.num(q)} kWh ciepła rocznie, czyli ${h.num(q / 365, 1)} kWh dziennie. Grzałka elektryczna zużyje na to tyle samo prądu, a pompa ciepła CWU o COP 3 trzy razy mniej. Jeden kilowat paneli daje średnio w Polsce ${h.num(d[6], 1)} kWh na dobę w lipcu i tylko ${h.num(d[11], 1)} kWh w grudniu. Latem instalacja kilku kilowatów pokryje więc wodę z nadwyżką, a zimą większość tego prądu przyjdzie z sieci. W net-billingu energia zużyta na wodę w chwili produkcji jest warta pełną cenę z taryfy, a oddana do sieci tylko cenę rynkową, dlatego podgrzewanie wody w południe to jeden z najtańszych sposobów na wyższą autokonsumpcję.`;
    },
    faqs: (h) => [
      { q: 'Ile paneli potrzeba, żeby grzać wodę grzałką w domu 120 m²?', a: `Żeby roczna produkcja równała się zużyciu grzałki, około ${h.num(h.M.sizeFor(h.M.cwuKwh(120), h.M.MODEL.national.mean), 1)} kWp, czyli kilka paneli. Ta moc da jednak latem dużo więcej niż potrzeba, a zimą kilka razy za mało. Dlatego wodę planuje się razem z resztą zużycia domu, a nie jako osobną instalację.` },
      { q: 'Grzałka czy pompa ciepła do wody przy fotowoltaice?', a: `Pompa CWU o COP 3 zużywa na tę samą ilość ciepłej wody trzy razy mniej prądu niż grzałka, więc w domu 120 m² oszczędza około ${h.num(h.M.cwuKwh(120) * 2 / 3)} kWh rocznie, głównie zimą, gdy prąd pochodzi z sieci. Grzałka jest tańsza w zakupie i dobrze zużywa letnią nadwyżkę. Przy dużej nadwyżce latem różnica w kosztach rocznych jest mniejsza, niż sugeruje sam COP.` },
      { q: 'Czy grzałkę można zasilać bezpośrednio z paneli, bez sieci?', a: 'Tak, istnieją grzałki i sterowniki prądu stałego zasilane wprost z paneli, bez falownika i bez zgłoszenia do operatora, bo instalacja nie jest przyłączona do sieci. Taki układ grzeje wodę tylko wtedy, gdy świeci słońce, a nadwyżki nie zamienia w depozyt. Zimą wodę trzeba wtedy dogrzewać innym źródłem.' },
      { q: 'Jak ustawić grzanie wody, żeby zużywać prąd z paneli?', a: 'Najprościej programatorem albo przekaźnikiem z harmonogramem na godziny 10–15, gdy produkcja jest największa. Lepszy jest sterownik reagujący na nadwyżkę mocy z falownika: włącza grzałkę dopiero wtedy, gdy panele dają więcej, niż dom zużywa. Duży zasobnik pozwala zgromadzić ciepło na wieczór i ranek.' },
    ],
    body: (h) => {
      const d = h.M.dailyPerKwp(h.M.MODEL.national.mean), need = h.M.cwuKwh(120) / 365;
      const rows = IDX.map((m, i) => [MONTHS_PL[i], `${h.num(d[m], 1)} kWh`, `${h.num(need, 1)} kWh`, `${h.num(need / d[m], 1)} kWp`]);
      const a = R(h, 120, 1, 4, 2500, 'flat'), b = R(h, 120, 1), c = R(h, 120, 3);
      return `
<h2>Lato i zima: ile wody grzeje 1 kWp</h2>
<p>Zapotrzebowanie na ciepłą wodę jest prawie takie samo przez cały rok, a dobowa produkcja paneli jest w lipcu około ${h.num(d[6] / d[11], 0)} razy większa niż w grudniu. Tabela pokazuje, ile mocy trzeba, by w przeciętnej dobie danego miesiąca pokryć grzałką wodę domu 120 m².</p>
${h.table(['Miesiąc', '1 kWp na dobę', 'Woda na dobę', 'Moc na pokrycie'], rows, 'Średni uzysk gmin z PVGIS 5.3, dach 35° na południe; woda wg wzoru (61) rozporządzenia, Dz.U. 2015 poz. 376.', ['l', 'r', 'r', 'r'])}
<!--mini:cwu-->
<h2>Ile oszczędza grzanie wody w dzień</h2>
<p>Weźmy dom 120 m² z rachunkiem 2500 kWh bez wody i instalacją 4 kWp. Gdy grzałka pracuje równo przez dobę, dom oszczędza na prądzie ${h.zl(a.savings)} rocznie. Gdy ta sama grzałka grzeje w dzień (w modelu: profil „dużo w dzień” dla całego domu), oszczędność rośnie do ${h.zl(b.savings)}, bo więcej produkcji zostaje w domu zamiast trafiać do sieci. Pompa CWU o COP 3 w tym samym domu daje ${h.zl(c.savings)} oszczędności z paneli, a do tego zmniejsza zużycie prądu na wodę o dwie trzecie. Te liczby pochodzą z modelu godzinowego kalkulatora i cen G11 na 2026 r.</p>
<p>Wynik dla swojego domu zobaczysz w kalkulatorze u góry: do rocznego zużycia z rachunku dodaj wynik mini-kalkulatora i wybierz „dużo w dzień”, jeśli grzałka ma harmonogram. Jeśli wodę grzeje pompa ciepła razem z domem, skorzystaj ze strony ${h.a('pompa-ciepla-i-fotowoltaika', 'pompa ciepła i fotowoltaika')}.</p>`;
    },
  },
  en: {
    slug: 'solar-water-heating-poland', nav: 'Solar for water heating', card: 'How much power hot water takes and what panels cover in summer and winter.',
    title: 'Solar PV for water heating in Poland: element or heat pump',
    description: 'Solar panels for water heating in Poland: the power hot water takes, what the roof covers in summer and winter, and whether an element or a heat pump is better.',
    h1: 'Solar panels for water heating: how much they really cover',
    intro: 'Hot water is a steady load all year round. Work it out for your house and add it to the use in the calculator below.',
    resume: (h) => {
      const q = h.M.cwuKwh(120), d = h.M.dailyPerKwp(h.M.MODEL.national.mean);
      return `Solar PV for water heating works best when the element or heat pump water heater runs in the hours when the panels produce. The Polish building energy performance methodology assumes 1.4 litres of hot water per square metre per day for a single-family house, heated from 10 to 55 °C. For a 120 m² house that is about ${h.num(q)} kWh of heat a year, or ${h.num(q / 365, 1)} kWh a day. An electric element uses the same amount of power, while a heat pump water heater with a COP of 3 uses three times less. One kilowatt of panels gives on average ${h.num(d[6], 1)} kWh per day in July across Poland and only ${h.num(d[11], 1)} kWh in December. In summer a system of a few kilowatts therefore covers the water with plenty to spare, while in winter most of that power comes from the grid. Under net-billing, energy used for water at the moment it is produced is worth the full tariff price, and energy exported only the market price, so heating water at midday is one of the cheapest ways to raise self-consumption.`;
    },
    faqs: (h) => [
      { q: 'How many panels does it take to heat water with an element in a 120 m² house?', a: `For yearly output to equal the element’s use, about ${h.num(h.M.sizeFor(h.M.cwuKwh(120), h.M.MODEL.national.mean), 1)} kWp, which is a few panels. That size gives far more than needed in summer, though, and several times too little in winter. So water heating is planned together with the rest of the house’s use, not as a separate system.` },
      { q: 'Element or heat pump water heater with solar?', a: `A heat pump water heater with a COP of 3 uses three times less power than an element for the same hot water, so in a 120 m² house it saves about ${h.num(h.M.cwuKwh(120) * 2 / 3)} kWh a year, mostly in winter when power comes from the grid. An element is cheaper to buy and soaks up the summer surplus well. With a big summer surplus the yearly cost gap is smaller than the COP alone suggests.` },
      { q: 'Can an element run straight from the panels, without the grid?', a: 'Yes, there are direct-current elements and controllers powered straight from the panels, with no inverter and no notification to the grid operator, since the system is not connected to the grid. Such a setup heats water only when the sun shines and does not turn any surplus into a deposit. In winter the water then has to be topped up from another source.' },
      { q: 'How do I set water heating to use power from the panels?', a: 'The simplest way is a timer or relay scheduled for 10:00–15:00, when output peaks. Better still is a controller that reacts to surplus power from the inverter: it switches the element on only when the panels give more than the house is using. A large tank lets you store the heat for the evening and morning.' },
    ],
    body: (h) => {
      const d = h.M.dailyPerKwp(h.M.MODEL.national.mean), need = h.M.cwuKwh(120) / 365;
      const rows = IDX.map((m, i) => [MONTHS_EN[i], `${h.num(d[m], 1)} kWh`, `${h.num(need, 1)} kWh`, `${h.num(need / d[m], 1)} kWp`]);
      const a = R(h, 120, 1, 4, 2500, 'flat'), b = R(h, 120, 1), c = R(h, 120, 3);
      return `
<h2>Summer and winter: how much water 1 kWp heats</h2>
<p>Hot water demand is almost the same all year, while daily panel output in July is about ${h.num(d[6] / d[11], 0)} times that of December. The table shows the size needed to cover, with an element, a 120 m² house’s water on an average day of each month.</p>
${h.table(['Month', '1 kWp per day', 'Water per day', 'Size to cover'], rows, 'Average municipal yield from PVGIS 5.3, roof at 35° facing south; water by formula (61) of the regulation, Dz.U. 2015 item 376.', ['l', 'r', 'r', 'r'])}
<!--mini:cwu-->
<h2>What heating water in the daytime saves</h2>
<p>Take a 120 m² house with a 2,500 kWh bill before water and a 4 kWp system. When the element runs evenly round the clock, the house saves ${h.zl(a.savings)} a year on power. When the same element heats in the daytime (modelled as the “a lot in daytime” profile for the whole house), the saving rises to ${h.zl(b.savings)}, because more output stays in the house instead of going to the grid. A heat pump water heater with a COP of 3 in the same house gives ${h.zl(c.savings)} of solar saving and also cuts the power used for water by two thirds. These figures come from the calculator’s hourly model and 2026 G11 prices.</p>
<p>You will see the result for your house in the calculator at the top: add the mini-calculator’s result to the yearly use on your bill and choose “a lot in daytime” if the element runs on a schedule. If a heat pump heats the water together with the house, use the ${h.a('pompa-ciepla-i-fotowoltaika', 'heat pump and solar')} page.</p>`;
    },
  },
});
