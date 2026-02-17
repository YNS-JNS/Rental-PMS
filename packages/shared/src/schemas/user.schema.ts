import { z } from 'zod';

/**
 * USER TYPES - Shared between Client and Server
 * This file contains the shared user-related types and enums.
 */

/**
 * User Role Enum
 * Defines the permission levels in the application.
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

/**
 * Public User Interface
 * Used for API responses and frontend state.
 * Does NOT contain sensitive fields like password.
 */
export interface IUserPublic {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

// ============================================
// Change Password Schema
// ============================================

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// ============================================
// Update Profile Schema
// ============================================

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  email: z
    .string()
    .email('Please provide a valid email address'),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
