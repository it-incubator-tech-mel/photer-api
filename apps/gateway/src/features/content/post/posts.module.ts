import { Module, Provider } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsController } from './api/posts.controller';
import { CreatePostUseCase } from './aplication/use-case/create-post.use-case';
import { PostRepository } from './infrastructure/post.repository';
import { PhotoRepository } from './infrastructure/photo.repository';
import { PostQueryRepository } from './infrastructure/posts.query-repository';
import { DeletePostUseCase } from './aplication/use-case/delete-post.use-case';
import { UpdatePostUseCase } from './aplication/use-case/update-post.use-case';
import { StorageMicroserviceConfig } from '../../../core/config/storage-microservice.config';
import { CqrsModule } from '@nestjs/cqrs';

const useCases: Provider[] = [
  CreatePostUseCase,
  DeletePostUseCase,
  UpdatePostUseCase,
];

const repos: Provider[] = [
  PostRepository,
  PostQueryRepository,
  PhotoRepository,
];

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
  ],
  controllers: [PostsController],
  providers: [...useCases, ...repos],
  exports: [PostQueryRepository],
})
export class PostsModule {}
