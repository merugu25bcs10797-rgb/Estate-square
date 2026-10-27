import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['buyer', 'seller'], {
    errorMap: () => ({ message: "Role must be either 'buyer' or 'seller'. Public admin registration is forbidden." })
  }),
  phone: z.string().trim().optional()
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

export const propertyCreateSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(2000),
  price: z.coerce.number().positive('Price must be greater than zero'),
  city: z.string().trim().min(2, 'City is required'),
  address: z.string().trim().min(5, 'Address is required'),
  bedrooms: z.coerce.number().int().min(0, 'Bedrooms must be non-negative'),
  bathrooms: z.coerce.number().int().min(0, 'Bathrooms must be non-negative'),
  propertyType: z.enum(['apartment', 'villa', 'plot', 'independent_house', 'commercial']),
  listingType: z.enum(['sale', 'rent']),
  areaSqFt: z.coerce.number().positive('Area must be positive').optional()
});

export const propertyUpdateSchema = propertyCreateSchema.partial();

export const propertySearchSchema = z.object({
  city: z.string().trim().optional(),
  listingType: z.enum(['sale', 'rent']).optional(),
  propertyType: z.enum(['apartment', 'villa', 'plot', 'independent_house', 'commercial']).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9)
});

export const enquiryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(8, 'Phone number must be at least 8 digits'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1000)
});

export const enquiryStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'closed'])
});

export const visitCreateSchema = z.object({
  visitDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  note: z.string().trim().max(500).optional()
});

export const visitStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'rejected', 'cancelled', 'completed']),
  sellerNote: z.string().trim().max(500).optional()
});

export const rejectListingSchema = z.object({
  reason: z.string().trim().min(5, 'Rejection reason must be at least 5 characters')
});
