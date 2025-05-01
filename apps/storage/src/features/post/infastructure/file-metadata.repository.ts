import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileMetadata } from '../mongo.schemas/file-metadata.schema';

@Injectable()
export class FileMetadataRepository {
  constructor(
    @InjectModel(FileMetadata.name)
    private fileMetadataModel: Model<FileMetadata>,
  ) {}

  async create(fileMetadata: FileMetadata): Promise<FileMetadata> {
    return this.fileMetadataModel.create(fileMetadata);
  }

  async removeFilesByKeys(userId: number, keys: string[]) {
    return this.fileMetadataModel.updateMany(
      { userId, fileLocation: { $in: keys } },
      { $set: { isDeleted: true } },
    );
  }
}
