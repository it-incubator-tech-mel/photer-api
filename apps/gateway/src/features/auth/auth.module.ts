import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { MailerModule } from '../../core/services/mailler/mailer.module';
import { CryptoModule } from '../../core/services/crypto/crypto.module';

@Module({
  imports: [CqrsModule, MailerModule, CryptoModule],
  controllers: [AuthController],
  exports: []
})
export class AuthModule {}