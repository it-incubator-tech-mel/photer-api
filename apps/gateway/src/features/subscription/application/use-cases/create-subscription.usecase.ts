import { Inject, Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/subscription.repository';
import { SubscriptionPeriod } from '../../api/dto/create-subscription.dto';
import { SubscriptionStatus, PaymentProvider } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
      paymentProvider: command.paymentProvider,
    });

    // define price
    const amount: number = this.getPriceByType(command.subscriptionPeriod);

    // create payment session
    return new Promise<string>((resolve, reject) => {
      this.paymentsClient
        .send(
          { cmd: 'create_payment_session' },
          {
            userId: command.userId.toString(),
            amount,
            currency: 'usd',
            paymentProvider: command.paymentProvider,
            baseUrl: command.baseUrl,
            subscriptionPeriod: command.subscriptionPeriod,
            subscriptionId: subscription.id.toString(),
          },
        )
        .subscribe({
          next: (url) => resolve(url),
          error: (err) => reject(err),
        });
    });
  }

  private getPriceByType(type: string): number {
    const prices = { MONTHLY: 999, WEEKLY: 299, DAILY: 99 };
    return prices[type] || prices.MONTHLY;
  }
}
