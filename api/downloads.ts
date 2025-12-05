import type { VercelRequest, VercelResponse } from '@vercel/node';

const DATA_KEY = 'school_site_data';

// Upstash Redis REST API
const UPSTASH_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.VITE_CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.VITE_CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_UPLOAD_PRESET = process.env.VITE_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET;

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

// Upload file to Cloudinary
async function uploadToCloudinary(file: File | Buffer, filename: string): Promise<string> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured');
  }

  const formData = new FormData();
  
  // Convert Buffer to Blob if needed
  if (Buffer.isBuffer(file)) {
    const blob = new Blob([file]);
    formData.append('file', blob, filename);
  } else {
    formData.append('file', file);
  }
  
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'school-documents');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  const data = await response.json();
  return data.secure_url;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
    if (req.method === 'GET') {
      // Check if this is a download request (has 'download' query param)
      if (req.query.download === 'true' && req.query.id) {
        const { id } = req.query;
        
        // Get current data
        const data = await getData();
        if (!data || !data.downloads) {
          return res.status(404).json({ error: 'Geen downloads gevonden' });
        }
        
        // Find download
        const download = data.downloads.find((d: any) => d.id === id);
        if (!download) {
          return res.status(404).json({ error: 'Download niet gevonden' });
        }
        
        // If it's a Cloudinary URL, redirect to it
        if (download.filename && (download.filename.startsWith('http://') || download.filename.startsWith('https://'))) {
          return res.redirect(302, download.filename);
        }
        
        // If it's a local path (old format), return error
        return res.status(404).json({ 
          error: 'Bestand niet beschikbaar',
          details: 'Dit bestand is niet geüpload naar Cloudinary. Upload het opnieuw.'
        });
      }
      
      // Get all downloads
      const data = await getData();
      if (!data) {
        return res.status(200).json({ downloads: [] });
      }
      return res.status(200).json({ downloads: data.downloads || [] });
    }

    if (req.method === 'POST') {
      // Add new download - expects multipart/form-data with 'document' file and 'title' field
      // Note: Vercel serverless functions have limitations with file uploads
      // For now, we'll expect the file to be uploaded to Cloudinary on the client side
      // and just save the URL to KV
      
      const { title, fileUrl, originalName } = req.body;
      
      if (!title || !fileUrl) {
        return res.status(400).json({ error: 'Title and fileUrl are required' });
      }
      
      // Get current data
      const data = await getData();
      if (!data.downloads) {
        data.downloads = [];
      }
      
      const newDownload = {
        id: Date.now().toString(),
        title,
        filename: fileUrl, // Store Cloudinary URL (should be https://res.cloudinary.com/...)
        originalName: originalName || title,
        uploadDate: new Date().toISOString().split('T')[0]
      };
      
      console.log('Saving download:', newDownload);
      
      data.downloads.unshift(newDownload);
      
      // Save back to KV
      await saveData(data);
      
      return res.status(200).json({ 
        success: true, 
        item: newDownload,
        message: 'Document opgeslagen!' 
      });
    }

    if (req.method === 'DELETE') {
      // Delete download by ID
      const { id } = req.query;
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Download ID is required' });
      }
      
      // Get current data
      const data = await getData();
      if (!data || !data.downloads) {
        return res.status(404).json({ error: 'Geen downloads gevonden' });
      }
      
      // Find and remove download
      const index = data.downloads.findIndex((d: any) => d.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Download niet gevonden' });
      }
      
      data.downloads.splice(index, 1);
      
      // Save back to KV
      await saveData(data);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Download verwijderd!' 
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Downloads API Error:', error);
    return res.status(500).json({ 
      error: 'Database error', 
      details: String(error)
    });
  }
}

