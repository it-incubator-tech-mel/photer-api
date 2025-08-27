import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SubscriptionRepository } from '../../../infrastructure/subscription.repository';

export class CancelAutoRenewalCommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(CancelAutoRenewalCommand)
export class CancelAutoRenewalUseCase
  implements ICommandHandler<CancelAutoRenewalCommand>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(command: CancelAutoRenewalCommand) {
    const { userId } = command;

    // 1. We find the user's active subscription
    const subscription =
      await this.subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    // 2. Checking to see if auto-renewal has already been canceled
    if (!subscription.autoRenewal) {
      throw new ConflictException('Auto-renewal already canceled');
    }

    // 3. Disabling auto-renewal
    subscription.autoRenewal = false;
    await this.subscriptionRepository.save(subscription);

    return { success: true };
  }
}
