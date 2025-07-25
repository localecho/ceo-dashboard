module.exports = {
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'mockups/**/*.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'CEO Dashboard Test Report',
      outputPath: 'test-reports/test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ]
};