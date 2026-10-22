import { definePage, type Helpers } from '../../lib/page-types';

const H = (h: Helpers, area: number, eu: number, scop?: number) => h.M.heatCosts({ area, eu, scop });
const houses: Array<[number, number]> = [[100, 70], [120, 110], [150, 110], [150, 170]];

export default definePage({
  id: 'pompa-ciepla-koszt-ogrzewania', group: 'cieplo', order: 10, tool: 'ciepło',
  related: ['pompa-ciepla-cena', 'pompa-ciepla-i-fotowoltaika', 'ogrzewanie-gazem-koszt', 'ogrzewanie-weglem-koszt'],
  sources: ['eco813', 'ureTaryfy2026', 'energaOperator', 'myOrlen', 'psgTaryfa', 'gusCoal', 'cpNaCo'],
  pl: {
    slug: 'pompa-ciepla-koszt-ogrzewania', nav: 'Koszt ogrzewania pompą', card: 'Roczny rachunek pompy ciepła, węgla i gazu.',
    title: 'Pompa ciepła: koszty eksploatacji i ogrzewania w 2026',
    description: 'Ile kosztuje ogrzewanie pompą ciepła w 2026 r.: roczny rachunek za prąd Twojego domu w porównaniu z węglem i gazem, z SCOP z karty pompy i cenami 2026.',
    h1: 'Koszt ogrzewania pompą ciepła w 2026 roku',
    intro: 'Wpisz powierzchnię, stan domu i SCOP pompy z karty produktu. Kalkulator porówna roczny koszt z węglem i gazem.',
    resume: (h) => {
      const r = H(h, 120, 110), q = H(h, 120, 110, 4);
      return `Koszt ogrzewania pompą ciepła to ilość ciepła, której potrzebuje dom, podzielona przez sezonową sprawność pompy (SCOP) i pomnożona przez cenę prądu. Dom o powierzchni 120 m² ze wskaźnikiem zapotrzebowania 110 kWh/m² rocznie potrzebuje około ${h.num(r.heat)} kWh ciepła. Pompa o najniższej sprawności dopuszczonej w UE, SCOP ${h.num(h.M.scopMin(true), 1)}, zużyje na to ${h.num(r.hp.kwh)} kWh prądu, co przy cenie G11 około ${h.zl(h.M.elecGross(), 2)} za kWh daje ${h.zl(r.hp.cost)} rocznie. Dobra pompa powietrze/woda z SCOP 4 obniży ten rachunek do ${h.zl(q.hp.cost)}. Ten sam dom ogrzewany węglem kosztuje około ${h.zl(r.coal.cost)} rocznie, a gazem ${h.zl(r.gas.cost)} z opłatami stałymi. Przy cenach z 2026 r. pompa wygrywa więc z gazem w każdym z naszych przykładów, a z węglem dopiero przy dobrej sprawności, ocieplonym domu albo prądzie z własnych paneli. Kalkulator powyżej liczy to dla Twojego domu i cen.`;
    },
    faqs: (h) => [
      { q: 'Ile prądu zużywa pompa ciepła rocznie?', a: `Tyle, ile ciepła potrzebuje dom, podzielone przez SCOP. Dom 120 m² ze wskaźnikiem 110 kWh/m² potrzebuje około ${h.num(H(h, 120, 110).heat)} kWh ciepła, więc pompa z SCOP 4 zużyje około ${h.num(H(h, 120, 110, 4).hp.kwh)} kWh prądu. W domu nieocieplonym, przy 170 kWh/m², zużycie rośnie o ponad połowę.` },
      { q: 'Czy pompa ciepła jest tańsza w eksploatacji niż węgiel?', a: `Zależy od sprawności pompy i stanu domu. Przy minimalnym SCOP dopuszczonym w UE dom 120 m² płaci za pompę ${h.zl(H(h, 120, 110).hp.cost)}, a za węgiel ${h.zl(H(h, 120, 110).coal.cost)} rocznie. Przy SCOP 4 pompa kosztuje ${h.zl(H(h, 120, 110, 4).hp.cost)}. Węgiel wymaga też obsługi, a kotły na węgiel nie dostają już dotacji.` },
      { q: 'Co to jest SCOP i gdzie go znaleźć?', a: 'SCOP to sezonowy współczynnik efektywności: ile kilowatogodzin ciepła pompa daje średnio w sezonie z jednej kilowatogodziny prądu. Podaje go karta produktu i etykieta energetyczna, osobno dla zasilania 35 °C (ogrzewanie podłogowe) i 55 °C (grzejniki). Do kalkulatora wpisz wartość dla klimatu umiarkowanego i swojej temperatury zasilania.' },
      { q: 'Czy taryfa G12 obniża koszt ogrzewania pompą ciepła?', a: 'Może, jeśli pompa grzeje głównie w godzinach tańszej strefy, na przykład z buforem ciepła albo przy ogrzewaniu podłogowym o dużej bezwładności. Kalkulator przyjmuje cenę G11, ale pole „Cena prądu brutto” możesz zmienić na średnią cenę z Twojej taryfy, ważoną godzinami pracy pompy.' },
    ],
    body: (h) => {
      const rows = houses.map(([a, eu]) => { const r = H(h, a, eu), q = H(h, a, eu, 4); return [`${a} m², ${eu} kWh/m²`, h.zl(r.hp.cost), h.zl(q.hp.cost), h.zl(r.coal.cost), h.zl(r.gas.cost)]; });
      return `
<h2>Roczny koszt ogrzewania czterech typowych domów</h2>
${h.table(['Dom', `Pompa, SCOP ${h.num(h.M.scopMin(true), 1)}`, 'Pompa, SCOP 4', 'Węgiel', 'Gaz'], rows, `Prąd G11 2026 ${h.zl(h.M.elecGross(), 2)}/kWh, węgiel ${h.zl(h.P.coal.pricePerTon2025)}/t (GUS 2025), gaz myORLEN + PSG obszar warszawski z opłatą stałą.`, ['l', 'r', 'r', 'r', 'r'])}
<p>SCOP ${h.num(h.M.scopMin(true), 1)} to dolna granica z rozporządzenia UE 813/2013 dla pomp niskotemperaturowych: tyle musi osiągnąć każda pompa sprzedawana w Unii. Pompy z listy ZUM programu Czyste Powietrze zwykle mają wyższy SCOP. Wartość dla Twojego urządzenia znajdziesz na karcie produktu.</p>
<h2>Koszty eksploatacji pompy ciepła: z czego składa się rachunek</h2>
<p>Głównym kosztem eksploatacji pompy jest prąd. Każda kilowatogodzina w taryfie G11 na 2026 r. kosztuje około ${h.zl(h.M.elecGross(), 2)} brutto, z czego ${h.zl(h.P.elec.energyNet * (1 + h.P.vat), 2)} to energia, a ${h.zl((h.P.elec.distVarNet + h.P.elec.qualityNet + h.P.elec.ozeNet + h.P.elec.kogenNet) * (1 + h.P.vat), 2)} dystrybucja zmienna i opłaty, które rosną razem ze zużyciem. Opłaty stałe licznika płacisz i tak, więc pompa ich nie zwiększa. Przy domu 120 m² ze wskaźnikiem 110 kWh/m² różnica między pompą o minimalnym SCOP a pompą z SCOP 4 to ${h.zl(H(h, 120, 110).hp.cost - H(h, 120, 110, 4).hp.cost)} rocznie, czyli przy wyborze urządzenia sprawność waży więcej niż kilkuprocentowa różnica w cenie zakupu. Przeglądy serwisowe zależą od warunków gwarancji producenta, sprawdź je w karcie gwarancyjnej przed zakupem.</p>
<h2>Jak obniżyć koszt ogrzewania pompą</h2>
<p>Najwięcej daje ocieplenie: dom ze wskaźnikiem 70 zamiast 110 kWh/m² potrzebuje o jedną trzecią mniej ciepła. Drugie w kolejności jest niższa temperatura zasilania, bo pompa pracująca na 35 °C dla podłogówki osiąga wyższy SCOP niż przy 55 °C dla grzejników. Trzecie to prąd z własnych paneli, choć zimą produkują one niewiele; ile pokryją, liczy strona ${h.a('pompa-ciepla-i-fotowoltaika', 'pompa ciepła i fotowoltaika')}. Ile kosztuje sama pompa po dotacji i po ilu latach zwraca się względem gazu, pokazuje ${h.a('pompa-ciepla-cena', 'cena pompy ciepła')}.</p>`;
    },
  },
  en: {
    slug: 'heat-pump-running-cost-poland', nav: 'Heat pump running cost', card: 'Yearly bill for a heat pump, coal and gas.',
    title: 'Heat pump running cost in Poland 2026 vs coal and gas',
    description: 'What heating with a heat pump costs in Poland in 2026: the yearly power bill for your house compared with coal and gas, using your pump’s SCOP and 2026 prices.',
    h1: 'Heat pump running cost in Poland in 2026',
    intro: 'Enter the floor area, the condition of the house and the pump’s SCOP from its product sheet. The calculator compares the yearly cost with coal and gas.',
    resume: (h) => {
      const r = H(h, 120, 110), q = H(h, 120, 110, 4);
      return `The cost of heating with a heat pump is the amount of heat the house needs, divided by the pump’s seasonal efficiency (SCOP) and multiplied by the power price. A 120 m² house with a demand index of 110 kWh/m² a year needs about ${h.num(r.heat)} kWh of heat. A pump with the lowest efficiency allowed in the EU, SCOP ${h.num(h.M.scopMin(true), 1)}, uses ${h.num(r.hp.kwh)} kWh of electricity for that, which at the G11 price of about ${h.zl(h.M.elecGross(), 2)} per kWh comes to ${h.zl(r.hp.cost)} a year. A good air-to-water pump with SCOP 4 cuts that bill to ${h.zl(q.hp.cost)}. The same house heated with coal costs about ${h.zl(r.coal.cost)} a year, and with gas ${h.zl(r.gas.cost)} including fixed charges. At 2026 prices a pump therefore beats gas in every one of our examples, and beats coal only with good efficiency, an insulated house or power from your own panels. The calculator above works this out for your house and prices.`;
    },
    faqs: (h) => [
      { q: 'How much electricity does a heat pump use a year?', a: `As much heat as the house needs, divided by the SCOP. A 120 m² house at 110 kWh/m² needs about ${h.num(H(h, 120, 110).heat)} kWh of heat, so a pump with SCOP 4 uses about ${h.num(H(h, 120, 110, 4).hp.kwh)} kWh of power. In an uninsulated house, at 170 kWh/m², use rises by more than half.` },
      { q: 'Is a heat pump cheaper to run than coal?', a: `It depends on the pump’s efficiency and the house. At the minimum SCOP allowed in the EU a 120 m² house pays ${h.zl(H(h, 120, 110).hp.cost)} for the pump and ${h.zl(H(h, 120, 110).coal.cost)} for coal a year. At SCOP 4 the pump costs ${h.zl(H(h, 120, 110, 4).hp.cost)}. Coal also needs tending, and coal boilers no longer receive grants.` },
      { q: 'What is SCOP and where do I find it?', a: 'SCOP is the seasonal coefficient of performance: how many kilowatt-hours of heat the pump gives on average over the season per kilowatt-hour of power. It is on the product sheet and energy label, separately for 35 °C flow (underfloor heating) and 55 °C (radiators). Enter the value for the average climate and your flow temperature.' },
      { q: 'Does the G12 tariff lower heat pump running costs?', a: 'It can, if the pump heats mostly in the cheaper hours, for example with a heat buffer or underfloor heating with high thermal mass. The calculator uses the G11 price, but you can change the “Electricity price, gross” field to the average price of your tariff, weighted by the pump’s running hours.' },
    ],
    body: (h) => {
      const rows = houses.map(([a, eu]) => { const r = H(h, a, eu), q = H(h, a, eu, 4); return [`${a} m², ${eu} kWh/m²`, h.zl(r.hp.cost), h.zl(q.hp.cost), h.zl(r.coal.cost), h.zl(r.gas.cost)]; });
      return `
<h2>Yearly heating cost of four typical houses</h2>
${h.table(['House', `Pump, SCOP ${h.num(h.M.scopMin(true), 1)}`, 'Pump, SCOP 4', 'Coal', 'Gas'], rows, `Power G11 2026 ${h.zl(h.M.elecGross(), 2)}/kWh, coal ${h.zl(h.P.coal.pricePerTon2025)}/t (Statistics Poland 2025), gas myORLEN + PSG Warsaw area with fixed charge.`, ['l', 'r', 'r', 'r', 'r'])}
<p>SCOP ${h.num(h.M.scopMin(true), 1)} is the floor set by EU Regulation 813/2013 for low-temperature pumps: every pump sold in the Union must reach it. Pumps on the ZUM list of the Czyste Powietrze programme usually have a higher SCOP. Your unit’s value is on its product sheet.</p>
<h2>Heat pump running costs: what the bill is made of</h2>
<p>The main running cost of a pump is electricity. Each kilowatt-hour on the 2026 G11 tariff costs about ${h.zl(h.M.elecGross(), 2)} gross, of which ${h.zl(h.P.elec.energyNet * (1 + h.P.vat), 2)} is energy and ${h.zl((h.P.elec.distVarNet + h.P.elec.qualityNet + h.P.elec.ozeNet + h.P.elec.kogenNet) * (1 + h.P.vat), 2)} variable distribution and charges, which grow with use. You pay the meter’s fixed charges anyway, so the pump does not add to them. For a 120 m² house at 110 kWh/m², the gap between a pump at the minimum SCOP and one at SCOP 4 is ${h.zl(H(h, 120, 110).hp.cost - H(h, 120, 110, 4).hp.cost)} a year, so when choosing a unit efficiency weighs more than a few per cent of purchase price. Servicing depends on the maker’s warranty terms; check them on the warranty card before you buy.</p>
<h2>How to lower the cost of heating with a pump</h2>
<p>Insulation helps most: a house at 70 instead of 110 kWh/m² needs a third less heat. Next comes a lower flow temperature, because a pump running at 35 °C for underfloor heating reaches a higher SCOP than at 55 °C for radiators. Third is power from your own panels, though they produce little in winter; the ${h.a('pompa-ciepla-i-fotowoltaika', 'heat pump and solar')} page works out how much they cover. What the pump itself costs after the grant, and how fast it pays back against gas, is on the ${h.a('pompa-ciepla-cena', 'heat pump price')} page.</p>`;
    },
  },
});
