import React, { StrictMode } from 'react'
import { hot } from 'react-hot-loader'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import * as sentry from '../../utils/sentry'

import styles from './App.css'

sentry.init({ publicKey: 'yourPublicKey', projectId: 'yourProjectId' })

const App = () => (
  <StrictMode>
    <ErrorBoundary>
      <h1 className={styles.header}>Hello Outpost Config Tool!</h1>
    </ErrorBoundary>
  </StrictMode>
)

export default hot(module)(App)
