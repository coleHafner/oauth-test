module.exports = {
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'json'
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: '\\.(test|spec)\\.(ts|tsx|js)$',
  coverageReporters: [
    'html',
    'lcov'
  ],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true
      }
    }
  },
  testURL: 'http://localhost'
}