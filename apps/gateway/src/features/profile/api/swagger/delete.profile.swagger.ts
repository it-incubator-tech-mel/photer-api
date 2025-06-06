import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete your profile for testing' }),
    ApiResponse({
      status: 204,
      description: 'No Content',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
