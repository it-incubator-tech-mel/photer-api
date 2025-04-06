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
import { CoreConfig } from '../../core/config/core.config';
import { ConfigService } from '@nestjs/config';

const useCases: Provider[] = [
  GetAllPostsUseCase,
  GetMyProfileUseCase,
  CreatePostUseCase,
];
const repos: Provider[] = [PostRepository];
const configService = new ConfigService<any, true>();
const portForTPC = configService.get<number>('PORT_TPC');
@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    CqrsModule,
    StorageModule,
    ClientsModule.register([
      // {
      //   name: 'STORAGE_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: [
      //       'amqps://gxiiwfbk:t4hYrGI_EYvl3sf_bSdk5U5VS7uTa63P@rat.rmq2.cloudamqp.com/gxiiwfbk',
      //     ],
      //     queue: 'new_queue',
      //     queueOptions: {
      //       durable: true,
      //     },
      //   },
      // },
      {
        name: 'STORAGE_POST_SERVICE',
        transport: Transport.TCP,
        options: { host: '0.0.0.0', port: portForTPC },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [...useCases, ...repos],
  exports: [],
})
export class PostsModule {}
