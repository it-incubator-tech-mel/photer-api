import { CoreConfig } from './config/core.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  const port: number = coreConfig.port;

  await app.listen(port);
}
bootstrap();
