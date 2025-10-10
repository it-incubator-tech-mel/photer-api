import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../../core/swagger/api-error/error-response.dto';

export function PasswordRecoveryDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Password recovery via Email confirmation. Email should be send with RecoveryCode inside',
    }),
    ApiResponse({
      status: 204,
      description:
        'Email with confirmation code will be send to passed email address',
    }),
    ApiResponse({
      status: 400,
      description:
        'If the inputModel has invalid email (for example 222^gmail.com)',
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
      status: 404,
      description: 'If user with this email does not exist',
    }),
    ApiResponse({
      status: 429,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}
