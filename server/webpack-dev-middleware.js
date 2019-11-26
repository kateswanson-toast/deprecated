const fs = require('fs')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CreateFileWebpack = require('create-file-webpack')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const noopWebpackPlugin = require('noop-webpack-plugin')
const rimraf = require('rimraf')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

const { name: projectName } = require('../package.json')
const { ruleAdjuster, ensureRegex } = require('../webpack/utils/rules')

// In local dev mode, generate scripts inside toastweb/public/temp/this_project_name/
// or into BUILD_ROOT, if specified. (Generated scripts should be gitignored)
const BUILD_ROOT = process.env.BUILD_ROOT || path.resolve(process.env.TOAST_GIT, 'toastweb/public/temp')

let createDevFile, cleanDevFiles
// Ensure BUILD_ROOT is a directory before trying to create stuff inside it
if (fs.existsSync(BUILD_ROOT) && fs.lstatSync(BUILD_ROOT).isDirectory()) {
  const localDevPath = path.resolve(BUILD_ROOT, projectName)
  // Generate files inside toastweb for local dev
  createDevFile = (fileName, getContent = () => '') => {
    console.log(`generating: ${localDevPath}/${fileName}`)
    return new CreateFileWebpack({
      path: localDevPath,
      fileName,
      content: getContent({ localDevPath })
    })
  }
  // Clean generated files before building
  cleanDevFiles = () => new CleanWebpackPlugin(['*'], { root: localDevPath })
  // Delete generated files when quitting (with Ctrl-C)
  process.on('SIGINT', () => {
    rimraf.sync(localDevPath)
    process.exit()
  })
} else {
  console.log(`BUILD_ROOT ${BUILD_ROOT} doesn't exist, skipping`)
  createDevFile = noopWebpackPlugin
  cleanDevFiles = noopWebpackPlugin
}

module.exports = ({ app, serverUrl: publicPath }) => {
  const config = require('../webpack/dev.config')
  const adjustRule = ruleAdjuster(config.module.rules)

  // Prepend style-loader to CSS rule
  adjustRule(
    r => ensureRegex(r.test, 'file.css'),
    r => { r.use.unshift('style-loader') }
  )

  // Update CSS file loader so that assets are always loaded from the webpack
  // dev server (instead of toastweb)
  adjustRule(
    r => r.loader === 'file-loader' && ensureRegex(r.issuer, 'file.css'),
    r => { r.options.publicPath = publicPath }
  )

  // Eslint should emit warnings, not errors
  adjustRule(
    r => r.loader === 'eslint-loader',
    r => { r.options.emitWarning = true }
  )

  // Adjust entry point to allow HMR
  config.entry = [
    `webpack-hot-middleware/client?path=${publicPath}__webpack_hmr`,
    // Add react-axe for dev mode
    path.resolve(__dirname, '../webpack/utils/axe'),
    config.entry
  ]

  // Choosing eval-source-map since it gives us access to inline breakpoints:
  // https://webpack.js.org/configuration/devtool/#devtool
  config.devtool = 'eval-source-map'

  // Adjust public path
  const { output } = config
  output.publicPath = publicPath

  // Configure plugins
  config.plugins = [
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {
        map: { inline: true }
      }
    }),
    // Clean local dev directory first
    cleanDevFiles(),
    // Existing plugins
    ...config.plugins,
    // Enable HMR
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    // Generate a script that will allow an external local dev server to
    // access the local server's webpack build
    createDevFile(output.filename, ({ localDevPath }) => {
      const src = `${publicPath}${output.filename}`
      const template = fs.readFileSync('./server/dev/loader.js.tmpl', 'utf8')
      const templateData = { src, projectName, localDevPath }
      return template.replace(/\$\{(\w+)\}/g, (_, k) => templateData[k])
    }),
    // And a dummy CSS file to prevent a 404 error
    createDevFile('main.css')
  ]

  const webpackCompiler = webpack(config)
  const wdm = webpackDevMiddleware(webpackCompiler, {
    // Allow the dev router to respond to "/" route
    index: false,
    // Allow an external local dev server to access webpack-dev-server's HMR content
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    // Configure logging to be substantially less verbose
    stats: {
      assets: false,
      children: false,
      chunks: false,
      colors: true,
      entrypoints: false,
      hash: false,
      modules: false,
      version: false
    }
  })
  app.use(wdm)
  app.use(webpackHotMiddleware(webpackCompiler))

  // Add dev-specific routes
  app.use((req, res, next) => {
    require('./routes/dev.js')({ wdm, config })(req, res, next)
  })
}
