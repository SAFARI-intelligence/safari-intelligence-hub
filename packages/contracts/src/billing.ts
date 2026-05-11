export type SubscriptionTierType = "safari_plus" | "partner";

export interface PromoteHotelRequest {
  startsAt: string;
  endsAt: string;
  amountPaid: number;
  currency?: string;
}

export interface UpgradeSubscriptionRequest {
  tier: SubscriptionTierType;
  successUrl: string;
  cancelUrl: string;
}

export interface BillingResponse {
  sessionId: string;
  checkoutUrl: string;
}
