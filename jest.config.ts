/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

// jest.config.ts
import type { JestConfigWithTsJest } from 'ts-jest'

const jestConfig: JestConfigWithTsJest = {
  // [...]

  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // index.ts pulls in lighthouse + other ESM-only packages; stub it to keep tests fast
    '^[.][./]*index\\.js$': '<rootDir>/__mocks__/index-stub.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // matcher and its dep escape-string-regexp are ESM-only; transform them to CJS
  transformIgnorePatterns: ['node_modules/(?!(matcher|escape-string-regexp)/)'],
  transform: {
    // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/test/",
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

}

export default jestConfig