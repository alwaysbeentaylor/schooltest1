import { NewsItem, CalendarEvent, PhotoAlbum, Teacher } from './types';

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Grootoudersfeest was een succes!',
    content: 'Wat hebben we genoten van de massale opkomst. De kleuters hebben hun beste beentje voorgezet. Bekijk zeker de foto\'s in het album.',
    date: '2023-10-15',
    expiryDate: '2024-01-01',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    category: 'Kleuter'
  },
  {
    id: '2',
    title: 'Inschrijvingen schooljaar 2024-2025',
    content: 'De inschrijvingen starten binnenkort. Vergeet niet uw afspraak te maken voor een rondleiding.',
    date: '2023-11-01',
    expiryDate: '2024-09-01',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    category: 'Algemeen'
  },
  {
    id: '3',
    title: 'Herfstwandeling L3 en L4',
    content: 'Met laarzen aan trokken we het bos in. We leerden over paddenstoelen en bladeren.',
    date: '2023-10-20',
    expiryDate: '2023-11-20',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    category: 'Lager'
  }
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Pedagogische studiedag', date: '2023-11-15', type: 'Vrije Dag', grades: ['All'] },
  { id: '2', title: 'Sinterklaas op school', date: '2023-12-06', type: 'Activiteit', grades: ['All'] },
  { id: '3', title: 'Kerstvakantie', date: '2023-12-25', type: 'Vakantie', grades: ['All'] },
];

export const MOCK_ALBUMS: PhotoAlbum[] = [
  {
    id: '1',
    location: 'Verrekijker',
    title: 'Spelen in de herfstzon',
    coverImage: 'https://picsum.photos/800/600?random=10',
    images: ['https://picsum.photos/800/600?random=10', 'https://picsum.photos/800/600?random=11']
  },
  {
    id: '2',
    location: 'Lagere School',
    title: 'Sportdag 2023',
    coverImage: 'https://picsum.photos/800/600?random=12',
    images: ['https://picsum.photos/800/600?random=12', 'https://picsum.photos/800/600?random=13']
  }
];

export const MOCK_TEAM: Teacher[] = [
  { id: '1', role: 'Directie', imageUrl: 'https://picsum.photos/400/400?random=20', group: 'Directie' },
  { id: '2', role: 'Juf 1e Kleuter', imageUrl: 'https://picsum.photos/400/400?random=21', group: 'Kleuter' },
  { id: '3', role: 'Meester 5e Leerjaar', imageUrl: 'https://picsum.photos/400/400?random=22', group: 'Lager' },
  { id: '4', role: 'Zorgcoördinator', imageUrl: 'https://picsum.photos/400/400?random=23', group: 'Zorg' },
];
