import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    registration: jest.fn(),
    registrationConfirmation: jest.fn(),
    registrationEmailResending: jest.fn(),
    login: jest.fn(),
    passwordRecovery: jest.fn(),
    passwordRecoveryResending: jest.fn(),
    newPassword: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
    validateOAuthUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('OAuth Endpoints', () => {
    describe('GET /oauth/:provider/login', () => {
      it('should accept valid providers (google)', () => {
        const result = controller.oauthLogin('google');
        expect(result).toEqual({ message: 'Redirecting to google OAuth...' });
      });

      it('should accept valid providers (github)', () => {
        const result = controller.oauthLogin('github');
        expect(result).toEqual({ message: 'Redirecting to github OAuth...' });
      });

      it('should throw BadRequestException for unsupported provider', () => {
        expect(() => controller.oauthLogin('facebook')).toThrow(
          BadRequestException,
        );
        expect(() => controller.oauthLogin('facebook')).toThrow(
          'Unsupported OAuth provider: facebook',
        );
      });

      it('should throw BadRequestException for empty provider', () => {
        expect(() => controller.oauthLogin('')).toThrow(BadRequestException);
      });

      it('should throw BadRequestException for null provider', () => {
        expect(() => controller.oauthLogin(null)).toThrow(BadRequestException);
      });
    });

    describe('GET /oauth/:provider/callback', () => {
      const mockReq = { user: { id: '123', email: 'test@example.com' } };
      const mockRes = {
        redirect: jest.fn(),
      } as any;

      beforeEach(() => {
        mockAuthService.validateOAuthUser.mockResolvedValue({
          accessToken: 'mock-access-token',
        });
        process.env.FRONTEND_URL = 'http://localhost:3000';
      });

      it('should handle google callback successfully', async () => {
        await controller.oauthCallback('google', mockReq, mockRes);

        expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith(
          mockReq.user,
          'google',
        );
        expect(mockRes.redirect).toHaveBeenCalledWith(
          'http://localhost:3000/auth/callback?token=mock-access-token',
        );
      });

      it('should handle github callback successfully', async () => {
        await controller.oauthCallback('github', mockReq, mockRes);

        expect(mockAuthService.validateOAuthUser).toHaveBeenCalledWith(
          mockReq.user,
          'github',
        );
        expect(mockRes.redirect).toHaveBeenCalledWith(
          'http://localhost:3000/auth/callback?token=mock-access-token',
        );
      });

      it('should throw BadRequestException for unsupported provider', async () => {
        await expect(
          controller.oauthCallback('facebook', mockReq, mockRes),
        ).rejects.toThrow(BadRequestException);

        await expect(
          controller.oauthCallback('facebook', mockReq, mockRes),
        ).rejects.toThrow('Unsupported OAuth provider: facebook');
      });

      it('should throw BadRequestException for empty provider', async () => {
        await expect(
          controller.oauthCallback('', mockReq, mockRes),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException for null provider', async () => {
        await expect(
          controller.oauthCallback(null, mockReq, mockRes),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  describe('Supported OAuth Providers', () => {
    it('should support google provider', () => {
      expect(() => controller.oauthLogin('google')).not.toThrow();
      expect(() => controller.oauthLogin('github')).not.toThrow();
    });

    it('should not support other providers', () => {
      const unsupportedProviders = [
        'facebook',
        'twitter',
        'linkedin',
        'microsoft',
      ];

      unsupportedProviders.forEach((provider) => {
        expect(() => controller.oauthLogin(provider)).toThrow(
          `Unsupported OAuth provider: ${provider}`,
        );
      });
    });
  });
});
