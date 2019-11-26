const fs = require('fs')
const http = require('http')
const https = require('https')
const express = require('express')
const dotenv = require('dotenv')
const onKey = require('@derhuerst/cli-on-key')
const open = require('opn')
const chalk = require('chalk')

// Read env vars from .env file, if it exists.
dotenv.config()

// Get values from the environment.
const env = process.env.NODE_ENV || 'development'
const isDev = env === 'development'
const defaultHost = isDev ? 'dev.eng.toastteam.com' : 'localhost'
const host = process.env.SERVER_HOST || defaultHost
const port = process.env.SERVER_PORT || 3000
const ssl = 'SERVER_SSL' in process.env ? process.env.SERVER_SSL : isDev

// Initialize app.
const app = express()

// Configure app.
app.use((req, res, next) => {
  require('./routes')(req, res, next)
})

// Get HTTP or HTTPS server
let server, protocol
if (ssl) {
  // Load an SSL cert from the local filesystem
  const getCert = certpath => {
    if (!fs.existsSync(certpath)) {
      console.error(`ERROR: ${certpath} not found. Did you run the "yarn fetch-certs" command?`)
      process.exit(1)
    }
    return fs.readFileSync(certpath)
  }
  // Specify SSL certs for the HTTPS server
  const serverOptions = {
    key: getCert('./.build/ssl-certs/cert.key'),
    cert: getCert('./.build/ssl-certs/cert.pem')
  }
  server = https.createServer(serverOptions, app)
  protocol = 'https'
} else {
  server = http.createServer({}, app)
  protocol = 'http'
}

const getServerUrl = port => `${protocol}://${host}:${port}/`

const listen = (server, port) => {
  server.listen(port, host, () => {
    const serverUrl = getServerUrl(port)
    console.log(`Server listening on ${serverUrl}`)
  })
}

if (isDev) {
  const getPort = require('get-port')
  const updateDotenv = require('update-dotenv')
  const chokidar = require('chokidar')

  // Allow auto-reloading of any changed files in routes subdir
  chokidar.watch('routes', { cwd: __dirname }).on('all', (event, filepath) => {
    console.log(`Clearing server routes module cache (${event}: ${filepath})`)
    const basePath = `${__dirname}/routes/`
    Object.keys(require.cache).forEach(id => {
      if (id.indexOf(basePath) === 0) {
        delete require.cache[id]
      }
    })
  })

  // Minor nits. See:
  // https://github.com/bkeepers/update-dotenv/issues/1
  // https://github.com/bkeepers/update-dotenv/issues/2
  const updateDotenvFixed = env => {
    if (!fs.existsSync('.env')) {
      fs.writeFileSync('.env', '')
    }
    const normalizedEnv = Object.keys(env).reduce((acc, key) => {
      acc[key] = String(env[key])
      return acc
    }, {})
    return updateDotenv(normalizedEnv)
  }

  // Attempt to use previous server port. If that fails, an unused port is used.
  getPort({ host, port }).then(actualPort => {
    // Store actual port in .env file for next run. So convenient!
    updateDotenvFixed({ SERVER_PORT: actualPort })

    // Start webpack dev middleware
    const serverUrl = getServerUrl(actualPort)
    require('./webpack-dev-middleware')({ app, serverUrl })

    // Convenient hotkey commands
    const logText = s => console.log(chalk.green(`› ${s}`))
    const logKey = (k, s) => logText(`Press ${chalk.white.bold(k)} to ${s}`)
    logKey('q', 'quit the dev server process')
    logKey('o', 'open the dev server in your browser')
    const stopListening = onKey(process.stdin, key => {
      if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
        logText('Quitting server process')
        stopListening()
        process.exit()
      } else if (key.name === 'o') {
        logText(`Opening ${serverUrl}`)
        open(serverUrl)
      }
    })

    listen(server, actualPort)
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
} else {
  listen(server, port)
}
