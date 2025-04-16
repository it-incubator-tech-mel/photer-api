import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileMetadata } from '../../../mongo.schemas/file-metadata.schema';

// buffer serialized to { type: 'Buffer', data: [...] }

@Injectable()
export class FileMetadataRepository {
  constructor(
    @InjectModel(FileMetadata.name)
    private readonly photoModel: Model<FileMetadata>,
  ) {}

  async saveFileMetadata(payload: {
    s3Key: string;
    originalName: string;
    mimeType: string;
    userId: number;
  }): Promise<FileMetadata> {
    const createdPhoto = new this.photoModel(payload);
    return createdPhoto.save();
  }
}
