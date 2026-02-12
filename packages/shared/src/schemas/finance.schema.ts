import { z } from 'zod';

// ============================================
// Payment Method Enum
// ============================================
export const PaymentMethod = z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER']);
export type PaymentMethodType = z.infer<typeof PaymentMethod>;

// ============================================
// Payment Status Enum (for Booking)
// ============================================
export const PaymentStatus = z.enum(['UNPAID', 'PARTIALLY_PAID', 'PAID']);
export type PaymentStatusType = z.infer<typeof PaymentStatus>;

// ============================================
// MongoDB ObjectId validation
// ============================================
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ============================================
// Payment Zod Schema
// ============================================
export const PaymentSchema = z.object({
  bookingId: z.string().regex(objectIdRegex, { message: 'Invalid booking ID format' }),
  amount: z.number().positive({ message: 'Amount must be positive' }),
  date: z.coerce.date().default(() => new Date()),
  method: PaymentMethod,
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// Type inference
export type PaymentInput = z.infer<typeof PaymentSchema>;

// Interface for database objects
export interface IPayment {
  _id: string;
  bookingId: string;
  amount: number;
  date: Date;
  method: PaymentMethodType;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
