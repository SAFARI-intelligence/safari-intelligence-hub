import type { Interest } from "@safari/contracts";
import { SafariApiClient } from "@safari/utils";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

let currentAccessToken: string | null = null;

const client = new SafariApiClient({
  baseUrl: API_BASE_URL,
  getAccessToken: () => currentAccessToken
});

export const setApiAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const safariApi = {
  signup(payload: { name: string; email: string; password: string; preferences: Interest[] }) {
    return client.signup(payload);
  },
  login(payload: { email: string; password: string }) {
    return client.login(payload);
  },
  animals(page = 1, limit = 20) {
    return client.animals(page, limit);
  },
  storiesByAnimal(animalId: string) {
    return client.storiesByAnimal(animalId);
  },
  hotels(page = 1, limit = 20) {
    return client.hotels(page, limit);
  },
  nearby(
    lat: number,
    lng: number,
    radiusKm = 50,
    type?: "animal" | "hotel" | "park" | "experience",
    distinctId?: string
  ) {
    return client.nearby({ lat, lng, radiusKm, type, distinctId });
  },
  aiChat(payload: {
    message: string;
    conversationId?: string;
    lat?: number;
    lng?: number;
    selectedDestinationIds?: string[];
    hotelPreferences?: string[];
  }) {
    return client.aiChat(payload);
  },
  createSubscriptionCheckout(payload: {
    tier: "safari_plus" | "partner";
    successUrl: string;
    cancelUrl: string;
  }) {
    return client.createSubscriptionCheckout(payload);
  },
  trackHotelClick(hotelId: string, distinctId: string, userId?: string) {
    return client.trackHotelClick(hotelId, distinctId, userId);
  }
};
