import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { lastValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { PaymentOutputDto } from '../../../api/dto/output/payment.output.dto';
import { Notification } from '../../../../../../base/notification/notification';
import { BaseQueryParams } from '../../../../../../../common/dto/base-input-query-params/base.query-params';
import { BasePaginatedOutputDto } from '../../../../../../../common/dto/base-output-dto/base-paginated.output.dto';

export class GetMyPaymentsQuery {
  constructor(
    public readonly userId: number,
    public readonly queryParams: BaseQueryParams,
  ) {}
}

@QueryHandler(GetMyPaymentsQuery)
export class GetMyPaymentsUseCase implements IQueryHandler<GetMyPaymentsQuery> {
  constructor(
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
  ) {}

  async execute(
    query: GetMyPaymentsQuery,
  ): Promise<Notification<BasePaginatedOutputDto<PaymentOutputDto[]> | null>> {
    const { userId, queryParams } = query;

    const payload = {
      userId,
      pageNumber: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
      sortBy: queryParams.sortBy,
      sortDirection: queryParams.sortDirection,
    };

    try {
      // sending an RPC request to payments (MessagePattern { cmd: 'get-my-payments' })
      const response$ = this.paymentsClient.send<
        BasePaginatedOutputDto<PaymentOutputDto[]>
      >({ cmd: 'get_my_payments' }, payload);

      const payments = await lastValueFrom(response$);
      return Notification.success(payments);
    } catch (err: any) {
      console.error('Error in GetMyPaymentsUseCase:', err);
      return Notification.internalError(
        'Failed to fetch payments from payments service',
      );
    }
  }
}
