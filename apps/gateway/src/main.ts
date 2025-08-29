import { CoreConfig } from './core/config/core.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { INestApplication } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Create the main NestJS HTTP app
  const app: INestApplication = await NestFactory.create(AppModule);

  // Apply global app setup (pipes, filters, etc.)
  appSetup(app);

  // Get app config (like port)
  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  const port: number = coreConfig.port;

  // Enable RabbitMQ listener in this app
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'gateway_queue', // listen this queue
      queueOptions: { durable: true },
    },
  });

  // Start all registered microservice transports (including RabbitMQ)
  await app.startAllMicroservices();

  // Start HTTP server
  await app.listen(port);
}

bootstrap();
