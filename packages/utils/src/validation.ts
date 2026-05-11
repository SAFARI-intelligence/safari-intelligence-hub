import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const latLngSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180)
});

export const mapNearbySchema = paginationSchema.extend({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().min(1).max(300).default(50),
  type: z.enum(["animal", "hotel", "park", "experience"]).optional()
});

export const signupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  preferences: z.array(z.enum(["wildlife", "luxury", "adventure", "culture", "photography"])).default([])
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const aiChatSchema = z.object({
  message: z.string().min(2).max(2000),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  selectedDestinationIds: z.array(z.string().uuid()).max(12).optional(),
  hotelPreferences: z.array(z.string().min(2).max(100)).max(10).optional()
});

export const upgradeSubscriptionSchema = z.object({
  tier: z.enum(["safari_plus", "partner"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});
