import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Создаем HTTP приложение
  const app = await NestFactory.create<NestExpressApplication>(PaymentsModule);
  const configService = app.get(ConfigService);

  // Middleware для обработки сырых тел запросов (для вебхуков Stripe)
  app.use(bodyParser.raw({ type: 'application/json', limit: '10mb' }));

  // Подключаем RabbitMQ микросервис
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'payments_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  // Запускаем HTTP сервер
  const port = configService.get('PAYMENTS_TCP_PORT') || 3005;
  await app.listen(port);
  console.log(`Payments service is running on port ${port}`);

  // const configService = new ConfigService();
  //
  // const app: INestMicroservice = await NestFactory.createMicroservice(
  //   PaymentsModule,
  //   {
  //     transport: Transport.RMQ,
  //     options: {
  //       urls: [configService.get('RABBITMQ_URL')],
  //       queue: 'payments_queue',
  //       queueOptions: {
  //         durable: true,
  //       },
  //     },
  //   },
  // );
  //
  // await app.listen();
}
bootstrap();
