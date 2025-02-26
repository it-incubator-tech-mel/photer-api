import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UserRepository } from './infrastructure/user.repository';
import { ConfirmRegistrationUseCase } from './application/use-cases/confirm-registration.use-case';
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { DeviceRepository } from "../devices/infrastructure/device.repository";
import { JwtStrategy } from "../../core/strategies/bearer.strategies";
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../../core/config/jwt.config';
import { DeviceModule } from '../devices/device.module';
import { JwtService } from '../../core/services/jwt/jwt.service';
import { CryptoModule } from '../../core/services/crypto/crypto.module';
import { MailerModule } from '../../core/services/mailler/mailer.module';

const useCases: Provider[] = [
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  LoginUseCase,
];

const repos: Provider[] = [
  UserRepository,
  DeviceRepository
];

const strategies: Provider[] = [
  JwtStrategy
];

const services: Provider[] = [
  JwtService
];

@Module({
  imports: [
    CqrsModule,
    MailerModule,
    // ConfigModule,
    CryptoModule,
    JwtModule.registerAsync({
      useFactory: (jwtConfig: JwtConfig) => {
        const jwtSecret: string = jwtConfig.jwtSecret;
        const jwtAccessExpirationTime: string = jwtConfig.jwtAccessExpirationTime;

        return {
          global: true,
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtAccessExpirationTime,
          },
        };
      },
      inject: [JwtConfig],
    }),
    DeviceModule,
  ],
  controllers: [AuthController],
  providers: [...useCases, ...repos, ...strategies, ...services],
  exports: []
})
export class AuthModule {}