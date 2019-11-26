module.exports = {
  plugins: [
    require('stylelint')(),
    require('postcss-import')(),
    require('postcss-preset-env')({
      stage: 4,
      features: {
        'custom-properties': true
      }
    }),
    require('postcss-flexbugs-fixes'),
    require('postcss-reporter')({ clearAllMessages: true })
  ]
}
