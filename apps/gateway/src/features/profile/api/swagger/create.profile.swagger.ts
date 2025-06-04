import { applyDecorators } from '@nestjs/common';

import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { APIErrorResult } from '../../../../core/swagger/api-error/error-response.dto';
import { ProfileOutputDto } from '../dto/output/profile.output.dto';

export function CreateProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create new profile' }),
    ApiResponse({
      status: 201,
      description: 'Returns the newly created profile',
      type: ProfileOutputDto,
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
  );
}
