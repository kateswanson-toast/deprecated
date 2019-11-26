const express = require('express')
const router = express.Router()

const indexHtmlHelpers = require('../dev/index-html-helpers')

module.exports = ({ wdm, config }) => {
  const { getIndex } = indexHtmlHelpers({ wdm, config })

  // This is just an example
  const sampleFavicon = '<link rel="shortcut icon" type="image/x-icon" href="https://d2w1ef2ao9g8r9.cloudfront.net/images/icons/favicon.ico">'

  // Render globals/styles/etc into the HEAD to reduce reliance on an initial
  // Ajax request (this should mirror equivalent code in the production server)
  const testRouteHandler = async (req, res) => {
    const { myParam } = req.params
    const MY_GLOBALS = {}
    // Normally, MY_GLOBALS properties will come from the environment or an API.
    // Rename MY_GLOBALS to something more specific to your app, and add your
    // code here
    MY_GLOBALS.myParam = `this could contain data from an api response using ${myParam}`
    const sampleCss = '<style>body{background:#faa}</style>'
    res.end(getIndex(sampleFavicon, { MY_GLOBALS }, sampleCss))
  }
  router.get('/dev-server-test-route/:myParam', testRouteHandler)

  // Pushstate fallback. Note: this needs to be defined after all other routes!
  // https://gist.github.com/frederickfogerty/df921f21a83b479b2056
  router.get('*', (req, res) => {
    res.end(getIndex(sampleFavicon))
  })

  return router
}
