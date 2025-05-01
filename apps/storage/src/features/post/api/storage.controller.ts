import { BadRequestException, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { plainToInstance } from 'class-transformer';
import { UploadFilesInputDto } from './dto/input/upload-file.input.dto';
import { validate } from 'class-validator';
import { UploadFilesCommand } from '../aplication/use-cases/upload-files.use-case';
import { DeleteFilesCommand } from '../aplication/use-cases/delete-files.use-case';

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
    console.log(1);
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

  @MessagePattern({ cmd: 'deleteFiles' })
  async deleteFiles(payload: { fileUrls: string[]; userId: number }) {
    return this.commandBus.execute(new DeleteFilesCommand(payload));
  }
}
