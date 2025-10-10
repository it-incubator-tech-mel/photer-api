import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../../core/swagger/api-error/error-response.dto';

export function RegistrationEmailResendingDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Resend confirmation registration email if user exists',
    }),
    ApiResponse({
      status: 204,
      description:
        'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as base-input-query-params param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
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
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
