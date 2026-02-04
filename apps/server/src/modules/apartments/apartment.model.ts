import mongoose, { Schema, Document } from 'mongoose';
import { IApartment } from '@rental/shared';

// 1. Extend Mongoose Document with our Shared Interface
// This ensures TypeScript knows exactly what fields exist on a document.
export interface IApartmentDocument extends Omit<IApartment, '_id'>, Document {}

// 2. Define Mongoose Schema
const ApartmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RENTED', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    images: {
      type: [String], // Array of URL strings
      default: [],
    },
    facilities: {
      type: [String], // Array of strings (tags)
      default: [],
    },
    // Future relations:
    // landlordId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false, // Removes the __v field
  }
);

// 3. Create and Export Model
export const Apartment = mongoose.model<IApartmentDocument>('Apartment', ApartmentSchema);