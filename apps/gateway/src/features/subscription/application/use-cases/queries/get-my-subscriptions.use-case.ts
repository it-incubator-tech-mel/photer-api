import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SubscriptionQueryRepository } from '../../../infrastructure/subscription.query-repository';
import { BasePaginatedOutputDto } from '../../../../../../../common/dto/base-output-dto/base-paginated.output.dto';
import { SubscriptionOutputDto } from '../../../api/dto/output/subscription.output.dto';
import { SubscriptionSortByType } from '../../../api/dto/input/subscription-sort-by.type';
import { SortDirection } from '../../../../../../../common/dto/base-input-query-params/base.query-params';

export class GetUserSubscriptionsQuery {
  constructor(params: {
    userId: number;
    pageNumber: number;
    pageSize: number;
    sortBy: SubscriptionSortByType;
    sortDirection: SortDirection;
  }) {
    Object.assign(this, params);
  }

  userId: number;
  pageNumber: number;
  pageSize: number;
  sortBy: SubscriptionSortByType;
  sortDirection: SortDirection;
}

@QueryHandler(GetUserSubscriptionsQuery)
export class GetMySubscriptionsUseCase
  implements IQueryHandler<GetUserSubscriptionsQuery>
{
  constructor(
    private readonly subscriptionQueryRepository: SubscriptionQueryRepository,
  ) {}

  async execute(
    query: GetUserSubscriptionsQuery,
  ): Promise<BasePaginatedOutputDto<SubscriptionOutputDto[]>> {
    return this.subscriptionQueryRepository.getUserSubscriptions(query);
  }
}
