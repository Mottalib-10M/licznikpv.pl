import { definePage, type Helpers } from '../../lib/page-types';
import type { Aspect } from '../../lib/engine/pv';

const B = (h: Helpers, tilt: number, aspect: Aspect, kwp = 0.8, use = 2500) =>
  h.M.simulate({ yieldKwhKwp: h.M.MODEL.national.mean, voivIdx: 6, kwp, useKwh: use, tilt, aspect });
const MOUNTS: Array<[number, Aspect, string, string]> = [
  [90, '0', 'pionowo, na południe', 'vertical, south'],
  [90, '-45', 'pionowo, na południowy wschód', 'vertical, south-east'],
  [90, '-90', 'pionowo, na wschód', 'vertical, east'],
  [35, '0', 'stelaż 35°, na południe', '35° frame, south'],
];

export default definePage({
  id: 'fotowoltaika-balkonowa', group: 'pv', order: 75, tool: 'pv', toolArg: '0.8', mini: 'balkon',
  related: ['panele-fotowoltaiczne', 'ile-pradu-produkuje-fotowoltaika', 'net-billing', 'fotowoltaika-4-kw'],
  sources: ['prawoEnergetyczne', 'ozeAct', 'pvgis', 'pvgisTool', 'ureTaryfy2026'],
  pl: {
    slug: 'fotowoltaika-balkonowa', nav: 'Fotowoltaika balkonowa', card: 'Ile prądu dadzą panele na balustradzie i co trzeba zgłosić.',
    title: 'Fotowoltaika balkonowa: ile prądu da panel na balkonie',
    description: 'Fotowoltaika balkonowa w 2026 r.: ile prądu dadzą panele na balustradzie według PVGIS, ile zaoszczędzisz w mieszkaniu i dlaczego trzeba ją zgłosić operatorowi.',
    h1: 'Fotowoltaika na balkonie: ile prądu da i co trzeba zgłosić',
    intro: 'Dwa panele na balustradzie to mała instalacja, ale wciąż mikroinstalacja w rozumieniu prawa. Policz, ile da na Twoim balkonie.',
    resume: (h) => {
      const v = B(h, 90, '0'), t = B(h, 35, '0');
      return `Fotowoltaika balkonowa to zwykle dwa panele o łącznej mocy około 0,8 kWp, przymocowane pionowo do balustrady albo na stelażu, z mikrofalownikiem podłączonym do instalacji mieszkania. Według PVGIS dwa panele po 400 W zawieszone pionowo na balkonie od południa dadzą średnio w Polsce około ${h.num(v.prod)} kWh rocznie, a te same panele na stelażu pod kątem 35° około ${h.num(t.prod)} kWh. Panel pionowy traci latem, ale zimą, przy nisko stojącym słońcu, daje więcej niż ustawiony pod kątem. W mieszkaniu zużywającym 2500 kWh rocznie większość tej produkcji zużyjesz od razu na lodówkę, router i urządzenia w trybie czuwania, co przy cenach G11 na 2026 r. daje około ${h.zl(v.savings)} oszczędności rocznie. Prawo energetyczne nie przewiduje dla instalacji balkonowych osobnej procedury: każdą mikroinstalację przyłączoną do sieci zgłasza się operatorowi systemu dystrybucyjnego, który ma 30 dni na przyłączenie i na swój koszt montuje licznik dwukierunkowy.`;
    },
    faqs: (h) => [
      { q: 'Czy fotowoltaikę balkonową trzeba zgłosić do operatora sieci?', a: 'Tak, jeśli falownik oddaje energię do instalacji mieszkania połączonej z siecią. Prawo energetyczne (art. 7 ust. 8d4) przewiduje dla każdej mikroinstalacji zgłoszenie u operatora systemu dystrybucyjnego, bez progu mocy dla małych instalacji. Operator potwierdza zgłoszenie, przyłącza instalację w 30 dni i na własny koszt montuje licznik dwukierunkowy.' },
      { q: 'Ile prądu da panel zawieszony pionowo na balustradzie?', a: `Panel 400 W zawieszony pionowo na balkonie od południa da w Polsce około ${h.num(B(h, 90, '0', 0.4).prod)} kWh rocznie, a od wschodu albo zachodu około ${h.num(B(h, 90, '-90', 0.4).prod)} kWh. Pionowy montaż daje mniej niż dach skośny, ale rozkłada produkcję równiej na cały rok. Cień sąsiednich balkonów i drzew obniża wynik bardziej niż sam kąt.` },
      { q: 'Czy w mieszkaniu w bloku mogę zamontować panele na balkonie?', a: 'Jeśli balustrada albo elewacja należą do części wspólnych budynku, przed montażem zapytaj wspólnotę lub spółdzielnię o zgodę i warunki mocowania. W zgłoszeniu do operatora składasz oświadczenie o tytule prawnym do nieruchomości i do mikroinstalacji. Instalację w lokalu wpisaną w umowę na prąd zgłasza osoba, która ma tę umowę.' },
      { q: 'Czy energia z balkonu oddana do sieci trafia do depozytu?', a: `Po zgłoszeniu i założeniu licznika dwukierunkowego tak: stajesz się prosumentem w net-billingu, a energia oddana jest wyceniana po cenie rynkowej i zapisywana w depozycie prosumenckim. Przy dwóch panelach i zużyciu 2500 kWh do sieci trafi około ${h.num(B(h, 90, '0').exp)} kWh rocznie, więc depozyt jest niewielki, a oszczędność pochodzi głównie z autokonsumpcji.` },
    ],
    body: (h) => {
      const rows = MOUNTS.map(([t, a, pl]) => { const r = B(h, t, a); return [pl, `${h.num(r.prod)} kWh`, `${h.num(r.months[11].prod, 1)} kWh`, h.pct(r.selfShare), h.zl(r.savings)]; });
      return `
<h2>Ile da 0,8 kWp na balkonie: cztery sposoby montażu</h2>
<p>Tabela porównuje dwa panele po 400 W w mieszkaniu zużywającym 2500 kWh rocznie. Produkcja to średni uzysk gmin z PVGIS 5.3 przeliczony współczynnikami dla danego kąta i strony świata, policzonymi w PVGIS dla Warszawy. Oszczędność obejmuje autokonsumpcję po cenie G11 na 2026 r. i depozyt z energii oddanej po RCE.</p>
${h.table(['Montaż', 'Rocznie', 'W grudniu', 'Zużyte od razu', 'Oszczędność rocznie'], rows, 'PVGIS 5.3 (SARAH3), straty 14 %, bez cienia; profil zużycia równy przez dobę.', ['l', 'r', 'r', 'r', 'r'])}
<p>Stelaż daje więcej w ciągu roku, ale panel pionowy więcej w grudniu. Przy dwóch panelach prawie cała produkcja zostaje w mieszkaniu, więc oszczędność rośnie razem z produkcją, a do sieci trafia niewiele. Każdy rodzaj montażu wymaga solidnego mocowania do balustrady, obliczonego na parcie wiatru.</p>
<!--mini:balkon-->
<h2>Zgłoszenie mikroinstalacji krok po kroku</h2>
<p>Instalacja balkonowa podłączona do gniazdka albo do obwodu mieszkania jest mikroinstalacją, jeśli oddaje energię do sieci przez instalację lokalu. Zgłoszenie, o którym mówi art. 7 ust. 8d4 Prawa energetycznego, składasz u operatora systemu dystrybucyjnego w Twoim regionie. Zawiera ono Twoje dane, rodzaj i moc instalacji, informacje o spełnieniu wymagań technicznych i lokalizację, a do tego oświadczenie o tytule prawnym do nieruchomości. Operator potwierdza datę zgłoszenia i ma 30 dni na przyłączenie, a koszt licznika i zabezpieczeń ponosi on sam.</p>
<p>Po przyłączeniu rozliczasz się jak każdy prosument: energię zużytą od razu masz za darmo, a nadwyżka trafia do depozytu w ${h.a('net-billing', 'net-billingu')}. Moc wpisaną do zgłoszenia możesz sprawdzić w kalkulatorze u góry strony, a dokładną produkcję dla swojego balkonu, z kątem 90° i cieniem, policzysz w narzędziu PVGIS podanym w źródłach.</p>`;
    },
  },
  en: {
    slug: 'balcony-solar-poland', nav: 'Balcony solar', card: 'What panels on a balcony rail give and what must be notified.',
    title: 'Balcony solar in Poland: output and the grid notification',
    description: 'Balcony solar in Poland in 2026: what panels on a balcony rail give according to PVGIS, what a flat saves, and why the system is notified to the grid operator.',
    h1: 'Balcony solar: how much power it gives and what to notify',
    intro: 'Two panels on a balcony rail are a small system, but still a micro-installation in law. Work out what yours would give.',
    resume: (h) => {
      const v = B(h, 90, '0'), t = B(h, 35, '0');
      return `Balcony solar usually means two panels of about 0.8 kWp in total, fixed vertically to the balcony rail or on a frame, with a micro-inverter connected to the flat’s wiring. According to PVGIS, two 400 W panels hung vertically on a south-facing balcony give about ${h.num(v.prod)} kWh a year on average in Poland, and the same panels on a 35° frame about ${h.num(t.prod)} kWh. A vertical panel loses out in summer, but in winter, with the sun low, it gives more than a tilted one. In a flat using 2,500 kWh a year you use most of this output straight away on the fridge, router and devices on standby, which at 2026 G11 prices saves about ${h.zl(v.savings)} a year. Polish Energy Law has no separate procedure for balcony systems: every micro-installation connected to the grid is notified to the distribution system operator, which has 30 days to connect it and fits a two-way meter at its own cost.`;
    },
    faqs: (h) => [
      { q: 'Does balcony solar have to be notified to the grid operator?', a: 'Yes, if the inverter feeds power into the flat’s wiring, which is connected to the grid. Polish Energy Law (Art. 7(8d4)) requires every micro-installation to be notified to the distribution system operator, with no power threshold for small systems. The operator confirms the notification, connects the system within 30 days and fits a two-way meter at its own cost.' },
      { q: 'How much power does a panel hung vertically on a balcony rail give?', a: `A 400 W panel hung vertically on a south-facing balcony gives about ${h.num(B(h, 90, '0', 0.4).prod)} kWh a year in Poland, and facing east or west about ${h.num(B(h, 90, '-90', 0.4).prod)} kWh. Vertical mounting gives less than a pitched roof, but spreads output more evenly across the year. Shade from neighbouring balconies and trees lowers the result more than the angle itself.` },
      { q: 'Can I fit panels on the balcony of a flat in a block?', a: 'If the balcony rail or the façade belong to the building’s common parts, ask the owners’ association or housing cooperative for consent and fixing conditions before fitting. In the notification to the operator you declare your legal title to the property and the micro-installation. A system in a flat is notified by the person who holds the electricity contract.' },
      { q: 'Does balcony power exported to the grid go into the deposit?', a: `Once notified and fitted with a two-way meter, yes: you become a net-billing prosumer, and exported energy is valued at the market price and credited to the prosumer deposit. With two panels and 2,500 kWh of use, about ${h.num(B(h, 90, '0').exp)} kWh a year goes to the grid, so the deposit is small and the saving comes mainly from self-consumption.` },
    ],
    body: (h) => {
      const rows = MOUNTS.map(([t, a, , en]) => { const r = B(h, t, a); return [en, `${h.num(r.prod)} kWh`, `${h.num(r.months[11].prod, 1)} kWh`, h.pct(r.selfShare), h.zl(r.savings)]; });
      return `
<h2>What 0.8 kWp gives on a balcony: four ways to mount it</h2>
<p>The table compares two 400 W panels in a flat using 2,500 kWh a year. Output is the average municipal PVGIS 5.3 yield adjusted by factors for each angle and direction, computed in PVGIS for Warsaw. The saving covers self-consumption at the 2026 G11 price and the deposit from energy exported at RCE.</p>
${h.table(['Mounting', 'Per year', 'In December', 'Used at once', 'Yearly saving'], rows, 'PVGIS 5.3 (SARAH3), 14% losses, no shade; use spread evenly over the day.', ['l', 'r', 'r', 'r', 'r'])}
<p>A frame gives more over the year, but a vertical panel gives more in December. With two panels almost all the output stays in the flat, so the saving grows with output and little goes to the grid. Every type of mounting needs a firm fixing to the rail, designed for wind load.</p>
<!--mini:balkon-->
<h2>Notifying a micro-installation step by step</h2>
<p>A balcony system plugged into a socket or wired into the flat’s circuit is a micro-installation if it feeds power to the grid through the flat’s wiring. The notification under Art. 7(8d4) of the Energy Law is filed with the distribution system operator in your region. It contains your details, the type and power of the system, information on meeting the technical requirements and the location, plus a declaration of legal title to the property. The operator confirms the date of notification and has 30 days to connect, and bears the cost of the meter and protection itself.</p>
<p>Once connected you are settled like any prosumer: energy used at once is free, and the surplus goes into the deposit under ${h.a('net-billing', 'net-billing')}. You can check the power entered in the notification in the calculator at the top of the page, and the exact output for your balcony, with a 90° angle and shade, in the PVGIS tool listed in the sources.</p>`;
    },
  },
});
