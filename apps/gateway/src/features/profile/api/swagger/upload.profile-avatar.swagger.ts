import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UploadAvatarOutputDto } from '../dto/output/upload-avatar.output.dto';

export function UploadProfileAvatarDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload profile avatar' }),
    ApiResponse({
      status: 201,
      description: 'Returns the newly created avatar link',
      type: UploadAvatarOutputDto,
    }),
  );
}
