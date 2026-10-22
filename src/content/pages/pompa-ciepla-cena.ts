import { definePage, type Helpers } from '../../lib/page-types';

const save = (h: Helpers, scop = 3.5) => h.M.heatCosts({ area: 120, eu: 110, scop }).saveVsGas;
const saveCoal = (h: Helpers, scop = 3.5) => h.M.heatCosts({ area: 120, eu: 110, scop }).saveVsCoal;
const G = (h: Helpers) => h.P.cp.grants;

export default definePage({
  id: 'pompa-ciepla-cena', group: 'cieplo', order: 20, tool: 'ciepło', toolArg: 'cena',
  related: ['dotacja-do-pompy-ciepla', 'pompa-ciepla-koszt-ogrzewania', 'czyste-powietrze-kalkulator', 'ogrzewanie-gazem-koszt'],
  sources: ['cpNaCo', 'cpDlaKogo', 'eco813', 'ureTaryfy2026', 'myOrlen', 'psgTaryfa', 'ulgaTermo'],
  pl: {
    slug: 'pompa-ciepla-cena', nav: 'Cena pompy ciepła', card: 'Cena po dotacji i zwrot względem gazu.',
    title: 'Pompa ciepła cena 2026: koszt po dotacji i zwrot inwestycji',
    description: 'Pompa ciepła cena w 2026 r.: ile zapłacisz po dotacji Czyste Powietrze na każdym poziomie i po ilu latach dopłata zwróci się względem ogrzewania gazem.',
    h1: 'Cena pompy ciepła po dotacji i zwrot inwestycji',
    intro: 'Wpisz cenę z oferty i poziom dofinansowania. Kalkulator odejmie dotację i policzy zwrot względem gazu.',
    resume: (h) => {
      const g = G(h).pcAirWaterPlus, s = save(h);
      return `Cena pompy ciepła z montażem zależy od mocy, typu i zakresu prac, a urzędowej średniej ceny rynkowej nie ma. Jest za to urzędowy punkt odniesienia: program Czyste Powietrze podaje maksymalną dotację do każdego typu pompy. Do pompy powietrze/woda o podwyższonej klasie efektywności wynosi ona ${h.zl(g[0])} na poziomie podstawowym (40 %), ${h.zl(g[1])} na podwyższonym (70 %) i ${h.zl(g[2])} na najwyższym (100 %). Z tego wynika, że NFOŚiGW uznaje za koszt kwalifikowany takiej pompy do ${h.zl(g[2])}. Twoja dopłata to cena z oferty minus dotacja. W domu 120 m² ze wskaźnikiem 110 kWh/m² pompa z SCOP 3,5 kosztuje w eksploatacji o około ${h.zl(s)} rocznie mniej niż kocioł gazowy, więc dopłata ${h.zl(20000)} zwraca się względem gazu w ${h.num(20000 / s, 1)} roku. Kalkulator powyżej liczy to dla Twojej ceny, domu i poziomu dotacji.`;
    },
    faqs: (h) => [
      { q: 'Ile kosztuje pompa ciepła z montażem w 2026 roku?', a: `Nie podajemy średniej ceny, bo nie ma jej urzędowego źródła, a oferty różnią się mocą, typem i zakresem. Punktem odniesienia jest pułap kosztów kwalifikowanych w programie Czyste Powietrze: ${h.zl(G(h).pcAirWaterPlus[2])} dla pompy powietrze/woda podwyższonej klasy i ${h.zl(G(h).pcGround[2] + G(h).groundSource[2])} dla pompy gruntowej z dolnym źródłem.` },
      { q: 'Ile wynosi dotacja do pompy ciepła w 2026 roku?', a: `W programie Czyste Powietrze do pompy powietrze/woda podwyższonej klasy od ${h.zl(G(h).pcAirWaterPlus[0])} do ${h.zl(G(h).pcAirWaterPlus[2])}, do gruntowej od ${h.zl(G(h).pcGround[0])} do ${h.zl(G(h).pcGround[2])} plus dolne źródło, do powietrze/powietrze od ${h.zl(G(h).pcAirAir[0])} do ${h.zl(G(h).pcAirAir[2])}. Poziom zależy od dochodu na osobę.` },
      { q: 'Po ilu latach zwraca się pompa ciepła?', a: `Względem gazu, przy domu 120 m² i SCOP 3,5, różnica w kosztach wynosi około ${h.zl(save(h))} rocznie. Dopłata 20 000 zł zwraca się więc w ${h.num(20000 / save(h), 1)} roku. Względem węgla różnica jest mniejsza, ${h.zl(saveCoal(h))} rocznie, bo węgiel jest tańszym paliwem, choć wymaga obsługi i ma zakaz w wielu gminach.` },
      { q: 'Czy pompę ciepła można odliczyć od podatku?', a: `Tak, w uldze termomodernizacyjnej w PIT, do ${h.zl(h.P.ulgaTermoCap)} na podatnika, jeśli jesteś właścicielem lub współwłaścicielem domu jednorodzinnego. Odliczasz wydatki po odjęciu dotacji. Ulgi nie łączy się z dotacją na ten sam wydatek w całości: odliczeniu podlega tylko część, którą zapłaciłeś sam.` },
    ],
    body: (h) => {
      const g = G(h);
      const rows = ([['pcAirWaterPlus', 'Powietrze/woda, podwyższona klasa'], ['pcAirWater', 'Powietrze/woda'], ['pcGround', 'Gruntowa (+ dolne źródło)'], ['pcAirAir', 'Powietrze/powietrze']] as const).map(([k, n]) => {
        const add = k === 'pcGround' ? g.groundSource : [0, 0, 0];
        return [n, h.zl(g[k][0] + add[0]), h.zl(g[k][1] + add[1]), h.zl(g[k][2] + add[2])];
      });
      const pay = [3, 3.5, 4].map((sc) => [`SCOP ${h.num(sc, 1)}`, h.zl(save(h, sc)), `${h.num(15000 / save(h, sc), 1)} roku`, `${h.num(25000 / save(h, sc), 1)} roku`]);
      return `
<h2>Maksymalna dotacja do pompy ciepła na każdym poziomie</h2>
${h.table(['Typ pompy', 'Podstawowy (40 %)', 'Podwyższony (70 %)', 'Najwyższy (100 %)'], rows, 'Czyste Powietrze, kwoty maksymalne po zmianach z 20 lipca 2026 r., bez audytu i instalacji c.o.', ['l', 'r', 'r', 'r'])}
<p>Dotacja nie przekroczy też procentu faktycznych kosztów: na poziomie podstawowym 40 % ceny, nawet jeśli tabela pozwala na więcej. Pompa musi być na liście zielonych urządzeń i materiałów (ZUM). Swój poziom dofinansowania sprawdzisz na stronie ${h.a('czyste-powietrze-progi-dochodowe', 'progi dochodowe Czystego Powietrza')}.</p>
<h2>Zwrot dopłaty względem gazu</h2>
${h.table(['Sprawność pompy', 'Taniej niż gaz rocznie', 'Zwrot 15 000 zł', 'Zwrot 25 000 zł'], pay, 'Dom 120 m², 110 kWh/m², prąd G11 2026, gaz myORLEN + PSG obszar warszawski z opłatą stałą.', ['l', 'r', 'r', 'r'])}
<p>Kwoty 15 000 i 25 000 zł to przykładowe dopłaty po dotacji, nie ceny rynkowe. Prosty zwrot nie uwzględnia zmian cen prądu i gazu ani kosztu serwisu. Pełne porównanie z węglem i gazem dla Twojego domu liczy ${h.a('pompa-ciepla-koszt-ogrzewania', 'kalkulator kosztu ogrzewania')}, a całą dotację, z ociepleniem i instalacją c.o., ${h.a('czyste-powietrze-kalkulator', 'kalkulator Czystego Powietrza')}.</p>`;
    },
  },
  en: {
    slug: 'heat-pump-price-poland', nav: 'Heat pump price', card: 'Price after the grant and payback against gas.',
    title: 'Heat pump price in Poland 2026: cost after grant and payback',
    description: 'Heat pump price in Poland in 2026: what you pay after the Czyste Powietrze grant at each level and how many years your share takes to pay back against gas.',
    h1: 'Heat pump price after the grant, and payback',
    intro: 'Enter your quoted price and grant level. The calculator subtracts the grant and works out payback against gas.',
    resume: (h) => {
      const g = G(h).pcAirWaterPlus, s = save(h);
      return `The installed price of a heat pump depends on its output, type and the scope of work, and there is no official average market price. There is an official reference point, though: the Czyste Powietrze programme sets the maximum grant for each type of pump. For an air-to-water pump of higher efficiency class it is ${h.zl(g[0])} at the basic level (40%), ${h.zl(g[1])} at the raised level (70%) and ${h.zl(g[2])} at the highest (100%). It follows that NFOŚiGW accepts up to ${h.zl(g[2])} as the eligible cost of such a pump. Your share is the quoted price minus the grant. In a 120 m² house at 110 kWh/m², a pump with SCOP 3.5 costs about ${h.zl(s)} a year less to run than a gas boiler, so a share of ${h.zl(20000)} pays back against gas in ${h.num(20000 / s, 1)} years. The calculator above works this out for your price, house and grant level.`;
    },
    faqs: (h) => [
      { q: 'What does an installed heat pump cost in Poland in 2026?', a: `We give no average price, because there is no official source for one and quotes differ in output, type and scope. The reference point is the eligible-cost cap in Czyste Powietrze: ${h.zl(G(h).pcAirWaterPlus[2])} for a higher-class air-to-water pump and ${h.zl(G(h).pcGround[2] + G(h).groundSource[2])} for a ground-source pump with its ground loop.` },
      { q: 'How large is the heat pump grant in 2026?', a: `Under Czyste Powietrze, from ${h.zl(G(h).pcAirWaterPlus[0])} to ${h.zl(G(h).pcAirWaterPlus[2])} for a higher-class air-to-water pump, from ${h.zl(G(h).pcGround[0])} to ${h.zl(G(h).pcGround[2])} for a ground-source pump plus the ground loop, and from ${h.zl(G(h).pcAirAir[0])} to ${h.zl(G(h).pcAirAir[2])} for air-to-air. The level depends on income per person.` },
      { q: 'How many years does a heat pump take to pay back?', a: `Against gas, in a 120 m² house at SCOP 3.5, the running-cost gap is about ${h.zl(save(h))} a year. A PLN 20,000 share therefore pays back in ${h.num(20000 / save(h), 1)} years. Against coal the gap is smaller, ${h.zl(saveCoal(h))} a year, because coal is a cheaper fuel, though it needs tending and is banned in many municipalities.` },
      { q: 'Can a heat pump be deducted from income tax?', a: `Yes, under the thermal-modernisation relief in PIT, up to ${h.zl(h.P.ulgaTermoCap)} per taxpayer, if you own or co-own a single-family house. You deduct the spending net of any grant. The relief does not stack with a grant on the same full expense: only the part you paid yourself can be deducted.` },
    ],
    body: (h) => {
      const g = G(h);
      const rows = ([['pcAirWaterPlus', 'Air-to-water, higher class'], ['pcAirWater', 'Air-to-water'], ['pcGround', 'Ground source (+ ground loop)'], ['pcAirAir', 'Air-to-air']] as const).map(([k, n]) => {
        const add = k === 'pcGround' ? g.groundSource : [0, 0, 0];
        return [n, h.zl(g[k][0] + add[0]), h.zl(g[k][1] + add[1]), h.zl(g[k][2] + add[2])];
      });
      const pay = [3, 3.5, 4].map((sc) => [`SCOP ${h.num(sc, 1)}`, h.zl(save(h, sc)), `${h.num(15000 / save(h, sc), 1)} years`, `${h.num(25000 / save(h, sc), 1)} years`]);
      return `
<h2>Maximum heat pump grant at each level</h2>
${h.table(['Pump type', 'Basic (40%)', 'Raised (70%)', 'Highest (100%)'], rows, 'Czyste Powietrze, maximum amounts after the changes of 20 July 2026, excluding the audit and heating pipework.', ['l', 'r', 'r', 'r'])}
<p>The grant also cannot exceed the percentage of actual costs: 40% of the price at the basic level, even if the table allows more. The pump must be on the list of green devices and materials (ZUM). You can check your grant level on the ${h.a('czyste-powietrze-progi-dochodowe', 'Czyste Powietrze income thresholds')} page.</p>
<h2>Payback of your share against gas</h2>
${h.table(['Pump efficiency', 'Cheaper than gas per year', 'Payback of PLN 15,000', 'Payback of PLN 25,000'], pay, '120 m² house, 110 kWh/m², 2026 G11 power, myORLEN gas + PSG Warsaw area with fixed charge.', ['l', 'r', 'r', 'r'])}
<p>PLN 15,000 and PLN 25,000 are example shares after the grant, not market prices. Simple payback ignores changes in power and gas prices and the cost of servicing. The ${h.a('pompa-ciepla-koszt-ogrzewania', 'heating cost calculator')} gives the full comparison with coal and gas for your house, and the ${h.a('czyste-powietrze-kalkulator', 'Czyste Powietrze calculator')} the whole grant including insulation and pipework.</p>`;
    },
  },
});
