import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginatedSubscriptionOutputDto } from '../dto/output/paginated-subscription.output.dto';
import { SubscriptionOutputDto } from '../dto/output/subscription.output.dto';

export function GetMySubscriptionsDocs() {
  return applyDecorators(
    ApiSecurity('bearer'),
    ApiExtraModels(SubscriptionOutputDto, PaginatedSubscriptionOutputDto),
    ApiOperation({
      summary: 'Get subscriptions',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Success',
      schema: { $ref: getSchemaPath(PaginatedSubscriptionOutputDto) },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized – Bearer token required or invalid',
    }),
  );
}
