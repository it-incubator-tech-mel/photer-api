import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PostsController } from './api/posts.controller';
import { PostsService } from './api/posts.service';
import { PostsSenderController } from '../../../../microservice.messageBroker/sender/posts.sender';

@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'POSTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://gxiiwfbk:t4hYrGI_EYvl3sf_bSdk5U5VS7uTa63P@rat.rmq2.cloudamqp.com/gxiiwfbk',
          ],
          queue: 'your_queue_name', // Убедитесь, что это совпадает с вашим микросервисом
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsSenderController],
  exports: [],
})
export class PostsModule {}
