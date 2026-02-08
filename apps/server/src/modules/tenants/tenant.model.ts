import mongoose, { Schema, Document } from 'mongoose';
import { ITenant } from '@rental/shared';

/**
 * Tenant Document Interface
 * Extends Mongoose Document with shared ITenant interface
 */
export interface ITenantDocument extends Omit<ITenant, '_id'>, Document {}

/**
 * Mongoose Schema for Tenant
 */
const TenantSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    cinPassport: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Tenant = mongoose.model<ITenantDocument>('Tenant', TenantSchema);
