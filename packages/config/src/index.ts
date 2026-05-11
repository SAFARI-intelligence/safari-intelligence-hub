import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-5.2"),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_SAFARI_PLUS: z.string().optional(),
  STRIPE_PRICE_PARTNER: z.string().optional(),
  POSTHOG_API_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().default("https://app.posthog.com")
});

const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_BASE_URL: z.string().url(),
  EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN: z.string().optional(),
  EXPO_PUBLIC_ENABLE_MAPBOX: z.enum(["true", "false"]).default("false")
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type MobileEnv = z.infer<typeof mobileEnvSchema>;

export function readServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse(source);
}

export function readMobileEnv(source: Record<string, string | undefined>): MobileEnv {
  return mobileEnvSchema.parse(source);
}
