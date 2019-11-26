const ignorePatterns = ['<rootDir>/.build/', '<rootDir>/node_modules/']

module.exports = {
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    // resolving static assets to a mock file
    // https://jestjs.io/docs/en/webpack#handling-static-assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/client/__mocks__/fileMock.js',
    '\\.css$': 'identity-obj-proxy'
  },
  snapshotSerializers: ['enzyme-to-json/serializer'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '.build/test-results',
      ancestorSeparator: ' › ',
      classNameTemplate: '{classname}',
      suiteNameTemplate: '{filepath}',
      titleTemplate: '{title}'
    }]
  ],
  coverageDirectory: '.build/coverage-results',
  coverageReporters: [
    'cobertura',
    'text-summary'
  ],
  testPathIgnorePatterns: ignorePatterns,
  modulePathIgnorePatterns: ignorePatterns,
  testURL: 'http://localhost/'
}
