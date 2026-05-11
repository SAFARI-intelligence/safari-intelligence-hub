import type { SubscriptionTier, UserRole } from "@safari/contracts";

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  preferences: string[];
}
