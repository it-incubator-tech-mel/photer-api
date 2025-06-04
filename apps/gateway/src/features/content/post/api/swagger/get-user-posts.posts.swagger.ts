import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetAllUserPostsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all user post',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
