import React, { useState, useEffect, useRef } from 'react';
import {
  Lock, Home, FileText, Calendar, Camera, Users, Heart, Settings,
  Inbox, Plus, Trash2, Edit, Save, X, Upload, Sparkles, Eye,
  ChevronRight, Image as ImageIcon, Star, Bell, TrendingUp,
  Palette, Layout, Mail, Phone, MapPin, ExternalLink, Check,
  AlertCircle, Loader2, Grid, List, Clock, Tag, Menu, Power,
  ToggleLeft, ToggleRight, GripVertical, FileEdit, Download, ClipboardList,
  User, Baby, Building2, Stethoscope, Languages, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { generateNewsContent } from './services/geminiService';
import { MOCK_NEWS, MOCK_EVENTS, MOCK_ALBUMS, MOCK_TEAM, DEFAULT_CONFIG, MOCK_SUBMISSIONS, HERO_IMAGES } from './constants';

// Detecteer of we lokaal of in productie draaien
// 1. Check environment variable (voor Vercel of andere deployments)
// 2. Check of we lokaal draaien (localhost of 127.0.0.1)
// 3. Anders: gebruik lege string (fallback naar mock data)
const getApiBase = (): string => {
  // Check voor environment variable (VITE_API_URL)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check of we lokaal draaien
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
    return 'http://localhost:3001/api';
  }
  
  // Productie zonder backend - gebruik mock data
  return '';
};

const API_BASE = getApiBase();

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
  images: string[]; // Multiple photos per activity
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

interface Download {
  id: string;
  title: string;
  filename: string;
  originalName?: string;
  uploadDate: string;
}

interface Enrollment {
  id: string;
  submittedAt: string;
  status: 'nieuw' | 'in_behandeling' | 'gerealiseerd' | 'niet_gerealiseerd';
  inschrijvingsDatum: string;
  schooljaar: string;
  afdeling: string;
  naamKind: string;
  voornaamKind: string;
  adres: string;
  geboortedatumKind: string;
  geboorteplaatsKind: string;
  bewijsGeboortedatum: string;
  bewijsGeboortedatumAnders?: string;
  rijksregisternummerKind: string;
  geslacht: string;
  nationaliteit: string;
  nationaliteitAnders?: string;
  isOudsteGezin: boolean;
  andereKinderen?: string;
  bankrekening: string;
  telefoonVast?: string;
  gsmPapa?: string;
  gsmMama?: string;
  grootoudersPapa?: string;
  grootoudersMama?: string;
  werkPapa?: string;
  werkMama?: string;
  emailPapa?: string;
  emailMama?: string;
  naamPapa: string;
  geboortedatumPapa: string;
  geboorteplaatsPapa: string;
  rijksregisternummerPapa: string;
  leerplichtverantwoordelijkePapa: string;
  beroepPapa?: string;
  opleidingsniveauPapa: string;
  naamMama: string;
  geboortedatumMama: string;
  geboorteplaatsMama: string;
  rijksregisternummerMama: string;
  leerplichtverantwoordelijkeMama: string;
  beroepMama?: string;
  opleidingsniveauMama: string;
  huisarts: string;
  ziekenhuis: string;
  allergieenZiektes?: string;
  akkoordReglement: boolean;
  eersteSchooldag: string;
  startKlas?: string;
  anderstaligNieuwkomer: boolean;
  verslagBuitengewoonOnderwijs: boolean;
  broerZusIngeschreven: boolean;
  personeelslid: boolean;
  vorigeSchool?: string;
  ondertekeningNaam: string;
  ondertekeningDatum: string;
  ondertekeningUur: string;
  taalMoeder: string;
  taalVader: string;
  taalBroersZussen: string;
  taalVrienden: string;
  bevestigingOpEerDatum: string;
  bevestigingOpEerNaam: string;
}

interface SiteConfig {
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
}

