import mongoose, { Schema, Document } from 'mongoose';
import { ICleaningTask, CleaningTaskStatusType } from '@rental/shared';

// ============================================
// Sub-document Schema: Status History Entry
// ============================================

const StatusHistoryEntrySchema = new Schema(
  {
    status: {
      type: String,
      enum: ['TO_DO', 'IN_PROGRESS', 'DONE'],
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// ============================================
// Document Interface
// ============================================

export interface ICleaningTaskDocument extends Omit<ICleaningTask, '_id' | 'booking' | 'apartment' | 'assignedTo' | 'dueDate' | 'completedAt' | 'history'>, Document {
  booking: mongoose.Types.ObjectId;
  apartment: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: CleaningTaskStatusType;
  dueDate: Date;
  completedAt?: Date;
  history: Array<{
    status: CleaningTaskStatusType;
    changedBy: mongoose.Types.ObjectId;
    changedAt: Date;
    note?: string;
  }>;
}

// ============================================
// Main Schema: CleaningTask
// ============================================

const CleaningTaskSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    apartment: {
      type: Schema.Types.ObjectId,
      ref: 'Apartment',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['TO_DO', 'IN_PROGRESS', 'DONE'],
      default: 'TO_DO',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
    history: {
      type: [StatusHistoryEntrySchema],
      required: true,
      validate: {
        validator: (v: any[]) => v.length > 0,
        message: 'History must contain at least one entry.',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ============================================
// Indexes
// ============================================

/** One cleaning task per booking (prevents duplicates) */
CleaningTaskSchema.index({ booking: 1 }, { unique: true });

/** Dashboard: tasks by apartment and status */
CleaningTaskSchema.index({ apartment: 1, status: 1 });

/** Cleaner view: my active tasks */
CleaningTaskSchema.index({ assignedTo: 1, status: 1 });

/** Sort/filter by urgency */
CleaningTaskSchema.index({ dueDate: 1 });

// ============================================
// Serialization
// ============================================

CleaningTaskSchema.set('toJSON', { virtuals: true });
CleaningTaskSchema.set('toObject', { virtuals: true });

export const CleaningTask = mongoose.model<ICleaningTaskDocument>('CleaningTask', CleaningTaskSchema);
