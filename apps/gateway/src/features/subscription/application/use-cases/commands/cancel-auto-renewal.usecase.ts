import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionRepository } from '../../../infrastructure/subscription.repository';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Notification } from '../../../../../../base/notification/notification';

export class CancelAutoRenewalCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(CancelAutoRenewalCommand)
export class CancelAutoRenewalUseCase
  implements ICommandHandler<CancelAutoRenewalCommand>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
  ) {}

  async execute(command: CancelAutoRenewalCommand): Promise<Notification> {
    const { userId } = command;

    // 1. Find active subscription
    const subscription =
      await this.subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      return Notification.notFound('Active subscription not found');
    }

    // 2. Check if already disabled
    if (!subscription.autoRenewal) {
      return Notification.conflict('Auto-renewal already canceled');
    }

    // 3. Ask payments service to disable auto-renewal
    const isDisabled = await lastValueFrom(
      this.paymentsClient.send<boolean>(
        { cmd: 'disable_auto_renewal' },
        {
          gatewaySubscriptionId: subscription.id,
          externalSubscriptionId: subscription.externalId,
        },
      ),
    );

    if (!isDisabled) {
      return Notification.conflict(
        'Failed to disable auto-renewal in payment provider',
      );
    }

    // 4. Update gateway DB
    await this.subscriptionRepository.update(subscription.id, {
      autoRenewal: false,
    });

    return Notification.success();
  }
}
