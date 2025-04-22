import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StorageService } from '../services/storage.service';
import { FileMetadataRepository } from '../../infastructure/file-metadata.repository';
import { FileMetadata } from '../../mongo.schemas/file-metadata.schema';

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

    const fileLinks: string[] = locations.map((loc) => loc.location[0]);

    const savedMeta: FileMetadata =
      await this.fileMetadataRepository.saveFileMetadata(fileLinks, userId);

    return {
      fileUrls: savedMeta.fileLocations,
      userId: savedMeta.userId,
    };
  }
}
