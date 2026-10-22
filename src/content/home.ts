/** Strona główna (pl, en) : kalkulator fotowoltaiki dla gminy. Liczby w tekście pochodzą z silnika. */
import type { Helpers, FAQ, Lang } from '../lib/page-types';

interface Card { id: string; kicker: string; figure: string; text: string }
interface HomeText { title: string; description: string; h1: string; intro: string; cardsTitle: string; resume: (h: Helpers) => string; faqs: (h: Helpers) => FAQ[]; cards: (h: Helpers) => Card[]; body: (h: Helpers) => string }

const facts = (h: Helpers) => {
  const { M } = h;
  const N = M.MODEL.national;
  const win = M.PRICES.window;
  const rcem = win.map((k) => ({ k, v: M.PRICES.rcem[k].v }));
  const lo = rcem.reduce((a, b) => (b.v < a.v ? b : a)), hi = rcem.reduce((a, b) => (b.v > a.v ? b : a));
  const last = rcem[rcem.length - 1];
  const w6 = M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000 });
  const w6b = M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, batteryKwh: 10 });
  const w6m = M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: 6, useKwh: 4000, regime: 'rcem' });
  const heat = M.heatCosts({ area: 120, eu: 110 });
  return { N, lo, hi, last, w6, w6b, w6m, heat, avgRcem: rcem.reduce((a, b) => a + b.v, 0) / 12 };
};

