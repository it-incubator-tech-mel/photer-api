import { EnableAutoRenewalInputDto } from '../../../api/dto/input/enable-auto-renewal.input.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StripeService } from '../../services/stripe.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity } from '../../../domain/subscription.entity';
import { Repository } from 'typeorm';

export class EnableAutoRenewalCommand {
  constructor(public readonly dto: EnableAutoRenewalInputDto) {}
}

@CommandHandler(EnableAutoRenewalCommand)
export class EnableAutoRenewalUseCase
  implements ICommandHandler<EnableAutoRenewalCommand>
{
  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}

  async execute(command: EnableAutoRenewalCommand) {
    const { dto } = command;

    // 1. Enable auto renewal in Stripe
    const isEnabled = await this.stripeService.enableAutoRenewal(
      dto.externalSubscriptionId,
    );

    if (!isEnabled) {
      return false;
    }

    // 2. Update in DB
    await this.subscriptionRepo.update(
      {
        gatewaySubscriptionId: String(dto.gatewaySubscriptionId),
        externalSubscriptionId: dto.externalSubscriptionId,
      },
      { autoRenewal: true },
    );

    return true;
  }
}
