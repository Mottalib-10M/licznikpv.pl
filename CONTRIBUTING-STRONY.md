# Jak dodać stronę

Każda strona treści to jeden plik `src/content/pages/<id>.ts` z wersją polską i angielską. Trasy, menu, mapa strony, hreflang i linki „Zobacz też” tworzą się same.

## 1. Plik strony

```ts
import { definePage } from '../../lib/page-types';
export default definePage({
  id: 'moja-strona',          // identyfikator trasy (używany w h.a('moja-strona', 'tekst'))
  group: 'pv',                // pv | rozliczenie | cieplo | dotacje
  order: 80,                  // kolejność w grupie
  tool: 'pv',                 // kalkulator na górze strony (pv, cena, produkcja, magazyn, depozyt, rce, ciepło, pompaPv, cp, progi, pme, orientacja)
  toolArg: undefined,         // np. 'gaz' dla tool: 'ciepło'
  mini: 'zwrot',              // albo mini-symulator, jeśli strona jest poradnikiem bez kalkulatora
  related: ['net-billing', 'rce-cena'],
  sources: ['ozeAct', 'rceApi'],   // klucze z sekcji źródeł w src/data/params-2026.json
  pl: { slug, nav, card, title, description, h1, intro, resume: (h) => '', faqs: (h) => [], body: (h) => '' },
  en: { ... },
});
```

## 2. Pomocniki `h`

`h.zl(x)`, `h.num(x)`, `h.pct(x)`, `h.date(iso)`, `h.month(key)`, `h.table(nagłówki, wiersze, podpis)`, `h.a(id, tekst)` (link wewnętrzny), `h.src(klucz)` (link do źródła), `h.P` (parametry z `src/data/params-2026.json`), `h.M` (silnik z `src/lib/engine`). Każda liczba w tekście ma pochodzić z `h.P`, `h.M` albo z cytowanego źródła: nigdy nie wpisujemy jej ręcznie.

Mini-symulator wstawia się do treści znacznikiem `<!--mini:rodzaj-->` (rodzaje w `src/lib/minis/`).

## 3. Limity sprawdzane przy budowie

- title 50–60 znaków, description 150–160 znaków (build się zatrzymuje);
- streszczenie (`resume`): jeden akapit, co najmniej 120 słów;
- strona z kalkulatorem: co najmniej 500 słów; poradnik: co najmniej 1 200;
- FAQ: 3–5 pytań (do 8 przy 1 200 słowach), odpowiedzi po 40–90 słów;
- bez linków partnerskich, bez linków do innych serwisów wydawcy, bez formularzy kontaktowych zamiast wyniku.

## 4. Dane

- Produkcja PV: `scripts/pvgis/` (PVGIS 5.3, JRC) — uruchamiane raz, wynik w `public/data/miejsca.json` i `src/data/pv-model.json`.
- Ceny RCE/RCEm: `npm run update-data` (API PSE), co miesiąc przez `.github/workflows/update-data.yml`.
- Taryfy, dotacje, progi: `src/data/params-2026.json`, każda wartość z polem źródła i datą.

## 5. Przed publikacją

`npm run check` musi zakończyć się kodem 0.
