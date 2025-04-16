import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { INestMicroservice } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const configService = new ConfigService<any, true>();
  const host: string = configService.get<string>('HOST');
  const port: number = configService.get<number>('PORT_TCP');
  console.log(host);
  console.log(port);

  const app: INestMicroservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(StorageModule, {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: 3004,
      },
    });
  await app.listen();
}
bootstrap();
