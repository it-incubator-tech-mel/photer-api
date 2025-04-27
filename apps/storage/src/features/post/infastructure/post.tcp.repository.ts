import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PhotoSchema } from '../../../../mongo.schemas/photoSchemaModel';
import { Model } from 'mongoose';

@Injectable()
export class PostTcpRepository {
  constructor(
    @InjectModel(PhotoSchema.name) private photoSchemaModel: Model<PhotoSchema>,
  ) {}
  async addPhotoArrayInMongoDB(
    photo: string[],
    userId: number,
  ): Promise<PhotoSchema> {
    const createdCat = new this.photoSchemaModel({
      photoLink: photo,
      userId: userId,
    });
    return createdCat.save();
  }
}
