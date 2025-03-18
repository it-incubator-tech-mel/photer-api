import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './application/use-cases/registration.use-case';
import { UserRepository } from './infrastructure/users.repository';
import { ConfirmRegistrationUseCase } from './application/use-cases/confirm-registration.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegistrationEmailResendingUseCase } from './application/use-cases/registration-email-resending.use-case';
import { NewPasswordUseCase } from './application/use-cases/new-password.use-case';
import { JwtConfig } from '../../core/config/jwt.config';
import { DeviceModule } from '../devices/device.module';
import { CryptoModule } from '../../core/services/crypto/crypto.module';
import { MailerModule } from '../../core/services/mailler/mailer.module';
import { DeviceRepository } from '../devices/infrastructure/device.repository';
import { ReCaptchaModule } from '../../core/services/reCaptcha/reCaptcha.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokenService } from '../../core/services/jwt/jwt-token.service';
import { LocalStrategy } from '../../core/strategies/local.strategy';
import { AuthService } from './application/services/auth-service';
import { PasswordRecoveryUseCase } from './application/use-cases/password-recovery.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refreshToken.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { UserQueryRepository } from './infrastructure/users.query-repository';
import { BearerStrategy } from '../../core/strategies/bearer.strategies';
import { RefreshTokenStrategy } from '../../core/strategies/refresh-token.strategy';
import { GoogleStrategy } from '../../core/strategies/google.strategy';
import { OAuthUseCase } from './application/use-cases/oauth.use-case';
import { OAuthAccountRepository } from './infrastructure/oauth-account.repository';
import { GitHubStrategy } from '../../core/strategies/github.strategy';

const useCases: Provider[] = [
  RegistrationUseCase,
  ConfirmRegistrationUseCase,
  RegistrationEmailResendingUseCase,
  PasswordRecoveryUseCase,
  NewPasswordUseCase,
  LoginUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  OAuthUseCase,
];

const repos: Provider[] = [
  UserRepository,
  UserQueryRepository,
  DeviceRepository,
  OAuthAccountRepository,
];

const strategies: Provider[] = [
  BearerStrategy,
  LocalStrategy,
  RefreshTokenStrategy,
  GoogleStrategy,
  GitHubStrategy,
];

const services: Provider[] = [
  AuthService,
  JwtTokenService,
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