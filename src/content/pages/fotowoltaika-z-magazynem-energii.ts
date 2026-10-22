import { definePage, type Helpers } from '../../lib/page-types';
import type { Profile } from '../../lib/engine/pv';

const S = (h: Helpers, batteryKwh: number, kwp = 6, use = 4000, profile: Profile = 'flat') => h.M.simulate({ yieldKwhKwp: 1050, voivIdx: 6, kwp, useKwh: use, batteryKwh, profile });

export default definePage({
  id: 'fotowoltaika-z-magazynem-energii', group: 'pv', order: 70, tool: 'magazyn',
  related: ['magazyn-energii-cena', 'czy-fotowoltaika-sie-oplaca', 'depozyt-prosumencki', 'rce-cena'],
  sources: ['pvgis', 'ozeAct', 'rcem', 'pme', 'pmeProgram'],
  pl: {
    slug: 'fotowoltaika-z-magazynem-energii', nav: 'Fotowoltaika z magazynem', card: 'Ile dokłada magazyn i kiedy się zwraca.',
    title: 'Fotowoltaika z magazynem energii: ile daje magazyn w 2026',
    description: 'Fotowoltaika z magazynem energii: o ile magazyn podnosi autokonsumpcję i oszczędność w net-billingu, jaka pojemność do jakiej mocy i ile daje dotacja PME.',
    h1: 'Fotowoltaika z magazynem energii: ile naprawdę daje',
    intro: 'Kalkulator liczy ten sam dom z magazynem i bez niego. Zmień pojemność i zobacz, o ile rośnie oszczędność.',
    resume: (h) => {
      const a = S(h, 0), b = S(h, 10);
      return `Magazyn energii przechowuje nadwyżkę z południa i oddaje ją wieczorem i w nocy, zamiast wysyłać ją do sieci. W net-billingu ma to sens ekonomiczny, bo energia zużyta z magazynu oszczędza pełną cenę z rachunku, około ${h.zl(a.priceGross, 2)} za kWh, a ta sama energia oddana do sieci daje depozyt wyceniany po RCE i pokrywający tylko część „energia”. Dla 6 kWp w Warszawie i zużycia 4000 kWh magazyn 10 kWh podnosi udział produkcji zużytej na miejscu z ${h.pct(a.selfShare)} do ${h.pct(b.selfShare)}, a roczną oszczędność z ${h.zl(a.savings)} do ${h.zl(b.savings)}, czyli o ${h.zl(b.savings - a.savings)}. Magazyn kosztuje jednak kilkanaście tysięcy złotych, więc sam zwraca się wolniej niż panele. Program Przydomowe Magazyny Energii pokrywa 30 % jego ceny, najwyżej ${h.zl(h.P.pme.perKwh)} za kWh i ${h.zl(h.P.pme.capNetBilling)}. Kalkulator powyżej porównuje oba warianty dla Twojej gminy i zużycia.`;
    },
    faqs: (h) => [
      { q: 'Jaki magazyn energii do instalacji 6 kWp?', a: `Najwięcej dają pierwsze kilowatogodziny pojemności. W Warszawie przy 6 kWp i zużyciu 4000 kWh magazyn 5 kWh podnosi oszczędność o ${h.zl(S(h, 5).savings - S(h, 0).savings)}, a 10 kWh o ${h.zl(S(h, 10).savings - S(h, 0).savings)} rocznie. Program PME wymaga co najmniej 10 kWh i pojemności w Wh co najmniej dwa razy większej niż moc paneli w Wp.` },
      { q: 'Czy magazyn energii się opłaca bez dotacji?', a: `Rzadko. Przy różnicy ${h.zl(S(h, 10).savings - S(h, 0).savings)} rocznie magazyn za 25 000 zł zwraca się w ponad ${h.num(Math.floor(25000 / (S(h, 10).savings - S(h, 0).savings)))} lat, a jego gwarancja obejmuje zwykle 10 lat. Z dotacją PME, przy tej cenie ${h.zl(h.M.pmeGrant({ kwh: 10, cost: 25000 }).battery)}, zwrot się skraca, ale decyduje cena z oferty i pora zużycia prądu w domu.` },
      { q: 'Czy magazyn energii pomoże przy pompie ciepła?', a: 'Niewiele. Magazyn przesuwa energię w ramach jednej doby, a pompa ciepła zużywa najwięcej prądu zimą, gdy nadwyżki z paneli prawie nie ma. Latem magazyn pokryje wieczorne zużycie domu i ciepłą wodę, zimą będzie w większości pusty. Pompie zimą pomaga depozyt z lata, a nie magazyn.' },
      { q: 'Czy z magazynem mogę zostać bez prądu przy awarii sieci?', a: 'Tylko jeśli instalacja ma falownik hybrydowy z funkcją zasilania awaryjnego i rozdzielnię przygotowaną do pracy wyspowej. Zwykły falownik sieciowy wyłącza się przy zaniku napięcia w sieci ze względów bezpieczeństwa, nawet gdy magazyn jest naładowany. Zapytaj instalatora o tę funkcję przed zakupem.' },
    ],
    body: (h) => {
      const rows = [0, 5, 10, 15].map((b) => { const r = S(h, b); return [b ? `${b} kWh` : 'bez magazynu', h.pct(r.selfShare), `${h.num(r.exp)} kWh`, h.zl(r.savings), b ? h.zl(r.savings - S(h, 0).savings) : '–']; });
      const prof = (['out', 'home'] as Profile[]).map((p) => { const a = S(h, 0, 6, 4000, p), b = S(h, 10, 6, 4000, p); return [p === 'out' ? 'w dzień poza domem' : 'praca z domu', h.zl(a.savings), h.zl(b.savings), h.zl(b.savings - a.savings)]; });
      return `
<h2>Ile dokłada każdy kolejny kilowat pojemności</h2>
${h.table(['Magazyn', 'Zużyte na miejscu', 'Oddane do sieci', 'Oszczędność', 'Zysk z magazynu'], rows, 'Warszawa, 6 kWp, zużycie 4000 kWh równo przez dobę, RCE, ceny G11 2026, sprawność cyklu 90 %.', ['l', 'r', 'r', 'r', 'r'])}
<p>Zysk rośnie coraz wolniej, bo magazyn ładuje się tylko z nadwyżki, a rozładowuje tylko do wysokości nocnego zużycia. Gdy pojemność przekracza to, co dom zużywa od wieczora do rana, kolejne kilowatogodziny stoją puste.</p>
<h2>Magazyn bardziej przydaje się tam, gdzie w dzień nikogo nie ma</h2>
${h.table(['Dom', 'Bez magazynu', 'Z magazynem 10 kWh', 'Różnica'], prof, 'Warszawa, 6 kWp, 4000 kWh, RCE.', ['l', 'r', 'r', 'r'])}
<p>W domu, w którym w dzień nikogo nie ma, nadwyżka jest duża, a magazyn ma co przenosić na wieczór. Przy pracy z domu część tej pracy wykonuje już sam dom. Dotację do magazynu i warunki programu liczy ${h.a('magazyn-energii-cena', 'kalkulator dotacji do magazynu energii')}, a wartość energii oddanej do sieci bez magazynu pokazuje strona ${h.a('depozyt-prosumencki', 'depozyt prosumencki')}.</p>`;
    },
  },
  en: {
    slug: 'solar-with-battery-poland', nav: 'Solar with a battery', card: 'What a battery adds and when it pays back.',
    title: 'Solar with a home battery in Poland: what it adds in 2026',
    description: 'Solar with a home battery in Poland: how much a battery raises self-consumption and the net-billing saving, what capacity to choose and the 2026 PME grant.',
    h1: 'Solar with a home battery: what it really adds',
    intro: 'The calculator compares the same house with and without a battery. Change the capacity and see how much the saving grows.',
    resume: (h) => {
      const a = S(h, 0), b = S(h, 10);
      return `A home battery stores the midday surplus and releases it in the evening and at night, instead of sending it to the grid. Under net-billing this makes economic sense, because energy used from the battery saves the full bill price, about ${h.zl(a.priceGross, 2)} per kWh, while the same energy exported gives a deposit valued at RCE that only pays the energy part of the bill. For 6 kWp in Warsaw and 4,000 kWh of use, a 10 kWh battery raises the share of output used on site from ${h.pct(a.selfShare)} to ${h.pct(b.selfShare)}, and the yearly saving from ${h.zl(a.savings)} to ${h.zl(b.savings)}, an increase of ${h.zl(b.savings - a.savings)}. A battery costs well over ten thousand zloty, however, so it pays back more slowly than the panels. The Przydomowe Magazyny Energii programme covers 30% of its price, at most ${h.zl(h.P.pme.perKwh)} per kWh and ${h.zl(h.P.pme.capNetBilling)}. The calculator above compares both options for your municipality and use.`;
    },
    faqs: (h) => [
      { q: 'What battery size suits a 6 kWp system?', a: `The first kilowatt-hours of capacity add the most. In Warsaw with 6 kWp and 4,000 kWh of use, a 5 kWh battery raises the saving by ${h.zl(S(h, 5).savings - S(h, 0).savings)} and a 10 kWh one by ${h.zl(S(h, 10).savings - S(h, 0).savings)} a year. The PME programme requires at least 10 kWh and a capacity in Wh at least twice the panel power in Wp.` },
      { q: 'Is a home battery worth it without a grant?', a: `Rarely. With a gain of ${h.zl(S(h, 10).savings - S(h, 0).savings)} a year, a PLN 25,000 battery takes over ${h.num(Math.floor(25000 / (S(h, 10).savings - S(h, 0).savings)))} years to pay back, while its warranty usually covers 10. A PME grant, ${h.zl(h.M.pmeGrant({ kwh: 10, cost: 25000 }).battery)} at that price, shortens the payback, but your quote and when your household uses power decide.` },
      { q: 'Will a battery help with a heat pump?', a: 'Not much. A battery shifts energy within one day, while a heat pump uses most power in winter, when there is hardly any solar surplus. In summer the battery covers the house’s evening use and hot water; in winter it will mostly sit empty. What helps the pump in winter is the summer deposit, not the battery.' },
      { q: 'Will a battery keep my power on during a grid outage?', a: 'Only if the system has a hybrid inverter with a backup function and a switchboard prepared for island operation. A standard grid inverter shuts down when grid voltage is lost, for safety reasons, even when the battery is full. Ask the installer about this function before you buy.' },
    ],
    body: (h) => {
      const rows = [0, 5, 10, 15].map((b) => { const r = S(h, b); return [b ? `${b} kWh` : 'no battery', h.pct(r.selfShare), `${h.num(r.exp)} kWh`, h.zl(r.savings), b ? h.zl(r.savings - S(h, 0).savings) : '–']; });
      const prof = (['out', 'home'] as Profile[]).map((p) => { const a = S(h, 0, 6, 4000, p), b = S(h, 10, 6, 4000, p); return [p === 'out' ? 'out during the day' : 'working from home', h.zl(a.savings), h.zl(b.savings), h.zl(b.savings - a.savings)]; });
      return `
<h2>What each extra kilowatt-hour of capacity adds</h2>
${h.table(['Battery', 'Used on site', 'Exported', 'Saving', 'Gain from battery'], rows, 'Warsaw, 6 kWp, 4,000 kWh used evenly round the clock, RCE, 2026 G11 prices, 90% round-trip efficiency.', ['l', 'r', 'r', 'r', 'r'])}
<p>The gain grows more and more slowly, because the battery charges only from surplus and discharges only up to the night-time use. Once capacity exceeds what the house uses from evening to morning, the extra kilowatt-hours sit empty.</p>
<h2>A battery helps most where nobody is home in the daytime</h2>
${h.table(['House', 'No battery', 'With 10 kWh battery', 'Difference'], prof, 'Warsaw, 6 kWp, 4,000 kWh, RCE.', ['l', 'r', 'r', 'r'])}
<p>In a house that is empty during the day, the surplus is large and the battery has plenty to move to the evening. When someone works from home, the house already does part of that job. The ${h.a('magazyn-energii-cena', 'home battery grant calculator')} works out the grant and the programme rules, and the ${h.a('depozyt-prosumencki', 'prosumer deposit')} page shows what exported energy is worth without a battery.</p>`;
    },
  },
});
