import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { UploadFilesInputDto } from './dto/input/upload-post-photo.input.dto';
import { validate, ValidationError } from 'class-validator';
import { UploadPostPhotoCommand } from '../application/use-cases/post-photo.upload.use-case';
import { DeletePostPhotoCommand } from '../application/use-cases/post-photo.delete.use-case';

@Controller()
export class PostPhotosController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern({ cmd: 'uploadFiles' })
  async uploadPostPhoto(payload: {
    files: {
      buffer: Buffer;
      originalName: string;
      mimetype: string;
    }[];
    userId: number;
  }) {
    const dto: UploadFilesInputDto = plainToInstance(
      UploadFilesInputDto,
      payload,
    );

    const errors: ValidationError[] = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.commandBus.execute(new UploadPostPhotoCommand(dto));
  }

  @MessagePattern({ cmd: 'deleteFiles' })
  async deletePostPhotos(payload: { fileUrls: string[]; userId: number }) {
    return this.commandBus.execute(new DeletePostPhotoCommand(payload));
  }
}