export const HOME: Record<Lang, HomeText> = {
  pl: {
    title: 'Kalkulator fotowoltaiki 2026: Twoja gmina, net-billing',
    description: 'Kalkulator fotowoltaiki dla każdej gminy: produkcja z PVGIS, autokonsumpcja, depozyt w net-billingu po RCE i RCEm, magazyn, dotacje i lata zwrotu, bez telefonu.',
    h1: 'Fotowoltaika w Twojej gminie: ile da i kiedy się zwróci',
    intro: 'Wpisz gminę, moc i zużycie. Wynik od razu, bez formularza, bez numeru telefonu i bez wyceny od instalatora.',
    cardsTitle: 'Najważniejsze liczby 2026',
    resume: (h) => {
      const f = facts(h);
      return `Kalkulator fotowoltaiki liczy, ile prądu da dach w Twojej gminie i ile to jest warte w net-billingu, czyli w systemie, w którym od kwietnia 2022 r. rozlicza się każdy nowy prosument. Produkcję bierzemy z PVGIS, bazy Wspólnego Centrum Badawczego Komisji Europejskiej, osobno dla ${h.num(f.N.gminas)} gmin i ${h.num(f.N.powiats)} powiatów: od ${h.num(f.N.min)} kWh z 1 kWp rocznie (${f.N.minN}) do ${h.num(f.N.max)} kWh (${f.N.maxN}). Prąd zużyty od razu oszczędza pełną cenę z rachunku, około ${h.zl(f.w6.priceGross, 2)} za kWh w taryfie G11. Nadwyżka trafia do sieci i zamienia się w depozyt: energia razy rynkowa cena PSE razy 1,23, a ten depozyt pokrywa wyłącznie część „energia” przyszłych rachunków, nigdy dystrybucję. W ostatnich 12 miesiącach RCEm wahała się od ${h.num(f.lo.v, 2)} zł/MWh (${h.month(f.lo.k)}) do ${h.num(f.hi.v, 2)} zł/MWh (${h.month(f.hi.k)}). Dla przykładu instalacja 6 kWp w Warszawie przy zużyciu 4000 kWh obniża rachunki o około ${h.zl(f.w6.savings)} rocznie. Wynik jest szacunkiem z jawną metodą, a nie ofertą.`;
    },
    cards: (h) => {
      const f = facts(h);
      return [
        { id: 'rce-cena', kicker: 'RCEm, ' + h.month(f.last.k), figure: `${h.num(f.last.v, 2)} zł/MWh`, text: 'Cena, po której wycenia się nadwyżkę prosumenta w danym miesiącu.' },
        { id: 'ile-pradu-produkuje-fotowoltaika', kicker: 'Uzysk w Polsce', figure: `${h.num(f.N.min)}–${h.num(f.N.max)} kWh`, text: 'Roczna produkcja z 1 kWp według PVGIS, zależnie od gminy.' },
        { id: 'magazyn-energii-cena', kicker: 'Dotacja PME', figure: `do ${h.zl(h.P.pme.capNetBilling)}`, text: 'Do magazynu energii: 30 % kosztów, nabór do 1 października 2027 r.' },
        { id: 'czyste-powietrze-2026', kicker: 'Czyste Powietrze', figure: `do ${h.zl(h.P.cp.grants.pcAirWaterPlus[2])}`, text: 'Najwyższa dotacja do pompy ciepła powietrze/woda wyższej klasy.' },
      ];
    },
    faqs: (h) => {
      const f = facts(h);
      return [
        { q: 'Skąd kalkulator wie, ile prądu wyprodukuje dach w mojej gminie?', a: `Dla środka każdej gminy i każdego powiatu pobraliśmy z PVGIS 5.3 roczny uzysk instalacji nachylonej pod kątem 35° na południe, ze stratami systemu 14 %. PVGIS opiera się na zdjęciach satelitarnych SARAH3 z lat 2005–2023. W Polsce wynik waha się od ${h.num(f.N.min)} do ${h.num(f.N.max)} kWh z 1 kWp, a dla Warszawy wynosi 1050 kWh.` },
        { q: 'Czym różni się rozliczenie po RCE od rozliczenia po RCEm?', a: 'RCEm to jedna cena na cały miesiąc, średnia ważona energią oddaną przez wszystkich prosumentów. RCE zmienia się co godzinę, a ujemną cenę liczy się jako zero. Kto zaczął oddawać energię od 1 lipca 2024 r., rozlicza się po RCE; starsi prosumenci mają RCEm i mogą raz, bez powrotu, przejść na RCE.' },
        { q: 'Dlaczego depozyt prosumencki nie zeruje całego rachunku za prąd?', a: 'Bo ustawa o OZE przeznacza depozyt tylko na zakup energii elektrycznej, czyli na pozycję „energia” w rachunku. Opłaty dystrybucyjne, mocowa, jakościowa i abonament płaci się zawsze. Dlatego każda kilowatogodzina zużyta od razu jest warta pełną cenę z rachunku, a każda oddana do sieci tylko część tej kwoty.' },
        { q: 'Czy magazyn energii zawsze skraca czas zwrotu instalacji?', a: `Nie zawsze. W przykładzie 6 kWp i 4000 kWh w Warszawie magazyn 10 kWh podnosi roczną oszczędność z ${h.zl(f.w6.savings)} do ${h.zl(f.w6b.savings)}, ale sam kosztuje kilkanaście tysięcy złotych. Program Przydomowe Magazyny Energii zwraca do 30 % ceny, najwyżej ${h.zl(h.P.pme.capNetBilling)}. Policz oba warianty z ceną z oferty.` },
        { q: 'Czy w 2026 roku można dostać dotację na same panele fotowoltaiczne?', a: 'Nabór Mój Prąd 6.0 zakończył się 12 września 2025 r., a fundusz zapowiada, że kolejna edycja nie ruszy w dotychczasowej formie. W 2026 r. dofinansowanie dotyczy magazynów energii i ciepła w programie Przydomowe Magazyny Energii oraz źródeł ciepła i ocieplenia w programie Czyste Powietrze.' },
        { q: 'Dlaczego kalkulator nie podaje ceny instalacji za kilowat?', a: 'Bo nie znaleźliśmy publicznego, urzędowego źródła średnich cen paneli, a cennik instalatora byłby reklamą. Zamiast tego pokazujemy, ile możesz zapłacić, żeby instalacja zwróciła się w 6, 8, 10, 12 lub 15 lat. Jeśli masz ofertę, wpisz jej kwotę, a kalkulator poda liczbę lat zwrotu.' },
        { q: 'Czy muszę podać e-mail albo numer telefonu, żeby zobaczyć wynik?', a: 'Nie. Wynik liczy się w Twojej przeglądarce w chwili wpisania danych i nic nie jest wysyłane na nasz serwer. Nie sprzedajemy paneli, nie współpracujemy z instalatorami i nie przekazujemy kontaktów. Wiele kalkulatorów w sieci pokazuje wynik dopiero po zostawieniu numeru, ten nie pyta o nic.' },
      ];
    },
    body: (h) => {
      const f = facts(h);
      const rows = [4, 6, 8, 10].map((k) => { const r = h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: k, useKwh: 4000 }); return [`${k} kWp`, `${h.num(r.prod)} kWh`, h.pct(r.selfShare), h.zl(r.depositUsed + r.refund), h.zl(r.savings)]; });
      const woj = h.M.VOIV.map((v) => [v.name, `${h.num(v.mean)} kWh`, `${v.minN}: ${h.num(v.min)}`, `${v.maxN}: ${h.num(v.max)}`]);
      return `
<h2>Co liczy kalkulator, krok po kroku</h2>
<p>Najpierw produkcja. Wybierasz gminę albo powiat, a kalkulator bierze roczny uzysk z PVGIS dla tego miejsca i rozkłada go na miesiące według profilu Twojego województwa. Jeśli dach nie patrzy na południe albo ma inne nachylenie, produkcja maleje według współczynników, które PVGIS podaje dla każdej strony świata. Szczegóły są na stronie ${h.a('ile-pradu-produkuje-fotowoltaika', 'ile prądu produkuje fotowoltaika')}.</p>
<p>Potem autokonsumpcja, czyli to, co zużyjesz w chwili, gdy panele pracują. Ustawa o OZE każe bilansować pobór i oddanie w każdej godzinie, więc kalkulator liczy dobę przeciętną każdego miesiąca godzina po godzinie: ile produkują panele, ile zużywa dom, ile zostaje. Ta część energii jest najcenniejsza, bo oszczędza pełną cenę kilowatogodziny, razem z dystrybucją i opłatami.</p>
<p>Na końcu nadwyżka i depozyt. Energia oddana do sieci jest wyceniana po cenie rynkowej z PSE, mnożona przez 1,23 i odkładana na konto prosumenta na 12 miesięcy. Z depozytu płacisz za energię pobraną wieczorem, nocą i zimą. Gdy depozytu jest więcej niż potrzeba, część wraca na konto jako nadpłata, a reszta przepada. Wszystkie trzy przepływy opisuje strona ${h.a('net-billing', 'net-billing')}.</p>
<h2>Przykład: Warszawa, zużycie 4000 kWh rocznie</h2>
<p>Tabela pokazuje cztery typowe moce przy tym samym domu: dach 35° na południe, rozliczenie po RCE, zużycie rozłożone równo na całą dobę, bez magazynu. Widać w niej najważniejszą cechę net-billingu: każdy kolejny kilowat dokłada coraz mniej, bo coraz większa część produkcji trafia do sieci po cenie hurtowej.</p>
${h.table(['Moc', 'Produkcja', 'Zużyte na miejscu', 'Depozyt i zwrot', 'Oszczędność rocznie'], rows, 'Warszawa, 1050 kWh/kWp (PVGIS), zużycie 4000 kWh, ceny G11 2026, RCEm z ostatnich 12 miesięcy.', ['l', 'r', 'r', 'r', 'r'])}
<p>Przy 6 kWp oszczędność wynosi około ${h.zl(f.w6.savings)} rocznie w rozliczeniu po RCE i ${h.zl(f.w6m.savings)} po RCEm. Różnica bierze się z dwóch rzeczy: RCE nie schodzi poniżej zera, a limit zwrotu nadpłaty wynosi 30 zamiast 20 % wartości oddanej energii. Dobór mocy do domu opisują strony ${h.a('fotowoltaika-4-kw', '4 kW')}, ${h.a('fotowoltaika-6-kw', '6 kW')}, ${h.a('fotowoltaika-8-kw', '8 kW')} i ${h.a('fotowoltaika-10-kw', '10 kW')}.</p>
<!--mini:moc-->
<h2>Ile prądu daje 1 kWp w każdym województwie</h2>
<p>Różnice między regionami są mniejsze, niż sugerują mapy nasłonecznienia, ale istnieją. Najwięcej produkują dachy na nizinach południowej i środkowej Polski, najmniej wybrzeże, Warmia i Mazury oraz doliny górskie, w których słońce wcześniej chowa się za stokiem. Tabela podaje średnią z gmin każdego województwa oraz gminę najsłabszą i najlepszą.</p>
${h.table(['Województwo', 'Średnio z 1 kWp', 'Najmniej', 'Najwięcej'], woj, 'PVGIS 5.3, SARAH3 2005–2023, dach 35° na południe, straty 14 %.', ['l', 'r', 'l', 'l'])}
<h2>Ceny prądu, z których liczymy oszczędność</h2>
<p>Domyślnie przyjmujemy taryfę G11 na 2026 r., zatwierdzoną przez Prezesa URE 17 grudnia 2025 r.: energia ${h.num(h.P.elec.energyNet, 4)} zł/kWh netto (tyle wynoszą ceny sprzedawców z urzędu Tauron, Energa i PGE), dystrybucja zmienna ${h.num(h.P.elec.distVarNet, 4)} zł/kWh netto według taryfy Energa-Operator oraz opłaty jakościowa, OZE i kogeneracyjna. Razem z VAT daje to około ${h.zl(f.w6.priceGross, 2)} za kilowatogodzinę. Każdy operator ma własną stawkę dystrybucyjną, więc oba pola cen da się zmienić, przepisując liczby z własnego rachunku.</p>
<p>Ceny nadwyżki pochodzą z PSE. RCEm, czyli cena miesięczna, jest publikowana dziesiątego dnia roboczego kolejnego miesiąca, a ostatnia dostępna dotyczy miesiąca ${h.month(f.last.k)}: ${h.num(f.last.v, 2)} zł/MWh. RCE dla każdej godziny pobieramy z otwartego API PSE. Historię cen i wycenę własnej nadwyżki znajdziesz na stronie ${h.a('rce-cena', 'RCE i RCEm')}.</p>
<h2>Magazyn energii, pompa ciepła i dotacje</h2>
<p>Magazyn przesuwa energię z południa na wieczór, więc podnosi autokonsumpcję i zmniejsza nadwyżkę sprzedawaną tanio. Kalkulator porównuje ten sam dom z magazynem i bez niego na stronie ${h.a('fotowoltaika-z-magazynem-energii', 'fotowoltaika z magazynem energii')}, a dotację z programu Przydomowe Magazyny Energii, w którym nabór trwa od 20 października 2026 r. do 1 października 2027 r., liczy ${h.a('magazyn-energii-cena', 'kalkulator dotacji do magazynu')}.</p>
<p>Pompa ciepła zmienia bilans domu: zużycie prądu rośnie, ale głównie zimą, gdy panele produkują najmniej. Strona ${h.a('pompa-ciepla-i-fotowoltaika', 'pompa ciepła i fotowoltaika')} liczy, ile prądu pompy pokryje dach, a ${h.a('pompa-ciepla-koszt-ogrzewania', 'koszt ogrzewania pompą ciepła')} porównuje ją z węglem i gazem. Przy domu 120 m² z wskaźnikiem 110 kWh/m² pompa o minimalnej sprawności dopuszczonej w UE kosztuje rocznie około ${h.zl(f.heat.hp.cost)}, węgiel ${h.zl(f.heat.coal.cost)}, a gaz ${h.zl(f.heat.gas.cost)} z opłatami stałymi.</p>
<p>Dotację na źródło ciepła i ocieplenie daje program Czyste Powietrze. Od 20 lipca 2026 r. obowiązują w nim nowe zasady dotyczące okresu własności; poziom dofinansowania zależy od dochodu, a kwoty od rodzaju urządzenia. Liczy je ${h.a('czyste-powietrze-kalkulator', 'kalkulator Czystego Powietrza')}.</p>
<h2>Jak liczy ten kalkulator</h2>
<p>Ta strona liczy wynik od razu, bez formularza, imienia i numeru telefonu, a zamiast wyceny instalatora pokazuje, ile możesz zapłacić za instalację, żeby się zwróciła. Energię bilansuje godzina po godzinie, tak jak każe ustawa o OZE: kilowatogodzina zużyta na miejscu jest warta tyle, co prąd z rachunku, a oddana do sieci tylko tyle, ile wynosi jej cena rynkowa w danym miesiącu albo godzinie. Czyste Powietrze liczy według zasad obowiązujących od 20 lipca 2026 r.</p>
<p>Tutaj produkcja pochodzi z PVGIS dla Twojej gminy, nadwyżka jest wyceniana po cenach PSE z ostatnich 12 miesięcy, depozyt pokrywa tylko to, co pozwala ustawa, a dotacje są przepisane z dokumentów NFOŚiGW z datą. Nie prosimy o żadne dane kontaktowe i nikomu ich nie przekazujemy. Każde założenie jest opisane na stronie ${h.a('method', 'metodologia')}, razem z ograniczeniami modelu.</p>
<h2>Czego kalkulator nie wie</h2>
<p>Nie zna Twojego dachu: zacienienia od komina, drzewa czy sąsiedniego budynku, stanu więźby ani miejsca na falownik. Nie zna też Twojej umowy ze sprzedawcą, jeśli masz cenę inną niż taryfowa, ani planów rządu co do cen prądu po 2026 r. Liczymy bez wzrostu cen i bez spadku sprawności paneli, a zwrot podajemy w prostych latach. To uproszczenie działa w obie strony i dlatego piszemy je wprost.</p>`;
    },
  },
  en: {
    title: 'Solar panels in Poland 2026: output and payback by gmina',
    description: 'Solar calculator for every Polish municipality: PVGIS output, self-consumption, the net-billing deposit at RCE and RCEm, battery, grants and payback, no call.',
    h1: 'Solar panels in your Polish municipality: output and payback',
    intro: 'Enter your municipality, system size and consumption. The result appears at once, with no form, no phone number and no installer quote.',
    cardsTitle: 'Key figures for 2026',
    resume: (h) => {
      const f = facts(h);
      return `This solar calculator works out how much power a roof produces in your Polish municipality and what that power is worth under net-billing, the scheme that has applied to every new prosumer since April 2022. Output comes from PVGIS, the European Commission Joint Research Centre database, separately for ${h.num(f.N.gminas)} municipalities and ${h.num(f.N.powiats)} counties: from ${h.num(f.N.min)} kWh per kWp per year (${f.N.minN}) to ${h.num(f.N.max)} kWh (${f.N.maxN}). Power used on the spot saves the full price on your bill, about ${h.zl(f.w6.priceGross, 2)} per kWh on the G11 tariff. The surplus goes to the grid and becomes a deposit: energy times the PSE market price times 1.23, and that deposit only pays the energy part of later bills, never distribution. Over the last 12 months RCEm ranged from PLN ${h.num(f.lo.v, 2)}/MWh (${h.month(f.lo.k)}) to PLN ${h.num(f.hi.v, 2)}/MWh (${h.month(f.hi.k)}). For example, a 6 kWp system in Warsaw with 4,000 kWh of use cuts bills by about ${h.zl(f.w6.savings)} a year. The result is an estimate with an open method, not an offer.`;
    },
    cards: (h) => {
      const f = facts(h);
      return [
        { id: 'rce-cena', kicker: 'RCEm, ' + h.month(f.last.k), figure: `PLN ${h.num(f.last.v, 2)}/MWh`, text: 'The price at which a prosumer’s surplus is valued that month.' },
        { id: 'ile-pradu-produkuje-fotowoltaika', kicker: 'Yield in Poland', figure: `${h.num(f.N.min)}–${h.num(f.N.max)} kWh`, text: 'Yearly output per kWp according to PVGIS, depending on the municipality.' },
        { id: 'magazyn-energii-cena', kicker: 'PME grant', figure: `up to ${h.zl(h.P.pme.capNetBilling)}`, text: 'For a home battery: 30% of costs, applications until 1 October 2027.' },
        { id: 'czyste-powietrze-2026', kicker: 'Czyste Powietrze', figure: `up to ${h.zl(h.P.cp.grants.pcAirWaterPlus[2])}`, text: 'Highest grant for a higher-class air-to-water heat pump.' },
      ];
    },
    faqs: (h) => {
      const f = facts(h);
      return [
        { q: 'How does the calculator know the solar output of my municipality?', a: `For the centre of every municipality and county we downloaded from PVGIS 5.3 the yearly yield of a system tilted at 35° facing south, with 14% system losses. PVGIS relies on SARAH3 satellite imagery from 2005 to 2023. Across Poland the result ranges from ${h.num(f.N.min)} to ${h.num(f.N.max)} kWh per kWp; for Warsaw it is 1,050 kWh.` },
        { q: 'What is the difference between settlement at RCE and at RCEm?', a: 'RCEm is one price for the whole month, an average weighted by the energy all prosumers exported. RCE changes every hour, and a negative price counts as zero. Anyone who started exporting from 1 July 2024 is settled at RCE; earlier prosumers have RCEm and may switch to RCE once, with no way back.' },
        { q: 'Why does the prosumer deposit not wipe out the whole electricity bill?', a: 'Because the Renewable Energy Act reserves the deposit for buying electricity, that is the energy line on the bill. Distribution, capacity and quality charges and the subscription are always paid. So every kilowatt-hour used on the spot is worth the full bill price, and every kilowatt-hour exported only part of it.' },
        { q: 'Does a home battery always shorten the payback of a solar system?', a: `Not always. For 6 kWp and 4,000 kWh in Warsaw, a 10 kWh battery lifts the yearly saving from ${h.zl(f.w6.savings)} to ${h.zl(f.w6b.savings)}, but the battery itself costs well over ten thousand zloty. The Przydomowe Magazyny Energii programme refunds up to 30% of the price, at most ${h.zl(h.P.pme.capNetBilling)}. Compare both with your quote.` },
        { q: 'Is there a grant for the panels themselves in Poland in 2026?', a: 'The Mój Prąd 6.0 call closed on 12 September 2025, and the fund says the next edition will not start in its previous form. In 2026, support goes to electricity and heat storage under the Przydomowe Magazyny Energii programme and to heat sources and insulation under Czyste Powietrze.' },
        { q: 'Why does the calculator not give a price per kilowatt for the system?', a: 'Because we found no public, official source for average panel prices, and an installer’s price list would be advertising. Instead we show how much you can pay for the system to pay back in 6, 8, 10, 12 or 15 years. If you have a quote, enter it and the calculator gives the payback in years.' },
        { q: 'Do I have to give an email address or phone number to see the result?', a: 'No. The result is computed in your browser as you type, and nothing is sent to our server. We sell no panels, work with no installers and pass on no contacts. Many Polish solar calculators only show a result once you leave a phone number; this one asks for nothing at all.' },
      ];
    },
    body: (h) => {
      const f = facts(h);
      const rows = [4, 6, 8, 10].map((k) => { const r = h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp: k, useKwh: 4000 }); return [`${k} kWp`, `${h.num(r.prod)} kWh`, h.pct(r.selfShare), h.zl(r.depositUsed + r.refund), h.zl(r.savings)]; });
      const woj = h.M.VOIV.map((v) => [v.name, `${h.num(v.mean)} kWh`, `${v.minN}: ${h.num(v.min)}`, `${v.maxN}: ${h.num(v.max)}`]);
      return `
<h2>What the calculator does, step by step</h2>
<p>First, output. You pick a municipality (gmina) or a county (powiat), and the calculator takes the PVGIS yearly yield for that place and spreads it over the months using the profile of your voivodeship. If the roof does not face south or has another tilt, output drops by the factors PVGIS gives for each direction. Details are on the page ${h.a('ile-pradu-produkuje-fotowoltaika', 'how much power solar panels produce')}.</p>
<p>Next, self-consumption: what you use while the panels are working. The Polish Renewable Energy Act nets imports against exports hour by hour, so the calculator works through an average day of each month, hour by hour: what the panels produce, what the house uses, what is left over. That share is the most valuable, because it saves the full price of a kilowatt-hour, distribution and fees included.</p>
<p>Last, the surplus and the deposit. Energy exported to the grid is valued at the PSE market price, multiplied by 1.23 and credited to the prosumer account for 12 months. The deposit pays for energy drawn in the evening, at night and in winter. When there is more deposit than you need, part comes back as a cash refund and the rest is forfeited. The page ${h.a('net-billing', 'net-billing')} explains all three flows.</p>
<h2>Example: Warsaw, 4,000 kWh a year</h2>
<p>The table shows four common sizes for the same house: roof at 35° facing south, settlement at RCE, use spread evenly over the day, no battery. It shows the key feature of net-billing: each extra kilowatt adds less and less, because a growing share of output goes to the grid at the wholesale price.</p>
${h.table(['Size', 'Output', 'Used on site', 'Deposit and refund', 'Yearly saving'], rows, 'Warsaw, 1,050 kWh/kWp (PVGIS), 4,000 kWh of use, 2026 G11 prices, RCEm over the last 12 months.', ['l', 'r', 'r', 'r', 'r'])}
<p>At 6 kWp the saving is about ${h.zl(f.w6.savings)} a year when settled at RCE and ${h.zl(f.w6m.savings)} at RCEm. The gap has two causes: RCE never goes below zero, and the refund cap is 30 rather than 20% of the value of exported energy. Sizing for your house is covered on the ${h.a('fotowoltaika-4-kw', '4 kW')}, ${h.a('fotowoltaika-6-kw', '6 kW')}, ${h.a('fotowoltaika-8-kw', '8 kW')} and ${h.a('fotowoltaika-10-kw', '10 kW')} pages.</p>
<!--mini:moc-->
<h2>Yield per kWp in each voivodeship</h2>
<p>Regional differences are smaller than sunshine maps suggest, but they exist. Roofs on the lowlands of southern and central Poland produce most; the coast, Warmia and Masuria, and mountain valleys where the sun drops early behind the slope produce least. The table gives the average over the municipalities of each voivodeship, with the weakest and the best one.</p>
${h.table(['Voivodeship', 'Average per kWp', 'Lowest', 'Highest'], woj, 'PVGIS 5.3, SARAH3 2005–2023, roof at 35° facing south, 14% losses.', ['l', 'r', 'l', 'l'])}
<h2>Electricity prices behind the saving</h2>
<p>By default we use the 2026 G11 tariff approved by the URE President on 17 December 2025: energy at PLN ${h.num(h.P.elec.energyNet, 4)}/kWh net (the price of the default sellers Tauron, Energa and PGE), variable distribution at PLN ${h.num(h.P.elec.distVarNet, 4)}/kWh net from the Energa-Operator tariff, plus the quality, renewable and cogeneration charges. With VAT this comes to about ${h.zl(f.w6.priceGross, 2)} per kilowatt-hour. Every network operator has its own distribution rate, so both price fields can be changed to the figures on your own bill.</p>
<p>Surplus prices come from PSE, the transmission system operator. RCEm, the monthly price, is published on the tenth working day of the following month; the latest available is for ${h.month(f.last.k)}: PLN ${h.num(f.last.v, 2)}/MWh. Hourly RCE comes from the open PSE API. Price history and a valuation of your own surplus are on the ${h.a('rce-cena', 'RCE and RCEm')} page.</p>
<h2>Home battery, heat pump and grants</h2>
<p>A battery shifts energy from midday to the evening, raising self-consumption and shrinking the surplus sold cheaply. The calculator compares the same house with and without a battery on the ${h.a('fotowoltaika-z-magazynem-energii', 'solar with battery')} page, and the ${h.a('magazyn-energii-cena', 'battery grant calculator')} works out the Przydomowe Magazyny Energii grant, open from 20 October 2026 to 1 October 2027.</p>
<p>A heat pump changes the household balance: power use rises, but mostly in winter, when panels produce least. The ${h.a('pompa-ciepla-i-fotowoltaika', 'heat pump and solar')} page works out how much of the pump’s power the roof covers, and ${h.a('pompa-ciepla-koszt-ogrzewania', 'heat pump running costs')} compares it with coal and gas. For a 120 m² house at 110 kWh/m², a pump at the minimum efficiency allowed in the EU costs about ${h.zl(f.heat.hp.cost)} a year to run, coal ${h.zl(f.heat.coal.cost)} and gas ${h.zl(f.heat.gas.cost)} including fixed charges.</p>
<p>The Czyste Powietrze programme funds heat sources and insulation. Since 20 July 2026 it has new rules on how long you must have owned the house; the grant level depends on income and the amounts on the type of equipment. The ${h.a('czyste-powietrze-kalkulator', 'Czyste Powietrze calculator')} works them out.</p>
<h2>How this calculator works</h2>
<p>This site gives the result at once, with no form, name or phone number, and instead of an installer quote it shows how much you can pay for a system and still see it pay back. It nets energy hour by hour, as the Polish renewables act requires: a kilowatt-hour used at home is worth as much as power from your bill, while one exported to the grid is worth only its market price for that month or hour. Czyste Powietrze is calculated under the rules in force since 20 July 2026.</p>
<p>Here, output comes from PVGIS for your municipality, the surplus is valued at PSE prices over the last 12 months, the deposit covers only what the law allows, and grants are copied from NFOŚiGW documents with their dates. We ask for no contact details and pass none on. Every assumption is described on the ${h.a('method', 'method')} page, together with the limits of the model.</p>
<h2>What the calculator does not know</h2>
<p>It does not know your roof: shade from a chimney, a tree or the next building, the state of the rafters or where the inverter can go. Nor does it know your contract with the seller if your price differs from the tariff, or government plans for power prices after 2026. We assume no price rises and no panel degradation, and give payback in simple years. That simplification cuts both ways, which is why we state it plainly.</p>`;
    },
  },
};
