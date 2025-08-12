import { Injectable } from '@nestjs/common';
import {
  Subscription,
  SubscriptionStatus,
  AccountType,
  PaymentProvider,
} from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  // async findActiveByUserId(userId: number): Promise<Subscription | null> {
  //   return this.prisma.subscription.findFirst({
  //     where: {
  //       userId,
  //       status: SubscriptionStatus.ACTIVE,
  //     },
  //   });
  // }

  async getLatest(userId: number): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findLastWithAutoRenewal(userId: number): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        autoRenewal: true,
        OR: [
          { status: SubscriptionStatus.ACTIVE },
          { status: SubscriptionStatus.UPCOMING },
        ],
      },
      orderBy: { validUntil: 'desc' },
    });
  }

  async findPendingByUserId(userId: number): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.PENDING,
      },
    });
  }

  async create(data: {
    userId: number;
    status: SubscriptionStatus;
    accountType: AccountType;
    autoRenewal: boolean;
    paymentProvider: PaymentProvider;
    validUntil?: Date | null;
    externalId?: string | null;
  }): Promise<Subscription> {
    return this.prisma.subscription.create({
      data: {
        userId: data.userId,
        status: data.status,
        accountType: data.accountType,
        autoRenewal: data.autoRenewal,
        paymentProvider: data.paymentProvider,
        validUntil: data.validUntil ?? null,
        externalId: data.externalId ?? null,
      },
    });
  }

  async update(id: number, data: Partial<Subscription>): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { id },
      data,
    });
  }
}
