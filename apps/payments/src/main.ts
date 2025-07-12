import { NestFactory } from '@nestjs/core';
import { PaymentsModule } from './payments.module';
import * as bodyParser from 'body-parser';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplication<any> = await NestFactory.create(PaymentsModule);

  // For processing Stripe webhooks
  app.use(
    bodyParser.raw({
      type: 'application/json',
      limit: '10mb',
    }),
  );

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
