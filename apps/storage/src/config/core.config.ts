import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { configValidation } from './config-validation';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  constructor(private configService: ConfigService<any, true>) {
    configValidation.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable STORAGE_TCP_HOST, example: STORAGE_TCP_HOST',
  })
  host: string = this.configService.get<string>('STORAGE_TCP_HOST');

  @IsNumber(
    {},
    {
      message: 'Set Env variable STORAGE_TCP_PORT, example: STORAGE_TCP_PORT',
    },
  )
  port: number = parseInt(this.configService.get<string>('STORAGE_TCP_PORT'));

  @IsString({
    message: 'Set Env variable MONGODB_URL, example: MONGODB_URL',
  })
  mongoUrl: string = this.configService.get<string>('MONGODB_URL');

  @IsEnum(Environments, {
    message:
      'Ser correct ENV_TYPE value, available values: ' +
      configValidation.getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('ENV_TYPE');
}
