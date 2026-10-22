import { definePage, type Helpers } from '../../lib/page-types';
import type { GasArea } from '../../lib/engine/heat';

const H = (h: Helpers, area: number, eu: number, gasArea: GasArea = 'WA') => h.M.heatCosts({ area, eu, gasArea, scop: 3.5 });
const AREAS: GasArea[] = ['GD', 'PO', 'TA', 'WA', 'WR', 'ZA'];
const NAME = { pl: { GD: 'gdański', PO: 'poznański', TA: 'tarnowski', WA: 'warszawski', WR: 'wrocławski', ZA: 'zabrzański' }, en: { GD: 'Gdańsk', PO: 'Poznań', TA: 'Tarnów', WA: 'Warsaw', WR: 'Wrocław', ZA: 'Zabrze' } } as const;

export default definePage({
  id: 'ogrzewanie-gazem-koszt', group: 'cieplo', order: 40, tool: 'ciepło', toolArg: 'gaz',
  related: ['pompa-ciepla-koszt-ogrzewania', 'ogrzewanie-weglem-koszt', 'pompa-ciepla-cena'],
  sources: ['myOrlen', 'myOrlenFeb', 'psgTaryfa', 'urePsg', 'eco813'],
  pl: {
    slug: 'ogrzewanie-gazem-koszt', nav: 'Koszt ogrzewania gazem', card: 'Roczny rachunek za gaz według obszaru PSG.',
    title: 'Ogrzewanie gazem koszt 2026: rachunek roczny według PSG',
    description: 'Ile kosztuje ogrzewanie gazem w 2026 r.: roczny rachunek Twojego domu z ceną myORLEN, dystrybucją PSG i opłatą stałą, w porównaniu z pompą ciepła i węglem.',
    h1: 'Koszt ogrzewania gazem w 2026 roku',
    intro: 'Wpisz powierzchnię i stan domu, wybierz obszar PSG. Kalkulator policzy rachunek za gaz i porówna go z pompą i węglem.',
    resume: (h) => {
      const r = H(h, 120, 110);
      return `Koszt ogrzewania gazem składa się z trzech części: paliwa, dystrybucji i opłat stałych. Cena paliwa w taryfie myORLEN dla gospodarstw domowych wynosi w 2026 r. ${h.num(h.P.gas.energyNet * 1000, 2)} zł/MWh netto, a dystrybucja w grupie W-3.6 zależy od obszaru Polskiej Spółki Gazownictwa i waha się od ${h.num(Math.min(...AREAS.map((a) => h.P.gas.areas[a].dist)) * 1000, 2)} do ${h.num(Math.max(...AREAS.map((a) => h.P.gas.areas[a].dist)) * 1000, 2)} zł/MWh netto. Do tego dochodzą opłaty stałe, płacone co miesiąc niezależnie od zużycia, i 23 % VAT. Dom 120 m² ze wskaźnikiem 110 kWh/m² potrzebuje około ${h.num(r.heat)} kWh ciepła, czyli przy kotle kondensacyjnym o sprawności sezonowej ${h.pct(h.P.gas.boilerEff)} około ${h.num(r.gas.kwh)} kWh gazu. W obszarze warszawskim kosztuje to ${h.zl(r.gas.cost)} rocznie, w tym ${h.zl(r.gas.fixed)} opłat stałych. Pompa ciepła z SCOP 3,5 ogrzałaby ten sam dom za ${h.zl(r.hp.cost)}. Kalkulator powyżej liczy rachunek dla Twojego domu i obszaru.`;
    },
    faqs: (h) => [
      { q: 'Ile kosztuje 1 kWh gazu w 2026 roku?', a: `W obszarze warszawskim PSG około ${h.zl(h.M.gasGrossKwh('WA'), 3)} brutto za kWh: paliwo myORLEN plus dystrybucja zmienna W-3.6 z VAT. Do tego dochodzi opłata stała, około ${h.zl(h.M.gasFixedYear('WA'))} rocznie z VAT. W pozostałych obszarach stawka zmienna jest nieco wyższa, a opłata stała różna.` },
      { q: 'Ile gazu zużywa dom 150 m² rocznie?', a: `Zależy od ocieplenia. Dom 150 m² ze wskaźnikiem 110 kWh/m² potrzebuje około ${h.num(H(h, 150, 110).gas.kwh)} kWh gazu rocznie, a nieocieplony, przy 170 kWh/m², około ${h.num(H(h, 150, 170).gas.kwh)} kWh. To odpowiednio ${h.zl(H(h, 150, 110).gas.cost)} i ${h.zl(H(h, 150, 170).gas.cost)} w obszarze warszawskim, z opłatami stałymi.` },
      { q: 'Jak przeliczyć metry sześcienne gazu na kWh?', a: 'Na fakturze PSG zużycie w metrach sześciennych jest przeliczane na kilowatogodziny współczynnikiem konwersji, który podaje się dla każdego okresu rozliczenia. Dla gazu ziemnego wysokometanowego wynosi on zwykle około 11,2–11,4 kWh na m³. Do kalkulatora wpisuj kWh z faktury, nie metry sześcienne.' },
    ],
    body: (h) => {
      const rows = AREAS.map((a) => { const r = H(h, 120, 110, a); return [NAME.pl[a], h.zl(h.M.gasGrossKwh(a), 3), h.zl(h.M.gasFixedYear(a)), h.zl(r.gas.cost)]; });
      return `
<h2>Rachunek za gaz w sześciu obszarach PSG</h2>
${h.table(['Obszar PSG', 'Zł/kWh brutto', 'Opłaty stałe rocznie', 'Dom 120 m², 110 kWh/m²'], rows, 'Paliwo myORLEN, dystrybucja i opłata stała z taryfy PSG nr 14 na 2026 r., grupa W-3.6, VAT 23 %.', ['l', 'r', 'r', 'r'])}
<p>Różnice między obszarami wynikają z taryfy dystrybucyjnej. Paliwo kosztuje wszędzie tyle samo, jeśli kupujesz je od sprzedawcy z urzędu w taryfie zatwierdzonej przez Prezesa URE. Cena myORLEN obowiązuje do 31 grudnia 2026 r.</p>
<!--mini:gaz-->
<h2>Gaz czy pompa ciepła</h2>
<p>Przy cenach z 2026 r. pompa ciepła jest tańsza w eksploatacji niż kocioł gazowy w każdym z naszych przykładów, także przy najniższej sprawności dopuszczonej w UE. Różnica rośnie z wielkością domu, bo opłaty stałe za gaz są takie same, a koszt pompy rośnie z zużyciem wolniej niż koszt gazu. Czy wymiana się opłaca, zależy od ceny pompy i dotacji: liczy to ${h.a('pompa-ciepla-cena', 'cena pompy ciepła')}, a pełne porównanie z węglem ${h.a('pompa-ciepla-koszt-ogrzewania', 'kalkulator kosztu ogrzewania')}.</p>`;
    },
  },
  en: {
    slug: 'gas-heating-cost-poland', nav: 'Gas heating cost', card: 'Yearly gas bill by PSG tariff area.',
    title: 'Gas heating cost in Poland 2026: yearly bill by PSG area',
    description: 'What gas heating costs in Poland in 2026: the yearly bill for your house at the myORLEN price, PSG distribution and fixed charge, compared with a heat pump.',
    h1: 'Gas heating cost in Poland in 2026',
    intro: 'Enter the floor area and condition of the house and pick your PSG area. The calculator works out the gas bill and compares it with a pump and coal.',
    resume: (h) => {
      const r = H(h, 120, 110);
      return `The cost of gas heating has three parts: fuel, distribution and fixed charges. The fuel price in the myORLEN household tariff is PLN ${h.num(h.P.gas.energyNet * 1000, 2)}/MWh net in 2026, and distribution in group W-3.6 depends on the Polska Spółka Gazownictwa area, ranging from PLN ${h.num(Math.min(...AREAS.map((a) => h.P.gas.areas[a].dist)) * 1000, 2)} to PLN ${h.num(Math.max(...AREAS.map((a) => h.P.gas.areas[a].dist)) * 1000, 2)}/MWh net. On top come fixed charges, paid monthly regardless of use, and 23% VAT. A 120 m² house at 110 kWh/m² needs about ${h.num(r.heat)} kWh of heat, which with a condensing boiler at ${h.pct(h.P.gas.boilerEff)} seasonal efficiency means about ${h.num(r.gas.kwh)} kWh of gas. In the Warsaw area that costs ${h.zl(r.gas.cost)} a year, including ${h.zl(r.gas.fixed)} in fixed charges. A heat pump with SCOP 3.5 would heat the same house for ${h.zl(r.hp.cost)}. The calculator above works out the bill for your house and area.`;
    },
    faqs: (h) => [
      { q: 'What does 1 kWh of gas cost in Poland in 2026?', a: `In the PSG Warsaw area about ${h.zl(h.M.gasGrossKwh('WA'), 3)} gross per kWh: the myORLEN fuel price plus W-3.6 variable distribution, VAT included. On top there is a fixed charge of about ${h.zl(h.M.gasFixedYear('WA'))} a year with VAT. In other areas the variable rate is slightly higher and the fixed charge differs.` },
      { q: 'How much gas does a 150 m² house use a year?', a: `It depends on insulation. A 150 m² house at 110 kWh/m² needs about ${h.num(H(h, 150, 110).gas.kwh)} kWh of gas a year, and an uninsulated one at 170 kWh/m² about ${h.num(H(h, 150, 170).gas.kwh)} kWh. That is ${h.zl(H(h, 150, 110).gas.cost)} and ${h.zl(H(h, 150, 170).gas.cost)} respectively in the Warsaw area, fixed charges included.` },
      { q: 'How do I convert cubic metres of gas to kWh?', a: 'On a PSG invoice, use in cubic metres is converted to kilowatt-hours with a conversion factor given for each billing period. For high-methane natural gas it is usually about 11.2–11.4 kWh per m³. Enter the kWh figure from your invoice in the calculator, not cubic metres.' },
    ],
    body: (h) => {
      const rows = AREAS.map((a) => { const r = H(h, 120, 110, a); return [NAME.en[a], h.zl(h.M.gasGrossKwh(a), 3), h.zl(h.M.gasFixedYear(a)), h.zl(r.gas.cost)]; });
      return `
<h2>The gas bill in six PSG areas</h2>
${h.table(['PSG area', 'PLN/kWh gross', 'Fixed charges per year', '120 m² house, 110 kWh/m²'], rows, 'myORLEN fuel, distribution and fixed charge from PSG tariff no. 14 for 2026, group W-3.6, 23% VAT.', ['l', 'r', 'r', 'r'])}
<p>The differences between areas come from the distribution tariff. Fuel costs the same everywhere if you buy it from the default seller at the tariff approved by the President of URE. The myORLEN price applies until 31 December 2026.</p>
<!--mini:gaz-->
<h2>Gas or a heat pump</h2>
<p>At 2026 prices a heat pump costs less to run than a gas boiler in every one of our examples, even at the lowest efficiency allowed in the EU. The gap grows with the size of the house, because fixed gas charges stay the same while the pump’s cost rises with use more slowly than the gas cost. Whether switching pays depends on the pump’s price and the grant: the ${h.a('pompa-ciepla-cena', 'heat pump price')} page works it out, and the ${h.a('pompa-ciepla-koszt-ogrzewania', 'heating cost calculator')} gives the full comparison with coal.</p>`;
    },
  },
});
