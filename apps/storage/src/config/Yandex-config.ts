import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IsString } from 'class-validator';
import { configValidation } from '../../../gateway/src/core/config/config-validation';

@Injectable()
export class YandexConfig {
  constructor(private configService: ConfigService<any, true>) {
    // console.log('in CaptchaConfig', configService);
    configValidation.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable SECRET_KEY_YANDEX, example: SECRET_KEY_YANDEX',
  })
  yandexSecret: string = this.configService.get<string>('SECRET_KEY_YANDEX');
}
