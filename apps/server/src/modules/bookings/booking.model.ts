import mongoose, { Schema, Document } from 'mongoose';
import { IBooking, BookingStatusType } from '@rental/shared';

/**
 * Booking Document Interface
 * Extends Mongoose Document with shared IBooking interface
 */
export interface IBookingDocument extends Omit<IBooking, '_id' | 'apartmentId' | 'tenantId'>, Document {
  apartment: mongoose.Types.ObjectId;
  tenant: mongoose.Types.ObjectId;
}

/**
 * Mongoose Schema for Booking
 */
const BookingSchema = new Schema(
  {
    apartment: {
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
      index: true,
    },
    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
      default: 'CONFIRMED',
      index: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    guestCount: {
      type: Number,
      required: true,
      min: 1,
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
 * Compound index for availability queries (anti-double booking performance)
 * Optimizes queries that check for overlapping bookings on an apartment
 */
BookingSchema.index({ apartment: 1, startDate: 1, endDate: 1 });

/**
 * Virtual to get apartmentId as string for API responses
 */
BookingSchema.virtual('apartmentId').get(function(this: IBookingDocument) {
  return this.apartment?.toString();
});

BookingSchema.virtual('tenantId').get(function(this: IBookingDocument) {
  return this.tenant?.toString();
});

// Ensure virtuals are serialized
BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

export const Booking = mongoose.model<IBookingDocument>('Booking', BookingSchema);
