import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATA_KEY = 'school_site_data';

// Default data structure
const defaultData = {
  config: {
    menuUrl: 'https://order.hanssens.be/menu/O56/OUDE-VESTIGING',
    homeHeroImage: '/images/hero/school-main.jpeg',
    homeHeroPosition: 'center center',
    homeTitle: 'Samen groeien,\nelk op zijn eigen ritme',
    homeSubtitle: 'Vrije Basisschool Sijsele',
    aboutText: 'In VBS Sint-Maarten staat het kind centraal.',
    contactEmail: 'info@vrijebasisschoolsijsele.be',
    contactAddress: 'Kloosterstraat 4a, 8340 Sijsele',
    contactPhoneKloosterstraat: '050 36 32 25',
    contactPhoneHovingenlaan: '050 36 09 71',
    contactPhoneGSM: '0496 23 57 01'
  },
  heroImages: [
    '/images/hero/school-main.jpeg',
    '/images/hero/school-building.jpeg',
    '/images/hero/school-kids.jpeg'
  ],
  news: [],
  events: [],
  albums: [],
  team: [],
  ouderwerkgroep: [],
  submissions: [],
  downloads: [],
  enrollments: [],
  pages: [
    { id: 'home', name: 'Home', slug: 'home', active: true, order: 0, type: 'system' },
    { id: 'about', name: 'Onze School', slug: 'about', active: true, order: 1, type: 'system' },
    { id: 'enroll', name: 'Inschrijven', slug: 'enroll', active: true, order: 2, type: 'system' },
    { id: 'news', name: 'Nieuws', slug: 'news', active: true, order: 3, type: 'system' },
    { id: 'calendar', name: 'Agenda', slug: 'calendar', active: true, order: 4, type: 'system' },
    { id: 'info', name: 'Info', slug: 'info', active: true, order: 5, type: 'system' },
    { id: 'ouderwerkgroep', name: 'Ouderwerkgroep', slug: 'ouderwerkgroep', active: true, order: 6, type: 'system' },
    { id: 'gallery', name: "Foto's", slug: 'gallery', active: true, order: 7, type: 'system' },
    { id: 'contact', name: 'Contact', slug: 'contact', active: true, order: 8, type: 'system' },
  ]
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get data from KV
      let data = await kv.get(DATA_KEY);
      
      if (!data) {
        // Initialize with default data if not exists
        await kv.set(DATA_KEY, defaultData);
        data = defaultData;
      }
      
      return res.status(200).json(data);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Save data to KV
      const newData = req.body;
      await kv.set(DATA_KEY, newData);
      
      return res.status(200).json({ success: true, message: 'Data opgeslagen!' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('KV Error:', error);
    return res.status(500).json({ error: 'Database error', details: String(error) });
  }
}

