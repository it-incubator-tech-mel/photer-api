import { Controller, Headers, Get, Req, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { CreateSessionInputDto } from './dto/create-session.dto';
import { HandlePaymentCommand } from '../application/use-cases/handle-payment.use-case';
import { StripeService } from '../application/services/stripe.service';

interface RawBodyRequest extends Request {
  rawBody: Buffer;
}

@Controller()
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly stripeService: StripeService,
  ) {}

  @Get()
  async hellWorld() {
    return 'Hello World!';
  }

  @MessagePattern({ cmd: 'create_payment_session' })
  async createPaymentSession(
    @Payload() data: CreateSessionInputDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      const result = await this.commandBus.execute(
        new HandlePaymentCommand(data),
      );

      // Confirmation after successful refund
      channel.ack(originalMsg);

      // Returning the value to the gateway
      return result;
    } catch (error) {
      // Rejecting without resending (false = not requeue)
      channel.nack(originalMsg, false, false);
      throw error;
    }
  }

  @Post('stripe/webhook')
  async handleStripeWebhook(
    @Req() req: RawBodyRequest,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      if (!req.rawBody || !Buffer.isBuffer(req.rawBody)) {
        throw new Error('Invalid raw body');
      }

      await this.stripeService.handleWebhookEvent(req.rawBody, signature);
      return { received: true };
    } catch (error: any) {
      throw new Error(`Webhook Error: ${error.message}`);
    }
  }
}
