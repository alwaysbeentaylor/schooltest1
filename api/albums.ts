import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATA_KEY = 'school_site_data';

// Upstash Redis REST API
const UPSTASH_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Helper function to call Upstash REST API
async function upstashRequest(command: string[]) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error('Upstash credentials not configured');
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

// Get all data from KV
async function getData() {
  const result = await upstashRequest(['GET', DATA_KEY]);
  if (!result.result) {
    return null;
  }
  return typeof result.result === 'string' ? JSON.parse(result.result) : result.result;
}

// Save data to KV
async function saveData(data: any) {
  await upstashRequest(['SET', DATA_KEY, JSON.stringify(data)]);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if Upstash is configured
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    return res.status(500).json({ 
      error: 'Database not configured',
      details: 'Missing KV_REST_API_URL and/or KV_REST_API_TOKEN environment variables.'
    });
  }

  try {
    if (req.method === 'DELETE') {
      // Delete image from album
      const { albumId, imageIndex } = req.query;
      
      if (!albumId || typeof albumId !== 'string') {
        return res.status(400).json({ error: 'Album ID is required' });
      }
      
      if (imageIndex === undefined || imageIndex === null) {
        return res.status(400).json({ error: 'Image index is required' });
      }
      
      const index = parseInt(imageIndex as string);
      if (isNaN(index)) {
        return res.status(400).json({ error: 'Invalid image index' });
      }
      
      // Get current data
      const data = await getData();
      if (!data || !data.albums) {
        return res.status(404).json({ error: 'Geen albums gevonden' });
      }
      
      // Find album
      const album = data.albums.find((a: any) => a.id === albumId);
      if (!album) {
        return res.status(404).json({ error: 'Album niet gevonden' });
      }
      
      // Check if image index is valid
      if (index < 0 || index >= album.images.length) {
        return res.status(404).json({ error: 'Foto niet gevonden in album' });
      }
      
      // Remove image from array
      album.images.splice(index, 1);
      
      // Update cover image if it was the deleted one
      if (album.coverImage === album.images[index] || (album.images.length > 0 && album.coverImage && !album.images.includes(album.coverImage))) {
        album.coverImage = album.images.length > 0 ? album.images[0] : null;
      }
      
      // Save back to KV
      await saveData(data);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Foto verwijderd!',
        album: album
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Album API Error:', error);
    return res.status(500).json({ 
      error: 'Database error', 
      details: String(error)
    });
  }
}

