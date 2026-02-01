/**
 * SHARED MODULE ENTRY POINT
 * This file exports all shared types, interfaces and schemas.
 */

import { z } from 'zod';

// Example Schema: ensuring Zod is working
export const HealthCheckSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.date(),
});

// Infer TS type from Schema
export type HealthCheck = z.infer<typeof HealthCheckSchema>;

export const sayHello = () => 'Hello from Shared Package!';
