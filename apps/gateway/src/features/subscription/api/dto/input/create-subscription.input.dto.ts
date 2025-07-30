import { IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SubscriptionPeriod {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  DAILY = 'DAILY',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
}

export class CreateSubscriptionInputDto {
  @ApiProperty({
    enum: SubscriptionPeriod,
    description: 'The duration of the subscription plan',
    example: SubscriptionPeriod.MONTHLY,
  })
  @IsEnum(SubscriptionPeriod)
  @IsEnum(SubscriptionPeriod)
  readonly subscriptionPeriod: SubscriptionPeriod;

  @ApiProperty({
    enum: PaymentProvider,
    description: 'The selected payment provider',
    example: PaymentProvider.STRIPE,
  })
  @IsEnum(PaymentProvider)
  readonly paymentProvider: PaymentProvider;

  @ApiProperty({
    description:
      'Base URL of the client app used for redirect after payment (e.g., https://your-app.com)',
    example: 'https://your-app.com',
  })
  @IsUrl()
  readonly baseUrl: string;
}
