import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerConfig } from '../../config/mailer/mailer.config';

@Module({
  providers: [MailerService, MailerConfig],
  exports: [MailerService],
})
export class MailerModule {}
