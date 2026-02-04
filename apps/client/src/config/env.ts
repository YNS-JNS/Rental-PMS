import { z } from 'zod';

/**
 * ENV CONFIGURATION (Frontend)
 * Validates environment variables at runtime using Zod.
 * If a variable is missing, the app will throw a clear error in the console.
 */
const envSchema = z.object({
  VITE_API_URL: z.string().url({ message: 'VITE_API_URL must be a valid URL' }),
});

// Validate the Vite environment variables
const envParsed = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

if (!envParsed.success) {
  console.error('❌ Invalid frontend environment variables:', envParsed.error.format());
  throw new Error('Invalid frontend environment variables');
}

export const env = {
  API_URL: envParsed.data.VITE_API_URL,
};
