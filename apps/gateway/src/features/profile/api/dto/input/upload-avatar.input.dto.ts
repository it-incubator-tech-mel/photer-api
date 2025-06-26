import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class UploadAvatarInputDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Avatar image file',
    required: true,
  })
  file: Express.Multer.File;
}
