import { applyDecorators } from '@nestjs/common';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../../core/swagger/api-error/error-response.dto';

export function UpdateProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update existing profile ' }),
    ApiResponse({
      status: 204,
      description: 'No Content',
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
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({
      status: 403,
      description: 'If try to update profile  of other user',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
