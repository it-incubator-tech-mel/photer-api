import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SortDirection } from '../../../../../common/dto/base-input-query-params/base.query-params';
import { BasePaginatedOutputDto } from '../../../../../common/dto/base-output-dto/base-paginated.output.dto';
import { SubscriptionOutputDto } from '../api/dto/output/subscription.output.dto';

@Injectable()
export class SubscriptionQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSubscriptions(params: {
    userId: number;
    pageNumber: number;
    pageSize: number;
    sortBy: string;
    sortDirection: SortDirection;
  }): Promise<BasePaginatedOutputDto<SubscriptionOutputDto[]>> {
    const { userId, pageNumber, pageSize, sortBy, sortDirection } = params;

    const totalCount = await this.prisma.subscription.count({
      where: { userId },
    });

    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { [sortBy]: sortDirection },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        userId: true,
        accountType: true,
        status: true,
        validUntil: true,
        autoRenewal: true,
        paymentProvider: true,
        externalId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const items: SubscriptionOutputDto[] = subscriptions.map((sub) => ({
      id: sub.id,
      userId: sub.userId,
      accountType: sub.accountType,
      status: sub.status,
      validUntil: sub.validUntil,
      autoRenewal: sub.autoRenewal,
      paymentProvider: sub.paymentProvider,
      externalId: sub.externalId,
      createdAt: sub.updatedAt,
      updatedAt: sub.updatedAt,
    }));

    return BasePaginatedOutputDto.mapToOutput({
      items,
      page: pageNumber,
      size: pageSize,
      totalCount,
    });
  }
}
