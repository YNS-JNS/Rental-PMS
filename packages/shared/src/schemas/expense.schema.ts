import { z } from 'zod';
import type { RentalTypeValue } from './apartment.schema';

// ============================================
// Expense Type Discriminator
// Set automatically by the service layer.
// AGENCY  → no apartment linked (Frais de structure)
// APARTMENT → linked to a specific property
// ============================================
export const ExpenseType = z.enum(['APARTMENT', 'AGENCY']);
export type ExpenseTypeValue = z.infer<typeof ExpenseType>;

// ============================================
// Expense Category Enum
// Apartment-specific: WATER, ELECTRICITY, GAS, INTERNET,
//   CLEANING, MAINTENANCE, RENOVATION, FURNITURE
// Agency-wide (structural): SOFTWARE, MARKETING, INSURANCE,
//   ACCOUNTING, LEGAL, OFFICE_SUPPLIES, SALARIES, TRAVEL,
//   EQUIPMENT, TAXES
// Catch-all: OTHER
// ============================================
export const ExpenseCategory = z.enum([
  // Apartment-specific
  'WATER',
  'ELECTRICITY',
  'GAS',
  'INTERNET',
  'CLEANING',
  'MAINTENANCE',
  'RENOVATION',
  'FURNITURE',
  // Agency-wide (structural)
  'SOFTWARE',
  'MARKETING',
  'INSURANCE',
  'ACCOUNTING',
  'LEGAL',
  'OFFICE_SUPPLIES',
  'SALARIES',
  'TRAVEL',
  'EQUIPMENT',
  'TAXES',
  // Catch-all
  'OTHER',
]);
export type ExpenseCategoryType = z.infer<typeof ExpenseCategory>;

// ============================================
// MongoDB ObjectId validation
// ============================================
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ============================================
// Expense Zod Schema
// apartmentId is optional: absence signifies an Agency Expense.
// expenseType is optional here — the service derives and sets it.
// ============================================
export const ExpenseSchema = z.object({
  apartmentId: z
    .string()
    .regex(objectIdRegex, { message: 'Invalid apartment ID format' })
    .nullable()
    .optional(),
  expenseType: ExpenseType.optional(),
  amount: z.number().positive({ message: 'Amount must be positive' }),
  date: z.coerce.date({ required_error: 'Date is required' }),
  category: ExpenseCategory,
  description: z.string().optional(),
});

// Type inference
export type ExpenseInput = z.infer<typeof ExpenseSchema>;

// Interface for database objects (populated API response shape)
export interface IExpense {
  _id: string;
  expenseType: ExpenseTypeValue;
  apartment?: {
    _id: string;
    name: string;
    address?: string;
    rentalType?: RentalTypeValue;
  };
  amount: number;
  date: Date;
  category: ExpenseCategoryType;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
