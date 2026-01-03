
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserBadges {
  local: boolean;
  traveler: boolean;
  communityTrusted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  contributionsCount: number;
  badges: UserBadges;
}

export interface ReviewRating {
  authenticity: number;
  hospitality: number;
  priceFairness: number; // Renamed from value
  hygiene: number;       // Renamed from cleanliness
  culturalVibe: number;
}

export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string;
  ratings: ReviewRating;
  text: string;
  mediaUrls?: string[];
  timestamp: number;
  verified: boolean;
  verificationReason?: string;
  helpfulCount: number;
}

export interface Restaurant {
  id: string;
  name: string;
  city: 'Marrakech' | 'Casablanca' | 'Fes' | 'Tangier';
  category: string;
  description: string;
  coordinates: Coordinates;
  images: string[];
  priceRange: string;
  meta?: {
    reviewsCount: number;
    avgScores: ReviewRating;
  };
  // Computed for UI
  rating?: number; 
  reviews?: number;
}

export type MessageType = 'text' | 'tip' | 'warning' | 'question';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  type: MessageType; 
  timestamp: number;
  channel: string;
  badges?: UserBadges;
}
