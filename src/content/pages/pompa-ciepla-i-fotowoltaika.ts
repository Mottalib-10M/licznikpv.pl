import { definePage, type Helpers } from '../../lib/page-types';

const pair = (h: Helpers, kwp: number, eu = 110) => {
  const heat = h.M.heatCosts({ area: 120, eu, scop: 3.5 });
  const extra = h.M.hpMonthly(heat.hp.kwh);
  const a = h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp, useKwh: 3500, extraLoad: extra });
  const b = h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp, useKwh: 3500 });
  return { heat, a, b, gain: a.savings - b.savings, winter: [0, 1, 10, 11].reduce((s, m) => s + a.months[m].prod, 0) };
};

export default definePage({
  id: 'pompa-ciepla-i-fotowoltaika', group: 'cieplo', order: 30, tool: 'pompaPv',
  related: ['pompa-ciepla-koszt-ogrzewania', 'fotowoltaika-10-kw', 'depozyt-prosumencki', 'pompa-ciepla-cena'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'eco813', 'ureTaryfy2026'],
  pl: {
    slug: 'pompa-ciepla-i-fotowoltaika', nav: 'Pompa ciepła i fotowoltaika', card: 'Ile prądu pompy pokryją panele.',
    title: 'Pompa ciepła i fotowoltaika: ile prądu pompy pokryje dach',
    description: 'Pompa ciepła i fotowoltaika w net-billingu: ile prądu pompy pokryją panele w Twojej gminie, ile przejdzie przez depozyt i jaką moc PV wybrać do pompy.',
    h1: 'Pompa ciepła i fotowoltaika: ile naprawdę pokryje dach',
    intro: 'Wpisz gminę, dom, pompę i moc paneli. Kalkulator doda prąd pompy do zużycia domu w sezonie grzewczym.',
    resume: (h) => {
      const p = pair(h, 8);
      return `Pompa ciepła i fotowoltaika pasują do siebie gorzej, niż obiecują reklamy, ale lepiej niż każda z osobna. Pompa zużywa najwięcej prądu od listopada do lutego, a panele produkują wtedy najmniej: instalacja 8 kWp w Warszawie daje w tych czterech miesiącach około ${h.num(p.winter)} z ${h.num(p.a.prod)} kWh rocznie. W net-billingu letnia nadwyżka nie wraca zimą jako energia, tylko jako depozyt, który pokrywa część „energia” rachunku. Dla domu 120 m² ze wskaźnikiem 110 kWh/m² pompa z SCOP 3,5 zużywa około ${h.num(p.heat.hp.kwh)} kWh prądu rocznie, co kosztuje ${h.zl(p.heat.hp.cost)}. Przy 8 kWp i zużyciu domu 3500 kWh fotowoltaika daje z pompą ${h.zl(p.a.savings)} oszczędności rocznie, a bez niej ${h.zl(p.b.savings)}. Różnica, ${h.zl(p.gain)}, to część rachunku pompy, którą pokrywa dach. Reszta pochodzi z depozytu, który bez pompy w dużej części by przepadł. Kalkulator powyżej liczy to dla Twojej gminy.`;
    },
    faqs: (h) => [
      { q: 'Jaka moc fotowoltaiki do pompy ciepła?', a: `Do typowego domu 120 m² z pompą wystarcza zwykle 8–10 kWp. W Warszawie przy zużyciu domu 3500 kWh i pompie z SCOP 3,5 fotowoltaika 8 kWp pokrywa około ${h.zl(pair(h, 8).gain)} z rachunku pompy, a 10 kWp około ${h.zl(pair(h, 10).gain)}. Większa moc dodaje głównie letnią nadwyżkę po cenie RCE.` },
      { q: 'Czy fotowoltaika pokryje całe ogrzewanie pompą ciepła?', a: `Nie w net-billingu. Zimą panele produkują kilka razy mniej niż latem, a nadwyżka z lata wraca tylko jako depozyt pokrywający część „energia” rachunku. Przy 8 kWp dom 120 m² płaci za prąd pompy po odliczeniu PV około ${h.zl(Math.max(0, pair(h, 8).heat.hp.cost - pair(h, 8).gain))} rocznie zamiast ${h.zl(pair(h, 8).heat.hp.cost)}.` },
      { q: 'Czy magazyn energii pomoże pompie ciepła zimą?', a: 'Niewiele. Magazyn przesuwa energię w obrębie doby, a zimą nadwyżki z paneli prawie nie ma, więc nie ma czego magazynować. Latem magazyn przydaje się do ciepłej wody i wieczornego zużycia. Pompie zimą pomaga raczej depozyt z lata i taryfa z tańszymi godzinami.' },
      { q: 'Czy pompę ciepła warto montować razem z fotowoltaiką?', a: 'Często tak, bo pompa daje zużycie, na które może pójść depozyt, który w domu bez pompy częściowo przepada. Program Czyste Powietrze nie finansuje jednak paneli, a nabór Mój Prąd 6.0 jest zamknięty, więc dotację dostaniesz tylko na pompę, ocieplenie i magazyn energii.' },
    ],
    body: (h) => {
      const rows = [4, 6, 8, 10, 12].map((k) => { const p = pair(h, k); return [`${k} kWp`, `${h.num(p.a.prod)} kWh`, h.zl(p.b.savings), h.zl(p.a.savings), h.zl(p.gain), h.zl(p.b.lost)]; });
      return `
<h2>Ile pokrywa dach przy różnej mocy</h2>
${h.table(['Moc PV', 'Produkcja', 'Oszczędność bez pompy', 'z pompą', 'PV pokrywa z rachunku pompy', 'Depozyt przepada bez pompy'], rows, 'Warszawa, dom 120 m², 110 kWh/m², pompa SCOP 3,5, prąd domu 3500 kWh, RCE, ceny G11 2026.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Ostatnia kolumna wyjaśnia, dlaczego pompa i panele się uzupełniają. Bez pompy duża instalacja wytwarza depozyt, na który dom nie ma wydatków, i część z niego przepada. Pompa daje zimowe zużycie, na które ten depozyt idzie. Dlatego oszczędność z pompą rośnie z mocą szybciej niż bez niej.</p>
<h2>Kiedy połączenie działa najlepiej</h2>
<p>Gdy dom jest ocieplony, a pompa pracuje na niskiej temperaturze zasilania: zużywa wtedy mniej prądu, a większa część tego prądu przypada na marzec, kwiecień i październik, gdy panele już produkują. Gdy pompa grzeje też ciepłą wodę latem, bo to zużycie wypada w godzinach produkcji. I gdy prosument rozlicza się po RCE, które ma wyższy limit zwrotu nadpłaty. Koszt samego ogrzewania pompą, bez paneli, pokazuje ${h.a('pompa-ciepla-koszt-ogrzewania', 'kalkulator kosztu ogrzewania')}, a działanie depozytu ${h.a('depozyt-prosumencki', 'depozyt prosumencki')}.</p>`;
    },
  },
  en: {
    slug: 'heat-pump-and-solar-poland', nav: 'Heat pump and solar', card: 'How much of the pump’s power the panels cover.',
    title: 'Heat pump and solar in Poland: how much the roof covers',
    description: 'Heat pump and solar under Polish net-billing: how much of the pump’s power your panels cover, what passes through the deposit and what system size to fit.',
    h1: 'Heat pump and solar: how much the roof really covers',
    intro: 'Enter your municipality, house, pump and solar size. The calculator adds the pump’s power to the house’s use over the heating season.',
    resume: (h) => {
      const p = pair(h, 8);
      return `A heat pump and solar panels fit together less well than adverts promise, but better than either alone. The pump uses most power from November to February, when the panels produce least: an 8 kWp system in Warsaw gives about ${h.num(p.winter)} of its ${h.num(p.a.prod)} kWh a year in those four months. Under net-billing, summer surplus does not come back in winter as energy but as a deposit that pays the energy part of the bill. For a 120 m² house at 110 kWh/m², a pump with SCOP 3.5 uses about ${h.num(p.heat.hp.kwh)} kWh of power a year, costing ${h.zl(p.heat.hp.cost)}. With 8 kWp and house use of 3,500 kWh, solar saves ${h.zl(p.a.savings)} a year with the pump and ${h.zl(p.b.savings)} without it. The difference, ${h.zl(p.gain)}, is the part of the pump’s bill the roof covers. Much of it comes from deposit that, without the pump, would partly be lost. The calculator above works this out for your municipality.`;
    },
    faqs: (h) => [
      { q: 'What solar size suits a heat pump?', a: `For a typical 120 m² house with a pump, 8–10 kWp is usually enough. In Warsaw with 3,500 kWh of house use and a SCOP 3.5 pump, an 8 kWp system covers about ${h.zl(pair(h, 8).gain)} of the pump’s bill and 10 kWp about ${h.zl(pair(h, 10).gain)}. A bigger system mainly adds summer surplus at the RCE price.` },
      { q: 'Will solar cover all my heat pump heating?', a: `Not under net-billing. In winter panels produce several times less than in summer, and summer surplus only returns as a deposit covering the energy part of the bill. With 8 kWp a 120 m² house pays about ${h.zl(Math.max(0, pair(h, 8).heat.hp.cost - pair(h, 8).gain))} a year for the pump’s power after solar, instead of ${h.zl(pair(h, 8).heat.hp.cost)}.` },
      { q: 'Will a home battery help the heat pump in winter?', a: 'Not much. A battery shifts energy within a day, and in winter there is hardly any solar surplus to store. In summer a battery is useful for hot water and evening use. What helps the pump in winter is the summer deposit and a tariff with cheaper hours.' },
      { q: 'Is it worth installing a heat pump together with solar?', a: 'Often yes, because the pump creates use on which the deposit can be spent, deposit that a house without a pump partly loses. Czyste Powietrze does not fund panels, however, and the Mój Prąd 6.0 call is closed, so grants are available only for the pump, insulation and a home battery.' },
    ],
    body: (h) => {
      const rows = [4, 6, 8, 10, 12].map((k) => { const p = pair(h, k); return [`${k} kWp`, `${h.num(p.a.prod)} kWh`, h.zl(p.b.savings), h.zl(p.a.savings), h.zl(p.gain), h.zl(p.b.lost)]; });
      return `
<h2>How much the roof covers at different sizes</h2>
${h.table(['Solar size', 'Output', 'Saving without pump', 'with pump', 'Solar covers of pump bill', 'Deposit lost without pump'], rows, 'Warsaw, 120 m² house, 110 kWh/m², SCOP 3.5 pump, house power 3,500 kWh, RCE, 2026 G11 prices.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The last column explains why the pump and the panels complement each other. Without a pump, a large system builds up a deposit the house has nothing to spend on, and part of it is lost. The pump creates winter use on which that deposit is spent. That is why the saving with a pump grows faster with size than without one.</p>
<h2>When the combination works best</h2>
<p>When the house is insulated and the pump runs at a low flow temperature: it then uses less power, and more of that power falls in March, April and October, when the panels are already producing. When the pump also heats hot water in summer, since that use falls in production hours. And when the prosumer is settled at RCE, which has a higher refund cap. The ${h.a('pompa-ciepla-koszt-ogrzewania', 'heating cost calculator')} shows the cost of pump heating alone, without panels, and the ${h.a('depozyt-prosumencki', 'prosumer deposit')} page how the deposit works.</p>`;
    },
  },
});
