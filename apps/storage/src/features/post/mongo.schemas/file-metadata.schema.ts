import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class FileMetadata {
  @Prop({ required: true })
  fileLocation: string;

  @Prop({ required: true })
  fileKey: string;

  @Prop({ required: true })
  etag: string;

  @Prop({ required: true })
  userId: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);
