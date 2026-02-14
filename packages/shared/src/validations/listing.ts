import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('EUR'),
  condition: z.enum(['NEW', 'USED']).default('USED'),
  categoryId: z.string().min(1, 'Category is required'),

  // Vehicle details
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  mileage: z.number().int().min(0).optional(),
  fuelType: z.string().optional(),
  transmission: z.string().optional(),
  power: z.string().optional(),
  emissionClass: z.string().optional(),
  axles: z.number().int().optional(),
  weight: z.number().optional(),
  color: z.string().optional(),
  vin: z.string().optional(),

  // Location
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Specifications
  specifications: z.array(z.object({
    key: z.string(),
    value: z.string(),
    label: z.string().optional(),
  })).optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const searchListingsSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.enum(['NEW', 'USED']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minYear: z.number().optional(),
  maxYear: z.number().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'year_asc', 'year_desc']).default('newest'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
