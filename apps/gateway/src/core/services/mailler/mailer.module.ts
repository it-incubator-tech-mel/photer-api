import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerConfig } from '../../config/mailer.config';
import { ConfigModule } from '../../config/config.module';

@Module({
  providers: [MailerService, ConfigModule],
  exports: [MailerService],
})
export class MailerModule {}
