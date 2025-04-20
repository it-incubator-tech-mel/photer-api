import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsController } from './api/posts.controller';
import { CreatePostUseCase } from './aplication/use-case/create-post.use-case';
import { GetMyProfileUseCase } from './aplication/use-case/get-my-profile';
import { GetAllPostsUseCase } from './aplication/use-case/get-all-posts.use-case';
import { PostRepository } from './infrastructure/post.repository';
import { PhotoModule } from '../photo/photo.module';
import { PhotoRepository } from '../photo/infrastructure/photo.repository';
import { StorageMicroserviceConfig } from '../../core/config/storage-microservice.config';
import { PostQueryRepository } from './infrastructure/posts.query.repository';

const useCases: Provider[] = [
  GetAllPostsUseCase,
  GetMyProfileUseCase,
  CreatePostUseCase,
];

const repos: Provider[] = [
  PostRepository,
  PostQueryRepository,
  PhotoRepository,
];

@Module({
  imports: [
    CqrsModule,
    PhotoModule,
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
  ],
  controllers: [PostsController],
  providers: [...useCases, ...repos],
  exports: [],
})
export class PostsModule {}
