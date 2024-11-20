/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  verbose: true,
  collectCoverage: true,
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.ts", "!tests/**", "!**/node_modules/**"],
};
