import mongoose, { Schema, Document } from 'mongoose';
import { IExpense, ExpenseTypeValue } from '@rental/shared';

/**
 * Expense Document Interface
 * Extends Mongoose Document with the shared IExpense interface.
 */
export interface IExpenseDocument extends Omit<IExpense, '_id' | 'apartment'>, Document {
  expenseType: ExpenseTypeValue;
  apartment?: mongoose.Types.ObjectId;
}

/**
 * Mongoose Schema for Expense
 */
const ExpenseSchema = new Schema(
  {
    /**
     * Discriminator field — set by the service, never by the client.
     * APARTMENT: expense is linked to a specific property.
     * AGENCY:    expense is a structural/agency-wide cost (Frais de structure).
     * Default: 'APARTMENT' for backward-compatibility with legacy documents.
     */
    expenseType: {
      type: String,
      enum: ['APARTMENT', 'AGENCY'],
      required: true,
      default: 'APARTMENT',
      index: true,
    },
    apartment: {
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: [
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
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Compound index — apartment + date (profitability queries per property)
 */
ExpenseSchema.index({ apartment: 1, date: 1 });

/**
 * Compound index — expenseType + date (agency-only expense reporting)
 */
ExpenseSchema.index({ expenseType: 1, date: 1 });

/**
 * Virtual to expose apartmentId as string in API responses
 */
ExpenseSchema.virtual('apartmentId').get(function (this: IExpenseDocument) {
  return this.apartment?.toString();
});

// Ensure virtuals are serialized into JSON/objects
ExpenseSchema.set('toJSON', { virtuals: true });
ExpenseSchema.set('toObject', { virtuals: true });

export const Expense = mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
