import { Inject } from '@nestjs/common';
import { SubscriptionRepository } from '../../../infrastructure/subscription.repository';
import { UserRepository } from '../../../../user/infrastructure/user.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export class ActivateSubscriptionCommand {
  constructor(
    public readonly subscriptionId: number,
    public readonly endDate: Date,
    public readonly externalId: string, // Stripe subscription id
  ) {}
}

@CommandHandler(ActivateSubscriptionCommand)
export class ActivateSubscriptionUseCase
  implements ICommandHandler<ActivateSubscriptionCommand>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userRepository: UserRepository,
    @Inject('PAYMENTS_SERVICE') private readonly paymentsClient: ClientProxy,
  ) {}

  async execute(command: ActivateSubscriptionCommand) {
    // 1) Activating the current one
    const current = await this.subscriptionRepository.update(
      command.subscriptionId,
      {
        status: 'ACTIVE',
        validUntil: command.endDate,
        externalId: command.externalId,
      },
    );

    // 2) We are looking for a previous active one with auto-renewal enabled
    const prev = await this.subscriptionRepository.findLastActiveBefore(
      current.userId,
      current.id,
    );

    // 3) Disable auto-renewal in Stripe and at home, but only if there is an externalId
    if (prev?.externalId) {
      try {
        const ok = await lastValueFrom(
          this.paymentsClient.send<boolean>(
            { cmd: 'disable_auto_renewal' },
            {
              gatewaySubscriptionId: prev.id, // number
              externalSubscriptionId: prev.externalId, // string (stripe sub id)
            },
          ),
        );

        if (ok) {
          await this.subscriptionRepository.update(prev.id, {
            autoRenewal: false,
          });
        } else {
          console.log("log: couldn't be disabled in the provider");
        }
      } catch (e) {
        // log: request error in payments — to be resolved by business policy,
        // repeat later / upload to DLQ/cron, etc.
      }
    }

    // 4) Обновляем аккаунт пользователя
    await this.userRepository.updateUserAccountType(current.userId, 'BUSINESS');
  }
}
