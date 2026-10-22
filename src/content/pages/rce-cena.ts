import { definePage, type Helpers } from '../../lib/page-types';

const stats = (h: Helpers) => {
  const P = h.M.PRICES, win = P.window;
  const rows = win.map((k) => ({ k, m: P.rcem[k].v, avg: P.rce[k].avg, pvw: P.rce[k].pvw, neg: P.rce[k].negativeHours }));
  const lo = rows.reduce((a, b) => (b.m < a.m ? b : a)), hi = rows.reduce((a, b) => (b.m > a.m ? b : a));
  const neg = rows.reduce((a, b) => a + b.neg, 0);
  const negMax = rows.reduce((a, b) => (b.neg > a.neg ? b : a));
  const avgM = rows.reduce((a, b) => a + b.m, 0) / rows.length, avgR = rows.reduce((a, b) => a + b.avg, 0) / rows.length;
  return { rows, lo, hi, neg, negMax, avgM, avgR, last: rows[rows.length - 1] };
};

export default definePage({
  id: 'rce-cena', group: 'rozliczenie', order: 30, tool: 'rce',
  related: ['net-billing', 'depozyt-prosumencki', 'fotowoltaika-z-magazynem-energii'],
  sources: ['rcem', 'rceApi', 'ozeAct', 'netBillingGov'],
  pl: {
    slug: 'rce-cena', nav: 'RCE i RCEm', card: 'Ceny nadwyżki z PSE i wartość Twojej energii.',
    title: 'RCE cena 2026: RCEm i RCE z PSE, miesiąc po miesiącu',
    description: 'RCE i RCEm w 2026 r.: ceny PSE energii oddanej do sieci w każdym miesiącu, średnia godzinowa RCE, godziny z ceną ujemną i wartość Twojej nadwyżki w zł.',
    h1: 'RCE i RCEm: ile jest warta energia oddana do sieci',
    intro: 'Wybierz miesiąc i wpisz, ile energii oddałeś. Zobaczysz cenę z PSE, wartość nadwyżki i depozyt.',
    resume: (h) => {
      const s = stats(h);
      return `RCE, czyli rynkowa cena energii elektrycznej, to cena z rynku dnia następnego publikowana przez PSE dla każdego okresu rozliczeniowego doby. RCEm to jej odpowiednik miesięczny: średnia ważona ilością energii, którą wszyscy prosumenci oddali do sieci w danym miesiącu. Obie ceny służą do wyceny nadwyżki w net-billingu. Prosumenci, którzy zaczęli oddawać energię od 1 lipca 2024 r., rozliczają się po RCE, a starsi po RCEm, chyba że raz wybrali RCE. W ostatnich 12 miesiącach RCEm wynosiła od ${h.num(s.lo.m, 2)} zł/MWh (${h.month(s.lo.k)}) do ${h.num(s.hi.m, 2)} zł/MWh (${h.month(s.hi.k)}), średnio ${h.num(s.avgM, 2)} zł/MWh. Ostatnia opublikowana wartość, za ${h.month(s.last.k)}, to ${h.num(s.last.m, 2)} zł/MWh, czyli ${h.num(s.last.m / 1000, 3)} zł za kWh. Na depozyt trafia ta kwota pomnożona przez 1,23. Narzędzie powyżej wycenia Twoją nadwyżkę dla wybranego miesiąca po obu cenach.`;
    },
    faqs: (h) => {
      const s = stats(h);
      return [
        { q: 'Gdzie sprawdzić aktualną cenę RCEm?', a: 'PSE publikuje RCEm na swojej stronie w dziale raportów, w tabeli „Rynkowa miesięczna cena energii elektrycznej”, zwykle dziesiątego dnia roboczego kolejnego miesiąca. Ceny RCE dla każdego okresu doby są w otwartym API raportów PSE. Ta strona pobiera obie wartości automatycznie i podaje datę publikacji pod wynikiem narzędzia.' },
        { q: 'Dlaczego RCEm jest niższa od średniej ceny energii?', a: `Bo jest ważona ilością energii oddanej przez prosumentów, a ci oddają ją głównie w słoneczne południa, gdy na rynku jest jej najwięcej i cena spada. W ostatnich 12 miesiącach średnia RCEm wynosiła ${h.num(s.avgM, 2)} zł/MWh, a prosta średnia RCE ze wszystkich godzin ${h.num(s.avgR, 2)} zł/MWh.` },
        { q: 'Co się dzieje, gdy cena RCE jest ujemna?', a: `Do rozliczenia prosumenta przyjmuje się wtedy zero: za energię oddaną w takiej godzinie nie dostajesz nic, ale też nie płacisz. W ostatnich 12 miesiącach łącznie około ${h.num(s.neg, 0)} godzin miało ujemną RCE, najwięcej w miesiącu ${h.month(s.negMax.k)}: ${h.num(s.negMax.neg, 0)}. W tych godzinach opłaca się zużyć energię na miejscu albo naładować magazyn.` },
        { q: 'Ile zł za kWh dostaje prosument za energię oddaną do sieci?', a: `W ostatnim opublikowanym miesiącu RCEm wynosiła ${h.num(s.last.m / 1000, 3)} zł za kWh, a z współczynnikiem 1,23 na depozyt trafiało ${h.num(s.last.m * 1.23 / 1000, 3)} zł za kWh. Latem, gdy prosumenci oddają najwięcej, cena bywa dwa razy niższa niż zimą. Kwota trafia na depozyt, nie na konto bankowe.` },
      ];
    },
    body: (h) => {
      const s = stats(h);
      const rows = s.rows.map((r) => [h.month(r.k), h.num(r.m, 2), h.num(r.avg, 2), h.num(r.pvw, 2), h.num(r.neg, 0)]);
      return `
<h2>RCEm i RCE w ostatnich 12 miesiącach</h2>
${h.table(['Miesiąc', 'RCEm, zł/MWh', 'Średnia RCE', 'RCE ważona produkcją PV', 'Godziny z RCE < 0'], rows, `PSE: RCEm z tabeli miesięcznej, RCE z API raportów (ujemne liczone jako zero w średnich). Pobrane ${h.date(h.M.PRICES.retrieved_at)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>Kolumna „RCE ważona produkcją PV” to średnia cena godzinowa ważona kształtem produkcji paneli na południe w danym miesiącu, liczona przez nas z danych PSE i PVGIS. Pokazuje, ile jest warta typowa nadwyżka domowej instalacji w rozliczeniu po RCE. Gdy jest niższa od RCEm, nadwyżka oddawana w południe jest warta mniej niż średnia prosumentów, gdy wyższa, więcej.</p>
<h2>Jak czytać ceny i co z nich wynika</h2>
<p>Ceny nadwyżki są najniższe wiosną i latem, gdy produkcja paneli w całym kraju jest największa, i najwyższe zimą. Dla właściciela instalacji oznacza to, że ta sama kilowatogodzina oddana w kwietniu jest warta kilka razy mniej niż w grudniu. Największy wpływ na wynik ma więc autokonsumpcja w miesiącach letnich: każda kilowatogodzina zużyta od razu oszczędza pełną cenę z rachunku zamiast trafiać do sieci po cenie RCE.</p>
<p>Ceny z tej tabeli zasilają wszystkie kalkulatory serwisu, od ${h.a('depozyt-prosumencki', 'depozytu prosumenckiego')} po ${h.a('fotowoltaika-z-magazynem-energii', 'fotowoltaikę z magazynem')}. Aktualizujemy je automatycznie po każdej publikacji PSE, a cały mechanizm rozliczenia opisuje strona ${h.a('net-billing', 'net-billing')}.</p>`;
    },
  },
  en: {
    slug: 'rce-price-poland', nav: 'RCE and RCEm', card: 'PSE surplus prices and what your energy is worth.',
    title: 'RCE price in Poland 2026: RCEm and RCE from PSE by month',
    description: 'RCE and RCEm in Poland in 2026: PSE prices for exported energy each month, the hourly RCE average, negative-price hours and what your surplus is worth.',
    h1: 'RCE and RCEm: what energy exported to the grid is worth',
    intro: 'Pick a month and enter how much energy you exported. You will see the PSE price, the surplus value and the deposit.',
    resume: (h) => {
      const s = stats(h);
      return `RCE, the market price of electricity, is the day-ahead market price that PSE publishes for every settlement period of the day. RCEm is its monthly counterpart: an average weighted by the energy all prosumers exported to the grid in that month. Both prices are used to value surplus under net-billing. Prosumers who started exporting from 1 July 2024 are settled at RCE, and earlier ones at RCEm, unless they once chose RCE. Over the last 12 months RCEm ranged from PLN ${h.num(s.lo.m, 2)}/MWh (${h.month(s.lo.k)}) to PLN ${h.num(s.hi.m, 2)}/MWh (${h.month(s.hi.k)}), averaging PLN ${h.num(s.avgM, 2)}/MWh. The latest published value, for ${h.month(s.last.k)}, is PLN ${h.num(s.last.m, 2)}/MWh, or PLN ${h.num(s.last.m / 1000, 3)} per kWh. The deposit receives that amount times 1.23. The tool above values your surplus for the chosen month at both prices.`;
    },
    faqs: (h) => {
      const s = stats(h);
      return [
        { q: 'Where can I check the current RCEm price?', a: 'PSE publishes RCEm on its website in the reports section, in the “market monthly electricity price” table, usually on the tenth working day of the following month. RCE prices for every period of the day are in the open PSE reports API. This page downloads both automatically and gives the publication date below the tool’s result.' },
        { q: 'Why is RCEm lower than the average power price?', a: `Because it is weighted by the energy prosumers export, and they export mostly on sunny middays, when the market has most energy and prices fall. Over the last 12 months average RCEm was PLN ${h.num(s.avgM, 2)}/MWh, while the simple average RCE over all hours was PLN ${h.num(s.avgR, 2)}/MWh.` },
        { q: 'What happens when the RCE price is negative?', a: `Zero is then used to settle the prosumer: you get nothing for energy exported in that hour, but you pay nothing either. Over the last 12 months about ${h.num(s.neg, 0)} hours in total had negative RCE, the most in ${h.month(s.negMax.k)}: ${h.num(s.negMax.neg, 0)}. In those hours it pays to use energy on site or charge a battery.` },
        { q: 'How much per kWh does a prosumer get for exported energy?', a: `In the latest published month RCEm was PLN ${h.num(s.last.m / 1000, 3)} per kWh, and with the 1.23 factor the deposit received PLN ${h.num(s.last.m * 1.23 / 1000, 3)} per kWh. In summer, when prosumers export most, the price can be half the winter level. The amount goes into the deposit, not into your bank account.` },
      ];
    },
    body: (h) => {
      const s = stats(h);
      const rows = s.rows.map((r) => [h.month(r.k), h.num(r.m, 2), h.num(r.avg, 2), h.num(r.pvw, 2), h.num(r.neg, 0)]);
      return `
<h2>RCEm and RCE over the last 12 months</h2>
${h.table(['Month', 'RCEm, PLN/MWh', 'Average RCE', 'RCE weighted by solar output', 'Hours with RCE < 0'], rows, `PSE: RCEm from the monthly table, RCE from the reports API (negatives counted as zero in averages). Retrieved ${h.date(h.M.PRICES.retrieved_at)}.`, ['l', 'r', 'r', 'r', 'r'])}
<p>The “RCE weighted by solar output” column is the hourly price averaged over the output profile of south-facing panels in that month, which we compute from PSE and PVGIS data. It shows what the typical surplus of a home system is worth when settled at RCE. When it is below RCEm, surplus exported at midday is worth less than the prosumer average; when above, more.</p>
<h2>How to read the prices and what follows from them</h2>
<p>Surplus prices are lowest in spring and summer, when solar output across the country peaks, and highest in winter. For a system owner this means the same kilowatt-hour exported in April is worth several times less than in December. Self-consumption in the summer months therefore has the biggest effect on the result: each kilowatt-hour used on the spot saves the full bill price instead of going to the grid at the RCE price.</p>
<p>The prices in this table feed every calculator on the site, from the ${h.a('depozyt-prosumencki', 'prosumer deposit')} to ${h.a('fotowoltaika-z-magazynem-energii', 'solar with a battery')}. We update them automatically after each PSE publication, and the ${h.a('net-billing', 'net-billing')} page describes the whole settlement mechanism.</p>`;
    },
  },
});
