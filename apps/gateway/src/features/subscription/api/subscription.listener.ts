import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ActivateSubscriptionCommand } from '../application/use-cases/activate-subscription.usecase';
import { CommandBus } from '@nestjs/cqrs';

export class SubscriptionActivatedEvent {
  constructor(
    public readonly subscriptionId: number,
    public readonly endDate: Date,
    public readonly externalId: string,
  ) {}
}

@Controller()
export class SubscriptionListener {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern('subscription_activated')
  async handleSubscriptionActivated(event: SubscriptionActivatedEvent) {
    await this.commandBus.execute(
      new ActivateSubscriptionCommand(
        event.subscriptionId,
        event.endDate,
        event.externalId,
      ),
    );
  }
}
