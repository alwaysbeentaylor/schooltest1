import React, { useState, useEffect, useRef } from 'react';
import {
  Lock, Home, FileText, Calendar, Camera, Users, Heart, Settings,
  Inbox, Plus, Trash2, Edit, Save, X, Upload, Sparkles, Eye,
  ChevronRight, Image as ImageIcon, Star, Bell, TrendingUp,
  Palette, Layout, Mail, Phone, MapPin, ExternalLink, Check,
  AlertCircle, Loader2, Grid, List, Clock, Tag, Menu, Power,
  ToggleLeft, ToggleRight, GripVertical, FileEdit
} from 'lucide-react';
import { generateNewsContent } from './services/geminiService';

const API_BASE = 'http://localhost:3001/api';

// Types
interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  expiryDate?: string;
  imageUrl: string;
  category: 'Algemeen' | 'Kleuter' | 'Lager';
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'Vakantie' | 'Activiteit' | 'Vrije Dag';
  grades: string[];
  description?: string;
}

interface PhotoAlbum {
  id: string;
  location: 'Verrekijker' | 'Kleuter Klooster' | 'Lager' | 'Algemeen';
  title: string;
  coverImage: string;
  images: string[];
  expiryDate?: string;
  createdDate?: string;
}

interface TeamMember {
  id: string;
  role: string;
  imageUrl: string;
  group: string;
}

