import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';

export function EnableAutoRenewalDocs() {
  return applyDecorators(
    ApiSecurity('bearer'),
    ApiOperation({
      summary: 'Enable auto-renewal',
      description:
        "Enables automatic renewal of the user's current active subscription. " +
        'If no active subscription exists or auto-renewal is already enabled, an error will be returned.',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Auto-renewal successfully enabled',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Active subscription not found',
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Auto-renewal is already enabled or cannot be enabled',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized – Bearer token required or invalid',
    }),
  );
}
