import { Module } from '@nestjs/common';
import { StorageService } from './features/post/aplication/storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PhotoSchema,
  PhotoSchemaModel,
} from '../mongo.schemas/photoSchemaModel';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigTPCModule } from './config/config.module';
import { CreatePostUseCase } from './features/post/aplication/create-post.use-case';
import { PostTcpRepository } from './features/post/infastructure/post.tcp.repository';
import { ConfigService } from '@nestjs/config';
import { StorageController } from './features/post/api/storage.controller';

const schemas = [{ name: PhotoSchema.name, schema: PhotoSchemaModel }];
const useCases = [CreatePostUseCase];
const services = [StorageService];
const repository = [PostTcpRepository];
const configService = new ConfigService<any, true>();
const mongodbUrl = configService.get<string>('MONGODB_URL');

@Module({
  imports: [
    ConfigTPCModule,
    CqrsModule,
    MongooseModule.forRoot(mongodbUrl),
    MongooseModule.forFeature([...schemas]),
  ],
  controllers: [StorageController],
  providers: [
    ...useCases,
    ...services,
    ...repository,
    // { provide: 'STORAGE_API_URL', useValue: storageUrl },
  ],
})
export class StorageModule {}
