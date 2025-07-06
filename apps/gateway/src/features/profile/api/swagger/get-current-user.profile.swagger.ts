import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileOutputDto } from '../dto/output/profile.output.dto';

export function GetCurrentUserProfileDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get profile of the currently authenticated user',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: ProfileOutputDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized – Bearer token required',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
