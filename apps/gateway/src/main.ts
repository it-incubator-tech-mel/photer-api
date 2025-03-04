import { CoreConfig } from './core/config/core.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { appSetup } from './setup/app.setup';
import { cors } from 'cors';
import passport from "passport";

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  app.enableCors();
  // app.enableCors({
  //   origin: '*', // Разрешаем все домены
  //   methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  //   allowedHeaders: 'Content-Type, Accept, Authorization',
  // });

  appSetup(app);

  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  const port: number = coreConfig.port;

  await app.listen(port);
}
bootstrap();
