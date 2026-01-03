
import { Coordinates, Restaurant, Review, User, ChatMessage, ReviewRating, MessageType } from '../types';
import { MOCK_RESTAURANTS } from '../constants';

// --- Utilities ---

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// --- Init Data ---
const STORAGE_KEY_RESTAURANTS = 'besaha_restaurants_v2'; 
const STORAGE_KEY_USERS = 'besaha_user';
const STORAGE_KEY_REVIEWS = 'besaha_reviews';
const STORAGE_KEY_CHAT = 'besaha_chat_v2'; 

const initData = () => {
    // Always refresh restaurants on load to ensure latest data structure
    localStorage.setItem(STORAGE_KEY_RESTAURANTS, JSON.stringify(MOCK_RESTAURANTS));

    if (!localStorage.getItem(STORAGE_KEY_CHAT)) {
        const mockMessages: ChatMessage[] = [
            {
                id: 'm1', userId: 'u1', userName: 'Karim', text: 'Welcome to the community! Ask us anything about Morocco.', type: 'text', timestamp: Date.now() - 100000, channel: 'general', badges: { local: true, traveler: false, communityTrusted: true }
            },
            {
                id: 'm2', userId: 'u2', userName: 'Sarah', text: 'Avoid the "tanneries guide" scams in Fes. Just walk in yourself!', type: 'warning', timestamp: Date.now() - 50000, channel: 'safety', badges: { local: false, traveler: true, communityTrusted: false }
            },
            {
                id: 'm3', userId: 'u3', userName: 'Amine', text: 'Best time to visit Majorelle Garden is 8 AM sharp to avoid crowds.', type: 'tip', timestamp: Date.now() - 20000, channel: 'gems', badges: { local: true, traveler: false, communityTrusted: true }
            }
        ];
        localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(mockMessages));
    }
}
initData();

// --- Auth Service ---

let currentUser: User | null = JSON.parse(localStorage.getItem(STORAGE_KEY_USERS) || 'null');
let authSubscribers: ((user: User | null) => void)[] = [];

const notifyAuth = () => {
    authSubscribers.forEach(cb => cb(currentUser));
}

export const subscribeToAuth = (callback: (user: User | null) => void) => {
    authSubscribers.push(callback);
    callback(currentUser);
    return () => {
        authSubscribers = authSubscribers.filter(cb => cb !== callback);
    };
};

export const login = async (email: string): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${email}&background=1d4ed8&color=fff&bold=true`,
        contributionsCount: 5,
        badges: { local: false, traveler: true, communityTrusted: false }
      };
      currentUser = user;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(user));
      notifyAuth();
      resolve(user);
    }, 600); 
  });
};

export const register = async (email: string, name: string, isLocal: boolean): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const user: User = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                name: name,
                email: email,
                avatar: `https://ui-avatars.com/api/?name=${name}&background=1d4ed8&color=fff&bold=true`,
                contributionsCount: 0,
                badges: { local: isLocal, traveler: !isLocal, communityTrusted: false }
            };
            currentUser = user;
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(user));
            notifyAuth();
            resolve(user);
        }, 600);
    });
}

export const updateProfile = async (name: string, avatarFile?: File): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!currentUser) throw new Error("No user logged in");
            
            // Simulate upload by creating a local URL
            // In a real app, this would be an upload to Firebase Storage
            const newAvatarUrl = avatarFile ? URL.createObjectURL(avatarFile) : currentUser.avatar;

            const updatedUser = {
                ...currentUser,
                name: name,
                avatar: newAvatarUrl
            };

            currentUser = updatedUser;
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUser));
            notifyAuth();
            resolve(updatedUser);
        }, 800);
    });
};

export const logout = async (): Promise<void> => {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEY_USERS);
  notifyAuth();
};

// --- Database Service ---

export const getRestaurants = async (): Promise<Restaurant[]> => {
  return new Promise((resolve) => {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY_RESTAURANTS) || '[]');
      setTimeout(() => resolve(data), 300);
  });
};

export const getRestaurantById = async (id: string): Promise<Restaurant | undefined> => {
    return new Promise((resolve) => {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY_RESTAURANTS) || '[]') as Restaurant[];
        const r = data.find(item => item.id === id);
        setTimeout(() => resolve(r), 200);
    });
};

