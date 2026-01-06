import { z } from 'zod';

const envSchema = z.object({

  // App Database
  APP_DB_HOST: z.string().default('localhost'), 
  APP_DB_PORT: z.coerce.number().default(3307),
  APP_DB_USER: z.string().default('root'),
  APP_DB_PASSWORD: z.string().default('ideia'),
  APP_DB_NAME: z.string().default('ideiaerp_sync'),

  // OpenCart
  OPENCART_URL: z.string().url().optional(),
  OPENCART_API_KEY: z.string().optional(),

  // Webhooks
  WEBHOOK_TOKEN_OPENCART: z.string().optional(),

  // CRON
  CRON_SYNC_PRODUCTS: z.string().default('0 */6 * * *'),
  CRON_SYNC_PRICES: z.string().default('0 */2 * * *'),
  CRON_SYNC_STOCK: z.string().default('*/15 * * * *'),
  CRON_SYNC_ORDERS: z.string().default('*/5 * * * *'),

  // Token Configuration
  TOKEN_EXPIRATION_MINUTES: z.coerce.number().default(360),
  REFRESH_TOKEN_EXPIRATION_DAYS: z.coerce.number().default(7),
  TOKEN_COOKIE_NAME: z.string().default('token'),

  // Server
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function validateEnv(): Env {
  if (!env) {
    env = envSchema.parse(process.env);
  }
  return env;
}

export function getEnv(): Env {
  if (!env) {
    return validateEnv();
  }
  return env;
}

