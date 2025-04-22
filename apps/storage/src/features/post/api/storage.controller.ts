import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { UploadFilesInputDto } from './dto/input/upload-file.input.dto';
import { validate } from 'class-validator';
import { UploadFilesCommand } from '../aplication/use-cases/upload-files.use-case';

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
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.commandBus.execute(new UploadFilesCommand(dto));
  }
}
