import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { MailerModule } from '../../core/services/mailler/mailer.module';

@Module({
  imports: [CqrsModule, MailerModule],
  controllers: [AuthController],
  exports: []
})
export class AuthModule {}