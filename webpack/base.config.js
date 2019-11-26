const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const hash = require('string-hash')

const pkg = require('../package.json')

console.log('npm_config_user_agent', process.env.npm_config_user_agent)
const ASSET_PATH = '/' // TODO: make this an environment variable?

module.exports = {
  entry: './client/index.jsx',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: ASSET_PATH
  },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    },
    // Allow js and jsx files to be resolved without an extension
    extensions: ['.js', '.jsx']
  },
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [
              'babel-loader',
              {
                loader: 'eslint-loader',
                options: {
                  emitWarning: false
                }
              }
            ]
          },
          {
            test: /\.css$/,
            use: [
              {
                loader: 'css-loader',
                options: {
                  url: true,
                  modules: true,
                  importLoaders: 1,
                  sourceMap: true,
                  localIdentName: '[name]__[local]___[hash:base64:5]'
                }
              },
              {
                loader: 'postcss-loader',
                options: {
                  ident: 'postcss',
                  sourceMap: 'true'
                }
              }
            ]
          },
          {
            test: /\.svg$/i,
            issuer: { test: /\.jsx?$/ },
            use: ({resource}) => ({
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [{
                    'cleanupIDs': {
                      prefix: `svg-${hash(path.relative(__dirname, resource))}-`
                    }
                  }]
                }
              }
            })
          },
          {
            test: /\.(png|jpg|gif)$/i,
            use: ['url-loader']
          },
          ...[{
            issuer: /\.css$/,
            publicPath: './'
          }, {
            issuer: undefined,
            publicPath: ASSET_PATH
          }].map(({ issuer, publicPath }) => ({
            exclude: [/\.(ejs|js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: 'file-loader',
            issuer,
            options: {
              emitFile: true,
              name: 'static/[name].[hash:8].[ext]',
              publicPath
            }
          }))
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      PKG_VERSION: pkg.version,
      PKG_NAME: pkg.name
    }),
    // Generate HTML file to allow local preview
    new HtmlWebPackPlugin({
      inject: false,
      template: require('html-webpack-template'),
      headHtmlSnippet: '<!-- HEAD_INJECT -->',
      appMountId: 'root',
      mobile: true,
      title: pkg.name
    })
  ]
}
