// ============ DATA SERVICE ============
// Handles data persistence via Vercel KV (Redis) for instant updates
// No more waiting for rebuilds - changes are INSTANT!

export interface SiteData {
  config: {
    menuUrl: string;
    homeHeroImage: string;
    homeHeroPosition: string;
    homeTitle: string;
    homeSubtitle: string;
    aboutText: string;
    contactEmail: string;
    contactAddress: string;
    contactPhoneKloosterstraat: string;
    contactPhoneHovingenlaan: string;
    contactPhoneGSM: string;
  };
  heroImages: string[];
  news: any[];
  events: any[];
  albums: any[];
  team: any[];
  ouderwerkgroep: any[];
  submissions: any[];
  downloads: any[];
  enrollments: any[];
  pages: any[];
}

// Get the API URL based on environment
const getApiUrl = (): string => {
  // In production, use relative URL (same domain)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api/data';
    }
    // Production - use relative path
    return '/api/data';
  }
  return '/api/data';
};

// Fetch data from Vercel KV via API
export const fetchDataFromKV = async (): Promise<SiteData | null> => {
  try {
    const apiUrl = getApiUrl();
    console.log('🔄 Data laden van Vercel KV...');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Data geladen van Vercel KV!');
      return data;
    }
    
    console.warn('⚠️ KV response niet OK:', response.status);
    return null;
  } catch (error) {
    console.error('❌ Error fetching from KV:', error);
    return null;
  }
};

// Save data to Vercel KV via API
export const saveDataToKV = async (data: SiteData): Promise<boolean> => {
  try {
    const apiUrl = getApiUrl();
    console.log('💾 Data opslaan naar Vercel KV...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (response.ok) {
      console.log('✅ Data opgeslagen naar Vercel KV!');
      return true;
    }
    
    console.error('❌ KV save failed:', response.status);
    return false;
  } catch (error) {
    console.error('❌ Error saving to KV:', error);
    return false;
  }
};

// Check if KV API is available
export const isKVAvailable = async (): Promise<boolean> => {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(apiUrl, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
};

// Legacy exports for backward compatibility
export const fetchDataFromGitHub = fetchDataFromKV;
export const saveDataToGitHub = saveDataToKV;
export const isGitHubAvailable = (): boolean => true; // Always true now with KV
