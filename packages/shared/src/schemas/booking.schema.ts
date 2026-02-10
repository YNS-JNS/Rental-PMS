import { z } from 'zod';

/**
 * Booking Status Enum
 */
export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

/**
 * MongoDB ObjectId validation regex (24 hex characters)
 */
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Base Booking Schema (without refinements)
 * Use this for partial updates
 */
export const BookingBaseSchema = z.object({
  apartmentId: z.string().regex(objectIdRegex, { message: 'Invalid apartment ID format' }),
  tenantId: z.string().regex(objectIdRegex, { message: 'Invalid tenant ID format' }),
  startDate: z.coerce.date({ required_error: 'Start date is required' }),
  endDate: z.coerce.date({ required_error: 'End date is required' }),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).default('CONFIRMED'),
  totalPrice: z.number().positive({ message: 'Total price must be positive' }),
  guestCount: z.number().int().min(1, { message: 'At least 1 guest is required' }),
  notes: z.string().optional(),
});

/**
 * Full Booking Schema with date validation
 * Use this for creation
 */
export const BookingSchema = BookingBaseSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

// Type inference for forms and API payloads
export type BookingInput = z.infer<typeof BookingBaseSchema>;

// Interface for database objects (includes MongoDB fields)
export interface IBooking {
  _id: string;
  apartmentId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatusType;
  totalPrice: number;
  guestCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

