import { Inject } from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/subscription.repository';
import { SubscriptionPeriod } from '../../api/dto/input/create-subscription.input.dto';
import {
  SubscriptionStatus,
  PaymentProvider,
  AccountType,
} from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Notification } from '../../../../../base/notification/notification';

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

    // 1. Checking for an active subscription
    const activeSubscription =
      await this.subscriptionRepository.findActiveByUserId(userId);

    if (activeSubscription) {
      return Notification.conflict('User already has an active subscription');
    }

    // 2. Looking for an existing PENDING subscription (we will reuse it if there is one)
    let subscription =
      await this.subscriptionRepository.findPendingByUserId(userId);

    if (!subscription) {
      // 3. If not, create a new PENDING subscription.
      subscription = await this.subscriptionRepository.create({
        userId,
        status: SubscriptionStatus.PENDING,
        accountType: AccountType.BUSINESS,
        autoRenewal: true,
        paymentProvider,
      });
    }

    // 4. Calculating the price
    const amount = this.getPriceByType(subscriptionPeriod);

    // 5. Requesting a payment session
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
}
