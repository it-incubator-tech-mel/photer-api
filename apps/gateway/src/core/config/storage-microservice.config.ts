import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNumber, IsString } from 'class-validator';
import { configValidation } from './config-validation';

@Injectable()
export class StorageMicroserviceConfig {
  constructor(private configService: ConfigService<any, true>) {
    configValidation.validateConfig(this);
  }

  @IsString({
    message:
      'Set Env variable STORAGE_TCP_HOST, example: file-storage-service.photer-ltd',
  })
  tcpHost: string = this.configService.get<string>('STORAGE_TCP_HOST');

  @IsNumber({}, { message: 'Set Env variable STORAGE_TCP_PORT, example: 3830' })
  tcpPort: number = Number(this.configService.get('STORAGE_TCP_PORT'));
}
