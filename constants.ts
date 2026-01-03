
import { Restaurant } from './types';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: 'La Sqala',
    city: 'Casablanca',
    category: 'Traditional',
    description: 'Nestled in the 18th-century fortified walls, La Sqala offers a lush Andalusian garden setting. Famous for its traditional Moroccan breakfast and seafood tagines, it is a sanctuary of peace in the bustling city.',
    coordinates: { lat: 33.6034, lng: -7.6192 },
    images: [
      'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800', 
      'https://images.unsplash.com/photo-1541518763179-0e3d960bf2f9?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800'
    ],
    priceRange: '$$',
    meta: {
        reviewsCount: 342,
        avgScores: { authenticity: 4.8, hospitality: 4.5, priceFairness: 4.2, hygiene: 4.7, culturalVibe: 4.9 }
    }
  },
  {
    id: '2',
    name: 'Rick\'s Café',
    city: 'Casablanca',
    category: 'Fine Dining',
    description: 'A romantic architectural gem designed to recreate the bar made famous by Humphrey Bogart and Ingrid Bergman in the classic movie "Casablanca". Live jazz and international cuisine with Moroccan touches.',
    coordinates: { lat: 33.6062, lng: -7.6185 },
    images: [
      'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?auto=format&fit=crop&w=800', 
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1485686531765-ba63b0782936?auto=format&fit=crop&w=800'
    ],
    priceRange: '$$$',
    meta: {
        reviewsCount: 890,
        avgScores: { authenticity: 3.5, hospitality: 4.8, priceFairness: 3.0, hygiene: 4.9, culturalVibe: 4.7 }
    }
  },
  {
    id: '3',
    name: 'Al Fassia',
    city: 'Marrakech',
    category: 'Traditional',
    description: 'Run entirely by women, Al Fassia is an institution in Marrakech. It serves some of the most authentic Fassi cuisine (from Fes) in the country, including the famous pigeon pastilla and shoulder of lamb.',
    coordinates: { lat: 31.6346, lng: -8.0070 },
    images: [
      'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1580820736789-9b6e5545d126?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800'
    ],
    priceRange: '$$',
    meta: {
        reviewsCount: 210,
        avgScores: { authenticity: 5.0, hospitality: 4.9, priceFairness: 4.5, hygiene: 4.8, culturalVibe: 4.6 }
    }
  },
  {
    id: '4',
    name: 'Nomad',
    city: 'Marrakech',
    category: 'Modern Moroccan',
    description: 'A trendy rooftop restaurant in the heart of the Medina with sweeping views of the spice market. The menu offers modern twists on Moroccan classics, perfect for a sunset dinner.',
    coordinates: { lat: 31.6295, lng: -7.9847 },
    images: [
      'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=800'
    ],
    priceRange: '$$',
    meta: {
        reviewsCount: 512,
        avgScores: { authenticity: 4.2, hospitality: 4.3, priceFairness: 4.0, hygiene: 4.6, culturalVibe: 4.8 }
    }
  },
  {
    id: '5',
    name: 'Nur',
    city: 'Fes',
    category: 'Fine Dining',
    description: 'Chef Najat Kaanache\'s masterpiece. Nur offers a daily changing tasting menu that utilizes ingredients from the local market to create avant-garde Moroccan dishes in a stylish Riad setting.',
    coordinates: { lat: 34.0619, lng: -4.9796 },
    images: [
      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800'
    ],
    priceRange: '$$$',
    meta: {
        reviewsCount: 85,
        avgScores: { authenticity: 4.5, hospitality: 4.9, priceFairness: 3.8, hygiene: 5.0, culturalVibe: 4.7 }
    }
  },
  {
    id: '6',
    name: 'The Ruined Garden',
    city: 'Fes',
    category: 'Street Food',
    description: 'Set in the romantic ruins of an old Riad, this spot offers excellent street-food style tapas and lunch dishes. It feels like a secret garden hidden away from the chaotic Medina streets.',
    coordinates: { lat: 34.0600, lng: -4.9750 },
    images: [
      'https://images.unsplash.com/photo-1597248881519-db089d3744a5?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=800'
    ],
    priceRange: '$',
    meta: {
        reviewsCount: 150,
        avgScores: { authenticity: 4.7, hospitality: 4.6, priceFairness: 4.8, hygiene: 4.4, culturalVibe: 5.0 }
    }
  }
];
