import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UserRepository } from './infrastructure/users.repository';
import { ConfirmRegistrationUseCase } from './application/use-cases/confirm-registration.use-case';
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import {NewPasswordCase, NewPasswordCommand} from "./application/use-cases/new-password.use-case";

import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '../../core/config/jwt.config';
import { DeviceModule } from '../devices/device.module';
import { JwtServiceProvider } from '../../core/services/jwt/jwt-service-provider.service';
import { CryptoModule } from '../../core/services/crypto/crypto.module';
import { MailerModule } from '../../core/services/mailler/mailer.module';
import {DeviceRepository} from "../devices/infrastructure/device.repository";
import {JwtStrategy} from "../../core/strategies/bearer.strategies";
import {LogoutCase} from "./application/use-cases/logout.use-case";
import {RefreshTokenCase} from "./application/use-cases/refreshToken.use-case";
import {RefreshTokenRepo} from "./infrastructure/refreshToken.repository";
import {ReCaptchaProvider} from "./domain/reCaptcha.adapter";
import {CaptchaConfig} from "../../core/config/captcha.config";
import {GoogleStrategy} from "./domain/google.strategy";
import {PassportModule} from "@nestjs/passport";
import {GithubStrategy} from "./domain/github.strategy";

const useCases: Provider[] = [
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  LogoutCase,
  NewPasswordCommand,
  RefreshTokenCase,
  LoginUseCase,
  NewPasswordCase,
];

const repos: Provider[] = [
  UserRepository,
  DeviceRepository,
  RefreshTokenRepo
];

const strategies: Provider[] = [
  JwtStrategy,
  GoogleStrategy,
  GithubStrategy,
];

const services: Provider[] = [
  JwtServiceProvider,
  ReCaptchaProvider
];

@Module({
  imports: [
    PassportModule,
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