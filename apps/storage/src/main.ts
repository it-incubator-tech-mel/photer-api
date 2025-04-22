import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage.module';
import {
  MicroserviceOptions,
  TcpOptions,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { INestMicroservice } from '@nestjs/common';

async function bootstrap() {
  // const configService = new ConfigService<any, true>();
  // const host: string = configService.get<string>('STORAGE_TCP_HOST');
  // const port: number = configService.get<number>('STORAGE_TCP_PORT');
  // console.log(host);
  // console.log(port);

  const transportTCP: TcpOptions = {
    transport: Transport.TCP,
    options: {
      // host: host,
      // port: port,
      host: 'localhost',
      port: 3004,
    },
  };

  const app: INestMicroservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      StorageModule,
      transportTCP,
    );

  await app.listen();
}
bootstrap();
