import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../../core/swagger/api-error/error-response.dto';

export function LoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Try login user to the system' }),
    ApiResponse({
      status: 200,
      description:
        'Returns JWT accessToken (expired after 60 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired 5 minutes).',
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
      status: 401,
      description: 'If the password or login is wrong',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
