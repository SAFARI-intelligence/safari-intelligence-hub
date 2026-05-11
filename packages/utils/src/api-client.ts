import type {
  AiChatRequest,
  AiChatResponse,
  Animal,
  AuthLoginRequest,
  AuthResponse,
  AuthSignupRequest,
  Hotel,
  NearbyResponse,
  Story,
  SubscriptionCheckoutResponse,
  SubscriptionUpgradeRequest
} from "@safari/contracts";

export interface SafariApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | null | undefined;
}

export class SafariApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken?: () => string | null | undefined;

  constructor(options: SafariApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.getAccessToken = options.getAccessToken;
  }

  async signup(payload: AuthSignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(payload) });
  }

  async login(payload: AuthLoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  }

  async animals(page = 1, limit = 20): Promise<{ items: Animal[]; total: number }> {
    return this.request(`/animals?page=${page}&limit=${limit}`);
  }

  async storiesByAnimal(animalId: string): Promise<{ items: Story[] }> {
    return this.request(`/stories?animalId=${encodeURIComponent(animalId)}&page=1&limit=10`);
  }

  async hotels(page = 1, limit = 20): Promise<{ items: Hotel[]; total: number }> {
    return this.request(`/hotels?page=${page}&limit=${limit}`);
  }

  async nearby(query: {
    lat: number;
    lng: number;
    radiusKm?: number;
    type?: "animal" | "hotel" | "park" | "experience";
    distinctId?: string;
  }): Promise<NearbyResponse> {
    const type = query.type ? `&type=${query.type}` : "";
    const distinctId = query.distinctId ? `&distinctId=${encodeURIComponent(query.distinctId)}` : "";
    const radius = query.radiusKm ?? 50;
    return this.request(`/map/nearby?lat=${query.lat}&lng=${query.lng}&radiusKm=${radius}${type}${distinctId}`);
  }

  async aiChat(payload: AiChatRequest): Promise<AiChatResponse> {
    return this.request("/ai/chat", { method: "POST", body: JSON.stringify(payload), auth: true });
  }

  async createSubscriptionCheckout(payload: SubscriptionUpgradeRequest): Promise<SubscriptionCheckoutResponse> {
    return this.request("/billing/upgrade", { method: "POST", body: JSON.stringify(payload), auth: true });
  }

  async trackHotelClick(hotelId: string, distinctId: string, userId?: string): Promise<{ success: boolean }> {
    return this.request(`/hotels/${hotelId}/click`, {
      method: "POST",
      body: JSON.stringify({ distinctId, userId })
    });
  }

  private async request<T>(
    path: string,
    init: (RequestInit & { auth?: boolean }) | undefined = undefined
  ): Promise<T> {
    const headers = new Headers(init?.headers ?? {});
    headers.set("Content-Type", "application/json");

    if (init?.auth && this.getAccessToken) {
      const token = this.getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  }
}
