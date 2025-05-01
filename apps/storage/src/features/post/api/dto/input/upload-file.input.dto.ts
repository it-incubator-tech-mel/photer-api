import { IsArray, IsInt, IsMimeType, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { IsBuffer } from '../../../../../core/validators/is-buffer.validator';

class UploadFileDto {
  @IsBuffer()
  buffer: Buffer;

  @IsNotEmpty()
  originalName: string;

  @IsMimeType()
  mimetype: string;
}

export class UploadFilesInputDto {
  @IsArray()
  @Type(() => UploadFileDto)
  files: UploadFileDto[];

  @IsInt()
  userId: number;
}
