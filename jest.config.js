'use strict'

module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false,
  collectCoverageFrom: [
    // TODO: expand to other files
    './src/domain/*.ts'
  ],
  coverageReporters: ['json', 'lcov', 'text'],
  clearMocks: true,
  coverageThreshold: {
    global: {
      // TODO: improve upon this!
      statements: 40,
      functions: 40,
      branches: 40,
      lines: 40,
      // statements: 90,
      // functions: 90,
      // branches: 90,
      // lines: 90
    }
  }
}
