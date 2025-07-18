import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { BearerAuthGuard } from '../../../core/guards/bearer-auth.guard';
import { CurrentUserId } from '../../../core/decorators/param-decorators/current-user-id.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSubscriptionCommand } from '../application/use-cases/create-subscription.usecase';
import { BadRequestException } from '../../../core/exception-filters/exceptions/exception-types';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(BearerAuthGuard)
  async createSubscription(
    @CurrentUserId() userId: number,
    @Body() dto: CreateSubscriptionDto,
  ) {
    try {
      const sessionUrl = await this.commandBus.execute(
        new CreateSubscriptionCommand(
          userId,
          dto.subscriptionPeriod,
          dto.paymentProvider,
          dto.baseUrl,
        ),
      );

      return { url: sessionUrl };
    } catch (error) {
      console.log('createSubscription', error.message);
      throw new BadRequestException([
        {
          field: 'paymentProvider',
          message: 'Something went wrong when subscribing',
        },
      ]);
    }
  }
}
