// Color Palette (from SRS)
export const COLORS = {
  primary: '#1E3A5F',      // Deep Blue
  accent: '#F59E0B',       // Orange
  bgLight: '#F5F6F7',      // Light Grey
  bgWhite: '#FFFFFF',      // White
  textPrimary: '#222222',  // Dark Grey
  textSecondary: '#6B7280', // Grey
  border: '#E5E7EB',       // Light Border
} as const;

// Vehicle Categories
export const VEHICLE_CATEGORIES = [
  'Trucks',
  'Semi Trailers',
  'Full Trailers',
  'Construction Machinery',
  'Agricultural Machinery',
  'Material Handling',
  'Vans / LCV / Buses',
  'Cars / Campers / Caravans',
  'Containers',
  'Parts & Accessories',
] as const;

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: { name: 'Free', maxListings: 1, featuredListings: 0, price: 0 },
  BASIC: { name: 'Basic', maxListings: 10, featuredListings: 2, price: 29.99 },
  PREMIUM: { name: 'Premium', maxListings: 50, featuredListings: 10, price: 79.99 },
} as const;

// Fuel Types
export const FUEL_TYPES = ['Diesel', 'Petrol', 'Electric', 'Hybrid', 'LPG', 'CNG'] as const;

// Transmission Types
export const TRANSMISSION_TYPES = ['Manual', 'Automatic', 'Semi-Automatic'] as const;

// Emission Classes
export const EMISSION_CLASSES = ['Euro 1', 'Euro 2', 'Euro 3', 'Euro 4', 'Euro 5', 'Euro 6', 'Euro 6d'] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
