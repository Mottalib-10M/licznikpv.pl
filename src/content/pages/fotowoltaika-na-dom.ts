import { definePage, type Helpers } from '../../lib/page-types';

/** Dom o powierzchni `area` : zużycie z rachunku `base` + pompa ciepła (110 kWh/m², minimalny SCOP) + ciepła woda grzałką. */
const D = (h: Helpers, area: number, base: number, pump: boolean, water: boolean) => {
  const p = pump ? h.M.heatCosts({ area, eu: h.M.EU_PRESETS.mid }).hp.kwh : 0;
  const w = water ? h.M.cwuKwh(area) : 0;
  const total = base + p + w;
  const kwp = Math.max(1, h.M.sizeFor(total, h.M.MODEL.national.mean, 0.9));
  const r = h.M.simulate({ yieldKwhKwp: h.M.MODEL.national.mean, voivIdx: 6, kwp, useKwh: base + w, extraLoad: h.M.hpMonthly(p) });
  return { p, w, total, kwp, r, max10: h.M.maxPriceFor(10, r.savings) };
};
const AREAS = [80, 100, 120, 150, 200];

export default definePage({
  id: 'fotowoltaika-na-dom', group: 'pv', order: 52, tool: 'pv', mini: 'dom',
  related: ['fotowoltaika-cena', 'pompa-ciepla-i-fotowoltaika', 'fotowoltaika-do-grzania-wody', 'fotowoltaika-8-kw'],
  sources: ['pvgis', 'ozeAct', 'ureTaryfy2026', 'eco813', 'metodologiaCwu', 'cpNaCo'],
  pl: {
    slug: 'fotowoltaika-na-dom', nav: 'Fotowoltaika na dom', card: 'Moc i cena opłacalna dla domu 100, 120, 150 i 200 m².',
    title: 'Ile kosztuje fotowoltaika na dom 100–150 m²: moc i cena',
    description: 'Ile kosztuje fotowoltaika na dom 100, 120, 150 lub 200 m²: jaka moc przy ogrzewaniu pompą ciepła i wodzie z grzałki oraz cena, przy której zwrot jest w 10 lat.',
    h1: 'Ile kosztuje fotowoltaika na dom 100, 120, 150 lub 200 m²',
    intro: 'Sama powierzchnia nie mówi, ile prądu zużywasz. Liczy się rachunek, a metraż ma znaczenie, gdy grzejesz dom albo wodę prądem.',
    resume: (h) => {
      const a = D(h, 150, 3000, false, false), b = D(h, 150, 3000, true, true);
      return `Fotowoltaika na dom 150 m² nie ma jednej ceny, bo moc instalacji zależy od zużycia prądu, a nie od metrażu. Dom ogrzewany gazem albo węglem, z rachunkiem 3000 kWh rocznie, potrzebuje około ${h.num(a.kwp, 1)} kWp, jeśli panele mają dać 90 % rocznego zużycia, i taka instalacja zwróci się w 10 lat, jeśli kosztuje najwyżej ${h.zl(a.max10)}. Metraż zaczyna się liczyć przy ogrzewaniu prądem. Pompa ciepła w domu 150 m² ze wskaźnikiem 110 kWh/m² i sprawnością na minimalnym poziomie z rozporządzenia UE 813/2013 zużyje około ${h.num(b.p)} kWh, a podgrzewanie wody grzałką według wzoru z rozporządzenia o charakterystyce energetycznej budynków około ${h.num(b.w)} kWh. Razem z rachunkiem daje to ${h.num(b.total)} kWh i moc około ${h.num(b.kwp, 1)} kWp, opłacalną do ${h.zl(b.max10)}. Mini-kalkulator poniżej liczy to dla Twojego metrażu, a kalkulator u góry dla Twojej gminy.`;
    },
    faqs: (h) => [
      { q: 'Jaka moc fotowoltaiki na dom 100 m² z pompą ciepła?', a: `Przy rachunku 3000 kWh bez ogrzewania i pompie w domu ze wskaźnikiem 110 kWh/m² zużycie rośnie do około ${h.num(D(h, 100, 3000, true, false).total)} kWh rocznie, więc moc pokrywająca 90 % to około ${h.num(D(h, 100, 3000, true, false).kwp, 1)} kWp. Pamiętaj, że pompa pracuje głównie zimą, gdy panele dają mało, więc część jej prądu i tak kupisz z sieci.` },
      { q: 'Czy w net-billingu dobiera się moc na cały metraż domu?', a: 'Nie. Moc dobiera się do zużycia i jego pory, bo energia oddana do sieci jest warta cenę rynkową, a pobrana kosztuje pełną taryfę z dystrybucją. Większy dom z ogrzewaniem gazowym może zużywać mniej prądu niż mniejszy z pompą ciepła. Dlatego pierwszą liczbą do kalkulatora jest roczne zużycie z faktury, a metraż dopiero drugą.' },
      { q: 'Ile prądu zużywa podgrzewanie wody w domu 150 m²?', a: `Rozporządzenie o metodologii charakterystyki energetycznej przyjmuje dla domu jednorodzinnego 1,4 litra ciepłej wody na metr kwadratowy dziennie, podgrzewanej z 10 do 55 °C. Dla 150 m² daje to około ${h.num(h.M.cwuKwh(150))} kWh ciepła rocznie. Grzałka zamienia prąd w ciepło prawie jeden do jednego, a pompa ciepła do wody zużywa tyle razy mniej, ile wynosi jej COP z karty produktu.` },
      { q: 'Czy na dom 200 m² opłaca się instalacja powyżej 10 kWp?', a: `Tylko przy dużym zużyciu. Dom 200 m² z pompą ciepła i wodą z grzałki zużywa około ${h.num(D(h, 200, 3000, true, true).total)} kWh, co daje moc około ${h.num(D(h, 200, 3000, true, true).kwp, 1)} kWp. Moc mikroinstalacji nie może jednak przekroczyć mocy przyłączeniowej budynku z umowy z operatorem. Większą instalację trzeba poprzedzić zmianą warunków przyłączenia.` },
    ],
    body: (h) => {
      const rows = AREAS.map((a) => { const g = D(h, a, 3000, false, false), p = D(h, a, 3000, true, true); return [`${a} m²`, `${h.num(g.kwp, 1)} kWp`, h.zl(g.max10), `${h.num(p.total)} kWh`, `${h.num(p.kwp, 1)} kWp`, h.zl(p.max10)]; });
      return `
<h2>Moc i cena opłacalna według metrażu</h2>
<p>Tabela porównuje dwa domy o tym samym rachunku za prąd bez ogrzewania, 3000 kWh rocznie. Pierwszy grzeje gazem lub węglem, drugi pompą ciepła, a wodę podgrzewa grzałką. Moc dobrana tak, by panele dawały 90 % rocznego zużycia, średni uzysk gmin z PVGIS, ceny G11 na 2026 r. i rozliczenie po RCE.</p>
${h.table(['Dom', 'Bez ogrzewania prądem', 'Zwrot w 10 lat do', 'Z pompą i wodą: zużycie', 'Moc', 'Zwrot w 10 lat do'], rows, 'Pompa: 110 kWh/m²·rok, SCOP minimalny z rozp. UE 813/2013. Woda: 1,4 l/(m²·dobę), 10 → 55 °C (Dz.U. 2015 poz. 376).', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>W domu bez ogrzewania prądem metraż nie zmienia mocy, bo nie zmienia rachunku. W domu z pompą każde dodatkowe 50 m² dokłada kilka tysięcy kilowatogodzin, ale głównie zimą. Dlatego cena opłacalna rośnie wolniej niż moc: zimowej produkcji jest mało, a letnia nadwyżka trafia do sieci po cenie rynkowej.</p>
<!--mini:dom-->
<h2>Od czego zacząć dobór instalacji</h2>
<p>Najpierw zsumuj zużycie z faktur za ostatnie 12 miesięcy. Jeśli planujesz pompę ciepła, dolicz jej zużycie: dokładniej policzy je ${h.a('pompa-ciepla-i-fotowoltaika', 'kalkulator pompy ciepła i fotowoltaiki')}, który pokazuje też, ile z tego pokryje dach w każdym miesiącu. Jeśli wodę grzejesz prądem, zobacz stronę ${h.a('fotowoltaika-do-grzania-wody', 'fotowoltaika do grzania wody')}. Dopiero z tą sumą wpisz moc i zużycie w kalkulatorze na górze strony i porównaj wynik z ofertą instalatora, a cenę z oferty oceń na stronie o ${h.a('fotowoltaika-cena', 'cenie fotowoltaiki')}.</p>`;
    },
  },
  en: {
    slug: 'solar-for-a-house-poland', nav: 'Solar for a house', card: 'Size and break-even price for a 100, 120, 150 or 200 m² house.',
    title: 'Solar for a 100–150 m² house in Poland: size and price',
    description: 'Solar for a 100, 120, 150 or 200 m² house in Poland: the size you need with a heat pump and electric water heating, and the price for a 10-year payback.',
    h1: 'What solar costs for a 100, 120, 150 or 200 m² house',
    intro: 'Floor area alone does not tell you how much power you use. The bill does; the area matters when you heat the house or water with electricity.',
    resume: (h) => {
      const a = D(h, 150, 3000, false, false), b = D(h, 150, 3000, true, true);
      return `Solar for a 150 m² house has no single price, because the system size depends on power use, not on floor area. A house heated with gas or coal, with a bill of 3,000 kWh a year, needs about ${h.num(a.kwp, 1)} kWp if the panels are to give 90% of yearly use, and that system pays back within 10 years if it costs at most ${h.zl(a.max10)}. Floor area starts to matter with electric heating. A heat pump in a 150 m² house with a demand index of 110 kWh/m², at the minimum efficiency under EU Regulation 813/2013, uses about ${h.num(b.p)} kWh, and heating water with an element, by the formula in the Polish building energy performance regulation, about ${h.num(b.w)} kWh. Together with the bill that makes ${h.num(b.total)} kWh and a size of about ${h.num(b.kwp, 1)} kWp, worth up to ${h.zl(b.max10)}. The mini-calculator below works this out for your floor area, and the calculator at the top for your municipality.`;
    },
    faqs: (h) => [
      { q: 'What solar size for a 100 m² house with a heat pump?', a: `With a 3,000 kWh bill before heating and a pump in a house at 110 kWh/m², use rises to about ${h.num(D(h, 100, 3000, true, false).total)} kWh a year, so the size covering 90% is about ${h.num(D(h, 100, 3000, true, false).kwp, 1)} kWp. Bear in mind the pump runs mainly in winter, when panels give little, so you will buy part of its power from the grid anyway.` },
      { q: 'Under net-billing, is the system sized to the floor area?', a: 'No. The size follows use and its timing, because energy exported to the grid is worth the market price while imported energy costs the full tariff with distribution. A larger gas-heated house may use less power than a smaller one with a heat pump. So the first figure for the calculator is the yearly use on your invoice, and the floor area comes second.' },
      { q: 'How much power does water heating take in a 150 m² house?', a: `The Polish energy performance methodology assumes 1.4 litres of hot water per square metre per day for a single-family house, heated from 10 to 55 °C. For 150 m² that is about ${h.num(h.M.cwuKwh(150))} kWh of heat a year. An electric element turns power into heat almost one to one, while a heat pump water heater uses as many times less as its COP on the product sheet.` },
      { q: 'Does a system above 10 kWp pay for a 200 m² house?', a: `Only with high use. A 200 m² house with a heat pump and water heated by an element uses about ${h.num(D(h, 200, 3000, true, true).total)} kWh, which gives a size of about ${h.num(D(h, 200, 3000, true, true).kwp, 1)} kWp. A micro-installation may not exceed the building’s connection capacity in its contract with the grid operator, though. A larger system needs revised connection terms first.` },
    ],
    body: (h) => {
      const rows = AREAS.map((a) => { const g = D(h, a, 3000, false, false), p = D(h, a, 3000, true, true); return [`${a} m²`, `${h.num(g.kwp, 1)} kWp`, h.zl(g.max10), `${h.num(p.total)} kWh`, `${h.num(p.kwp, 1)} kWp`, h.zl(p.max10)]; });
      return `
<h2>Size and break-even price by floor area</h2>
<p>The table compares two houses with the same power bill before heating, 3,000 kWh a year. The first heats with gas or coal, the second with a heat pump and heats water with an element. The size is set so the panels give 90% of yearly use, with the average municipal PVGIS yield, 2026 G11 prices and RCE settlement.</p>
${h.table(['House', 'No electric heating', '10-year payback up to', 'With pump and water: use', 'Size', '10-year payback up to'], rows, 'Pump: 110 kWh/m²·yr, minimum SCOP under EU Reg. 813/2013. Water: 1.4 l/(m²·day), 10 → 55 °C (Dz.U. 2015 item 376).', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>In a house without electric heating the floor area does not change the size, because it does not change the bill. In a house with a pump every extra 50 m² adds several thousand kilowatt-hours, but mostly in winter. That is why the break-even price grows more slowly than the size: winter output is small, and the summer surplus goes to the grid at the market price.</p>
<!--mini:dom-->
<h2>Where to start when sizing a system</h2>
<p>First add up the use on your invoices for the last 12 months. If you plan a heat pump, add its use: the ${h.a('pompa-ciepla-i-fotowoltaika', 'heat pump and solar calculator')} works it out more precisely and shows how much of it the roof covers each month. If you heat water with electricity, see the ${h.a('fotowoltaika-do-grzania-wody', 'solar for water heating')} page. Only with that total, enter the size and use in the calculator at the top of the page and compare the result with an installer’s quote, then judge the quoted price on the ${h.a('fotowoltaika-cena', 'solar price')} page.</p>`;
    },
  },
});
