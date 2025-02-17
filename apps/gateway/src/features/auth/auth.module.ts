import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { MailerModule } from '../../core/services/mailler/mailer.module';
import { CryptoModule } from '../../core/services/crypto/crypto.module';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UserRepository } from './infrastructure/users.repository';

const useCases: Provider[] = [RegistrationUseCase];
const repos = [UserRepository]

@Module({
  imports: [CqrsModule, MailerModule, CryptoModule],
  controllers: [AuthController],
  providers: [...useCases, ...repos],
  exports: []
})
export class AuthModule {}