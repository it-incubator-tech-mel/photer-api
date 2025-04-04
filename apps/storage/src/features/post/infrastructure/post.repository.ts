import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PostSchema,
  PostDocument,
} from '../../../../mongo.schemas/postSchemaModel';
import { CreatePostDto } from '@posts/api/dto/input/create-post.dto';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel(PostSchema.name) private postModel: Model<PostDocument>,
  ) {}
  async findAllPosts(): Promise<PostSchema[]> {
    return this.postModel.find().sort({ createdAt: -1 }).exec();
  }
  async getAllMyPosts(): Promise<PostSchema[]> {
    return this.postModel.find().exec();
  }
  async createPost(
    createPostDto: CreatePostDto,
    userInfo: any,
  ): Promise<PostSchema[]> {
    return this.postModel.find().exec();
  }
}
