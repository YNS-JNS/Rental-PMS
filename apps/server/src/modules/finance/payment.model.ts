import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from '@rental/shared';

/**
 * Payment Document Interface
 * Extends Mongoose Document with shared IPayment interface
 */
export interface IPaymentDocument extends Omit<IPayment, '_id' | 'bookingId'>, Document {
  booking: mongoose.Types.ObjectId;
}

/**
 * Mongoose Schema for Payment
 */
const PaymentSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
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
      default: Date.now,
    },
    method: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CHECK', 'OTHER'],
      required: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
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
 * Virtual to get bookingId as string for API responses
 */
PaymentSchema.virtual('bookingId').get(function (this: IPaymentDocument) {
  return this.booking?.toString();
});

// Ensure virtuals are serialized
PaymentSchema.set('toJSON', { virtuals: true });
PaymentSchema.set('toObject', { virtuals: true });

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
