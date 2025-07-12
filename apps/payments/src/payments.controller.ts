import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Controller('stripe')
export class StripeController {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-06-30.basil',
    });
  }

  @Get('hello-world')
  async helloWorld() {
    return 'Hello World!';
  }

  @Get('checkout-session')
  async createCheckoutSession(@Res() res: Response) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        success_url: 'https://localhost:3000/stripe/success',
        cancel_url: 'https://localhost:3000/stripe/cancel',
        line_items: [
          {
            price_data: {
              currency: 'USD',
              product_data: {
                name: 'Business Subscription',
                description: 'Premium features and verified badge',
              },
              unit_amount: 999,
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        metadata: {
          userId: 'user_123',
        },
      });

      return res.redirect(HttpStatus.SEE_OTHER, session.url);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: 'Internal server error' });
    }
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const rawBody = (req as any).rawBody;
    console.log('rawBody', rawBody);
  }

  @Get('success')
  success() {
    return 'Payment successful!';
  }

  @Get('cancel')
  cancel() {
    return 'Payment canceled';
  }
}
