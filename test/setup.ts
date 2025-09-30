/**
 * Global Test Setup for Photer Backend
 * Provides utilities, mocks, and configuration for all test types
 */

import '@types/jest';

// Global test environment setup
export const setupTestEnvironment = () => {
  // Mock console methods to reduce noise in tests (optional)
  if (process.env.NODE_ENV === 'test' && !process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    // Keep console.error for debugging
  }

  // Set test timeouts
  jest.setTimeout(30000);

  // Mock Date for consistent testing (uncomment if needed)
  // const mockDate = new Date('2023-01-01T00:00:00.000Z');
  // jest.useFakeTimers().setSystemTime(mockDate);
};

// Quality gates for tests
export const QUALITY_GATES = {
  COVERAGE: {
    STATEMENTS: 90,
    BRANCHES: 85,
    FUNCTIONS: 90,
    LINES: 90,
  },
  PERFORMANCE: {
    MAX_API_RESPONSE_TIME: 500, // ms
    MAX_DATABASE_QUERY_TIME: 100, // ms
  },
  LOAD: {
    MIN_RPS: 1000, // requests per second
    MAX_ERROR_RATE: 0.1, // 0.1%
  },
} as const;

// Test categories
export const TEST_CATEGORIES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  SECURITY: 'security',
  LOAD: 'load',
  CONTRACTS: 'contracts',
} as const;

// Common test utilities
export const TestUtils = {
  generateMockId: () => Math.random().toString(36).substr(2, 9),

  generateMockEmail: () => `test-${Date.now()}@example.com`,

  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  expectToThrow: async (fn: () => Promise<any>, expectedError?: any) => {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError) {
        expect(error).toBeInstanceOf(expectedError);
      }
      return error;
    }
  },
};

// Setup function to run before all tests
setupTestEnvironment();