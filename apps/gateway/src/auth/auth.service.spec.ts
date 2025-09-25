/**
 * AuthService Unit Tests
 * Tests for authentication service business logic
 */

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { MockFactory, TEST_DATA } from '../../test/utils/mock-factory.util';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let mockPrismaService: jest.Mocked<PrismaService>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendConfirmationEmail: jest.fn(),
            sendPasswordRecoveryEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockPrismaService = module.get(PrismaService);
    mockJwtService = module.get(JwtService);
    mockEmailService = module.get(EmailService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token and user data for valid credentials', async () => {
      // Arrange
      const loginDto = {
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
      };

      const mockUser = MockFactory.createMockUser({
        email: loginDto.email,
        isEmailConfirmed: true,
      });

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('mock_jwt_token');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toEqual({
        accessToken: 'mock_jwt_token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          userName: mockUser.userName,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          avatarPath: mockUser.avatarPath,
        },
      });

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.hashedPassword
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@example.com',
        password: TEST_DATA.VALID_PASSWORD,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      // Arrange
      const loginDto = {
        email: TEST_DATA.VALID_EMAIL,
        password: 'wrong_password',
      };

      const mockUser = MockFactory.createMockUser({
        email: loginDto.email,
        isEmailConfirmed: true,
      });

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.hashedPassword
      );
    });

    it('should throw UnauthorizedException for unconfirmed email', async () => {
      // Arrange
      const loginDto = {
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
      };

      const mockUser = MockFactory.createMockUser({
        email: loginDto.email,
        isEmailConfirmed: false,
      });

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      // Arrange
      const registerDto = {
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
        userName: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-01',
      };

      const hashedPassword = 'hashed_password';
      const confirmationCode = 'confirmation_code';
      const mockUser = MockFactory.createMockUser({
        ...registerDto,
        hashedPassword,
        emailConfirmationCode: confirmationCode,
        isEmailConfirmed: false,
      });

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockEmailService.sendConfirmationEmail.mockResolvedValue(true);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual({
        message: 'Registration successful. Please check your email to confirm your account.',
      });

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: registerDto.email },
            { userName: registerDto.userName },
          ],
        },
      });

      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockEmailService.sendConfirmationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException for existing email', async () => {
      // Arrange
      const registerDto = {
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
        userName: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-01',
      };

      const existingUser = MockFactory.createMockUser({
        email: registerDto.email
      });
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException
      );
    });

    it('should throw ConflictException for existing username', async () => {
      // Arrange
      const registerDto = {
        email: TEST_DATA.VALID_EMAIL,
        password: TEST_DATA.VALID_PASSWORD,
        userName: 'existinguser',
        firstName: 'Test',
        lastName: 'User',
        birthDate: '1990-01-01',
      };

      const existingUser = MockFactory.createMockUser({
        userName: registerDto.userName
      });
      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('confirmEmail', () => {
    it('should successfully confirm email', async () => {
      // Arrange
      const confirmationCode = 'valid_confirmation_code';
      const mockUser = MockFactory.createMockUser({
        emailConfirmationCode: confirmationCode,
        emailConfirmationExpiry: new Date(Date.now() + 3600000), // 1 hour from now
        isEmailConfirmed: false,
      });

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        isEmailConfirmed: true,
        emailConfirmationCode: null,
        emailConfirmationExpiry: null,
      });

      // Act
      const result = await service.confirmEmail({ code: confirmationCode });

      // Assert
      expect(result).toEqual({
        message: 'Email confirmed successfully',
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          isEmailConfirmed: true,
          emailConfirmationCode: null,
          emailConfirmationExpiry: null,
        },
      });
    });

    it('should throw UnauthorizedException for invalid confirmation code', async () => {
      // Arrange
      const confirmationCode = 'invalid_code';
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.confirmEmail({ code: confirmationCode })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired confirmation code', async () => {
      // Arrange
      const confirmationCode = 'expired_code';
      const mockUser = MockFactory.createMockUser({
        emailConfirmationCode: confirmationCode,
        emailConfirmationExpiry: new Date(Date.now() - 3600000), // 1 hour ago
        isEmailConfirmed: false,
      });

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(
        service.confirmEmail({ code: confirmationCode })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('requestPasswordRecovery', () => {
    it('should send password recovery email for existing user', async () => {
      // Arrange
      const email = TEST_DATA.VALID_EMAIL;
      const mockUser = MockFactory.createMockUser({ email });

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockEmailService.sendPasswordRecoveryEmail.mockResolvedValue(true);

      // Act
      const result = await service.requestPasswordRecovery({ email });

      // Assert
      expect(result).toEqual({
        message: 'Password recovery email sent',
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          passwordRecoveryCode: expect.any(String),
          passwordRecoveryExpiry: expect.any(Date),
        },
      });

      expect(mockEmailService.sendPasswordRecoveryEmail).toHaveBeenCalled();
    });

    it('should silently handle non-existent email (security)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.requestPasswordRecovery({ email });

      // Assert - Should not reveal if email exists or not
      expect(result).toEqual({
        message: 'Password recovery email sent',
      });

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordRecoveryEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should successfully reset password with valid recovery code', async () => {
      // Arrange
      const resetDto = {
        recoveryCode: 'valid_recovery_code',
        newPassword: 'NewPassword123!',
      };

      const mockUser = MockFactory.createMockUser({
        passwordRecoveryCode: resetDto.recoveryCode,
        passwordRecoveryExpiry: new Date(Date.now() + 3600000), // 1 hour from now
      });

      const newHashedPassword = 'new_hashed_password';

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue(newHashedPassword as never);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      // Act
      const result = await service.resetPassword(resetDto);

      // Assert
      expect(result).toEqual({
        message: 'Password reset successful',
      });

      expect(mockBcrypt.hash).toHaveBeenCalledWith(resetDto.newPassword, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          hashedPassword: newHashedPassword,
          passwordRecoveryCode: null,
          passwordRecoveryExpiry: null,
        },
      });
    });

    it('should throw UnauthorizedException for invalid recovery code', async () => {
      // Arrange
      const resetDto = {
        recoveryCode: 'invalid_code',
        newPassword: 'NewPassword123!',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for expired recovery code', async () => {
      // Arrange
      const resetDto = {
        recoveryCode: 'expired_code',
        newPassword: 'NewPassword123!',
      };

      const mockUser = MockFactory.createMockUser({
        passwordRecoveryCode: resetDto.recoveryCode,
        passwordRecoveryExpiry: new Date(Date.now() - 3600000), // 1 hour ago
      });

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.resetPassword(resetDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('validateUser', () => {
    it('should return user data for valid JWT payload', async () => {
      // Arrange
      const jwtPayload = MockFactory.createMockJwtPayload();
      const mockUser = MockFactory.createMockUser({
        id: jwtPayload.sub,
        email: jwtPayload.email,
      });

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser(jwtPayload);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        userName: mockUser.userName,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        avatarPath: mockUser.avatarPath,
      });
    });

    it('should return null for non-existent user', async () => {
      // Arrange
      const jwtPayload = MockFactory.createMockJwtPayload();
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(jwtPayload);

      // Assert
      expect(result).toBeNull();
    });
  });
});