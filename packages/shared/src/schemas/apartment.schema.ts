import { z } from 'zod';

// Enums
export const ApartmentStatus = z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE']);

// Zod Schema for Validation
export const ApartmentSchema = z.object({
  name: z.string().min(3, { message: "Name is required (min 3 chars)" }),
  description: z.string().optional(),
  address: z.string().min(5, { message: "Address is required" }),
  price: z.number().positive({ message: "Price must be positive" }),
  // FIX: Removed .default('AVAILABLE') to satisfy React Hook Form strict typing.
  // The default value is now handled solely by the UI form state.
  status: ApartmentStatus, 
  images: z.array(z.string().url()).optional(),
  facilities: z.array(z.string()).optional(),
});

// Type Inference for Frontend Forms
export type ApartmentInput = z.infer<typeof ApartmentSchema>;

// Interface for Database Object
export interface IApartment extends ApartmentInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
}