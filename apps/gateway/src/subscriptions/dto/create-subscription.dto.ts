import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUrl } from 'class-validator';

export enum SubscriptionPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  PAYME = 'PAYME',
}

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Subscription period',
    enum: SubscriptionPeriod,
    example: SubscriptionPeriod.MONTHLY,
  })
  @IsEnum(SubscriptionPeriod)
  subscriptionPeriod: SubscriptionPeriod;

  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.STRIPE,
  })
  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;

  @ApiProperty({
    description: 'Base URL for payment redirect',
    example: 'https://your-app.com',
  })
  @IsString()
  @IsUrl()
  baseUrl: string;
}
