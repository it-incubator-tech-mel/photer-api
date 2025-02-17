import { IsEnum, IsNumber, IsString } from 'class-validator';
import { configValidation } from '../../../../common/config/config-validation';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  constructor(private configService: ConfigService<any, true>) {
    console.log(configService);
    configValidation.validateConfig(this);
  }

  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number = Number(this.configService.get('PORT'));

  @IsEnum(Environments, {
    message:
      'Ser correct ENV_TYPE value, available values: ' +
      configValidation.getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('ENV_TYPE');

  @IsString({
    message: 'Set Env variable BASE_URL, example: https://example.com',
  })
  baseUrl: string = this.configService.get<string>('BASE_URL');
}
