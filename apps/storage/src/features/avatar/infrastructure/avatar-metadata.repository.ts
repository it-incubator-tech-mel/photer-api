import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AvatarMetadata } from '../mongo.schemas/avatar-metadata.schema';

@Injectable()
export class AvatarMetadataRepository {
  constructor(
    @InjectModel(AvatarMetadata.name)
    private avatarMetadataModel: Model<AvatarMetadata>,
  ) {}

  async create(avatarMetadata: AvatarMetadata): Promise<AvatarMetadata> {
    return this.avatarMetadataModel.create(avatarMetadata);
  }

  async removeAvatarByUrl(url: string): Promise<boolean> {
    const result = await this.avatarMetadataModel.updateOne(
      { fileLocation: url },
      { $set: { isDeleted: true } },
    );

    return result.matchedCount === 1;
  }
}
