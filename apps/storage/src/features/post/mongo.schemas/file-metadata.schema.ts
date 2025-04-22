import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class FileMetadata {
  @Prop({ required: true })
  fileLocations: string[];

  @Prop({ required: true })
  userId: number;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);
