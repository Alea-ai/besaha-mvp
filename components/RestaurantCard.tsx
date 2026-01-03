
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Restaurant } from '../types';

interface Props {
  data: Restaurant;
}

export const RestaurantCard: React.FC<Props> = ({ data }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % data.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + data.images.length) % data.images.length);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800'; // Robust fallback
  };

  return (
    <Link to={`/restaurant/${data.id}`} className="group block bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100 h-full flex flex-col">
      {/* Image Carousel Container */}
      <div className="relative h-56 w-full overflow-hidden group/image">
        <img
          src={data.images[currentImageIndex] || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800'}
          alt={data.name}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none"></div>
        
        {/* Carousel Controls (Only show if > 1 image) */}
        {data.images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity backdrop-blur-sm z-10"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity backdrop-blur-sm z-10"
            >
              <ChevronRight size={18} />
            </button>
            
            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {data.images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 w-1.5 rounded-full transition-all shadow-sm ${idx === currentImageIndex ? 'bg-white scale-110' : 'bg-white/40'}`} 
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 left-3 flex gap-2 z-10 pointer-events-none">
             <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm border border-white/20">
                {data.category}
             </span>
        </div>
        
        <div className="absolute bottom-3 left-3 text-white z-10 pointer-events-none">
             <span className="bg-terracotta-600 px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                {data.priceRange}
             </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-display font-bold text-slate-800 group-hover:text-majorelle-700 transition-colors leading-tight">
            {data.name}
          </h3>
          <div className="flex items-center bg-sand-50 px-2 py-1 rounded-lg border border-sand-200">
            <Star size={14} className="text-gold-500 fill-gold-500" />
            <span className="ml-1 font-bold text-slate-700 text-sm">{data.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-slate-500 text-sm mb-4">
          <MapPin size={14} className="mr-1 text-terracotta-500" />
          {data.city}
        </div>
        
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-grow">
            {data.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
            <span className="text-slate-400 italic">{data.reviews} verified reviews</span>
            <span className="text-majorelle-600 font-bold flex items-center group-hover:translate-x-1 transition-transform">
                View details <ArrowRight size={14} className="ml-1"/>
            </span>
        </div>
      </div>
    </Link>
  );
};
