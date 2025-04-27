import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StorageService } from '../services/storage.service';
import { FileMetadataRepository } from '../../infastructure/file-metadata.repository';
import { S3ClientConfig } from '../../../../config/s3-client.config';

export class DeleteFilesCommand {
  constructor(
    public readonly payload: {
      fileUrls: string[];
      userId: number;
    },
  ) {}
}

@CommandHandler(DeleteFilesCommand)
export class DeleteFilesUseCase implements ICommandHandler<DeleteFilesCommand> {
  constructor(
    private readonly storageService: StorageService,
    private readonly fileMetadataRepository: FileMetadataRepository,
    private readonly s3ClientConfig: S3ClientConfig,
  ) {}

  async execute({ payload }: DeleteFilesCommand) {
    const { fileUrls, userId } = payload;

    // [
    //   'https://storage.yandexcloud.net/my-test-123/files/2/2025-04-24/1745502769706-331.jpg',
    //   'https://storage.yandexcloud.net/my-test-123/files/2/2025-04-24/1745502769705-392.jpg'
    // ]
    // userId 2

    await Promise.all(
      fileUrls.map((url) =>
        this.storageService.deleteFile(this.extractKeyFromUrl(url)),
      ),
    );

    await this.fileMetadataRepository.removeFilesByKeys(userId, fileUrls);

    return fileUrls.length;
  }

  private extractKeyFromUrl(url: string): string {
    // url https://storage.yandexcloud.net/my-test-123/files/2/2025-04-24/1745502769706-331.jpg
    // prefix https://storage.yandexcloud.net/my-test-123/
    const prefix: string = `${this.s3ClientConfig.endpoint}/${this.s3ClientConfig.bucketName}/`;
    return url.replace(prefix, '');
  }
}
