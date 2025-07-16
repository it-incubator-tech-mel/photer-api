import { Injectable } from '@nestjs/common';
import { ActivateSubscriptionUseCase } from './use-cases/activate-subscription.usecase';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly activateSubscriptionUseCase: ActivateSubscriptionUseCase,
  ) {}

  async activateSubscription(
    subscriptionId: number,
    endDate: Date,
    externalId: string,
  ) {
    await this.activateSubscriptionUseCase.execute(
      subscriptionId,
      endDate,
      externalId,
    );
  }
}
