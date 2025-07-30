import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CreateSubscriptionInputDto } from './dto/input/create-subscription.input.dto';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSubscriptionCommand } from '../application/use-cases/create-subscription.usecase';
import {
  ConflictException,
  InternalServerErrorException,
} from '../../../core/exception-filters/exceptions/exception-types';
import { CreateSubscriptionDocs } from './swagger/create.subscription.swagger';
import { ResultStatus } from '../../../../base/notification/notification';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
