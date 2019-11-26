const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const { ruleAdjuster, ensureRegex } = require('./utils/rules')
const config = require('./base.config')

config.mode = 'production'
config.devtool = 'source-map'

const adjustRule = ruleAdjuster(config.module.rules)

// Prepend MiniCssExtractPlugin to CSS rule
adjustRule(
  r => ensureRegex(r.test, 'file.css'),
  r => { r.use.unshift(MiniCssExtractPlugin.loader) }
)

// Clean dist directory first
const { plugins } = config
plugins.unshift(
  new CleanWebpackPlugin(['dist'], {
    root: path.resolve(__dirname, '..')
  }),
  new OptimizeCssAssetsPlugin({})
)

// Tweak build output
config.stats = {
  colors: false,
  children: false,
  modulesSort: '!size',
  assets: false
}

module.exports = config
