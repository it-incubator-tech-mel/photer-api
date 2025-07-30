import { StripeService } from '../services/stripe.service';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionEntity } from '../../domain/subscription.entity';
import { PaymentEntity } from '../../domain/payment.entity';
import { CreateSessionInputDto } from '../../api/dto/create-session.dto';

export class HandlePaymentCommand {
  constructor(public readonly dto: CreateSessionInputDto) {}
}

@CommandHandler(HandlePaymentCommand)
export class HandlePaymentHandler
  implements ICommandHandler<HandlePaymentCommand>
{
  constructor(
    private readonly stripeService: StripeService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {}

  async execute(command: HandlePaymentCommand) {
    const { dto } = command;

    // Verification: is there already an active subscription with this SubscriptionId
    const existing = await this.subscriptionRepo.findOne({
      where: { gatewaySubscriptionId: dto.subscriptionId },
      relations: ['payments'],
    });

    // If it has already been created and is active, we don't do anything
    if (existing?.status === 'active') {
      return null;
    }

    try {
      // If there is, we continue to use it
      let subscription = existing;
      if (!subscription) {
        subscription = this.subscriptionRepo.create({
          userId: dto.userId,
          gatewaySubscriptionId: dto.subscriptionId,
          paymentProvider: dto.paymentProvider,
          subscriptionPeriod: dto.subscriptionPeriod,
          status: 'pending',
          autoRenewal: true,
        });
        await this.subscriptionRepo.save(subscription);
      }

      // Creating a payment (even if you already have a subscription)
      const payment = this.paymentRepo.create({
        amount: dto.amount,
        currency: dto.currency,
        status: 'pending',
        paymentProvider: dto.paymentProvider,
        subscription,
      });
      await this.paymentRepo.save(payment);

      // Creating a payment session
      switch (dto.paymentProvider) {
        case 'STRIPE':
          return await this.stripeService.createSubscriptionSession(dto);
        case 'PAYPAL':
          return `${dto.baseUrl}/paypal-redirect`;
        default:
          throw new Error('Unsupported payment provider');
      }
    } catch (error) {
      throw new RpcException({
        status: 'error',
        message: error.message,
        details: {
          paymentProvider: dto.paymentProvider,
          userId: dto.userId,
          subscriptionId: dto.subscriptionId,
        },
      });
    }
  }
}
