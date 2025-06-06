import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetUsersCount() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get total users count',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: Number,
    }),
  );
}
