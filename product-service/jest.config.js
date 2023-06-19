module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/test/*.test.(ts|tsx)'],
  roots: ['<rootDir>'],
};
