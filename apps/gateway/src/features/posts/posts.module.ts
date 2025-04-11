import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsController } from './api/posts.controller';
import { ConfigService } from '@nestjs/config';
import { CreatePostUseCase } from './aplication/use-case/create-post.use-case';
import { GetMyProfileUseCase } from './aplication/use-case/get-my-profile';
import { GetAllPostsUseCase } from './aplication/use-case/get-all-posts.use-case';
import { PostRepository } from './infrastructure/post.repository';

const useCases: Provider[] = [
  GetAllPostsUseCase,
  GetMyProfileUseCase,
  CreatePostUseCase,
];
const repos: Provider[] = [PostRepository];
// const configService = new ConfigService<any, true>();
// const portForTPC = configService.get<number>('TCP');
const configService = new ConfigService<any, true>();
const portForTCP = configService.get<number>('PORT_TCP');
const host = configService.get('HOST_NAME_TCP');
@Module({
  imports: [
    // MulterModule.register({ dest: './uploads' }),
    CqrsModule,
    ClientsModule.register([
      {
        name: 'STORAGE_POST_SERVICE',
        transport: Transport.TCP,
        options: { host: host, port: portForTCP },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [...useCases, ...repos],
  exports: [],
})
export class PostsModule {}
