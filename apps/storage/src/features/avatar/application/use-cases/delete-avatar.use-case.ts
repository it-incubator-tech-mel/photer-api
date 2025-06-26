import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StorageService } from '../../../common/services/storage.service';
import { S3ClientConfig } from '../../../../config/s3-client.config';
import { AvatarMetadataRepository } from '../../infrastructure/avatar-metadata.repository';

export class DeleteAvatarCommand {
  constructor(
    public readonly payload: {
      fileUrl: string;
    },
  ) {}
}

@CommandHandler(DeleteAvatarCommand)
export class DeleteAvatarUseCase
  implements ICommandHandler<DeleteAvatarCommand>
{
  constructor(
    private readonly storageService: StorageService,
    private readonly avatarMetadataRepository: AvatarMetadataRepository,
    private readonly s3ClientConfig: S3ClientConfig,
  ) {}

  async execute({ payload }: DeleteAvatarCommand) {
    const { fileUrl } = payload;

    // 'https://storage.yandexcloud.net/my-test-123/files/2/2025-04-24/1745502769705-392.jpg'

    await this.storageService.deleteFile(this.extractKeyFromUrl(fileUrl));
    const result: boolean =
      await this.avatarMetadataRepository.removeAvatarByUrl(fileUrl);
    if (!result) {
      return { isDeleted: false };
    }

    return { isDeleted: true };
  }

  private extractKeyFromUrl(url: string): string {
    // url https://storage.yandexcloud.net/my-test-123/files/2/2025-04-24/1745502769706-331.jpg
    // prefix https://storage.yandexcloud.net/my-test-123/
    const prefix: string = `${this.s3ClientConfig.endpoint}/${this.s3ClientConfig.bucketName}/`;
    return url.replace(prefix, '');
  }
}
