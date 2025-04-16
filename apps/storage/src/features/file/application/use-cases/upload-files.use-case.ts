import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FileMetadataRepository } from '../../infrastructure/file-metadata.repository';
import { S3StorageService } from '../services/s3-storage.service';

export interface FileWithBuffer {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export class UploadFilesCommand {
  constructor(
    public readonly payload: {
      files: FileWithBuffer[];
      userId: number;
    },
  ) {}
}

@CommandHandler(UploadFilesCommand)
export class UploadFilesUseCase implements ICommandHandler<UploadFilesCommand> {
  constructor(
    private readonly s3StorageService: S3StorageService,
    private readonly fileMetadataRepository: FileMetadataRepository,
  ) {}

  async execute(command: UploadFilesCommand) {
    const { files, userId } = command.payload;

    // {url, s3Key} []
    const uploadResults = await Promise.all(
      files.map((file) => this.s3StorageService.uploadFile(file, userId)),
    );

    await Promise.all(
      uploadResults.map((result, index) =>
        this.fileMetadataRepository.saveFileMetadata({
          s3Key: result.s3Key,
          originalName: files[index].originalname,
          mimeType: files[index].mimetype,
          userId,
        }),
      ),
    );

    return uploadResults.map((r) => r.url); // https://storage.yandexcloud.net/my-test-123/files/2/2025-04-16/2025-04-16-1735.jpg
  }
}
