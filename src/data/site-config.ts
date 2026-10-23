/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://licznikpv.pl";
export const SITE_NAMES: Record<string, string> = {"pl": "Licznik PV", "en": "Licznik PV"};
export const LANG_TAGS: Record<string, string> = {"pl": "pl-PL", "en": "en-PL"};
export const OG_LOCALES: Record<string, string> = {"pl": "pl_PL", "en": "en_GB"};
export const LOCALE_TAG = 'pl-PL';
export const CURRENCY = 'PLN';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-22';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"pl": "Wydawca niezależnego kalkulatora fotowoltaiki i pompy ciepła dla każdej gminy w Polsce, bez instalatora, formularza i telefonu", "en": "Publisher of an independent solar and heat pump calculator for every Polish gmina, with no installer, no form and no phone call"};
export const AUTHOR_DESC: Record<string, string> = {"pl": "Radif Partners liczy dla każdej gminy roczną produkcję prądu z dachu na podstawie PVGIS (Wspólne Centrum Badawcze Komisji Europejskiej), wycenia nadwyżkę po cenach RCE i RCEm publikowanych przez PSE zgodnie z art. 4b ustawy o OZE, a dotacje bierze wprost z dokumentów NFOŚiGW. Nie sprzedajemy paneli ani pomp ciepła i nie przekazujemy nikomu Twoich danych.", "en": "For every Polish gmina, Radif Partners computes yearly rooftop output from PVGIS (the European Commission's Joint Research Centre), values the exported surplus at the RCE and RCEm prices PSE publishes under Article 4b of the Polish Renewable Energy Act, and takes grant rules straight from NFOŚiGW documents. We sell no panels or heat pumps and pass your data to nobody."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"pl": ["Produkcja instalacji fotowoltaicznej w gminach Polski (PVGIS)", "Net-billing: RCE, RCEm i depozyt prosumencki (art. 4b i 4c ustawy o OZE)", "Program Czyste Powietrze: progi dochodowe i kwoty dotacji", "Przydomowe Magazyny Energii i koniec programu Mój Prąd 6.0", "Koszt ogrzewania pompą ciepła, węglem i gazem"], "en": ["Rooftop solar yield across Polish gminas (PVGIS)", "Polish net-billing: RCE, RCEm and the prosumer deposit", "Czyste Powietrze grant: income thresholds and amounts", "Polish home battery grants after Mój Prąd 6.0", "Heating cost in Poland: heat pump, coal and gas"]};
export const CONTACT_EMAIL = "contact@licznikpv.pl";
export const THEME_COLOR = '#A61B29';
export const LOGO_SYMBOL = 'PV';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = 'z25ztugv31';
export const INDEXNOW_KEY = '37a43c5d59562d289e01a77b474ad46d';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // wydawca wszystkich serwisów portfela (RECETTE §8)
  legalForm: '',  // publikacja prowadzona osobiście, jak pozostałe serwisy portfela
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "Francja / France",
  phone: '',
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "VAT",
  vatNumber: '',
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
