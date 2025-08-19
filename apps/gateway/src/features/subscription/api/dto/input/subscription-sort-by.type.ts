export const SubscriptionSortBy = {
  VALID_UNTIL: 'validUntil',
  CREATED_AT: 'createdAt',
} as const;

export type SubscriptionSortByType =
  (typeof SubscriptionSortBy)[keyof typeof SubscriptionSortBy];
