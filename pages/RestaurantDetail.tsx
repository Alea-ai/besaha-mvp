
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Star, MapPin, ShieldCheck, ShieldAlert, Camera, Send, Sparkles, BarChart3 } from 'lucide-react';
import { getRestaurantById, addReview, subscribeToReviews, subscribeToAuth } from '../services/mockService';
import { Restaurant, Review, ReviewRating, User } from '../types';
import { askConcierge } from '../services/geminiService';

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper for pretty labels
const RATING_CATEGORIES: { key: keyof ReviewRating; label: string }[] = [
  { key: 'authenticity', label: 'Authenticity' },
  { key: 'hospitality', label: 'Hospitality & Service' },
  { key: 'priceFairness', label: 'Price Fairness' },
  { key: 'hygiene', label: 'Hygiene & Cleanliness' },
  { key: 'culturalVibe', label: 'Cultural Vibe' },
];

export const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | undefined>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review Form State
  const [reviewText, setReviewText] = useState('');
  const [ratings, setRatings] = useState<ReviewRating>({
    authenticity: 5, 
    hospitality: 5, 
    priceFairness: 5, 
    hygiene: 5,
    culturalVibe: 5, 
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const unsubAuth = subscribeToAuth(setUser);
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (id) {
      getRestaurantById(id).then(data => {
        setRestaurant(data);
        setLoading(false);
      });
      const unsubscribe = subscribeToReviews(id, setReviews);
      return () => unsubscribe();
    }
  }, [id]);

  const handleRatingChange = (category: keyof ReviewRating, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (!id || !restaurant || !user) return;
    setIsSubmitting(true);
    setError(null);

    // 1. Geolocation Check (Mocking the secure check on client for MVP)
    if (!navigator.geolocation) {
      setError("Geolocation is required to verify your visit.");
      setIsSubmitting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        if (!photo) throw new Error("Photo proof is required.");
        
        await addReview(
          id, 
          ratings, 
          reviewText, 
          { lat: pos.coords.latitude, lng: pos.coords.longitude },
          photo
        );
        
        setReviewText('');
        setPhoto(null);
        // Reset ratings to 5
        setRatings({ authenticity: 5, hospitality: 5, priceFairness: 5, hygiene: 5, culturalVibe: 5 });
        
        // Refresh restaurant to show new ratings immediately
        getRestaurantById(id).then(setRestaurant);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to submit review.");
      } finally {
        setIsSubmitting(false);
      }
    }, (err) => {
      setError("GPS Access Denied. Cannot verify location.");
      setIsSubmitting(false);
    });
  };

  const handleAskAi = async () => {
    if (!aiPrompt.trim() || !restaurant) return;
    setAiLoading(true);
    const answer = await askConcierge(aiPrompt, `Restaurant: ${restaurant.name}, Type: ${restaurant.category}, City: ${restaurant.city}`);
    setAiResponse(answer);
    setAiLoading(false);
  };

  if (loading || !restaurant) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-8">
        {/* Restaurant Info Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 glass-panel">
           <div className="relative h-80 w-full">
             <img src={restaurant.images[0]} alt={restaurant.name} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
             <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-4xl font-display font-bold mb-2">{restaurant.name}</h1>
                <div className="flex items-center text-slate-200 font-medium">
                    <MapPin size={18} className="mr-1 text-terracotta-400" /> {restaurant.city}
                </div>
             </div>
           </div>
           <div className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-2">
                    <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-terracotta-200 pl-6 italic">
                        {restaurant.description}
                    </p>
                </div>
                
                {/* Rating Breakdown Card */}
                <div className="bg-sand-50 rounded-2xl p-5 border border-sand-200">
                    <div className="flex items-center gap-2 mb-3 font-bold text-slate-800">
                        <BarChart3 size={18} className="text-majorelle-600" /> Community Ratings
                    </div>
                    <div className="space-y-3">
                        {restaurant.meta?.avgScores && RATING_CATEGORIES.map(({ key, label }) => {
                            const score = restaurant.meta?.avgScores?.[key] || 0;
                            return (
                              <div key={key}>
                                  <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                                      <span>{label}</span>
                                      <span>{score}/5</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                          className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full" 
                                          style={{ width: `${(score / 5) * 100}%` }}
                                      ></div>
                                  </div>
                              </div>
                            );
                        })}
                        {!restaurant.meta?.avgScores && (
                             <div className="text-xs text-slate-400 italic">No specific ratings yet.</div>
                        )}
                    </div>
                </div>
             </div>

            {/* AI Concierge Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
              <div className="relative z-10">
                  <div className="flex items-center mb-3 text-indigo-900 font-bold font-display text-lg">
                    <Sparkles size={20} className="mr-2 text-indigo-500 fill-indigo-500" /> Ask Hakim (AI Concierge)
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., 'What is special about this menu?'"
                      className="flex-grow px-4 py-3 rounded-xl border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm"
                    />
                    <button 
                      onClick={handleAskAi}
                      disabled={aiLoading}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                    >
                      {aiLoading ? <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span> : <Send size={18}/>}
                    </button>
                  </div>
                  {aiResponse && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-100 text-slate-700 text-sm shadow-sm">
                      "{aiResponse}"
                    </div>
                  )}
              </div>
            </div>
           </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 glass-panel">
          <h2 className="text-2xl font-display font-bold text-slate-800 mb-8">Verified Reviews</h2>

          {/* Add Review Form */}
          {user ? (
            <div className="mb-10 p-6 bg-sand-50 rounded-2xl border border-terracotta-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="text-green-600" size={20} /> 
                Verify your visit & Rate
              </h3>
              
              {/* Rating Categories Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6 bg-white p-4 rounded-xl border border-gray-200">
                {RATING_CATEGORIES.map(({ key, label }) => (
                  <div key={key} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{label}</span>
                        <span className="text-xs font-bold text-gold-500">{ratings[key]}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(star => (
                        <button 
                          key={star} 
                          onClick={() => handleRatingChange(key, star)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                          type="button"
                        >
                           <Star 
                             size={20} 
                             className={`${star <= ratings[key] ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-100'} transition-colors`} 
                           />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-majorelle-500 text-sm shadow-inner"
                rows={3}
                placeholder="Share your detailed experience... (What made it authentic? How was the service?)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 justify-between">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition w-full sm:w-auto justify-center shadow-sm hover:shadow">
                  <Camera size={18} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-600">{photo ? "Photo Attached" : "Add Photo Proof (Required)"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                </label>
                {photo && <span className="text-xs text-green-600 font-bold truncate max-w-[150px]">{photo.name}</span>}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !photo}
                  className="bg-majorelle-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-majorelle-700 w-full sm:w-auto flex items-center justify-center disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  {isSubmitting ? "Verifying..." : "Post Verified Review"}
                </button>
              </div>
              {error && <p className="mt-3 text-red-500 text-sm font-bold text-center">{error}</p>}
            </div>
          ) : (
             <div className="text-center p-6 bg-gray-50 rounded-xl mb-8">
               <Link to="/login" className="text-majorelle-600 font-bold">Login to post a verified review</Link>
             </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white border-b border-gray-100 pb-6 animate-fade-in">
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-terracotta-100 flex items-center justify-center font-bold text-terracotta-700 border border-terracotta-200">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{review.userName}</div>
                        <div className="text-xs text-gray-400">{new Date(review.timestamp).toLocaleDateString()}</div>
                      </div>
                   </div>
                   {review.verified ? (
                     <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full flex items-center border border-green-100 font-bold uppercase tracking-wider shadow-sm">
                       <ShieldCheck size={12} className="mr-1" /> Verified Visit
                     </span>
                   ) : (
                     <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-full flex items-center border border-gray-200 font-bold uppercase tracking-wider">
                       <ShieldAlert size={12} className="mr-1" /> Verification Failed
                     </span>
                   )}
                </div>
                
                <div className="ml-13 pl-12">
                   {/* Category Scores Small Display */}
                   {review.ratings && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {RATING_CATEGORIES.map(({ key, label }) => (
                            <div key={key} className="text-[10px] bg-sand-50 px-2 py-0.5 rounded border border-sand-200 text-slate-600">
                                <span className="font-bold">{label}:</span> {review.ratings[key]}/5
                            </div>
                        ))}
                    </div>
                   )}

                   <p className="text-slate-600 text-sm leading-relaxed mb-3">{review.text}</p>
                   {review.mediaUrls && review.mediaUrls.length > 0 && (
                     <div className="flex gap-2 overflow-x-auto pb-2">
                       {review.mediaUrls.map((url, idx) => (
                         <img key={idx} src={url} alt="Review evidence" className="h-20 w-20 object-cover rounded-lg border border-gray-100 shadow-sm hover:scale-105 transition-transform" />
                       ))}
                     </div>
                   )}
                   {!review.verified && review.verificationReason && (
                        <div className="text-[10px] text-red-400 italic mt-2">
                            Verification Failed: {review.verificationReason}
                        </div>
                   )}
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center text-slate-400 py-10">No reviews yet. Be the first to verify this gem!</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Map */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-2 rounded-3xl shadow-xl h-96 z-0 border border-white/50">
           <div className="h-full w-full rounded-2xl overflow-hidden relative">
               <MapContainer 
                 center={[restaurant.coordinates.lat, restaurant.coordinates.lng]} 
                 zoom={15} 
                 scrollWheelZoom={false}
                 style={{ height: '100%', width: '100%' }}
               >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[restaurant.coordinates.lat, restaurant.coordinates.lng]} icon={icon}>
                  <Popup>{restaurant.name}</Popup>
                </Marker>
               </MapContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
