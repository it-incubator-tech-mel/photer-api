import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CoreConfig } from './core.config';
import { MailerConfig } from './mailer.config';

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
    }
  ],
  exports: [CoreConfig, MailerConfig],
})
export class ConfigModule {}