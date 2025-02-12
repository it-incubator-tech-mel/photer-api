import { Global, Module } from '@nestjs/common';
import { CoreConfig } from './core.config';
import { MailerConfig } from './mailer.config';
import { ConfigService } from '@nestjs/config';

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
    }],
  exports: [CoreConfig, MailerConfig],
})
export class PrismaModule {}