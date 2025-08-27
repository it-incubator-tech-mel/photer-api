import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateSubscriptionInputDto } from './dto/input/create-subscription.input.dto';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateSubscriptionCommand } from '../application/use-cases/commands/create-subscription.usecase';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '../../../core/exception-filters/exceptions/exception-types';
import { CreateSubscriptionDocs } from './swagger/create.subscription.swagger';
import { ResultStatus } from '../../../../base/notification/notification';
import { GetMyPaymentsDocs } from './swagger/get.my-payments.swagger';
import { PaymentOutputDto } from './dto/output/payment.output.dto';
import { GetMyPaymentsQuery } from '../application/use-cases/queries/get-my-payments.use-case';
import { BasePaginatedOutputDto } from '../../../../../common/dto/base-output-dto/base-paginated.output.dto';
import { PaymentQueryParams } from './dto/input/payment.query-params';
import { SubscriptionQueryParams } from './dto/input/subscription.query-params';
import { SubscriptionOutputDto } from './dto/output/subscription.output.dto';
import { GetMySubscriptionsDocs } from './swagger/get.my-subscriptions.swagger';
import { GetUserSubscriptionsQuery } from '../application/use-cases/queries/get-my-subscriptions.use-case';
import { CancelAutoRenewalCommand } from '../application/use-cases/commands/cancel-auto-renewal.usecase';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @CreateSubscriptionDocs()
  @UseGuards(BearerAuthGuard)
  async createSubscription(
    @CurrentUserId() userId: number,
    @Body() dto: CreateSubscriptionInputDto,
  ) {
    const result = await this.commandBus.execute(
      new CreateSubscriptionCommand(
        userId,
        dto.subscriptionPeriod,
        dto.paymentProvider,
        dto.baseUrl,
      ),
    );

    if (result.status !== ResultStatus.Success) {
      switch (result.status) {
        case ResultStatus.Conflict:
          throw new ConflictException(result.errorMessage);
        default:
          throw new InternalServerErrorException(result.errorMessage);
      }
    }

    return { url: result.data };
  }

  @Get('my-payments')
  @GetMyPaymentsDocs()
  @UseGuards(BearerAuthGuard)
  async getMyPayments(
    @Query() query: PaymentQueryParams,
    @CurrentUserId() userId: number,
  ): Promise<BasePaginatedOutputDto<[PaymentOutputDto]>> {
    return this.queryBus.execute(new GetMyPaymentsQuery(userId, query));
  }

  @Get()
  @GetMySubscriptionsDocs()
  @UseGuards(BearerAuthGuard)
  async getMySubscriptions(
    @Query() query: SubscriptionQueryParams,
    @CurrentUserId() userId: number,
  ): Promise<BasePaginatedOutputDto<SubscriptionOutputDto[]>> {
    return this.queryBus.execute(
      new GetUserSubscriptionsQuery({ ...query, userId }),
    );
  }

  @Post('cancel-auto-renewal')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BearerAuthGuard)
  async cancelAutoRenewal(@CurrentUserId() userId: number) {
    try {
      await this.commandBus.execute(new CancelAutoRenewalCommand(userId));
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
