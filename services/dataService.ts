// ============ DATA SERVICE ============
// Handles data persistence via GitHub API for Vercel deployment
// This allows admin changes to be saved permanently and visible on all devices

const GITHUB_OWNER = 'alwaysbeentaylor';
const GITHUB_REPO = 'schooltest1';
const GITHUB_DATA_PATH = 'data/content.json';
const GITHUB_BRANCH = 'main';

// GitHub token should be set in Vercel environment variables
const getGitHubToken = () => {
  return import.meta.env.VITE_GITHUB_TOKEN || '';
};

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

// Fetch current data from GitHub
export const fetchDataFromGitHub = async (): Promise<SiteData | null> => {
  try {
    // Add cache-busting timestamp to URL to get fresh data
    const timestamp = Date.now();
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_DATA_PATH}?t=${timestamp}`;
    
    const response = await fetch(rawUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Data geladen van GitHub');
      return data;
    }
    
    console.warn('Could not fetch from raw URL');
    return null;
  } catch (error) {
    console.error('Error fetching data from GitHub:', error);
    return null;
  }
};

// Get file SHA (needed for updates)
const getFileSha = async (token: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }
    return null;
  } catch (error) {
    console.error('Error getting file SHA:', error);
    return null;
  }
};

// Save data to GitHub
export const saveDataToGitHub = async (data: SiteData): Promise<boolean> => {
  const token = getGitHubToken();
  
  if (!token) {
    console.warn('⚠️ Geen GitHub token gevonden. Data wordt alleen lokaal opgeslagen.');
    // Save to localStorage as fallback
    localStorage.setItem('adminData', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('adminDataUpdated'));
    return true;
  }
  
  try {
    // Get current file SHA
    const sha = await getFileSha(token);
    
    if (!sha) {
      console.error('Could not get file SHA');
      // Fallback to localStorage
      localStorage.setItem('adminData', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('adminDataUpdated'));
      return true;
    }
    
    // Encode content as base64
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    
    // Update file via GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Admin update: ${new Date().toLocaleString('nl-BE')}`,
          content: content,
          sha: sha,
          branch: GITHUB_BRANCH
        })
      }
    );
    
    if (response.ok) {
      console.log('✅ Data opgeslagen naar GitHub!');
      // Also save to localStorage as backup
      localStorage.setItem('adminData', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('adminDataUpdated'));
      return true;
    } else {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      // Fallback to localStorage
      localStorage.setItem('adminData', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('adminDataUpdated'));
      return true;
    }
  } catch (error) {
    console.error('Error saving to GitHub:', error);
    // Fallback to localStorage
    localStorage.setItem('adminData', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('adminDataUpdated'));
    return true;
  }
};

// Check if GitHub integration is available
export const isGitHubAvailable = (): boolean => {
  return !!getGitHubToken();
};

