// gateway/src/subscription/use-cases/activate-subscription.usecase.ts
import { Injectable } from '@nestjs/common';
import { SubscriptionRepository } from '../../infrastructure/subscription.repository';
import { UserRepository } from '../../../user/infrastructure/user.repository';

export class ActivateSubscriptionCommand {}

@Injectable()
export class ActivateSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(subscriptionId: number, endDate: Date, externalId: string) {
    // Обновляем подписку
    const subscription = await this.subscriptionRepository.update(
      subscriptionId,
      {
        status: 'ACTIVE',
        validUntil: endDate,
        externalId,
      },
    );

    // Обновляем пользователя
    await this.userRepository.updateUserAccountType(
      subscription.userId,
      'BUSINESS',
    );
  }
}
