module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
    '!src/cli.ts',
    '!src/index.ts',
    '!src/commands/**',
  ],
  coverageThreshold: {
    global: {
      branches: 38,
      functions: 70,
      lines: 64,
      statements: 64,
    },
  },
};
