import { z } from 'zod';

/**
 * Zod Schema for User Registration.
 * Used by: Frontend (Form Validation) & Backend (API Validation)
 */
export const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

/**
 * Zod Schema for User Login.
 */
export const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Infer TypeScript types automatically from Zod Schemas
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
