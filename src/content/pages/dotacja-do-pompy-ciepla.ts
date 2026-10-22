import { definePage, type Helpers } from '../../lib/page-types';

const G = (h: Helpers) => h.P.cp.grants;
/** Udział własny przy cenie `price` : dotacja = mniejsza z kwoty z tabeli i procentu kosztów. */
const own = (h: Helpers, price: number, lv: 0 | 1 | 2) => { const rate = [0.4, 0.7, 1][lv]; return price - Math.min(G(h).pcAirWaterPlus[lv], price * rate); };

export default definePage({
  id: 'dotacja-do-pompy-ciepla', group: 'dotacje', order: 40, mini: 'pc',
  related: ['pompa-ciepla-cena', 'czyste-powietrze-kalkulator', 'czyste-powietrze-progi-dochodowe', 'pompa-ciepla-koszt-ogrzewania'],
  sources: ['cpNaCo', 'cpDlaKogo', 'cpDocs', 'ulgaTermo', 'pmeProgram', 'eco813'],
  pl: {
    slug: 'dotacja-do-pompy-ciepla', nav: 'Dotacja do pompy ciepła', card: 'Ile dopłaty do każdego typu pompy w 2026 r.',
    title: 'Dotacja do pompy ciepła 2026: kwoty, warunki i ulga w PIT',
    description: 'Dotacja do pompy ciepła w 2026 r.: kwoty Czystego Powietrza dla każdego typu pompy i poziomu, warunki, lista ZUM, dopłata do magazynu ciepła i ulga w PIT.',
    h1: 'Dotacja do pompy ciepła w 2026 roku',
    intro: 'Sprawdź od razu, ile dopłaty dostaniesz przy swoim dochodzie. Niżej kwoty dla każdego typu pompy i wszystkie warunki.',
    resume: (h) => `Dotację do pompy ciepła na istniejący dom jednorodzinny daje w 2026 r. przede wszystkim program Czyste Powietrze. Kwota zależy od typu pompy i poziomu dofinansowania, a poziom od dochodu. Do pompy powietrze/woda o podwyższonej klasie efektywności energetycznej program daje do ${h.zl(G(h).pcAirWaterPlus[0])} na poziomie podstawowym, ${h.zl(G(h).pcAirWaterPlus[1])} na podwyższonym i ${h.zl(G(h).pcAirWaterPlus[2])} na najwyższym. Do pompy gruntowej z dolnym źródłem nawet ${h.zl(G(h).pcGround[2] + G(h).groundSource[2])}, a do pompy powietrze/powietrze do ${h.zl(G(h).pcAirAir[2])}. Dotacja nie przekracza jednak 40, 70 albo 100 % faktycznej ceny. Pompa musi być na liście ZUM, a dom powyżej 140 kWh/m² rocznie trzeba też ocieplić. Kto nie mieści się w progach dochodowych, może odliczyć pompę w uldze termomodernizacyjnej, do ${h.zl(h.P.ulgaTermoCap)} na podatnika. Mini-kalkulator poniżej pokazuje kwotę dla Twojego dochodu.`,
    faqs: (h) => [
      { q: 'Ile wynosi dotacja do pompy ciepła powietrze/woda w 2026 roku?', a: `Z programu Czyste Powietrze do pompy powietrze/woda o podwyższonej klasie efektywności od ${h.zl(G(h).pcAirWaterPlus[0])} do ${h.zl(G(h).pcAirWaterPlus[2])}, a do pompy powietrze/woda standardowej klasy od ${h.zl(G(h).pcAirWater[0])} do ${h.zl(G(h).pcAirWater[2])}. Kwota zależy od poziomu dofinansowania i nie przekroczy 40, 70 albo 100 % faktycznych kosztów.` },
      { q: 'Czy dostanę dotację do pompy ciepła w nowym domu?', a: 'Nie z Czystego Powietrza: program dotyczy wymiany nieefektywnego źródła ciepła w istniejącym budynku, którego właścicielem jest się co najmniej 3 lata, z wyjątkami. W nowym domu pozostaje ulga termomodernizacyjna w PIT, jeśli budynek jest już oddany do użytkowania, oraz dopłata do magazynu ciepła w programie Przydomowe Magazyny Energii.' },
      { q: 'Co to jest lista ZUM?', a: 'Lista zielonych urządzeń i materiałów prowadzona przez NFOŚiGW. Są na niej pompy ciepła, kotły i materiały izolacyjne, które spełniają wymagania programu Czyste Powietrze, w tym klasę efektywności i parametry z badań. Dotacja przysługuje tylko na urządzenie z tej listy, więc sprawdź model z oferty przed podpisaniem umowy.' },
      { q: 'Czy do pompy ciepła jest dopłata w programie Przydomowe Magazyny Energii?', a: `Do samej pompy nie, ale do magazynu ciepła tak: 30 % kosztów, najwyżej ${h.zl(h.P.pme.heatCap)}, dla zbiornika o pojemności co najmniej ${h.num(h.P.pme.heatMinL)} litrów, montowanego razem z magazynem energii elektrycznej przy instalacji fotowoltaicznej. Nabór części 2 trwa do 1 października 2027 r.` },
      { q: 'Czy dotacja do pompy ciepła jest opodatkowana?', a: 'Nie. Dotacja z programu Czyste Powietrze jest zwolniona z podatku dochodowego. Nie można jednak odliczyć w uldze termomodernizacyjnej tej części wydatku, którą pokryła dotacja. Odliczeniu podlega wyłącznie kwota zapłacona z własnych pieniędzy, potwierdzona fakturą wystawioną na podatnika. Zachowaj więc umowę o dofinansowanie razem z fakturami.' },
      { q: 'Czy dotację do pompy ciepła można dostać bez wymiany grzejników?', a: `Tak. Instalacja centralnego ogrzewania i ciepłej wody ma w programie osobną kwotę, do ${h.zl(G(h).coInstall[2])}, i nie jest obowiązkowa. Pompa pracująca z grzejnikami o wysokiej temperaturze zasilania ma jednak niższy SCOP, więc zużywa więcej prądu. Warto zapytać audytora, czy obecne grzejniki wystarczą.` },
    ],
    body: (h) => {
      const g = G(h);
      const rows = ([['pcAirWaterPlus', 'Powietrze/woda, podwyższona klasa'], ['pcAirWater', 'Powietrze/woda'], ['pcGround', 'Gruntowa, sama pompa'], ['groundSource', 'Dolne źródło pompy gruntowej'], ['pcAirAir', 'Powietrze/powietrze']] as const).map(([k, n]) => [n, h.zl(g[k][0]), h.zl(g[k][1]), h.zl(g[k][2])]);
      const own2 = [25000, 35000, 45000].map((p) => [h.zl(p), h.zl(own(h, p, 0)), h.zl(own(h, p, 1)), h.zl(own(h, p, 2))]);
      return `
<h2>Kwoty dotacji do pompy ciepła</h2>
${h.table(['Typ pompy', 'Podstawowy', 'Podwyższony', 'Najwyższy'], rows, 'Czyste Powietrze, kwoty maksymalne po zmianach z 20 lipca 2026 r.', ['l', 'r', 'r', 'r'])}
<p>Pompa powietrze/woda o podwyższonej klasie efektywności to urządzenie spełniające wyższe wymagania niż minimum z listy ZUM; jej klasę potwierdza wpis na liście. Różnica w dotacji między nią a pompą standardową wynosi do ${h.zl(g.pcAirWaterPlus[2] - g.pcAirWater[2])}, więc warto o nią zapytać instalatora.</p>
<h2>Ile zapłacisz sam</h2>
<p>Dotacja to mniejsza z dwóch kwot: maksimum z tabeli albo procent ceny. Tabela pokazuje udział własny przy trzech przykładowych cenach pompy powietrze/woda podwyższonej klasy. Ceny są przykładowe, nie rynkowe.</p>
${h.table(['Cena pompy z montażem', 'Podstawowy', 'Podwyższony', 'Najwyższy'], own2, 'Udział własny po dotacji Czystego Powietrza, sama pompa, bez instalacji c.o. i ocieplenia.', ['l', 'r', 'r', 'r'])}
<p>Na poziomie podstawowym decyduje zwykle limit 40 % ceny, na najwyższym kwota z tabeli. Po ilu latach Twój udział zwróci się względem gazu albo węgla, pokazuje ${h.a('pompa-ciepla-cena', 'kalkulator ceny pompy ciepła')}.</p>
<h2>Warunki, które trzeba spełnić</h2>
<p>Po pierwsze własność: co najmniej 3 lata, z wyjątkami dla spadku, zasiedzenia i, od 20 lipca 2026 r., jednego roku przy co najmniej połowie udziałów kupionych lub otrzymanych od rodziców czy dziadków. Po drugie dochód w progach programu, które liczy ${h.a('czyste-powietrze-progi-dochodowe', 'kalkulator progów dochodowych')}. Po trzecie audyt energetyczny przed złożeniem wniosku. Po czwarte wymiana starego, nieefektywnego źródła ciepła, które trzeba trwale zlikwidować. Po piąte urządzenie z listy ZUM, zamontowane przez wykonawcę, z którym podpisujesz umowę.</p>
<p>W domu powyżej 140 kWh/m² rocznie sama pompa nie wystarczy: ocieplenie musi obniżyć zapotrzebowanie o co najmniej 40 %. To dobra zasada także bez dotacji, bo pompa w nieocieplonym domu pracuje przy wysokiej temperaturze zasilania i zużywa dużo prądu.</p>
<!--mini:scop-->
<h2>Ulga termomodernizacyjna zamiast albo obok dotacji</h2>
<p>Jeśli dochód przekracza progi programu, pompę ciepła z montażem można odliczyć od dochodu w uldze termomodernizacyjnej, do ${h.zl(h.P.ulgaTermoCap)} na podatnika, a małżonkowie będący współwłaścicielami mogą odliczyć tę kwotę każde osobno. Ulga obejmuje też ocieplenie, okna, drzwi, audyt, fotowoltaikę i magazyn energii. Przy dotacji odliczasz tylko udział własny.</p>
<h2>Jak złożyć wniosek o dotację do pompy ciepła</h2>
<p>Najpierw audyt energetyczny i wybór modelu z listy ZUM, potem wniosek. Na poziomie podstawowym składasz go sam przez generator wniosków o dofinansowanie wojewódzkiego funduszu albo z pomocą gminnego punktu konsultacyjnego. Na poziomie podwyższonym i najwyższym możesz skorzystać z prefinansowania, czyli części dotacji wypłaconej przed zakończeniem prac, ale tylko za pośrednictwem operatora programu, a nie przez samodzielny wniosek w generatorze. Dotację rozlicza się na podstawie faktur i protokołów odbioru prac, więc trzymaj wszystkie dokumenty od wykonawcy. Każda osoba może otrzymać jedno dofinansowanie w obecnej odsłonie programu, dlatego warto od razu zaplanować wszystkie prace w domu w jednym wniosku.</p>
<p>Pełną kwotę dotacji, razem z instalacją c.o., ociepleniem i audytem, liczy ${h.a('czyste-powietrze-kalkulator', 'kalkulator Czystego Powietrza')}, a koszt ogrzewania domu pompą po wymianie ${h.a('pompa-ciepla-koszt-ogrzewania', 'kalkulator kosztu ogrzewania')}.</p>`;
    },
  },
  en: {
    slug: 'heat-pump-grant-poland', nav: 'Heat pump grant', card: 'How much grant for each pump type in 2026.',
    title: 'Heat pump grant in Poland 2026: amounts, rules, tax relief',
    description: 'Heat pump grant in Poland in 2026: Czyste Powietrze amounts for each pump type and level, the rules, the ZUM list, the heat store top-up and the PIT relief.',
    h1: 'Heat pump grant in Poland in 2026',
    intro: 'See straight away how much grant your income brings. Below are the amounts for every type of pump and all the conditions.',
    resume: (h) => `In 2026 the main grant for a heat pump in an existing Polish single-family house comes from the Czyste Powietrze programme. The amount depends on the pump type and the grant level, and the level on income. For an air-to-water pump of higher energy efficiency class the programme gives up to ${h.zl(G(h).pcAirWaterPlus[0])} at the basic level, ${h.zl(G(h).pcAirWaterPlus[1])} at the raised level and ${h.zl(G(h).pcAirWaterPlus[2])} at the highest. A ground-source pump with its ground loop can receive as much as ${h.zl(G(h).pcGround[2] + G(h).groundSource[2])}, and an air-to-air pump up to ${h.zl(G(h).pcAirAir[2])}. The grant never exceeds 40, 70 or 100% of the actual price, though. The pump must be on the ZUM list, and a house above 140 kWh/m² a year must also be insulated. Those whose income is above the thresholds can deduct the pump under the thermal-modernisation relief, up to ${h.zl(h.P.ulgaTermoCap)} per taxpayer. The mini-calculator below shows the amount for your income.`,
    faqs: (h) => [
      { q: 'How large is the air-to-water heat pump grant in 2026?', a: `Under Czyste Powietrze, from ${h.zl(G(h).pcAirWaterPlus[0])} to ${h.zl(G(h).pcAirWaterPlus[2])} for an air-to-water pump of higher efficiency class, and from ${h.zl(G(h).pcAirWater[0])} to ${h.zl(G(h).pcAirWater[2])} for a standard-class one. The amount depends on the grant level and will not exceed 40, 70 or 100% of actual costs.` },
      { q: 'Can I get a heat pump grant for a new house?', a: 'Not from Czyste Powietrze: the programme funds replacing an inefficient heat source in an existing building owned for at least 3 years, with exceptions. In a new house the PIT thermal-modernisation relief remains, once the building is in use, as does the heat store top-up in the Przydomowe Magazyny Energii programme.' },
      { q: 'What is the ZUM list?', a: 'The list of green devices and materials kept by NFOŚiGW. It contains heat pumps, boilers and insulation materials that meet the Czyste Powietrze requirements, including efficiency class and test parameters. The grant applies only to a device on this list, so check the model in your quote before signing the contract.' },
      { q: 'Is there a heat pump top-up in the Przydomowe Magazyny Energii programme?', a: `Not for the pump itself, but for a heat store, yes: 30% of costs, at most ${h.zl(h.P.pme.heatCap)}, for a tank of at least ${h.num(h.P.pme.heatMinL)} litres installed together with an electricity storage battery next to a solar system. The part 2 call runs until 1 October 2027.` },
      { q: 'Is the heat pump grant taxed?', a: 'No. A Czyste Powietrze grant is exempt from income tax. However, the part of the spending covered by the grant cannot be deducted under the thermal-modernisation relief. Only the amount paid from your own money, confirmed by an invoice issued to the taxpayer, can be deducted.' },
      { q: 'Can I get a heat pump grant without replacing radiators?', a: `Yes. Heating and hot-water pipework has its own amount in the programme, up to ${h.zl(G(h).coInstall[2])}, and is optional. A pump working with radiators at a high flow temperature has a lower SCOP, though, so it uses more power. Ask the auditor whether your current radiators will do.` },
    ],
    body: (h) => {
      const g = G(h);
      const rows = ([['pcAirWaterPlus', 'Air-to-water, higher class'], ['pcAirWater', 'Air-to-water'], ['pcGround', 'Ground source, pump only'], ['groundSource', 'Ground loop for ground source'], ['pcAirAir', 'Air-to-air']] as const).map(([k, n]) => [n, h.zl(g[k][0]), h.zl(g[k][1]), h.zl(g[k][2])]);
      const own2 = [25000, 35000, 45000].map((p) => [h.zl(p), h.zl(own(h, p, 0)), h.zl(own(h, p, 1)), h.zl(own(h, p, 2))]);
      return `
<h2>Heat pump grant amounts</h2>
${h.table(['Pump type', 'Basic', 'Raised', 'Highest'], rows, 'Czyste Powietrze, maximum amounts after the changes of 20 July 2026.', ['l', 'r', 'r', 'r'])}
<p>An air-to-water pump of higher efficiency class is a unit meeting stricter requirements than the ZUM list minimum; its class is confirmed by its entry on the list. The grant difference between it and a standard pump is up to ${h.zl(g.pcAirWaterPlus[2] - g.pcAirWater[2])}, so it is worth asking the installer about it.</p>
<h2>What you pay yourself</h2>
<p>The grant is the lower of two amounts: the table maximum or the percentage of the price. The table shows your own share at three example prices for a higher-class air-to-water pump. The prices are examples, not market prices.</p>
${h.table(['Installed pump price', 'Basic', 'Raised', 'Highest'], own2, 'Own share after the Czyste Powietrze grant, pump only, excluding pipework and insulation.', ['l', 'r', 'r', 'r'])}
<p>At the basic level the 40% cap on the price usually decides; at the highest, the table amount. The ${h.a('pompa-ciepla-cena', 'heat pump price calculator')} shows how many years your share takes to pay back against gas or coal.</p>
<h2>Conditions you must meet</h2>
<p>First, ownership: at least 3 years, with exceptions for inheritance, prescription and, since 20 July 2026, one year with at least half the shares bought or received from parents or grandparents. Second, income within the programme thresholds, which the ${h.a('czyste-powietrze-progi-dochodowe', 'income threshold calculator')} works out. Third, an energy audit before applying. Fourth, replacing an old, inefficient heat source, which must be permanently removed. Fifth, a device on the ZUM list, installed by a contractor you sign a contract with.</p>
<p>In a house above 140 kWh/m² a year the pump alone is not enough: insulation must cut demand by at least 40%. That is a sound rule even without a grant, because a pump in an uninsulated house runs at a high flow temperature and uses a lot of power.</p>
<!--mini:scop-->
<h2>Thermal-modernisation relief instead of, or alongside, the grant</h2>
<p>If your income is above the programme thresholds, an installed heat pump can be deducted from income under the thermal-modernisation relief, up to ${h.zl(h.P.ulgaTermoCap)} per taxpayer, and spouses who co-own the house can each deduct that amount. The relief also covers insulation, windows, doors, the audit, solar panels and a home battery. With a grant, you deduct only your own share.</p>
<p>The ${h.a('czyste-powietrze-kalkulator', 'Czyste Powietrze calculator')} works out the full grant including pipework, insulation and audit, and the ${h.a('pompa-ciepla-koszt-ogrzewania', 'heating cost calculator')} what heating the house with a pump costs after the switch.</p>`;
    },
  },
});
