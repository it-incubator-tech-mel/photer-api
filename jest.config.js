module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'apps/**/*.(t|j)s',
    '!apps/**/*.spec.ts',
    '!apps/**/*.e2e-spec.ts',
    '!apps/**/*.d.ts',
    '!apps/**/main.ts',
    '!apps/**/prisma/**',
  ],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/'],

  // НОВЫЕ ВЫСОКИЕ СТАНДАРТЫ ПОКРЫТИЯ
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Дополнительные настройки
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/apps/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  testTimeout: 30000,

  // Игнорируем тесты node_modules
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],

  // Расширенная отчетность (требует дополнительных пакетов)
  reporters: [
    'default',
    // Uncomment after installing jest-junit and jest-html-reporter
    // ['jest-junit', {
    //   outputDirectory: './test-results/',
    //   outputName: 'junit.xml',
    // }],
    // ['jest-html-reporter', {
    //   pageTitle: 'Photer API Test Report',
    //   outputPath: './test-results/report.html',
    // }],
  ],
};