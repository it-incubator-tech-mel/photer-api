import { ApiProperty } from '@nestjs/swagger';
import { BasePaginatedOutputDto } from '../../../../../../../common/dto/base-output-dto/base-paginated.output.dto';
import { SubscriptionOutputDto } from './subscription.output.dto';

export class PaginatedSubscriptionOutputDto extends BasePaginatedOutputDto<
  SubscriptionOutputDto[]
> {
  @ApiProperty({ type: [SubscriptionOutputDto] })
  items: SubscriptionOutputDto[];
}
