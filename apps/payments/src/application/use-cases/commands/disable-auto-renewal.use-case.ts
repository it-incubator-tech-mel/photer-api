import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionEntity } from '../../../domain/subscription.entity';
import { Repository } from 'typeorm';
import { DisableAutoRenewalInputDto } from '../../../api/dto/input/disable-auto-renewal.input.dto';
import { StripeService } from '../../services/stripe.service';
import { InjectRepository } from '@nestjs/typeorm';

export class DisableAutoRenewalCommand {
  constructor(public readonly dto: DisableAutoRenewalInputDto) {}
}

@CommandHandler(DisableAutoRenewalCommand)
export class DisableAutoRenewalUseCase
  implements ICommandHandler<DisableAutoRenewalCommand>
{
  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
  ) {}
  async execute(command: DisableAutoRenewalCommand) {
    const { dto } = command;

    // 1. Disable auto renewal in Stripe
    const isDisabled = await this.stripeService.disableAutoRenewal(
      dto.externalSubscriptionId,
    );

    if (!isDisabled) {
      return false;
    }

    // 2. Update in DB
    await this.subscriptionRepo.update(
      {
        gatewaySubscriptionId: String(dto.gatewaySubscriptionId),
        externalSubscriptionId: dto.externalSubscriptionId,
      },
      { autoRenewal: false },
    );

    return true;
  }
}
