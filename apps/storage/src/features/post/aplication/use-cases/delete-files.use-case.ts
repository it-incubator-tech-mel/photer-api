import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StorageService } from '../services/storage.service';
import { FileMetadataRepository } from '../../infastructure/file-metadata.repository';

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
  ) {}

  async execute({ payload }: DeleteFilesCommand) {
    const { fileUrls, userId } = payload;

    await Promise.all(
      fileUrls.map((url) =>
        this.storageService.deleteFile(this.extractKeyFromUrl(url)),
      ),
    );

    await this.fileMetadataRepository.removeUrlsFromMetadata(userId, fileUrls);

    return { success: true, deletedFiles: fileUrls.length };
  }

  private extractKeyFromUrl(url: string): string {
    const prefix = `https://${this.storageService.endpoint}/${this.storageService.bucket}/`;
    return url.replace(prefix, '');
  }
}
