import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsController } from './api/posts.controller';
import { ConfigService } from '@nestjs/config';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { PostRepository } from './infrastructure/post.repository';

const useCases: Provider[] = [CreatePostUseCase];
const repos: Provider[] = [PostRepository];

@Module({
  imports: [
    CqrsModule,
    ClientsModule.registerAsync([
      {
        name: 'STORAGE_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: 'localhost',
            port: 3004,
            timeout: 5000,
            retryAttempts: 3,
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
