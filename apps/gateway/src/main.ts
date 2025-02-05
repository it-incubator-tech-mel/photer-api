import { CoreConfig } from './config/core.config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  const port: number = coreConfig.port;

  const prisma: PrismaService = app.get(PrismaService);
  const users = await prisma.user.findMany();
  console.log('Пользователи из БД:', users);

  // console.log(port);
  // console.log(coreConfig.env);
  //
  // const databaseConfig: DatabaseConfig = app.get<DatabaseConfig>(DatabaseConfig);
  // console.log(databaseConfig.DB_TYPE);
  // console.log(databaseConfig.DB_HOST);
  // console.log(databaseConfig.DB_NAME);
  // console.log(databaseConfig.DB_USER);
  // console.log(databaseConfig.DB_PASSWORD);

  await app.listen(port);
}
bootstrap();
