import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BasePaginatedOutputDto } from '../../../../../common/dto/base-output-dto/base-paginated.output.dto';
import { PaymentOutputDto } from '../../../api/dto/output/payment.output.dto';
import { PaymentsQueryRepository } from '../../../infrastructure/repositories/payments.query-repository';
import { PaymentQueryParams } from '../../../api/dto/input/payment.query-params';

export class GetMyPaymentsQuery {
  constructor(
    public readonly userId: string,
    public readonly queryParams: PaymentQueryParams,
  ) {}
}

@QueryHandler(GetMyPaymentsQuery)
export class GetMyPaymentsUseCase implements IQueryHandler<GetMyPaymentsQuery> {
  constructor(private readonly paymentsQueryRepo: PaymentsQueryRepository) {}

  async execute(
    query: GetMyPaymentsQuery,
  ): Promise<BasePaginatedOutputDto<PaymentOutputDto[]>> {
    const { userId, queryParams } = query;

    const [items, totalCount] = await this.paymentsQueryRepo.getUserPayments({
      userId,
      skip: queryParams.calculateSkip(),
      take: queryParams.pageSize,
      sortBy: queryParams.sortBy,
      sortDirection: queryParams.sortDirection,
    });

    const dtoItems: PaymentOutputDto[] = items.map((p) => ({
      subscriptionId: p.subscription?.id ?? null,
      userId: p.subscription?.userId ?? null,
      dateOfPayment: p.createdAt,
      endDateOfSubscription: p.subscription?.currentPeriodEnd ?? null,
      price: p.amount,
      subscriptionType: p.subscription?.subscriptionPeriod ?? null,
      paymentType: p.paymentProvider,
    }));

    return BasePaginatedOutputDto.mapToOutput({
      items: dtoItems,
      page: queryParams.pageNumber,
      size: queryParams.pageSize,
      totalCount,
    });
  }
}
