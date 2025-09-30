import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OAuthStrategyFactory } from '../src/auth/strategies/oauth-strategy.factory';
import { GoogleStrategy } from '../src/auth/strategies/google.strategy';
import { GithubStrategy } from '../src/auth/strategies/github.strategy';

describe('OAuthStrategyFactory', () => {
  let factory: OAuthStrategyFactory;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        GOOGLE_CLIENT_ID: 'google-client-id',
        GOOGLE_CLIENT_SECRET: 'google-client-secret',
        GOOGLE_CALLBACK_URL: 'http://localhost:3001/auth/google/callback',
        GITHUB_CLIENT_ID: 'github-client-id',
        GITHUB_CLIENT_SECRET: 'github-client-secret',
        GITHUB_CALLBACK_URL: 'http://localhost:3001/auth/github/callback',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OAuthStrategyFactory,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    factory = module.get<OAuthStrategyFactory>(OAuthStrategyFactory);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('createStrategy', () => {
    it('should create GoogleStrategy for google provider', () => {
      const strategy = factory.createStrategy('google');
      expect(strategy).toBeInstanceOf(GoogleStrategy);
    });

    it('should create GithubStrategy for github provider', () => {
      const strategy = factory.createStrategy('github');
      expect(strategy).toBeInstanceOf(GithubStrategy);
    });

    it('should throw error for unsupported provider', () => {
      expect(() => factory.createStrategy('facebook')).toThrow(
        'Unsupported OAuth provider: facebook',
      );
    });

    it('should throw error for empty provider', () => {
      expect(() => factory.createStrategy('')).toThrow(
        'Unsupported OAuth provider: ',
      );
    });

    it('should throw error for null provider', () => {
      expect(() => factory.createStrategy(null)).toThrow(
        'Unsupported OAuth provider: null',
      );
    });

    it('should throw error for undefined provider', () => {
      expect(() => factory.createStrategy(undefined)).toThrow(
        'Unsupported OAuth provider: undefined',
      );
    });
  });

  describe('getSupportedProviders', () => {
    it('should return array of supported providers', () => {
      const providers = factory.getSupportedProviders();
      expect(providers).toEqual(['google', 'github']);
      expect(providers).toHaveLength(2);
    });

    it('should return array with correct order', () => {
      const providers = factory.createStrategy('google');
      expect(providers).toBeInstanceOf(GoogleStrategy);
    });
  });

  describe('Strategy Configuration', () => {
    it('should use correct config values for google', () => {
      const strategy = factory.createStrategy('google');
      expect(strategy).toBeInstanceOf(GoogleStrategy);

      // Проверяем, что ConfigService был вызван с правильными ключами
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_SECRET');
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CALLBACK_URL');
    });

    it('should use correct config values for github', () => {
      const strategy = factory.createStrategy('github');
      expect(strategy).toBeInstanceOf(GithubStrategy);

      // Проверяем, что ConfigService был вызван с правильными ключами
      expect(configService.get).toHaveBeenCalledWith('GITHUB_CLIENT_ID');
      expect(configService.get).toHaveBeenCalledWith('GITHUB_CLIENT_SECRET');
      expect(configService.get).toHaveBeenCalledWith('GITHUB_CALLBACK_URL');
    });
  });

  describe('Error Handling', () => {
    it('should handle case-sensitive provider names', () => {
      expect(() => factory.createStrategy('Google')).toThrow(
        'Unsupported OAuth provider: Google',
      );
      expect(() => factory.createStrategy('GITHUB')).toThrow(
        'Unsupported OAuth provider: GITHUB',
      );
    });

    it('should handle special characters in provider names', () => {
      expect(() => factory.createStrategy('google-oauth')).toThrow(
        'Unsupported OAuth provider: google-oauth',
      );
      expect(() => factory.createStrategy('github_oauth')).toThrow(
        'Unsupported OAuth provider: github_oauth',
      );
    });
  });
});
