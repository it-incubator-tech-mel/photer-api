import { ApiProperty } from '@nestjs/swagger';

export class PaymentOutputDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  subscriptionId: string;

  @ApiProperty()
  dateOfPayment: Date;

  @ApiProperty()
  endDateOfSubscription: Date;

  @ApiProperty()
  price: number;

  @ApiProperty()
  subscriptionType: string; // MONTHLY, WEEKLY, DAILY

  @ApiProperty()
  paymentType: string; // STRIPE, PAYPAL
}
