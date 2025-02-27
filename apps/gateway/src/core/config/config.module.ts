import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreConfig } from './core.config';
import { MailerConfig } from './mailer.config';
import { JwtConfig } from './jwt.config';
import {CaptchaConfig} from "./captcha.config";

@Global()
@Module({
  providers: [
    {
      provide: CoreConfig,
      useFactory: (configService: ConfigService<any, true>) => new CoreConfig(configService),
      inject: [ConfigService],
    },
    {
      provide: MailerConfig,
      useFactory: (configService: ConfigService<any, true>) => new MailerConfig(configService),
      inject: [ConfigService],
    },
    {
      provide: JwtConfig,
      useFactory: (configService: ConfigService<any, true>) => new JwtConfig(configService),
      inject: [ConfigService],
    },
    {
      provide: CaptchaConfig,
      useFactory: (configService: ConfigService<any, true>) => new CaptchaConfig(configService),
      inject: [ConfigService],
    }
  ],
  exports: [CoreConfig, MailerConfig, JwtConfig, CaptchaConfig],
})
export class ConfigModule {}