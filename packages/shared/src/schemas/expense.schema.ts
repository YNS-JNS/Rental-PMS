import { z } from 'zod';
import type { RentalTypeValue } from './apartment.schema';

// ============================================
// Expense Category Enum
// ============================================
export const ExpenseCategory = z.enum(['WATER', 'ELECTRICITY', 'CLEANING', 'MAINTENANCE', 'OTHER']);
export type ExpenseCategoryType = z.infer<typeof ExpenseCategory>;

// ============================================
// MongoDB ObjectId validation
// ============================================
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// ============================================
// Expense Zod Schema
// ============================================
export const ExpenseSchema = z.object({
  apartmentId: z
    .string()
    .regex(objectIdRegex, { message: 'Invalid apartment ID format' })
    .optional(),
  amount: z.number().positive({ message: 'Amount must be positive' }),
  date: z.coerce.date({ required_error: 'Date is required' }),
  category: ExpenseCategory,
  description: z.string().optional(),
});

// Type inference
export type ExpenseInput = z.infer<typeof ExpenseSchema>;

// Interface for database objects
export interface IExpense {
  _id: string;
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
