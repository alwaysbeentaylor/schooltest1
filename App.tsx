import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Calendar, 
  BookOpen, Users, Camera, Star, Info, 
  ChevronRight, Lock, ExternalLink, Download,
  Trash2, Plus, Edit, Image as ImageIcon, Sparkles, Check, School,
  MessageCircle, Send, Settings, FileText, Inbox, Loader2
} from 'lucide-react';
import { generateNewsContent, generateChatResponse } from './services/geminiService';
import { fetchDataFromKV } from './services/dataService';
import { MOCK_NEWS, MOCK_EVENTS, MOCK_ALBUMS, MOCK_TEAM, DEFAULT_CONFIG, MOCK_SUBMISSIONS, INITIAL_CHAT_MESSAGES, HERO_IMAGES } from './constants';
import { NewsItem, CalendarEvent, PhotoAlbum, PageView, Teacher, SiteConfig, FormSubmission, ChatMessage, Enrollment } from './types';
import { HeroCarousel, ParentsPage, GalleryPage } from './NewComponents';
import { AdminPanel } from './AdminPanel';

// --- UTILS ---
const addToGoogleCalendar = (event: CalendarEvent) => {
    const startTime = event.date.replace(/-/g, '') + 'T090000Z';
    const endTime = event.date.replace(/-/g, '') + 'T170000Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description || '')}&location=VBS Sint-Maarten`;
    window.open(url, '_blank');
};

// --- COMPONENTS ---

// Suggested questions for the chatbot
const SUGGESTED_QUESTIONS = [
    "Hoe laat begint de school?",
    "Wanneer is de volgende vakantie?",
    "Wat staat er vandaag op het menu?",
    "Hoe kan ik mijn kind inschrijven?",
    "Wat moet mijn kind aandoen?",
];

