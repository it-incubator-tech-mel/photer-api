import { CoreConfig } from './core/config/core.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  appSetup(app);
  // await initRabbitMQ();

  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  const port: number = coreConfig.port;

  await app.listen(port);
}

bootstrap();
