import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEnum, IsNumber } from 'class-validator';
import { Environments } from '../../../gateway/src/core/config/core.config';
import { configValidationOnTCP } from './config-validation-TCP';

@Injectable()
export class CoreTpcConfig {
  constructor(private configService: ConfigService<any, true>) {
    // console.log('in CoreConfig', configService);
    configValidationOnTCP.validateConfig(this);
  }

  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3830',
    },
  )
  portForTCP: number = Number(this.configService.get('PORT_TCP'));
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3830',
    },
  )
  mongoDBUrl: number = Number(this.configService.get('PORT_TCP'));

  @IsEnum(Environments, {
    message:
      'Ser correct ENV_TYPE value, available values: ' +
      configValidationOnTCP.getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('ENV_TYPE');
}
