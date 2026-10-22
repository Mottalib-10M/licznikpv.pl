import { definePage, type Helpers } from '../../lib/page-types';

const H = (h: Helpers, area: number, eu: number, coalPricePerTon?: number, scop = 3.5) => h.M.heatCosts({ area, eu, coalPricePerTon, scop });
const houses: Array<[number, number]> = [[100, 110], [120, 110], [120, 170], [150, 170]];

export default definePage({
  id: 'ogrzewanie-weglem-koszt', group: 'cieplo', order: 50, tool: 'ciepło', toolArg: 'węgiel',
  related: ['pompa-ciepla-koszt-ogrzewania', 'czyste-powietrze-2026', 'ogrzewanie-gazem-koszt'],
  sources: ['gusCoal', 'coalReg', 'eco1189', 'cpNaCo'],
  pl: {
    slug: 'ogrzewanie-weglem-koszt', nav: 'Koszt ogrzewania węglem', card: 'Ile ton i ile złotych na sezon grzewczy.',
    title: 'Ogrzewanie węglem koszt 2026: ile ton i ile zł na sezon',
    description: 'Ile kosztuje ogrzewanie węglem w 2026 r.: ile ton zużyje Twój dom w sezonie, ile to kosztuje po cenie GUS i o ile taniej wyjdzie pompa ciepła z dotacją.',
    h1: 'Koszt ogrzewania węglem w 2026 roku',
    intro: 'Wpisz powierzchnię, stan domu i cenę tony z faktury. Kalkulator policzy zużycie węgla i porówna je z pompą i gazem.',
    resume: (h) => {
      const r = H(h, 120, 110);
      return `Koszt ogrzewania węglem to ilość ciepła potrzebna domowi, podzielona przez sprawność kotła i wartość opałową węgla, pomnożona przez cenę tony. Według GUS przeciętna cena tony węgla kamiennego dla gospodarstw domowych wyniosła w 2025 r. ${h.zl(h.P.coal.pricePerTon2025)}, o ${h.pct(1 - h.P.coal.pricePerTon2025 / h.P.coal.pricePerTon2024)} mniej niż rok wcześniej. Węgiel opałowy ma około ${h.num(h.P.coal.mjPerKg)} MJ/kg, czyli ${h.num(h.M.coalKwhPerKg(), 1)} kWh energii w kilogramie, a nowoczesny kocioł 5. klasy wykorzystuje w sezonie około ${h.pct(h.P.coal.boilerEff)} z niej. Dom 120 m² ze wskaźnikiem 110 kWh/m² zużyje więc około ${h.num(r.coal.tons, 1)} t węgla rocznie, co kosztuje ${h.zl(r.coal.cost)}. Pompa ciepła z SCOP 3,5 ogrzeje go za ${h.zl(r.hp.cost)}, bez noszenia opału i wynoszenia popiołu. Stary kocioł zasypowy ma niższą sprawność, więc pali więcej. Kalkulator powyżej liczy to dla Twojego domu i ceny.`;
    },
    faqs: (h) => [
      { q: 'Ile ton węgla na sezon zużywa dom 100 m²?', a: `Zależy od ocieplenia i kotła. Dom 100 m² ze wskaźnikiem 110 kWh/m² z kotłem o sprawności ${h.pct(h.P.coal.boilerEff)} zużywa około ${h.num(H(h, 100, 110).coal.tons, 1)} t rocznie, a nieocieplony, przy 170 kWh/m², około ${h.num(H(h, 100, 170).coal.tons, 1)} t. Stary kocioł zasypowy o sprawności 50–60 % spala o jedną trzecią więcej.` },
      { q: 'Czy można jeszcze dostać dotację do pieca na węgiel?', a: 'Nie. Program Czyste Powietrze nie finansuje kotłów węglowych od 2022 r., a wiele województw przyjęło uchwały antysmogowe zakazujące eksploatacji starych kotłów pozaklasowych. Dotacja przysługuje na wymianę kotła węglowego na pompę ciepła, kocioł na biomasę, sieć ciepłowniczą albo ogrzewanie elektryczne, często razem z ociepleniem domu.' },
      { q: 'Czy pompa ciepła wyjdzie taniej niż węgiel?', a: `W eksploatacji zależy to od SCOP. Dla domu 120 m² ze wskaźnikiem 110 kWh/m² węgiel kosztuje ${h.zl(H(h, 120, 110).coal.cost)} rocznie, pompa z SCOP 3,5 ${h.zl(H(h, 120, 110).hp.cost)}, a z SCOP 4 ${h.zl(H(h, 120, 110, undefined, 4).hp.cost)}. Pompa z najniższą sprawnością dopuszczoną w UE może być droższa od węgla.` },
    ],
    body: (h) => {
      const rows = houses.map(([a, eu]) => { const r = H(h, a, eu); return [`${a} m², ${eu} kWh/m²`, `${h.num(r.coal.tons, 1)} t`, h.zl(r.coal.cost), h.zl(H(h, a, eu, 2000).coal.cost), h.zl(r.hp.cost)]; });
      return `
<h2>Zużycie i koszt węgla w czterech domach</h2>
${h.table(['Dom', 'Węgiel rocznie', `Przy ${h.zl(h.P.coal.pricePerTon2025)}/t`, 'Przy 2000 zł/t', 'Pompa, SCOP 3,5'], rows, `Węgiel ${h.num(h.P.coal.mjPerKg)} MJ/kg, kocioł 5. klasy, sprawność sezonowa ${h.pct(h.P.coal.boilerEff)}; cena GUS 2025; prąd G11 2026.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Cena GUS to średnia z całego kraju i całego roku. Węgiel workowany i groszek wyższej jakości kosztują zwykle więcej, a kupowany luzem latem mniej. Wpisz w kalkulatorze cenę z własnej faktury.</p>
<!--mini:wegiel-->
<h2>Wymiana kotła węglowego</h2>
<p>Ogrzewanie węglem bywa dziś tańsze w eksploatacji niż słaba pompa ciepła, ale wymaga codziennej obsługi, miejsca na opał i spełniania uchwał antysmogowych. Wymianę kotła finansuje ${h.a('czyste-powietrze-2026', 'program Czyste Powietrze')}: do 100 % kosztów przy najniższych dochodach. Porównanie z pompą i gazem dla Twojego domu liczy ${h.a('pompa-ciepla-koszt-ogrzewania', 'kalkulator kosztu ogrzewania')}.</p>`;
    },
  },
  en: {
    slug: 'coal-heating-cost-poland', nav: 'Coal heating cost', card: 'How many tonnes and how many zloty per season.',
    title: 'Coal heating cost in Poland 2026: tonnes and PLN per season',
    description: 'What coal heating costs in Poland in 2026: the tonnes your house burns per season, the cost at the Statistics Poland price and how a heat pump compares.',
    h1: 'Coal heating cost in Poland in 2026',
    intro: 'Enter the floor area, the condition of the house and the price per tonne from your invoice. The calculator works out coal use and compares it with a pump and gas.',
    resume: (h) => {
      const r = H(h, 120, 110);
      return `The cost of heating with coal is the heat the house needs, divided by the boiler’s efficiency and the coal’s calorific value, multiplied by the price per tonne. According to Statistics Poland, the average price of a tonne of hard coal for households was ${h.zl(h.P.coal.pricePerTon2025)} in 2025, ${h.pct(1 - h.P.coal.pricePerTon2025 / h.P.coal.pricePerTon2024)} less than a year earlier. Heating coal has about ${h.num(h.P.coal.mjPerKg)} MJ/kg, or ${h.num(h.M.coalKwhPerKg(), 1)} kWh of energy per kilogram, and a modern class 5 boiler uses about ${h.pct(h.P.coal.boilerEff)} of it over the season. A 120 m² house at 110 kWh/m² therefore burns about ${h.num(r.coal.tons, 1)} t of coal a year, costing ${h.zl(r.coal.cost)}. A heat pump with SCOP 3.5 heats it for ${h.zl(r.hp.cost)}, with no fuel to carry and no ash to remove. An old manual-feed boiler is less efficient, so it burns more. The calculator above works this out for your house and price.`;
    },
    faqs: (h) => [
      { q: 'How many tonnes of coal does a 100 m² house burn per season?', a: `It depends on insulation and the boiler. A 100 m² house at 110 kWh/m² with a boiler at ${h.pct(h.P.coal.boilerEff)} efficiency burns about ${h.num(H(h, 100, 110).coal.tons, 1)} t a year, and an uninsulated one at 170 kWh/m² about ${h.num(H(h, 100, 170).coal.tons, 1)} t. An old manual-feed boiler at 50–60% efficiency burns a third more.` },
      { q: 'Can I still get a grant for a coal boiler?', a: 'No. Czyste Powietrze has not funded coal boilers since 2022, and many regions have adopted anti-smog resolutions banning the use of old, unclassified boilers. Grants are available for replacing a coal boiler with a heat pump, a biomass boiler, district heating or electric heating, often together with insulating the house.' },
      { q: 'Will a heat pump cost less than coal?', a: `In running costs it depends on the SCOP. For a 120 m² house at 110 kWh/m² coal costs ${h.zl(H(h, 120, 110).coal.cost)} a year, a SCOP 3.5 pump ${h.zl(H(h, 120, 110).hp.cost)} and a SCOP 4 pump ${h.zl(H(h, 120, 110, undefined, 4).hp.cost)}. A pump at the lowest efficiency allowed in the EU can cost more than coal.` },
    ],
    body: (h) => {
      const rows = houses.map(([a, eu]) => { const r = H(h, a, eu); return [`${a} m², ${eu} kWh/m²`, `${h.num(r.coal.tons, 1)} t`, h.zl(r.coal.cost), h.zl(H(h, a, eu, 2000).coal.cost), h.zl(r.hp.cost)]; });
      return `
<h2>Coal use and cost in four houses</h2>
${h.table(['House', 'Coal per year', `At ${h.zl(h.P.coal.pricePerTon2025)}/t`, 'At PLN 2,000/t', 'Pump, SCOP 3.5'], rows, `Coal ${h.num(h.P.coal.mjPerKg)} MJ/kg, class 5 boiler, ${h.pct(h.P.coal.boilerEff)} seasonal efficiency; Statistics Poland 2025 price; 2026 G11 power.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The Statistics Poland price is a national, full-year average. Bagged coal and higher-grade pea coal usually cost more, and loose coal bought in summer less. Enter the price from your own invoice in the calculator.</p>
<!--mini:wegiel-->
<h2>Replacing a coal boiler</h2>
<p>Coal heating can still cost less to run than a weak heat pump, but it needs daily tending, space for fuel and compliance with anti-smog resolutions. Boiler replacement is funded by the ${h.a('czyste-powietrze-2026', 'Czyste Powietrze programme')}: up to 100% of costs for the lowest incomes. The ${h.a('pompa-ciepla-koszt-ogrzewania', 'heating cost calculator')} compares it with a pump and gas for your house.</p>`;
    },
  },
});