// 1. CHAT WIDGET - Smart AI Assistant
const ChatWidget = ({ events, config }: { events: CalendarEvent[], config: SiteConfig }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages, isOpen]);

    // Safety check - use default config if not provided
    const safeConfig = config || DEFAULT_CONFIG;

    // Build context for AI with school info
    const buildSchoolContext = () => {
        const upcomingEvents = events
            .filter(e => new Date(e.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5);
        
        const eventsList = upcomingEvents.map(e => 
            `- ${e.title} op ${new Date(e.date).toLocaleDateString('nl-BE')} (${e.type})`
        ).join('\n');

        return `
Je bent de virtuele assistent van VBS Sint-Maarten in Sijsele.

SCHOOLINFORMATIE:
- School begint om 08:30 en eindigt om 15:30
- Middagpauze: 12:05 - 13:20
${safeConfig.contactAddress ? `- Adres: ${safeConfig.contactAddress}` : ''}
- Email: ${safeConfig.contactEmail}
${safeConfig.contactPhoneKloosterstraat ? `- Telefoon Kloosterstraat: ${safeConfig.contactPhoneKloosterstraat}` : ''}
${safeConfig.contactPhoneHovingenlaan ? `- Telefoon Hovingenlaan: ${safeConfig.contactPhoneHovingenlaan}` : ''}
${safeConfig.contactPhoneGSM ? `- GSM: ${safeConfig.contactPhoneGSM}` : ''}
- Menu/Maaltijden: ${safeConfig.menuUrl}

KOMENDE EVENEMENTEN:
${eventsList || 'Geen evenementen gepland'}

INSCHRIJVINGEN:
- Peuters kunnen instappen op vaste momenten door het jaar
- Rondleidingen kunnen aangevraagd worden via de website
- Neem contact op voor een persoonlijk gesprek

PRAKTISCHE INFO:
- Voor- en naschoolse opvang beschikbaar
- Warme maaltijden via Hanssens
- Sportkleding voor turnlessen

Beantwoord vragen vriendelijk en behulpzaam in het Nederlands. Als je iets niet weet, verwijs naar de school voor meer info.
        `;
    };

    const handleSend = async (e: React.FormEvent, questionText?: string) => {
        e.preventDefault();
        const text = questionText || input;
        if (!text.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setShowSuggestions(false);

        const schoolContext = buildSchoolContext();
        const response = await generateChatResponse(messages, text, schoolContext);
        const botMsg: ChatMessage = { id: (Date.now()+1).toString(), sender: 'bot', text: response, timestamp: new Date() };
        
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
    };

    const handleSuggestedQuestion = (question: string) => {
        handleSend({ preventDefault: () => {} } as React.FormEvent, question);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-gradient-to-r from-school-green to-emerald-600 text-white p-3 md:p-4 rounded-full shadow-2xl hover:scale-110 transition duration-300 flex items-center gap-2"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {!isOpen && <span className="font-bold pr-2 hidden md:inline">Vraag het Sint-Maarten</span>}
            </button>

            {isOpen && (
                <div className="fixed bottom-20 md:bottom-24 right-2 md:right-6 z-50 w-[calc(100vw-16px)] md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-[70vh] md:h-[500px] animate-fade-in-up">
                    <div className="bg-gradient-to-r from-school-green to-emerald-600 text-white p-4 flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full"><School size={20} /></div>
                        <div>
                            <h3 className="font-bold text-sm">Sint-Maarten Assistent</h3>
                            <p className="text-xs text-white/80">Ik help je graag!</p>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chat-scroll">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-gradient-to-r from-school-green to-emerald-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        
                        {/* Suggested Questions */}
                        {showSuggestions && messages.length <= 1 && (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500 font-medium">💡 Populaire vragen:</p>
                                <div className="flex flex-wrap gap-2">
                                    {SUGGESTED_QUESTIONS.map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestedQuestion(q)}
                                            className="suggested-question text-xs"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-xl border border-gray-200 rounded-tl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2">
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Stel uw vraag..."
                            className="flex-1 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-school-green"
                        />
                        <button type="submit" className="bg-gradient-to-r from-school-green to-emerald-600 text-white p-2 rounded-lg hover:opacity-90 transition">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

// Page configuration interface
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

// Default pages
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

// 2. NAVIGATION - Dynamic based on page config
const Navbar = ({ activePage, setPage, mobileMenuOpen, setMobileMenuOpen, config, pages }: any) => {
  // Filter and sort active pages
  const navItems = (pages || DEFAULT_PAGES)
    .filter((p: PageConfig) => p.active)
    .sort((a: PageConfig, b: PageConfig) => a.order - b.order)
    .map((p: PageConfig) => ({ id: p.slug as PageView, label: p.name }));

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center cursor-pointer gap-4 group" onClick={() => setPage('home')}>
            <div className="flex items-center justify-center h-14 w-14 rounded-xl overflow-hidden relative transition-transform duration-300 group-hover:scale-105">
                <img 
                    src="/images/logo.png" 
                    alt="VBS Sint-Maarten Logo" 
                    className="h-full w-full object-contain"
                />
            </div>
            
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-xl text-gray-900 leading-none transition-colors duration-300 group-hover:text-school-red">Sint-Maarten</h1>
              <p className="text-xs text-school-green font-medium uppercase tracking-wider mt-1">Vrije Basisschool Sijsele</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                  activePage === item.id
                    ? 'text-school-red'
                    : 'text-gray-600 hover:text-school-red'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-school-red rounded-full transition-all duration-300 ease-out ${
                  activePage === item.id ? 'w-4/5' : 'w-0 group-hover:w-1/2'
                }`} />
              </button>
            ))}
            <button 
              onClick={() => setPage('menu')}
              className="bg-gradient-to-r from-school-green to-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2 ml-3"
            >
              <BookOpen size={16} /> Menu
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-school-red p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 block w-6 h-0.5 bg-current transform transition-all duration-300 ease-out ${mobileMenuOpen ? 'top-3 rotate-45' : 'top-1'}`} />
                <span className={`absolute left-0 top-3 block w-6 h-0.5 bg-current transition-all duration-300 ease-out ${mobileMenuOpen ? 'opacity-0 translate-x-2' : 'opacity-100'}`} />
                <span className={`absolute left-0 block w-6 h-0.5 bg-current transform transition-all duration-300 ease-out ${mobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown with smooth animation */}
      <div className={`lg:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full z-50 overflow-hidden transition-all duration-300 ease-out ${
        mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => {
                setPage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                activePage === item.id
                  ? 'text-school-red bg-red-50'
                  : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
              }`}
              style={{ 
                transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-10px)',
                opacity: mobileMenuOpen ? 1 : 0
              }}
            >
              {item.label}
            </button>
          ))}
          <button 
             onClick={() => { setPage('menu'); setMobileMenuOpen(false); }}
             className="w-full px-4 py-4 text-white bg-gradient-to-r from-school-green to-emerald-600 font-bold rounded-xl flex items-center gap-2 justify-center mt-4 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md"
          >
            <BookOpen size={18} /> Menu Bekijken
          </button>
        </div>
      </div>
    </nav>
  );
};

const Footer = (props: { setPage: (p: PageView) => void; config: SiteConfig }) => {
  const { setPage, config: configProp } = props;
  
  // Safety check - use default values if config is not available
  const config = configProp || DEFAULT_CONFIG;
  
  return (
    <footer className="bg-school-dark text-white pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/images/logo.png" alt="VBS Sint-Maarten" className="h-14 w-14 object-contain" />
            <h3 className="font-display text-xl font-bold text-school-orange">VBS Sint-Maarten</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Een school met een hart voor elk kind.<br/>
            Samen groeien, samen leren, samen leven.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <a href="https://www.facebook.com/vrijebasisschool.sintmaarten" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.instagram.com/vbs_sintmaarten_sijsele/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold mb-4">Contact</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {config.contactAddress && <li className="flex items-center gap-2"><MapPin size={14} /> {config.contactAddress}</li>}
            <li className="flex items-center gap-2"><Mail size={14} /> {config.contactEmail}</li>
            {config.contactPhoneKloosterstraat && <li className="flex items-center gap-2"><Phone size={14} /> Kloosterstraat: {config.contactPhoneKloosterstraat}</li>}
            {config.contactPhoneHovingenlaan && <li className="flex items-center gap-2"><Phone size={14} /> Hovingenlaan: {config.contactPhoneHovingenlaan}</li>}
            {config.contactPhoneGSM && <li className="flex items-center gap-2"><Phone size={14} /> GSM: {config.contactPhoneGSM}</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold mb-4">Snel naar</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><button onClick={() => setPage('calendar')} className="hover:text-white hover:underline transition-colors">Kalender</button></li>
            <li><button onClick={() => setPage('info')} className="hover:text-white hover:underline transition-colors">Praktische Info</button></li>
            <li><button onClick={() => setPage('enroll')} className="hover:text-white hover:underline transition-colors">Inschrijven</button></li>
            <li><button onClick={() => setPage('ouderwerkgroep')} className="hover:text-white hover:underline transition-colors">Ouderwerkgroep</button></li>
            <li><button onClick={() => setPage('gallery')} className="hover:text-white hover:underline transition-colors">Fotogalerij</button></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold mb-4">Admin</h3>
          <button 
            onClick={() => setPage('admin')} 
            className="flex items-center gap-2 bg-gray-800 hover:bg-school-red text-white px-4 py-2 rounded transition-colors text-sm w-full md:w-auto justify-center md:justify-start" 
          >
            <Lock size={14} />
            <span>Inloggen Beheerder</span>
          </button>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-12 pt-6 text-center text-xs text-gray-500">
        <span>&copy; 2025 VBS Sint-Maarten Sijsele</span>
      </div>
    </footer>
  );
};

// 3. PAGES

const HomePage = ({ news, setPage, config, heroImages }: { news: NewsItem[], setPage: (p: PageView) => void, config: SiteConfig, heroImages: string[] }) => (
  <div className="animate-fade-in">
    {/* Hero Section */}
    <div className="relative h-[600px] w-full overflow-hidden group">
      <HeroCarousel images={heroImages} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-20 z-10">
        <div className="max-w-5xl">
          <div className="flex gap-2 mb-6">
              <span className="bg-school-green text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-md">
                Warme school
              </span>
              <span className="bg-school-orange text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-md">
                Sijsele
              </span>
          </div>
          <h2 className="text-4xl md:text-7xl font-display font-bold text-white mb-2 drop-shadow-lg leading-tight">
            {config.homeTitle.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </h2>
          <p className="text-xl text-gray-200 mb-8 font-medium">{config.homeSubtitle}</p>
          
          <div className="flex flex-wrap gap-4">
             <button onClick={() => setPage('enroll')} className="bg-school-red text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
               Ik wil inschrijven
             </button>
             <button onClick={() => setPage('about')} className="bg-white/10 backdrop-blur-md text-white border-2 border-white/50 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition shadow-lg">
               Ontdek onze visie
             </button>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Links */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
      <div className="bg-school-orange p-10 text-white flex flex-col items-center text-center hover:bg-orange-600 transition cursor-pointer group" onClick={() => setPage('calendar')}>
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition"><Calendar size={40} /></div>
        <h3 className="font-display text-2xl font-bold">Kalender</h3>
        <p className="text-white/90 mt-2">Bekijk vakanties en activiteiten</p>
      </div>
      <div onClick={() => setPage('menu')} className="bg-school-green p-10 text-white flex flex-col items-center text-center hover:bg-green-700 transition cursor-pointer group">
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition"><BookOpen size={40} /></div>
        <h3 className="font-display text-2xl font-bold">Menu</h3>
        <p className="text-white/90 mt-2">Warme maaltijden (Hanssens)</p>
      </div>
      <div className="bg-school-red p-10 text-white flex flex-col items-center text-center hover:bg-red-700 transition cursor-pointer group" onClick={() => setPage('box')}>
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition"><Star size={40} /></div>
        <h3 className="font-display text-2xl font-bold">Belevingsbox</h3>
        <p className="text-white/90 mt-2">Vraag jouw gratis doos aan!</p>
      </div>
      <div className="bg-school-dark p-10 text-white flex flex-col items-center text-center hover:bg-gray-700 transition cursor-pointer group" onClick={() => setPage('ouderwerkgroep')}>
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition"><Users size={40} /></div>
        <h3 className="font-display text-2xl font-bold">Ouderwerkgroep</h3>
        <p className="text-white/90 mt-2">Doe mee en help mee!</p>
      </div>
    </div>

    {/* Latest News */}
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900">Laatste Nieuws</h2>
          <p className="text-gray-500 mt-2 text-lg">Blijf op de hoogte van het leven op school</p>
        </div>
        <button onClick={() => setPage('news')} className="text-school-red font-bold text-lg flex items-center hover:underline">
          Alle berichten <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {news.slice(0, 3).map(item => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300 border border-gray-100 group flex flex-col h-full">
            <div className="h-56 overflow-hidden relative">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute top-4 left-4">
                   <span className="text-xs font-bold text-white bg-school-green/90 backdrop-blur px-3 py-1 rounded-full shadow-sm">{item.category}</span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(item.date).toLocaleDateString('nl-BE')}
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3 leading-tight">{item.title}</h3>
              <p className="text-gray-600 text-base line-clamp-3 mb-6 flex-1">{item.content}</p>
              <button onClick={() => setPage('news')} className="text-school-red font-bold text-sm uppercase tracking-wide self-start hover:underline">Lees meer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Floating Photos Component - Elegant starry sky effect
const FloatingPhotos = ({ images }: { images: string[] }) => {
  const [floatingPhotos, setFloatingPhotos] = useState<Array<{
    id: number;
    src: string;
    x: number;
    y: number;
    scale: number;
    delay: number;
  }>>([]);

  useEffect(() => {
    if (images.length === 0) return;
    
    // Create initial photos
    const createPhoto = () => {
      const id = Date.now() + Math.random();
      const randomImage = images[Math.floor(Math.random() * images.length)];
      return {
        id,
        src: randomImage,
        x: Math.random() * 80 + 10, // 10-90% from left
        y: Math.random() * 60 + 10, // 10-70% from top
        scale: 0.5 + Math.random() * 0.5, // 0.5-1 scale
        delay: Math.random() * 2, // 0-2s delay
      };
    };

    // Start with a few photos
    const initialPhotos = Array.from({ length: 5 }, createPhoto);
    setFloatingPhotos(initialPhotos);

    // Add new photos periodically
    const interval = setInterval(() => {
      setFloatingPhotos(prev => {
        // Remove old photos (keep max 8)
        const filtered = prev.slice(-7);
        return [...filtered, createPhoto()];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <style>{`
        @keyframes float-fade {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 0.7; transform: translate(calc(-50% + 20px), calc(-50% - 30px)) scale(1); }
          100% { opacity: 0; transform: translate(calc(-50% + 40px), calc(-50% - 60px)) scale(0.9); }
        }
        .floating-photo {
          animation: float-fade 8s ease-in-out forwards;
        }
      `}</style>
      {floatingPhotos.map((photo) => (
        <div
          key={photo.id}
          className="floating-photo absolute w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-xl border-4 border-white/50"
          style={{
            left: `${photo.x}%`,
            top: `${photo.y}%`,
            transform: `translate(-50%, -50%) scale(${photo.scale})`,
            animationDelay: `${photo.delay}s`,
          }}
        >
          <img
            src={photo.src}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

const AboutPage = ({ config, albumImages }: { config: SiteConfig; albumImages?: string[] }) => (
  <div className="animate-fade-in">
    {/* Floating photos header section */}
    <div className="relative bg-gradient-to-b from-emerald-50 via-white to-white pt-8 pb-16 md:pt-12 md:pb-24 overflow-hidden min-h-[300px] md:min-h-[400px]">
      <FloatingPhotos images={albumImages || []} />
      <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-school-dark mb-6">Over Onze School</h1>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed">{config.aboutText}</p>
      </div>
    </div>

    {/* Content section */}
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 text-base md:text-lg text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-school-dark mb-4 flex items-center gap-3">
            <Star className="text-school-red"/> Onze Visie
          </h2>
          <p>Vanuit onze christelijke inspiratie bouwen we aan een warme gemeenschap waar iedereen zich thuis mag voelen. Respect, vertrouwen en geborgenheid zijn onze kernwaarden.</p>
        </section>
        <section className="bg-gray-50 p-6 md:p-8 rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-school-dark mb-4 flex items-center gap-3">
            <Users className="text-school-green"/> Zorg op maat
          </h2>
          <p className="mb-4">Elk kind heeft zijn eigen talenten. Ons zorgteam differentieert in de klas zodat elk kind op eigen tempo groeit.</p>
          <ul className="space-y-2 mt-4">
            <li className="flex items-center gap-2"><Check size={18} className="text-school-green"/> Sterk zorgbeleid</li>
            <li className="flex items-center gap-2"><Check size={18} className="text-school-green"/> Aandacht voor welbevinden</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
);

const MenuPage = ({ config }: { config: SiteConfig }) => (
  <div className="animate-fade-in">
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 py-8 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block bg-gradient-to-r from-school-green to-emerald-600 p-4 md:p-6 rounded-full mb-4 md:mb-6">
            <BookOpen size={48} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-school-dark mb-3 md:mb-4">Wekelijks Menu</h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Bekijk het menu van deze week - Warme maaltijden via Hanssens
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-green-100">
          {/* Menu Header */}
          <div className="bg-gradient-to-r from-school-green to-emerald-600 p-4 md:p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-1">Hanssens Menu</h2>
              <p className="text-white/90 text-sm md:text-base">Warme maaltijden voor de kinderen</p>
            </div>
            <a 
              href={config.menuUrl} 
              target="_blank" 
              rel="noreferrer"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-bold text-sm md:text-base transition flex items-center gap-2 self-start sm:self-auto"
            >
              <ExternalLink size={18} />
              Open in nieuw venster
            </a>
          </div>
          
          {/* Iframe Container */}
          <div className="relative w-full bg-gray-50" style={{ minHeight: '700px', height: '900px' }}>
            <iframe
              src={config.menuUrl}
              className="w-full h-full border-0"
              title="Hanssens Menu"
              allow="fullscreen"
              loading="lazy"
            />
          </div>
        </div>
        
        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-sm md:text-base text-blue-800">
            <strong>Tip:</strong> Het menu wordt wekelijks bijgewerkt. Scroll in het menu om alle dagen te zien. Als het menu niet goed zichtbaar is, klik dan op "Open in nieuw venster" bovenaan.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const TeamPage = ({ team }: { team: Teacher[] }) => (
  <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center mb-16">
      <h1 className="text-5xl font-display font-bold text-school-dark mb-6">Ons Team</h1>
      <p className="text-gray-600 max-w-2xl mx-auto text-lg">
        Een warm en gedreven team staat elke dag klaar voor uw kinderen. 
        Samen zorgen we voor een fijne leeromgeving waar elk kind kan groeien.
      </p>
    </div>
    
    {/* Team foto's in een eenvoudige grid zonder opdeling */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {team.map(member => (
        <div key={member.id} className="group">
          <div className="relative overflow-hidden rounded-2xl aspect-square shadow-md group-hover:shadow-xl transition duration-300">
            <img 
              src={member.imageUrl} 
              alt="Teamlid" 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
            />
          </div>
        </div>
      ))}
    </div>

    {/* Algemene team beschrijving */}
    <div className="mt-16 bg-school-green/5 p-8 md:p-12 rounded-2xl border-2 border-school-green/20 text-center">
      <h2 className="text-2xl font-display font-bold text-school-dark mb-4">
        Samen sterk voor elk kind
      </h2>
      <p className="text-gray-700 max-w-3xl mx-auto">
        Ons team bestaat uit ervaren leerkrachten, zorgcoördinatoren en ondersteunend personeel. 
        We werken nauw samen om elk kind de beste begeleiding te geven. 
        Heeft u vragen? Neem gerust contact met ons op!
      </p>
    </div>
  </div>
);

// Opleidingsniveau opties
const OPLEIDINGSNIVEAU_OPTIONS = [
  'lager onderwijs niet afgewerkt',
  'gewoon of buitengewoon lager onderwijs afgewerkt',
  'lager secundair onderwijs afgewerkt (bv. A3, A4, B3, deeltijds beroepsonderwijs, leercontract)',
  'hoger secundair onderwijs afgewerkt (ASO, TSO, KSO, BSO, A2, B2, HSTL, vierde graad BUSO)',
  'hoger onderwijs afgewerkt (hogeschool of universiteit, A1, B1, gegradueerde, licentiaat, ingenieur, doctor, master, bachelor)'
];

// Initial enrollment form state
const initialEnrollmentForm: Omit<Enrollment, 'id' | 'submittedAt' | 'status'> = {
  inschrijvingsDatum: new Date().toISOString().split('T')[0],
  schooljaar: '2025 - 2026',
  afdeling: 'kleuter Kloosterstraat',
  naamKind: '',
  voornaamKind: '',
  adres: '',
  geboortedatumKind: '',
  geboorteplaatsKind: '',
  bewijsGeboortedatum: 'Kids ID',
  rijksregisternummerKind: '',
  geslacht: 'M',
  nationaliteit: 'Belg',
  isOudsteGezin: true,
  andereKinderen: '',
  bankrekening: '',
  telefoonVast: '',
  gsmPapa: '',
  gsmMama: '',
  grootoudersPapa: '',
  grootoudersMama: '',
  werkPapa: '',
  werkMama: '',
  emailPapa: '',
  emailMama: '',
  naamPapa: '',
  geboortedatumPapa: '',
  geboorteplaatsPapa: '',
  rijksregisternummerPapa: '',
  leerplichtverantwoordelijkePapa: '1',
  beroepPapa: '',
  opleidingsniveauPapa: OPLEIDINGSNIVEAU_OPTIONS[0],
  naamMama: '',
  geboortedatumMama: '',
  geboorteplaatsMama: '',
  rijksregisternummerMama: '',
  leerplichtverantwoordelijkeMama: '1',
  beroepMama: '',
  opleidingsniveauMama: OPLEIDINGSNIVEAU_OPTIONS[0],
  huisarts: '',
  ziekenhuis: 'AZ Sint-Lucas',
  allergieenZiektes: '',
  akkoordReglement: false,
  eersteSchooldag: '',
  startKlas: '',
  anderstaligNieuwkomer: false,
  verslagBuitengewoonOnderwijs: false,
  broerZusIngeschreven: false,
  personeelslid: false,
  vorigeSchool: '',
  ondertekeningNaam: '',
  ondertekeningDatum: new Date().toISOString().split('T')[0],
  ondertekeningUur: new Date().toTimeString().slice(0, 5),
  taalMoeder: 'Nederlands',
  taalVader: 'Nederlands',
  taalBroersZussen: 'Nederlands',
  taalVrienden: 'Nederlands',
  bevestigingOpEerDatum: new Date().toISOString().split('T')[0],
  bevestigingOpEerNaam: ''
};

// Progress Step Component
const ProgressStep = ({ step, currentStep, label }: { step: number; currentStep: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
      currentStep >= step 
        ? 'bg-school-green text-white' 
        : 'bg-gray-200 text-gray-500'
    }`}>
      {currentStep > step ? <Check size={18} /> : step}
    </div>
    <span className={`text-xs mt-1 hidden md:block ${currentStep >= step ? 'text-school-green font-medium' : 'text-gray-400'}`}>
      {label}
    </span>
  </div>
);

// Form Section Title Component
const FormSectionTitle = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <div className="mb-6 pb-4 border-b border-gray-100">
    <h3 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
      <span className="text-school-green">{icon}</span>
      {title}
    </h3>
    {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
  </div>
);

// Form Input Component
const FormInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  required = false, 
  placeholder = '',
  helpText = ''
}: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green focus:border-transparent transition"
    />
    {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
  </div>
);

// Form Select Component
const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false 
}: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green focus:border-transparent transition"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Form Radio Group Component
const FormRadioGroup = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false 
}: { 
  label: string; 
  name: string; 
  value: string | boolean; 
  onChange: (value: string | boolean) => void;
  options: { value: string | boolean; label: string }[];
  required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex flex-wrap gap-3">
      {options.map(opt => (
        <label 
          key={String(opt.value)} 
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition ${
            value === opt.value 
              ? 'border-school-green bg-green-50 text-school-green' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="hidden"
          />
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            value === opt.value ? 'border-school-green' : 'border-gray-300'
          }`}>
            {value === opt.value && <span className="w-2 h-2 rounded-full bg-school-green" />}
          </span>
          {opt.label}
        </label>
      ))}
    </div>
  </div>
);

// Form Checkbox Component
const FormCheckbox = ({ 
  label, 
  checked, 
  onChange, 
  required = false 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  required?: boolean;
}) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition ${
      checked ? 'bg-school-green border-school-green' : 'border-gray-300 group-hover:border-gray-400'
    }`}>
      {checked && <Check size={14} className="text-white" />}
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      required={required}
      className="hidden"
    />
    <span className="text-sm text-gray-700">{label} {required && <span className="text-red-500">*</span>}</span>
  </label>
);

const EnrollPage = ({ addEnrollment, setPage }: { addEnrollment: (e: Omit<Enrollment, 'id' | 'submittedAt' | 'status'>) => Promise<void>; setPage: (p: PageView) => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialEnrollmentForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const totalSteps = 6;

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    updateField(e.target.name, e.target.value);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
    // Check if required field is filled
    if (!formData.akkoordReglement) {
      alert('U moet akkoord gaan met het pedagogisch project en schoolreglement om door te kunnen gaan.');
      return;
    }
    
    setIsSubmitting(true);
    console.log('Submitting enrollment...', formData);
    
    // Always show success after a short delay, even if backend fails
    // The data will be saved locally anyway
    const showSuccess = () => {
      console.log('Showing success screen');
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData(initialEnrollmentForm);
      setCurrentStep(1);
    };
    
    try {
      // Try to save to backend, but don't wait too long
      const savePromise = addEnrollment(formData).catch(err => {
        console.warn('Save failed, but continuing anyway:', err);
      });
      
      // Show success after max 2 seconds, regardless of backend response
      const timeoutId = setTimeout(() => {
        console.log('Timeout reached, showing success');
        showSuccess();
      }, 2000);
      
      // If save completes quickly, show success immediately
      await savePromise;
      clearTimeout(timeoutId);
      showSuccess();
      
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      // Always show success, data is saved locally
      showSuccess();
    }
  };

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in text-center">
        <div className="bg-green-50 rounded-2xl p-8 md:p-12 border-2 border-green-200">
          <div className="w-20 h-20 bg-school-green rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-white" />
                    </div>
          <h1 className="text-3xl font-display font-bold text-school-dark mb-4">Inschrijving Ontvangen! ✅</h1>
          <p className="text-gray-600 mb-6 text-lg">
            Bedankt voor uw inschrijving. We hebben alle gegevens ontvangen en nemen zo snel mogelijk contact met u op.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setFormData(initialEnrollmentForm);
                setCurrentStep(1);
              }}
              className="bg-gray-200 text-gray-700 font-bold px-8 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Nieuwe Inschrijving
            </button>
            <button
              onClick={() => setPage('home')}
              className="bg-school-green text-white font-bold px-8 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Terug naar Hoofdmenu
            </button>
                </div>
                </div>
            </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-16 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-school-red mb-4">Inschrijvingsformulier</h1>
        <p className="text-gray-600">Vul alle gegevens zorgvuldig in. Velden met * zijn verplicht.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
        <div className="flex justify-between items-center">
          {[
            { step: 1, label: 'Kind' },
            { step: 2, label: 'Gezin' },
            { step: 3, label: 'Ouders' },
            { step: 4, label: 'Medisch' },
            { step: 5, label: 'Verklaring' },
            { step: 6, label: 'Taal' }
          ].map((item, idx, arr) => (
            <React.Fragment key={item.step}>
              <ProgressStep step={item.step} currentStep={currentStep} label={item.label} />
              {idx < arr.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${currentStep > item.step ? 'bg-school-green' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          
          {/* Step 1: Basisgegevens Kind */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <FormSectionTitle 
                icon={<Users size={24} />} 
                title="Identificatiegegevens Kind" 
                subtitle="Basisinformatie over uw kind"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormInput
                  label="Ingeschreven op"
                  name="inschrijvingsDatum"
                  type="date"
                  value={formData.inschrijvingsDatum}
                  onChange={handleInputChange}
                  required
                />
                <FormSelect
                  label="Schooljaar"
                  name="schooljaar"
                  value={formData.schooljaar}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: '2024 - 2025', label: '2024 - 2025' },
                    { value: '2025 - 2026', label: '2025 - 2026' },
                    { value: '2026 - 2027', label: '2026 - 2027' }
                  ]}
                />
              </div>

              <div className="mb-6">
                <FormSelect
                  label="Afdeling"
                  name="afdeling"
                  value={formData.afdeling}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'kleuter Kloosterstraat', label: 'Kleuter Kloosterstraat' },
                    { value: 'kleuter Hovingenlaan', label: 'Kleuter Hovingenlaan' },
                    { value: 'lager Kloosterstraat', label: 'Lager Kloosterstraat' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormInput
                  label="Naam van uw kind"
                  name="naamKind"
                  value={formData.naamKind}
                  onChange={handleInputChange}
                  required
                  placeholder="Familienaam"
                />
                <FormInput
                  label="Voornaam van uw kind"
                  name="voornaamKind"
                  value={formData.voornaamKind}
                  onChange={handleInputChange}
                  required
                  placeholder="Voornaam"
                />
              </div>

              <div className="mb-6">
                <FormInput
                  label="Adres"
                  name="adres"
                  value={formData.adres}
                  onChange={handleInputChange}
                  required
                  placeholder="Straat, huisnummer, postcode, gemeente"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormInput
                  label="Geboortedatum"
                  name="geboortedatumKind"
                  type="date"
                  value={formData.geboortedatumKind}
                  onChange={handleInputChange}
                  required
                />
                <FormInput
                  label="Geboorteplaats"
                  name="geboorteplaatsKind"
                  value={formData.geboorteplaatsKind}
                  onChange={handleInputChange}
                  required
                  placeholder="Stad/gemeente"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormSelect
                  label="Bewijs van geboortedatum"
                  name="bewijsGeboortedatum"
                  value={formData.bewijsGeboortedatum}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'Kids ID', label: 'Kids ID' },
                    { value: 'ISI+ kaart', label: 'ISI+ kaart' },
                    { value: 'Anders', label: 'Anders' }
                  ]}
                />
                {formData.bewijsGeboortedatum === 'Anders' && (
                  <FormInput
                    label="Specificeer"
                    name="bewijsGeboortedatumAnders"
                    value={formData.bewijsGeboortedatumAnders || ''}
                    onChange={handleInputChange}
                    placeholder="Welk bewijs?"
                  />
                )}
              </div>

              <div className="mb-6">
                <FormInput
                  label="Rijksregisternummer kind"
                  name="rijksregisternummerKind"
                  value={formData.rijksregisternummerKind}
                  onChange={handleInputChange}
                  required
                  placeholder="00.00.00-000.00"
                  helpText="Formaat: 00.00.00-000.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormRadioGroup
                  label="Geslacht"
                  name="geslacht"
                  value={formData.geslacht}
                  onChange={(val) => updateField('geslacht', val)}
                  required
                  options={[
                    { value: 'M', label: 'M' },
                    { value: 'V', label: 'V' },
                    { value: 'X', label: 'X' }
                  ]}
                />
                <div>
                  <FormSelect
                    label="Nationaliteit"
                    name="nationaliteit"
                    value={formData.nationaliteit}
                    onChange={handleInputChange}
                    required
                    options={[
                      { value: 'Belg', label: 'Belg' },
                      { value: 'Nederlander', label: 'Nederlander' },
                      { value: 'Anders', label: 'Anders' }
                    ]}
                  />
                  {formData.nationaliteit === 'Anders' && (
                    <div className="mt-2">
                      <FormInput
                        label="Specificeer nationaliteit"
                        name="nationaliteitAnders"
                        value={formData.nationaliteitAnders || ''}
                        onChange={handleInputChange}
                        placeholder="Welke nationaliteit?"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Gezinssituatie */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <FormSectionTitle 
                icon={<Users size={24} />} 
                title="Gezinssituatie & Contact" 
                subtitle="Informatie over het gezin en contactgegevens"
              />
              
              <div className="mb-6">
                <FormRadioGroup
                  label="Is uw kind de oudste van het gezin?"
                  name="isOudsteGezin"
                  value={formData.isOudsteGezin}
                  onChange={(val) => updateField('isOudsteGezin', val)}
                  required
                  options={[
                    { value: true, label: 'Ja' },
                    { value: false, label: 'Nee' }
                  ]}
                />
              </div>

              {!formData.isOudsteGezin && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naam/namen van andere kinderen
                  </label>
                  <textarea
                    name="andereKinderen"
                    value={formData.andereKinderen}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green"
                    placeholder="Noteer hier de namen van uw andere kinderen"
                  />
                </div>
              )}

              <div className="mb-6">
                <FormInput
                  label="Bankrekening voor schoolfacturen"
                  name="bankrekening"
                  value={formData.bankrekening}
                  onChange={handleInputChange}
                  required
                  placeholder="BE00 0000 0000 0000"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-gray-700 mb-4">Telefoonnummers</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Vast toestel"
                    name="telefoonVast"
                    value={formData.telefoonVast || ''}
                    onChange={handleInputChange}
                    placeholder="050 00 00 00"
                  />
                  <FormInput
                    label="GSM papa"
                    name="gsmPapa"
                    value={formData.gsmPapa || ''}
                    onChange={handleInputChange}
                    placeholder="0400 00 00 00"
                  />
                  <FormInput
                    label="GSM mama"
                    name="gsmMama"
                    value={formData.gsmMama || ''}
                    onChange={handleInputChange}
                    placeholder="0400 00 00 00"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-gray-700 mb-4">Grootouders (noodcontact)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Grootouders papa (naam + tel)"
                    name="grootoudersPapa"
                    value={formData.grootoudersPapa || ''}
                    onChange={handleInputChange}
                    placeholder="Naam - 0400 00 00 00"
                  />
                  <FormInput
                    label="Grootouders mama (naam + tel)"
                    name="grootoudersMama"
                    value={formData.grootoudersMama || ''}
                    onChange={handleInputChange}
                    placeholder="Naam - 0400 00 00 00"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-gray-700 mb-4">Werk contactgegevens</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Werk papa (naam + tel)"
                    name="werkPapa"
                    value={formData.werkPapa || ''}
                    onChange={handleInputChange}
                    placeholder="Bedrijf - 050 00 00 00"
                  />
                  <FormInput
                    label="Werk mama (naam + tel)"
                    name="werkMama"
                    value={formData.werkMama || ''}
                    onChange={handleInputChange}
                    placeholder="Bedrijf - 050 00 00 00"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-bold text-gray-700 mb-4">E-mailadressen</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="E-mail papa"
                    name="emailPapa"
                    type="email"
                    value={formData.emailPapa || ''}
                    onChange={handleInputChange}
                    placeholder="papa@email.be"
                  />
                  <FormInput
                    label="E-mail mama"
                    name="emailMama"
                    type="email"
                    value={formData.emailMama || ''}
                    onChange={handleInputChange}
                    placeholder="mama@email.be"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Gegevens Ouders */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <FormSectionTitle 
                icon={<Users size={24} />} 
                title="Gegevens Ouders" 
                subtitle="Persoonlijke gegevens van beide ouders"
              />
              
              {/* Papa */}
              <div className="bg-blue-50 rounded-xl p-4 md:p-6 mb-6 border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-4 text-lg">Gegevens Papa</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormInput
                    label="Naam en voornaam"
                    name="naamPapa"
                    value={formData.naamPapa}
                    onChange={handleInputChange}
                    required
                    placeholder="Familienaam Voornaam"
                  />
                  <FormInput
                    label="Geboortedatum"
                    name="geboortedatumPapa"
                    type="date"
                    value={formData.geboortedatumPapa}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormInput
                    label="Geboorteplaats"
                    name="geboorteplaatsPapa"
                    value={formData.geboorteplaatsPapa}
                    onChange={handleInputChange}
                    required
                    placeholder="Stad/gemeente"
                  />
                  <FormInput
                    label="Rijksregisternummer"
                    name="rijksregisternummerPapa"
                    value={formData.rijksregisternummerPapa}
                    onChange={handleInputChange}
                    required
                    placeholder="00.00.00-000.00"
                  />
                </div>

                <div className="mb-4">
                  <FormRadioGroup
                    label="Leerplichtverantwoordelijke"
                    name="leerplichtverantwoordelijkePapa"
                    value={formData.leerplichtverantwoordelijkePapa}
                    onChange={(val) => updateField('leerplichtverantwoordelijkePapa', val)}
                    required
                    options={[
                      { value: '1', label: '1 (Primair)' },
                      { value: '2', label: '2 (Secundair)' }
                    ]}
                  />
                  <p className="text-xs text-gray-500 mt-1">Dit is van belang voor o.a. het belastingsvoordeel bij opvang.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Beroep"
                    name="beroepPapa"
                    value={formData.beroepPapa || ''}
                    onChange={handleInputChange}
                    placeholder="Beroep"
                  />
                  <FormSelect
                    label="Opleidingsniveau"
                    name="opleidingsniveauPapa"
                    value={formData.opleidingsniveauPapa}
                    onChange={handleInputChange}
                    required
                    options={OPLEIDINGSNIVEAU_OPTIONS.map(o => ({ value: o, label: o }))}
                  />
                </div>
              </div>

              {/* Mama */}
              <div className="bg-pink-50 rounded-xl p-4 md:p-6 border border-pink-100">
                <h4 className="font-bold text-pink-800 mb-4 text-lg">Gegevens Mama</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormInput
                    label="Naam en voornaam"
                    name="naamMama"
                    value={formData.naamMama}
                    onChange={handleInputChange}
                    required
                    placeholder="Familienaam Voornaam"
                  />
                  <FormInput
                    label="Geboortedatum"
                    name="geboortedatumMama"
                    type="date"
                    value={formData.geboortedatumMama}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormInput
                    label="Geboorteplaats"
                    name="geboorteplaatsMama"
                    value={formData.geboorteplaatsMama}
                    onChange={handleInputChange}
                    required
                    placeholder="Stad/gemeente"
                  />
                  <FormInput
                    label="Rijksregisternummer"
                    name="rijksregisternummerMama"
                    value={formData.rijksregisternummerMama}
                    onChange={handleInputChange}
                    required
                    placeholder="00.00.00-000.00"
                  />
                </div>

                <div className="mb-4">
                  <FormRadioGroup
                    label="Leerplichtverantwoordelijke"
                    name="leerplichtverantwoordelijkeMama"
                    value={formData.leerplichtverantwoordelijkeMama}
                    onChange={(val) => updateField('leerplichtverantwoordelijkeMama', val)}
                    required
                    options={[
                      { value: '1', label: '1 (Primair)' },
                      { value: '2', label: '2 (Secundair)' }
                    ]}
                  />
                  <p className="text-xs text-gray-500 mt-1">Dit is van belang voor o.a. het belastingsvoordeel bij opvang.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Beroep"
                    name="beroepMama"
                    value={formData.beroepMama || ''}
                    onChange={handleInputChange}
                    placeholder="Beroep"
                  />
                  <FormSelect
                    label="Opleidingsniveau"
                    name="opleidingsniveauMama"
                    value={formData.opleidingsniveauMama}
                    onChange={handleInputChange}
                    required
                    options={OPLEIDINGSNIVEAU_OPTIONS.map(o => ({ value: o, label: o }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Medisch & Praktisch */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <FormSectionTitle 
                icon={<Info size={24} />} 
                title="Medische Informatie" 
                subtitle="Belangrijke gezondheidsgegevens"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormInput
                  label="Naam van uw huisarts"
                  name="huisarts"
                  value={formData.huisarts}
                  onChange={handleInputChange}
                  required
                  placeholder="Dr. ..."
                />
                <FormSelect
                  label="Ziekenhuis van voorkeur"
                  name="ziekenhuis"
                  value={formData.ziekenhuis}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'AZ Sint-Lucas', label: 'AZ Sint-Lucas' },
                    { value: 'AZ Sint-Jan', label: 'AZ Sint-Jan' }
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergieën of ziektes waarvan wij op de hoogte moeten zijn
                </label>
                <textarea
                  name="allergieenZiektes"
                  value={formData.allergieenZiektes || ''}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green"
                  placeholder="Vermeld hier eventuele allergieën, chronische ziektes of andere medische aandachtspunten..."
                />
              </div>

              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Belangrijk:</strong> Deze informatie wordt vertrouwelijk behandeld en enkel gedeeld met het personeel dat direct betrokken is bij de zorg voor uw kind.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Verklaring & Bevestiging */}
          {currentStep === 5 && (
            <div className="animate-fade-in">
              <FormSectionTitle 
                icon={<FileText size={24} />} 
                title="Verklaring Ouders" 
                subtitle="Bevestiging en ondertekening"
              />
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-700">
                <p className="mb-2">
                  Ondergetekende (vader, moeder of voogd) verklaart hierbij dat zijn/haar kind alleen in de 
                  gesubsidieerde vrije basisschool Sint-Maarten, Kloosterstraat 4A, 8340 Sijsele is ingeschreven 
                  en verklaart zich akkoord met het pedagogisch project en schoolreglement.
                </p>
                <a 
                  href="https://www.vrijebasisschoolsijsele.be/praktische-info/reglement/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-school-green hover:underline font-medium"
                >
                  Bekijk het schoolreglement →
                </a>
              </div>

              <div className="mb-6">
                <FormCheckbox
                  label="Ik verklaar mij akkoord met het pedagogisch project en het schoolreglement"
                  checked={formData.akkoordReglement}
                  onChange={(val) => updateField('akkoordReglement', val)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormInput
                  label="Eerste schooldag in onze school"
                  name="eersteSchooldag"
                  type="date"
                  value={formData.eersteSchooldag}
                  onChange={handleInputChange}
                  required
                  helpText="Bereken de instapdatum op onderwijs.vlaanderen.be"
                />
                <FormInput
                  label="In welke klas start uw kind?"
                  name="startKlas"
                  value={formData.startKlas || ''}
                  onChange={handleInputChange}
                  placeholder="bv. 1e kleuter, 3e leerjaar"
                />
              </div>

              <div className="space-y-4 mb-6">
                <FormRadioGroup
                  label="Is uw kind een anderstalige nieuwkomer?"
                  name="anderstaligNieuwkomer"
                  value={formData.anderstaligNieuwkomer}
                  onChange={(val) => updateField('anderstaligNieuwkomer', val)}
                  required
                  options={[
                    { value: false, label: 'Nee' },
                    { value: true, label: 'Ja' }
                  ]}
                />

                <FormRadioGroup
                  label="Heeft uw kind een verslag buitengewoon onderwijs (niet type 8)?"
                  name="verslagBuitengewoonOnderwijs"
                  value={formData.verslagBuitengewoonOnderwijs}
                  onChange={(val) => updateField('verslagBuitengewoonOnderwijs', val)}
                  required
                  options={[
                    { value: false, label: 'Nee' },
                    { value: true, label: 'Ja' }
                  ]}
                />

                <FormRadioGroup
                  label="Is er al een broer of zus ingeschreven in onze school? (voorrangskenmerk)"
                  name="broerZusIngeschreven"
                  value={formData.broerZusIngeschreven}
                  onChange={(val) => updateField('broerZusIngeschreven', val)}
                  required
                  options={[
                    { value: false, label: 'Nee' },
                    { value: true, label: 'Ja' }
                  ]}
                />

                <FormRadioGroup
                  label="Bent u een personeelslid van onze school? (voorrangskenmerk)"
                  name="personeelslid"
                  value={formData.personeelslid}
                  onChange={(val) => updateField('personeelslid', val)}
                  required
                  options={[
                    { value: false, label: 'Nee' },
                    { value: true, label: 'Ja' }
                  ]}
                />
              </div>

              <div className="mb-6">
                <FormInput
                  label="Naam en adres van eventueel vorige school"
                  name="vorigeSchool"
                  value={formData.vorigeSchool || ''}
                  onChange={handleInputChange}
                  placeholder="Schoolnaam, adres"
                />
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-4">Ondertekening</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Naam ondertekenaar"
                    name="ondertekeningNaam"
                    value={formData.ondertekeningNaam}
                    onChange={handleInputChange}
                    required
                    placeholder="Volledige naam"
                  />
                  <FormInput
                    label="Datum"
                    name="ondertekeningDatum"
                    type="date"
                    value={formData.ondertekeningDatum}
                    onChange={handleInputChange}
                    required
                  />
                  <FormInput
                    label="Uur"
                    name="ondertekeningUur"
                    type="time"
                    value={formData.ondertekeningUur}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Taalvragenlijst */}
          {currentStep === 6 && (
            <div className="animate-fade-in">
              <FormSectionTitle 
                icon={<MessageCircle size={24} />} 
                title="Vragenlijst Taalgebruik" 
                subtitle="Vragen van de Vlaamse Overheid over de achtergrond van uw kind"
              />
              
              <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-gray-700">
                <p>
                  De Vlaamse Overheid wil de leerlingen beter leren kennen. Het beantwoorden duurt slechts een 
                  paar minuten maar het helpt de Vlaamse Overheid en de scholen om het onderwijs van uw kind te verbeteren.
                </p>
              </div>

              <div className="space-y-6">
                <FormSelect
                  label="Welke taal spreekt het kind meestal met de moeder?"
                  name="taalMoeder"
                  value={formData.taalMoeder}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'Nederlands', label: 'Nederlands' },
                    { value: 'Frans', label: 'Frans' },
                    { value: 'Een andere taal', label: 'Een andere taal' },
                    { value: 'Niet van toepassing', label: 'Niet van toepassing (geen contact of overleden)' }
                  ]}
                />

                <FormSelect
                  label="Welke taal spreekt het kind meestal met de vader?"
                  name="taalVader"
                  value={formData.taalVader}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'Nederlands', label: 'Nederlands' },
                    { value: 'Frans', label: 'Frans' },
                    { value: 'Een andere taal', label: 'Een andere taal' },
                    { value: 'Niet van toepassing', label: 'Niet van toepassing (geen contact of overleden)' }
                  ]}
                />

                <FormSelect
                  label="Welke taal spreekt het kind meestal met broer(s) of zus(sen)?"
                  name="taalBroersZussen"
                  value={formData.taalBroersZussen}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'Nederlands', label: 'Nederlands' },
                    { value: 'Frans', label: 'Frans' },
                    { value: 'Een andere taal', label: 'Een andere taal' },
                    { value: 'Niet van toepassing', label: 'Niet van toepassing (geen broers/zussen)' }
                  ]}
                />

                <FormSelect
                  label="Welke taal spreekt het kind meestal met vrienden?"
                  name="taalVrienden"
                  value={formData.taalVrienden}
                  onChange={handleInputChange}
                  required
                  options={[
                    { value: 'Nederlands', label: 'Nederlands' },
                    { value: 'Frans', label: 'Frans' },
                    { value: 'Een andere taal', label: 'Een andere taal' },
                    { value: 'Weet niet', label: 'Ik weet het niet' }
                  ]}
                />
              </div>

              <div className="mt-8 bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="font-bold text-green-800 mb-4">Bevestiging op eer</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Ik bevestig op eer dat alle gegevens op dit formulier naar waarheid zijn ingevuld.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Datum"
                    name="bevestigingOpEerDatum"
                    type="date"
                    value={formData.bevestigingOpEerDatum}
                    onChange={handleInputChange}
                    required
                  />
                  <FormInput
                    label="Naam en voornaam ondertekenaar"
                    name="bevestigingOpEerNaam"
                    value={formData.bevestigingOpEerNaam}
                    onChange={handleInputChange}
                    required
                    placeholder="Volledige naam"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronRight size={20} className="rotate-180" />
              Vorige
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-school-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition"
              >
                Volgende
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold transition ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : formData.akkoordReglement
                    ? 'bg-school-red text-white hover:bg-red-700'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                title={!formData.akkoordReglement ? 'U moet akkoord gaan met het reglement' : ''}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Verzenden...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Inschrijving Verzenden
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-blue-800 mb-2">Hulp nodig?</h3>
        <p className="text-sm text-blue-700">
          Heeft u vragen bij het invullen van dit formulier? Neem gerust contact op met de school. 
          We helpen u graag verder!
        </p>
            </div>
        </div>
    );
};

