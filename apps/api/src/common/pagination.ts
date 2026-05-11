import type { PaginatedResult } from "@safari/contracts";

export function toPaginated<T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResult<T> {
  return {
    items,
    page,
    limit,
    total,
    hasMore: page * limit < total
  };
}
