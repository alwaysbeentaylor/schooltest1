export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  expiryDate?: string; // Auto-archive date
  imageUrl: string;
  category: 'Algemeen' | 'Kleuter' | 'Lager';
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Vakantie' | 'Activiteit' | 'Vrije Dag';
  grades: string[]; // 'All', 'L1', 'K2', etc.
  description?: string;
}

export interface PhotoAlbum {
  id: string;
  location: 'Verrekijker' | 'Kleuter Klooster' | 'Lager' | 'Algemeen';
  title: string;
  coverImage: string;
  images: string[];
  expiryDate?: string; // Optionele vervaldatum - foto's verdwijnen automatisch na deze datum
  createdDate?: string; // Datum waarop album is aangemaakt
}

export interface Teacher {
  id: string;
  role: string; // e.g., "Kleuterjuf 1KA" - No names as requested
  imageUrl: string;
  group: 'Kleuter' | 'Lager' | 'Zorg' | 'Directie';
}

export type PageView =
  | 'home'
  | 'about'
  | 'enroll'
  | 'news'
  | 'calendar'
  | 'info'
  | 'ouderwerkgroep'
  | 'contact'
  | 'gallery'
  | 'box'
  | 'menu'
  | 'admin';

export interface FormSubmission {
  id: string;
  date: string;
  type: 'Contact' | 'Inschrijving' | 'Rondleiding';
  name: string;
  email?: string;
  details: string;
  status: 'Nieuw' | 'Gelezen';
}

export interface SiteConfig {
  menuUrl: string; // URL to Hanssens
  homeHeroImage: string;
  homeHeroPosition: string; // e.g. "center center"
  homeTitle: string;
  homeSubtitle: string;
  aboutText: string;
  contactEmail: string;
  contactAddress: string; // e.g. "Kloosterstraat 4a, 8340 Sijsele"
  contactPhoneKloosterstraat: string; // e.g. "050 36 32 25"
  contactPhoneHovingenlaan: string; // e.g. "050 36 09 71"
  contactPhoneGSM: string; // e.g. "0496 23 57 01"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface OuderwerkgroepActivity {
  id: string;
  title: string;
  description: string;
  images: string[]; // Multiple photos per activity
}

export interface PageConfig {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  order: number;
  type: 'system' | 'custom';
  // Content fields for custom pages
  content?: string;
  pageImages?: string[];
}

// Inschrijvingsformulier types
export interface Enrollment {
  id: string;
  submittedAt: string;
  status: 'nieuw' | 'in_behandeling' | 'gerealiseerd' | 'niet_gerealiseerd';
  
  // Stap 1 - Basisgegevens Kind
  inschrijvingsDatum: string;
  schooljaar: '2024 - 2025' | '2025 - 2026' | '2026 - 2027';
  afdeling: 'kleuter Kloosterstraat' | 'kleuter Hovingenlaan' | 'lager Kloosterstraat';
  naamKind: string;
  voornaamKind: string;
  adres: string;
  geboortedatumKind: string;
  geboorteplaatsKind: string;
  bewijsGeboortedatum: 'Kids ID' | 'ISI+ kaart' | 'Anders';
  bewijsGeboortedatumAnders?: string;
  rijksregisternummerKind: string;
  geslacht: 'M' | 'V' | 'X';
  nationaliteit: 'Belg' | 'Nederlander' | 'Anders';
  nationaliteitAnders?: string;
  
  // Stap 2 - Gezinssituatie
  isOudsteGezin: boolean;
  andereKinderen?: string;
  bankrekening: string;
  telefoonVast?: string;
  gsmPapa?: string;
  gsmMama?: string;
  grootoudersPapa?: string;
  grootoudersMama?: string;
  werkPapa?: string;
  werkMama?: string;
  emailPapa?: string;
  emailMama?: string;
  
  // Stap 3 - Gegevens Papa
  naamPapa: string;
  geboortedatumPapa: string;
  geboorteplaatsPapa: string;
  rijksregisternummerPapa: string;
  leerplichtverantwoordelijkePapa: '1' | '2';
  beroepPapa?: string;
  opleidingsniveauPapa: string;
  
  // Stap 3 - Gegevens Mama
  naamMama: string;
  geboortedatumMama: string;
  geboorteplaatsMama: string;
  rijksregisternummerMama: string;
  leerplichtverantwoordelijkeMama: '1' | '2';
  beroepMama?: string;
  opleidingsniveauMama: string;
  
  // Stap 4 - Medisch & Praktisch
  huisarts: string;
  ziekenhuis: 'AZ Sint-Lucas' | 'AZ Sint-Jan';
  allergieenZiektes?: string;
  
  // Stap 5 - Verklaring & Bevestiging
  akkoordReglement: boolean;
  eersteSchooldag: string;
  startKlas?: string;
  anderstaligNieuwkomer: boolean;
  verslagBuitengewoonOnderwijs: boolean;
  broerZusIngeschreven: boolean;
  personeelslid: boolean;
  vorigeSchool?: string;
  ondertekeningNaam: string;
  ondertekeningDatum: string;
  ondertekeningUur: string;
  
  // Stap 6 - Taalvragenlijst
  taalMoeder: 'Nederlands' | 'Frans' | 'Een andere taal' | 'Niet van toepassing';
  taalVader: 'Nederlands' | 'Frans' | 'Een andere taal' | 'Niet van toepassing';
  taalBroersZussen: 'Nederlands' | 'Frans' | 'Een andere taal' | 'Niet van toepassing';
  taalVrienden: 'Nederlands' | 'Frans' | 'Een andere taal' | 'Weet niet';
  bevestigingOpEerDatum: string;
  bevestigingOpEerNaam: string;
}