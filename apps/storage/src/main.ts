import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const RABBITMQ_URL =
    'amqps://gxiiwfbk:t4hYrGI_EYvl3sf_bSdk5U5VS7uTa63P@rat.rmq2.cloudamqp.com/gxiiwfbk';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StorageModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue: 'new_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
