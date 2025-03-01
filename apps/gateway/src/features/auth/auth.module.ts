import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UserRepository } from './infrastructure/users.repository';
import { ConfirmRegistrationUseCase } from './application/use-cases/confirm-registration.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import { NewPasswordCase } from './application/use-cases/new-password.use-case';
import { JwtConfig } from '../../core/config/jwt.config';
import { DeviceModule } from '../devices/device.module';
import { CryptoModule } from '../../core/services/crypto/crypto.module';
import { MailerModule } from '../../core/services/mailler/mailer.module';
import { DeviceRepository } from '../devices/infrastructure/device.repository';
import { JwtStrategy } from '../../core/strategies/bearer.strategies';
import { LogoutCase } from './application/use-cases/logout.use-case';
import { RefreshTokenCase } from './application/use-cases/refreshToken.use-case';
import { RefreshTokenRepo } from './infrastructure/refreshToken.repository';
import { ReCaptchaModule } from '../../core/services/reCaptcha/reCaptcha.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from '../../core/services/jwt/jwt-token.service';

const useCases: Provider[] = [
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  LogoutCase,
  RefreshTokenCase,
  LoginUseCase,
  NewPasswordCase,
];

const repos: Provider[] = [
  UserRepository,
  DeviceRepository,
  RefreshTokenRepo,
];

const strategies: Provider[] = [
  JwtStrategy,
];

const services: Provider[] = [
  JwtTokenService
];

@Module({
  imports: [
    CqrsModule,
    // ConfigModule, // global
    MailerModule,
    CryptoModule,
    ReCaptchaModule,
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
  exports: [],
})
export class AuthModule {
}