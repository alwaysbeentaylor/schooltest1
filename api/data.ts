import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATA_KEY = 'school_site_data';

// Note: After adding environment variables in Vercel, trigger a new deployment

// Upstash Redis REST API
const UPSTASH_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

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

// Helper function to call Upstash REST API
async function upstashRequest(command: string[]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error('Upstash credentials not configured. Please add KV_REST_API_URL and KV_REST_API_TOKEN to your Vercel environment variables.');
  }

  const response = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upstash error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if Upstash is configured
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ 
      error: 'Database not configured',
      details: 'Missing KV_REST_API_URL and/or KV_REST_API_TOKEN environment variables. Please connect your Upstash database in Vercel dashboard.',
      configured: {
        hasUrl: !!UPSTASH_URL,
        hasToken: !!UPSTASH_TOKEN
      }
    });
  }

  try {
    if (req.method === 'GET') {
      // Get data from Upstash
      const result = await upstashRequest(['GET', DATA_KEY]);
      
      if (!result.result) {
        // Initialize with default data if not exists
        await upstashRequest(['SET', DATA_KEY, JSON.stringify(defaultData)]);
        return res.status(200).json(defaultData);
      }
      
      // Parse the stored JSON
      const data = typeof result.result === 'string' ? JSON.parse(result.result) : result.result;
      return res.status(200).json(data);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Save data to Upstash
      const newData = req.body;
      await upstashRequest(['SET', DATA_KEY, JSON.stringify(newData)]);
      
      return res.status(200).json({ success: true, message: 'Data opgeslagen!' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({ 
      error: 'Database error', 
      details: String(error),
      hint: 'Make sure your Upstash KV database is properly connected in Vercel dashboard'
    });
  }
}
