import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionEntity } from '../../domain/subscription.entity';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../domain/payment.entity';
import { CreateSessionInputDto } from '../../api/dto/create-session.dto';

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

  async createSubscriptionSession(dto: CreateSessionInputDto): Promise<string> {
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
    if (!Buffer.isBuffer(payload)) {
      throw new Error('Payload must be a Buffer');
    }

    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      return this.processStripeEvent(event);
    } catch (err) {
      console.error('Webhook verification failed:', err.message);
      throw new Error(`Webhook error: ${err.message}`);
    }
  }

  private processStripeEvent(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      return this.handlePaymentSuccess(
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
  }

  private async handlePaymentSuccess(session: Stripe.Checkout.Session) {
    try {
      // Get metadata from the Stripe session (sent during checkout creation)
      const subscriptionId = session.metadata?.subscriptionId;
      const userId = session.metadata?.userId;

      // If metadata is missing, we can't continue
      if (!subscriptionId || !userId) {
        console.log('Missing metadata in Stripe session');
        return;
      }

      // Get the Stripe subscription ID from the session
      // sub_1RqWf5QwBtsCQIyjZ2fX06Qq
      const subscriptionIdFromStripe = session.subscription as string;

      // Fetch the full subscription object from Stripe
      // stripeSubscription.id - sub_1RqWf5QwBtsCQIyjZ2fX06Qq
      const stripeSubscription: any = await this.stripe.subscriptions.retrieve(
        subscriptionIdFromStripe,
      );

      // Find the local subscription in the database using the internal ID
      const subscription = await this.subscriptionRepo.findOne({
        where: { gatewaySubscriptionId: subscriptionId },
        relations: ['payments'],
      });

      // If subscription is not found in the database, log and exit
      if (!subscription) {
        console.log(`Subscription not found: ${subscriptionId}`);
        return;
      }

      // Update local subscription status and store external Stripe ID
      subscription.status = 'active';
      subscription.externalSubscriptionId = stripeSubscription.id;

      // Try to get the period end date from Stripe subscription
      let currentPeriodEndUnix = stripeSubscription.current_period_end;

      // If not available, get it from the latest invoice (fallback)
      if (!currentPeriodEndUnix) {
        const latestInvoiceId = stripeSubscription.latest_invoice as string;

        if (latestInvoiceId) {
          const invoice = await this.stripe.invoices.retrieve(latestInvoiceId);
          currentPeriodEndUnix = invoice.lines.data[0]?.period?.end;
        }
      }

      // If the end date is invalid, log and exit
      if (!currentPeriodEndUnix || isNaN(currentPeriodEndUnix)) {
        console.error(
          `Invalid current_period_end from Stripe subscription or invoice:`,
          currentPeriodEndUnix,
        );
        return;
      }

      // Convert UNIX timestamp to JS Date and save to DB
      const currentPeriodEndDate = new Date(currentPeriodEndUnix * 1000);
      subscription.currentPeriodEnd = currentPeriodEndDate;
      await this.subscriptionRepo.save(subscription);

      // Update the first related payment with success status and Stripe payment ID
      if (subscription.payments?.length > 0) {
        // get the last payment
        const payment = await this.paymentRepo.findOne({
          where: {
            subscription: { id: subscription.id },
            status: 'pending',
          },
          order: { createdAt: 'DESC' },
        });
        payment.status = 'succeeded';
        payment.externalPaymentId =
          (session.payment_intent as string) || session.id;
        await this.paymentRepo.save(payment);
      }

      // Send activation event (e.g., to another service or for further processing)
      this.paymentsService.sendActivationEvent(
        parseInt(subscriptionId, 10),
        currentPeriodEndDate,
        stripeSubscription.id,
      );
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
