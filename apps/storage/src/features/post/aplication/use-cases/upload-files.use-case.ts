import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StorageService } from '../services/storage.service';
import { FileMetadataRepository } from '../../infastructure/file-metadata.repository';
import { FileMetadata } from '../../mongo.schemas/file-metadata.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export class UploadFilesCommand {
  constructor(
    public readonly payload: {
      files: {
        buffer: any;
        originalName: string;
        mimetype: string;
      }[];
      userId: number;
    },
  ) {}
}

@CommandHandler(UploadFilesCommand)
export class UploadFilesUseCase implements ICommandHandler<UploadFilesCommand> {
  constructor(
    private readonly storageService: StorageService,
    @InjectModel(FileMetadata.name)
    private readonly fileMetadataModel: Model<FileMetadata>,
    private readonly fileMetadataRepository: FileMetadataRepository,
  ) {}

  async execute({ payload }: UploadFilesCommand) {
    const { files, userId } = payload;

    const locations = await Promise.all(
      files.map((file) =>
        this.storageService.uploadFile(
          Buffer.from(file.buffer.data),
          file.mimetype,
          userId,
          file.originalName,
        ),
      ),
    );

    // locations [
    //   {
    //     key: 'files/2/2025-04-24/1745492242330-468.jpg',
    //     location: 'https://storage.yandexcloud.net/my-test-123/files/2/2025-04-24/1745492242330-468.jpg',
    //     etag: '"e9226429c4b0abd21f8f8535ba762eef"'
    //   },
    //   {
    //     key: 'files/2/2025-04-24/1745492242333-324.jpg',
    //     location: 'https://storage.yandexcloud.net/my-test-123/files/2/2025-04-24/1745492242333-324.jpg',
    //     etag: '"e9226429c4b0abd21f8f8535ba762eef"'
    //   }
    // ]

    await this.saveFileMetadata(locations, userId);

    const fileUrls: string[] = locations.map((loc) => loc.location);

    return {
      fileUrls,
      userId,
    };
  }

  async saveFileMetadata(
    fileLocations: { location: string; key: string; etag: string }[],
    userId: number,
  ): Promise<void> {
    const savePromises = fileLocations.map(async ({ location, key, etag }) => {
      const fileMetadata = new this.fileMetadataModel({
        fileLocation: location,
        fileKey: key,
        etag,
        userId,
      });

      await this.fileMetadataRepository.create(fileMetadata);
    });

    await Promise.all(savePromises);
  }
}
