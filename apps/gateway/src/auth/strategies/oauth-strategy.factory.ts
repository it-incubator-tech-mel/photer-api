import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UniversalOAuthStrategy } from './universal-oauth.strategy';

@Injectable()
export class OAuthStrategyFactory {
  private readonly logger = new Logger(OAuthStrategyFactory.name);

  constructor(private configService: ConfigService) {}

  createStrategy(provider: string): UniversalOAuthStrategy {
    try {
      // Проверяем, поддерживается ли провайдер
      if (!this.getSupportedProviders().includes(provider)) {
        throw new Error(`Unsupported OAuth provider: ${provider}`);
      }

      this.logger.log(`Creating OAuth strategy for provider: ${provider}`);

      // Создаем универсальную стратегию с указанным провайдером
      return new UniversalOAuthStrategy(this.configService, provider);
    } catch (error) {
      this.logger.error(
        `Failed to create OAuth strategy for ${provider}:`,
        error.message,
      );
      throw error;
    }
  }

  getSupportedProviders(): string[] {
    return ['google', 'github'];
  }
}
