import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Calendar, 
  BookOpen, Users, Camera, Star, Info, 
  ChevronRight, Lock, ExternalLink, Download,
  Trash2, Plus, Edit, Image as ImageIcon, Sparkles, Check, Video, School,
  MessageCircle, Send, Settings, FileText, Inbox
} from 'lucide-react';
import { generateNewsContent, generateChatResponse } from './services/geminiService';
import { MOCK_NEWS, MOCK_EVENTS, MOCK_ALBUMS, MOCK_TEAM, DEFAULT_CONFIG, MOCK_SUBMISSIONS, INITIAL_CHAT_MESSAGES } from './constants';
import { NewsItem, CalendarEvent, PhotoAlbum, PageView, Teacher, SiteConfig, FormSubmission, ChatMessage } from './types';

// --- UTILS ---
const addToGoogleCalendar = (event: CalendarEvent) => {
    const startTime = event.date.replace(/-/g, '') + 'T090000Z';
    const endTime = event.date.replace(/-/g, '') + 'T170000Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(event.description || '')}&location=VBS Sint-Maarten`;
    window.open(url, '_blank');
};

// --- COMPONENTS ---

// 1. CHAT WIDGET
const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const response = await generateChatResponse(messages, input);
        const botMsg: ChatMessage = { id: (Date.now()+1).toString(), sender: 'bot', text: response, timestamp: new Date() };
        
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 bg-school-red text-white p-4 rounded-full shadow-2xl hover:scale-110 transition duration-300 flex items-center gap-2"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                {!isOpen && <span className="font-bold pr-2 hidden md:inline">Vraag het Sint-Maarten</span>}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-[500px] animate-fade-in-up">
                    <div className="bg-school-dark text-white p-4 flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full"><School size={20} /></div>
                        <div>
                            <h3 className="font-bold text-sm">Sint-Maarten Assistent</h3>
                            <p className="text-xs text-gray-300">Altijd bereikbaar</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                                    msg.sender === 'user' 
                                    ? 'bg-school-red text-white rounded-tr-none' 
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && <div className="text-xs text-gray-400 text-center">Aan het typen...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2">
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Stel uw vraag..."
                            className="flex-1 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-school-red"
                        />
                        <button type="submit" className="bg-school-green text-white p-2 rounded-lg hover:bg-green-700 transition"><Send size={18} /></button>
                    </form>
                </div>
            )}
        </>
    );
};

