
import React, { useEffect, useState } from 'react';
import { getRestaurants, subscribeToAuth } from '../services/mockService';
import { Restaurant, User } from '../types';
import { RestaurantCard } from '../components/RestaurantCard';
import { Search, Filter, UtensilsCrossed } from 'lucide-react';

export const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filtered, setFiltered] = useState<Restaurant[]>([]);
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    // 1. Subscribe to Auth
    const unsub = subscribeToAuth(setUser);

    // 2. Set Time-based Greeting (Moroccan style)
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Sabah el kher"); // Good Morning
    else if (hour < 18) setGreeting("Salam Alaykum"); // Good Afternoon
    else setGreeting("Masa el kher"); // Good Evening

    // 3. Fetch Restaurants
    getRestaurants().then(data => {
      const displayData = data.map(r => ({
        ...r,
        reviews: r.meta?.reviewsCount || 0,
        rating: r.meta?.avgScores 
          ? (Object.values(r.meta.avgScores).reduce((a, b) => a + b, 0) / 5).toFixed(1)
          : "New"
      }));
      // @ts-ignore
      setRestaurants(displayData);
      // @ts-ignore
      setFiltered(displayData);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (cityFilter === 'All') {
      setFiltered(restaurants);
    } else {
      setFiltered(restaurants.filter(r => r.city === cityFilter));
    }
  }, [cityFilter, restaurants]);

  return (
    <div className="pb-20">
      {/* Vibrant Hero Section */}
      <div className="bg-majorelle-900 text-white relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-terracotta-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-majorelle-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 text-center">
          
          {/* Dynamic Welcome Message */}
          {user ? (
            <div className="mb-8 animate-slide-up">
               <h2 className="text-2xl md:text-4xl font-display font-bold text-terracotta-200 mb-2">
                 {greeting}, {user.name}
               </h2>
               <p className="text-majorelle-200 text-sm md:text-base font-light uppercase tracking-widest">Ready for your next culinary adventure?</p>
            </div>
          ) : (
            <div className="inline-flex items-center justify-center p-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-fade-in border border-white/10">
               <UtensilsCrossed size={16} className="mr-2 text-terracotta-400" />
               <span className="text-xs font-bold tracking-widest uppercase text-terracotta-100">Authentic Dining Guide</span>
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight animate-slide-up">
            Taste the Soul <br /> of <span className="text-terracotta-400">Morocco</span>
          </h1>
          <p className="text-xl text-majorelle-100 max-w-2xl mx-auto mb-10 font-light animate-slide-up leading-relaxed">
            From hidden medina riads to bustling street food corners. 
            Discover authentic culinary gems verified by locals and travelers nearby.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Filter Bar */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between glass-panel">
            <div className="flex items-center gap-3 w-full md:w-auto bg-sand-50 px-4 py-2 rounded-lg border border-sand-200 focus-within:border-majorelle-500 transition-colors">
               <Filter size={18} className="text-terracotta-600" />
               <span className="font-bold text-slate-700 text-sm whitespace-nowrap">City:</span>
               <select
                 value={cityFilter}
                 onChange={(e) => setCityFilter(e.target.value)}
                 className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer w-full py-1"
               >
                 <option value="All">All Locations</option>
                 <option value="Casablanca">Casablanca</option>
                 <option value="Marrakech">Marrakech</option>
                 <option value="Fes">Fes</option>
               </select>
            </div>

            <div className="relative w-full md:w-96">
              <Search size={20} className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for tagines, riads..."
                className="w-full pl-12 pr-6 py-3 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-majorelle-500 focus:border-transparent shadow-inner transition-all"
                onChange={(e) => {
                   const term = e.target.value.toLowerCase();
                   setFiltered(restaurants.filter(r =>
                     (cityFilter === 'All' || r.city === cityFilter) &&
                     r.name.toLowerCase().includes(term)
                   ));
                }}
              />
            </div>
        </div>

        {/* Grid */}
        <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-slate-800">Curated Selections</h2>
                <span className="text-sm text-slate-500 font-medium">{filtered.length} places found</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sand-200 border-t-majorelle-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(restaurant => (
                  <RestaurantCard key={restaurant.id} data={restaurant} />
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
