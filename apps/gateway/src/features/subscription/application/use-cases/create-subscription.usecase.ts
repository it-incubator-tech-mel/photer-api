import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/subscription.repository';
import { SubscriptionPeriod } from '../../api/dto/create-subscription.dto';
import { SubscriptionStatus, PaymentProvider } from '@prisma/client';

export class CreateSubscriptionCommand {
  constructor(
    public readonly userId: number,
    public readonly subscriptionPeriod: SubscriptionPeriod,
    public readonly PaymentProvider: PaymentProvider,
    public readonly baseUrl: string,
  ) {}
}

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    // private readonly paymentsClient: PaymentsServiceClient,
  ) {}

  async execute(command: CreateSubscriptionCommand) {
    // check if active subscription exists
    const existingSubscription =
      await this.subscriptionRepository.findActiveByUserId(command.userId);

    if (existingSubscription) {
      throw new Error('User already has an active subscription');
    }

    // create subscription status PENDING
    const subscription = await this.subscriptionRepository.upsert({
      userId: command.userId,
      status: SubscriptionStatus.PENDING,
      accountType: 'BUSINESS',
      autoRenewal: true,
      paymentProvider: command.PaymentProvider,
    });

    // define price
    const amount: number = this.getPriceByType(command.subscriptionPeriod);

    // create payment session
    // const sessionUrl = await this.paymentsClient.createSubscriptionSession({
    //   userId: command.userId.toString(),
    //   amount,
    //   currency: 'usd',
    //   paymentType: command.paymentType,
    //   baseUrl: command.baseUrl,
    //   typeSubscription: command.subscriptionType,
    //   subscriptionId: subscription.id.toString(),
    // });

    return 'https://my-site.com';
    // return sessionUrl;
  }

  private getPriceByType(type: string): number {
    const prices = { MONTHLY: 999, WEEKLY: 299, DAILY: 99 };
    return prices[type] || prices.MONTHLY;
  }
}
