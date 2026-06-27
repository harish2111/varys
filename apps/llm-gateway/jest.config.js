/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { experimentalDecorators: true, emitDecoratorMetadata: true, types: ['node', 'jest'] } },
    ],
  },
};
