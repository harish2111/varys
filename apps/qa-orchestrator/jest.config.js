/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testTimeout: 60000,
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { experimentalDecorators: true, emitDecoratorMetadata: true, types: ['node', 'jest'] } },
    ],
  },
};
