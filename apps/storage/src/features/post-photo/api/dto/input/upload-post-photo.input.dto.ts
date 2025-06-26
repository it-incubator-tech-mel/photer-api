import { IsArray, IsInt, IsMimeType, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBuffer } from '../../../../../core/validators/is-buffer.validator';

class UploadFileDto {
  @IsBuffer()
  buffer: { type: 'Buffer'; data: number[] };

  @IsNotEmpty()
  originalName: string;

  @IsMimeType()
  mimetype: string;
}

export class UploadPostPhotoInputDto {
  @Type(() => UploadFileDto)
  file: UploadFileDto;

  @IsInt()
  userId: number;
}

export class UploadFilesInputDto {
  @IsArray()
  @Type(() => UploadFileDto)
  files: UploadFileDto[];

  @IsInt()
  userId: number;
}
