import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadAvatarOutputDto } from '../dto/output/upload-avatar.output.dto';
import { UploadAvatarInputDto } from '../dto/input/upload-avatar.input.dto';

export function UploadProfileAvatarDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Upload profile avatar' }),
    ApiBody({
      description: 'Multipart form data for post creation',
      required: true,
      type: UploadAvatarInputDto,
    }),
    ApiConsumes('multipart/form-data'),
    ApiResponse({
      status: 201,
      description: 'Returns the newly created avatar link',
      type: UploadAvatarOutputDto,
    }),
  );
}
