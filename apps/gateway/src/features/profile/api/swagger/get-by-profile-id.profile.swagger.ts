import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileOutputDto } from '../dto/output/profile.output.dto';

export function GetByProfileIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get public profile for user by profile id',
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
