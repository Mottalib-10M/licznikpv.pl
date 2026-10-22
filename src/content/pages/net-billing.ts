import { definePage, type Helpers } from '../../lib/page-types';
import { monthShort } from '../../lib/helpers';

const W = (h: Helpers, regime: 'rce' | 'rcem' = 'rce') => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, regime });

export default definePage({
  id: 'net-billing', group: 'rozliczenie', order: 10, mini: 'depozyt',
  related: ['depozyt-prosumencki', 'rce-cena', 'fotowoltaika-z-magazynem-energii', 'czy-fotowoltaika-sie-oplaca'],
  sources: ['ozeAct', 'netBillingGov', 'rcem', 'rceApi', 'ureTaryfy2026'],
  pl: {
    slug: 'net-billing', nav: 'Net-billing', card: 'Jak rozlicza się prosument od kwietnia 2022 r.',
    title: 'Net-billing 2026: jak działa depozyt, RCE, RCEm i zwrot',
    description: 'Net-billing w 2026 r.: jak wycenia się energię oddaną do sieci, co pokrywa depozyt prosumencki, RCE czy RCEm, ile wraca na konto i co przepada po roku.',
    h1: 'Net-billing a net-metering: różnice i rozliczenie w 2026',
    intro: 'Każdy, kto przyłączył panele od 1 kwietnia 2022 r., rozlicza się w net-billingu. Oto, jak liczy się każda złotówka.',
    resume: (h) => {
      const r = W(h);
      return `Net-billing to system rozliczania prosumentów, który zastąpił 1 kwietnia 2022 r. dawne opusty, czyli net-metering. Energia oddana do sieci nie jest już odbierana w kilowatogodzinach, tylko sprzedawana: w każdej godzinie operator mierzy, ile oddałeś i ile pobrałeś, a nadwyżkę wycenia po cenie rynkowej z PSE. Kto zaczął oddawać energię od 1 lipca 2024 r., ma cenę godzinową RCE, starsi prosumenci cenę miesięczną RCEm. Wartość tej energii, pomnożona przez 1,23, trafia na konto prosumenta jako depozyt ważny 12 miesięcy. Depozyt pokrywa wyłącznie część „energia” przyszłych rachunków, nigdy dystrybucję ani opłaty stałe. To, czego nie wykorzystasz, wraca na konto do 30 % (RCE) albo 20 % (RCEm) wartości oddanej energii, a reszta przepada. Dla 6 kWp w Warszawie przy zużyciu 4000 kWh depozyt wynosi około ${h.zl(r.depositValue)} rocznie. Rozliczenie trwa 15 lat od przyłączenia mikroinstalacji.`;
    },
    faqs: (h) => [
      { q: 'Czym różni się net-billing od net-meteringu?', a: 'W net-meteringu za każdą kilowatogodzinę oddaną do sieci można było odebrać 0,8 kWh (instalacje do 10 kW) albo 0,7 kWh (10–50 kW) bez opłat. W net-billingu energia oddana jest sprzedawana po cenie rynkowej, a pobrana kupowana po cenie z taryfy. Instalacje przyłączone do 31 marca 2022 r. zostają w net-meteringu przez 15 lat.' },
      { q: 'Czy w net-billingu opłaca się mieć dużą instalację?', a: `Mniej niż w net-meteringu. Nadwyżka jest warta średnio około ${h.num(h.M.exportPrices('rce').reduce((a, b) => a + b, 0) / 12000, 2)} zł za kWh przed współczynnikiem 1,23, a zakup energii z sieci kosztuje około ${h.zl(W(h).priceGross, 2)} za kWh. Każdy kilowat ponad potrzeby domu dokłada więc mniej niż poprzedni. Moc warto dobrać do zużycia i pory poboru.` },
      { q: 'Czy mogę przejść z RCEm na RCE?', a: 'Tak. Prosument rozliczany po RCEm może złożyć sprzedawcy oświadczenie o przejściu na rozliczenie godzinowe po RCE. Zmiana obowiązuje od pierwszego dnia kolejnego miesiąca i jest jednorazowa, nie można wrócić do RCEm. Opłaca się zwykle tym, którzy zużywają dużo prądu w dzień albo mają magazyn energii.' },
      { q: 'Co się dzieje z depozytem po 12 miesiącach?', a: 'Depozyt z każdego miesiąca można wykorzystać przez 12 kolejnych miesięcy. Jeśli zostanie niewykorzystany, sprzedawca zwraca nadpłatę na konto bankowe, ale tylko do 20 % (RCEm) albo 30 % (RCE) wartości energii oddanej w tamtym miesiącu. Pozostała kwota przepada. Dlatego instalacja dużo większa od zużycia traci część wartości.' },
      { q: 'Czy depozyt prosumencki pokrywa opłatę mocową i dystrybucję?', a: 'Nie. Ustawa o odnawialnych źródłach energii przeznacza depozyt wyłącznie na zakup energii elektrycznej, czyli na pozycję „energia” w rachunku. Dystrybucję zmienną i stałą, opłatę mocową, jakościową, OZE, kogeneracyjną i abonament płaci się zawsze, nawet przy dużej nadwyżce na koncie prosumenta.' },
      { q: 'Jak długo trwa rozliczenie w net-billingu?', a: 'Piętnaście lat od dnia wprowadzenia energii do sieci po raz pierwszy. Zmiana sprzedawcy, sprzedaż domu czy przejście z RCEm na RCE nie przedłużają tego okresu. Po 15 latach energię oddaną do sieci trzeba będzie sprzedawać na zasadach rynkowych, a dziś nie wiadomo, jakie to będą warunki.' },
    ],
    body: (h) => {
      const r = W(h), m = W(h, 'rcem');
      const rows = r.months.map((x, i) => [monthShort(i, 'pl'), `${h.num(x.prod)} kWh`, `${h.num(x.exp)} kWh`, `${h.num(x.imp)} kWh`, h.zl(x.deposit)]);
      return `
<h2>Net-billing a net-metering: różnice w jednej tabeli</h2>
${h.table(['', 'Net-metering (opusty)', 'Net-billing'], [['Kogo dotyczy', 'mikroinstalacje przyłączone do 31.03.2022', 'mikroinstalacje przyłączone od 1.04.2022'], ['Co dzieje się z nadwyżką', 'odbierasz 0,8 kWh (do 10 kW) albo 0,7 kWh (10–50 kW) za każdą oddaną', 'jest sprzedawana po RCE albo RCEm'], ['Co pokrywa nadwyżka', 'energię i dystrybucję odebranej ilości', 'tylko część „energia” rachunku, z depozytu ×1,23'], ['Niewykorzystana nadwyżka', 'przepada po 12 miesiącach', 'wraca na konto do 20 % (RCEm) albo 30 % (RCE) wartości'], ['Czas trwania', '15 lat od przyłączenia', '15 lat od pierwszego oddania energii']], 'Ustawa o odnawialnych źródłach energii, Dz.U. 2026 poz. 68.', ['l', 'l', 'l'])}
<p>Najważniejsza różnica dotyczy wartości kilowatogodziny oddanej do sieci. W net-meteringu wracała prawie cała, razem z dystrybucją, więc instalację opłacało się dobierać na całe roczne zużycie. W net-billingu nadwyżka jest warta tyle, ile płaci rynek w godzinie oddania, a dystrybucję za energię pobraną płaci się zawsze. Dlatego dziś liczy się autokonsumpcja, a nie sama produkcja.</p>
<h2>Trzy przepływy energii w net-billingu</h2>
<p>Pierwszy to autokonsumpcja: energia z paneli zużyta w tej samej godzinie, w której powstała. Nie przechodzi przez licznik operatora, więc nie płacisz za nią nic, ani za energię, ani za dystrybucję. To najcenniejsza część produkcji, warta około ${h.zl(r.priceGross, 2)} za kWh w taryfie G11 na 2026 r.</p>
<p>Drugi to oddanie do sieci. Ustawa każe bilansować pobór i oddanie w każdej godzinie osobno: jeśli o 13:00 oddałeś 3 kWh, a pobrałeś 0,5 kWh, rozliczana jest nadwyżka 2,5 kWh. Jej wartość to ilość energii razy cena z PSE, a na konto prosumenta trafia ta wartość pomnożona przez 1,23. Współczynnik 1,23 obowiązuje od 1 lipca 2024 r.</p>
<p>Trzeci to pobór z sieci wieczorem, w nocy i zimą. Za energię pobraną płacisz normalną cenę z taryfy, ale część „energia” rachunku sprzedawca pokrywa z depozytu, aż do jego wyczerpania. Dystrybucję płacisz zawsze od całej energii pobranej z sieci.</p>
<h2>Rok w net-billingu: 6 kWp w Warszawie</h2>
<p>Tabela pokazuje, jak rozkłada się rok dla domu zużywającego 4000 kWh, z poborem równo przez dobę i rozliczeniem po RCE. Latem depozyt rośnie, zimą się zużywa.</p>
${h.table(['Miesiąc', 'Produkcja', 'Oddane', 'Pobrane', 'Depozyt'], rows, 'PVGIS dla Warszawy, ceny RCEm z ostatnich 12 miesięcy z premią RCE za ujemne godziny liczone jako zero, ×1,23.', ['l', 'r', 'r', 'r', 'r'])}
<p>W sumie dom oddaje ${h.num(r.exp)} kWh, co daje depozyt ${h.zl(r.depositValue)}. Na energię pobraną wydaje z niego ${h.zl(r.depositUsed)}, a ${h.zl(r.refund)} wraca jako zwrot nadpłaty${r.lost > 1 ? `, a ${h.zl(r.lost)} przepada` : ''}. W rozliczeniu po RCEm ten sam dom oszczędza ${h.zl(m.savings)} zamiast ${h.zl(r.savings)} rocznie.</p>
<h2>Zwrot nadpłaty: ile wraca na konto</h2>
<p>Depozyt niewykorzystany przez 12 miesięcy nie przepada w całości. Sprzedawca zwraca go na rachunek bankowy, ale z limitem: 20 % wartości energii oddanej w danym miesiącu przy RCEm i 30 % przy RCE. Limit liczy się od wartości bez współczynnika 1,23. Mini-kalkulator poniżej pokazuje, ile wróci przy danym depozycie.</p>
<!--mini:nadplata-->
<h2>RCE czy RCEm: która cena się bardziej opłaca</h2>
<p>RCEm to średnia cena ważona energią oddaną przez wszystkich prosumentów w danym miesiącu. Ponieważ większość prosumentów oddaje energię w południe, RCEm jest niższa od średniej ceny hurtowej. RCE to cena z każdej godziny, a gdy na rynku cena spada poniżej zera, do rozliczenia przyjmuje się zero. Szczegóły i historię obu cen pokazuje strona ${h.a('rce-cena', 'RCE i RCEm')}.</p>
<p>Rozliczenie po RCE daje więcej, gdy oddajesz energię poza szczytem produkcji: rano, późnym popołudniem albo z magazynu. Daje też wyższy limit zwrotu nadpłaty. Przy typowym domu bez magazynu różnica jest niewielka, ale rzadko na niekorzyść RCE.</p>
<h2>Jak zwiększyć zysk z net-billingu</h2>
<p>Najprościej przesunąć zużycie na godziny produkcji: pralkę, zmywarkę, podgrzewanie wody i ładowanie samochodu w południe. Każda kilowatogodzina zużyta od razu jest warta kilka razy więcej niż oddana. Drugi sposób to ${h.a('fotowoltaika-z-magazynem-energii', 'magazyn energii')}, z dotacją z programu Przydomowe Magazyny Energii. Trzeci to unikanie przewymiarowania: większa instalacja zwiększa przede wszystkim depozyt, który może przepaść. Ile depozytu zużyjesz w swoim domu, liczy ${h.a('depozyt-prosumencki', 'kalkulator depozytu prosumenckiego')}.</p>`;
    },
  },
  en: {
    slug: 'net-billing-poland', nav: 'Net-billing', card: 'How Polish prosumers have been settled since April 2022.',
    title: 'Net-billing in Poland 2026: deposit, RCE, RCEm and refunds',
    description: 'Net-billing in Poland in 2026: how exported energy is valued, what the prosumer deposit pays for, RCE or RCEm, what comes back as cash and what is lost.',
    h1: 'Net-billing vs net-metering: differences and settlement in 2026',
    intro: 'Everyone who connected panels from 1 April 2022 is settled under net-billing. Here is how every zloty is counted.',
    resume: (h) => {
      const r = W(h);
      return `Net-billing is the system for settling prosumers that replaced the old offset scheme, net-metering, on 1 April 2022. Energy exported to the grid is no longer taken back in kilowatt-hours but sold: every hour the grid operator measures how much you exported and imported, and values the surplus at the PSE market price. Those who started exporting from 1 July 2024 get the hourly RCE price, earlier prosumers the monthly RCEm price. The value of that energy, multiplied by 1.23, goes into the prosumer account as a deposit valid for 12 months. The deposit only pays the energy part of later bills, never distribution or fixed charges. What you do not use comes back as cash up to 30% (RCE) or 20% (RCEm) of the value of exported energy, and the rest is lost. For 6 kWp in Warsaw with 4,000 kWh of use, the deposit is about ${h.zl(r.depositValue)} a year. Settlement lasts 15 years from the micro-installation’s connection.`;
    },
    faqs: (h) => [
      { q: 'How does net-billing differ from net-metering?', a: 'Under net-metering, every kilowatt-hour exported could be taken back as 0.8 kWh (systems up to 10 kW) or 0.7 kWh (10–50 kW) free of charges. Under net-billing, exported energy is sold at the market price and imported energy bought at the tariff price. Systems connected by 31 March 2022 stay on net-metering for 15 years.' },
      { q: 'Does a large system pay under net-billing?', a: `Less than under net-metering. Surplus is worth about PLN ${h.num(h.M.exportPrices('rce').reduce((a, b) => a + b, 0) / 12000, 2)} per kWh on average before the 1.23 factor, while buying energy from the grid costs about ${h.zl(W(h).priceGross, 2)} per kWh. Every kilowatt beyond the house’s needs therefore adds less than the one before. Match size to consumption and time of use.` },
      { q: 'Can I switch from RCEm to RCE?', a: 'Yes. A prosumer settled at RCEm can file a statement with the seller to switch to hourly settlement at RCE. The change applies from the first day of the next month and is one-off: there is no way back to RCEm. It usually pays for households that use a lot of power in the daytime or have a home battery.' },
      { q: 'What happens to the deposit after 12 months?', a: 'Each month’s deposit can be used over the following 12 months. If it remains unused, the seller refunds the overpayment to your bank account, but only up to 20% (RCEm) or 30% (RCE) of the value of energy exported in that month. The rest is lost. That is why a system much larger than your use loses part of its value.' },
      { q: 'Does the prosumer deposit pay the capacity charge and distribution?', a: 'No. The Renewable Energy Act reserves the deposit for buying electricity only, that is the energy line on the bill. Variable and fixed distribution, the capacity, quality, renewables and cogeneration charges and the subscription fee are always paid, even with a large surplus in the prosumer account.' },
      { q: 'How long does net-billing settlement last?', a: 'Fifteen years from the day energy is first fed into the grid. Changing seller, selling the house or switching from RCEm to RCE does not extend that period. After 15 years exported energy will have to be sold on market terms, and it is not known today what those terms will be.' },
    ],
    body: (h) => {
      const r = W(h), m = W(h, 'rcem');
      const rows = r.months.map((x, i) => [monthShort(i, 'en'), `${h.num(x.prod)} kWh`, `${h.num(x.exp)} kWh`, `${h.num(x.imp)} kWh`, h.zl(x.deposit)]);
      return `
<h2>Net-billing vs net-metering: the differences in one table</h2>
${h.table(['', 'Net-metering (offsets)', 'Net-billing'], [['Who it covers', 'micro-installations connected by 31 Mar 2022', 'micro-installations connected from 1 Apr 2022'], ['What happens to the surplus', 'you take back 0.8 kWh (up to 10 kW) or 0.7 kWh (10–50 kW) for each one exported', 'it is sold at RCE or RCEm'], ['What the surplus pays for', 'energy and distribution of the amount taken back', 'only the energy part of the bill, from the deposit ×1.23'], ['Unused surplus', 'lost after 12 months', 'refunded up to 20% (RCEm) or 30% (RCE) of its value'], ['Duration', '15 years from connection', '15 years from the first export']], 'Polish Renewable Energy Sources Act, Dz.U. 2026 item 68.', ['l', 'l', 'l'])}
<p>The key difference is the value of a kilowatt-hour exported to the grid. Under net-metering almost all of it came back, distribution included, so it paid to size the system to cover the whole year’s use. Under net-billing the surplus is worth what the market pays in the hour of export, and distribution on imported energy is always charged. That is why self-consumption now matters more than raw output.</p>
<h2>The three energy flows in net-billing</h2>
<p>The first is self-consumption: solar energy used in the same hour it is produced. It does not pass through the operator’s meter, so you pay nothing for it, neither for energy nor for distribution. It is the most valuable part of the output, worth about ${h.zl(r.priceGross, 2)} per kWh on the 2026 G11 tariff.</p>
<p>The second is export to the grid. The law requires import and export to be netted in each hour separately: if at 1 p.m. you exported 3 kWh and imported 0.5 kWh, a surplus of 2.5 kWh is settled. Its value is the amount of energy times the PSE price, and that value multiplied by 1.23 goes into the prosumer account. The 1.23 factor has applied since 1 July 2024.</p>
<p>The third is import from the grid in the evening, at night and in winter. You pay the normal tariff price for imported energy, but the seller covers the energy part of the bill from the deposit until it runs out. Distribution is always paid on all energy imported from the grid.</p>
<h2>A year on net-billing: 6 kWp in Warsaw</h2>
<p>The table shows how the year works out for a house using 4,000 kWh, with use spread evenly round the clock and settlement at RCE. In summer the deposit grows; in winter it is spent.</p>
${h.table(['Month', 'Output', 'Exported', 'Imported', 'Deposit'], rows, 'PVGIS for Warsaw, RCEm prices over the last 12 months plus the RCE gain from negative hours counted as zero, ×1.23.', ['l', 'r', 'r', 'r', 'r'])}
<p>In total the house exports ${h.num(r.exp)} kWh, giving a deposit of ${h.zl(r.depositValue)}. It spends ${h.zl(r.depositUsed)} of it on imported energy, and ${h.zl(r.refund)} comes back as a refund${r.lost > 1 ? `, while ${h.zl(r.lost)} is lost` : ''}. Settled at RCEm, the same house would save ${h.zl(m.savings)} instead of ${h.zl(r.savings)} a year.</p>
<h2>Overpayment refunds: what comes back as cash</h2>
<p>A deposit left unused for 12 months is not lost in full. The seller refunds it to your bank account, but with a cap: 20% of the value of energy exported in that month at RCEm and 30% at RCE. The cap is computed on the value without the 1.23 factor. The mini-calculator below shows how much comes back for a given deposit.</p>
<!--mini:nadplata-->
<h2>RCE or RCEm: which price pays more</h2>
<p>RCEm is the average price weighted by the energy all prosumers exported in a given month. Because most prosumers export at midday, RCEm is lower than the average wholesale price. RCE is the price of each hour, and when the market price drops below zero, zero is used for settlement. The ${h.a('rce-cena', 'RCE and RCEm')} page shows both prices and their history.</p>
<p>Settlement at RCE gives more when you export outside the production peak: in the morning, late afternoon or from a battery. It also has a higher refund cap. For a typical house without a battery the difference is small, but it rarely goes against RCE.</p>
<h2>How to earn more from net-billing</h2>
<p>The simplest way is to move use to production hours: washing machine, dishwasher, water heating and car charging at midday. Each kilowatt-hour used on the spot is worth several times more than one exported. The second is a ${h.a('fotowoltaika-z-magazynem-energii', 'home battery')}, with a grant from the Przydomowe Magazyny Energii programme. The third is avoiding oversizing: a bigger system mainly increases the deposit, which may be lost. The ${h.a('depozyt-prosumencki', 'prosumer deposit calculator')} works out how much deposit your house will use.</p>`;
    },
  },
});
