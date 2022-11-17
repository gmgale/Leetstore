/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  // preset: "@shelf/jest-mongodb",
  verbose: true,
  testEnvironment: "node",
  globalTeardown: "<rootDir>/test-teardown-globals.js",
};
