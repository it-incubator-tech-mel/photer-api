import { NestFactory } from '@nestjs/core';
import { AppModule } from '../gateway/src/app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [
        'amqps://gxiiwfbk:t4hYrGI_EYvl3sf_bSdk5U5VS7uTa63P@rat.rmq2.cloudamqp.com/gxiiwfbk',
      ],
      queue: 'your_queue_name', // Укажите вашу очередь
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.listen();
}

bootstrap();
