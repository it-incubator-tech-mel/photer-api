import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<PhotoSchema>;

@Schema()
export class PhotoSchema {}

export const PostSchemaModel = SchemaFactory.createForClass(PhotoSchema);
