import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { UploadFilesCommand } from '../application/use-cases/upload-files.use-case';
import { UploadFilesInputDto } from './dto/upload-files.dto';

@Controller()
export class FileStorageController {
  constructor(private readonly commandBus: CommandBus) {}

  @MessagePattern({ cmd: 'uploadFiles' })
  async handleFileUpload(
    @Payload() payload: UploadFilesInputDto,
    // ): Promise<UploadFilesOutputDto> {
  ): Promise<any> {
    //console.log('payload', payload);

    const convertedFiles = payload.files.map((file) => ({
      ...file,
      buffer: Buffer.from(file.buffer, 'base64'),
    }));

    // console.log(
    //   '🔄 Converted files:',
    //   convertedFiles.map((f) => f),
    // );

    const urls = await this.commandBus.execute(
      new UploadFilesCommand({
        files: convertedFiles,
        userId: payload.userId,
      }),
    );

    return { urls };
  }
}
