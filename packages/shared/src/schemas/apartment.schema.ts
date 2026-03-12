import { z } from 'zod';

// ============================================
// Rental Type Enum
// ============================================
export const RentalType = z.enum(['OWNED_MONTHLY', 'OWNED_DAILY', 'COMMISSION_BASED']);
export type RentalTypeValue = z.infer<typeof RentalType>;

// ============================================
// Apartment Status Enum
// ============================================
export const ApartmentStatus = z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']);

// ============================================
// Base Apartment Schema (without cross-field refinements)
// ============================================
export const ApartmentBaseSchema = z.object({
  name: z.string().min(3, { message: 'Name is required (min 3 chars)' }),
  description: z.string().optional(),
  address: z.string().min(5, { message: 'Address is required' }),
  price: z.number().positive({ message: 'Price must be positive' }),
  status: ApartmentStatus,
  images: z.array(z.string().url()).optional(),
  facilities: z.array(z.string()).optional(),
  rentalType: RentalType,
  monthlyRent: z.number().positive({ message: 'Monthly rent must be positive' }).optional(),
  commissionPercentage: z
    .number()
    .min(0, { message: 'Commission must be >= 0' })
    .max(100, { message: 'Commission must be <= 100' })
    .optional(),
});

// ============================================
// Full Apartment Schema with cross-field validation
// ============================================
export const ApartmentSchema = ApartmentBaseSchema.superRefine((data, ctx) => {
  if (data.rentalType === 'OWNED_MONTHLY' && (data.monthlyRent === undefined || data.monthlyRent === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'monthlyRent is required when rentalType is OWNED_MONTHLY',
      path: ['monthlyRent'],
    });
  }

  if (data.rentalType === 'COMMISSION_BASED' && (data.commissionPercentage === undefined || data.commissionPercentage === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'commissionPercentage is required when rentalType is COMMISSION_BASED',
      path: ['commissionPercentage'],
    });
  }
});

// Type Inference for Frontend Forms
export type ApartmentInput = z.infer<typeof ApartmentBaseSchema>;

// Interface for Database Object
export interface IApartment extends ApartmentInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
}