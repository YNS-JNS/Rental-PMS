/**
 * SHARED MODULE ENTRY POINT
 * This file exports all shared types, interfaces and schemas.
 */

// Export Zod Schemas & Types
export * from './schemas/auth.schema';
export * from './schemas/apartment.schema';
export * from './schemas/user.schema';
export * from './schemas/tenant.schema';
export * from './schemas/booking.schema';
export * from './schemas/finance.schema';

// Export other shared utilities if needed
export const sayHello = () => 'Hello from Shared Package!';