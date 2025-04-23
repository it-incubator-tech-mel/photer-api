import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsController } from './api/posts.controller';
import { CreatePostUseCase } from './aplication/use-case/create-post.use-case';
import { PostRepository } from './infrastructure/post.repository';
import { PhotoRepository } from './infrastructure/photo.repository';
import { StorageMicroserviceConfig } from '../../core/config/storage-microservice.config';
import { PostQueryRepository } from './infrastructure/posts.query.repository';

const useCases: Provider[] = [CreatePostUseCase];

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
            // host: 'localhost',
            // port: 3004,
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
