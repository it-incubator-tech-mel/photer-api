import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type PostDocument = HydratedDocument<PostSchema>;

@Schema()
export class PostSchema {
  @Prop({ required: true, default: uuidv4 })
  id: string;
  @Prop({ required: false, max: 500 })
  description: string;
  @Prop({ required: true })
  photo: string[];
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userName: string;
  @Prop({ required: true })
  createdAt: Date;
  @Prop({ required: true, default: true })
  status: boolean;
  @Prop({ required: false, default: null })
  updatedAt: Date | null;
  @Prop({ required: false, default: false })
  isDeleted: boolean;
}

export const PostSchemaModel = SchemaFactory.createForClass(PostSchema);
