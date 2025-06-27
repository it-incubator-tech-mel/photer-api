import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { PostPhotoMetadataRepository } from './infastructure/post-photo.metadata.repository';
import {
  PostPhotoMetadata,
  PostPhotoMetadataSchema,
} from './mongo.schemas/post-photo-metadata.schema';
import { PostPhotosController } from './api/post-photos.controller';
import { UploadPostPhotoUseCase } from './application/use-cases/post-photo.upload.use-case';
import { DeletePostPhotoUseCase } from './application/use-cases/post-photo.delete.use-case';
import { CommonModule } from '../common/common.module';

const useCases = [UploadPostPhotoUseCase, DeletePostPhotoUseCase];

const repos = [PostPhotoMetadataRepository];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: PostPhotoMetadata.name, schema: PostPhotoMetadataSchema },
    ]),
    CommonModule,
  ],
  controllers: [PostPhotosController],
  providers: [...useCases, ...repos],
})
export class PostPhotoModule {}
