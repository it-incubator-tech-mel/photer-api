import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StorageService } from '../../../common/services/storage.service';
import { PostPhotoMetadataRepository } from '../../infastructure/post-photo.metadata.repository';
import { S3ClientConfig } from '../../../../config/s3-client.config';

export class DeletePostPhotoCommand {
  constructor(
    public readonly payload: {
      fileUrls: string[];
      userId: number;
    },
  ) {}
}

@CommandHandler(DeletePostPhotoCommand)
export class DeletePostPhotoUseCase
  implements ICommandHandler<DeletePostPhotoCommand>
{
  constructor(
    private readonly storageService: StorageService,
    private readonly fileMetadataRepository: PostPhotoMetadataRepository,
    private readonly s3ClientConfig: S3ClientConfig,
  ) {}

  async execute({ payload }: DeletePostPhotoCommand) {
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
    const { deletedCount } =
      await this.fileMetadataRepository.removeFilesByKeys(userId, fileUrls);

    return {
      deletedLength: deletedCount,
    };
  }

  private extractKeyFromUrl(url: string): string {
    // url https://storage.yandexcloud.net/my-test-123/files/2/2025-04-24/1745502769706-331.jpg
    // prefix https://storage.yandexcloud.net/my-test-123/
    const prefix: string = `${this.s3ClientConfig.endpoint}/${this.s3ClientConfig.bucketName}/`;
    return url.replace(prefix, '');
  }
}
