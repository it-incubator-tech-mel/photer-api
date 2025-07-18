import { SubscriptionRepository } from '../../infrastructure/subscription.repository';
import { UserRepository } from '../../../user/infrastructure/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ActivateSubscriptionCommand {
  constructor(
    public readonly subscriptionId: number,
    public readonly endDate: Date,
    public readonly externalId: string,
  ) {}
}

@CommandHandler(ActivateSubscriptionCommand)
export class ActivateSubscriptionUseCase
  implements ICommandHandler<ActivateSubscriptionCommand>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: ActivateSubscriptionCommand) {
    // update subscription
    const subscription = await this.subscriptionRepository.update(
      command.subscriptionId,
      {
        status: 'ACTIVE',
        validUntil: command.endDate,
        externalId: command.externalId,
      },
    );

    // update account type for user
    await this.userRepository.updateUserAccountType(
      subscription.userId,
      'BUSINESS',
    );
  }
}
