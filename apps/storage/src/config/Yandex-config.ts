import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IsString } from 'class-validator';
import { configValidationOnTCP } from './config-validation-TCP';

@Injectable()
export class YandexConfig {
  constructor(private configService: ConfigService<any, true>) {
    // console.log('in CaptchaConfig', configService);
    configValidationOnTCP.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable SECRET_KEY_YANDEX, example: SECRET_KEY_YANDEX',
  })
  yandexSecret: string = this.configService.get<string>('SECRET_KEY_YANDEX');
  @IsString({
    message: 'Set Env variable ACCESS_KEY_YANDEX, example: ACCESS_KEY_YANDEX',
  })
  yandexAccess: string = this.configService.get<string>('ACCESS_KEY_YANDEX');
}
