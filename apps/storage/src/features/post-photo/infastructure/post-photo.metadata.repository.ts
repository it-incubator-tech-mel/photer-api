import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostPhotoMetadata } from '../mongo.schemas/post-photo-metadata.schema';

@Injectable()
export class PostPhotoMetadataRepository {
  constructor(
    @InjectModel(PostPhotoMetadata.name)
    private fileMetadataModel: Model<PostPhotoMetadata>,
  ) {}

  async create(fileMetadata: PostPhotoMetadata): Promise<PostPhotoMetadata> {
    return this.fileMetadataModel.create(fileMetadata);
  }

  async removeFilesByKeys(
    userId: number,
    keys: string[],
  ): Promise<{ deletedCount: number }> {
    const result = await this.fileMetadataModel.updateMany(
      { userId, fileLocation: { $in: keys } },
      { $set: { isDeleted: true } },
    );

    return { deletedCount: result.modifiedCount };
  }
}
