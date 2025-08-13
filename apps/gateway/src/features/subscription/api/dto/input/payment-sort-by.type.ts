export const PaymentSortBy = {
  DATE_OF_PAYMENT: 'dateOfPayment',
  END_DATE_OF_SUBSCRIPTION: 'endDateOfSubscription',
} as const;

export type PaymentSortByType =
  (typeof PaymentSortBy)[keyof typeof PaymentSortBy];
