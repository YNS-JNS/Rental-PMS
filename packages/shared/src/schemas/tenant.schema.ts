import { z } from 'zod';

/**
 * Tenant Schema - Shared validation for Client & Server
 */
export const TenantSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().optional(),
  cinPassport: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Type inference for forms and API payloads
export type TenantInput = z.infer<typeof TenantSchema>;

// Interface for database objects (includes MongoDB fields)
export interface ITenant extends TenantInput {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
