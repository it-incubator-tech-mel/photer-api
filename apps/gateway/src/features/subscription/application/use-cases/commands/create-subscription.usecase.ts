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

    // 1. Find the latest subscription (any status)
    const lastSubscription =
      await this.subscriptionRepository.getLatest(userId);

    // 2. Disable autoRenewal for the last subscription with autoRenewal = true
    const lastAutoRenewSub =
      await this.subscriptionRepository.findLastWithAutoRenewal(userId);
    if (lastAutoRenewSub) {
      // const isDisabled = await new Promise<string>((resolve, reject) => {
      //   this.paymentsClient
      //     .send(
      //       { cmd: 'disable_auto_renewal' },
      //       {
      //         gatewaySubscriptionId: lastAutoRenewSub.id,
      //         externalSubscriptionId: lastAutoRenewSub.externalId,
      //       },
      //     )
      //     .subscribe({
      //       next: (url) => resolve(url),
      //       error: (err) => reject(err),
      //     });
      // });

      const isDisabled = await lastValueFrom(
        this.paymentsClient.send<boolean>(
          { cmd: 'disable_auto_renewal' },
          {
            gatewaySubscriptionId: lastAutoRenewSub.id,
            externalSubscriptionId: lastAutoRenewSub.externalId,
          },
        ),
      );

      if (!isDisabled) {
        return Notification.internalError('');
      }

      await this.subscriptionRepository.update(lastAutoRenewSub.id, {
        autoRenewal: false,
      });
    }

    // 3. Try to re-use PENDING subscription
    let subscription =
      await this.subscriptionRepository.findPendingByUserId(userId);

    if (subscription) {
      await this.subscriptionRepository.update(subscription.id, {
        updatedAt: now,
      });
    } else {
      // 4. Calculate start date
      const startDate =
        lastSubscription && lastSubscription.validUntil > now
          ? lastSubscription.validUntil
          : now;

      // 5. Calculate validUntil
      const validUntil = this.calculateValidUntil(
        startDate,
        subscriptionPeriod,
      );

      subscription = await this.subscriptionRepository.create({
        userId,
        status: SubscriptionStatus.PENDING,
        accountType: AccountType.BUSINESS,
        autoRenewal: true,
        paymentProvider,
        validUntil,
      });
    }

    // 6. Price and payment session
    const amount = this.getPriceByType(subscriptionPeriod);

    const sessionUrl = await new Promise<string>((resolve, reject) => {
      this.paymentsClient
        .send(
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
        )
        .subscribe({
          next: (url) => resolve(url),
          error: (err) => reject(err),
        });
    });

    if (!sessionUrl) {
      return Notification.conflict('User already has an active subscription');
    }

    return Notification.success(sessionUrl);
  }
  private getPriceByType(type: string): number {
    const prices = {
      MONTHLY: 999,
      WEEKLY: 299,
      DAILY: 99,
    };
    return prices[type] || prices.MONTHLY;
  }

  private calculateValidUntil(
    startDate: Date,
    subscriptionPeriod: SubscriptionPeriod,
  ): Date {
    const validUntil = new Date(startDate);
    switch (subscriptionPeriod) {
      case SubscriptionPeriod.DAILY:
        validUntil.setDate(validUntil.getDate() + 1);
        break;
      case SubscriptionPeriod.WEEKLY:
        validUntil.setDate(validUntil.getDate() + 7);
        break;
      case SubscriptionPeriod.MONTHLY:
      default:
        validUntil.setMonth(validUntil.getMonth() + 1);
        break;
    }
    return validUntil;
  }
}
