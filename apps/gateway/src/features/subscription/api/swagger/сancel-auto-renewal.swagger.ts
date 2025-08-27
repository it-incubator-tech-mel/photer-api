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
      description: 'Success – auto-renewal disabled',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Active subscription not found',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description:
        'Auto-renewal already canceled or failed to cancel in payments',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized – Bearer token required or invalid',
    }),
  );
}
