import { NewsItem, CalendarEvent, PhotoAlbum, Teacher, SiteConfig, FormSubmission, ChatMessage } from './types';

export const DEFAULT_CONFIG: SiteConfig = {
  menuUrl: 'https://order.hanssens.be/menu/O56/OUDE-VESTIGING',
  homeHeroImage: '/images/hero/school-main.jpeg',
  homeHeroPosition: 'center center',
  homeTitle: 'Samen groeien,\nelk op zijn eigen ritme',
  homeSubtitle: 'Vrije Basisschool Sijsele',
  aboutText: 'In VBS Sint-Maarten staat het kind centraal. Wij geloven in onderwijs dat niet alleen kennis overdraagt, maar ook werkt aan de totale persoonlijkheidsontwikkeling.',
  contactEmail: 'info@vrijebasisschoolsijsele.be',
  contactAddress: 'Kloosterstraat 4a, 8340 Sijsele',
  contactPhoneKloosterstraat: '050 36 32 25',
  contactPhoneHovingenlaan: '050 36 09 71',
  contactPhoneGSM: '0496 23 57 01'
};

// Hero carousel images - rotates automatically
export const HERO_IMAGES = [
  '/images/hero/school-main.jpeg',
  '/images/hero/school-building.jpeg',
  '/images/hero/school-kids.jpeg'
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Grootoudersfeest was een succes!',
    content: 'Wat hebben we genoten van de massale opkomst. De kleuters hebben hun beste beentje voorgezet. Bekijk zeker de foto\'s in het album.',
    date: '2023-10-15',
    expiryDate: '2024-01-01',
    imageUrl: '/images/news/bibliotheek-13.jpeg',
    category: 'Kleuter'
  },
  {
    id: '2',
    title: 'Inschrijvingen schooljaar 2024-2025',
    content: 'De inschrijvingen starten binnenkort. Vergeet niet uw afspraak te maken voor een rondleiding.',
    date: '2023-11-01',
    expiryDate: '2024-09-01',
    imageUrl: '/images/news/bibliotheek-15.jpeg',
    category: 'Algemeen'
  },
  {
    id: '3',
    title: 'Herfstwandeling L3 en L4',
    content: 'Met laarzen aan trokken we het bos in. We leerden over paddenstoelen en bladeren.',
    date: '2023-10-20',
    expiryDate: '2023-11-20',
    imageUrl: '/images/news/bibliotheek-17.jpeg',
    category: 'Lager'
  }
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Pedagogische studiedag', date: '2023-11-15', type: 'Vrije Dag', grades: ['All'], description: 'Vrije dag voor de leerlingen.' },
  { id: '2', title: 'Sinterklaas op school', date: '2023-12-06', type: 'Activiteit', grades: ['All'], description: 'De Sint komt langs in alle klassen.' },
  { id: '3', title: 'Kerstvakantie', date: '2023-12-25', type: 'Vakantie', grades: ['All'], description: 'Prettige feesten!' },
];

export const MOCK_ALBUMS: PhotoAlbum[] = [
  {
    id: '1',
    location: 'Kleuter Klooster',
    title: 'Spelen in de herfstzon',
    coverImage: '/images/gallery/bibliotheek-1.jpeg',
    images: [
      '/images/gallery/bibliotheek-1.jpeg',
      '/images/gallery/bibliotheek-3.jpeg',
      '/images/gallery/bibliotheek-5.jpeg'
    ],
    createdDate: '2023-10-01'
  },
  {
    id: '2',
    location: 'Kleuter Klooster',
    title: 'Creatieve Workshops',
    coverImage: '/images/gallery/bibliotheek-3.jpeg',
    images: [
      '/images/gallery/bibliotheek-3.jpeg',
      '/images/gallery/bibliotheek-5.jpeg'
    ],
    createdDate: '2023-11-15'
  },
  {
    id: '3',
    location: 'Lager',
    title: 'Activiteiten 2023',
    coverImage: '/images/gallery/bibliotheek-7.jpeg',
    images: [
      '/images/gallery/bibliotheek-7.jpeg',
      '/images/gallery/bibliotheek-9.jpeg',
      '/images/gallery/bibliotheek-11.jpeg'
    ],
    createdDate: '2023-09-20'
  },
  {
    id: '4',
    location: 'Lager',
    title: 'Sportdag',
    coverImage: '/images/gallery/bibliotheek-9.jpeg',
    images: [
      '/images/gallery/bibliotheek-9.jpeg',
      '/images/gallery/bibliotheek-11.jpeg'
    ],
    createdDate: '2023-10-10',
    expiryDate: '2025-10-10' // Voorbeeld: vervalt na 2 jaar
  },
  {
    id: '5',
    location: 'Verrekijker',
    title: 'Ontdekkingstocht',
    coverImage: '/images/gallery/bibliotheek-1.jpeg',
    images: [
      '/images/gallery/bibliotheek-1.jpeg',
      '/images/gallery/bibliotheek-7.jpeg'
    ],
    createdDate: '2023-11-01'
  },
  {
    id: '6',
    location: 'Algemeen',
    title: 'Schoolfeest 2023',
    coverImage: '/images/gallery/bibliotheek-11.jpeg',
    images: [
      '/images/gallery/bibliotheek-11.jpeg',
      '/images/gallery/bibliotheek-1.jpeg',
      '/images/gallery/bibliotheek-7.jpeg'
    ],
    createdDate: '2023-06-15',
    expiryDate: '2025-06-15' // Voorbeeld: vervalt na 2 jaar
  }
];

export const MOCK_TEAM: Teacher[] = [
  { id: '1', role: 'Directie', imageUrl: 'https://picsum.photos/400/400?random=20', group: 'Directie' },
  { id: '2', role: 'Juf 1e Kleuter', imageUrl: 'https://picsum.photos/400/400?random=21', group: 'Kleuter' },
  { id: '3', role: 'Meester 5e Leerjaar', imageUrl: 'https://picsum.photos/400/400?random=22', group: 'Lager' },
  { id: '4', role: 'Zorgcoördinator', imageUrl: 'https://picsum.photos/400/400?random=23', group: 'Zorg' },
];

export const MOCK_SUBMISSIONS: FormSubmission[] = [
  { id: '1', date: '2023-10-25', type: 'Contact', name: 'Jan Peeters', email: 'jan@test.be', details: 'Wanneer is de volgende info-avond?', status: 'Nieuw' },
  { id: '2', date: '2023-10-24', type: 'Inschrijving', name: 'Sarah de Boer', email: 'sarah@test.be', details: 'Graag rondleiding voor instap peuterklas', status: 'Gelezen' },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  { id: '0', sender: 'bot', text: 'Hallo! Ik ben de virtuele assistent van VBS Sint-Maarten. Heeft u een vraag over inschrijvingen, de kalender of praktische zaken?', timestamp: new Date() }
];