import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { CreateSubscriptionOutputDto } from '../dto/output/create-subscription.output.dto';
import { APIErrorResult } from '../../../../core/swagger/api-error/error-response.dto';

export function CreateSubscriptionDocs() {
  return applyDecorators(
    ApiSecurity('bearer'),
    ApiOperation({
      summary: 'Create payment subscription',
      description:
        'The payment subscriptions has been successfully created with status pending, need to pay',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Payment session created successfully',
      type: CreateSubscriptionOutputDto,
    }),
    ApiResponse({
      status: 400,
      description: 'If the inputModel has incorrect values',
      type: APIErrorResult,
      content: {
        'application/json': {
          example: {
            statusCode: 400,
            message: 'Validation failed',
            errorsMessages: [],
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Subscription already active',
      schema: {
        example: {
          statusCode: 409,
          message: 'Subscription already active',
          error: 'Conflict',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized – Bearer token required or invalid',
    }),
  );
}
