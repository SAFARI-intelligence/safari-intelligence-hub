// Common types
export * from "./common";

// Domain types
export * from "./auth";
export * from "./ai";
export * from "./billing";
export * from "./location";
export * from "./hotels";
export * from "./stories";
  homeLocationId?: string | null;
  createdAt: string;
}

export interface Animal {
  id: string;
  name: string;
  species: BigFiveAnimal;
  description: string;
  locationId: string;
  metadata: Record<string, unknown>;
  heroImage: string;
  createdAt: string;
}

export interface Story {
  id: string;
  animalId: string;
  title: string;
  textContent: string;
  audioUrl: string | null;
  source: StorySource;
  languageCode: string;
  createdAt: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  locationId: string;
  zoneName: string;
  currency: string;
  priceFrom: number;
  rating: number;
  images: string[];
  featured: boolean;
  promotedUntil?: string | null;
}

export interface Park {
  id: string;
  name: string;
  locationId: string;
  countryCode: string;
  entryFee: number;
}

export interface Experience {
  id: string;
  title: string;
  locationId: string;
  zoneName: string;
  description: string;
  price: number;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface NearbyQuery extends PaginationQuery {
  lat: number;
  lng: number;
  radiusKm?: number;
  type?: MapEntityType;
}

export interface NearbyItem {
  id: string;
  name: string;
  type: MapEntityType;
  zoneName: string;
  distanceKm: number;
  location: LatLng;
}

export interface NearbyCluster {
  clusterId: string;
  count: number;
  center: LatLng;
}

export interface NearbyResponse {
  center: LatLng;
  radiusKm: number;
  items: NearbyItem[];
  clusters: NearbyCluster[];
}

export interface RouteSuggestion {
  id: string;
  from: string;
  stop: string;
  destination: string;
  estimatedHours: number;
}

export interface AuthSignupRequest {
  name: string;
  email: string;
  password: string;
  preferences: Interest[];
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: UserProfile;
}

export interface AiChatRequest {
  message: string;
  conversationId?: string;
  lat?: number;
  lng?: number;
  selectedDestinationIds?: string[];
  hotelPreferences?: string[];
}

export interface AiChatResponse {
  reply: string;
  suggestions: string[];
  conversationId: string;
}

export interface SubscriptionUpgradeRequest {
  tier: Exclude<SubscriptionTier, "free">;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionCheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
}

export interface AnalyticsEvent {
  event: "signup" | "ai_chat" | "map_interaction" | "hotel_click" | "subscription_conversion";
  distinctId: string;
  properties?: Record<string, unknown>;
}
