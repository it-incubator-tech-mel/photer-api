import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { AvatarController } from './api/avatar.controller';
import { UploadAvatarUseCase } from './application/use-cases/upload-avatar.use-case';
import {
  AvatarMetadata,
  AvatarMetadataSchema,
} from './mongo.schemas/avatar-metadata.schema';
import { DeleteAvatarUseCase } from './application/use-cases/delete-avatar.use-case';
import { AvatarMetadataRepository } from './infrastructure/avatar-metadata.repository';
import { CommonModule } from '../common/common.module';

const useCases = [UploadAvatarUseCase, DeleteAvatarUseCase];
const repos = [AvatarMetadataRepository];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: AvatarMetadata.name, schema: AvatarMetadataSchema },
    ]),
    CommonModule,
  ],
  controllers: [AvatarController],
  providers: [...useCases, ...repos],
})
export class AvatarModule {}
