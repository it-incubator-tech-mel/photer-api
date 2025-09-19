import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionOutputDto } from './dto/subscription-output.dto';
import { PaymentOutputDto } from './dto/payment-output.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Subscriptions')
@Controller('api/v1/subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment subscription' })
  @ApiBody({ type: CreateSubscriptionDto })
  @ApiResponse({
    status: 200,
    description: 'Payment session created successfully',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://your-app.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – Bearer token required or invalid',
  })
  @ApiResponse({
    status: 409,
    description: 'Subscription already active',
  })
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: any,
  ): Promise<{ url: string }> {
    const userId = req.user?.userId;
    return this.subscriptionsService.createSubscription(
      createSubscriptionDto,
      userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscriptions' })
  @ApiQuery({
    name: 'pageNumber',
    description: 'Page number',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Number of items per page',
    required: false,
    type: Number,
    example: 8,
  })
  @ApiQuery({
    name: 'sortDirection',
    description: 'Sorting direction',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'The sorting field',
    required: false,
    type: String,
    example: 'createdAt',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/SubscriptionOutputDto' },
        },
        totalCount: { type: 'number', example: 100 },
        pagesCount: { type: 'number', example: 10 },
        page: { type: 'number', example: 1 },
        pageSize: { type: 'number', example: 8 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – Bearer token required or invalid',
  })
  async getAllSubscriptions(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 8,
    @Query('sortDirection') sortDirection: 'asc' | 'desc' = 'desc',
    @Query('sortBy') sortBy: string = 'createdAt',
  ) {
    return this.subscriptionsService.getAllSubscriptions(
      pageNumber,
      pageSize,
      sortDirection,
      sortBy,
    );
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payments' })
  @ApiQuery({
    name: 'pageNumber',
    description: 'Page number',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    description: 'Number of items per page',
    required: false,
    type: Number,
    example: 8,
  })
  @ApiQuery({
    name: 'sortDirection',
    description: 'Sorting direction',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'sortBy',
    description: 'The sorting field',
    required: false,
    type: String,
    example: 'dateOfPayment',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { $ref: '#/components/schemas/PaymentOutputDto' },
        },
        totalCount: { type: 'number', example: 100 },
        pagesCount: { type: 'number', example: 10 },
        page: { type: 'number', example: 1 },
        pageSize: { type: 'number', example: 8 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – Bearer token required or invalid',
  })
  async getUserPayments(
    @Query('pageNumber') pageNumber: number = 1,
    @Query('pageSize') pageSize: number = 8,
    @Query('sortDirection') sortDirection: 'asc' | 'desc' = 'desc',
    @Query('sortBy') sortBy: string = 'dateOfPayment',
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    return this.subscriptionsService.getUserPayments(
      userId,
      pageNumber,
      pageSize,
      sortDirection,
      sortBy,
    );
  }

  @Post('cancel-auto-renewal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel auto-renewal for active subscription' })
  @ApiResponse({
    status: 204,
    description: 'Auto-renewal successfully disabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – Bearer token required or invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'Active subscription not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Auto-renewal already disabled or failed to disable in the payment provider',
  })
  async cancelAutoRenewal(@Req() req: any): Promise<void> {
    const userId = req.user?.userId;
    return this.subscriptionsService.cancelAutoRenewal(userId);
  }

  @Post('enable-auto-renewal')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable auto-renewal' })
  @ApiResponse({
    status: 204,
    description: 'Auto-renewal successfully enabled',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized – Bearer token required or invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'Active subscription not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Auto-renewal is already enabled or cannot be enabled',
  })
  async enableAutoRenewal(@Req() req: any): Promise<void> {
    const userId = req.user?.userId;
    return this.subscriptionsService.enableAutoRenewal(userId);
  }
}
