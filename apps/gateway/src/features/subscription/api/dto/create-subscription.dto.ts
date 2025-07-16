export enum SubscriptionPeriod {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export class CreateSubscriptionDto {
  readonly subscriptionPeriod: SubscriptionPeriod;
  readonly paymentProvider: PaymentProvider;
  readonly baseUrl: string;
}
