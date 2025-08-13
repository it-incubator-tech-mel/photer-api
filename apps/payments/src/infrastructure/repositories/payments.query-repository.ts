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

    const allowedSortFields: (keyof PaymentEntity)[] = ['createdAt', 'amount'];
    const safeSortBy = allowedSortFields.includes(sortBy as keyof PaymentEntity)
      ? sortBy
      : 'createdAt';

    const safeSortDirection =
      sortDirection?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return this.repo.findAndCount({
      relations: ['subscription'],
      where: { subscription: { userId: String(userId) } },
      order: { [safeSortBy]: safeSortDirection },
      skip,
      take,
    });
  }
}
