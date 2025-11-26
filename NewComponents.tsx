import React, { useState, useEffect } from 'react';
import { Camera, Users, Heart, Calendar } from 'lucide-react';
import { PhotoAlbum } from './types';

// Hero Carousel Component - Auto-rotating images
export const HeroCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

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

// Ouderwerkgroep Page Component
export const ParentsPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-display font-bold text-school-dark mb-6">
          Ouderwerkgroep
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Samen maken we onze school nog mooier! De ouderwerkgroep speelt een belangrijke rol in het schoolleven.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Left Column - What we do */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-school-green/10 p-3 rounded-full">
              <Users className="text-school-green" size={32} />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900">
              Wat doen we?
            </h2>
          </div>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={20} />
              <span>Organiseren van schoolfeesten en evenementen</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={20} />
              <span>Hulp bij uitstappen en activiteiten</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={20} />
              <span>Onderhoud en verfraaiing van de speelplaats</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={20} />
              <span>Kerstmarkt en andere fondsenwerving</span>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="text-school-red flex-shrink-0 mt-1" size={20} />
              <span>Ondersteuning bij grote schoolprojecten</span>
            </li>
          </ul>
        </div>

        {/* Right Column - Join us */}
        <div className="bg-gradient-to-br from-school-orange to-school-red p-8 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-full">
              <Calendar className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-display font-bold">
              Doe mee!
            </h2>
          </div>
          <p className="text-lg mb-6 text-white/90">
            Elke hulp is welkom! Of je nu veel of weinig tijd hebt, er is altijd een manier om bij te dragen aan onze schoolgemeenschap.
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl mb-6">
            <h3 className="font-bold text-xl mb-3">Vergaderingen</h3>
            <p className="text-white/90">
              We komen ongeveer 4 keer per jaar samen om activiteiten te plannen en ideeën uit te wisselen.
            </p>
          </div>
          <a
            href="mailto:info@vrijebasisschoolsijsele.be?subject=Interesse Ouderwerkgroep"
            className="inline-block bg-white text-school-red font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition shadow-lg w-full text-center"
          >
            Contacteer ons
          </a>
        </div>
      </div>

      {/* Bottom Section - Impact */}
      <div className="bg-school-green/5 p-8 md:p-12 rounded-2xl border-2 border-school-green/20">
        <h2 className="text-3xl font-display font-bold text-center mb-6 text-gray-900">
          Samen sterk voor onze kinderen
        </h2>
        <p className="text-center text-gray-700 text-lg max-w-3xl mx-auto">
          Door samen te werken creëren we een warme, levendige schoolomgeving waar onze kinderen
          kunnen groeien en floreren. Elk handje helpt om onze school nog beter te maken!
        </p>
      </div>
    </div>
  );
};

// Gallery Page Component
export const GalleryPage = ({ albums }: { albums: PhotoAlbum[] }) => {
  // Group albums by location
  const groupedAlbums = albums.reduce((acc, album) => {
    if (!acc[album.location]) {
      acc[album.location] = [];
    }
    acc[album.location].push(album);
    return acc;
  }, {} as Record<string, PhotoAlbum[]>);

  const locationOrder: Array<PhotoAlbum['location']> = [
    'Kleuter Klooster',
    'Lager',
    'Verrekijker',
    'Algemeen'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 animate-fade-in">
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="bg-school-orange/10 p-4 rounded-full">
            <Camera className="text-school-orange" size={48} />
          </div>
        </div>
        <h1 className="text-5xl font-display font-bold text-school-dark mb-6">
          Fotogalerij
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Beleef mee met de mooie momenten op onze school
        </p>
      </div>

      {locationOrder.map((location) => {
        const locationAlbums = groupedAlbums[location];
        if (!locationAlbums || locationAlbums.length === 0) return null;

        return (
          <div key={location} className="mb-16">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-school-green rounded-full"></span>
              {location}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {locationAlbums.map((album) => (
                <div
                  key={album.id}
                  className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Camera size={18} />
                        <span>{album.images.length} foto's</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-b from-white to-gray-50">
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-school-green transition-colors mb-2">
                      {album.title}
                    </h3>
                    <p className="text-sm text-gray-500">{location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {Object.keys(groupedAlbums).length === 0 && (
        <div className="text-center py-20">
          <Camera className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-500 text-lg">Nog geen foto's beschikbaar</p>
        </div>
      )}
    </div>
  );
};