export const addReview = async (
    restaurantId: string, 
    ratings: ReviewRating, 
    text: string, 
    userCoords: Coordinates,
    mediaFile?: File 
): Promise<Review> => {
  
  if (!currentUser) throw new Error("Must be logged in");

  const restaurants = JSON.parse(localStorage.getItem(STORAGE_KEY_RESTAURANTS) || '[]') as Restaurant[];
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  // 1. GPS Check
  const distance = calculateDistance(
    userCoords.lat, userCoords.lng,
    restaurant.coordinates.lat, restaurant.coordinates.lng
  );
  
  // 2. Verification Logic
  const isVerified = distance <= 200; 
  
  // 3. Simulate Image Upload
  const fakeImageUrl = mediaFile 
    ? URL.createObjectURL(mediaFile) 
    : 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=200'; 

  const newReview: Review = {
    id: Date.now().toString(),
    restaurantId,
    userId: currentUser.id,
    userName: currentUser.name,
    ratings,
    text,
    mediaUrls: [fakeImageUrl],
    timestamp: Date.now(),
    verified: isVerified,
    verificationReason: isVerified ? 'Verified by GPS' : `Too far (${Math.round(distance)}m)`,
    helpfulCount: 0
  };

  // Save Review
  const allReviews = JSON.parse(localStorage.getItem(STORAGE_KEY_REVIEWS) || '[]');
  localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify([newReview, ...allReviews]));
  
  // Update Restaurant Meta (Mock)
  if (restaurant.meta) {
      const prevCount = restaurant.meta.reviewsCount;
      const newCount = prevCount + 1;
      restaurant.meta.reviewsCount = newCount;

      // Update weighted averages for each category
      const categories: (keyof ReviewRating)[] = ['authenticity', 'hospitality', 'priceFairness', 'hygiene', 'culturalVibe'];
      
      categories.forEach(cat => {
          if (restaurant.meta && restaurant.meta.avgScores) {
              const prevScore = restaurant.meta.avgScores[cat] || 0;
              const newScore = ratings[cat];
              // (OldAvg * OldCount + NewScore) / NewCount
              restaurant.meta.avgScores[cat] = Number(((prevScore * prevCount + newScore) / newCount).toFixed(1));
          }
      });
  }
  localStorage.setItem(STORAGE_KEY_RESTAURANTS, JSON.stringify(restaurants));

  return new Promise(resolve => setTimeout(() => resolve(newReview), 800));
};

export const subscribeToReviews = (restaurantId: string, callback: (reviews: Review[]) => void) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_REVIEWS) || '[]') as Review[];
    const filtered = all.filter(r => r.restaurantId === restaurantId).sort((a,b) => b.timestamp - a.timestamp);
    callback(filtered);
    
    const interval = setInterval(() => {
        const currentAll = JSON.parse(localStorage.getItem(STORAGE_KEY_REVIEWS) || '[]') as Review[];
        const currentFiltered = currentAll.filter(r => r.restaurantId === restaurantId).sort((a,b) => b.timestamp - a.timestamp);
        callback(currentFiltered);
    }, 2000);

    return () => clearInterval(interval);
};

export const subscribeToChat = (channel: string, callback: (msgs: ChatMessage[]) => void) => {
    let lastDataStr = '';

    const loadMsgs = () => {
        const all = JSON.parse(localStorage.getItem(STORAGE_KEY_CHAT) || '[]') as ChatMessage[];
        const filtered = all.filter(m => m.channel === channel).sort((a,b) => a.timestamp - b.timestamp);
        
        const currentDataStr = JSON.stringify(filtered);
        if (currentDataStr !== lastDataStr) {
            lastDataStr = currentDataStr;
            callback(filtered);
        }
    };
    
    loadMsgs();

    const interval = setInterval(() => {
        loadMsgs();
    }, 1000);

    return () => clearInterval(interval);
};

export const sendMessage = async (channel: string, text: string, type: MessageType = 'text') => {
    if (!currentUser) return;
    const msg: ChatMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        text,
        type,
        timestamp: Date.now(),
        channel,
        badges: currentUser.badges
    };
    
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY_CHAT) || '[]');
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify([...all, msg]));
};
