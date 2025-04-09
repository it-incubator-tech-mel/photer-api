import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configValidation } from '../../../gateway/src/core/config/config-validation';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Environments } from '../../../gateway/src/core/config/core.config';

@Injectable()
export class CoreTpcConfig {
  constructor(private configService: ConfigService<any, true>) {
    // console.log('in CoreConfig', configService);
    configValidation.validateConfig(this);
  }

  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3830',
    },
  )
  portForTCP: number = Number(this.configService.get('PORT_TCP'));

  @IsEnum(Environments, {
    message:
      'Ser correct ENV_TYPE value, available values: ' +
      configValidation.getEnumValues(Environments).join(', '),
  })
  env: string = this.configService.get('ENV_TYPE');
}
