import { CoreConfig } from './core/config/core.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // Разрешаем все домены
    methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.use(
      cors({
        origin: ['https://photer.ltd/api/v1/auth/oauth/google', 'https://photer.ltd/api/v1/auth/oauth/github'],
      })
  )

  appSetup(app);

  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  const port: number = coreConfig.port;

  await app.listen(port);
}
bootstrap();
