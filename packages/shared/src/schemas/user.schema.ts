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
