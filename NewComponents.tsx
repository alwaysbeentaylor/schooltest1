import React, { useState, useEffect, useRef } from 'react';
import { Camera, Users, Heart, Calendar, X, ChevronLeft, ChevronRight, ZoomIn, Play, Pause, ChevronDown, Filter } from 'lucide-react';
import { PhotoAlbum, OuderwerkgroepActivity } from './types';

// Hero Carousel Component - Auto-rotating images
export const HeroCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full h-full">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Hero ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-3 bg-white'
                : 'w-3 h-3 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ga naar foto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Lightbox Component - Full screen image viewer with navigation
const Lightbox = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev
}: {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) onNext();
    if (isRightSwipe) onPrev();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <X size={28} />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-white/80 font-medium px-4 py-2 bg-white/10 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous button */}
      <button
        onClick={onPrev}
        className="absolute left-2 md:left-4 z-50 text-white/80 hover:text-white p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <ChevronLeft size={32} />
      </button>

      {/* Main image */}
      <div className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center">
        <img
          src={images[currentIndex]}
          alt={`Foto ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-fade-in"
        />
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="absolute right-2 md:right-4 z-50 text-white/80 hover:text-white p-2 md:p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
      >
        <ChevronRight size={32} />
      </button>

      {/* Thumbnail strip */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 bg-white/10 rounded-xl backdrop-blur">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => {
              // Navigate to specific image
              const diff = idx - currentIndex;
              if (diff > 0) for (let i = 0; i < diff; i++) onNext();
              if (diff < 0) for (let i = 0; i < -diff; i++) onPrev();
            }}
            className={`flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden transition-all duration-200 ${
              idx === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-50 hover:opacity-100'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

// Interactive Image Grid with hover effects
const ImageGrid = ({ images, onImageClick }: { images: string[]; onImageClick: (index: number) => void }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onImageClick(index)}
          className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-school-green"
        >
          <img
            src={image}
            alt={`Foto ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-white">
              <span className="text-sm font-medium">Foto {index + 1}</span>
              <ZoomIn size={20} />
            </div>
          </div>
          {/* Playful corner accent on hover */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-school-green border-l-[40px] border-l-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      ))}
    </div>
  );
};

// Album Detail View with carousel and all images
const AlbumDetail = ({ 
  album, 
  onClose 
}: { 
  album: PhotoAlbum; 
  onClose: () => void;
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlay && album.images.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % album.images.length);
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlay, album.images.length]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    setIsAutoPlay(false);
  };

  const nextImage = () => setCurrentImageIndex(prev => (prev + 1) % album.images.length);
  const prevImage = () => setCurrentImageIndex(prev => (prev - 1 + album.images.length) % album.images.length);

  return (
    <div className="fixed inset-0 bg-white z-40 overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-4 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-gray-600 hover:text-school-green transition mb-2"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Terug naar albums</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{album.title}</h1>
            <p className="text-gray-500">{album.location} • {album.images.length} foto's</p>
          </div>
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
              isAutoPlay 
                ? 'bg-school-green text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isAutoPlay ? <Pause size={18} /> : <Play size={18} />}
            <span className="hidden md:inline">{isAutoPlay ? 'Pauzeer' : 'Diashow'}</span>
          </button>
        </div>
      </div>

      {/* Featured Image Carousel */}
      <div className="relative h-[40vh] md:h-[50vh] bg-gray-900 mb-8">
        {album.images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={image}
              alt={`${album.title} - Foto ${index + 1}`}
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={() => openLightbox(index)}
            />
          </div>
        ))}

        {/* Carousel Navigation */}
        {album.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition"
            >
              <ChevronRight size={24} />
            </button>

            {/* Progress dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {album.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentImageIndex
                      ? 'w-8 h-2 bg-white'
                      : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* All Photos Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Camera className="text-school-green" size={24} />
          Alle foto's
        </h2>
        <ImageGrid images={album.images} onImageClick={openLightbox} />
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={album.images}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </div>
  );
};

// Activity Photo Carousel - Shows small carousel for each activity
const ActivityPhotoCarousel = ({ images, title }: { images: string[]; title: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  if (!images || images.length === 0) {
    return (
      <div className="relative h-40 md:h-48 bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
        <Camera size={40} className="text-red-300" />
      </div>
    );
  }

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative h-40 md:h-48 overflow-hidden group">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${title} - ${idx + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            idx === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
};

// Ouderwerkgroep Page Component - Now accepts activities from props
export const ParentsPage = ({ activities }: { activities?: OuderwerkgroepActivity[] }) => {
  // Default activities if none provided
  const defaultActivities: OuderwerkgroepActivity[] = [
    {
      id: '1',
      title: 'Pannenkoekendag',
      description: 'Heerlijke pannenkoeken bakken voor alle kinderen. Een jaarlijkse traditie waar iedereen van geniet!',
      images: ['/images/gallery/bibliotheek-1.jpeg']
    },
    {
      id: '2',
      title: 'Koekjesverkoop',
      description: 'Zelfgebakken koekjes verkopen om geld in te zamelen voor nieuwe speeltoestellen.',
      images: ['/images/gallery/bibliotheek-3.jpeg']
    },
    {
      id: '3',
      title: 'Kerstmarkt',
      description: 'Gezellige kerstmarkt met kraampjes, warme chocomelk en leuke activiteiten voor het hele gezin.',
      images: ['/images/gallery/bibliotheek-5.jpeg']
    },
  ];

  const displayActivities = activities && activities.length > 0 ? activities : defaultActivities;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-16 animate-fade-in">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-school-dark mb-4 md:mb-6">
          Ouderwerkgroep
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Samen maken we onze school nog mooier! De ouderwerkgroep speelt een belangrijke rol in het schoolleven.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-16">
        {/* Left Column - What we do */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-school-green/10 p-3 rounded-full">
              <Users className="text-school-green" size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900">
              Wat doen we?
            </h2>
          </div>
          <ul className="space-y-3 md:space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={18} />
              <span>Organiseren van schoolfeesten en evenementen</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={18} />
              <span>Hulp bij uitstappen en activiteiten</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={18} />
              <span>Onderhoud en verfraaiing van de speelplaats</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={18} />
              <span>Kerstmarkt en andere fondsenwerving</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={18} />
              <span>Ondersteuning bij grote schoolprojecten</span>
            </li>
          </ul>
        </div>

        {/* Right Column - Join us */}
        <div className="bg-gradient-to-br from-school-green to-emerald-600 p-6 md:p-8 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-full">
              <Calendar className="text-white" size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              Doe mee!
            </h2>
          </div>
          <p className="text-base md:text-lg mb-6 text-white/90">
            Elke hulp is welkom! Of je nu veel of weinig tijd hebt, er is altijd een manier om bij te dragen aan onze schoolgemeenschap.
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-4 md:p-6 rounded-xl mb-6">
            <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3">Vergaderingen</h3>
            <p className="text-white/90 text-sm md:text-base">
              We komen ongeveer 4 keer per jaar samen om activiteiten te plannen en ideeën uit te wisselen.
            </p>
          </div>
          <a
            href="mailto:info@vrijebasisschoolsijsele.be?subject=Interesse Ouderwerkgroep"
            className="inline-block bg-white text-school-green font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl hover:bg-gray-100 transition shadow-lg w-full text-center"
          >
            Contacteer ons
          </a>
        </div>
      </div>

      {/* Foto's van activiteiten */}
      <div className="mb-8 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
          <Camera className="text-school-green" size={28} />
          Onze Activiteiten
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {displayActivities.map((activity) => (
            <div
              key={activity.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <ActivityPhotoCarousel images={activity.images} title={activity.title} />
              <div className="p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 group-hover:text-school-green transition-colors">
                  {activity.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section - Impact */}
      <div className="bg-school-green/5 p-6 md:p-12 rounded-2xl border-2 border-school-green/20">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-4 md:mb-6 text-gray-900">
          Samen sterk voor onze kinderen
        </h2>
        <p className="text-center text-gray-700 text-base md:text-lg max-w-3xl mx-auto">
          Door samen te werken creëren we een warme, levendige schoolomgeving waar onze kinderen
          kunnen groeien en floreren. Elk handje helpt om onze school nog beter te maken!
        </p>
      </div>
    </div>
  );
};

// Gallery Page Component - Interactive with Album Detail View and Dropdown Navigation
export const GalleryPage = ({ albums }: { albums: PhotoAlbum[] }) => {
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isAlbumDropdownOpen, setIsAlbumDropdownOpen] = useState(false);

  // Filter albums die nog niet verlopen zijn
  const activeAlbums = albums.filter(album => {
    if (!album.expiryDate) return true;
    return new Date(album.expiryDate) > new Date();
  });

  // Group albums by location
  const groupedAlbums = activeAlbums.reduce((acc, album) => {
    if (!acc[album.location]) {
      acc[album.location] = [];
    }
    acc[album.location].push(album);
    return acc;
  }, {} as Record<string, PhotoAlbum[]>);

  const locationOrder: Array<PhotoAlbum['location']> = [
    'Kleuter Klooster',
    'Lager',
    'Algemeen',
    'Verrekijker'
  ];

  // Get available locations with albums
  const availableLocations = locationOrder.filter(loc => groupedAlbums[loc]?.length > 0);

  // Filter albums based on selected location
  const filteredAlbums = selectedLocation === 'all' 
    ? activeAlbums 
    : activeAlbums.filter(album => album.location === selectedLocation);

  // Get albums for the album dropdown
  const albumsForDropdown = selectedLocation === 'all' 
    ? activeAlbums 
    : groupedAlbums[selectedLocation] || [];

  // Handle album selection from dropdown
  const handleAlbumSelect = (albumId: string) => {
    const album = activeAlbums.find(a => a.id === albumId);
    if (album) {
      setSelectedAlbum(album);
    }
    setSelectedAlbumId(albumId);
    setIsAlbumDropdownOpen(false);
  };

  // Handle location change
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setSelectedAlbumId('');
    setIsLocationDropdownOpen(false);
  };

  // Show album detail view if album is selected
  if (selectedAlbum) {
    return <AlbumDetail album={selectedAlbum} onClose={() => setSelectedAlbum(null)} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 animate-fade-in">
      <div className="text-center mb-8 md:mb-12">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="bg-school-green/10 p-4 rounded-full">
            <Camera className="text-school-green" size={40} />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold text-school-dark mb-4 md:mb-6">
          Fotogalerij
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Beleef mee met de mooie momenten op onze school
        </p>
      </div>

      {/* Dropdown Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 mb-8 md:mb-12">
        <div className="flex items-center gap-2 mb-4 text-gray-600">
          <Filter size={20} />
          <span className="font-medium">Snelle Navigatie</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          {/* Location Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setIsLocationDropdownOpen(!isLocationDropdownOpen);
                setIsAlbumDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-school-green focus:border-school-green focus:outline-none transition"
            >
              <span className="font-medium text-gray-700">
                {selectedLocation === 'all' ? '📍 Alle Locaties' : `📍 ${selectedLocation}`}
              </span>
              <ChevronDown size={20} className={`text-gray-400 transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isLocationDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-fade-in">
                <button
                  onClick={() => handleLocationChange('all')}
                  className={`w-full text-left px-4 py-3 hover:bg-school-green/10 transition ${selectedLocation === 'all' ? 'bg-school-green/10 text-school-green font-bold' : 'text-gray-700'}`}
                >
                  📍 Alle Locaties ({activeAlbums.length} albums)
                </button>
                {availableLocations.map(location => (
                  <button
                    key={location}
                    onClick={() => handleLocationChange(location)}
                    className={`w-full text-left px-4 py-3 hover:bg-school-green/10 transition ${selectedLocation === location ? 'bg-school-green/10 text-school-green font-bold' : 'text-gray-700'}`}
                  >
                    📍 {location} ({groupedAlbums[location]?.length || 0} albums)
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Album Dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setIsAlbumDropdownOpen(!isAlbumDropdownOpen);
                setIsLocationDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl hover:border-school-green focus:border-school-green focus:outline-none transition"
            >
              <span className="font-medium text-gray-700 truncate">
                {selectedAlbumId ? albumsForDropdown.find(a => a.id === selectedAlbumId)?.title || '📸 Kies een album' : '📸 Ga direct naar album'}
              </span>
              <ChevronDown size={20} className={`text-gray-400 transition-transform flex-shrink-0 ${isAlbumDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isAlbumDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden max-h-64 overflow-y-auto animate-fade-in">
                {albumsForDropdown.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">Geen albums gevonden</div>
                ) : (
                  albumsForDropdown.map(album => (
                    <button
                      key={album.id}
                      onClick={() => handleAlbumSelect(album.id)}
                      className="w-full text-left px-4 py-3 hover:bg-school-green/10 transition flex items-center gap-3"
                    >
                      <img src={album.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{album.title}</p>
                        <p className="text-xs text-gray-500">{album.location} • {album.images.length} foto's</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Albums Grid - filtered by location */}
      {selectedLocation === 'all' ? (
        // Show grouped by location
        locationOrder.map((location) => {
          const locationAlbums = groupedAlbums[location];
          if (!locationAlbums || locationAlbums.length === 0) return null;

          return (
            <div key={location} className="mb-8 md:mb-16" id={`location-${location.replace(/\s/g, '-')}`}>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
                <span className="w-2 h-6 md:h-8 bg-school-green rounded-full"></span>
                {location}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {locationAlbums.map((album) => (
                  <AlbumCard key={album.id} album={album} onClick={() => setSelectedAlbum(album)} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        // Show only selected location
        <div className="mb-8 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-6 md:mb-8 flex items-center gap-3">
            <span className="w-2 h-6 md:h-8 bg-school-green rounded-full"></span>
            {selectedLocation}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {filteredAlbums.map((album) => (
              <AlbumCard key={album.id} album={album} onClick={() => setSelectedAlbum(album)} />
            ))}
          </div>
        </div>
      )}

      {Object.keys(groupedAlbums).length === 0 && (
        <div className="text-center py-12 md:py-20">
          <Camera className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg">Nog geen foto's beschikbaar</p>
        </div>
      )}
    </div>
  );
};

// Album Card Component - Reusable
const AlbumCard = ({ album, onClick }: { album: PhotoAlbum; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="group text-left bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-school-green"
  >
    <div className="relative h-48 md:h-64 overflow-hidden">
      <img
        src={album.coverImage}
        alt={album.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Camera size={18} />
            <span>{album.images.length} foto's</span>
          </div>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Bekijken</span>
        </div>
      </div>
      <div className="absolute top-3 right-3 bg-school-green text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
        {album.images.length} 📸
      </div>
    </div>
    <div className="p-4 md:p-6 bg-gradient-to-b from-white to-gray-50">
      <h3 className="font-bold text-lg md:text-xl text-gray-900 group-hover:text-school-green transition-colors mb-1 md:mb-2">
        {album.title}
      </h3>
      <p className="text-sm text-gray-500">{album.location}</p>
    </div>
  </button>
);
