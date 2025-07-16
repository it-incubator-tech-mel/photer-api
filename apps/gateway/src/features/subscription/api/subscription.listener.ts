import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SubscriptionService } from '../application/subscription.service';

export class SubscriptionActivatedEvent {
  constructor(
    public readonly subscriptionId: number,
    public readonly endDate: Date,
    public readonly externalId: string,
  ) {}
}

@Controller()
export class SubscriptionListener {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @EventPattern('subscription_activated')
  async handleSubscriptionActivated(event: SubscriptionActivatedEvent) {
    await this.subscriptionService.activateSubscription(
      event.subscriptionId,
      event.endDate,
      event.externalId,
    );
  }
}
