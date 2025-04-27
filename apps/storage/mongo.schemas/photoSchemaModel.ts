import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<PhotoSchema>;

@Schema()
export class PhotoSchema {
  @Prop()
  photoLink: string[];
  @Prop()
  userId: number;
}

export const PhotoSchemaModel = SchemaFactory.createForClass(PhotoSchema);
