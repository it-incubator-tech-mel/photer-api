import { IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';

export enum SubscriptionPeriod {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export class CreateSessionDto {
  @IsString()
  userId: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;

  @IsUrl()
  baseUrl: string;

  @IsEnum(SubscriptionPeriod)
  subscriptionPeriod: SubscriptionPeriod;

  @IsString()
  subscriptionId: string;
}
