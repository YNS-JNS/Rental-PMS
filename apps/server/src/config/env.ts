import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// 1. Force dotenv to look for .env in the root of apps/server
// __dirname is 'src/config', so '../../.env' points to 'apps/server/.env'
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Define the schema
const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(1, 'REFRESH_TOKEN_SECRET is required'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
});

// Validate
const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('❌ Invalid environment variables:', envParsed.error.format());
  process.exit(1);
}

export const env = envParsed.data;
