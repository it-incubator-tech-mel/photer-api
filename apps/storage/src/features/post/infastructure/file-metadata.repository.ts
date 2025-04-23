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

  async saveFileMetadata(
    fileLocations: string[],
    userId: number,
  ): Promise<FileMetadata> {
    const fileMetadata = new this.fileMetadataModel({
      fileLocations,
      userId,
    });

    return fileMetadata.save();
  }

  async removeUrlsFromMetadata(userId: number, urls: string[]) {
    return this.fileMetadataModel
      .updateOne({ userId }, { $pullAll: { fileLocations: urls } })
      .exec();
  }
}
