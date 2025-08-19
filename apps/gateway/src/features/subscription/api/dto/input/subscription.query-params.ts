import { BaseQueryParams } from '../../../../../../../common/dto/base-input-query-params/base.query-params';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
  SubscriptionSortBy,
  SubscriptionSortByType,
} from './subscription-sort-by.type';

export class SubscriptionQueryParams extends BaseQueryParams<SubscriptionSortByType> {
  @ApiProperty({
    description: 'The sorting field',
    default: SubscriptionSortBy.CREATED_AT,
    enum: Object.values(SubscriptionSortBy),
    required: false,
  })
  @IsEnum(SubscriptionSortBy)
  @IsOptional()
  sortBy: SubscriptionSortByType = SubscriptionSortBy.CREATED_AT;
}
