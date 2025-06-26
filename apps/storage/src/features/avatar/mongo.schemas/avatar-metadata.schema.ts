import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { PhotoMetadataBase } from '../../common/mongo.schemas/photo-metadata.base.schema';

@Schema()
export class AvatarMetadata extends PhotoMetadataBase {}

export const AvatarMetadataSchema =
  SchemaFactory.createForClass(AvatarMetadata);
