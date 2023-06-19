module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/test/**/*.(ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
