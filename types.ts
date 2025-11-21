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
}

export interface PhotoAlbum {
  id: string;
  location: 'Verrekijker' | 'Kloosterstraat' | 'Lagere School' | 'Algemeen';
  title: string;
  coverImage: string;
  images: string[];
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
  | 'team' 
  | 'news' 
  | 'calendar' 
  | 'info' 
  | 'parents' 
  | 'contact' 
  | 'gallery' 
  | 'box' 
  | 'admin';
