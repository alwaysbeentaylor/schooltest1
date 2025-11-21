import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, X, Phone, Mail, MapPin, Calendar, 
  BookOpen, Users, Camera, Star, Info, 
  ChevronRight, Lock, ExternalLink, Download,
  Trash2, Plus, Edit, Image as ImageIcon, Sparkles, Check, Video, School
} from 'lucide-react';
import { generateNewsContent } from './services/geminiService';
import { MOCK_NEWS, MOCK_EVENTS, MOCK_ALBUMS, MOCK_TEAM } from './constants';
import { NewsItem, CalendarEvent, PhotoAlbum, PageView, Teacher } from './types';

// --- COMPONENTS ---

// 1. NAVIGATION
const Navbar = ({ activePage, setPage, mobileMenuOpen, setMobileMenuOpen }: any) => {
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
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24"> {/* Increased height for logo */}
          <div className="flex items-center cursor-pointer gap-4" onClick={() => setPage('home')}>
            {/* LOGO AANPASSING: Vervang de src hieronder door de URL van het echte logo */}
            <div className="flex items-center justify-center h-16 w-16 bg-white rounded-lg overflow-hidden">
                {/* Placeholder voor logo - Vervang src="..." door de echte url */}
                <img 
                    src="https://via.placeholder.com/150x150.png?text=Logo" 
                    alt="Logo VBS Sint-Maarten" 
                    className="h-full w-full object-contain"
                    onError={(e) => {
                        // Fallback als er geen logo is
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                />
                <div className="hidden h-12 w-12 bg-school-red rounded-full flex items-center justify-center text-white">
                    <School size={24} />
                </div>
            </div>
            
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-2xl text-gray-900 leading-none">Sint-Maarten</h1>
              <p className="text-sm text-school-green font-medium uppercase tracking-wider mt-1">Vrije Basisschool Sijsele</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
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
              className="bg-school-orange text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition shadow-sm flex items-center gap-1"
            >
              <Star size={16} /> Belevingsbox
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
        <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
           <Phone size={16} /> 050 12 34 56
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">
           <Mail size={16} /> info@vrijebasisschoolsijsele.be
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold mb-4">Snel naar</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li><button onClick={() => setPage('calendar')} className="hover:text-white hover:underline">Kalender</button></li>
          <li><button onClick={() => setPage('info')} className="hover:text-white hover:underline">Menu (Hanssens)</button></li>
          <li><button onClick={() => setPage('enroll')} className="hover:text-white hover:underline">Inschrijven</button></li>
          <li><button onClick={() => setPage('parents')} className="hover:text-white hover:underline">Ouderwerkgroep</button></li>
        </ul>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold mb-4">Locaties</h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>De Verrekijker (Kleuter)</li>
          <li>Kloosterstraat (Kleuter)</li>
          <li>Hoofdschool (Lager)</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
      <span>&copy; 2026 VBS Sint-Maarten</span>
      
      {/* ADMIN KNOP - NU DUIDELIJK ZICHTBAAR */}
      <button 
        onClick={() => setPage('admin')} 
        className="flex items-center gap-2 bg-gray-800 hover:bg-school-red text-white px-4 py-2 rounded transition-colors" 
        title="Admin Login"
      >
        <Lock size={14} />
        <span>Admin Login</span>
      </button>
    </div>
  </footer>
);

// 2. PAGES

const HomePage = ({ news, setPage }: { news: NewsItem[], setPage: (p: PageView) => void }) => (
  <div className="animate-fade-in">
    {/* Hero Section */}
    <div className="relative h-[600px] w-full overflow-hidden">
      <img 
        src="https://picsum.photos/1920/1080?random=99" 
        alt="Kinderen spelen op speelplaats" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-20">
        <div className="max-w-5xl">
          <div className="flex gap-2 mb-6">
              <span className="bg-school-green text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-md">
                Warme school
              </span>
              <span className="bg-school-orange text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide shadow-md">
                Sijsele
              </span>
          </div>
          <h2 className="text-4xl md:text-7xl font-display font-bold text-white mb-6 drop-shadow-lg leading-tight">
            Samen groeien,<br/>elk op zijn eigen ritme
          </h2>
          <div className="flex flex-wrap gap-4">
             <button 
               onClick={() => setPage('enroll')}
               className="bg-school-red text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
             >
               Ik wil inschrijven
             </button>
             <button 
               onClick={() => setPage('about')}
               className="bg-white/10 backdrop-blur-md text-white border-2 border-white/50 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition shadow-lg"
             >
               Ontdek onze visie
             </button>
             <button 
               onClick={() => alert("De virtuele rondleiding wordt binnenkort gelanceerd!")}
               className="bg-school-orange text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg flex items-center gap-3"
             >
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
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition">
            <Calendar size={40} />
        </div>
        <h3 className="font-display text-2xl font-bold">Kalender</h3>
        <p className="text-white/90 mt-2">Bekijk vakanties en activiteiten</p>
      </div>
      <a href="https://order.hanssens.be/menu/O56/OUDE-VESTIGING" target="_blank" rel="noreferrer" className="bg-school-green p-10 text-white flex flex-col items-center text-center hover:bg-green-700 transition cursor-pointer group">
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition">
            <BookOpen size={40} />
        </div>
        <h3 className="font-display text-2xl font-bold">Menu</h3>
        <p className="text-white/90 mt-2">Warme maaltijden (Hanssens)</p>
      </a>
      <div className="bg-school-red p-10 text-white flex flex-col items-center text-center hover:bg-red-700 transition cursor-pointer group" onClick={() => setPage('box')}>
        <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:scale-110 transition">
             <Star size={40} />
        </div>
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
                  {new Date(item.date).toLocaleDateString('nl-BE', {day: 'numeric', month: 'long', year: 'numeric'})}
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

const AboutPage = () => (
  <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-5xl font-display font-bold text-school-dark mb-6">Over Onze School</h1>
        <p className="text-xl text-gray-600">
            Waar elk talent telt en we samen bouwen aan de toekomst.
        </p>
    </div>
    
    <img src="https://picsum.photos/1200/500?random=50" className="w-full h-[400px] object-cover rounded-2xl mb-16 shadow-lg" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-lg text-gray-700 leading-relaxed items-center">
      <section>
        <div className="w-12 h-12 bg-red-100 text-school-red rounded-full flex items-center justify-center mb-4">
            <Star size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-school-dark mb-4">Onze Visie & Missie</h2>
        <p className="mb-4">
          In VBS Sint-Maarten staat het kind centraal. Wij geloven in onderwijs dat niet alleen kennis overdraagt, 
          maar ook werkt aan de totale persoonlijkheidsontwikkeling.
        </p>
        <p>
          Vanuit onze christelijke inspiratie bouwen we aan een warme gemeenschap waar iedereen zich thuis mag voelen.
          Respect, vertrouwen en geborgenheid zijn onze kernwaarden.
        </p>
      </section>
      <section className="bg-gray-50 p-8 rounded-2xl">
         <div className="w-12 h-12 bg-green-100 text-school-green rounded-full flex items-center justify-center mb-4">
            <Users size={24} />
        </div>
        <h2 className="text-3xl font-display font-bold text-school-dark mb-4">Zorg op maat</h2>
        <p className="mb-4">
          Elk kind heeft zijn eigen talenten en noden. Ons zorgteam zet zich dagelijks in om differentiatie toe te passen 
          in de klas, zodat elk kind op zijn eigen tempo kan groeien. 
        </p>
        <ul className="space-y-2 mt-4">
            <li className="flex items-center gap-2"><Check size={18} className="text-school-green"/> Sterk zorgbeleid</li>
            <li className="flex items-center gap-2"><Check size={18} className="text-school-green"/> Aandacht voor welbevinden</li>
            <li className="flex items-center gap-2"><Check size={18} className="text-school-green"/> Betrokken leerkrachten</li>
        </ul>
      </section>
    </div>
  </div>
);

const TeamPage = ({ team }: { team: Teacher[] }) => (
  <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
    <div className="text-center mb-16">
      <span className="text-school-red font-bold uppercase tracking-wider text-sm">Onze Helden</span>
      <h1 className="text-5xl font-display font-bold text-school-dark mb-6 mt-2">Het Team</h1>
      <p className="text-gray-600 max-w-2xl mx-auto text-lg">
        Een gedreven korps van leerkrachten, zorgcoördinatoren en medewerkers staat elke dag klaar 
        om het beste uit uw kind te halen.
      </p>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {team.map(member => (
        <div key={member.id} className="text-center group cursor-pointer">
          <div className="relative mb-6 overflow-hidden rounded-2xl aspect-[3/4] shadow-md group-hover:shadow-xl transition duration-300">
            <img 
              src={member.imageUrl} 
              alt={member.role} 
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition duration-300">
              <span className="inline-block bg-school-red px-2 py-1 text-xs font-bold rounded-md mb-1">{member.group}</span>
            </div>
          </div>
          <h3 className="font-bold text-xl text-gray-800 group-hover:text-school-red transition">{member.role}</h3>
        </div>
      ))}
    </div>
  </div>
);

const EnrollPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-16 animate-fade-in">
    <h1 className="text-5xl font-display font-bold text-school-red mb-12 text-center">Inschrijven & Aanmelden</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
             <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <h3 className="font-bold text-blue-800 mb-2 text-lg">Instapmomenten Peuters</h3>
                <p className="text-blue-700">
                    Is uw kindje geboren in 2022? Dan mag het binnenkort naar school! 
                    We berekenen graag samen met u de exacte instapdatum.
                </p>
            </div>

            <div className="prose text-gray-600">
                <p>
                    Wij nodigen u graag uit voor een kennismakingsgesprek en een rondleiding op onze school. 
                    Zo kunt u de sfeer opsnuiven en zien waar uw kind terechtkomt.
                </p>
                <p className="font-bold">Wat mee te brengen bij inschrijving:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Identiteitskaart van het kind (ISI+)</li>
                    <li>Identiteitskaart van de ouder(s)</li>
                </ul>
            </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Interesse formulier</h2>
            <form className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam Ouder</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-red focus:outline-none transition" placeholder="Uw naam" />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefoon</label>
                <input type="tel" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-red focus:outline-none transition" placeholder="04..." />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam Kind</label>
                <input type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-red focus:outline-none transition" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Geboortedatum Kind</label>
                <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-red focus:outline-none transition" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waarvoor heeft u interesse?</label>
                <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-red focus:outline-none transition">
                <option>Rondleiding aanvragen</option>
                <option>Inschrijving definitief maken</option>
                <option>Vrijblijvend gesprek</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-school-green text-white font-bold py-4 rounded-lg hover:bg-green-700 transition shadow-md text-lg">
                Versturen
            </button>
            </form>
        </div>
    </div>
  </div>
);

const NewsPage = ({ news }: { news: NewsItem[] }) => (
  <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
    <h1 className="text-5xl font-display font-bold text-school-dark mb-12 text-center">Nieuws & Actualiteit</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {news.map(item => (
          <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition border border-gray-100 flex flex-col">
            <div className="h-56 overflow-hidden relative">
               <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition duration-700" />
            </div>
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-school-green bg-green-50 px-3 py-1 rounded-full">{item.category}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> {new Date(item.date).toLocaleDateString('nl-BE')}</span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-6 flex-1 leading-relaxed">{item.content}</p>
              <div className="pt-4 border-t border-gray-100">
                  <button className="text-school-dark text-sm font-bold flex items-center gap-1 hover:text-school-red transition">Lees volledig bericht <ChevronRight size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>
  </div>
);

const CalendarPage = ({ events }: { events: CalendarEvent[] }) => (
  <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <div>
            <h1 className="text-4xl font-display font-bold text-school-dark">Schoolkalender</h1>
            <p className="text-gray-500 mt-2">Alle belangrijke data op een rijtje</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-school-red border-2 border-school-red px-6 py-3 rounded-full font-bold hover:bg-red-50 transition shadow-sm">
            <Download size={18} /> Sync met Agenda
        </button>
    </div>

    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event, idx) => (
            <div key={event.id} className={`p-6 md:p-8 flex items-center border-b border-gray-100 last:border-0 hover:bg-gray-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                <div className="flex-shrink-0 w-20 text-center mr-8">
                    <div className="text-sm font-bold text-school-red uppercase tracking-wider mb-1">{new Date(event.date).toLocaleDateString('nl-BE', { month: 'short' })}</div>
                    <div className="text-3xl font-display font-bold text-gray-900">{new Date(event.date).getDate()}</div>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-xl mb-1">{event.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                            event.type === 'Vakantie' ? 'bg-green-50 text-green-700 border-green-100' : 
                            event.type === 'Vrije Dag' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                            {event.type}
                        </span>
                        {event.grades.includes('All') && <span className="text-xs px-3 py-1 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">Iedereen</span>}
                    </div>
                </div>
            </div>
        ))}
    </div>
  </div>
);

const InfoPage = () => (
  <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in">
    <h1 className="text-4xl font-display font-bold text-school-dark mb-12 text-center">Praktische Info</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-school-orange/10 rounded-bl-full -mr-10 -mt-10"></div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Users className="text-school-orange"/> Uurrooster</h2>
            <ul className="space-y-4 text-gray-600">
                <li className="flex justify-between border-b border-gray-50 pb-2"><span>Start schooldag:</span> <strong className="text-school-dark">08:30</strong></li>
                <li className="flex justify-between border-b border-gray-50 pb-2"><span>Middagpauze:</span> <strong className="text-school-dark">12:05 - 13:20</strong></li>
                <li className="flex justify-between border-b border-gray-50 pb-2"><span>Einde schooldag:</span> <strong className="text-school-dark">15:30</strong></li>
                <li className="flex justify-between"><span>Woensdag tot:</span> <strong className="text-school-dark">11:40</strong></li>
            </ul>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-school-green/10 rounded-bl-full -mr-10 -mt-10"></div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Star className="text-school-green"/> Opvang De Verrekijker</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
                Voor- en naschoolse opvang is beschikbaar op de schoolcampus. Wij zorgen voor een warme en veilige omgeving voor en na de schooluren.
            </p>
            <button className="text-school-green font-bold flex items-center gap-2 hover:underline">
                <Download size={16}/> Download opvangreglement
            </button>
        </div>
    </div>

    <h2 className="text-3xl font-bold mb-8 text-school-dark">Documenten & Links</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Schoolreglement', 'Infobrochure', 'Aanvraag Medicatie', 'Privacybeleid', 'Cookiebeleid'].map(doc => (
            <div key={doc} className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-school-red cursor-pointer transition group">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-red-50 transition">
                        <BookOpen size={20} className="text-gray-500 group-hover:text-school-red" />
                    </div>
                    <span className="font-medium text-gray-700">{doc}</span>
                </div>
                <Download size={18} className="text-gray-400 group-hover:text-school-red" />
            </div>
        ))}
         <a href="https://order.hanssens.be/menu/O56/OUDE-VESTIGING" target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-green-50 border border-green-200 rounded-xl hover:shadow-md hover:bg-green-100 cursor-pointer transition group">
            <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-lg">
                    <ExternalLink size={20} className="text-school-green" />
                 </div>
                <span className="font-bold text-school-green">Maandmenu Hanssens</span>
            </div>
        </a>
    </div>
  </div>
);

const GalleryPage = ({ albums }: { albums: PhotoAlbum[] }) => (
  <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
     <h1 className="text-5xl font-display font-bold text-school-dark mb-8 text-center">Fotogalerij</h1>
     
     {/* Filter Tabs */}
     <div className="flex justify-center gap-3 mb-12 overflow-x-auto pb-4">
        {['Alles', 'Verrekijker', 'Kloosterstraat', 'Lager'].map(filter => (
            <button key={filter} className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${filter === 'Alles' ? 'bg-school-red text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {filter}
            </button>
        ))}
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {albums.map(album => (
            <div key={album.id} className="group cursor-pointer bg-white p-3 rounded-2xl shadow-sm hover:shadow-xl transition duration-300">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4 relative">
                    <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition"></div>
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Camera size={14} /> {album.images.length} foto's
                    </div>
                </div>
                <div className="px-2 pb-2">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-school-red transition mb-1">{album.title}</h3>
                    <span className="text-xs text-school-green uppercase font-bold tracking-wider">{album.location}</span>
                </div>
            </div>
        ))}
     </div>
  </div>
);

const ContactPage = () => (
  <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
    <h1 className="text-5xl font-display font-bold text-school-dark mb-16 text-center">Contact & Bereikbaarheid</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="font-bold text-2xl mb-6 text-school-dark border-b border-gray-100 pb-4">Secretariaat</h3>
                <div className="space-y-6 text-gray-600">
                    <div className="flex items-start gap-4">
                        <div className="bg-red-50 p-3 rounded-full text-school-red">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <span className="font-bold block text-gray-900">Adres</span>
                            <span>Kloosterstraat 1<br/>8340 Sijsele</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-green-50 p-3 rounded-full text-school-green">
                            <Phone size={24} />
                        </div>
                        <div>
                            <span className="font-bold block text-gray-900">Telefoon</span>
                            <span>050 12 34 56</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-50 p-3 rounded-full text-school-orange">
                            <Mail size={24} />
                        </div>
                         <div>
                            <span className="font-bold block text-gray-900">E-mail</span>
                            <a href="mailto:info@vrijebasisschoolsijsele.be" className="hover:text-school-orange transition">info@vrijebasisschoolsijsele.be</a>
                        </div>
                    </div>
                </div>
            </div>
            {/* Map Placeholder */}
            <div className="w-full h-80 bg-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-300">
                <MapPin size={48} className="mb-2 opacity-50" />
                <span className="font-medium">Google Maps Module</span>
                <span className="text-xs mt-1">Embed code hier invoegen</span>
            </div>
        </div>

        <div>
            <div className="bg-gray-50 p-10 rounded-3xl">
                <h2 className="text-3xl font-bold mb-6 text-school-dark">Stuur een bericht</h2>
                <p className="text-gray-600 mb-8">Heeft u een vraag of wenst u een afspraak? Vul onderstaand formulier in en wij nemen zo snel mogelijk contact op.</p>
                <form className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Naam</label>
                        <input type="text" className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-red focus:outline-none transition shadow-sm" placeholder="Uw volledige naam" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                        <input type="email" className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-red focus:outline-none transition shadow-sm" placeholder="naam@voorbeeld.be" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bericht</label>
                        <textarea rows={5} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-school-red focus:outline-none transition shadow-sm" placeholder="Uw vraag of opmerking..."></textarea>
                    </div>
                    <button className="w-full bg-school-dark text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-md text-lg mt-2">Verzenden</button>
                </form>
            </div>
        </div>
    </div>
  </div>
);

const BoxPage = () => (
    <div className="max-w-5xl mx-auto px-4 py-16 animate-fade-in text-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-school-red via-school-orange to-school-green"></div>
            
            <Star size={80} className="mx-auto text-school-orange mb-8 animate-pulse" />
            <h1 className="text-5xl md:text-6xl font-display font-bold text-school-dark mb-6">De Belevingsbox</h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Benieuwd naar onze school maar lukt een bezoekje even niet? <br/>
                Vraag de <strong className="text-school-orange">gratis belevingsbox</strong> aan! 
                Een doos vol leuke activiteiten, knutselwerkjes en informatie om thuis alvast de warme sfeer te proeven van VBS Sint-Maarten.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
                <div className="order-2 md:order-1">
                    <ul className="text-left space-y-4">
                        <li className="flex items-center gap-3 text-lg text-gray-700">
                            <div className="bg-green-100 p-2 rounded-full text-school-green"><Check size={20} /></div>
                            Info over de klaswerking
                        </li>
                        <li className="flex items-center gap-3 text-lg text-gray-700">
                            <div className="bg-orange-100 p-2 rounded-full text-school-orange"><Check size={20} /></div>
                            Leuke verrassing voor je peuter
                        </li>
                        <li className="flex items-center gap-3 text-lg text-gray-700">
                            <div className="bg-red-100 p-2 rounded-full text-school-red"><Check size={20} /></div>
                            Kennismaking met de juffen
                        </li>
                    </ul>
                    <button className="w-full mt-8 bg-school-orange text-white text-xl font-bold px-8 py-4 rounded-2xl hover:bg-orange-600 transition shadow-lg transform hover:scale-105">
                        Vraag nu aan!
                    </button>
                </div>
                <div className="order-1 md:order-2">
                    <img src="https://picsum.photos/500/400?random=88" alt="Belevingsbox inhoud" className="rounded-2xl shadow-xl rotate-3 hover:rotate-0 transition duration-500" />
                </div>
            </div>
        </div>
    </div>
);

// --- ADMIN PANEL ---
const AdminPanel = ({ news, setNews, events, setEvents }: any) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'news' | 'events'>('news');
    
    // News State
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleLogin = () => {
        if(password === 'admin') setIsAuthenticated(true);
        else alert('Fout wachtwoord');
    };

    const handleAddNews = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: NewsItem = {
            id: Date.now().toString(),
            title: newsTitle,
            content: newsContent,
            date: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days default
            imageUrl: `https://picsum.photos/800/600?random=${Date.now()}`,
            category: 'Algemeen'
        };
        setNews([newItem, ...news]);
        setNewsTitle('');
        setNewsContent('');
        alert('Nieuwsbericht toegevoegd!');
    };

    const handleDeleteNews = (id: string) => {
        if(confirm('Zeker weten?')) {
            setNews(news.filter((n: NewsItem) => n.id !== id));
        }
    }

    const handleAIWrite = async () => {
        if(!newsTitle) {
            alert("Vul eerst een titel of onderwerp in.");
            return;
        }
        setIsGenerating(true);
        const text = await generateNewsContent(newsTitle);
        setNewsContent(text);
        setIsGenerating(false);
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-school-red text-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Beheerder Login</h2>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-school-red focus:outline-none"
                        placeholder="Wachtwoord"
                    />
                    <button onClick={handleLogin} className="w-full bg-school-dark text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition">Inloggen</button>
                    <p className="text-center text-xs text-gray-400 mt-6">Wachtwoord is 'admin' voor demo</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button onClick={() => setIsAuthenticated(false)} className="text-red-600 font-bold bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-50 transition">Uitloggen</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="space-y-3">
                        <button 
                            onClick={() => setActiveTab('news')}
                            className={`w-full text-left p-4 rounded-xl font-medium transition ${activeTab === 'news' ? 'bg-white text-school-red shadow-md border-l-4 border-school-red' : 'text-gray-600 hover:bg-white/50'}`}
                        >
                            Nieuwsberichten
                        </button>
                        <button 
                            onClick={() => setActiveTab('events')}
                            className={`w-full text-left p-4 rounded-xl font-medium transition ${activeTab === 'events' ? 'bg-white text-school-red shadow-md border-l-4 border-school-red' : 'text-gray-600 hover:bg-white/50'}`}
                        >
                            Kalender
                        </button>
                         {/* Demo info */}
                        <div className="mt-8 bg-blue-50 p-6 rounded-xl text-sm text-blue-800 border border-blue-100">
                            <p className="font-bold mb-2 flex items-center gap-2"><Info size={16}/> Info voor demo:</p>
                            <p>Wijzigingen die je hier maakt zijn direct zichtbaar op de site (maar worden gereset na refresh).</p>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {activeTab === 'news' && (
                            <>
                                {/* Add News Form */}
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold mb-6 border-b pb-4">Nieuw Bericht Toevoegen</h2>
                                    
                                    <form onSubmit={handleAddNews} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Titel / Onderwerp</label>
                                            <input 
                                                value={newsTitle}
                                                onChange={e => setNewsTitle(e.target.value)}
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-green focus:outline-none"
                                                placeholder="bv. Schoolfeest 2026"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-sm font-bold text-gray-700">Inhoud</label>
                                                <button 
                                                    type="button"
                                                    onClick={handleAIWrite}
                                                    disabled={isGenerating}
                                                    className="text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50 shadow-sm"
                                                >
                                                    <Sparkles size={14} /> {isGenerating ? 'Aan het schrijven...' : 'Schrijf met AI Assistant'}
                                                </button>
                                            </div>
                                            <textarea 
                                                value={newsContent}
                                                onChange={e => setNewsContent(e.target.value)}
                                                rows={5}
                                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-school-green focus:outline-none"
                                                placeholder="Typ je bericht of laat de AI het schrijven..."
                                            />
                                        </div>
                                        {/* Photo Simulation */}
                                        <div className="border-2 border-dashed border-gray-300 p-10 rounded-xl text-center text-gray-500 hover:bg-gray-50 cursor-pointer transition">
                                            <ImageIcon className="mx-auto mb-4 text-gray-400" size={32} />
                                            <p className="font-medium">Sleep foto hierheen of klik om te uploaden</p>
                                            <p className="text-xs mt-1">(Simulatie)</p>
                                        </div>
                                        
                                        <button type="submit" className="bg-school-green text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-md w-full md:w-auto">Publiceren</button>
                                    </form>
                                </div>

                                {/* News List */}
                                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold mb-6 border-b pb-4">Actieve Berichten</h2>
                                    <div className="space-y-4">
                                        {news.map((item: NewsItem) => (
                                            <div key={item.id} className="flex justify-between items-start p-4 border border-gray-100 rounded-lg hover:shadow-sm transition">
                                                <div className="flex gap-4">
                                                    <img src={item.imageUrl} className="w-16 h-16 rounded-md object-cover" alt="thumb"/>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800">{item.title}</h3>
                                                        <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                                            <span>Geplaatst: {new Date(item.date).toLocaleDateString()}</span>
                                                            <span className="text-orange-500">Verloopt: {new Date(item.expiryDate || '').toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteNews(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'events' && (
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-bold mb-6">Kalender Beheer</h2>
                                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-yellow-800 mb-6 text-sm">
                                    Hier kunnen activiteiten en vrije dagen beheerd worden.
                                </div>
                                <div className="space-y-2">
                                    {events.map((ev: CalendarEvent) => (
                                        <div key={ev.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                            <div>
                                                <span className="font-bold">{new Date(ev.date).toLocaleDateString()}</span>: {ev.title}
                                            </div>
                                            <button className="text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
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

// 3. APP ROOT

function App() {
  const [page, setPage] = useState<PageView>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for "Database"
  const [news, setNews] = useState<NewsItem[]>(MOCK_NEWS);
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [albums] = useState<PhotoAlbum[]>(MOCK_ALBUMS);
  const [team] = useState<Teacher[]>(MOCK_TEAM);

  // Filter expired news automatically on mount/update
  useEffect(() => {
    const now = new Date();
    const validNews = news.filter(n => !n.expiryDate || new Date(n.expiryDate) > now);
    // In a real app, we wouldn't set state here to avoid loops, but checking valid news to render.
    // We'll just use filtered news in the view.
  }, [news]);

  const activeNews = useMemo(() => {
      const now = new Date();
      return news.filter(n => !n.expiryDate || new Date(n.expiryDate) > now)
                 .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [news]);

  // Layout
  if (page === 'admin') {
      return <AdminPanel news={news} setNews={setNews} events={events} setEvents={setEvents} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      <Navbar 
        activePage={page} 
        setPage={setPage} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
      />
      
      <main className="flex-grow">
        {page === 'home' && <HomePage news={activeNews} setPage={setPage} />}
        {page === 'about' && <AboutPage />}
        {page === 'enroll' && <EnrollPage />}
        {page === 'team' && <TeamPage team={team} />}
        {page === 'news' && <NewsPage news={activeNews} />}
        {page === 'calendar' && <CalendarPage events={events} />}
        {page === 'info' && <InfoPage />}
        {page === 'gallery' && <GalleryPage albums={albums} />}
        {page === 'contact' && <ContactPage />}
        {page === 'box' && <BoxPage />}
        {page === 'parents' && <div className="p-24 text-center text-gray-500 text-xl">Pagina Ouderwerkgroep (In opbouw)</div>}
      </main>

      <Footer setPage={setPage} />
    </div>
  );
}

export default App;