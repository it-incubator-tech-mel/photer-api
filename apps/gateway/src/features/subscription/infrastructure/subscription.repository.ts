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

  async findActiveByUserId(userId: number): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });
  }

  async upsert(data: {
    userId: number;
    status: SubscriptionStatus;
    accountType: AccountType;
    autoRenewal: boolean;
    paymentProvider: PaymentProvider;
  }): Promise<Subscription> {
    return this.prisma.subscription.upsert({
      where: { userId: data.userId },
      create: data,
      update: {
        status: data.status,
        paymentProvider: data.paymentProvider,
        validUntil: null,
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
