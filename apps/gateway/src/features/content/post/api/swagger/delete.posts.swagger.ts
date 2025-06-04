import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeletePostDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'delete post by id' }),
    ApiResponse({
      status: 204,
      description: 'No Content',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 403,
      description: 'If try to delete post of other user',
    }),

    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
