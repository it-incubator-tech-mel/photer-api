import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileOutputDto } from '../dto/output/profile.output.dto';

export function GetProfileByUserIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get profile by user id',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      type: ProfileOutputDto,
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
    }),
  );
}
