import { Interest, UserRole, SubscriptionTier } from "./common";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  preferences: Interest[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  preferences: Interest[];
  createdAt: string;
}
