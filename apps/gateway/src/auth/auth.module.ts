import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { OAuthStrategyFactory } from './strategies/oauth-strategy.factory';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn:
            configService.get<string>('JWT_ACCESS_EXPIRATION_TIME') || '15m',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    LocalStrategy,
    OAuthStrategyFactory,
    // Динамический провайдер для OAuth стратегий
    {
      provide: 'OAUTH_STRATEGIES',
      useFactory: (factory: OAuthStrategyFactory) => {
        const logger = new Logger('OAuthStrategiesFactory');
        const strategies = {};
        const providers = factory.getSupportedProviders();

        logger.log(
          `Initializing OAuth strategies for providers: ${providers.join(', ')}`,
        );

        providers.forEach((provider) => {
          try {
            strategies[provider] = factory.createStrategy(provider);
            logger.log(
              `✅ OAuth strategy for ${provider} created successfully`,
            );
          } catch (error) {
            logger.error(
              `❌ Failed to create OAuth strategy for ${provider}:`,
              error.message,
            );
            // Не падаем при ошибке создания стратегии, продолжаем с другими
          }
        });

        return strategies;
      },
      inject: [OAuthStrategyFactory],
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
