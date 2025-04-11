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
  const portForTCP = configService.get<number>('PORT_TCP');
  const host = configService.get('STORAGE_POST_SERVICE');

  const transportTCP: TcpOptions = {
    transport: Transport.TCP,
    options: {
      host: host || '0.0.0.0',
      port: portForTCP | 3830,
    },
  };

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    StorageModule,
    transportTCP,
  );
  await app.listen();
}
bootstrap();
