import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { PhotoMetadataBase } from '../../common/mongo.schemas/photo-metadata.base.schema';

@Schema()
export class PostPhotoMetadata extends PhotoMetadataBase {}

export const PostPhotoMetadataSchema =
  SchemaFactory.createForClass(PostPhotoMetadata);
