import { Inject } from '@nestjs/common';
import { SubscriptionRepository } from '../../../infrastructure/subscription.repository';
import { SubscriptionPeriod } from '../../../api/dto/input/create-subscription.input.dto';
import {
  SubscriptionStatus,
  PaymentProvider,
  AccountType,
} from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../../../base/notification/notification';
import { lastValueFrom } from 'rxjs';

export class CreateSubscriptionCommand {
  constructor(
    public readonly userId: number,
    public readonly subscriptionPeriod: SubscriptionPeriod,
    public readonly paymentProvider: PaymentProvider,
    public readonly baseUrl: string,
  ) {}
}

@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionUseCase
  implements ICommandHandler<CreateSubscriptionCommand>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
  ) {}

  async execute(command: CreateSubscriptionCommand) {
    const { userId, subscriptionPeriod, paymentProvider, baseUrl } = command;

    const now = new Date();

    // 1) Last subscription (any)
    const lastSubscription =
      await this.subscriptionRepository.getLatest(userId);

    // 2) We are trying to reuse PENDING (do not touch the autoRenewal of the active one!)
    let subscription =
      await this.subscriptionRepository.findPendingByUserId(userId);
    let createdNew = false;

    if (subscription) {
      await this.subscriptionRepository.update(subscription.id, {
        updatedAt: now,
      });
    } else {
      // 3) Calculating the dates
      const startDate =
        lastSubscription &&
        lastSubscription.validUntil &&
        lastSubscription.validUntil > now
          ? lastSubscription.validUntil
          : now;

      const validUntil = this.calculateValidUntil(
        startDate,
        subscriptionPeriod,
      );

      // 4) Creating a new PENDING
      subscription = await this.subscriptionRepository.create({
        userId,
        status: SubscriptionStatus.PENDING,
        accountType: AccountType.BUSINESS,
        autoRenewal: true,
        paymentProvider,
        validUntil,
      });
      createdNew = true;
    }

    // 5) Creating a payment session in payments (via RMQ)
    try {
      const amount = this.getPriceByType(subscriptionPeriod);

      const sessionUrl = await lastValueFrom(
        this.paymentsClient.send<string>(
          { cmd: 'create_payment_session' },
          {
            userId: userId.toString(),
            amount,
            currency: 'usd',
            paymentProvider,
            baseUrl,
            subscriptionPeriod,
            subscriptionId: subscription.id.toString(),
          },
        ),
      );

      if (!sessionUrl) {
        // unlikely, but just in case, we'll roll back the new Pending
        if (createdNew)
          await this.subscriptionRepository.delete(subscription.id);
        return Notification.conflict('User already has an active subscription');
      }

      return Notification.success(sessionUrl);
    } catch (err) {
      // In case of an external service error, we clean the newly created Pending
      if (createdNew) {
        try {
          await this.subscriptionRepository.delete(subscription.id);
        } catch {
          // we log, but do not cover the main error.
        }
      }
      return Notification.internalError('Failed to create payment session');
    }
  }

  private getPriceByType(type: string): number {
    const prices = { MONTHLY: 999, WEEKLY: 299, DAILY: 99 } as const;
    return (prices as any)[type] ?? prices.MONTHLY;
  }

  private calculateValidUntil(
    startDate: Date,
    period: SubscriptionPeriod,
  ): Date {
    const d = new Date(startDate);
    switch (period) {
      case SubscriptionPeriod.DAILY:
        d.setDate(d.getDate() + 1);
        break;
      case SubscriptionPeriod.WEEKLY:
        d.setDate(d.getDate() + 7);
        break;
      case SubscriptionPeriod.MONTHLY:
      default:
        d.setMonth(d.getMonth() + 1);
        break;
    }
    return d;
  }
}
