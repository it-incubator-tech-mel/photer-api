import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BaseQueryParams } from '../../../../../common/dto/base-input-query-params/base.query-params';

export const PaymentSortBy = {
  DATE_OF_PAYMENT: 'dateOfPayment',
  END_DATE_OF_SUBSCRIPTION: 'endDateOfSubscription',
} as const;

export type PaymentSortByType =
  (typeof PaymentSortBy)[keyof typeof PaymentSortBy];

export class PaymentQueryParams extends BaseQueryParams<PaymentSortByType> {
  @ApiProperty({
    description: 'The sorting field',
    default: PaymentSortBy.DATE_OF_PAYMENT,
    enum: Object.values(PaymentSortBy),
    required: false,
  })
  @IsOptional()
  sortBy: PaymentSortByType = PaymentSortBy.DATE_OF_PAYMENT;
}
