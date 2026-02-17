import { z } from 'zod';

/**
 * SETTINGS SCHEMAS - Shared between Client and Server
 */

// ============================================
// Settings Interface
// ============================================

export interface ISettings {
  _id: string;
  agencyName: string;
  defaultCurrency: string;
  cancellationPolicy: string;
}

// ============================================
// Update Settings Schema
// ============================================

export const UpdateSettingsSchema = z.object({
  agencyName: z
    .string()
    .min(1, 'Agency name is required')
    .max(100, 'Agency name must be 100 characters or less'),
  defaultCurrency: z
    .string()
    .min(1, 'Currency is required'),
  cancellationPolicy: z
    .string()
    .max(2000, 'Cancellation policy must be 2000 characters or less')
    .optional(),
});

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
