import { Controller, Headers, Get, Req, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  MessagePattern,
  Payload,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { CreateSessionInputDto } from './dto/input/create-session.input.dto';
import { HandlePaymentCommand } from '../application/use-cases/commands/handle-payment.use-case';
import { StripeService } from '../application/services/stripe.service';
import { BasePaginatedOutputDto } from '../../../common/dto/base-output-dto/base-paginated.output.dto';
import { PaymentOutputDto } from './dto/output/payment.output.dto';
import { GetMyPaymentsQuery } from '../application/use-cases/queries/get-my-payments.use-case';
import { PaymentQueryParams } from './dto/input/payment.query-params';
import { DisableAutoRenewalInputDto } from './dto/input/disable-auto-renewal.input.dto';
import { DisableAutoRenewalCommand } from '../application/use-cases/commands/disable-auto-renewal.use-case';
import { EnableAutoRenewalInputDto } from './dto/input/enable-auto-renewal.input.dto';
import { EnableAutoRenewalCommand } from '../application/use-cases/commands/enable-auto-renewal.use-case';

interface RawBodyRequest extends Request {
  rawBody: Buffer;
}

@Controller()
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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

  @MessagePattern({ cmd: 'get_my_payments' })
  async getMyPayments(
    @Payload() payload: { userId: number } & PaymentQueryParams,
  ): Promise<BasePaginatedOutputDto<PaymentOutputDto[]>> {
    const { userId, ...queryParams } = payload;

    // const baseQueryParams = new BaseQueryParams();
    // baseQueryParams.pageNumber = queryParams.pageNumber;
    // baseQueryParams.pageSize = queryParams.pageSize;
    // baseQueryParams.sortBy = queryParams.sortBy;
    // baseQueryParams.sortDirection = queryParams.sortDirection;

    const paymentQueryParams = Object.assign(
      new PaymentQueryParams(),
      queryParams,
    );

    return this.queryBus.execute(
      new GetMyPaymentsQuery(String(userId), paymentQueryParams),
    );
  }

  @MessagePattern({ cmd: 'enable_auto_renewal' })
  async enableAutoRenewal(
    @Payload() payload: EnableAutoRenewalInputDto,
  ): Promise<boolean> {
    return this.commandBus.execute(new EnableAutoRenewalCommand(payload));
  }

  @MessagePattern({ cmd: 'disable_auto_renewal' })
  async disableAutoRenewal(
    @Payload()
    payload: DisableAutoRenewalInputDto,
  ): Promise<boolean> {
    return this.commandBus.execute(new DisableAutoRenewalCommand(payload));
  }
}
