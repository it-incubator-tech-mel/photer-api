import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../domain/payment.entity';

export interface GetUserPaymentsParams {
  userId: string;
  skip: number;
  take: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

@Injectable()
export class PaymentsQueryRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repo: Repository<PaymentEntity>,
  ) {}

  async getUserPayments(
    params: GetUserPaymentsParams,
  ): Promise<[PaymentEntity[], number]> {
    const { userId, skip, take, sortBy, sortDirection } = params;

    const sortMapping: Record<string, string> = {
      dateOfPayment: 'payment.createdAt',
      endDateOfSubscription: 'subscription.currentPeriodEnd',
    };

    const safeSortBy = sortMapping[sortBy] || 'payment.createdAt';
    const safeSortDirection =
      sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return this.repo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.subscription', 'subscription')
      .where('subscription.userId = :userId', { userId: String(userId) })
      .orderBy(safeSortBy, safeSortDirection as 'ASC' | 'DESC')
      .skip(skip)
      .take(take)
      .getManyAndCount();
  }
}
