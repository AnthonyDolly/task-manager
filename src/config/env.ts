import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // DB & Cache
  MONGODB_URI: z.string().url({ message: 'MONGODB_URI must be a valid Mongo connection string' }),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  // Auth
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('1d'),

  // Security
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  LOGIN_WINDOW_MINUTES: z.coerce.number().default(15),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().default(5),

  // Logging
  LOG_LEVEL: z.string().optional(),
  LOG_TO_FILE: z.string().optional(),
  LOG_DIR: z.string().optional(),
  LOG_FILE_NAME: z.string().optional()
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment variables');
  console.error(result.error.format());
  process.exit(1);
}

export const env = result.data; 