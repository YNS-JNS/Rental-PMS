import mongoose, { Schema, Document } from 'mongoose';
import { IExpense } from '@rental/shared';

/**
 * Expense Document Interface
 * Extends Mongoose Document with shared IExpense interface
 */
export interface IExpenseDocument extends Omit<IExpense, '_id' | 'apartmentId'>, Document {
  apartment?: mongoose.Types.ObjectId;
}

/**
 * Mongoose Schema for Expense
 */
const ExpenseSchema = new Schema(
  {
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
      enum: ['WATER', 'ELECTRICITY', 'CLEANING', 'MAINTENANCE', 'OTHER'],
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
 * Compound index for profitability queries:
 * efficient lookup of expenses by apartment + date range
 */
ExpenseSchema.index({ apartment: 1, date: 1 });

/**
 * Virtual to get apartmentId as string for API responses
 */
ExpenseSchema.virtual('apartmentId').get(function (this: IExpenseDocument) {
  return this.apartment?.toString();
});

// Ensure virtuals are serialized
ExpenseSchema.set('toJSON', { virtuals: true });
ExpenseSchema.set('toObject', { virtuals: true });

export const Expense = mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
