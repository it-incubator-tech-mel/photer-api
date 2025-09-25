/**
 * Mock Factory Utilities
 * Provides factory functions for creating test data and mocks
 */

import { User, Post, Comment } from '@prisma/client';

export class MockFactory {
  /**
   * Create a mock user for testing
   */
  static createMockUser(overrides: Partial<User> = {}): User {
    return {
      id: MockFactory.generateId(),
      email: `test-${Date.now()}@example.com`,
      userName: `testuser_${Date.now()}`,
      hashedPassword: '$2b$10$mockHashedPassword',
      firstName: 'Test',
      lastName: 'User',
      birthDate: new Date('1990-01-01'),
      city: 'Test City',
      country: 'Test Country',
      aboutMe: 'Test about me',
      avatarPath: null,
      isEmailConfirmed: true,
      emailConfirmationCode: null,
      emailConfirmationExpiry: null,
      passwordRecoveryCode: null,
      passwordRecoveryExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Create a mock post for testing
   */
  static createMockPost(overrides: Partial<Post> = {}): Post {
    return {
      id: MockFactory.generateId(),
      description: 'Test post description',
      photos: ['test-photo-1.jpg', 'test-photo-2.jpg'],
      userId: MockFactory.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Create a mock comment for testing
   */
  static createMockComment(overrides: Partial<Comment> = {}): Comment {
    return {
      id: MockFactory.generateId(),
      content: 'Test comment content',
      userId: MockFactory.generateId(),
      postId: MockFactory.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Create mock JWT payload
   */
  static createMockJwtPayload(overrides: any = {}) {
    return {
      sub: MockFactory.generateId(),
      email: `test-${Date.now()}@example.com`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      ...overrides,
    };
  }

  /**
   * Create mock request object for testing controllers
   */
  static createMockRequest(overrides: any = {}) {
    return {
      user: MockFactory.createMockJwtPayload(),
      body: {},
      params: {},
      query: {},
      headers: {},
      ...overrides,
    };
  }

  /**
   * Create mock response object for testing controllers
   */
  static createMockResponse() {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  }

  /**
   * Create mock Prisma client for testing
   */
  static createMockPrismaClient() {
    return {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      post: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      comment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
      $connect: jest.fn(),
      $disconnect: jest.fn(),
    };
  }

  /**
   * Create mock AWS S3 client for testing
   */
  static createMockS3Client() {
    return {
      upload: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Location: 'https://mock-s3-url.com/mock-file.jpg',
          Key: 'mock-key',
          Bucket: 'mock-bucket',
        }),
      }),
      deleteObject: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      }),
      getSignedUrl: jest.fn().mockReturnValue('https://mock-signed-url.com'),
    };
  }

  /**
   * Create mock email service for testing
   */
  static createMockEmailService() {
    return {
      sendEmail: jest.fn().mockResolvedValue(true),
      sendConfirmationEmail: jest.fn().mockResolvedValue(true),
      sendPasswordRecoveryEmail: jest.fn().mockResolvedValue(true),
    };
  }

  /**
   * Generate a random ID for testing
   */
  private static generateId(): string {
    return `mock_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }

  /**
   * Create multiple mock items using a factory function
   */
  static createMultiple<T>(
    factory: (index: number) => T,
    count: number = 3
  ): T[] {
    return Array.from({ length: count }, (_, index) => factory(index));
  }

  /**
   * Create mock pagination result
   */
  static createMockPaginationResult<T>(
    items: T[],
    page: number = 1,
    limit: number = 10,
    total: number = items.length
  ) {
    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    };
  }
}

/**
 * Test Data Constants
 */
export const TEST_DATA = {
  VALID_EMAIL: 'test@example.com',
  VALID_PASSWORD: 'Password123!',
  INVALID_EMAIL: 'invalid-email',
  INVALID_PASSWORD: '123',

  // Test JWT tokens (mock)
  VALID_JWT_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWlkIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTg4MDB9.mock',
  EXPIRED_JWT_TOKEN: 'expired.jwt.token',
  INVALID_JWT_TOKEN: 'invalid.jwt.token',

  // Common test strings
  LONG_STRING: 'x'.repeat(1000),
  SQL_INJECTION_ATTEMPT: "'; DROP TABLE users; --",
  XSS_ATTEMPT: '<script>alert("xss")</script>',

  // File upload test data
  MOCK_IMAGE_BUFFER: Buffer.from('mock image data'),
  VALID_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  INVALID_FILE_TYPES: ['text/plain', 'application/pdf'],
} as const;