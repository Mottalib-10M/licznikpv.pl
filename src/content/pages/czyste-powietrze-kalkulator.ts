import { definePage, type Helpers } from '../../lib/page-types';
import type { HeatSource } from '../../lib/engine/grants';

const T = (h: Helpers, level: 'basic' | 'raised' | 'highest', source: HeatSource, euClass: 'low' | 'mid' | 'high' = 'high') => h.M.cpGrant({ level, euClass, source, coInstall: true, thermo: true }).total;

export default definePage({
  id: 'czyste-powietrze-kalkulator', group: 'dotacje', order: 20, tool: 'cp',
  related: ['czyste-powietrze-2026', 'czyste-powietrze-progi-dochodowe', 'pompa-ciepla-cena', 'dotacja-do-pompy-ciepla'],
  sources: ['cpNaCo', 'cpDlaKogo', 'cpDocs', 'minWage'],
  pl: {
    slug: 'czyste-powietrze-kalkulator', nav: 'Kalkulator Czystego Powietrza', card: 'Pełna kwota dotacji dla Twojego domu.',
    title: 'Czyste Powietrze kalkulator 2026: ile dotacji dostaniesz',
    description: 'Czyste Powietrze kalkulator 2026: poziom dofinansowania z dochodu i maksymalna dotacja na pompę ciepła, instalację c.o., ocieplenie i audyt dla Twojego domu.',
    h1: 'Kalkulator Czystego Powietrza: ile dotacji dostaniesz',
    intro: 'Wpisz skład gospodarstwa, dochód, stan domu i nowe źródło ciepła. Kalkulator poda poziom i pełną kwotę z dokumentów programu.',
    resume: (h) => `Kalkulator Czystego Powietrza najpierw ustala poziom dofinansowania z dochodu, a potem sumuje maksymalne kwoty na każdą pozycję, którą program finansuje w Twoim domu. Poziom podstawowy obejmuje do 40 % kosztów, podwyższony do 70 %, a najwyższy do 100 %, przy czym najwyższy przysługuje tylko domom o zapotrzebowaniu powyżej 140 kWh/m² rocznie. Do kwoty na źródło ciepła dochodzą audyt energetyczny, świadectwo charakterystyki energetycznej, instalacja centralnego ogrzewania i ciepłej wody oraz ocieplenie z oknami i drzwiami. Dla domu powyżej 140 kWh/m² z pompą ciepła powietrze/woda wyższej klasy suma wynosi do ${h.zl(T(h, 'basic', 'pcAirWaterPlus'))} na poziomie podstawowym, ${h.zl(T(h, 'raised', 'pcAirWaterPlus'))} na podwyższonym i ${h.zl(T(h, 'highest', 'pcAirWaterPlus'))} na najwyższym. Dotacja nie przekroczy też procentu faktycznych kosztów. Kwoty pochodzą z tabeli NFOŚiGW po zmianach z 20 lipca 2026 r.`,
    faqs: (h) => [
      { q: 'Dlaczego kalkulator obniżył mój poziom z najwyższego na podwyższony?', a: 'Bo poziom najwyższy przysługuje tylko domom, w których zapotrzebowanie na energię użytkową do ogrzewania przekracza 140 kWh/m² rocznie. Jeśli dochód pozwala na najwyższy poziom, a dom jest lepiej ocieplony, program przyznaje poziom podwyższony, do 70 % kosztów. Wskaźnik ustala audyt energetyczny przed złożeniem wniosku.' },
      { q: 'Czy dotacja wyniesie dokładnie tyle, ile pokazuje kalkulator?', a: 'Kalkulator pokazuje kwoty maksymalne. Faktyczna dotacja to mniejsza z dwóch wartości: kwota z tabeli albo procent faktycznych kosztów, czyli 40, 70 lub 100 %. Jeśli pompa kosztuje mniej niż pułap, dotacja będzie niższa. Ostateczną kwotę ustala wojewódzki fundusz w umowie, po weryfikacji wniosku i faktur.' },
      { q: 'Czy muszę ocieplić dom, żeby dostać dotację na pompę ciepła?', a: 'Tylko jeśli dom zużywa powyżej 140 kWh/m² rocznie: wtedy ocieplenie musi obniżyć ten wskaźnik o co najmniej 40 %. W domu o wskaźniku 80–140 kWh/m² ocieplenie jest dobrowolne, ale ma osobną kwotę dotacji. W domu poniżej 80 kWh/m² program finansuje głównie wymianę źródła ciepła.' },
    ],
    body: (h) => {
      const rows = ([['pcAirWaterPlus', 'Pompa powietrze/woda, wyższa klasa'], ['pcGround', 'Pompa gruntowa'], ['biomass', 'Kocioł na drewno lub pellet'], ['districtHeat', 'Sieć ciepłownicza']] as const).map(([k, n]) => [n, h.zl(T(h, 'basic', k, 'mid')), h.zl(T(h, 'raised', k, 'mid')), h.zl(T(h, 'highest', k, 'high'))]);
      return `
<h2>Łączna dotacja według źródła ciepła</h2>
${h.table(['Nowe źródło ciepła', 'Podstawowy, dom 80–140', 'Podwyższony, dom 80–140', 'Najwyższy, dom > 140'], rows, 'Suma maksymalnych kwot: źródło ciepła, instalacja c.o./c.w.u., ocieplenie, audyt, świadectwo. NFOŚiGW, po zmianach z 20 lipca 2026 r.', ['l', 'r', 'r', 'r'])}
<p>Najwięcej daje połączenie wymiany źródła z ociepleniem, bo kwota na termomodernizację jest w programie największa. Zasady programu, w tym wymóg 3 lat własności i wyjątki od niego, opisuje strona ${h.a('czyste-powietrze-2026', 'Czyste Powietrze 2026')}, a sam poziom dochodowy liczy ${h.a('czyste-powietrze-progi-dochodowe', 'kalkulator progów dochodowych')}. Czy pompa ciepła po dotacji zwróci się względem gazu, pokazuje ${h.a('pompa-ciepla-cena', 'cena pompy ciepła')}.</p>`;
    },
  },
  en: {
    slug: 'czyste-powietrze-calculator', nav: 'Czyste Powietrze calculator', card: 'The full grant amount for your house.',
    title: 'Czyste Powietrze calculator 2026: how much grant you get',
    description: 'Czyste Powietrze calculator for 2026: your grant level from income and the maximum grant for a heat pump, pipework, insulation and audit for your house.',
    h1: 'Czyste Powietrze calculator: how much grant you will get',
    intro: 'Enter your household, income, house condition and new heat source. The calculator gives the level and the full amount from the programme documents.',
    resume: (h) => `The Czyste Powietrze calculator first sets your grant level from income, then adds up the maximum amounts for each item the programme funds in your house. The basic level covers up to 40% of costs, the raised level up to 70% and the highest up to 100%, but the highest applies only to houses whose heating demand exceeds 140 kWh/m² a year. On top of the amount for the heat source come the energy audit, the energy performance certificate, central heating and hot-water pipework, and insulation with windows and doors. For a house above 140 kWh/m² with a higher-class air-to-water heat pump, the total is up to ${h.zl(T(h, 'basic', 'pcAirWaterPlus'))} at the basic level, ${h.zl(T(h, 'raised', 'pcAirWaterPlus'))} at the raised level and ${h.zl(T(h, 'highest', 'pcAirWaterPlus'))} at the highest. The grant also cannot exceed the percentage of actual costs. Amounts come from the NFOŚiGW table after the changes of 20 July 2026.`,
    faqs: (h) => [
      { q: 'Why did the calculator lower my level from highest to raised?', a: 'Because the highest level applies only to houses whose usable heating energy demand exceeds 140 kWh/m² a year. If your income allows the highest level but the house is better insulated, the programme grants the raised level, up to 70% of costs. The index is set by the energy audit before you apply.' },
      { q: 'Will the grant be exactly what the calculator shows?', a: 'The calculator shows maximum amounts. The actual grant is the lower of two values: the amount in the table or the percentage of actual costs, that is 40, 70 or 100%. If the pump costs less than the cap, the grant will be lower. The regional fund sets the final amount in the contract after checking the application and invoices.' },
      { q: 'Do I have to insulate the house to get a heat pump grant?', a: 'Only if the house uses more than 140 kWh/m² a year: insulation must then cut that index by at least 40%. In a house at 80–140 kWh/m² insulation is optional but has its own grant amount. In a house below 80 kWh/m² the programme mainly funds replacing the heat source.' },
    ],
    body: (h) => {
      const rows = ([['pcAirWaterPlus', 'Air-to-water pump, higher class'], ['pcGround', 'Ground-source pump'], ['biomass', 'Wood or pellet boiler'], ['districtHeat', 'District heating']] as const).map(([k, n]) => [n, h.zl(T(h, 'basic', k, 'mid')), h.zl(T(h, 'raised', k, 'mid')), h.zl(T(h, 'highest', k, 'high'))]);
      return `
<h2>Total grant by heat source</h2>
${h.table(['New heat source', 'Basic, house 80–140', 'Raised, house 80–140', 'Highest, house > 140'], rows, 'Sum of maximum amounts: heat source, heating and hot-water pipework, insulation, audit, certificate. NFOŚiGW, after the changes of 20 July 2026.', ['l', 'r', 'r', 'r'])}
<p>Combining a new heat source with insulation gives the most, because thermal modernisation carries the largest amount in the programme. The ${h.a('czyste-powietrze-2026', 'Czyste Powietrze 2026')} page covers the programme rules, including the 3-year ownership requirement and its exceptions, and the ${h.a('czyste-powietrze-progi-dochodowe', 'income threshold calculator')} works out the income level alone. Whether a heat pump pays back against gas after the grant is shown on the ${h.a('pompa-ciepla-cena', 'heat pump price')} page.</p>`;
    },
  },
});
