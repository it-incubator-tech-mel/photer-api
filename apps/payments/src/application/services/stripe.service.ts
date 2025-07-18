import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateSessionDto } from '../../api/dto/create-session.dto';
import { PaymentsService } from './payments.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity } from '../../domain/subscription.entity';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../domain/payment.entity';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private readonly paymentsService: PaymentsService,
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepo: Repository<SubscriptionEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createSubscriptionSession(dto: CreateSessionDto): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: dto.currency,
            product_data: {
              name: `Business Subscription (${dto.subscriptionPeriod})`,
            },
            unit_amount: dto.amount,
            recurring: {
              interval: this.getInterval(dto.subscriptionPeriod),
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${dto.baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${dto.baseUrl}/cancel`,
      metadata: {
        userId: dto.userId,
        subscriptionId: dto.subscriptionId,
      },
    });

    return session.url;
  }

  async handleWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      if (event.type === 'checkout.session.completed') {
        await this.handlePaymentSuccess(
          event.data.object as Stripe.Checkout.Session,
        );
      } else if (event.type === 'invoice.payment_failed') {
        console.log('Payment failed webhook received:', event.type);
      } else if (event.type === 'customer.subscription.deleted') {
        console.log('Subscription cancelled webhook received:', event.type);
      } else {
        console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (err) {
      console.log(`Webhook error: ${err.message}`);
      throw new Error(`Webhook error: ${err.message}`);
    }
  }

  private async handlePaymentSuccess(session: Stripe.Checkout.Session) {
    try {
      const subscriptionId = session.metadata?.subscriptionId;
      const userId = session.metadata?.userId;

      if (!subscriptionId || !userId) {
        console.log('Missing metadata in Stripe session');
        return;
      }

      // Getting the subscription ID from the session
      const subscriptionIdFromStripe = session.subscription as string;

      // Getting a Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscriptionIdFromStripe,
      );

      // Updating the subscription in the database
      const subscription = await this.subscriptionRepo.findOne({
        where: { gatewaySubscriptionId: subscriptionId },
        relations: ['payments'],
      });

      if (!subscription) {
        console.log(`Subscription not found: ${subscriptionId}`);
        return;
      }

      subscription.status = 'active';
      subscription.externalSubscriptionId = stripeSubscription.id;

      // Using the correct property from Stripe.Subscription
      // Explicit type conversion to any to circumvent the typing problem
      const stripeSubscriptionAny = stripeSubscription as any;

      subscription.currentPeriodEnd = new Date(
        stripeSubscriptionAny.current_period_end * 1000,
      );

      await this.subscriptionRepo.save(subscription);

      // Updating the payment
      if (subscription.payments?.length > 0) {
        const payment = subscription.payments[0];
        payment.status = 'succeeded';
        payment.externalPaymentId =
          (session.payment_intent as string) || session.id;
        await this.paymentRepo.save(payment);
      }

      // Sending an activation event
      this.paymentsService.sendActivationEvent(
        parseInt(subscriptionId, 10),
        new Date(stripeSubscriptionAny.current_period_end * 1000),
        stripeSubscription.id,
      );

      console.log(`Subscription activated: ${subscriptionId}`);
    } catch (error) {
      console.log(`Error handling payment success: ${error.message}`);
    }
  }

  private getInterval(period: string): 'day' | 'week' | 'month' | 'year' {
    switch (period) {
      case 'DAILY':
        return 'day';
      case 'WEEKLY':
        return 'week';
      case 'MONTHLY':
        return 'month';
      default:
        return 'month';
    }
  }
}