// 2. NAVIGATION
const Navbar = ({ activePage, setPage, mobileMenuOpen, setMobileMenuOpen, config }: any) => {
  const navItems: { id: PageView; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'Over Ons' },
    { id: 'enroll', label: 'Inschrijven' },
    { id: 'team', label: 'Team' },
    { id: 'news', label: 'Nieuws' },
    { id: 'calendar', label: 'Agenda' },
    { id: 'info', label: 'Info' },
    { id: 'gallery', label: 'Foto\'s' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center cursor-pointer gap-4" onClick={() => setPage('home')}>
            <div className="flex items-center justify-center h-16 w-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative">
                <img 
                    src="https://via.placeholder.com/150x150.png?text=Logo" 
                    alt="Logo" 
                    className="h-full w-full object-contain relative z-10"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const sibling = e.currentTarget.nextElementSibling;
                        if (sibling) sibling.classList.remove('hidden');
                    }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center text-school-red bg-gray-50 z-0">
                    <School size={32} />
                </div>
            </div>
            
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-2xl text-gray-900 leading-none">Sint-Maarten</h1>
              <p className="text-sm text-school-green font-medium uppercase tracking-wider mt-1">Vrije Basisschool Sijsele</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'text-school-red bg-red-50'
                    : 'text-gray-600 hover:text-school-red hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => setPage('box')}
              className="bg-school-orange text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition shadow-sm flex items-center gap-1 ml-2"
            >
              <Star size={16} /> Box
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full z-50">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg text-lg font-medium border-b border-gray-50 ${
                  activePage === item.id
                    ? 'text-school-red bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
               onClick={() => { setPage('box'); setMobileMenuOpen(false); }}
               className="w-full text-left px-4 py-4 text-white bg-school-orange font-bold rounded-lg flex items-center gap-2 justify-center mt-4"
            >
              <Star size={18} /> Belevingsbox Aanvragen
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = ({ setPage }: any) => (
  <footer className="bg-school-dark text-white pt-12 pb-6">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="font-display text-xl font-bold mb-4 text-school-orange">VBS Sint-Maarten</h3>
        <p className="text-gray-300 text-sm leading-relaxed mb-4">
          Een school met een hart voor elk kind.<br/>
          Samen groeien, samen leren, samen leven.
        </p>
        <div className="flex items-center gap-2 text-gray-400 text-sm">
           <MapPin size={16} /> Kloosterstraat 1, 8340 Sijsele
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold mb-4">Snel naar</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li><button onClick={() => setPage('calendar')} className="hover:text-white hover:underline">Kalender</button></li>
          <li><button onClick={() => setPage('info')} className="hover:text-white hover:underline">Menu (Hanssens)</button></li>
          <li><button onClick={() => setPage('enroll')} className="hover:text-white hover:underline">Inschrijven</button></li>
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
      <span>&copy; 2026 VBS Sint-Maarten</span>
    </div>
  </footer>
);

// 3. PAGES

const HomePage = ({ news, setPage, config }: { news: NewsItem[], setPage: (p: PageView) => void, config: SiteConfig }) => (
  <div className="animate-fade-in">
    {/* Hero Section */}
    <div className="relative h-[600px] w-full overflow-hidden group">
      <img 
        src={config.homeHeroImage} 
        alt="Hero" 
        className="w-full h-full object-cover transition-transform duration-1000"
        style={{ objectPosition: config.homeHeroPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-20">
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
             <button onClick={() => alert("De virtuele rondleiding wordt gelanceerd in Q2 2026!")} className="bg-school-orange text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg flex items-center gap-3">
               <Video size={24} />
               Virtuele Tour
             </button>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Links */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
      <div className="bg-school-orange p-10 text-white flex flex-col items-center text-center hover:bg-orange-600 transition cursor-pointer group" onClick={() => setPage('calendar')}>
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition"><Calendar size={40} /></div>
        <h3 className="font-display text-2xl font-bold">Kalender</h3>
        <p className="text-white/90 mt-2">Bekijk vakanties en activiteiten</p>
      </div>
      <a href={config.menuUrl} target="_blank" rel="noreferrer" className="bg-school-green p-10 text-white flex flex-col items-center text-center hover:bg-green-700 transition cursor-pointer group">
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition"><BookOpen size={40} /></div>
        <h3 className="font-display text-2xl font-bold">Menu</h3>
        <p className="text-white/90 mt-2">Warme maaltijden (Hanssens)</p>
      </a>
      <div className="bg-school-red p-10 text-white flex flex-col items-center text-center hover:bg-red-700 transition cursor-pointer group" onClick={() => setPage('box')}>
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition"><Star size={40} /></div>
        <h3 className="font-display text-2xl font-bold">Belevingsbox</h3>
        <p className="text-white/90 mt-2">Vraag jouw gratis doos aan!</p>
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

const AboutPage = ({ config }: { config: SiteConfig }) => (
  <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl font-display font-bold text-school-dark mb-6">Over Onze School</h1>
        <p className="text-xl text-gray-600 leading-relaxed">{config.aboutText}</p>
    </div>
    <img src="https://picsum.photos/1200/500?random=50" className="w-full h-[400px] object-cover rounded-2xl mb-16 shadow-lg" alt="Schoolplein" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-lg text-gray-700 leading-relaxed">
      <section>
        <h2 className="text-3xl font-display font-bold text-school-dark mb-4 flex items-center gap-3"><Star className="text-school-red"/> Onze Visie</h2>
        <p>Vanuit onze christelijke inspiratie bouwen we aan een warme gemeenschap waar iedereen zich thuis mag voelen. Respect, vertrouwen en geborgenheid zijn onze kernwaarden.</p>
      </section>
      <section className="bg-gray-50 p-8 rounded-2xl">
        <h2 className="text-3xl font-display font-bold text-school-dark mb-4 flex items-center gap-3"><Users className="text-school-green"/> Zorg op maat</h2>
        <p className="mb-4">Elk kind heeft zijn eigen talenten. Ons zorgteam differentieert in de klas zodat elk kind op eigen tempo groeit.</p>
        <ul className="space-y-2 mt-4">
            <li className="flex items-center gap-2"><Check size={18} className="text-school-green"/> Sterk zorgbeleid</li>
            <li className="flex items-center gap-2"><Check size={18} className="text-school-green"/> Aandacht voor welbevinden</li>
        </ul>
      </section>
    </div>
  </div>
);

const TeamPage = ({ team }: { team: Teacher[] }) => (
  <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center mb-16">
      <h1 className="text-5xl font-display font-bold text-school-dark mb-6">Het Team</h1>
      <p className="text-gray-600 max-w-2xl mx-auto text-lg">Een gedreven korps staat elke dag klaar.</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {team.map(member => (
        <div key={member.id} className="text-center group cursor-pointer">
          <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[3/4] shadow-md group-hover:shadow-xl transition duration-300">
            <img src={member.imageUrl} alt={member.role} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
              <span className="inline-block bg-school-red px-2 py-1 text-xs font-bold rounded-md mb-1">{member.group}</span>
            </div>
          </div>
          <h3 className="font-bold text-xl text-gray-800">{member.role}</h3>
        </div>
      ))}
    </div>
  </div>
);

const EnrollPage = ({ addSubmission }: { addSubmission: (s: FormSubmission) => void }) => {
    const [formData, setFormData] = useState({ name: '', phone: '', childName: '', childDob: '', type: 'Rondleiding' });
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addSubmission({
            id: Date.now().toString(),
            date: new Date().toISOString(),
            type: 'Inschrijving',
            name: formData.name,
            details: `Kind: ${formData.childName} (${formData.childDob}) - Type: ${formData.type} - Tel: ${formData.phone}`,
            status: 'Nieuw'
        });
        alert("Bedankt! We nemen spoedig contact op.");
        setFormData({ name: '', phone: '', childName: '', childDob: '', type: 'Rondleiding' });
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
            <h1 className="text-5xl font-display font-bold text-school-red mb-12 text-center">Inschrijven</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6 text-gray-600">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                        <h3 className="font-bold text-blue-800 mb-2 text-lg">Instapmomenten Peuters</h3>
                        <p>Is uw kindje geboren in 2022? We berekenen graag samen de instapdatum.</p>
                    </div>
                    <p>Wij nodigen u graag uit voor een kennismakingsgesprek en rondleiding.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Interesse formulier</h2>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <input required placeholder="Naam Ouder" className="w-full p-3 bg-gray-50 border rounded-lg" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/>
                        <input placeholder="Telefoon" className="w-full p-3 bg-gray-50 border rounded-lg" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})}/>
                        <input placeholder="Naam Kind" className="w-full p-3 bg-gray-50 border rounded-lg" value={formData.childName} onChange={e=>setFormData({...formData, childName: e.target.value})}/>
                        <input type="date" className="w-full p-3 bg-gray-50 border rounded-lg" value={formData.childDob} onChange={e=>setFormData({...formData, childDob: e.target.value})}/>
                        <select className="w-full p-3 bg-gray-50 border rounded-lg" value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})}>
                            <option>Rondleiding aanvragen</option>
                            <option>Inschrijving definitief maken</option>
                        </select>
                        <button type="submit" className="w-full bg-school-green text-white font-bold py-4 rounded-lg hover:bg-green-700 transition">Versturen</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const CalendarPage = ({ events }: { events: CalendarEvent[] }) => (
  <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-school-dark">Schoolkalender</h1>
        <p className="text-gray-500 mt-2">Alle belangrijke data op een rijtje</p>
    </div>

    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event, idx) => (
            <div key={event.id} className={`p-6 md:p-8 flex items-center justify-between border-b border-gray-100 last:border-0 hover:bg-gray-50 transition ${idx % 2 !== 0 ? 'bg-gray-50/30' : ''}`}>
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-sm font-bold text-school-red uppercase">{new Date(event.date).toLocaleDateString('nl-BE', { month: 'short' })}</div>
                        <div className="text-3xl font-display font-bold text-gray-900">{new Date(event.date).getDate()}</div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-xl">{event.title}</h3>
                        <div className="flex gap-2 mt-1">
                             <span className={`text-xs px-2 py-0.5 rounded border ${event.type === 'Vakantie' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>{event.type}</span>
                             {event.description && <span className="text-xs text-gray-500 hidden md:inline pt-0.5">- {event.description}</span>}
                        </div>
                    </div>
                </div>
                <button onClick={() => addToGoogleCalendar(event)} className="text-gray-400 hover:text-school-green hover:bg-green-50 p-2 rounded-full transition" title="Toevoegen aan Google Agenda">
                    <Calendar size={20} />
                </button>
            </div>
        ))}
    </div>
  </div>
);

const InfoPage = ({ config }: { config: SiteConfig }) => (
  <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
    <h1 className="text-4xl font-display font-bold text-school-dark mb-12 text-center">Praktische Info</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-school-orange"><Users/> Uurrooster</h2>
            <ul className="space-y-4 text-gray-600">
                <li className="flex justify-between border-b pb-2"><span>Start:</span> <strong>08:30</strong></li>
                <li className="flex justify-between border-b pb-2"><span>Middag:</span> <strong>12:05 - 13:20</strong></li>
                <li className="flex justify-between"><span>Einde:</span> <strong>15:30</strong></li>
            </ul>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-school-green"><Star/> Opvang</h2>
            <p className="text-gray-600 mb-4">Voor- en naschoolse opvang is beschikbaar op school.</p>
            <a href={config.menuUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-school-green font-bold hover:underline">
                <ExternalLink size={16}/> Bekijk Menu Hanssens
            </a>
        </div>
    </div>
  </div>
);

// --- ADMIN PANEL (CMS) ---
const AdminPanel = ({ news, setNews, events, setEvents, config, setConfig, submissions }: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'news' | 'events' | 'pages' | 'inbox'>('news');
    
    // Editor States
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [newsDate, setNewsDate] = useState(new Date().toISOString().split('T')[0]);
    const [newsExpiry, setNewsExpiry] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [eventTitle, setEventTitle] = useState('');
    const [eventDate, setEventDate] = useState('');

    // Handlers
    const handleLogin = () => (password === 'admin') ? setIsAuthenticated(true) : alert('Fout wachtwoord (probeer "admin")');

    const handleAddNews = async (e: React.FormEvent) => {
        e.preventDefault();
        setNews([{
            id: Date.now().toString(),
            title: newsTitle,
            content: newsContent,
            date: newsDate,
            expiryDate: newsExpiry || undefined,
            imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
            category: 'Algemeen'
        }, ...news]);
        setNewsTitle(''); setNewsContent(''); setNewsExpiry('');
        alert('Nieuwsbericht geplaatst!');
    };

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        setEvents([...events, { id: Date.now().toString(), title: eventTitle, date: eventDate, type: 'Activiteit', grades: ['All'] }]);
        setEventTitle(''); setEventDate('');
    };

    const handleAIWrite = async () => {
        if(!newsTitle) return alert("Vul eerst een titel in.");
        setIsGenerating(true);
        const text = await generateNewsContent(newsTitle);
        setNewsContent(text);
        setIsGenerating(false);
    };

    if (!isAuthenticated) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-10 rounded-2xl shadow-xl max-w-sm w-full text-center">
                <div className="mx-auto w-16 h-16 bg-school-red rounded-full flex items-center justify-center text-white mb-4"><Lock/></div>
                <h2 className="text-2xl font-bold mb-6">Admin Login</h2>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 border rounded-lg mb-4" placeholder="Wachtwoord"/>
                <button onClick={handleLogin} className="w-full bg-school-dark text-white font-bold py-3 rounded-lg">Inloggen</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Schoolbeheer</h1>
                    <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-bold bg-white px-4 py-2 rounded shadow-sm">Uitloggen</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="space-y-2">
                        {[
                            {id: 'news', icon: <FileText size={18}/>, label: 'Nieuws'},
                            {id: 'events', icon: <Calendar size={18}/>, label: 'Kalender'},
                            {id: 'pages', icon: <Settings size={18}/>, label: 'Pagina\'s & Menu'},
                            {id: 'inbox', icon: <Inbox size={18}/>, label: 'Inbox', count: submissions.length}
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center justify-between p-4 rounded-xl font-medium transition ${activeTab === tab.id ? 'bg-white text-school-red shadow border-l-4 border-school-red' : 'text-gray-600 hover:bg-white'}`}>
                                <div className="flex items-center gap-3">{tab.icon} {tab.label}</div>
                                {tab.count !== undefined && <span className="bg-school-red text-white text-xs px-2 py-1 rounded-full">{tab.count}</span>}
                            </button>
                        ))}
                    </div>

                    <div className="lg:col-span-3 space-y-8">
                        {activeTab === 'news' && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold mb-6 border-b pb-4">Nieuwsbericht Maken</h2>
                                <form onSubmit={handleAddNews} className="space-y-4 mb-10">
                                    <input value={newsTitle} onChange={e=>setNewsTitle(e.target.value)} placeholder="Titel" className="w-full p-3 border rounded-lg"/>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Publicatiedatum</label>
                                            <input type="date" value={newsDate} onChange={e=>setNewsDate(e.target.value)} className="w-full p-3 border rounded-lg"/>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase text-school-red">Verwijderdatum (Auto)</label>
                                            <input type="date" value={newsExpiry} onChange={e=>setNewsExpiry(e.target.value)} className="w-full p-3 border rounded-lg"/>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <textarea value={newsContent} onChange={e=>setNewsContent(e.target.value)} rows={4} placeholder="Inhoud..." className="w-full p-3 border rounded-lg"/>
                                        <button type="button" onClick={handleAIWrite} disabled={isGenerating} className="absolute bottom-3 right-3 text-xs bg-purple-600 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-purple-700">
                                            <Sparkles size={12}/> {isGenerating ? 'Schrijven...' : 'AI Assistant'}
                                        </button>
                                    </div>
                                    <button type="submit" className="bg-school-green text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700">Publiceren</button>
                                </form>
                                <h3 className="font-bold text-lg mb-4">Actieve Berichten</h3>
                                {news.map((item: NewsItem) => (
                                    <div key={item.id} className="flex justify-between items-center p-4 border-b hover:bg-gray-50">
                                        <div>
                                            <div className="font-bold">{item.title}</div>
                                            <div className="text-xs text-gray-500">Verloopt: {item.expiryDate || 'Nooit'}</div>
                                        </div>
                                        <button onClick={() => setNews(news.filter((n:NewsItem) => n.id !== item.id))} className="text-red-500 p-2"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold mb-6">Kalender Item Toevoegen</h2>
                                <form onSubmit={handleAddEvent} className="flex gap-4 mb-8">
                                    <input value={eventTitle} onChange={e=>setEventTitle(e.target.value)} placeholder="Naam activiteit" className="flex-grow p-3 border rounded-lg"/>
                                    <input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} className="p-3 border rounded-lg"/>
                                    <button type="submit" className="bg-school-blue-600 bg-blue-600 text-white px-6 rounded-lg font-bold hover:bg-blue-700"><Plus/></button>
                                </form>
                                {events.map((ev: CalendarEvent) => (
                                    <div key={ev.id} className="flex justify-between p-3 border-b last:border-0">
                                        <span><span className="font-mono text-gray-500 mr-4">{ev.date}</span> {ev.title}</span>
                                        <button onClick={() => setEvents(events.filter((e:any)=>e.id!==ev.id))} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'pages' && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm space-y-8">
                                <div>
                                    <h3 className="font-bold text-lg mb-4">Home Hero Instellingen</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Titel</label>
                                            <textarea value={config.homeTitle} onChange={e => setConfig({...config, homeTitle: e.target.value})} className="w-full p-3 border rounded-lg" rows={2}/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Foto Positie (Crop)</label>
                                            <select value={config.homeHeroPosition} onChange={e => setConfig({...config, homeHeroPosition: e.target.value})} className="w-full p-3 border rounded-lg">
                                                <option value="center center">Midden</option>
                                                <option value="center top">Bovenkant</option>
                                                <option value="center bottom">Onderkant</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-2">Selecteer welk deel van de foto zichtbaar moet blijven.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-lg mb-4">Menu Link (Hanssens)</h3>
                                    <div className="flex gap-2">
                                        <input value={config.menuUrl} onChange={e => setConfig({...config, menuUrl: e.target.value})} className="w-full p-3 border rounded-lg text-sm font-mono"/>
                                        <a href={config.menuUrl} target="_blank" className="p-3 bg-gray-100 rounded-lg"><ExternalLink size={20}/></a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'inbox' && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold mb-6">Ingezonden Formulieren</h2>
                                <div className="space-y-4">
                                    {submissions.length === 0 ? <p className="text-gray-500 italic">Geen berichten.</p> : submissions.map((sub: FormSubmission) => (
                                        <div key={sub.id} className="border p-4 rounded-lg hover:bg-gray-50">
                                            <div className="flex justify-between mb-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${sub.type === 'Inschrijving' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>{sub.type}</span>
                                                <span className="text-xs text-gray-500">{new Date(sub.date).toLocaleDateString()}</span>
                                            </div>
                                            <h4 className="font-bold">{sub.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{sub.details}</p>
                                            {sub.email && <a href={`mailto:${sub.email}`} className="text-xs text-school-red mt-2 block hover:underline">{sub.email}</a>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. ROOT COMPONENT
function App() {
  const [page, setPage] = useState<PageView>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Central State (Simulated Database)
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [submissions, setSubmissions] = useState<FormSubmission[]>(MOCK_SUBMISSIONS);
  
  const [team] = useState<Teacher[]>(MOCK_TEAM);
  const [albums] = useState<PhotoAlbum[]>(MOCK_ALBUMS);

  const addSubmission = (sub: FormSubmission) => setSubmissions([sub, ...submissions]);

  // Filter active news (simulating backend logic)
  const activeNews = useMemo(() => {
      const now = new Date();
      return news.filter(n => !n.expiryDate || new Date(n.expiryDate) > now)
                 .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [news]);

  if (page === 'admin') {
      return <AdminPanel news={news} setNews={setNews} events={events} setEvents={setEvents} config={config} setConfig={setConfig} submissions={submissions} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      <Navbar activePage={page} setPage={setPage} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} config={config} />
      
      <main className="flex-grow">
        {page === 'home' && <HomePage news={activeNews} setPage={setPage} config={config} />}
        {page === 'about' && <AboutPage config={config} />}
        {page === 'enroll' && <EnrollPage addSubmission={addSubmission} />}
        {page === 'team' && <TeamPage team={team} />}
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
        {page === 'info' && <InfoPage config={config} />}
        {page === 'gallery' && <div className="p-20 text-center text-gray-500">Galerij module (zelfde als vorige versie)</div>}
        {page === 'contact' && <div className="p-20 text-center text-gray-500">Contact (zie Info pagina)</div>}
        {page === 'box' && <div className="p-20 text-center font-bold text-2xl text-school-orange">De Belevingsbox!</div>}
      </main>

      <Footer setPage={setPage} />
      <ChatWidget />
    </div>
  );
}

export default App;