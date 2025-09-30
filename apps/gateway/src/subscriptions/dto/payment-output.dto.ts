import { ApiProperty } from '@nestjs/swagger';

export class PaymentOutputDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Subscription ID',
    example: 'sub_123456789',
  })
  subscriptionId: string;

  @ApiProperty({
    description: 'Payment date',
    example: '2025-09-03T14:32:15.925Z',
  })
  dateOfPayment: string;

  @ApiProperty({
    description: 'Subscription end date',
    example: '2025-09-03T14:32:15.925Z',
  })
  endDateOfSubscription: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 9.99,
  })
  price: number;

  @ApiProperty({
    description: 'Subscription type',
    example: 'MONTHLY',
  })
  subscriptionType: string;

  @ApiProperty({
    description: 'Payment type',
    example: 'CREDIT_CARD',
  })
  paymentType: string;
}
