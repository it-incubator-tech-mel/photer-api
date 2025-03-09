import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configValidation } from './config-validation';
import { IsString } from 'class-validator';

@Injectable()
export class CaptchaConfig {
  constructor(private configService: ConfigService<any, true>) {
    // console.log('in CaptchaConfig', configService);
    configValidation.validateConfig(this);
  }

  @IsString({
    message: 'Set Env variable CAPTCHA_SECRET, example: my_secret',
  })
  captchaSecret: string = this.configService.get<string>('CAPTCHA_SECRET');
}