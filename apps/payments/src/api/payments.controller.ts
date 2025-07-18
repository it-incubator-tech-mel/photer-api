import { Body, Controller, Post, Headers } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';
import { CreateSessionDto } from './dto/create-session.dto';
import { HandlePaymentCommand } from '../application/use-cases/handle-payment.use-case';
import { StripeService } from '../application/services/stripe.service';

@Controller()
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly stripeService: StripeService,
  ) {}

  @MessagePattern({ cmd: 'create_payment_session' })
  async createPaymentSession(data: CreateSessionDto) {
    console.log('PaymentsController createPaymentSession dto', data);
    return this.commandBus.execute(new HandlePaymentCommand(data));
  }

  @Post('webhook/stripe')
  async handleStripeWebhook(
    @Body() body: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.stripeService.handleWebhookEvent(body, signature);
  }
}
