import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StorageService } from '../../../common/services/storage.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AvatarMetadata } from '../../mongo.schemas/avatar-metadata.schema';
import { AvatarMetadataRepository } from '../../infrastructure/avatar-metadata.repository';

export class UploadAvatarCommand {
  constructor(
    public readonly payload: {
      file: {
        buffer: { type: 'Buffer'; data: number[] };
        originalName: string;
        mimetype: string;
      };
      userId: number;
    },
  ) {}
}

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarUseCase
  implements ICommandHandler<UploadAvatarCommand>
{
  constructor(
    private readonly storageService: StorageService,
    @InjectModel(AvatarMetadata.name)
    private readonly avatarMetadataModel: Model<AvatarMetadata>,
    private readonly avatarMetadataRepository: AvatarMetadataRepository,
  ) {}

  async execute({ payload }: UploadAvatarCommand): Promise<{
    fileUrl: string;
    userId: number;
  }> {
    const { file, userId } = payload;

    const location: { key: string; location: string; etag: string } =
      await this.storageService.uploadFile(
        Buffer.from(file.buffer.data),
        file.mimetype,
        userId,
        file.originalName,
        'avatars',
      );

    // location {
    // 		key: 'avatars/37/2025-06-24/1750774778239-940.jpg',
    // 		location: 'https://storage.yandexcloud.net/my-test-123/avatars/37/2025-06-24/1750774778239-940.jpg',
    // 		etag: '"355794d2934ea852195acbf72d27a610"'
    // }

    await this.saveAvatarMetadataToDb(location, userId);

    const fileUrl: string = location.location;

    return {
      fileUrl,
      userId,
    };
  }

  async saveAvatarMetadataToDb(
    avatarLocation: { location: string; key: string; etag: string },
    userId: number,
  ): Promise<void> {
    const fileMetadata = new this.avatarMetadataModel({
      fileLocation: avatarLocation.location,
      fileKey: avatarLocation.key,
      etag: avatarLocation.etag,
      userId,
    });

    await this.avatarMetadataRepository.create(fileMetadata);
  }
}
