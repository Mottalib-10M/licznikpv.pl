import type { Locale } from './routes';
const pl = {
  updatedOn: 'Zaktualizowano', editorialPolicy: 'Polityka redakcyjna', contactLabel: 'Kontakt', reviewedBy: 'Sprawdził',
  skipToContent: 'Przejdź do treści', mainNav: 'Menu główne', breadcrumbLabel: 'Ścieżka nawigacji', breadcrumbHome: 'Start', menuOpen: 'Otwórz menu',
  faqTitle: 'Najczęstsze pytania', relatedCalculators: 'Powiązane kalkulatory i poradniki', sourcesTitle: 'Źródła', writtenBy: 'Opracowanie',
  asOf: 'Dane', lastUpdated: 'aktualizacja', footerValidated: 'Źródła: PVGIS (Komisja Europejska), PSE, URE, NFOŚiGW, GUS', footerBrowser: 'Liczone w przeglądarce · bez formularza, e-maila i telefonu · bezpłatnie',
  footerDisclaimer: 'Niezależny serwis wydawany przez Radif Partners, bez związku z NFOŚiGW, URE, PSE, Komisją Europejską, sprzedawcami prądu ani instalatorami. Wyniki mają charakter szacunkowy i nie stanowią doradztwa finansowego ani podatkowego: liczymy je z Twoich danych, cen urzędowych i danych PVGIS. Wiążące są umowa ze sprzedawcą, rachunek i decyzja funduszu. Nie zbieramy danych i nikogo z nikim nie kontaktujemy.', footerPopular: '', notFound: 'Ta strona nie istnieje.',
  readMore: 'Czytaj dalej',
};
const en: typeof pl = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related calculators and guides', sourcesTitle: 'Sources', writtenBy: 'Prepared by',
  asOf: 'Data', lastUpdated: 'updated', footerValidated: 'Sources: PVGIS (European Commission), PSE, URE, NFOŚiGW, Statistics Poland', footerBrowser: 'Computed in your browser · no form, email or phone number · free',
  footerDisclaimer: 'Independent site published by Radif Partners, with no link to NFOŚiGW, URE, PSE, the European Commission, electricity sellers or installers. Results are estimates only and do not constitute financial or tax advice: they come from your inputs, official prices and PVGIS data. Your contract, your bill and the fund’s decision are what count. We collect no data and refer nobody to anybody.', footerPopular: '', notFound: 'This page does not exist.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : pl; }
