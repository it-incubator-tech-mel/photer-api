import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PhotoSchema, PostSchemaModel } from '../mongo.schemas/postSchemaModel';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigTPCModule } from './config/config.module';
import { CreatePostUseCase } from '@storage/post/aplication/create-post.use-case';
const schemas = [{ name: PhotoSchema.name, schema: PostSchemaModel }];
const useCases = [CreatePostUseCase];
const services = [StorageService];

@Module({
  imports: [
    ConfigTPCModule,
    CqrsModule,
    MongooseModule.forRoot(
      'mongodb://photerappit:OK7nHIfpS2M39ySS@ac-9v46s2k-shard-00-00.cq5urvl.mongodb.net:27017,ac-9v46s2k-shard-00-01.cq5urvl.mongodb.net:27017,ac-9v46s2k-shard-00-02.cq5urvl.mongodb.net:27017/?ssl=true&replicaSet=atlas-h5soo7-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0',
    ),
    MongooseModule.forFeature([...schemas]),
  ],
  controllers: [StorageController],
  providers: [...useCases, ...services],
})
export class StorageModule {}
