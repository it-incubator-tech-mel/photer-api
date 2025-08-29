import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionRepository } from '../../../infrastructure/subscription.repository';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { Notification } from '../../../../../../base/notification/notification';
import { lastValueFrom } from 'rxjs';

export class EnableAutoRenewalCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(EnableAutoRenewalCommand)
export class EnableAutoRenewalUseCase
  implements ICommandHandler<EnableAutoRenewalCommand>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
  ) {}

  async execute(command: EnableAutoRenewalCommand): Promise<Notification> {
    const { userId } = command;

    // 1. Find active subscription
    const subscription =
      await this.subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      return Notification.notFound('Active subscription not found');
    }

    // 2. Check if already enabled
    if (subscription.autoRenewal) {
      return Notification.conflict('Auto-renewal already enabled');
    }

    // 3. Ask payments service to enable auto-renewal
    const isEnabled = await lastValueFrom(
      this.paymentsClient.send<boolean>(
        { cmd: 'enable_auto_renewal' },
        {
          gatewaySubscriptionId: subscription.id,
          externalSubscriptionId: subscription.externalId,
        },
      ),
    );

    if (!isEnabled) {
      return Notification.conflict(
        'Failed to enable auto-renewal in payment provider',
      );
    }

    // 4. Update gateway DB
    await this.subscriptionRepository.update(subscription.id, {
      autoRenewal: true,
    });

    return Notification.success();
  }
}
