import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsController } from './api/posts.controller';
import { GetAllPostsUseCase } from '@posts/aplication/use-case/get-all-posts.use-case';
import { PostRepository } from '@posts/infrastructure/post.repository';
import { GetMyProfileUseCase } from '@posts/aplication/use-case/get-my-profile';
import { CreatePostUseCase } from '@posts/aplication/use-case/create-post.use-case';
import { MulterModule } from '@nestjs/platform-express';
import { StorageModule } from '../../../../storage/src/storage.module';
import { StorageService } from '../../../../storage/src/storage.service';

const useCases: Provider[] = [
  GetAllPostsUseCase,
  GetMyProfileUseCase,
  CreatePostUseCase,
];
const repos: Provider[] = [PostRepository];

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    CqrsModule,
    StorageModule,
    ClientsModule.register([
      {
        name: 'STORAGE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://gxiiwfbk:t4hYrGI_EYvl3sf_bSdk5U5VS7uTa63P@rat.rmq2.cloudamqp.com/gxiiwfbk',
          ],
          queue: 'new_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [...useCases, ...repos, StorageService],
  exports: [],
})
export class PostsModule {}
