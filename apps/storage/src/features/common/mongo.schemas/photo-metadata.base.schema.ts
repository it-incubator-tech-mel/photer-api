import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class PhotoMetadataBase {
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
