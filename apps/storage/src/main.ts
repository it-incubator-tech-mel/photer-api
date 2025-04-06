import { NestFactory } from '@nestjs/core';
import { StorageModule } from './storage.module';
import {
  MicroserviceOptions,
  TcpOptions,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const configService = new ConfigService<any, true>();
  const portForTPC = configService.get<number>('PORT_TCP');

  // const RABBITMQ_URL =
  //   'amqps://gxiiwfbk:t4hYrGI_EYvl3sf_bSdk5U5VS7uTa63P@rat.rmq2.cloudamqp.com/gxiiwfbk';
  const transportTCP: TcpOptions = {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3830,
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StorageModule,
    transportTCP,
  );
  await app.listen();
}
bootstrap();
