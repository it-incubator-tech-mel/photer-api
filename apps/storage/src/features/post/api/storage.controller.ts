import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import {
  UploadFileInputDto,
  UploadFilesInputDto,
} from './dto/input/upload-file.input.dto';
import { validate, ValidationError } from 'class-validator';
import { UploadFilesCommand } from '../aplication/use-cases/upload-files.use-case';
import { DeleteFilesCommand } from '../aplication/use-cases/delete-files.use-case';
import { UploadAvatarCommand } from '../aplication/use-cases/upload-avatar.use-case';

@Controller()
export class StorageController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern({ cmd: 'uploadFiles' })
  async upload(payload: {
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

    return this.commandBus.execute(new UploadFilesCommand(dto));
  }

  @MessagePattern({ cmd: 'deleteFiles' })
  async deleteFiles(payload: { fileUrls: string[]; userId: number }) {
    return this.commandBus.execute(new DeleteFilesCommand(payload));
  }

  @MessagePattern({ cmd: 'uploadAvatar' })
  async uploadAvatar(payload: {
    files: {
      buffer: { type: 'Buffer'; data: number[] };
      originalName: string;
      mimetype: string;
    };
    userId: number;
  }) {
    // converts payload object into instance of the UploadFilesInputDto class
    const dto: UploadFileInputDto = plainToInstance(
      UploadFileInputDto,
      payload,
    );

    // validate dto using class-validator
    const errors: ValidationError[] = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.commandBus.execute(new UploadAvatarCommand(dto));
  }
}
