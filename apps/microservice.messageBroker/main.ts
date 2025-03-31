import { NestFactory } from '@nestjs/core';

import { Transport } from '@nestjs/microservices';
import { AppModuleBroker } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModuleBroker, {
    transport: Transport.RMQ,
    options: {
      urls: [
        'amqps://gxiiwfbk:t4hYrGI_EYvl3sf_bSdk5U5VS7uTa63P@rat.rmq2.cloudamqp.com/gxiiwfbk',
      ],
      queue: 'your_queue_name',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
}

bootstrap();
