import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPeriod, PaymentProvider } from './create-subscription.dto';

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum AccountType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}

export class SubscriptionOutputDto {
  @ApiProperty({
    description: 'Subscription ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    example: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @ApiProperty({
    description: 'Account type',
    enum: AccountType,
    example: AccountType.PERSONAL,
  })
  accountType: AccountType;

  @ApiProperty({
    description: 'Subscription valid until',
    example: '2025-09-03T14:32:15.916Z',
  })
  validUntil: string;

  @ApiProperty({
    description: 'Auto-renewal enabled',
    example: true,
  })
  autoRenewal: boolean;

  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.STRIPE,
  })
  paymentProvider: PaymentProvider;

  @ApiProperty({
    description: 'External payment provider ID',
    example: 'sub_123456789',
  })
  externalId: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2025-09-03T14:32:15.916Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last update date',
    example: '2025-09-03T14:32:15.916Z',
  })
  updatedAt: string;
}
