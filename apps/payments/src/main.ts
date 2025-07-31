import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(PaymentsModule, {
    bodyParser: false, // Disabling automatic body parsing
  });

  const configService = app.get(ConfigService);

  // Only this route uses raw body (Buffer)
  app.use(
    '/api/v1/stripe/webhook',
    express.raw({
      type: 'application/json',
      verify: (req: any, res, buf: Buffer) => {
        req.rawBody = buf; // save Buffer in rawBody
      },
    }),
  );

  // Important: other routes can use the json parser, but only after the raw route
  app.use(express.json());

  // Connecting RMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('RABBITMQ_URL')],
      queue: 'payments_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false, // It is better to set false for RPC so that you can explicitly ack/nack
    },
  });

  app.setGlobalPrefix('api/v1');

  await app.startAllMicroservices();
  await app.listen(configService.get('PAYMENTS_TCP_PORT') || 3005);
  console.log(`✅ Payments service running on port ${await app.getUrl()}`);
}

bootstrap();
