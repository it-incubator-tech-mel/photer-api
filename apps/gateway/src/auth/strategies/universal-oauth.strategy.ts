import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UniversalOAuthStrategy extends PassportStrategy(
  Strategy,
  'universal-oauth',
) {
  constructor(
    private configService: ConfigService,
    private provider: string,
  ) {
    // Получаем конфигурацию для конкретного провайдера
    const config = UniversalOAuthStrategy.getProviderConfig(provider);

    // Проверяем наличие обязательных параметров
    if (!config.clientID || !config.clientSecret) {
      console.warn(
        `⚠️  OAuth credentials for ${provider} not found. Using mock values for development.`,
      );
      // Используем mock значения для разработки
      config.clientID = `mock-${provider}-client-id`;
      config.clientSecret = `mock-${provider}-client-secret`;
    }

    super({
      authorizationURL: config.authorizationURL,
      tokenURL: config.tokenURL,
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackURL,
      scope: config.scope,
      state: true, // Добавляем state для безопасности
    });
  }

  // Статический метод для получения конфигурации провайдера
  private static getProviderConfig(provider: string) {
    // Используем process.env напрямую для статического метода
    const env = process.env;

    switch (provider) {
      case 'google':
        return {
          authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenURL: 'https://oauth2.googleapis.com/token',
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            env.GOOGLE_CALLBACK_URL ||
            'http://localhost:3001/api/v1/auth/oauth/google/callback',
          scope: ['email', 'profile'],
        };
      case 'github':
        return {
          authorizationURL: 'https://github.com/login/oauth/authorize',
          tokenURL: 'https://github.com/login/oauth/access_token',
          clientID: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          callbackURL:
            env.GITHUB_CALLBACK_URL ||
            'http://localhost:3001/api/v1/auth/oauth/github/callback',
          scope: ['user:email'],
        };
      default:
        throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    // Добавляем провайдер в профиль для идентификации
    profile.provider = this.provider;
    done(null, profile);
  }
}
