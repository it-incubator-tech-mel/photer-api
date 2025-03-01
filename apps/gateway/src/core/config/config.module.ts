import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { CoreConfig } from './core.config';
import { MailerConfig } from './mailer.config';
import { JwtConfig } from './jwt.config';
import {CaptchaConfig} from "./captcha.config";

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({ // <-- Перенесли сюда
      envFilePath: [
        process.env.ENV_FILE_PATH?.trim() || '',
        `.env.${process.env.ENV_TYPE}.local`,
        `.env.${process.env.ENV_TYPE}`,
        '.env.production',
      ],
      isGlobal: true,
    }),
  ],
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