interface OuderwerkgroepActivity {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface FormSubmission {
  id: string;
  date: string;
  type: string;
  name: string;
  email?: string;
  details: string;
  status: 'Nieuw' | 'Gelezen';
}

interface SiteConfig {
  menuUrl: string;
  homeHeroImage: string;
  homeHeroPosition: string;
  homeTitle: string;
  homeSubtitle: string;
  aboutText: string;
  contactEmail: string;
}

interface PageConfig {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  order: number;
  type: 'system' | 'custom';
}

// School Colors - Green, Red, White
const SCHOOL_COLORS = {
  green: {
    gradient: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700',
    light: 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200',
    text: 'text-emerald-600',
    bg: 'bg-emerald-500',
  },
  red: {
    gradient: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700',
    light: 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200',
    text: 'text-red-600',
    bg: 'bg-red-500',
  },
  white: {
    gradient: 'bg-white hover:bg-gray-50',
    light: 'bg-white border-gray-200',
    text: 'text-gray-700',
    bg: 'bg-white',
  }
};

// Colorful Button Component with School Colors
const ColorButton = ({ 
  children, 
  onClick, 
  color = 'green', 
  size = 'md',
  disabled = false,
  icon,
  className = ''
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color?: 'green' | 'red' | 'white' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}) => {
  const colors = {
    green: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-200 text-white',
    red: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-200 text-white',
    white: 'bg-white hover:bg-gray-50 shadow-gray-200 text-gray-700 border border-gray-200',
    gray: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-gray-200 text-white',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colors[color]} ${sizes[size]} font-bold rounded-xl shadow-lg 
        transform transition-all duration-200 hover:scale-105 hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center gap-2 justify-center ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

// Colorful Card Component with School Colors
const ColorCard = ({ 
  children, 
  color = 'white',
  className = '',
  onClick
}: {
  children: React.ReactNode;
  color?: 'white' | 'green' | 'red' | 'gray';
  className?: string;
  onClick?: () => void;
}) => {
  const colors = {
    white: 'bg-white border-gray-100',
    green: 'bg-gradient-to-br from-emerald-50 to-green-100 border-emerald-200',
    red: 'bg-gradient-to-br from-red-50 to-rose-100 border-red-200',
    gray: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200',
  };

  return (
    <div 
      onClick={onClick}
      className={`${colors[color]} rounded-2xl border-2 shadow-lg p-4 md:p-6 
        ${onClick ? 'cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
};

// Stats Card for Dashboard with School Colors
const StatsCard = ({ 
  icon, 
  label, 
  value, 
  color,
  trend
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'green' | 'red' | 'gray';
  trend?: string;
}) => {
  const colors = {
    green: 'from-emerald-500 to-green-600',
    red: 'from-red-500 to-rose-600',
    gray: 'from-gray-500 to-gray-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border-2 border-gray-100 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-r ${colors[color]} p-3 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
            <TrendingUp size={14} />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-gray-500 font-medium text-sm md:text-base">{label}</p>
    </div>
  );
};

// Image Upload Component
const ImageUploader = ({
  onUpload,
  currentImage,
  category = 'gallery',
  multiple = false,
  label = 'Upload Foto'
}: {
  onUpload: (paths: string[]) => void;
  currentImage?: string;
  category?: string;
  multiple?: boolean;
  label?: string;
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const uploadedPaths: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('image', files[i]);

      try {
        const response = await fetch(`${API_BASE}/upload/${category}`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.success) {
          uploadedPaths.push(data.path);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploading(false);
    if (uploadedPaths.length > 0) {
      onUpload(uploadedPaths);
    }
  };

  return (
    <div
      className={`relative border-3 border-dashed rounded-2xl p-4 md:p-8 text-center transition-all duration-200
        ${dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'}
        ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      
      {currentImage && !multiple ? (
        <div className="relative">
          <img src={currentImage} alt="Preview" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl mx-auto mb-4 shadow-lg" />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute top-0 right-1/2 translate-x-12 md:translate-x-16 -translate-y-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:bg-emerald-600"
          >
            <Edit size={14} />
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current?.click()} className="cursor-pointer">
          {uploading ? (
            <Loader2 size={48} className="mx-auto text-emerald-500 animate-spin mb-4" />
          ) : (
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Upload size={24} className="text-white" />
            </div>
          )}
          <p className="font-bold text-gray-700 text-base md:text-lg mb-2">{label}</p>
          <p className="text-gray-500 text-xs md:text-sm">Sleep foto's hierheen of klik om te selecteren</p>
        </div>
      )}
    </div>
  );
};

// Modal Component - Mobile Responsive
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  color = 'green'
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  color?: 'green' | 'red';
}) => {
  if (!isOpen) return null;

  const colors = {
    green: 'from-emerald-500 to-green-600',
    red: 'from-red-500 to-rose-600',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-hidden">
        <div className={`bg-gradient-to-r ${colors[color]} p-4 md:p-6 text-white flex justify-between items-center`}>
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-80px)] md:max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Toast notification
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 px-4 md:px-6 py-3 md:py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up
      ${type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} text-white`}>
      {type === 'success' ? <Check size={24} /> : <AlertCircle size={24} />}
      <span className="font-bold text-sm md:text-base">{message}</span>
    </div>
  );
};

// Default Pages Configuration
const DEFAULT_PAGES: PageConfig[] = [
  { id: 'home', name: 'Home', slug: 'home', active: true, order: 0, type: 'system' },
  { id: 'about', name: 'Over Ons', slug: 'about', active: true, order: 1, type: 'system' },
  { id: 'enroll', name: 'Inschrijven', slug: 'enroll', active: true, order: 2, type: 'system' },
  { id: 'team', name: 'Team', slug: 'team', active: true, order: 3, type: 'system' },
  { id: 'news', name: 'Nieuws', slug: 'news', active: true, order: 4, type: 'system' },
  { id: 'calendar', name: 'Agenda', slug: 'calendar', active: true, order: 5, type: 'system' },
  { id: 'info', name: 'Info', slug: 'info', active: true, order: 6, type: 'system' },
  { id: 'ouderwerkgroep', name: 'Ouderwerkgroep', slug: 'ouderwerkgroep', active: true, order: 7, type: 'system' },
  { id: 'gallery', name: "Foto's", slug: 'gallery', active: true, order: 8, type: 'system' },
  { id: 'contact', name: 'Contact', slug: 'contact', active: true, order: 9, type: 'system' },
];

// Main Admin Panel Component
export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [ouderwerkgroep, setOuderwerkgroep] = useState<OuderwerkgroepActivity[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [pages, setPages] = useState<PageConfig[]>(DEFAULT_PAGES);

  // Modal states
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showOuderwerkgroepModal, setShowOuderwerkgroepModal] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageConfig | null>(null);

  // Form states
  const [newsForm, setNewsForm] = useState({ title: '', content: '', date: '', expiryDate: '', imageUrl: '', category: 'Algemeen' as const });
  const [eventForm, setEventForm] = useState({ title: '', date: '', type: 'Activiteit' as const, description: '' });
  const [albumForm, setAlbumForm] = useState({ title: '', location: 'Algemeen' as const, expiryDate: '' });
  const [teamForm, setTeamForm] = useState({ role: '', imageUrl: '', group: 'Kleuter' });
  const [ouderwerkgroepForm, setOuderwerkgroepForm] = useState({ title: '', description: '', image: '' });
  const [pageForm, setPageForm] = useState({ name: '', slug: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/data`);
      const data = await response.json();
      setConfig(data.config);
      setHeroImages(data.heroImages || []);
      setNews(data.news || []);
      setEvents(data.events || []);
      setAlbums(data.albums || []);
      setTeam(data.team || []);
      setOuderwerkgroep(data.ouderwerkgroep || []);
      setSubmissions(data.submissions || []);
      if (data.pages) setPages(data.pages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      showToast('Kon data niet laden. Is de server gestart?', 'error');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // API handlers
  const handleSaveConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (response.ok) {
        showToast('Instellingen opgeslagen! 🎉', 'success');
      }
    } catch (error) {
      showToast('Fout bij opslaan', 'error');
    }
  };

  const handleSavePages = async () => {
    try {
      const response = await fetch(`${API_BASE}/pages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pages)
      });
      if (response.ok) {
        showToast('Pagina\'s opgeslagen! 🎉', 'success');
      }
    } catch (error) {
      // Fallback - save locally
      localStorage.setItem('pages', JSON.stringify(pages));
      showToast('Pagina\'s lokaal opgeslagen!', 'success');
    }
  };

  const handleTogglePage = (pageId: string) => {
    setPages(pages.map(p => p.id === pageId ? { ...p, active: !p.active } : p));
  };

  const handleEditPage = (page: PageConfig) => {
    setEditingPage(page);
    setPageForm({ name: page.name, slug: page.slug });
    setShowPageModal(true);
  };

  const handleSavePageEdit = () => {
    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? { ...p, name: pageForm.name, slug: pageForm.slug } : p));
      setShowPageModal(false);
      setEditingPage(null);
      showToast('Pagina bijgewerkt!', 'success');
    }
  };

  const handleAddPage = () => {
    const newPage: PageConfig = {
      id: `custom-${Date.now()}`,
      name: pageForm.name,
      slug: pageForm.slug.toLowerCase().replace(/\s+/g, '-'),
      active: true,
      order: pages.length,
      type: 'custom'
    };
    setPages([...pages, newPage]);
    setShowPageModal(false);
    setPageForm({ name: '', slug: '' });
    showToast('Nieuwe pagina toegevoegd!', 'success');
  };

  const handleDeletePage = (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (page?.type === 'system') {
      showToast('Systeempagina\'s kunnen niet verwijderd worden', 'error');
      return;
    }
    if (confirm('Weet je zeker dat je deze pagina wilt verwijderen?')) {
      setPages(pages.filter(p => p.id !== pageId));
      showToast('Pagina verwijderd!', 'success');
    }
  };

  const handleAddNews = async () => {
    try {
      const response = await fetch(`${API_BASE}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsForm)
      });
      const data = await response.json();
      if (data.success) {
        setNews([data.item, ...news]);
        setShowNewsModal(false);
        setNewsForm({ title: '', content: '', date: '', expiryDate: '', imageUrl: '', category: 'Algemeen' });
        showToast('Nieuws toegevoegd! 📰', 'success');
      }
    } catch (error) {
      showToast('Fout bij toevoegen nieuws', 'error');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;
    try {
      const response = await fetch(`${API_BASE}/news/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNews(news.filter(n => n.id !== id));
        showToast('Nieuws verwijderd! 🗑️', 'success');
      }
    } catch (error) {
      showToast('Fout bij verwijderen', 'error');
    }
  };

  const handleAddEvent = async () => {
    try {
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventForm, grades: ['All'] })
      });
      const data = await response.json();
      if (data.success) {
        setEvents([...events, data.item]);
        setShowEventModal(false);
        setEventForm({ title: '', date: '', type: 'Activiteit', description: '' });
        showToast('Evenement toegevoegd! 📅', 'success');
      }
    } catch (error) {
      showToast('Fout bij toevoegen evenement', 'error');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;
    try {
      const response = await fetch(`${API_BASE}/events/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setEvents(events.filter(e => e.id !== id));
        showToast('Evenement verwijderd! 🗑️', 'success');
      }
    } catch (error) {
      showToast('Fout bij verwijderen', 'error');
    }
  };

  const handleAddAlbum = async () => {
    try {
      const response = await fetch(`${API_BASE}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(albumForm)
      });
      const data = await response.json();
      if (data.success) {
        setAlbums([...albums, data.item]);
        setShowAlbumModal(false);
        setAlbumForm({ title: '', location: 'Algemeen', expiryDate: '' });
        showToast('Album aangemaakt! 📸', 'success');
      }
    } catch (error) {
      showToast('Fout bij aanmaken album', 'error');
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit album wilt verwijderen? Alle foto\'s worden ook verwijderd!')) return;
    try {
      const response = await fetch(`${API_BASE}/albums/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAlbums(albums.filter(a => a.id !== id));
        showToast('Album verwijderd! 🗑️', 'success');
      }
    } catch (error) {
      showToast('Fout bij verwijderen', 'error');
    }
  };

  const handleUploadToAlbum = async (albumId: string, files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    try {
      const response = await fetch(`${API_BASE}/albums/${albumId}/images`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
        showToast(`${data.images.length} foto's toegevoegd! 📸`, 'success');
      }
    } catch (error) {
      showToast('Fout bij uploaden', 'error');
    }
  };

  const handleAddTeamMember = async () => {
    try {
      const response = await fetch(`${API_BASE}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });
      const data = await response.json();
      if (data.success) {
        setTeam([...team, data.item]);
        setShowTeamModal(false);
        setTeamForm({ role: '', imageUrl: '', group: 'Kleuter' });
        showToast('Teamlid toegevoegd! 👥', 'success');
      }
    } catch (error) {
      showToast('Fout bij toevoegen', 'error');
    }
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit teamlid wilt verwijderen?')) return;
    try {
      const response = await fetch(`${API_BASE}/team/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTeam(team.filter(t => t.id !== id));
        showToast('Teamlid verwijderd! 🗑️', 'success');
      }
    } catch (error) {
      showToast('Fout bij verwijderen', 'error');
    }
  };

  const handleAddOuderwerkgroepActivity = async () => {
    try {
      const response = await fetch(`${API_BASE}/ouderwerkgroep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ouderwerkgroepForm)
      });
      const data = await response.json();
      if (data.success) {
        setOuderwerkgroep([...ouderwerkgroep, data.item]);
        setShowOuderwerkgroepModal(false);
        setOuderwerkgroepForm({ title: '', description: '', image: '' });
        showToast('Activiteit toegevoegd! 🎉', 'success');
      }
    } catch (error) {
      showToast('Fout bij toevoegen', 'error');
    }
  };

  const handleDeleteOuderwerkgroepActivity = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze activiteit wilt verwijderen?')) return;
    try {
      const response = await fetch(`${API_BASE}/ouderwerkgroep/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setOuderwerkgroep(ouderwerkgroep.filter(o => o.id !== id));
        showToast('Activiteit verwijderd! 🗑️', 'success');
      }
    } catch (error) {
      showToast('Fout bij verwijderen', 'error');
    }
  };

  const handleMarkSubmissionRead = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Gelezen' })
      });
      if (response.ok) {
        setSubmissions(submissions.map(s => s.id === id ? { ...s, status: 'Gelezen' } : s));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAIWrite = async () => {
    if (!newsForm.title) {
      showToast('Vul eerst een titel in!', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      const text = await generateNewsContent(newsForm.title);
      setNewsForm({ ...newsForm, content: text });
      showToast('AI heeft de tekst geschreven! ✨', 'success');
    } catch (error) {
      showToast('AI kon geen tekst genereren', 'error');
    }
    setIsGenerating(false);
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-600 to-red-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 max-w-md w-full text-center">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock size={36} className="text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Welkom! 👋</h1>
          <p className="text-gray-500 mb-8">Log in om de website te beheren</p>
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (password === 'admin' ? setIsAuthenticated(true) : showToast('Fout wachtwoord!', 'error'))}
            className="w-full p-3 md:p-4 text-lg border-2 border-gray-200 rounded-xl mb-4 focus:border-emerald-500 focus:outline-none transition"
            placeholder="Wachtwoord..."
          />
          
          <ColorButton
            color="green"
            size="lg"
            className="w-full"
            onClick={() => password === 'admin' ? setIsAuthenticated(true) : showToast('Fout wachtwoord! (hint: admin)', 'error')}
            icon={<ChevronRight size={24} />}
          >
            Inloggen
          </ColorButton>
          
          <p className="text-xs text-gray-400 mt-6">Tip: het wachtwoord is "admin"</p>
        </div>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-green-600 to-red-500 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 size={64} className="animate-spin mx-auto mb-4" />
          <p className="text-2xl font-bold">Laden...</p>
        </div>
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', icon: <Home size={22} />, label: 'Dashboard', color: 'from-emerald-500 to-green-600' },
    { id: 'news', icon: <FileText size={22} />, label: 'Nieuws', color: 'from-emerald-500 to-green-600' },
    { id: 'calendar', icon: <Calendar size={22} />, label: 'Kalender', color: 'from-red-500 to-rose-600' },
    { id: 'gallery', icon: <Camera size={22} />, label: 'Foto\'s', color: 'from-emerald-500 to-green-600' },
    { id: 'team', icon: <Users size={22} />, label: 'Team', color: 'from-red-500 to-rose-600' },
    { id: 'ouderwerkgroep', icon: <Heart size={22} />, label: 'Ouderwerkgroep', color: 'from-red-500 to-rose-600' },
    { id: 'pages', icon: <Layout size={22} />, label: 'Pagina\'s', color: 'from-emerald-500 to-green-600' },
    { id: 'settings', icon: <Settings size={22} />, label: 'Instellingen', color: 'from-gray-500 to-gray-600' },
    { id: 'inbox', icon: <Inbox size={22} />, label: 'Inbox', color: 'from-red-500 to-rose-600', badge: submissions.filter(s => s.status === 'Nieuw').length },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 via-green-600 to-red-500 text-white p-4 z-50 flex justify-between items-center shadow-lg">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/20 rounded-lg">
          <Menu size={24} />
        </button>
        <h1 className="text-lg font-bold">🎨 Schoolbeheer</h1>
        <button onClick={() => setIsAuthenticated(false)} className="p-2 hover:bg-white/20 rounded-lg">
          <Power size={20} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 md:w-72 bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 md:p-6 bg-gradient-to-r from-emerald-500 via-green-600 to-red-500 text-white">
          <h1 className="text-xl md:text-2xl font-bold mb-1">🎨 Schoolbeheer</h1>
          <p className="text-white/80 text-sm">VBS Sint-Maarten</p>
        </div>
        
        <nav className="p-3 md:p-4 space-y-1 md:space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl font-medium transition-all duration-200
                ${activeTab === item.id 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {item.icon}
              <span className="flex-1 text-left text-sm md:text-base">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-bold
                  ${activeTab === item.id ? 'bg-white/30' : 'bg-red-500 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div className="hidden lg:block p-4 border-t border-gray-100 mt-4">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center justify-center gap-2 p-3 text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl transition font-bold shadow-lg"
          >
            <Power size={20} />
            <span>Uitloggen</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 md:space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">Goedendag! 👋</h2>
              <p className="text-gray-500 text-base md:text-lg">Hier is een overzicht van je school website</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              <StatsCard icon={<FileText size={24} />} label="Nieuwsberichten" value={news.length} color="green" />
              <StatsCard icon={<Calendar size={24} />} label="Evenementen" value={events.length} color="red" />
              <StatsCard icon={<Camera size={24} />} label="Foto Albums" value={albums.length} color="green" />
              <StatsCard icon={<Inbox size={24} />} label="Nieuwe Berichten" value={submissions.filter(s => s.status === 'Nieuw').length} color="red" />
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Snelle Acties ⚡</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <ColorCard color="green" onClick={() => { setActiveTab('news'); setShowNewsModal(true); }}>
                  <div className="text-center">
                    <Plus size={28} className="mx-auto mb-2 text-emerald-600" />
                    <p className="font-bold text-emerald-800 text-sm md:text-base">Nieuws Toevoegen</p>
                  </div>
                </ColorCard>
                <ColorCard color="red" onClick={() => { setActiveTab('calendar'); setShowEventModal(true); }}>
                  <div className="text-center">
                    <Calendar size={28} className="mx-auto mb-2 text-red-600" />
                    <p className="font-bold text-red-800 text-sm md:text-base">Evenement Plannen</p>
                  </div>
                </ColorCard>
                <ColorCard color="green" onClick={() => { setActiveTab('gallery'); setShowAlbumModal(true); }}>
                  <div className="text-center">
                    <Camera size={28} className="mx-auto mb-2 text-emerald-600" />
                    <p className="font-bold text-emerald-800 text-sm md:text-base">Album Maken</p>
                  </div>
                </ColorCard>
                <ColorCard color="red" onClick={() => setActiveTab('inbox')}>
                  <div className="text-center">
                    <Mail size={28} className="mx-auto mb-2 text-red-600" />
                    <p className="font-bold text-red-800 text-sm md:text-base">Berichten Bekijken</p>
                  </div>
                </ColorCard>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <ColorCard>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="text-emerald-500" /> Laatste Nieuws
                </h3>
                <div className="space-y-3">
                  {news.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <img src={item.imageUrl} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate text-sm md:text-base">{item.title}</p>
                        <p className="text-xs md:text-sm text-gray-500">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ColorCard>

              <ColorCard>
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-red-500" /> Komende Evenementen
                </h3>
                <div className="space-y-3">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`p-2 md:p-3 rounded-xl ${
                        event.type === 'Vakantie' ? 'bg-emerald-100 text-emerald-600' :
                        event.type === 'Activiteit' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        <Calendar size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800 text-sm md:text-base">{event.title}</p>
                        <p className="text-xs md:text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ColorCard>
            </div>
          </div>
        )}

        {/* News Section */}
        {activeTab === 'news' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📰 Nieuws Beheer</h2>
                <p className="text-gray-500 text-sm md:text-base">Maak en beheer nieuwsberichten</p>
              </div>
              <ColorButton color="green" icon={<Plus size={20} />} onClick={() => setShowNewsModal(true)}>
                Nieuw Bericht
              </ColorButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {news.map((item) => (
                <ColorCard key={item.id} className="group">
                  <div className="relative mb-4">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-32 md:h-40 object-cover rounded-xl" />
                    <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold
                      ${item.category === 'Algemeen' ? 'bg-emerald-500' : item.category === 'Kleuter' ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{item.content}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={14} /> {item.date}
                    </span>
                    <button onClick={() => handleDeleteNews(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </ColorCard>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Section */}
        {activeTab === 'calendar' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📅 Kalender Beheer</h2>
                <p className="text-gray-500 text-sm md:text-base">Plan evenementen en activiteiten</p>
              </div>
              <ColorButton color="red" icon={<Plus size={20} />} onClick={() => setShowEventModal(true)}>
                Nieuw Evenement
              </ColorButton>
            </div>

            <ColorCard>
              <div className="space-y-3 md:space-y-4">
                {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                    <div className={`p-2 md:p-4 rounded-xl text-white font-bold text-center min-w-[50px] md:min-w-[70px]
                      ${event.type === 'Vakantie' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                        event.type === 'Activiteit' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                        'bg-gradient-to-br from-gray-500 to-gray-600'}`}>
                      <div className="text-lg md:text-2xl">{new Date(event.date).getDate()}</div>
                      <div className="text-xs uppercase">{new Date(event.date).toLocaleDateString('nl-BE', { month: 'short' })}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base md:text-lg truncate">{event.title}</h3>
                      <p className="text-gray-500 text-xs md:text-sm truncate">{event.description}</p>
                      <span className={`inline-block mt-1 md:mt-2 px-2 md:px-3 py-1 rounded-full text-xs font-bold
                        ${event.type === 'Vakantie' ? 'bg-emerald-100 text-emerald-700' :
                          event.type === 'Activiteit' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'}`}>
                        {event.type}
                      </span>
                    </div>
                    <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </ColorCard>
          </div>
        )}

        {/* Gallery Section */}
        {activeTab === 'gallery' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📸 Foto Galerij</h2>
                <p className="text-gray-500 text-sm md:text-base">Beheer foto albums</p>
              </div>
              <ColorButton color="green" icon={<Plus size={20} />} onClick={() => setShowAlbumModal(true)}>
                Nieuw Album
              </ColorButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {albums.map((album) => (
                <ColorCard key={album.id} className="group">
                  <div className="relative mb-4">
                    {album.coverImage ? (
                      <img src={album.coverImage} alt={album.title} className="w-full h-36 md:h-48 object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-36 md:h-48 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                        <Camera size={48} className="text-emerald-300" />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-700">
                      {album.images.length} foto's
                    </span>
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-800 mb-1">{album.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{album.location}</p>
                  
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 md:p-4 text-center hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer mb-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id={`upload-${album.id}`}
                      onChange={(e) => e.target.files && handleUploadToAlbum(album.id, e.target.files)}
                    />
                    <label htmlFor={`upload-${album.id}`} className="cursor-pointer">
                      <Upload size={20} className="mx-auto text-emerald-400 mb-2" />
                      <p className="text-xs md:text-sm text-gray-500">Foto's toevoegen</p>
                    </label>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{album.createdDate}</span>
                    <button onClick={() => handleDeleteAlbum(album.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </ColorCard>
              ))}
            </div>
          </div>
        )}

        {/* Team Section */}
        {activeTab === 'team' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">👥 Team Beheer</h2>
                <p className="text-gray-500 text-sm md:text-base">Beheer teamleden</p>
              </div>
              <ColorButton color="red" icon={<Plus size={20} />} onClick={() => setShowTeamModal(true)}>
                Nieuw Teamlid
              </ColorButton>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {team.map((member) => (
                <ColorCard key={member.id} className="group text-center">
                  <div className="relative mb-4">
                    <img src={member.imageUrl} alt={member.role} className="w-20 h-20 md:w-32 md:h-32 object-cover rounded-full mx-auto shadow-lg" />
                    <button onClick={() => handleDeleteTeamMember(member.id)} className="absolute top-0 right-1/2 translate-x-10 md:translate-x-16 p-1 md:p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm md:text-base">{member.role}</h3>
                  <span className="inline-block mt-2 px-2 md:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                    {member.group}
                  </span>
                </ColorCard>
              ))}
            </div>
          </div>
        )}

        {/* Ouderwerkgroep Section */}
        {activeTab === 'ouderwerkgroep' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">💖 Ouderwerkgroep</h2>
                <p className="text-gray-500 text-sm md:text-base">Beheer activiteiten van de ouderwerkgroep</p>
              </div>
              <ColorButton color="red" icon={<Plus size={20} />} onClick={() => setShowOuderwerkgroepModal(true)}>
                Nieuwe Activiteit
              </ColorButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {ouderwerkgroep.map((activity) => (
                <ColorCard key={activity.id} className="group">
                  <div className="relative mb-4">
                    <img src={activity.image} alt={activity.title} className="w-full h-32 md:h-40 object-cover rounded-xl" />
                  </div>
                  <h3 className="font-bold text-base md:text-lg text-gray-800 mb-2">{activity.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{activity.description}</p>
                  <div className="flex justify-end">
                    <button onClick={() => handleDeleteOuderwerkgroepActivity(activity.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </ColorCard>
              ))}
            </div>
          </div>
        )}

        {/* Pages Management Section */}
        {activeTab === 'pages' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📄 Pagina Beheer</h2>
                <p className="text-gray-500 text-sm md:text-base">Activeer, deactiveer of wijzig pagina's</p>
              </div>
              <div className="flex gap-2">
                <ColorButton color="green" icon={<Plus size={20} />} onClick={() => { setEditingPage(null); setPageForm({ name: '', slug: '' }); setShowPageModal(true); }}>
                  Nieuwe Pagina
                </ColorButton>
                <ColorButton color="white" icon={<Save size={20} />} onClick={handleSavePages}>
                  Opslaan
                </ColorButton>
              </div>
            </div>

            <ColorCard>
              <div className="space-y-2 md:space-y-3">
                {pages.sort((a, b) => a.order - b.order).map((page) => (
                  <div key={page.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                    <div className="text-gray-400 cursor-move">
                      <GripVertical size={20} />
                    </div>
                    
                    <button
                      onClick={() => handleTogglePage(page.id)}
                      className={`p-2 rounded-lg transition ${page.active ? 'text-emerald-500 bg-emerald-100' : 'text-gray-400 bg-gray-200'}`}
                    >
                      {page.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm md:text-base">{page.name}</h3>
                      <p className="text-xs text-gray-500">/{page.slug}</p>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      page.type === 'system' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {page.type === 'system' ? 'Systeem' : 'Aangepast'}
                    </span>
                    
                    <div className="flex gap-1 md:gap-2">
                      <button 
                        onClick={() => handleEditPage(page)} 
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition"
                      >
                        <FileEdit size={18} />
                      </button>
                      {page.type === 'custom' && (
                        <button 
                          onClick={() => handleDeletePage(page.id)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ColorCard>

            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl">
              <h4 className="font-bold text-emerald-800 mb-2">💡 Tips</h4>
              <ul className="text-sm text-emerald-700 space-y-1">
                <li>• Klik op de toggle om een pagina te activeren/deactiveren</li>
                <li>• Gedeactiveerde pagina's verschijnen niet in het menu</li>
                <li>• Systeempagina's kunnen niet verwijderd worden</li>
                <li>• Klik op "Opslaan" om wijzigingen door te voeren</li>
              </ul>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeTab === 'settings' && config && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">⚙️ Instellingen</h2>
              <p className="text-gray-500 text-sm md:text-base">Pas teksten en afbeeldingen aan</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <ColorCard color="green">
                <h3 className="text-lg md:text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <Star /> Hero Sectie
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hoofdtitel</label>
                    <textarea
                      value={config.homeTitle}
                      onChange={(e) => setConfig({ ...config, homeTitle: e.target.value })}
                      className="w-full p-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ondertitel</label>
                    <input
                      type="text"
                      value={config.homeSubtitle}
                      onChange={(e) => setConfig({ ...config, homeSubtitle: e.target.value })}
                      className="w-full p-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </ColorCard>

              <ColorCard color="green">
                <h3 className="text-lg md:text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <FileText /> Over Ons
                </h3>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Beschrijving</label>
                  <textarea
                    value={config.aboutText}
                    onChange={(e) => setConfig({ ...config, aboutText: e.target.value })}
                    className="w-full p-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                    rows={4}
                  />
                </div>
              </ColorCard>

              <ColorCard color="red">
                <h3 className="text-lg md:text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                  <Mail /> Contact Informatie
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={config.contactEmail}
                      onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
                      className="w-full p-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Menu Link (Hanssens)</label>
                    <input
                      type="url"
                      value={config.menuUrl}
                      onChange={(e) => setConfig({ ...config, menuUrl: e.target.value })}
                      className="w-full p-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </ColorCard>

              <ColorCard color="green">
                <h3 className="text-lg md:text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <ImageIcon /> Hero Foto's
                </h3>
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
                  {heroImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-full h-16 md:h-20 object-cover rounded-lg" />
                      <button
                        onClick={async () => {
                          await fetch(`${API_BASE}/hero-images/${idx}`, { method: 'DELETE' });
                          setHeroImages(heroImages.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <ImageUploader
                  category="hero"
                  label="Hero Foto Toevoegen"
                  onUpload={(paths) => setHeroImages([...heroImages, ...paths])}
                />
              </ColorCard>
            </div>

            <ColorButton color="green" size="lg" icon={<Save size={24} />} onClick={handleSaveConfig} className="w-full sm:w-auto">
              Alle Instellingen Opslaan
            </ColorButton>
          </div>
        )}

        {/* Inbox Section */}
        {activeTab === 'inbox' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📬 Inbox</h2>
              <p className="text-gray-500 text-sm md:text-base">Bekijk berichten van bezoekers</p>
            </div>

            <ColorCard>
              {submissions.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-base md:text-lg">Geen berichten</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleMarkSubmissionRead(sub.id)}
                      className={`p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${sub.status === 'Nieuw' 
                          ? 'bg-red-50 border-red-200 hover:border-red-400' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-400'}`}
                    >
                      <div className="flex flex-wrap justify-between items-start mb-3 gap-2">
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold
                            ${sub.type === 'Inschrijving' ? 'bg-emerald-100 text-emerald-700' :
                              sub.type === 'Contact' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'}`}>
                            {sub.type}
                          </span>
                          {sub.status === 'Nieuw' && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                              NIEUW
                            </span>
                          )}
                        </div>
                        <span className="text-xs md:text-sm text-gray-400">{new Date(sub.date).toLocaleDateString('nl-BE')}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-base md:text-lg mb-1">{sub.name}</h4>
                      {sub.email && (
                        <a href={`mailto:${sub.email}`} className="text-emerald-500 text-xs md:text-sm hover:underline mb-2 block">
                          {sub.email}
                        </a>
                      )}
                      <p className="text-gray-600 text-sm">{sub.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </ColorCard>
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* News Modal */}
      <Modal isOpen={showNewsModal} onClose={() => setShowNewsModal(false)} title="📰 Nieuw Bericht" color="green">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Titel</label>
            <input
              type="text"
              value={newsForm.title}
              onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              placeholder="Bijv: Schoolfeest was een succes!"
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-bold text-gray-700 mb-2">Inhoud</label>
            <textarea
              value={newsForm.content}
              onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              rows={4}
              placeholder="Schrijf hier je bericht..."
            />
            <button
              onClick={handleAIWrite}
              disabled={isGenerating}
              className="absolute bottom-3 right-3 px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold rounded-full flex items-center gap-1 hover:opacity-90 disabled:opacity-50"
            >
              <Sparkles size={14} />
              {isGenerating ? 'Schrijven...' : 'AI Schrijven'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Datum</label>
              <input
                type="date"
                value={newsForm.date}
                onChange={(e) => setNewsForm({ ...newsForm, date: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Verloopt op</label>
              <input
                type="date"
                value={newsForm.expiryDate}
                onChange={(e) => setNewsForm({ ...newsForm, expiryDate: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Categorie</label>
            <select
              value={newsForm.category}
              onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as any })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            >
              <option value="Algemeen">Algemeen</option>
              <option value="Kleuter">Kleuter</option>
              <option value="Lager">Lager</option>
            </select>
          </div>

          <ImageUploader
            category="news"
            label="Foto Uploaden"
            currentImage={newsForm.imageUrl}
            onUpload={(paths) => setNewsForm({ ...newsForm, imageUrl: paths[0] })}
          />

          <ColorButton color="green" size="lg" className="w-full" onClick={handleAddNews}>
            Publiceren
          </ColorButton>
        </div>
      </Modal>

      {/* Event Modal */}
      <Modal isOpen={showEventModal} onClose={() => setShowEventModal(false)} title="📅 Nieuw Evenement" color="red">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Titel</label>
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              placeholder="Bijv: Sinterklaas op school"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Datum</label>
              <input
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select
                value={eventForm.type}
                onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              >
                <option value="Activiteit">Activiteit</option>
                <option value="Vakantie">Vakantie</option>
                <option value="Vrije Dag">Vrije Dag</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Beschrijving</label>
            <textarea
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              rows={3}
              placeholder="Extra info over het evenement..."
            />
          </div>

          <ColorButton color="red" size="lg" className="w-full" onClick={handleAddEvent}>
            Toevoegen aan Kalender
          </ColorButton>
        </div>
      </Modal>

      {/* Album Modal */}
      <Modal isOpen={showAlbumModal} onClose={() => setShowAlbumModal(false)} title="📸 Nieuw Album" color="green">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Album Naam</label>
            <input
              type="text"
              value={albumForm.title}
              onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              placeholder="Bijv: Schoolreis 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Locatie / Categorie</label>
            <select
              value={albumForm.location}
              onChange={(e) => setAlbumForm({ ...albumForm, location: e.target.value as any })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            >
              <option value="Kleuter Klooster">Kleuter Klooster</option>
              <option value="Lager">Lager</option>
              <option value="Verrekijker">De Verre Kijker</option>
              <option value="Algemeen">Algemeen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Verloopt op (optioneel)</label>
            <input
              type="date"
              value={albumForm.expiryDate}
              onChange={(e) => setAlbumForm({ ...albumForm, expiryDate: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Laat leeg om het album permanent te houden</p>
          </div>

          <ColorButton color="green" size="lg" className="w-full" onClick={handleAddAlbum}>
            Album Aanmaken
          </ColorButton>
        </div>
      </Modal>

      {/* Team Modal */}
      <Modal isOpen={showTeamModal} onClose={() => setShowTeamModal(false)} title="👥 Nieuw Teamlid" color="red">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Functie / Rol</label>
            <input
              type="text"
              value={teamForm.role}
              onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              placeholder="Bijv: Juf 1e Kleuter"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Groep</label>
            <select
              value={teamForm.group}
              onChange={(e) => setTeamForm({ ...teamForm, group: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
            >
              <option value="Directie">Directie</option>
              <option value="Kleuter">Kleuter</option>
              <option value="Lager">Lager</option>
              <option value="Zorg">Zorg</option>
            </select>
          </div>

          <ImageUploader
            category="team"
            label="Foto Uploaden"
            currentImage={teamForm.imageUrl}
            onUpload={(paths) => setTeamForm({ ...teamForm, imageUrl: paths[0] })}
          />

          <ColorButton color="red" size="lg" className="w-full" onClick={handleAddTeamMember}>
            Teamlid Toevoegen
          </ColorButton>
        </div>
      </Modal>

      {/* Ouderwerkgroep Modal */}
      <Modal isOpen={showOuderwerkgroepModal} onClose={() => setShowOuderwerkgroepModal(false)} title="💖 Nieuwe Activiteit" color="red">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Titel</label>
            <input
              type="text"
              value={ouderwerkgroepForm.title}
              onChange={(e) => setOuderwerkgroepForm({ ...ouderwerkgroepForm, title: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              placeholder="Bijv: Pannenkoekendag"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Beschrijving</label>
            <textarea
              value={ouderwerkgroepForm.description}
              onChange={(e) => setOuderwerkgroepForm({ ...ouderwerkgroepForm, description: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
              rows={3}
              placeholder="Beschrijf de activiteit..."
            />
          </div>

          <ImageUploader
            category="ouderwerkgroep"
            label="Foto Uploaden"
            currentImage={ouderwerkgroepForm.image}
            onUpload={(paths) => setOuderwerkgroepForm({ ...ouderwerkgroepForm, image: paths[0] })}
          />

          <ColorButton color="red" size="lg" className="w-full" onClick={handleAddOuderwerkgroepActivity}>
            Activiteit Toevoegen
          </ColorButton>
        </div>
      </Modal>

      {/* Page Edit Modal */}
      <Modal isOpen={showPageModal} onClose={() => { setShowPageModal(false); setEditingPage(null); }} title={editingPage ? "📄 Pagina Bewerken" : "📄 Nieuwe Pagina"} color="green">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pagina Naam</label>
            <input
              type="text"
              value={pageForm.name}
              onChange={(e) => setPageForm({ ...pageForm, name: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              placeholder="Bijv: Speelplaats"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug</label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">/</span>
              <input
                type="text"
                value={pageForm.slug}
                onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                placeholder="speelplaats"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Dit wordt de URL van de pagina</p>
          </div>

          <ColorButton 
            color="green" 
            size="lg" 
            className="w-full" 
            onClick={editingPage ? handleSavePageEdit : handleAddPage}
          >
            {editingPage ? 'Wijzigingen Opslaan' : 'Pagina Toevoegen'}
          </ColorButton>
        </div>
      </Modal>

      {/* Toast */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
