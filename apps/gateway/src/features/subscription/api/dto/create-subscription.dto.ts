import { IsEnum, IsUrl } from 'class-validator';

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
  @IsEnum(SubscriptionPeriod)
  readonly subscriptionPeriod: SubscriptionPeriod;

  @IsEnum(PaymentProvider)
  readonly paymentProvider: PaymentProvider;

  @IsUrl()
  readonly baseUrl: string;
}
