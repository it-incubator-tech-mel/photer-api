import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

export function CancelAutoRenewalDocs() {
  return applyDecorators(
    ApiSecurity('bearer'),
    ApiOperation({
      summary: 'Cancel auto-renewal for active subscription',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Auto-renewal successfully disabled',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Active subscription not found',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'Auto-renewal already disabled or failed to disable in the payment provider',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized – Bearer token required or invalid',
    }),
  );
}
