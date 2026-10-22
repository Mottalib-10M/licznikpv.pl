import { definePage, type Helpers } from '../../lib/page-types';

const C = (h: Helpers) => h.P.cp;

export default definePage({
  id: 'czyste-powietrze-progi-dochodowe', group: 'dotacje', order: 30, tool: 'progi',
  related: ['czyste-powietrze-kalkulator', 'czyste-powietrze-2026', 'dotacja-do-pompy-ciepla'],
  sources: ['cpDlaKogo', 'cpDocs', 'minWage'],
  pl: {
    slug: 'czyste-powietrze-progi-dochodowe', nav: 'Progi dochodowe', card: 'Który poziom dofinansowania Ci przysługuje.',
    title: 'Czyste Powietrze progi dochodowe 2026: jaki masz poziom',
    description: 'Progi dochodowe Czystego Powietrza w 2026 r.: dochód roczny dla poziomu podstawowego, miesięczny na osobę dla wyższych, limity przychodu z firmy i zasiłki.',
    h1: 'Progi dochodowe Czystego Powietrza w 2026 roku',
    intro: 'Wpisz liczbę osób, dochód na osobę i swój dochód roczny. Kalkulator wskaże poziom dofinansowania i progi, które Cię dotyczą.',
    resume: (h) => `Czyste Powietrze ma trzy progi dochodowe, a każdy liczy się inaczej. Poziom podstawowy, do 40 % kosztów, przysługuje, gdy roczny dochód samego wnioskodawcy nie przekracza ${h.zl(C(h).basicAnnualIncome)}. Poziom podwyższony, do 70 %, wymaga przeciętnego miesięcznego dochodu na osobę do ${h.zl(C(h).raisedMonthly.multi)} w gospodarstwie wieloosobowym albo ${h.zl(C(h).raisedMonthly.single)} w jednoosobowym. Poziom najwyższy, do 100 %, wymaga dochodu do ${h.zl(C(h).highestMonthly.multi)} albo ${h.zl(C(h).highestMonthly.single)} na osobę, albo prawa do zasiłku stałego, okresowego, rodzinnego lub specjalnego zasiłku opiekuńczego. Na dwóch wyższych poziomach roczny przychód z działalności gospodarczej nie może przekroczyć ${h.zl(C(h).raisedBizWages * h.P.minWage2026)} (podwyższony) i ${h.zl(C(h).highestBizWages * h.P.minWage2026)} (najwyższy), czyli ${h.num(C(h).raisedBizWages)}- i ${h.num(C(h).highestBizWages)}-krotności minimalnego wynagrodzenia na 2026 r. Najwyższy poziom dotyczy tylko domów powyżej 140 kWh/m² rocznie. Kalkulator powyżej sprawdza wszystkie te warunki jednocześnie.`,
    faqs: (h) => [
      { q: 'Jak liczy się dochód na osobę w Czystym Powietrzu?', a: 'Dochód wszystkich członków gospodarstwa domowego dzieli się przez liczbę osób i przez liczbę miesięcy. Potwierdza go zaświadczenie z gminy lub ośrodka pomocy społecznej, wydawane według zasad z ustawy o świadczeniach rodzinnych. Małżonkowie bez orzeczonej separacji zawsze tworzą jedno gospodarstwo, nawet jeśli mieszkają osobno.' },
      { q: 'Czy przy dochodzie powyżej 135 000 zł można dostać dotację?', a: `Na poziomie podstawowym nie: próg ${h.zl(C(h).basicAnnualIncome)} dotyczy rocznego dochodu samego wnioskodawcy, a nie całego gospodarstwa. Przy wyższym dochodzie pozostaje ulga termomodernizacyjna w PIT, do ${h.zl(h.P.ulgaTermoCap)} na podatnika, obejmująca między innymi pompę ciepła, ocieplenie i okna w domu jednorodzinnym.` },
      { q: 'Czy zasiłek rodzinny daje prawo do najwyższego poziomu?', a: 'Tak. Prawo do zasiłku stałego, okresowego, rodzinnego albo specjalnego zasiłku opiekuńczego, potwierdzone w zaświadczeniu, daje poziom najwyższy bez względu na dochód na osobę. Nadal obowiązuje jednak limit przychodu z działalności gospodarczej i warunek, że dom zużywa powyżej 140 kWh/m² rocznie.' },
    ],
    body: (h) => {
      const c = C(h);
      const rows = [
        ['Podstawowy (do 40 %)', `dochód roczny wnioskodawcy do ${h.zl(c.basicAnnualIncome)}`, '–', 'każdy'],
        ['Podwyższony (do 70 %)', `${h.zl(c.raisedMonthly.multi)} / ${h.zl(c.raisedMonthly.single)} na osobę mies.`, h.zl(c.raisedBizWages * h.P.minWage2026), 'każdy'],
        ['Najwyższy (do 100 %)', `${h.zl(c.highestMonthly.multi)} / ${h.zl(c.highestMonthly.single)} na osobę mies. albo zasiłek`, h.zl(c.highestBizWages * h.P.minWage2026), 'powyżej 140 kWh/m²'],
      ];
      return `
<h2>Progi w jednej tabeli</h2>
${h.table(['Poziom', 'Próg dochodu (wieloosobowe / jednoosobowe)', 'Przychód z firmy do', 'Dom'], rows, `czystepowietrze.gov.pl, zasady po zmianach z 20 lipca 2026 r.; minimalne wynagrodzenie 2026: ${h.zl(h.P.minWage2026)}.`, ['l', 'l', 'r', 'l'])}
<p>Przychód z działalności gospodarczej obejmuje także najem i najem okazjonalny. Jedna osoba może skorzystać z programu tylko raz, w jednym budynku. Kwotę dotacji dla poziomu, który wskazał kalkulator, policzy ${h.a('czyste-powietrze-kalkulator', 'kalkulator Czystego Powietrza')}, a wszystkie zasady programu zebrane są na stronie ${h.a('czyste-powietrze-2026', 'Czyste Powietrze 2026')}.</p>`;
    },
  },
  en: {
    slug: 'czyste-powietrze-income-thresholds', nav: 'Income thresholds', card: 'Which grant level you qualify for.',
    title: 'Czyste Powietrze income thresholds 2026: which level fits',
    description: 'Czyste Powietrze income thresholds for 2026: yearly income for the basic level, monthly income per person for the higher levels, business caps and benefits.',
    h1: 'Czyste Powietrze income thresholds in 2026',
    intro: 'Enter the number of people, income per person and your yearly income. The calculator shows your grant level and the thresholds that apply to you.',
    resume: (h) => `Czyste Powietrze has three income thresholds, each measured differently. The basic level, up to 40% of costs, applies when the applicant’s own yearly income does not exceed ${h.zl(C(h).basicAnnualIncome)}. The raised level, up to 70%, requires average monthly income per person of up to ${h.zl(C(h).raisedMonthly.multi)} in a multi-person household or ${h.zl(C(h).raisedMonthly.single)} for a single person. The highest level, up to 100%, requires income of up to ${h.zl(C(h).highestMonthly.multi)} or ${h.zl(C(h).highestMonthly.single)} per person, or entitlement to a permanent, periodic, family or special carer’s benefit. At the two higher levels yearly business revenue may not exceed ${h.zl(C(h).raisedBizWages * h.P.minWage2026)} (raised) and ${h.zl(C(h).highestBizWages * h.P.minWage2026)} (highest), that is ${h.num(C(h).raisedBizWages)} and ${h.num(C(h).highestBizWages)} times the 2026 minimum wage. The highest level applies only to houses above 140 kWh/m² a year. The calculator above checks all these conditions at once.`,
    faqs: (h) => [
      { q: 'How is income per person calculated in Czyste Powietrze?', a: 'The income of all household members is divided by the number of people and the number of months. It is confirmed by a certificate from the municipality or social welfare centre, issued under the rules of the Family Benefits Act. Spouses without legal separation always form one household, even if they live apart.' },
      { q: 'Can I get a grant with income above PLN 135,000?', a: `Not at the basic level: the ${h.zl(C(h).basicAnnualIncome)} threshold applies to the applicant’s own yearly income, not the whole household’s. With higher income, the thermal-modernisation relief in PIT remains, up to ${h.zl(h.P.ulgaTermoCap)} per taxpayer, covering among other things a heat pump, insulation and windows in a single-family house.` },
      { q: 'Does family benefit give the right to the highest level?', a: 'Yes. Entitlement to a permanent, periodic, family or special carer’s benefit, confirmed in the certificate, gives the highest level regardless of income per person. The business revenue cap still applies, however, as does the condition that the house uses more than 140 kWh/m² a year.' },
    ],
    body: (h) => {
      const c = C(h);
      const rows = [
        ['Basic (up to 40%)', `applicant’s yearly income up to ${h.zl(c.basicAnnualIncome)}`, '–', 'any'],
        ['Raised (up to 70%)', `${h.zl(c.raisedMonthly.multi)} / ${h.zl(c.raisedMonthly.single)} per person a month`, h.zl(c.raisedBizWages * h.P.minWage2026), 'any'],
        ['Highest (up to 100%)', `${h.zl(c.highestMonthly.multi)} / ${h.zl(c.highestMonthly.single)} per person a month, or a benefit`, h.zl(c.highestBizWages * h.P.minWage2026), 'above 140 kWh/m²'],
      ];
      return `
<h2>The thresholds in one table</h2>
${h.table(['Level', 'Income threshold (multi / single person)', 'Business revenue up to', 'House'], rows, `czystepowietrze.gov.pl, rules after the changes of 20 July 2026; 2026 minimum wage: ${h.zl(h.P.minWage2026)}.`, ['l', 'l', 'r', 'l'])}
<p>Business revenue also includes letting and occasional letting. One person can use the programme only once, in one building. The ${h.a('czyste-powietrze-kalkulator', 'Czyste Powietrze calculator')} works out the grant amount for the level the calculator found, and all the programme rules are gathered on the ${h.a('czyste-powietrze-2026', 'Czyste Powietrze 2026')} page.</p>`;
    },
  },
});