interface PageConfig {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  order: number;
  type: 'system' | 'custom';
  content?: string;
  pageImages?: string[];
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

// Colorful Button Component with School Colors - Smaller default size for older users
const ColorButton = ({ 
  children, 
  onClick, 
  color = 'green', 
  size = 'sm',  // Default to small for compact UI
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
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${colors[color]} ${sizes[size]} font-bold rounded-xl shadow-md 
        transform transition-all duration-200 hover:scale-105 hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        flex items-center gap-1.5 justify-center ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

// Colorful Card Component with School Colors
const ColorCard: React.FC<{
  children: React.ReactNode;
  color?: 'white' | 'green' | 'red' | 'gray';
  className?: string;
  onClick?: () => void;
}> = ({ 
  children, 
  color = 'white',
  className = '',
  onClick
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

    // Als er geen backend is, gebruik lokale object URLs
    if (!API_BASE) {
      for (let i = 0; i < files.length; i++) {
        const objectUrl = URL.createObjectURL(files[i]);
        uploadedPaths.push(objectUrl);
      }
      setUploading(false);
      if (uploadedPaths.length > 0) {
        onUpload(uploadedPaths);
      }
      return;
    }

    // Backend beschikbaar - upload naar server
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('image', files[i]);

      try {
        const response = await fetch(`${API_BASE}/upload/${category}`, {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            uploadedPaths.push(data.path);
          }
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

// Calendar Section Component with Search, Filters, and Pagination
const CalendarSection = ({
  events,
  onAddEvent,
  onDeleteEvent
}: {
  events: CalendarEvent[];
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique months from events
  const availableMonths = Array.from(new Set(
    events.map(e => {
      const date = new Date(e.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    })
  )).sort();

  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesMonth = selectedMonth === 'all' || 
        `${new Date(event.date).getFullYear()}-${String(new Date(event.date).getMonth() + 1).padStart(2, '0')}` === selectedMonth;
      const matchesType = selectedType === 'all' || event.type === selectedType;
      return matchesSearch && matchesMonth && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, selectedType, sortOrder]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📅 Kalender Beheer</h2>
          <p className="text-gray-500 text-sm md:text-base">
            {filteredEvents.length} evenement{filteredEvents.length !== 1 ? 'en' : ''} gevonden
          </p>
        </div>
        <ColorButton color="red" size="sm" icon={<Plus size={18} />} onClick={onAddEvent}>
          Nieuw
        </ColorButton>
      </div>

      {/* Filters */}
      <ColorCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Zoeken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm"
            />
          </div>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm bg-white"
          >
            <option value="all">📆 Alle maanden</option>
            {availableMonths.map(month => {
              const [year, m] = month.split('-');
              return (
                <option key={month} value={month}>
                  {monthNames[parseInt(m) - 1]} {year}
                </option>
              );
            })}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm bg-white"
          >
            <option value="all">🏷️ Alle types</option>
            <option value="Vakantie">🌴 Vakantie</option>
            <option value="Activiteit">🎉 Activiteit</option>
            <option value="Vrije Dag">🏠 Vrije Dag</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-sm bg-white"
          >
            <option value="asc">📈 Datum oplopend</option>
            <option value="desc">📉 Datum aflopend</option>
          </select>
        </div>
      </ColorCard>

      {/* Events List */}
      <ColorCard>
        {paginatedEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Geen evenementen gevonden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition group">
                <div className={`p-2 md:p-3 rounded-xl text-white font-bold text-center min-w-[50px] md:min-w-[60px]
                  ${event.type === 'Vakantie' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                    event.type === 'Activiteit' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                    'bg-gradient-to-br from-orange-500 to-amber-600'}`}>
                  <div className="text-base md:text-xl">{new Date(event.date).getDate()}</div>
                  <div className="text-[10px] uppercase">{new Date(event.date).toLocaleDateString('nl-BE', { month: 'short' })}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm md:text-base truncate">{event.title}</h3>
                  <p className="text-gray-500 text-xs truncate">{event.description}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold
                    ${event.type === 'Vakantie' ? 'bg-emerald-100 text-emerald-700' :
                      event.type === 'Activiteit' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'}`}>
                    {event.type}
                  </span>
                </div>
                <button onClick={() => onDeleteEvent(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              ← Vorige
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
                      currentPage === pageNum 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Volgende →
            </button>
          </div>
        )}
      </ColorCard>
    </div>
  );
};

// Enrollments Section Component
const EnrollmentsSection = ({
  enrollments,
  onRefresh,
  onUpdateStatus,
  onDelete
}: {
  enrollments: Enrollment[];
  onRefresh?: () => void;
  onUpdateStatus: (id: string, status: Enrollment['status']) => void;
  onDelete: (id: string) => void;
}) => {
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusColors = {
    nieuw: 'bg-blue-100 text-blue-800 border-blue-200',
    in_behandeling: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    gerealiseerd: 'bg-green-100 text-green-800 border-green-200',
    niet_gerealiseerd: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusLabels = {
    nieuw: 'Nieuw',
    in_behandeling: 'In behandeling',
    gerealiseerd: 'Gerealiseerd',
    niet_gerealiseerd: 'Niet gerealiseerd'
  };

  const filteredEnrollments = enrollments
    .filter(e => filterStatus === 'all' || e.status === filterStatus)
    .filter(e => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        e.naamKind?.toLowerCase().includes(search) ||
        e.voornaamKind?.toLowerCase().includes(search) ||
        e.naamPapa?.toLowerCase().includes(search) ||
        e.naamMama?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  const generatePDF = (enrollment: Enrollment) => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inschrijving - ${enrollment.voornaamKind} ${enrollment.naamKind}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #166534; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          .section { margin-bottom: 20px; }
          .row { display: flex; margin-bottom: 8px; }
          .label { font-weight: bold; width: 200px; color: #374151; }
          .value { flex: 1; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #166534; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-nieuw { background: #dbeafe; color: #1e40af; }
          .status-in_behandeling { background: #fef3c7; color: #92400e; }
          .status-gerealiseerd { background: #d1fae5; color: #065f46; }
          .status-niet_gerealiseerd { background: #fee2e2; color: #991b1b; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">VBS Sint-Maarten Sijsele</div>
          <h1>Inschrijvingsformulier</h1>
          <p>Ingediend op: ${new Date(enrollment.submittedAt).toLocaleDateString('nl-BE')} om ${new Date(enrollment.submittedAt).toLocaleTimeString('nl-BE')}</p>
          <span class="status status-${enrollment.status}">${statusLabels[enrollment.status]}</span>
        </div>

        <h2>Basisgegevens Kind</h2>
        <div class="section">
          <div class="row"><span class="label">Naam:</span><span class="value">${enrollment.naamKind} ${enrollment.voornaamKind}</span></div>
          <div class="row"><span class="label">Geboortedatum:</span><span class="value">${enrollment.geboortedatumKind}</span></div>
          <div class="row"><span class="label">Geboorteplaats:</span><span class="value">${enrollment.geboorteplaatsKind}</span></div>
          <div class="row"><span class="label">Rijksregisternummer:</span><span class="value">${enrollment.rijksregisternummerKind}</span></div>
          <div class="row"><span class="label">Geslacht:</span><span class="value">${enrollment.geslacht}</span></div>
          <div class="row"><span class="label">Nationaliteit:</span><span class="value">${enrollment.nationaliteit}${enrollment.nationaliteitAnders ? ` (${enrollment.nationaliteitAnders})` : ''}</span></div>
          <div class="row"><span class="label">Adres:</span><span class="value">${enrollment.adres}</span></div>
          <div class="row"><span class="label">Schooljaar:</span><span class="value">${enrollment.schooljaar}</span></div>
          <div class="row"><span class="label">Afdeling:</span><span class="value">${enrollment.afdeling}</span></div>
          <div class="row"><span class="label">Bewijs geboortedatum:</span><span class="value">${enrollment.bewijsGeboortedatum}${enrollment.bewijsGeboortedatumAnders ? ` (${enrollment.bewijsGeboortedatumAnders})` : ''}</span></div>
        </div>

        <h2>Gezinssituatie</h2>
        <div class="section">
          <div class="row"><span class="label">Oudste van gezin:</span><span class="value">${enrollment.isOudsteGezin ? 'Ja' : 'Nee'}</span></div>
          ${enrollment.andereKinderen ? `<div class="row"><span class="label">Andere kinderen:</span><span class="value">${enrollment.andereKinderen}</span></div>` : ''}
          <div class="row"><span class="label">Bankrekening:</span><span class="value">${enrollment.bankrekening}</span></div>
          ${enrollment.telefoonVast ? `<div class="row"><span class="label">Telefoon vast:</span><span class="value">${enrollment.telefoonVast}</span></div>` : ''}
          ${enrollment.gsmPapa ? `<div class="row"><span class="label">GSM papa:</span><span class="value">${enrollment.gsmPapa}</span></div>` : ''}
          ${enrollment.gsmMama ? `<div class="row"><span class="label">GSM mama:</span><span class="value">${enrollment.gsmMama}</span></div>` : ''}
          ${enrollment.emailPapa ? `<div class="row"><span class="label">Email papa:</span><span class="value">${enrollment.emailPapa}</span></div>` : ''}
          ${enrollment.emailMama ? `<div class="row"><span class="label">Email mama:</span><span class="value">${enrollment.emailMama}</span></div>` : ''}
        </div>

        <h2>Gegevens Papa</h2>
        <div class="section">
          <div class="row"><span class="label">Naam:</span><span class="value">${enrollment.naamPapa}</span></div>
          <div class="row"><span class="label">Geboortedatum:</span><span class="value">${enrollment.geboortedatumPapa}</span></div>
          <div class="row"><span class="label">Geboorteplaats:</span><span class="value">${enrollment.geboorteplaatsPapa}</span></div>
          <div class="row"><span class="label">Rijksregisternummer:</span><span class="value">${enrollment.rijksregisternummerPapa}</span></div>
          <div class="row"><span class="label">Leerplichtverantwoordelijke:</span><span class="value">${enrollment.leerplichtverantwoordelijkePapa}</span></div>
          ${enrollment.beroepPapa ? `<div class="row"><span class="label">Beroep:</span><span class="value">${enrollment.beroepPapa}</span></div>` : ''}
          <div class="row"><span class="label">Opleidingsniveau:</span><span class="value">${enrollment.opleidingsniveauPapa}</span></div>
        </div>

        <h2>Gegevens Mama</h2>
        <div class="section">
          <div class="row"><span class="label">Naam:</span><span class="value">${enrollment.naamMama}</span></div>
          <div class="row"><span class="label">Geboortedatum:</span><span class="value">${enrollment.geboortedatumMama}</span></div>
          <div class="row"><span class="label">Geboorteplaats:</span><span class="value">${enrollment.geboorteplaatsMama}</span></div>
          <div class="row"><span class="label">Rijksregisternummer:</span><span class="value">${enrollment.rijksregisternummerMama}</span></div>
          <div class="row"><span class="label">Leerplichtverantwoordelijke:</span><span class="value">${enrollment.leerplichtverantwoordelijkeMama}</span></div>
          ${enrollment.beroepMama ? `<div class="row"><span class="label">Beroep:</span><span class="value">${enrollment.beroepMama}</span></div>` : ''}
          <div class="row"><span class="label">Opleidingsniveau:</span><span class="value">${enrollment.opleidingsniveauMama}</span></div>
        </div>

        <h2>Medische Informatie</h2>
        <div class="section">
          <div class="row"><span class="label">Huisarts:</span><span class="value">${enrollment.huisarts}</span></div>
          <div class="row"><span class="label">Ziekenhuis voorkeur:</span><span class="value">${enrollment.ziekenhuis}</span></div>
          ${enrollment.allergieenZiektes ? `<div class="row"><span class="label">Allergieën/Ziektes:</span><span class="value">${enrollment.allergieenZiektes}</span></div>` : ''}
        </div>

        <h2>Verklaring & Inschrijving</h2>
        <div class="section">
          <div class="row"><span class="label">Akkoord reglement:</span><span class="value">${enrollment.akkoordReglement ? 'Ja' : 'Nee'}</span></div>
          <div class="row"><span class="label">Eerste schooldag:</span><span class="value">${enrollment.eersteSchooldag}</span></div>
          ${enrollment.startKlas ? `<div class="row"><span class="label">Startklas:</span><span class="value">${enrollment.startKlas}</span></div>` : ''}
          <div class="row"><span class="label">Anderstalige nieuwkomer:</span><span class="value">${enrollment.anderstaligNieuwkomer ? 'Ja' : 'Nee'}</span></div>
          <div class="row"><span class="label">Verslag buitengewoon onderwijs:</span><span class="value">${enrollment.verslagBuitengewoonOnderwijs ? 'Ja' : 'Nee'}</span></div>
          <div class="row"><span class="label">Broer/zus ingeschreven:</span><span class="value">${enrollment.broerZusIngeschreven ? 'Ja' : 'Nee'}</span></div>
          <div class="row"><span class="label">Personeelslid:</span><span class="value">${enrollment.personeelslid ? 'Ja' : 'Nee'}</span></div>
          ${enrollment.vorigeSchool ? `<div class="row"><span class="label">Vorige school:</span><span class="value">${enrollment.vorigeSchool}</span></div>` : ''}
        </div>

        <h2>Ondertekening</h2>
        <div class="section">
          <div class="row"><span class="label">Naam:</span><span class="value">${enrollment.ondertekeningNaam}</span></div>
          <div class="row"><span class="label">Datum:</span><span class="value">${enrollment.ondertekeningDatum}</span></div>
          <div class="row"><span class="label">Uur:</span><span class="value">${enrollment.ondertekeningUur}</span></div>
        </div>

        <h2>Taalgebruik (Vlaamse Overheid)</h2>
        <div class="section">
          <div class="row"><span class="label">Taal met moeder:</span><span class="value">${enrollment.taalMoeder}</span></div>
          <div class="row"><span class="label">Taal met vader:</span><span class="value">${enrollment.taalVader}</span></div>
          <div class="row"><span class="label">Taal met broers/zussen:</span><span class="value">${enrollment.taalBroersZussen}</span></div>
          <div class="row"><span class="label">Taal met vrienden:</span><span class="value">${enrollment.taalVrienden}</span></div>
          <div class="row"><span class="label">Bevestiging op eer:</span><span class="value">${enrollment.bevestigingOpEerNaam} - ${enrollment.bevestigingOpEerDatum}</span></div>
        </div>

        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📋 Inschrijvingen</h2>
          <p className="text-gray-500 text-sm md:text-base">
            {filteredEnrollments.length} inschrijving{filteredEnrollments.length !== 1 ? 'en' : ''} gevonden
          </p>
        </div>
        {onRefresh && (
          <ColorButton 
            color="green" 
            size="sm" 
            icon={<RefreshCw size={18} />} 
            onClick={onRefresh}
          >
            Verversen
          </ColorButton>
        )}
      </div>

      {/* Filters */}
      <ColorCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Zoeken op naam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm bg-white"
          >
            <option value="all">📊 Alle statussen</option>
            <option value="nieuw">🆕 Nieuw</option>
            <option value="in_behandeling">⏳ In behandeling</option>
            <option value="gerealiseerd">✅ Gerealiseerd</option>
            <option value="niet_gerealiseerd">❌ Niet gerealiseerd</option>
          </select>
        </div>
      </ColorCard>

      {/* Enrollments List */}
      <ColorCard>
        {filteredEnrollments.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Geen inschrijvingen gevonden</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition">
                {/* Header Row */}
                <div 
                  className="flex items-center gap-3 md:gap-4 p-4 bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === enrollment.id ? null : enrollment.id)}
                >
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 md:p-3 rounded-xl text-white">
                    <Baby size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-sm md:text-base">
                      {enrollment.voornaamKind} {enrollment.naamKind}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(enrollment.submittedAt).toLocaleDateString('nl-BE')}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{enrollment.afdeling}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{enrollment.schooljaar}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[enrollment.status]}`}>
                    {statusLabels[enrollment.status]}
                  </span>
                  {expandedId === enrollment.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>

                {/* Expanded Details */}
                {expandedId === enrollment.id && (
                  <div className="p-4 border-t border-gray-100 bg-white animate-fade-in">
                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                          <User size={16} />
                          <span className="font-bold text-sm">Ouders</span>
                        </div>
                        <p className="text-sm text-gray-700">{enrollment.naamPapa}</p>
                        <p className="text-sm text-gray-700">{enrollment.naamMama}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 mb-2">
                          <Phone size={16} />
                          <span className="font-bold text-sm">Contact</span>
                        </div>
                        {enrollment.gsmPapa && <p className="text-sm text-gray-700">Papa: {enrollment.gsmPapa}</p>}
                        {enrollment.gsmMama && <p className="text-sm text-gray-700">Mama: {enrollment.gsmMama}</p>}
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-purple-700 mb-2">
                          <Mail size={16} />
                          <span className="font-bold text-sm">Email</span>
                        </div>
                        {enrollment.emailPapa && <p className="text-sm text-gray-700 truncate">{enrollment.emailPapa}</p>}
                        {enrollment.emailMama && <p className="text-sm text-gray-700 truncate">{enrollment.emailMama}</p>}
                      </div>
                    </div>

                    {/* More Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Geboortedatum:</span>
                        <p className="font-medium">{enrollment.geboortedatumKind}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Eerste schooldag:</span>
                        <p className="font-medium">{enrollment.eersteSchooldag}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Broer/zus:</span>
                        <p className="font-medium">{enrollment.broerZusIngeschreven ? 'Ja' : 'Nee'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Adres:</span>
                        <p className="font-medium truncate">{enrollment.adres}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      <select
                        value={enrollment.status}
                        onChange={(e) => onUpdateStatus(enrollment.id, e.target.value as Enrollment['status'])}
                        className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="nieuw">🆕 Nieuw</option>
                        <option value="in_behandeling">⏳ In behandeling</option>
                        <option value="gerealiseerd">✅ Gerealiseerd</option>
                        <option value="niet_gerealiseerd">❌ Niet gerealiseerd</option>
                      </select>
                      <button
                        onClick={() => generatePDF(enrollment)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition"
                      >
                        <Download size={16} />
                        Download PDF
                      </button>
                      <button
                        onClick={() => onDelete(enrollment.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition"
                      >
                        <Trash2 size={16} />
                        Verwijderen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ColorCard>
    </div>
  );
};

// Default Pages Configuration
const DEFAULT_PAGES: PageConfig[] = [
  { id: 'home', name: 'Home', slug: 'home', active: true, order: 0, type: 'system' },
  { id: 'about', name: 'Onze School', slug: 'about', active: true, order: 1, type: 'system' },
  { id: 'enroll', name: 'Inschrijven', slug: 'enroll', active: true, order: 2, type: 'system' },
  { id: 'news', name: 'Nieuws', slug: 'news', active: true, order: 3, type: 'system' },
  { id: 'calendar', name: 'Agenda', slug: 'calendar', active: true, order: 4, type: 'system' },
  { id: 'info', name: 'Info', slug: 'info', active: true, order: 5, type: 'system' },
  { id: 'ouderwerkgroep', name: 'Ouderwerkgroep', slug: 'ouderwerkgroep', active: true, order: 6, type: 'system' },
  { id: 'gallery', name: "Foto's", slug: 'gallery', active: true, order: 7, type: 'system' },
  { id: 'contact', name: 'Contact', slug: 'contact', active: true, order: 8, type: 'system' },
];

// Main Admin Panel Component
export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState(false); // Start as false, only set to true when fetching
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states - Initialize with mock data as fallback
  const [config, setConfig] = useState<SiteConfig | null>(DEFAULT_CONFIG);
  const [heroImages, setHeroImages] = useState<string[]>(HERO_IMAGES);
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [albums, setAlbums] = useState<PhotoAlbum[]>(MOCK_ALBUMS);
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM as TeamMember[]);
  const [ouderwerkgroep, setOuderwerkgroep] = useState<OuderwerkgroepActivity[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>(MOCK_SUBMISSIONS);
  const [pages, setPages] = useState<PageConfig[]>(DEFAULT_PAGES);
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Modal states
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showOuderwerkgroepModal, setShowOuderwerkgroepModal] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageConfig | null>(null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Form states
  const [newsForm, setNewsForm] = useState({ title: '', content: '', date: '', expiryDate: '', imageUrl: '', category: 'Algemeen' as const });
  const [eventForm, setEventForm] = useState({ title: '', date: '', type: 'Activiteit' as const, description: '' });
  const [albumForm, setAlbumForm] = useState({ title: '', location: 'Algemeen' as const, expiryDate: '' });
  const [teamForm, setTeamForm] = useState({ role: '', imageUrl: '', group: 'Kleuter' });
  const [ouderwerkgroepForm, setOuderwerkgroepForm] = useState({ title: '', description: '', images: [] as string[] });
  const [pageForm, setPageForm] = useState({ name: '', slug: '', content: '', pageImages: [] as string[] });
  const [downloadForm, setDownloadForm] = useState({ title: '', file: null as File | null });
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    
    // Als we geen API_BASE hebben (productie zonder backend), gebruik localStorage of mock data
    if (!API_BASE) {
      console.log('Geen backend beschikbaar, gebruik lokale opslag of mock data');
      // Probeer data uit localStorage te laden
      try {
        const savedData = localStorage.getItem('adminData');
        if (savedData) {
          const data = JSON.parse(savedData);
          if (data.config) setConfig(data.config);
          if (data.heroImages && data.heroImages.length > 0) setHeroImages(data.heroImages);
          if (data.news && data.news.length > 0) setNews(data.news);
          if (data.events && data.events.length > 0) setEvents(data.events);
          if (data.albums && data.albums.length > 0) setAlbums(data.albums);
          if (data.team && data.team.length > 0) setTeam(data.team);
          if (data.ouderwerkgroep && data.ouderwerkgroep.length > 0) setOuderwerkgroep(data.ouderwerkgroep);
          if (data.submissions && data.submissions.length > 0) setSubmissions(data.submissions);
          if (data.pages && data.pages.length > 0) setPages(data.pages);
          if (data.downloads && data.downloads.length > 0) setDownloads(data.downloads);
          if (data.enrollments && data.enrollments.length > 0) setEnrollments(data.enrollments);
        }
      } catch (e) {
        console.log('Geen opgeslagen data gevonden, gebruik mock data');
      }
      setLoading(false);
      showToast('ℹ️ Gebruikt lokale data. Start de server voor volledige functionaliteit.', 'success');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/data`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      const data = await response.json();
      if (data.config) setConfig(data.config);
      if (data.heroImages && data.heroImages.length > 0) setHeroImages(data.heroImages);
      if (data.news && data.news.length > 0) setNews(data.news);
      if (data.events && data.events.length > 0) setEvents(data.events);
      if (data.albums && data.albums.length > 0) setAlbums(data.albums);
      if (data.team && data.team.length > 0) setTeam(data.team);
      if (data.ouderwerkgroep && data.ouderwerkgroep.length > 0) setOuderwerkgroep(data.ouderwerkgroep);
      if (data.submissions && data.submissions.length > 0) setSubmissions(data.submissions);
      if (data.pages && data.pages.length > 0) setPages(data.pages);
      if (data.downloads && data.downloads.length > 0) setDownloads(data.downloads);
      if (data.enrollments && data.enrollments.length > 0) setEnrollments(data.enrollments);
      setLoading(false);
      showToast('✅ Data succesvol geladen!', 'success');
    } catch (error) {
      console.error('Error fetching data:', error);
      // Keep mock data as fallback
      showToast('⚠️ Server niet bereikbaar. Gebruikt mock data. Start de server met: npm run server', 'error');
      setLoading(false);
    }
  };

  // Functie om alle data naar localStorage te synchroniseren (altijd, als backup)
  const syncToLocalStorage = () => {
    try {
      const dataToSave = {
        config,
        heroImages,
        news,
        events,
        albums,
        team,
        ouderwerkgroep,
        submissions,
        pages,
        downloads,
        enrollments
      };
      localStorage.setItem('adminData', JSON.stringify(dataToSave));
      // Dispatch custom event zodat App.tsx kan luisteren
      window.dispatchEvent(new CustomEvent('adminDataUpdated'));
      if (!API_BASE) {
        console.log('💾 Data opgeslagen naar localStorage en event gedispatched');
      }
    } catch (error) {
      console.error('❌ Fout bij opslaan naar localStorage:', error);
    }
  };

  // Sync naar localStorage wanneer data wijzigt (altijd als backup, vooral belangrijk zonder backend)
  useEffect(() => {
    if (isAuthenticated) {
      // Gebruik een kleine delay om te voorkomen dat we te vaak syncen
      const timeoutId = setTimeout(() => {
        syncToLocalStorage();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [news, events, albums, team, ouderwerkgroep, pages, downloads, enrollments, config, heroImages, submissions, isAuthenticated]);

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

  // Auto-refresh enrollments when opening the enrollments tab
  useEffect(() => {
    if (activeTab === 'enrollments' && isAuthenticated && API_BASE) {
      const refreshEnrollments = async () => {
        try {
          const response = await fetch(`${API_BASE}/enrollments`);
          if (response.ok) {
            const data = await response.json();
            setEnrollments(data);
          }
        } catch (error) {
          console.log('Fout bij ophalen inschrijvingen:', error);
        }
      };
      refreshEnrollments();
    }
  }, [activeTab, isAuthenticated]);

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
    setPageForm({ name: page.name, slug: page.slug, content: page.content || '', pageImages: page.pageImages || [] });
    setShowPageModal(true);
  };

  const handleSavePageEdit = () => {
    if (editingPage) {
      setPages(pages.map(p => p.id === editingPage.id ? { 
        ...p, 
        name: pageForm.name, 
        slug: pageForm.slug,
        content: pageForm.content,
        pageImages: pageForm.pageImages
      } : p));
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
      type: 'custom',
      content: pageForm.content,
      pageImages: pageForm.pageImages
    };
    setPages([...pages, newPage]);
    setShowPageModal(false);
    setPageForm({ name: '', slug: '', content: '', pageImages: [] });
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
    // Als geen backend, gebruik lokale state
    if (!API_BASE) {
      const newItem: NewsItem = {
        id: Date.now().toString(),
        ...newsForm,
        date: newsForm.date || new Date().toISOString().split('T')[0]
      };
      const updatedNews = [newItem, ...news];
      setNews(updatedNews);
      setShowNewsModal(false);
      setNewsForm({ title: '', content: '', date: '', expiryDate: '', imageUrl: '', category: 'Algemeen' });
      // Sync naar localStorage (useEffect zal dit ook doen, maar dit is expliciet)
      syncToLocalStorage();
      showToast('Nieuws toegevoegd! 📰 (lokaal opgeslagen)', 'success');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsForm)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNews([data.item, ...news]);
          setShowNewsModal(false);
          setNewsForm({ title: '', content: '', date: '', expiryDate: '', imageUrl: '', category: 'Algemeen' });
          showToast('Nieuws toegevoegd! 📰', 'success');
          // Sync naar localStorage als backup
          syncToLocalStorage();
        }
      } else {
        // API call faalde, gebruik lokale state als fallback
        const newItem: NewsItem = {
          id: Date.now().toString(),
          ...newsForm,
          date: newsForm.date || new Date().toISOString().split('T')[0]
        };
        setNews([newItem, ...news]);
        setShowNewsModal(false);
        setNewsForm({ title: '', content: '', date: '', expiryDate: '', imageUrl: '', category: 'Algemeen' });
        syncToLocalStorage();
        showToast('Nieuws toegevoegd! 📰 (lokaal opgeslagen - backend niet beschikbaar)', 'success');
      }
    } catch (error) {
      // Network error, gebruik lokale state
      const newItem: NewsItem = {
        id: Date.now().toString(),
        ...newsForm,
        date: newsForm.date || new Date().toISOString().split('T')[0]
      };
      setNews([newItem, ...news]);
      setShowNewsModal(false);
      setNewsForm({ title: '', content: '', date: '', expiryDate: '', imageUrl: '', category: 'Algemeen' });
      syncToLocalStorage();
      showToast('Nieuws toegevoegd! 📰 (lokaal opgeslagen - backend niet bereikbaar)', 'success');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;
    
    // Als geen backend, gebruik lokale state
    if (!API_BASE) {
      const updatedNews = news.filter(n => n.id !== id);
      setNews(updatedNews);
      syncToLocalStorage();
      showToast('Nieuws verwijderd! 🗑️ (lokaal)', 'success');
      return;
    }

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
    // Als geen backend, gebruik lokale state
    if (!API_BASE) {
      const newItem: CalendarEvent = {
        id: Date.now().toString(),
        ...eventForm,
        grades: ['All'],
        date: eventForm.date || new Date().toISOString().split('T')[0]
      };
      const updatedEvents = [...events, newItem];
      setEvents(updatedEvents);
      setShowEventModal(false);
      setEventForm({ title: '', date: '', type: 'Activiteit', description: '' });
      syncToLocalStorage();
      showToast('Evenement toegevoegd! 📅 (lokaal opgeslagen)', 'success');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventForm, grades: ['All'] })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEvents([...events, data.item]);
          setShowEventModal(false);
          setEventForm({ title: '', date: '', type: 'Activiteit', description: '' });
          showToast('Evenement toegevoegd! 📅', 'success');
        }
      }
    } catch (error) {
      showToast('Fout bij toevoegen evenement', 'error');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit wilt verwijderen?')) return;
    
    // Als geen backend, gebruik lokale state
    if (!API_BASE) {
      const updatedEvents = events.filter(e => e.id !== id);
      setEvents(updatedEvents);
      syncToLocalStorage();
      showToast('Evenement verwijderd! 🗑️ (lokaal)', 'success');
      return;
    }

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
    // Als geen backend, gebruik lokale state
    if (!API_BASE) {
      const newAlbum: PhotoAlbum = {
        id: Date.now().toString(),
        ...albumForm,
        coverImage: '',
        images: [],
        createdDate: new Date().toISOString().split('T')[0]
      };
      const updatedAlbums = [...albums, newAlbum];
      setAlbums(updatedAlbums);
      setShowAlbumModal(false);
      setAlbumForm({ title: '', location: 'Algemeen', expiryDate: '' });
      syncToLocalStorage();
      showToast('Album aangemaakt! 📸 (lokaal opgeslagen)', 'success');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/albums`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(albumForm)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAlbums([...albums, data.item]);
          setShowAlbumModal(false);
          setAlbumForm({ title: '', location: 'Algemeen', expiryDate: '' });
          showToast('Album aangemaakt! 📸', 'success');
        }
      }
    } catch (error) {
      showToast('Fout bij aanmaken album', 'error');
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit album wilt verwijderen? Alle foto\'s worden ook verwijderd!')) return;
    
    // Als geen backend, gebruik lokale state
    if (!API_BASE) {
      const updatedAlbums = albums.filter(a => a.id !== id);
      setAlbums(updatedAlbums);
      syncToLocalStorage();
      showToast('Album verwijderd! 🗑️ (lokaal)', 'success');
      return;
    }

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
    // Als geen backend, gebruik lokale object URLs
    if (!API_BASE) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        uploadedUrls.push(URL.createObjectURL(files[i]));
      }
      // Update album in lokale state
      const updatedAlbums = albums.map(album => 
        album.id === albumId 
          ? { ...album, images: [...album.images, ...uploadedUrls] }
          : album
      );
      setAlbums(updatedAlbums);
      syncToLocalStorage();
      showToast(`${uploadedUrls.length} foto's toegevoegd! 📸 (lokaal)`, 'success');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    try {
      const response = await fetch(`${API_BASE}/albums/${albumId}/images`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchData();
          showToast(`${data.images.length} foto's toegevoegd! 📸`, 'success');
        }
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

  // Download handlers
  const handleAddDownload = async () => {
    if (!downloadForm.file || !downloadForm.title) {
      showToast('Vul een titel in en selecteer een bestand', 'error');
      return;
    }
    
    // Als geen backend, gebruik lokale state met object URL
    if (!API_BASE) {
      const objectUrl = URL.createObjectURL(downloadForm.file);
      const newDownload = {
        id: Date.now().toString(),
        title: downloadForm.title,
        filename: objectUrl,
        uploadDate: new Date().toISOString()
      };
      const updatedDownloads = [...downloads, newDownload];
      setDownloads(updatedDownloads);
      setShowDownloadModal(false);
      setDownloadForm({ title: '', file: null });
      syncToLocalStorage();
      showToast('Document toegevoegd! 📄 (lokaal opgeslagen)', 'success');
      return;
    }
    
    const formData = new FormData();
    formData.append('document', downloadForm.file);
    formData.append('title', downloadForm.title);
    
    try {
      const response = await fetch(`${API_BASE}/downloads`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDownloads([...downloads, data.item]);
          setShowDownloadModal(false);
          setDownloadForm({ title: '', file: null });
          showToast('Document toegevoegd! 📄', 'success');
        }
      }
    } catch (error) {
      showToast('Fout bij uploaden document', 'error');
    }
  };

  const handleDeleteDownload = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit document wilt verwijderen?')) return;
    
    // Als geen backend, gebruik lokale state
    if (!API_BASE) {
      const updatedDownloads = downloads.filter(d => d.id !== id);
      setDownloads(updatedDownloads);
      syncToLocalStorage();
      showToast('Document verwijderd! 🗑️ (lokaal)', 'success');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/downloads/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setDownloads(downloads.filter(d => d.id !== id));
        showToast('Document verwijderd! 🗑️', 'success');
      }
    } catch (error) {
      showToast('Fout bij verwijderen', 'error');
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

  // Navigation items - Simplified (no Team, no Pages as separate tabs)
  const navItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard', color: 'from-emerald-500 to-green-600' },
    { id: 'enrollments', icon: <ClipboardList size={20} />, label: 'Inschrijvingen', color: 'from-blue-500 to-indigo-600', badge: enrollments.filter(e => e.status === 'nieuw').length },
    { id: 'news', icon: <FileText size={20} />, label: 'Nieuws', color: 'from-emerald-500 to-green-600' },
    { id: 'calendar', icon: <Calendar size={20} />, label: 'Kalender', color: 'from-red-500 to-rose-600' },
    { id: 'gallery', icon: <Camera size={20} />, label: "Foto's", color: 'from-emerald-500 to-green-600' },
    { id: 'downloads', icon: <FileEdit size={20} />, label: 'Downloads', color: 'from-blue-500 to-indigo-600' },
    { id: 'ouderwerkgroep', icon: <Heart size={20} />, label: 'Ouderwerkgroep', color: 'from-red-500 to-rose-600' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Instellingen', color: 'from-gray-500 to-gray-600' },
    { id: 'inbox', icon: <Inbox size={20} />, label: 'Inbox', color: 'from-red-500 to-rose-600', badge: submissions.filter(s => s.status === 'Nieuw').length },
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

        {/* Enrollments Section */}
        {activeTab === 'enrollments' && (
          <EnrollmentsSection 
            enrollments={enrollments}
            onRefresh={async () => {
              try {
                const response = await fetch(`${API_BASE}/enrollments`);
                if (response.ok) {
                  const data = await response.json();
                  setEnrollments(data);
                  showToast('Data ververst!', 'success');
                }
              } catch (error) {
                showToast('Fout bij verversen', 'error');
              }
            }}
            onUpdateStatus={async (id, status) => {
              try {
                const response = await fetch(`${API_BASE}/enrollments/${id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status })
                });
                if (response.ok) {
                  setEnrollments(enrollments.map(e => e.id === id ? { ...e, status } : e));
                  showToast('Status bijgewerkt!', 'success');
                }
              } catch (error) {
                showToast('Fout bij bijwerken status', 'error');
              }
            }}
            onDelete={async (id) => {
              if (!confirm('Weet je zeker dat je deze inschrijving wilt verwijderen?')) return;
              try {
                const response = await fetch(`${API_BASE}/enrollments/${id}`, { method: 'DELETE' });
                if (response.ok) {
                  setEnrollments(enrollments.filter(e => e.id !== id));
                  showToast('Inschrijving verwijderd!', 'success');
                }
              } catch (error) {
                showToast('Fout bij verwijderen', 'error');
              }
            }}
          />
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
          <CalendarSection 
            events={events} 
            onAddEvent={() => setShowEventModal(true)}
            onDeleteEvent={handleDeleteEvent}
          />
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

        {/* Downloads Section */}
        {activeTab === 'downloads' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">📄 Downloads Beheer</h2>
                <p className="text-gray-500 text-sm md:text-base">Beheer documenten voor ouders (schoolreglement, infobrochure, etc.)</p>
              </div>
              <ColorButton color="green" icon={<Plus size={18} />} onClick={() => setShowDownloadModal(true)}>
                Document Toevoegen
              </ColorButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {downloads.map((download) => (
                <ColorCard key={download.id} className="group">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-4 rounded-xl">
                      <FileText size={32} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-800 truncate">{download.title}</h3>
                      <p className="text-gray-500 text-sm truncate">{download.originalName || download.filename}</p>
                      <p className="text-gray-400 text-xs mt-1">Geüpload: {download.uploadDate}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <a 
                      href={`/documents/${download.filename}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <ExternalLink size={14} /> Bekijken
                    </a>
                    <button 
                      onClick={() => handleDeleteDownload(download.id)} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </ColorCard>
              ))}
              
              {downloads.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nog geen documenten toegevoegd</p>
                  <p className="text-sm">Klik op "Document Toevoegen" om te beginnen</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ouderwerkgroep Section */}
        {activeTab === 'ouderwerkgroep' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">💖 Ouderwerkgroep</h2>
                <p className="text-gray-500 text-sm md:text-base">Beheer activiteiten met foto's</p>
              </div>
              <ColorButton color="red" icon={<Plus size={18} />} onClick={() => setShowOuderwerkgroepModal(true)}>
                Nieuwe Activiteit
              </ColorButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {ouderwerkgroep.map((activity) => (
                <ColorCard key={activity.id} className="group">
                  {/* Photo carousel preview */}
                  <div className="relative mb-4">
                    {activity.images && activity.images.length > 0 ? (
                      <>
                        <img src={activity.images[0]} alt={activity.title} className="w-full h-32 md:h-40 object-cover rounded-xl" />
                        {activity.images.length > 1 && (
                          <span className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-700">
                            +{activity.images.length - 1} foto's
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-32 md:h-40 bg-gradient-to-br from-red-100 to-rose-100 rounded-xl flex items-center justify-center">
                        <Camera size={32} className="text-red-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  {activity.images && activity.images.length > 1 && (
                    <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                      {activity.images.slice(0, 5).map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ))}
                      {activity.images.length > 5 && (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-500">
                          +{activity.images.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <h3 className="font-bold text-base md:text-lg text-gray-800 mb-2">{activity.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{activity.description}</p>
                  
                  {/* Add photos button */}
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-red-400 hover:bg-red-50 transition cursor-pointer mb-3">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id={`upload-owg-${activity.id}`}
                      onChange={async (e) => {
                        if (!e.target.files) return;
                        const formData = new FormData();
                        for (let i = 0; i < e.target.files.length; i++) {
                          formData.append('images', e.target.files[i]);
                        }
                        formData.append('category', 'ouderwerkgroep');
                        try {
                          const res = await fetch(`${API_BASE}/upload-multiple`, { method: 'POST', body: formData });
                          const { paths } = await res.json();
                          const newImages = [...(activity.images || []), ...paths];
                          const updatedActivity = { ...activity, images: newImages };
                          await fetch(`${API_BASE}/ouderwerkgroep/${activity.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(updatedActivity)
                          });
                          setOuderwerkgroep(ouderwerkgroep.map(a => a.id === activity.id ? updatedActivity : a));
                          showToast('Foto\'s toegevoegd!', 'success');
                        } catch (error) {
                          showToast('Upload mislukt', 'error');
                        }
                      }}
                    />
                    <label htmlFor={`upload-owg-${activity.id}`} className="cursor-pointer">
                      <Upload size={16} className="mx-auto text-red-400 mb-1" />
                      <p className="text-xs text-gray-500">Foto's toevoegen</p>
                    </label>
                  </div>
                  
                  <div className="flex justify-end">
                    <button onClick={() => handleDeleteOuderwerkgroepActivity(activity.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </ColorCard>
              ))}
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
                  <FileText /> Onze School
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Adres</label>
                    <input
                      type="text"
                      value={config.contactAddress || ''}
                      onChange={(e) => setConfig({ ...config, contactAddress: e.target.value })}
                      className="w-full p-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none"
                      placeholder="Kloosterstraat 4a, 8340 Sijsele"
                    />
                  </div>
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">Telefoon Kloosterstraat</label>
                    <input
                      type="text"
                      value={config.contactPhoneKloosterstraat || ''}
                      onChange={(e) => setConfig({ ...config, contactPhoneKloosterstraat: e.target.value })}
                      className="w-full p-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none"
                      placeholder="050 36 32 25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Telefoon Hovingenlaan</label>
                    <input
                      type="text"
                      value={config.contactPhoneHovingenlaan || ''}
                      onChange={(e) => setConfig({ ...config, contactPhoneHovingenlaan: e.target.value })}
                      className="w-full p-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none"
                      placeholder="050 36 09 71"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">GSM</label>
                    <input
                      type="text"
                      value={config.contactPhoneGSM || ''}
                      onChange={(e) => setConfig({ ...config, contactPhoneGSM: e.target.value })}
                      className="w-full p-3 border-2 border-red-200 rounded-xl focus:border-red-500 focus:outline-none"
                      placeholder="0496 23 57 01"
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

            <ColorButton color="green" size="md" icon={<Save size={20} />} onClick={handleSaveConfig} className="w-full sm:w-auto">
              Alle Instellingen Opslaan
            </ColorButton>

            {/* Custom Pages Management - Only show custom pages */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800">📄 Extra Pagina's</h3>
                  <p className="text-gray-500 text-sm">Maak tijdelijke pagina's voor evenementen of speciale projecten</p>
                </div>
                <ColorButton color="green" size="sm" icon={<Plus size={16} />} onClick={() => { 
                  setEditingPage(null); 
                  setPageForm({ name: '', slug: '', content: '', pageImages: [] }); 
                  setShowPageModal(true); 
                }}>
                  Nieuwe Pagina
                </ColorButton>
              </div>

              {/* Only show custom pages */}
              {pages.filter(p => p.type === 'custom').length === 0 ? (
                <ColorCard className="text-center py-8">
                  <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Geen extra pagina's</p>
                  <p className="text-gray-400 text-sm mt-1">Klik op "Nieuwe Pagina" om er een toe te voegen</p>
                </ColorCard>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pages.filter(p => p.type === 'custom').map((page) => (
                    <ColorCard key={page.id} className="group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-800">{page.name}</h4>
                          <p className="text-xs text-gray-500">/{page.slug}</p>
                        </div>
                        <button
                          onClick={() => handleTogglePage(page.id)}
                          className={`p-2 rounded-lg transition ${page.active ? 'text-emerald-500 bg-emerald-100' : 'text-gray-400 bg-gray-200'}`}
                        >
                          {page.active ? <Eye size={18} /> : <ToggleLeft size={18} />}
                        </button>
                      </div>
                      {page.content && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{page.content}</p>
                      )}
                      {page.pageImages && page.pageImages.length > 0 && (
                        <div className="flex gap-1 mb-3">
                          {page.pageImages.slice(0, 4).map((img, idx) => (
                            <img key={idx} src={img} alt="" className="w-10 h-10 rounded object-cover" />
                          ))}
                          {page.pageImages.length > 4 && (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                              +{page.pageImages.length - 4}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditPage(page)} 
                          className="flex-1 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm font-medium transition"
                        >
                          Bewerken
                        </button>
                        <button 
                          onClick={() => handleDeletePage(page.id)} 
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </ColorCard>
                  ))}
                </div>
              )}
            </div>
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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Foto's (meerdere mogelijk)</label>
            <ImageUploader
              category="ouderwerkgroep"
              label="Foto's Uploaden"
              multiple={true}
              onUpload={(paths) => setOuderwerkgroepForm({ ...ouderwerkgroepForm, images: [...ouderwerkgroepForm.images, ...paths] })}
            />
            {ouderwerkgroepForm.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {ouderwerkgroepForm.images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      onClick={() => setOuderwerkgroepForm({
                        ...ouderwerkgroepForm,
                        images: ouderwerkgroepForm.images.filter((_, i) => i !== idx)
                      })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ColorButton color="red" size="md" className="w-full" onClick={handleAddOuderwerkgroepActivity}>
            Activiteit Toevoegen
          </ColorButton>
        </div>
      </Modal>

      {/* Download Modal */}
      <Modal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} title="📄 Document Toevoegen" color="green">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Document Titel</label>
            <input
              type="text"
              value={downloadForm.title}
              onChange={(e) => setDownloadForm({ ...downloadForm, title: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              placeholder="Bijv: Schoolreglement 2025"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Document Bestand</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.ics"
                className="hidden"
                id="download-file-input"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setDownloadForm({ ...downloadForm, file: e.target.files[0] });
                  }
                }}
              />
              <label htmlFor="download-file-input" className="cursor-pointer">
                {downloadForm.file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={32} className="text-blue-500" />
                    <div className="text-left">
                      <p className="font-bold text-gray-800">{downloadForm.file.name}</p>
                      <p className="text-sm text-gray-500">{(downloadForm.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Klik om een bestand te selecteren</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint of ICS</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <ColorButton color="green" size="md" className="w-full" onClick={handleAddDownload}>
            Document Toevoegen
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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pagina Inhoud</label>
            <textarea
              value={pageForm.content}
              onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              rows={4}
              placeholder="Beschrijf wat er op deze pagina komt..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Foto's</label>
            <ImageUploader
              category="pages"
              label="Foto's Uploaden"
              multiple={true}
              onUpload={(paths) => setPageForm({ ...pageForm, pageImages: [...pageForm.pageImages, ...paths] })}
            />
            {pageForm.pageImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {pageForm.pageImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <button
                      onClick={() => setPageForm({
                        ...pageForm,
                        pageImages: pageForm.pageImages.filter((_, i) => i !== idx)
                      })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <ColorButton 
            color="green" 
            size="md" 
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
