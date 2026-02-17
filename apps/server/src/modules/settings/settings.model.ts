import mongoose, { Document, Schema } from 'mongoose';

/**
 * Settings Interface
 */
export interface ISettingsDoc extends Document {
  agencyName: string;
  defaultCurrency: string;
  cancellationPolicy: string;
}

/**
 * Settings Schema — Singleton Pattern
 * Only one document should exist in this collection.
 */
const SettingsSchema = new Schema<ISettingsDoc>(
  {
    agencyName: {
      type: String,
      required: [true, 'Agency name is required'],
      default: 'My Agency',
      trim: true,
    },
    defaultCurrency: {
      type: String,
      default: 'MAD',
      trim: true,
    },
    cancellationPolicy: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Static Method: Get the singleton settings document.
 * Creates one with defaults if none exists.
 */
SettingsSchema.statics.getSettings = async function (): Promise<ISettingsDoc> {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export interface ISettingsModel extends mongoose.Model<ISettingsDoc> {
  getSettings(): Promise<ISettingsDoc>;
}

export const Settings = mongoose.model<ISettingsDoc, ISettingsModel>('Settings', SettingsSchema);
