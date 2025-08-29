import { ApiProperty } from '@nestjs/swagger';
import {
  SubscriptionStatus,
  AccountType,
  PaymentProvider,
} from '@prisma/client';

export class SubscriptionOutputDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty({ enum: SubscriptionStatus })
  status: SubscriptionStatus;

  @ApiProperty({ enum: AccountType })
  accountType: AccountType;

  @ApiProperty({ required: false })
  validUntil?: Date;

  @ApiProperty()
  autoRenewal: boolean;

  @ApiProperty({ enum: PaymentProvider })
  paymentProvider: PaymentProvider;

  @ApiProperty({ required: false })
  externalId?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
