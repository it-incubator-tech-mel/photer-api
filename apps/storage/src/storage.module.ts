import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema, PostSchemaModel } from '../mongo.schemas/postSchemaModel';
import { GetAllPostsUseCase } from '@storage/post/application/use-case/get-all-posts.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { GetMyProfileUseCase } from '@storage/post/application/use-case/get-my-profile';
import { CreatePostUseCase } from '@storage/post/application/use-case/create-post.use-case';
import { PostRepository } from '@storage/post/infrastructure/post.repository';
const schemas = [{ name: PostSchema.name, schema: PostSchemaModel }];
@Module({
  imports: [
    CqrsModule,
    MongooseModule.forRoot(
      'mongodb://photerappit:OK7nHIfpS2M39ySS@ac-9v46s2k-shard-00-00.cq5urvl.mongodb.net:27017,ac-9v46s2k-shard-00-01.cq5urvl.mongodb.net:27017,ac-9v46s2k-shard-00-02.cq5urvl.mongodb.net:27017/?ssl=true&replicaSet=atlas-h5soo7-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0',
    ),
    MongooseModule.forFeature([...schemas]),
  ],
  controllers: [StorageController],
  providers: [
    StorageService,
    GetAllPostsUseCase,
    GetMyProfileUseCase,
    CreatePostUseCase,
    PostRepository,
  ],
})
export class StorageModule {}
