import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AvatarMetadata } from '../mongo.schemas/avatar-metadata.schema';

@Injectable()
export class avatarMetadataRepository {
  constructor(
    @InjectModel(AvatarMetadata.name)
    private avatarMetadataModel: Model<AvatarMetadata>,
  ) {}

  async create(avatarMetadata: AvatarMetadata): Promise<AvatarMetadata> {
    return this.avatarMetadataModel.create(avatarMetadata);
  }

  async removeAvatarsByKeys(userId: number, keys: string[]) {
    return this.avatarMetadataModel.updateMany(
      { userId, fileLocation: { $in: keys } },
      { $set: { isDeleted: true } },
    );
  }
}
