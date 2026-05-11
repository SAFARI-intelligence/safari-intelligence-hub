export const BIG_FIVE = ["lion", "elephant", "leopard", "rhino", "buffalo"] as const;

export type BigFiveAnimal = (typeof BIG_FIVE)[number];
export type Interest = "wildlife" | "luxury" | "adventure" | "culture" | "photography";
export type UserRole = "tourist" | "admin" | "partner";
export type SubscriptionTier = "free" | "safari_plus" | "partner";
export type StorySource = "ai" | "editorial";

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