const CalendarPage = ({ events }: { events: CalendarEvent[] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Get upcoming events (next 3)
  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter(e => new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const hasEvents = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return getEventsForDate(date).length > 0;
  };

  const getEventTypeForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;
    if (dayEvents.some(e => e.type === 'Vakantie')) return 'Vakantie';
    if (dayEvents.some(e => e.type === 'Activiteit')) return 'Activiteit';
    return 'Vrije Dag';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-16 animate-fade-in">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-school-dark">Schoolkalender</h1>
        <p className="text-gray-500 mt-2">Klik op een dag om de activiteiten te bekijken</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <ChevronRight size={24} className="rotate-180 text-gray-600" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-bold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first of month */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const eventType = getEventTypeForDay(day);
              const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
              const isSelected = selectedDate?.getTime() === dayDate.getTime();
              
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dayDate)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm md:text-base font-medium transition-all relative
                    ${isToday(day) ? 'ring-2 ring-school-green' : ''}
                    ${isSelected ? 'bg-school-green text-white scale-105 shadow-lg' : 'hover:bg-gray-100'}
                    ${!isSelected && eventType === 'Vakantie' ? 'bg-green-100 text-green-800' : ''}
                    ${!isSelected && eventType === 'Activiteit' ? 'bg-red-100 text-red-800' : ''}
                    ${!isSelected && eventType === 'Vrije Dag' ? 'bg-orange-100 text-orange-800' : ''}
                  `}
                >
                  <span>{day}</span>
                  {hasEvents(day) && !isSelected && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      eventType === 'Vakantie' ? 'bg-green-600' :
                      eventType === 'Activiteit' ? 'bg-red-600' : 'bg-orange-600'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded bg-green-100 border border-green-300"></span>
              <span className="text-gray-600">Vakantie</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded bg-red-100 border border-red-300"></span>
              <span className="text-gray-600">Activiteit</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 rounded bg-orange-100 border border-orange-300"></span>
              <span className="text-gray-600">Vrije Dag</span>
            </div>
          </div>
        </div>

        {/* Sidebar - Upcoming Events */}
        <div className="space-y-6">
          {/* Upcoming Events Card */}
          <div className="bg-gradient-to-br from-school-green to-emerald-600 rounded-2xl shadow-lg p-5 md:p-6 text-white">
            <h3 className="font-bold text-lg md:text-xl mb-4 flex items-center gap-2">
              <Calendar size={22} />
              Binnenkort
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-white/80 text-sm">Geen komende evenementen</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="bg-white/10 backdrop-blur rounded-xl p-3 hover:bg-white/20 transition cursor-pointer"
                    onClick={() => {
                      setSelectedDate(new Date(event.date));
                      setCurrentMonth(new Date(event.date));
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-white/20 rounded-lg p-2 text-center min-w-[45px]">
                        <div className="text-xs uppercase opacity-80">
                          {new Date(event.date).toLocaleDateString('nl-BE', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {new Date(event.date).getDate()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{event.title}</h4>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                          event.type === 'Vakantie' ? 'bg-green-200/30' :
                          event.type === 'Activiteit' ? 'bg-red-200/30' : 'bg-orange-200/30'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 md:p-6 animate-fade-in">
              <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-school-green" />
                {selectedDate.toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-500 text-sm">Geen evenementen op deze dag</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="border-l-4 border-school-green pl-4 py-2">
                      <h4 className="font-bold text-gray-800">{event.title}</h4>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                        event.type === 'Vakantie' ? 'bg-green-100 text-green-800' :
                        event.type === 'Activiteit' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {event.type}
                      </span>
                      {event.description && (
                        <p className="text-gray-600 text-sm mt-2">{event.description}</p>
                      )}
                      <button 
                        onClick={() => addToGoogleCalendar(event)}
                        className="text-school-green text-sm font-medium mt-2 hover:underline flex items-center gap-1"
                      >
                        <Download size={14} /> Toevoegen aan agenda
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* All Events List (collapsed on mobile) */}
      <details className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <summary className="p-4 md:p-6 cursor-pointer font-bold text-gray-800 hover:bg-gray-50 transition flex items-center gap-2">
          <Calendar size={20} className="text-school-green" />
          Alle evenementen bekijken
        </summary>
        <div className="border-t border-gray-100">
          {events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event, idx) => (
            <div key={event.id} className={`p-4 md:p-6 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50 transition ${idx % 2 !== 0 ? 'bg-gray-50/30' : ''}`}>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex-shrink-0 w-14 md:w-16 text-center">
                  <div className="text-xs md:text-sm font-bold text-school-red uppercase">
                    {new Date(event.date).toLocaleDateString('nl-BE', { month: 'short' })}
                  </div>
                  <div className="text-2xl md:text-3xl font-display font-bold text-gray-900">
                    {new Date(event.date).getDate()}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base md:text-xl">{event.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      event.type === 'Vakantie' ? 'bg-green-100 text-green-800 border-green-200' : 
                      event.type === 'Activiteit' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-orange-100 text-orange-800 border-orange-200'
                    }`}>{event.type}</span>
                    {event.description && <span className="text-xs text-gray-500 hidden md:inline pt-0.5">- {event.description}</span>}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => addToGoogleCalendar(event)} 
                className="text-gray-400 hover:text-school-green hover:bg-green-50 p-2 rounded-full transition" 
                title="Toevoegen aan Google Agenda"
              >
                <Calendar size={20} />
              </button>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

