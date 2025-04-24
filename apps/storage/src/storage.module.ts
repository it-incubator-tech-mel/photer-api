import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from './config/config.module';
import { StorageService } from './features/post/aplication/services/storage.service';
import { UploadFilesUseCase } from './features/post/aplication/use-cases/upload-files.use-case';
import { FileMetadataRepository } from './features/post/infastructure/file-metadata.repository';
import {
  FileMetadata,
  FileMetadataSchema,
} from './features/post/mongo.schemas/file-metadata.schema';
import { CoreConfig } from './config/core.config';
import { StorageController } from './features/post/api/storage.controller';
import { DeleteFilesUseCase } from './features/post/aplication/use-cases/delete-files.use-case';

const services = [StorageService];
const useCases = [UploadFilesUseCase, DeleteFilesUseCase];
const repos = [FileMetadataRepository];

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    MongooseModule.forRootAsync({
      useFactory: async (config: CoreConfig) => ({
        uri: config.mongoUrl,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [CoreConfig],
    }),
    MongooseModule.forFeature([
      { name: FileMetadata.name, schema: FileMetadataSchema },
    ]),
  ],
  controllers: [StorageController],
  providers: [...services, ...useCases, ...repos],
})
export class StorageModule {}
