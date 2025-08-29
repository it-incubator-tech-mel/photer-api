import { BaseQueryParams } from '../../../../../../../common/dto/base-input-query-params/base.query-params';
import { PaymentSortBy, PaymentSortByType } from './payment-sort-by.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class PaymentQueryParams extends BaseQueryParams<PaymentSortByType> {
  @ApiProperty({
    description: 'The sorting field',
    default: PaymentSortBy.DATE_OF_PAYMENT,
    enum: Object.values(PaymentSortBy),
    required: false,
  })
  @IsEnum(PaymentSortBy)
  @IsOptional()
  sortBy: PaymentSortByType = PaymentSortBy.DATE_OF_PAYMENT;
}
