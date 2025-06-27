import { Module, Provider } from '@nestjs/common';
import { ProfileController } from './api/profile.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ProfileRepository } from './infrastructure/profile.repository';
import { ProfileQueryRepository } from './infrastructure/profile.query-repository';
import { CreateProfileUseCase } from './application/use-case/create-profile.use-case';
import { UpdateProfileUseCase } from './application/use-case/update-profile.use-case';
import { UserModule } from '../user/user.module';
import { DeleteProfileUseCase } from './application/use-case/delete-profile.use-case';
import { UploadAvatarUseCase } from './application/use-case/upload-avatar.use-case';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { StorageMicroserviceConfig } from '../../core/config/storage-microservice.config';
import { DeleteOldAvatarEventHandler } from '../content/post/aplication/use-case/old-avatar-delete.event';

const useCases: Provider[] = [
  CreateProfileUseCase,
  UpdateProfileUseCase,
  DeleteProfileUseCase,
  UploadAvatarUseCase,
  DeleteOldAvatarEventHandler,
];

const repos: Provider[] = [ProfileRepository, ProfileQueryRepository];
@Module({
  imports: [
    CqrsModule,
    ClientsModule.registerAsync([
      {
        name: 'STORAGE_POST_SERVICE',
        inject: [StorageMicroserviceConfig],
        useFactory: (config: StorageMicroserviceConfig) => ({
          transport: Transport.TCP,
          options: {
            host: config.tcpHost,
            port: config.tcpPort,
          },
        }),
      },
    ]),
    UserModule,
  ],
  controllers: [ProfileController],
  providers: [...repos, ...useCases],
})
export class ProfileModule {}
