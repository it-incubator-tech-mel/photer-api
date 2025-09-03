import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../../core/swagger/api-error/error-response.dto';

export function RegistrationConfirmationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirm registration' }),
    ApiResponse({
      status: 204,
      description: 'Email was verified. Account was activated',
    }),
    ApiResponse({
      status: 400,
      description:
        'If the confirmation code is incorrect, expired or already been applied',
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
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
