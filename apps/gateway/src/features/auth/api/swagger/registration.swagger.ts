import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../../core/swagger/api-error/error-response.dto';

export function RegistrationSwaggerDocs() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Registration in the system. Email will be send to passed email address',
    }),
    ApiResponse({
      status: 204,
      description:
        'Input data is accepted. Email with confirmation code will be send to passed email address',
    }),
    ApiResponse({
      status: 400,
      description:
        'If the inputModel has incorrect values (in particular if the user with the given email or username already exists',
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
