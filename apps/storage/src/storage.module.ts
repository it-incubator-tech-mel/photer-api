import { Module } from '@nestjs/common';
import { FileStorageController } from './features/file/api/file-storage.controller';
import { ConfigModule } from './core/config/config.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FileMetadataRepository } from './features/file/infrastructure/file-metadata.repository';
import { UploadFilesUseCase } from './features/file/application/use-cases/upload-files.use-case';
import {
  FileMetadata,
  FileMetadataSchema,
} from './mongo.schemas/file-metadata.schema';
import { S3StorageService } from './features/file/application/services/s3-storage.service';

const services = [S3StorageService];
const useCases = [UploadFilesUseCase];
const repos = [FileMetadataRepository];

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        uri: config.get('MONGODB_URL'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: FileMetadata.name,
        schema: FileMetadataSchema,
      },
    ]),
  ],
  controllers: [FileStorageController],
  providers: [...services, ...useCases, ...repos],
})
export class StorageModule {}
