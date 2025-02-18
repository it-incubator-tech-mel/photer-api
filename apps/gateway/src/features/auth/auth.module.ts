import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { MailerModule } from '../../core/services/mailler/mailer.module';
import { CryptoModule } from '../../core/services/crypto/crypto.module';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UserRepository } from './infrastructure/users.repository';
import { ConfigModule } from '../../core/config/config.module';
import { ConfirmRegistrationUseCase } from './application/use-cases/confirm-registration.use-case';
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { DeviceRepository } from "./infrastructure/device.repository";
import { JwtStrategy } from "./strategies/bearer.strategies";
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';


const useCases: Provider[] = [
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  LoginUseCase,
];

const repos: Provider[] = [
  UserRepository,
  DeviceRepository
]

const strategies: Provider[] = [
  JwtStrategy
]

@Module({
  imports: [CqrsModule, MailerModule, CryptoModule, ConfigModule],
  controllers: [AuthController],
  providers: [...useCases, ...repos, ...strategies],
  exports: []
})
export class AuthModule {}