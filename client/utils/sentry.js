import * as Sentry from '@sentry/browser'
import envFromHostname from '@toasttab/env-from-hostname'

export const init = ({ publicKey, projectId }) => {
  if (!publicKey || !projectId) {
    throw new Error('Missing Sentry Configuration')
  }
  const dsn = `https://${publicKey}@sentry.io/${projectId}`
  const release = process.env.PKG_VERSION

  const environment = envFromHostname(window.location.hostname)

  // Skip Sentry initialization if we're doing local development
  if (environment !== 'dev') {
    Sentry.init({ dsn, release, environment })
    Sentry.configureScope(scope => { scope.setTag('package_name', process.env.PKG_NAME) })
    Sentry.captureMessage('JavaScript Loaded')
  }
}
