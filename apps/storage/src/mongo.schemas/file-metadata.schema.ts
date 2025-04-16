import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'file_metadata' })
export class FileMetadata extends Document {
  @Prop({ required: true })
  s3Key: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  userId: number;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);
