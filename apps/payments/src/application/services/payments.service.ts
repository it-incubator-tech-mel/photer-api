import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('PAYMENTS_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendActivationEvent(
    subscriptionId: number,
    endDate: Date,
    externalId: string,
  ) {
    this.client.emit('subscription_activated', {
      subscriptionId,
      endDate,
      externalId,
    });
  }
}
