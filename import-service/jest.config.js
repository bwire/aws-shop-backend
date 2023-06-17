const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/test/**/*.(ts|tsx)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: pathsToModuleNameMapper({
    '~*': ['<rootDir>/../lib/*'],
  }),
};