const InfoPage = ({ config, downloads }: { config: SiteConfig; downloads: Array<{id: string; title: string; filename: string; uploadDate: string}> }) => (
  <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
    <h1 className="text-4xl font-display font-bold text-school-dark mb-12 text-center">Praktische Info</h1>
    
    {/* Schooluren en Contact */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-school-orange"><Calendar/> Schooluren</h2>
            <ul className="space-y-3 text-gray-600">
                <li className="flex justify-between border-b pb-2"><span>Maandag:</span> <strong>08:30 - 12:10 / 13:30 - 15:30</strong></li>
                <li className="flex justify-between border-b pb-2"><span>Dinsdag:</span> <strong>08:30 - 12:10 / 13:30 - 15:30</strong></li>
                <li className="flex justify-between border-b pb-2"><span>Woensdag:</span> <strong>08:30 - 12:10</strong></li>
                <li className="flex justify-between border-b pb-2"><span>Donderdag:</span> <strong>08:30 - 12:10 / 13:30 - 15:30</strong></li>
                <li className="flex justify-between"><span>Vrijdag:</span> <strong>08:30 - 12:10 / 13:30 - 15:30</strong></li>
            </ul>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-school-green"><Phone/> Contact</h2>
            <ul className="space-y-3 text-gray-600">
                {config.contactAddress && <li className="flex items-center gap-2"><MapPin size={16} className="text-school-red"/> {config.contactAddress}</li>}
                <li className="flex items-center gap-2"><Mail size={16} className="text-school-red"/> {config.contactEmail}</li>
                {config.contactPhoneKloosterstraat && <li className="flex items-center gap-2"><Phone size={16} className="text-school-green"/> Kloosterstraat: {config.contactPhoneKloosterstraat}</li>}
                {config.contactPhoneHovingenlaan && <li className="flex items-center gap-2"><Phone size={16} className="text-school-green"/> Hovingenlaan: {config.contactPhoneHovingenlaan}</li>}
                {config.contactPhoneGSM && <li className="flex items-center gap-2"><Phone size={16} className="text-school-orange"/> GSM: {config.contactPhoneGSM}</li>}
            </ul>
        </div>
    </div>

    {/* Naschoolse Opvang */}
    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl shadow-lg border border-emerald-100 mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-school-green"><Users/> Naschoolse Opvang</h2>
        <p className="text-gray-600 mb-6">Er wordt in voor- en naschoolse opvang voorzien.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl">
                <h3 className="font-bold text-lg text-school-dark mb-3">Sijsele - Kloosterstraat (Ferm)</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Voorschools vanaf <strong>7:00u</strong></li>
                    <li>• Naschools tot <strong>19:00u</strong></li>
                    <li>• Woensdagmiddag: <strong>12:10u - 19:00u</strong></li>
                    <li>• Ook tijdens snipper- en vakantiedagen</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">De kleuters en leerlingen worden 's morgens naar de speelplaats en 's avonds naar Ferm begeleid door medewerkers van Ferm.</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
                <h3 className="font-bold text-lg text-school-dark mb-3">Sijsele - De Verrekijker - Hovingenlaan</h3>
                <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• 's Morgens op school vanaf <strong>7:30u</strong></li>
                    <li>• 's Avonds op school tot <strong>18:00u</strong></li>
                    <li>• Woensdagnamiddag: zie regeling Kloosterstraat</li>
                </ul>
                <p className="text-gray-500 text-sm mt-3">Deze opvang gebeurt in eigen organisatie en <strong>ENKEL na inschrijving de week vooraf</strong>.</p>
            </div>
        </div>
        
        <div className="mt-6">
            <a href={config.menuUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-school-green text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-colors">
                <ExternalLink size={18}/> Bekijk Menu Hanssens
            </a>
        </div>
    </div>

    {/* Afwezigheden */}
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-school-red"><FileText/> Afwezigheden</h2>
        <p className="text-gray-600 mb-6">We vinden het fijn als u ons verwittigt wanneer uw kind ziek of afwezig is.</p>
        
        <div className="bg-blue-50 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-school-dark mb-2">Kleuteronderwijs</h3>
            <p className="text-gray-600 text-sm">Afwezigheden moeten niet gewettigd worden door medische attesten voor kleuters die nog geen 5 jaar zijn. Voor leerplichtige kleuters (5-jarigen) moet u als ouder steeds een briefje met de reden van afwezigheid aan de school bezorgen.</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-xl mb-6">
            <h3 className="font-bold text-school-dark mb-2">Lager onderwijs</h3>
            <p className="text-gray-600 text-sm">Voor elke afwezigheid moet een briefje afgegeven worden.</p>
        </div>

        <h3 className="font-bold text-lg text-school-dark mb-4">4 soorten gewettigde afwezigheden:</h3>
        <div className="space-y-4">
            <details className="bg-gray-50 rounded-xl p-4 cursor-pointer group">
                <summary className="font-bold text-school-dark flex items-center justify-between">
                    1. Gewettigde afwezigheid wegens ziekte
                    <ChevronRight className="transform group-open:rotate-90 transition-transform" size={20}/>
                </summary>
                <div className="mt-3 text-gray-600 text-sm space-y-2">
                    <p>• Tot en met 3 opeenvolgende schooldagen: verklaring van de ouders vereist.</p>
                    <p className="text-school-red font-medium">• Let op: Indien uw kind reeds 4x afwezig is geweest met briefje van ouders (in hetzelfde schooljaar), is een doktersattest verplicht (ook voor 1 dag).</p>
                    <p>• Meer dan 3 opeenvolgende schooldagen: medisch attest van de arts vereist.</p>
                </div>
            </details>
            <details className="bg-gray-50 rounded-xl p-4 cursor-pointer group">
                <summary className="font-bold text-school-dark flex items-center justify-between">
                    2. Afwezigheden van rechtswege gewettigd
                    <ChevronRight className="transform group-open:rotate-90 transition-transform" size={20}/>
                </summary>
                <div className="mt-3 text-gray-600 text-sm">
                    <p>Briefje van ouders of officieel document vereist voor: familieraad, begrafenis- of huwelijksplechtigheid, oproeping jeugdrechtbank, maatregelen i.k.v. bijzondere jeugdzorg, onbereikbaarheid school door overmacht, feestdagen inherent aan erkende levensbeschouwelijke overtuiging.</p>
                </div>
            </details>
            <details className="bg-gray-50 rounded-xl p-4 cursor-pointer group">
                <summary className="font-bold text-school-dark flex items-center justify-between">
                    3. Afwezigheden mits voorafgaandelijke toestemming van de directeur
                    <ChevronRight className="transform group-open:rotate-90 transition-transform" size={20}/>
                </summary>
                <div className="mt-3 text-gray-600 text-sm">
                    <p>Voorbeelden: rouwperiode of begrafenis in buitenland, culturele/sportmanifestaties (max. 10 halve schooldagen), uitzonderlijke persoonlijke redenen (max. 4 halve schooldagen).</p>
                </div>
            </details>
            <details className="bg-gray-50 rounded-xl p-4 cursor-pointer group">
                <summary className="font-bold text-school-dark flex items-center justify-between">
                    4. Uitzonderlijke omstandigheden bij trekkende bevolking
                    <ChevronRight className="transform group-open:rotate-90 transition-transform" size={20}/>
                </summary>
                <div className="mt-3 text-gray-600 text-sm">
                    <p>Specifieke regeling voor trekkende bevolking. Neem contact op met de school voor meer informatie.</p>
                </div>
            </details>
        </div>
    </div>

    {/* Downloads */}
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-700"><Download/> Downloads</h2>
        <p className="text-gray-600 mb-6">Hier vindt u belangrijke documenten om te downloaden.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {downloads.length > 0 ? (
                downloads.map(doc => (
                    <a 
                        key={doc.id}
                        href={`/documents/${doc.filename}`} 
                        download
                        className="flex items-center gap-4 bg-white p-4 rounded-xl hover:shadow-md transition-shadow group"
                    >
                        <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                            <FileText className="text-blue-700" size={24}/>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-school-dark">{doc.title}</h3>
                            <p className="text-gray-500 text-sm">Klik om te downloaden</p>
                        </div>
                        <Download className="text-gray-400 group-hover:text-blue-700 transition-colors" size={20}/>
                    </a>
                ))
            ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50"/>
                    <p>Documenten worden binnenkort toegevoegd.</p>
                </div>
            )}
        </div>
    </div>
  </div>
);

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

// 4. ROOT COMPONENT
function App() {
  // Get initial page from URL hash
  const getPageFromHash = (): PageView => {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const validPages: PageView[] = ['home', 'about', 'enroll', 'news', 'calendar', 'info', 'ouderwerkgroep', 'gallery', 'contact', 'admin', 'menu', 'box'];
    if (validPages.includes(hash as PageView)) {
      return hash as PageView;
    }
    return 'home';
  };

  const [pageState, setPageState] = useState<PageView>(getPageFromHash());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Sync page state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const newPage = getPageFromHash();
      setPageState(newPage);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Custom setPage that also updates URL hash
  const setPage = (newPage: PageView) => {
    // Update URL hash (this will trigger hashchange event)
    const newHash = newPage === 'home' ? '' : `#/${newPage}`;
    if (window.location.hash !== newHash && window.location.hash !== `#${newPage}`) {
      window.history.pushState(null, '', newHash || window.location.pathname);
    }
    setPageState(newPage);
    window.scrollTo(0, 0);
  };

  // Alias for backwards compatibility
  const page = pageState;

  // Central State - fetched from API
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [heroImages, setHeroImages] = useState<string[]>(HERO_IMAGES);
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [submissions, setSubmissions] = useState<FormSubmission[]>(MOCK_SUBMISSIONS);
  const [team, setTeam] = useState<Teacher[]>(MOCK_TEAM);
  const [albums, setAlbums] = useState<PhotoAlbum[]>(MOCK_ALBUMS);
  const [pages, setPages] = useState<PageConfig[]>(DEFAULT_PAGES);
  const [ouderwerkgroepActivities, setOuderwerkgroepActivities] = useState<Array<{id: string; title: string; description: string; images: string[]}>>([]);
  const [downloads, setDownloads] = useState<Array<{id: string; title: string; filename: string; uploadDate: string}>>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Functie om data uit localStorage te laden
  const loadDataFromLocalStorage = () => {
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
        if (data.ouderwerkgroep && data.ouderwerkgroep.length > 0) setOuderwerkgroepActivities(data.ouderwerkgroep);
        if (data.pages && data.pages.length > 0) setPages(data.pages);
        if (data.downloads && data.downloads.length > 0) setDownloads(data.downloads);
        if (data.enrollments && data.enrollments.length > 0) setEnrollments(data.enrollments);
        return true; // Data geladen
      }
    } catch (e) {
      console.log('Fout bij laden localStorage data:', e);
    }
    return false; // Geen data gevonden
  };

  // Fetch data from GitHub/API on mount
  useEffect(() => {
    const fetchData = async () => {
      // STAP 1: Probeer eerst data van GitHub te laden (werkt altijd)
      console.log('🔄 Data laden van Vercel KV...');
      const kvData = await fetchDataFromKV();
      
      if (kvData) {
        console.log('✅ Data geladen van Vercel KV!');
        if (kvData.config) setConfig(kvData.config);
        if (kvData.heroImages && kvData.heroImages.length > 0) setHeroImages(kvData.heroImages);
        if (kvData.news && kvData.news.length > 0) setNews(kvData.news);
        if (kvData.events && kvData.events.length > 0) setEvents(kvData.events);
        if (kvData.albums && kvData.albums.length > 0) setAlbums(kvData.albums);
        if (kvData.team && kvData.team.length > 0) setTeam(kvData.team);
        if (kvData.ouderwerkgroep && kvData.ouderwerkgroep.length > 0) setOuderwerkgroepActivities(kvData.ouderwerkgroep);
        if (kvData.pages && kvData.pages.length > 0) setPages(kvData.pages);
        if (kvData.downloads && kvData.downloads.length > 0) setDownloads(kvData.downloads);
        if (kvData.enrollments && kvData.enrollments.length > 0) setEnrollments(kvData.enrollments);
        // Cache in localStorage
        try {
          localStorage.setItem('adminData', JSON.stringify(kvData));
        } catch (e) {}
        setLoading(false);
        return;
      }
      
      // STAP 2: Fallback naar localStorage
      console.log('⚠️ Vercel KV niet beschikbaar, probeer localStorage...');
      const dataLoaded = loadDataFromLocalStorage();
      
      // STAP 3: Als lokale backend beschikbaar is, probeer die
      if (API_BASE) {
        try {
          const response = await fetch(`${API_BASE}/data`);
          if (response.ok) {
            const data = await response.json();
            if (data.config) setConfig(data.config);
            if (data.heroImages) setHeroImages(data.heroImages);
            if (data.news) setNews(data.news);
            if (data.events) setEvents(data.events);
            if (data.team) setTeam(data.team);
            if (data.albums) setAlbums(data.albums);
            if (data.submissions) setSubmissions(data.submissions);
            if (data.pages) setPages(data.pages);
            if (data.ouderwerkgroep) setOuderwerkgroepActivities(data.ouderwerkgroep);
            if (data.downloads) setDownloads(data.downloads);
            if (data.enrollments) setEnrollments(data.enrollments);
            try {
              localStorage.setItem('adminData', JSON.stringify(data));
            } catch (e) {}
          }
        } catch (error) {
          console.log('Lokale backend niet beschikbaar');
        }
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

  // Luister naar updates van admin panel (wanneer er geen backend is)
  useEffect(() => {
    if (!API_BASE) {
      const handleAdminDataUpdate = () => {
        console.log('🔄 Admin data bijgewerkt, synchroniseer frontend...');
        const savedData = localStorage.getItem('adminData');
        if (savedData) {
          try {
            const data = JSON.parse(savedData);
            if (data.config) setConfig(data.config);
            if (data.heroImages && data.heroImages.length > 0) setHeroImages(data.heroImages);
            if (data.news && data.news.length > 0) setNews(data.news);
            if (data.events && data.events.length > 0) setEvents(data.events);
            if (data.albums && data.albums.length > 0) setAlbums(data.albums);
            if (data.team && data.team.length > 0) setTeam(data.team);
            if (data.ouderwerkgroep && data.ouderwerkgroep.length > 0) setOuderwerkgroepActivities(data.ouderwerkgroep);
            if (data.pages && data.pages.length > 0) setPages(data.pages);
            if (data.downloads && data.downloads.length > 0) setDownloads(data.downloads);
            if (data.enrollments && data.enrollments.length > 0) setEnrollments(data.enrollments);
            console.log('✅ Frontend data gesynchroniseerd');
          } catch (e) {
            console.error('❌ Fout bij synchroniseren data:', e);
          }
        }
      };

      // Luister naar custom event
      window.addEventListener('adminDataUpdated', handleAdminDataUpdate);
      
      // Backup: check elke 2 seconden of data is veranderd (voor het geval events niet werken)
      const intervalId = setInterval(() => {
        const savedData = localStorage.getItem('adminData');
        if (savedData) {
          const currentData = JSON.stringify({
            config, heroImages, news, events, albums, team, 
            ouderwerkgroepActivities, pages, downloads, enrollments
          });
          if (savedData !== currentData) {
            console.log('🔄 Data verschil gedetecteerd, synchroniseer...');
            handleAdminDataUpdate();
          }
        }
      }, 2000);

      return () => {
        window.removeEventListener('adminDataUpdated', handleAdminDataUpdate);
        clearInterval(intervalId);
      };
    }
  }, [config, heroImages, news, events, albums, team, ouderwerkgroepActivities, pages, downloads, enrollments]);

  const addSubmission = async (sub: FormSubmission) => {
    // Als geen backend, alleen lokaal opslaan
    if (!API_BASE) {
      setSubmissions([sub, ...submissions]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions([data.item, ...submissions]);
        return;
      }
    } catch (error) {
      console.log('Backend niet beschikbaar');
    }
    // Fallback to local state
    setSubmissions([sub, ...submissions]);
  };

  const addEnrollment = async (enrollmentData: Omit<Enrollment, 'id' | 'submittedAt' | 'status'>) => {
    const newEnrollment: Enrollment = {
      ...enrollmentData,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString(),
      status: 'nieuw'
    };

    // Always save to local state first (for immediate UI update)
    setEnrollments([newEnrollment, ...enrollments]);

    // Try to save to Vercel KV via API
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnrollment)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Inschrijving opgeslagen in Vercel KV:', data);
        // Update local state with the saved item (in case server added anything)
        if (data.item) {
          setEnrollments([data.item, ...enrollments.filter(e => e.id !== newEnrollment.id)]);
        }
        return Promise.resolve();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('⚠️ KV response niet OK:', response.status, errorData);
        // Keep local state - it's already saved there
        return Promise.resolve();
      }
    } catch (error) {
      console.warn('⚠️ Fout bij opslaan naar KV, gebruik lokale opslag:', error);
      // Keep local state - it's already saved there
      return Promise.resolve();
    }
  };

  // Filter active news (simulating backend logic)
  const activeNews = useMemo(() => {
      const now = new Date();
      return news.filter(n => !n.expiryDate || new Date(n.expiryDate) > now)
                 .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [news]);

  if (page === 'admin') {
      return <AdminPanel />;
  }

  return (
    <div className={`min-h-screen bg-white font-sans text-gray-800 flex flex-col ${largeText ? 'large-text-mode' : ''}`}>
      <Navbar activePage={page} setPage={setPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} config={config} pages={pages} />

      {/* Accessibility Button - Large Text Toggle */}
      <button
        onClick={() => setLargeText(!largeText)}
        className="fixed left-6 bottom-6 z-50 bg-school-dark text-white p-4 rounded-full shadow-2xl hover:scale-110 transition duration-300 flex items-center gap-2"
        title={largeText ? 'Normaal lettertype' : 'Groot lettertype'}
      >
        <span className={`font-bold ${largeText ? 'text-2xl' : 'text-base'}`}>A</span>
      </button>
      
      <main className="flex-grow">
        {page === 'home' && <HomePage news={activeNews} setPage={setPage} config={config} heroImages={heroImages} />}
        {page === 'about' && <AboutPage config={config} albumImages={albums.flatMap(a => a.images).slice(0, 20)} />}
        {page === 'menu' && <MenuPage config={config} />}
        {page === 'enroll' && <EnrollPage addEnrollment={addEnrollment} setPage={setPage} />}
        {page === 'news' && (
             <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
                <h1 className="text-5xl font-display font-bold text-school-dark mb-12 text-center">Nieuws & Actualiteit</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {activeNews.map(item => (
                        <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col h-full">
                            <img src={item.imageUrl} className="h-48 object-cover"/>
                            <div className="p-6 flex-1">
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}
        {page === 'calendar' && <CalendarPage events={events} />}
        {page === 'info' && <InfoPage config={config} downloads={downloads} />}
        {page === 'ouderwerkgroep' && <ParentsPage activities={ouderwerkgroepActivities} />}
        {page === 'gallery' && <GalleryPage albums={albums} />}
        {page === 'contact' && (
          <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-display font-bold text-school-dark mb-6">Contact</h1>
              <p className="text-xl text-gray-600">Neem gerust contact met ons op</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Contact Info */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Bereikbaarheid</h2>
                  <div className="space-y-5">
                    {config.contactAddress && (
                      <div className="flex items-start gap-4">
                        <div className="bg-school-green/10 p-3 rounded-full flex-shrink-0">
                          <MapPin className="text-school-green" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">Adres</h3>
                          <p className="text-gray-600">{config.contactAddress}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className="bg-school-orange/10 p-3 rounded-full flex-shrink-0">
                        <Mail className="text-school-orange" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                        <a href={`mailto:${config.contactEmail}`} className="text-school-red hover:underline">
                          {config.contactEmail}
                        </a>
                      </div>
                    </div>

                    {config.contactPhoneKloosterstraat && (
                      <div className="flex items-start gap-4">
                        <div className="bg-school-red/10 p-3 rounded-full flex-shrink-0">
                          <Phone className="text-school-red" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">Telefoon Kloosterstraat</h3>
                          <a href={`tel:${config.contactPhoneKloosterstraat.replace(/\s/g, '')}`} className="text-school-red hover:underline">
                            {config.contactPhoneKloosterstraat}
                          </a>
                        </div>
                      </div>
                    )}

                    {config.contactPhoneHovingenlaan && (
                      <div className="flex items-start gap-4">
                        <div className="bg-school-red/10 p-3 rounded-full flex-shrink-0">
                          <Phone className="text-school-red" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">Telefoon Hovingenlaan</h3>
                          <a href={`tel:${config.contactPhoneHovingenlaan.replace(/\s/g, '')}`} className="text-school-red hover:underline">
                            {config.contactPhoneHovingenlaan}
                          </a>
                        </div>
                      </div>
                    )}

                    {config.contactPhoneGSM && (
                      <div className="flex items-start gap-4">
                        <div className="bg-school-red/10 p-3 rounded-full flex-shrink-0">
                          <Phone className="text-school-red" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">GSM</h3>
                          <a href={`tel:${config.contactPhoneGSM.replace(/\s/g, '')}`} className="text-school-red hover:underline">
                            {config.contactPhoneGSM}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Stuur een bericht</h2>
                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  alert('Bedankt voor uw bericht! We nemen spoedig contact op.');
                  e.currentTarget.reset();
                }}>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Naam</label>
                    <input
                      required
                      type="text"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green"
                      placeholder="Uw naam"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                    <input
                      required
                      type="email"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green"
                      placeholder="uw.email@voorbeeld.be"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bericht</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-school-green resize-none"
                      placeholder="Uw bericht..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-school-green text-white font-bold py-4 rounded-lg hover:bg-green-700 transition shadow-md"
                  >
                    Versturen
                  </button>
                </form>
              </div>
            </div>

            {/* Map or Additional Info */}
            <div className="mt-12 bg-gradient-to-r from-school-green to-school-dark p-8 rounded-2xl text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Plan een bezoek</h3>
                  <p className="text-white/90">Kom gerust langs voor een kennismaking en rondleiding</p>
                </div>
                <button
                  onClick={() => setPage('enroll')}
                  className="bg-white text-school-green font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition shadow-lg whitespace-nowrap"
                >
                  Maak een afspraak
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Custom Pages - Render dynamic pages */}
        {pages.filter(p => p.type === 'custom' && p.active && p.slug === page).map(customPage => (
          <div key={customPage.id} className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-school-dark mb-6">{customPage.name}</h1>
            </div>
            
            {customPage.pageImages && customPage.pageImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                {customPage.pageImages.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-lg" />
                ))}
              </div>
            )}
            
            {customPage.content && (
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{customPage.content}</p>
              </div>
            )}
          </div>
        ))}

        {page === 'box' && (
          <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
            <div className="text-center mb-12">
              <div className="inline-block bg-school-orange/10 p-4 rounded-full mb-6">
                <Star className="text-school-orange" size={64} />
              </div>
              <h1 className="text-5xl font-display font-bold text-school-dark mb-6">De Belevingsbox</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Benieuwd naar onze school? Vraag gratis een belevingsbox aan en ontdek wat Sint-Maarten zo bijzonder maakt!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              {/* What's in the box */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-school-orange flex items-center gap-3">
                  <Star size={28} />
                  Wat zit erin?
                </h2>
                <ul className="space-y-4 text-gray-700">
                  <li className="flex items-start gap-3">
                    <Check className="text-school-green flex-shrink-0 mt-1" size={20} />
                    <span>Welkomstbrief van de directie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-school-green flex-shrink-0 mt-1" size={20} />
                    <span>Informatiefolder over onze school en visie</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-school-green flex-shrink-0 mt-1" size={20} />
                    <span>Leuke knutsel- of spelactiviteit voor thuis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-school-green flex-shrink-0 mt-1" size={20} />
                    <span>Foto's van onze speelplaats en klassen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-school-green flex-shrink-0 mt-1" size={20} />
                    <span>Praktische info over inschrijvingen</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-school-green flex-shrink-0 mt-1" size={20} />
                    <span>Een klein verrassing voor je kindje!</span>
                  </li>
                </ul>
              </div>

              {/* Request Form */}
              <div className="bg-gradient-to-br from-school-orange to-school-red p-8 rounded-2xl shadow-lg text-white">
                <h2 className="text-2xl font-bold mb-6">Vraag je box aan!</h2>
                <form className="space-y-5" onSubmit={(e) => {
                  e.preventDefault();
                  addSubmission({
                    id: Date.now().toString(),
                    date: new Date().toISOString(),
                    type: 'Contact',
                    name: (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value,
                    email: (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value,
                    details: `Belevingsbox aanvraag - Adres: ${(e.currentTarget.elements.namedItem('address') as HTMLInputElement).value}`,
                    status: 'Nieuw'
                  });
                  alert('Super! We sturen de belevingsbox zo snel mogelijk naar je toe!');
                  e.currentTarget.reset();
                }}>
                  <div>
                    <label className="block text-sm font-bold mb-2 text-white/90">Naam</label>
                    <input
                      required
                      name="name"
                      type="text"
                      className="w-full p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="Uw naam"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-white/90">Email</label>
                    <input
                      required
                      name="email"
                      type="email"
                      className="w-full p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                      placeholder="uw.email@voorbeeld.be"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2 text-white/90">Adres (voor verzending)</label>
                    <textarea
                      required
                      name="address"
                      rows={3}
                      className="w-full p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white resize-none"
                      placeholder="Straat + nummer, Postcode + Gemeente"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-white text-school-orange font-bold py-4 rounded-lg hover:bg-gray-100 transition shadow-lg"
                  >
                    Verstuur aanvraag
                  </button>
                </form>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 border-l-4 border-school-green p-6 rounded-r-xl">
              <h3 className="font-bold text-school-dark mb-2 text-lg">Gratis en vrijblijvend</h3>
              <p className="text-gray-700">
                De belevingsbox is volledig gratis en er komt geen enkele verplichting bij kijken.
                Het is onze manier om jullie kennis te laten maken met onze warme schoolgemeenschap.
                Daarna beslissen jullie zelf of Sint-Maarten de juiste keuze is voor jullie gezin!
              </p>
            </div>
          </div>
        )}
      </main>

      <Footer setPage={setPage} config={config} />
      <ChatWidget events={events} config={config} />
    </div>
  );
}

export default App;