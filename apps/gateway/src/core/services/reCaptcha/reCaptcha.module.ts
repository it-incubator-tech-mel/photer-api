import { Module } from '@nestjs/common';
import { ConfigModule } from '../../config/config.module';
import { ReCaptchaService } from './reCaptcha.service';

@Module({
  providers: [ReCaptchaService, ConfigModule],
  exports: [ReCaptchaService],
})
export class ReCaptchaModule {}